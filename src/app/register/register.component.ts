import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegisterService } from '../services/register.service';
import { PacienteRequest, PacienteResponse } from '../models/paciente';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class Register {
  private registerService = inject(RegisterService);

  dni = '';
  nombre = '';
  apellido1 = '';
  apellido2 = '';
  correo = '';
  telefono = '';
  usuario = '';
  contrasena = '';
  confirmarContrasena = '';
  acceptTerms = false;

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);

  get passwordMismatch(): boolean {
    return this.contrasena !== '' &&
      this.confirmarContrasena !== '' &&
      this.contrasena !== this.confirmarContrasena;
  }

  get passwordMatch(): boolean {
    return this.contrasena !== '' &&
      this.confirmarContrasena !== '' &&
      this.contrasena === this.confirmarContrasena;
  }

  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.key;
    // Allow only numbers 0-9
    if (!/^[0-9]$/.test(charCode)) {
      event.preventDefault();
    }
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  onSubmit() {
    if (this.passwordMismatch || !this.acceptTerms) return;
    this.isLoading.set(true);

    const registroData: PacienteRequest = {
      dni: this.dni,
      nombres: `${this.nombre} ${this.apellido1} ${this.apellido2}`.trim(),
      apellidos: `${this.apellido1} ${this.apellido2}`.trim(),
      correo: this.correo,
      telefono: this.telefono,
      password: this.contrasena
    };

    this.registerService.registrarPaciente(registroData).subscribe({
      next: (response: PacienteResponse) => {
        this.isLoading.set(false);
        alert('Registro completado con éxito. Ahora puedes iniciar sesión.');
      },
      error: (err: any) => {
        this.isLoading.set(false);
        alert('Ocurrió un error al registrar al paciente. Por favor, intente nuevamente.');
        console.error(err);
      }
    });
  }
}
