import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../services/paciente.service';
import { PacienteRequest, PacienteResponse } from '../../models/paciente';

@Component({
  selector: 'app-crud-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-pacientes.component.html',
})
export class CrudPacientesComponent implements OnInit {
  private service = inject(PacienteService);

  pacientes = signal<PacienteResponse[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isDrawerOpen = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  editingItem = signal<PacienteResponse | null>(null);
  formNombres = signal<string>('');
  formApellidos = signal<string>('');
  formDni = signal<string>('');
  formTelefono = signal<string>('');
  formCorreo = signal<string>('');
  formPassword = signal<string>('');
  formFechaNacimiento = signal<string>('');
  showPass = signal<boolean>(false);

  // Confirm modal
  confirmOpen = signal<boolean>(false);
  confirmTitle = signal<string>('');
  confirmMessage = signal<string>('');
  confirmAction = signal<(() => void) | null>(null);
  confirmDanger = signal<boolean>(false);

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  filteredPacientes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.pacientes().filter(p =>
          p.nombres.toLowerCase().includes(q) ||
          p.apellidos.toLowerCase().includes(q) ||
          p.dni.toLowerCase().includes(q) ||
          p.correo.toLowerCase().includes(q))
      : this.pacientes();
  });

  totalPacientes = computed(() => this.pacientes().length);
  totalActivos = computed(() => this.pacientes().filter(p => p.activo).length);

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: d => { this.pacientes.set(d || []); this.isLoading.set(false); },
      error: () => { this.showToast('Error al cargar pacientes', 'error'); this.isLoading.set(false); }
    });
  }

  openNew() {
    this.editingItem.set(null);
    this.formNombres.set(''); this.formApellidos.set(''); this.formDni.set('');
    this.formTelefono.set(''); this.formCorreo.set(''); this.formPassword.set('');
    this.formFechaNacimiento.set(''); this.showPass.set(false);
    this.isDrawerOpen.set(true);
  }

  openEdit(item: PacienteResponse) {
    this.editingItem.set(item);
    this.formNombres.set(item.nombres); this.formApellidos.set(item.apellidos);
    this.formDni.set(item.dni); this.formTelefono.set(item.telefono || '');
    this.formCorreo.set(item.correo); this.formPassword.set('');
    this.formFechaNacimiento.set(''); this.showPass.set(false);
    this.isDrawerOpen.set(true);
  }

  closeDrawer() { this.isDrawerOpen.set(false); }

  onSubmit() {
    const editing = this.editingItem();
    if (!this.formNombres().trim() || !this.formApellidos().trim() || !this.formDni().trim() || !this.formCorreo().trim()) {
      this.showToast('Complete todos los campos obligatorios.', 'error');
      return;
    }
    if (!editing && !this.formPassword().trim()) {
      this.showToast('La contraseña es obligatoria para nuevos pacientes.', 'error');
      return;
    }

    const payload: PacienteRequest = {
      nombres: this.formNombres().trim(),
      apellidos: this.formApellidos().trim(),
      dni: this.formDni().trim(),
      telefono: this.formTelefono().trim() || undefined,
      correo: this.formCorreo().trim(),
      password: this.formPassword().trim() || 'Temp1234!',
      fechaNacimiento: this.formFechaNacimiento() || null
    };

    const doSave = () => {
      this.isSaving.set(true);
      const obs = editing
        ? this.service.actualizar(editing.idPaciente, payload)
        : this.service.crear(payload);
      obs.subscribe({
        next: () => { this.showToast(editing ? 'Paciente actualizado.' : 'Paciente registrado exitosamente.'); this.load(); this.closeDrawer(); this.isSaving.set(false); },
        error: (e) => { this.showToast(e?.error?.message || 'Error al guardar.', 'error'); this.isSaving.set(false); }
      });
    };

    this.openConfirm(
      editing ? 'Confirmar edición' : 'Confirmar registro',
      editing
        ? `¿Deseas guardar los cambios del paciente ${payload.nombres} ${payload.apellidos}?`
        : `¿Deseas registrar al paciente ${payload.nombres} ${payload.apellidos}?`,
      doSave, false
    );
  }

  askDelete(item: PacienteResponse) {
    this.openConfirm('Eliminar paciente',
      `¿Seguro que deseas eliminar al paciente ${item.nombres} ${item.apellidos}? Esta acción no se puede deshacer.`,
      () => {
        this.service.eliminar(item.idPaciente).subscribe({
          next: () => { this.showToast('Paciente eliminado.'); this.load(); },
          error: () => this.showToast('Error al eliminar.', 'error')
        });
      }, true);
  }

  askToggle(item: PacienteResponse) {
    const action = item.activo ? 'desactivar' : 'activar';
    this.openConfirm(`${action.charAt(0).toUpperCase() + action.slice(1)} paciente`,
      `¿Deseas ${action} al paciente ${item.nombres} ${item.apellidos}?`,
      () => {
        this.service.toggleActivo(item.idPaciente).subscribe({
          next: () => { this.showToast(`Paciente ${action}do correctamente.`); this.load(); },
          error: () => this.showToast('Error al cambiar estado.', 'error')
        });
      }, false);
  }

  openConfirm(title: string, message: string, action: () => void, danger = false) {
    this.confirmTitle.set(title); this.confirmMessage.set(message);
    this.confirmAction.set(action); this.confirmDanger.set(danger);
    this.confirmOpen.set(true);
  }

  doConfirm() { this.confirmOpen.set(false); const fn = this.confirmAction(); if (fn) fn(); }
  cancelConfirm() { this.confirmOpen.set(false); }

  onlyNumbers(event: KeyboardEvent) {
    if (!/^[0-9]$/.test(event.key)) event.preventDefault();
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg); this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
