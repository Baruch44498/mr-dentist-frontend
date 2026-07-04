import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { PacienteService } from '../services/paciente.service';
import { MedicoService } from '../services/medico.service';
import { PacienteRequest, PacienteResponse } from '../models/paciente';
import { MedicoRequest, MedicoResponse } from '../models/medico';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit {
  private loginService = inject(LoginService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private router = inject(Router);

  role = signal<string>('');
  userId = signal<number | null>(null);
  profileData = signal<any>(null);

  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Form Fields
  formNombres = signal<string>('');
  formApellidos = signal<string>('');
  formDni = signal<string>('');
  formTelefono = signal<string>('');
  formCorreo = signal<string>('');
  
  // Security Form Fields
  formPassword = signal<string>('');
  formConfirmPassword = signal<string>('');

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.role.set(this.loginService.getRole() || 'PACIENTE');
    this.cargarPerfil();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  cargarPerfil() {
    this.isLoading.set(true);
    const email = this.loginService.getUserEmail();
    const payload = this.loginService.getDecodedToken();
    const userRole = this.role().toUpperCase();

    // Intentamos extraer ID del payload
    const tokenUserId = payload?.idPaciente || payload?.idMedico || payload?.id || payload?.userId || payload?.id_usuario;

    if (userRole === 'ADMIN') {
      this.profileData.set({ role: 'ADMIN' });
      this.formNombres.set(this.loginService.getUserName()?.split(' ')[0] || 'Admin');
      this.formApellidos.set(this.loginService.getUserName()?.split(' ').slice(1).join(' ') || 'Sistema');
      this.formDni.set('—');
      this.formTelefono.set('—');
      this.formCorreo.set(email || 'admin@mrdentist.com');
      this.isLoading.set(false);
      return;
    }

    if (userRole === 'MEDICO') {
      if (tokenUserId) {
        this.userId.set(Number(tokenUserId));
        this.medicoService.getById(Number(tokenUserId)).subscribe({
          next: (res: MedicoResponse) => this.inicializarFormMedico(res),
          error: () => this.cargarMedicoPorCorreoFallback(email)
        });
      } else {
        this.cargarMedicoPorCorreoFallback(email);
      }
    } else {
      // PACIENTE
      if (tokenUserId) {
        this.userId.set(Number(tokenUserId));
        this.pacienteService.getById(Number(tokenUserId)).subscribe({
          next: (res: PacienteResponse) => this.inicializarFormPaciente(res),
          error: () => this.cargarPacientePorCorreoFallback(email)
        });
      } else {
        this.cargarPacientePorCorreoFallback(email);
      }
    }
  }

  cargarPacientePorCorreoFallback(email: string | null) {
    if (!email) {
      this.showToast('No se pudo encontrar tu correo de sesión.', 'error');
      this.isLoading.set(false);
      return;
    }

    this.pacienteService.getAll().subscribe({
      next: (pacientes: PacienteResponse[]) => {
        const found = pacientes.find(p => p.correo.toLowerCase() === email.toLowerCase());
        if (found) {
          this.userId.set(found.idPaciente);
          this.inicializarFormPaciente(found);
        } else {
          this.showToast('No se encontró información de tu perfil de paciente.', 'error');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.showToast('Error al conectar con la base de datos de pacientes.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  cargarMedicoPorCorreoFallback(email: string | null) {
    if (!email) {
      this.showToast('No se pudo encontrar tu correo de sesión.', 'error');
      this.isLoading.set(false);
      return;
    }

    this.medicoService.getAll().subscribe({
      next: (medicos: MedicoResponse[]) => {
        const found = medicos.find(m => m.correo.toLowerCase() === email.toLowerCase());
        if (found) {
          this.userId.set(found.idMedico);
          this.inicializarFormMedico(found);
        } else {
          this.showToast('No se encontró información de tu perfil de médico.', 'error');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.showToast('Error al conectar con la base de datos de médicos.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  inicializarFormPaciente(res: PacienteResponse) {
    this.profileData.set(res);
    this.formNombres.set(res.nombres);
    this.formApellidos.set(res.apellidos);
    this.formDni.set(res.dni);
    this.formTelefono.set(res.telefono || '');
    this.formCorreo.set(res.correo);
    this.isLoading.set(false);
  }

  inicializarFormMedico(res: MedicoResponse) {
    this.profileData.set(res);
    this.formNombres.set(res.nombres);
    this.formApellidos.set(res.apellidos);
    this.formDni.set(res.dni);
    this.formTelefono.set(res.telefono || '');
    this.formCorreo.set(res.correo);
    this.isLoading.set(false);
  }

  guardarCambios() {
    const userRole = this.role().toUpperCase();
    if (userRole === 'ADMIN') {
      this.showToast('La actualización de perfil no está habilitada para administradores.', 'error');
      return;
    }

    const id = this.userId();
    if (!id) {
      this.showToast('No se pudo identificar tu id de perfil para guardar.', 'error');
      return;
    }

    // Validaciones básicas
    if (!this.formNombres().trim() || !this.formApellidos().trim() || !this.formCorreo().trim()) {
      this.showToast('Por favor, completa los campos requeridos.', 'error');
      return;
    }

    // Validación de contraseña
    if (this.formPassword()) {
      if (this.formPassword() !== this.formConfirmPassword()) {
        this.showToast('Las contraseñas ingresadas no coinciden.', 'error');
        return;
      }
      if (this.formPassword().length < 6) {
        this.showToast('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
        return;
      }
    }

    this.isSaving.set(true);

    if (userRole === 'MEDICO') {
      const dto: MedicoRequest = {
        nombres: this.formNombres().trim(),
        apellidos: this.formApellidos().trim(),
        dni: this.formDni().trim(),
        telefono: this.formTelefono().trim() || undefined,
        correo: this.formCorreo().trim(),
        cop: this.profileData()?.cop || '',
        idEspecialidad: this.profileData()?.idEspecialidad || null,
        password: this.formPassword().trim() || undefined
      };

      this.medicoService.actualizar(id, dto).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.showToast('Perfil de médico actualizado con éxito.', 'success');
          this.profileData.set(res);
          this.formPassword.set('');
          this.formConfirmPassword.set('');
          if (typeof window !== 'undefined') {
            localStorage.setItem('userName', `${res.nombres} ${res.apellidos}`);
          }
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err?.error?.message || 'Error al guardar los cambios del médico.';
          this.showToast(msg, 'error');
        }
      });
    } else {
      // PACIENTE
      const dto: PacienteRequest = {
        nombres: this.formNombres().trim(),
        apellidos: this.formApellidos().trim(),
        dni: this.formDni().trim(),
        telefono: this.formTelefono().trim() || undefined,
        correo: this.formCorreo().trim(),
        password: this.formPassword().trim() || '',
        fechaNacimiento: this.profileData()?.fechaNacimiento || null
      };

      this.pacienteService.actualizar(id, dto).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.showToast('Perfil actualizado con éxito.', 'success');
          this.profileData.set(res);
          this.formPassword.set('');
          this.formConfirmPassword.set('');
          if (typeof window !== 'undefined') {
            localStorage.setItem('userName', `${res.nombres} ${res.apellidos}`);
          }
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err?.error?.message || 'Error al guardar los cambios del paciente.';
          this.showToast(msg, 'error');
        }
      });
    }
  }

  onlyNumbers(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
