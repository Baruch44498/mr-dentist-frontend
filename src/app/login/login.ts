import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login.service';
import { LoginRequest, LoginResponse } from '../models/login';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private loginService = inject(LoginService);
  private router = inject(Router);

  email = '';
  password = '';
  rememberMe = false;

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage.set('Por favor, completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials: LoginRequest = {
      username: this.email.trim(),
      password: this.password
    };

    this.loginService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading.set(false);
        const role = response.rol?.toUpperCase() || '';
        if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'MEDICO') {
          this.router.navigate(['/medico/dashboard']);
        } else if (role === 'PACIENTE') {
          this.router.navigate(['/paciente/dashboard']);
        } else {
          this.errorMessage.set('Rol de usuario no reconocido. Contacta al administrador.');
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const status = err?.status;
        if (status === 401 || status === 403) {
          this.errorMessage.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } else if (status === 0) {
          this.errorMessage.set('No se puede conectar con el servidor. Inténtalo más tarde.');
        } else {
          const msg = err?.error?.message || err?.error || 'Error al iniciar sesión. Inténtalo de nuevo.';
          this.errorMessage.set(typeof msg === 'string' ? msg : 'Error al iniciar sesión.');
        }
      }
    });
  }
}
