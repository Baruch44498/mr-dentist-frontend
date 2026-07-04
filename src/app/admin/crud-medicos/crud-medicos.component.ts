import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../services/medico.service';
import { EspecialidadService } from '../../services/especialidad.service';
import { MedicoRequest, MedicoResponse } from '../../models/medico';
import { EspecialidadResponse } from '../../models/especialidad';

@Component({
  selector: 'app-crud-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-medicos.component.html',
})
export class CrudMedicosComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private especialidadService = inject(EspecialidadService);

  medicos = signal<MedicoResponse[]>([]);
  especialidades = signal<EspecialidadResponse[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isDrawerOpen = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  editingItem = signal<MedicoResponse | null>(null);
  formNombres = signal<string>('');
  formApellidos = signal<string>('');
  formDni = signal<string>('');
  formTelefono = signal<string>('');
  formCorreo = signal<string>('');
  formCop = signal<string>('');
  formEspecialidadId = signal<number | null>(null);
  formPassword = signal<string>('');
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

  filteredMedicos = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.medicos().filter(m =>
          m.nombres.toLowerCase().includes(q) ||
          m.apellidos.toLowerCase().includes(q) ||
          m.dni.toLowerCase().includes(q) ||
          m.correo.toLowerCase().includes(q) ||
          (m.nombreEspecialidad || '').toLowerCase().includes(q))
      : this.medicos();
  });

  totalMedicos = computed(() => this.medicos().length);
  totalActivos = computed(() => this.medicos().filter(m => m.activo).length);

  ngOnInit() {
    this.loadMedicos();
    this.loadEspecialidades();
  }

  loadMedicos() {
    this.isLoading.set(true);
    this.medicoService.getAll().subscribe({
      next: d => { this.medicos.set(d || []); this.isLoading.set(false); },
      error: () => { this.showToast('Error al cargar médicos', 'error'); this.isLoading.set(false); }
    });
  }

  loadEspecialidades() {
    this.especialidadService.getAll().subscribe({
      next: d => this.especialidades.set((d || []).filter(e => e.activa)),
      error: () => {}
    });
  }

  openNew() {
    this.editingItem.set(null);
    this.formNombres.set(''); this.formApellidos.set(''); this.formDni.set('');
    this.formTelefono.set(''); this.formCorreo.set(''); this.formCop.set('');
    this.formEspecialidadId.set(null); this.formPassword.set(''); this.showPass.set(false);
    this.isDrawerOpen.set(true);
  }

  openEdit(item: MedicoResponse) {
    this.editingItem.set(item);
    this.formNombres.set(item.nombres); this.formApellidos.set(item.apellidos);
    this.formDni.set(item.dni); this.formTelefono.set(item.telefono || '');
    this.formCorreo.set(item.correo); this.formCop.set(item.cop);
    this.formEspecialidadId.set(item.idEspecialidad || null);
    this.formPassword.set(''); this.showPass.set(false);
    this.isDrawerOpen.set(true);
  }

  closeDrawer() { this.isDrawerOpen.set(false); }

  onSubmit() {
    if (!this.formNombres().trim() || !this.formApellidos().trim() || !this.formDni().trim()
      || !this.formCorreo().trim() || !this.formCop().trim()) {
      this.showToast('Complete todos los campos obligatorios.', 'error');
      return;
    }

    const editing = this.editingItem();
    if (!editing && !this.formPassword().trim()) {
      this.showToast('La contraseña es obligatoria para registrar un médico.', 'error');
      return;
    }

    const payload: MedicoRequest = {
      nombres: this.formNombres().trim(),
      apellidos: this.formApellidos().trim(),
      dni: this.formDni().trim(),
      telefono: this.formTelefono().trim(),
      correo: this.formCorreo().trim(),
      cop: this.formCop().trim(),
      idEspecialidad: this.formEspecialidadId(),
      ...(this.formPassword().trim() ? { password: this.formPassword().trim() } : {})
    };
    const doSave = () => {
      this.isSaving.set(true);
      const obs = editing
        ? this.medicoService.actualizar(editing.idMedico, payload)
        : this.medicoService.crear(payload);
      obs.subscribe({
        next: () => { this.showToast(editing ? 'Médico actualizado.' : 'Médico registrado exitosamente.'); this.loadMedicos(); this.closeDrawer(); this.isSaving.set(false); },
        error: (e) => { this.showToast(e?.error?.message || 'Error al guardar.', 'error'); this.isSaving.set(false); }
      });
    };

    this.openConfirm(
      editing ? 'Confirmar edición' : 'Confirmar registro',
      editing
        ? `¿Deseas guardar los cambios del Dr(a). ${payload.nombres} ${payload.apellidos}?`
        : `¿Deseas registrar al Dr(a). ${payload.nombres} ${payload.apellidos}?`,
      doSave, false
    );
  }

  askDelete(item: MedicoResponse) {
    this.openConfirm('Eliminar médico',
      `¿Seguro que deseas eliminar al Dr(a). ${item.nombres} ${item.apellidos}? Esta acción no se puede deshacer.`,
      () => {
        this.medicoService.eliminar(item.idMedico).subscribe({
          next: () => { this.showToast('Médico eliminado.'); this.loadMedicos(); },
          error: () => this.showToast('Error al eliminar.', 'error')
        });
      }, true);
  }

  askToggle(item: MedicoResponse) {
    const action = item.activo ? 'desactivar' : 'activar';
    this.openConfirm(`${action.charAt(0).toUpperCase() + action.slice(1)} médico`,
      `¿Deseas ${action} al Dr(a). ${item.nombres} ${item.apellidos}?`,
      () => {
        this.medicoService.toggleActivo(item.idMedico).subscribe({
          next: () => { this.showToast(`Médico ${action}do correctamente.`); this.loadMedicos(); },
          error: () => this.showToast('Error al cambiar estado.', 'error')
        });
      }, false);
  }

  openConfirm(title: string, message: string, action: () => void, danger = false) {
    this.confirmTitle.set(title);
    this.confirmMessage.set(message);
    this.confirmAction.set(action);
    this.confirmDanger.set(danger);
    this.confirmOpen.set(true);
  }

  doConfirm() { this.confirmOpen.set(false); const fn = this.confirmAction(); if (fn) fn(); }
  cancelConfirm() { this.confirmOpen.set(false); }

  onlyNumbers(event: KeyboardEvent) {
    if (!/^[0-9]$/.test(event.key)) event.preventDefault();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg); this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
