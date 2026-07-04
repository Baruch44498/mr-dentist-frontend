import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspecialidadService } from '../../services/especialidad.service';
import { EspecialidadRequest, EspecialidadResponse } from '../../models/especialidad';

@Component({
  selector: 'app-crud-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-especialidades.component.html',
})
export class CrudEspecialidadesComponent implements OnInit {
  private service = inject(EspecialidadService);

  especialidades = signal<EspecialidadResponse[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isDrawerOpen = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  editingItem = signal<EspecialidadResponse | null>(null);
  formNombre = signal<string>('');
  formDescripcion = signal<string>('');

  // Confirmation modal
  confirmOpen = signal<boolean>(false);
  confirmTitle = signal<string>('');
  confirmMessage = signal<string>('');
  confirmAction = signal<(() => void) | null>(null);

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  filteredEspecialidades = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.especialidades().filter(e =>
          e.nombre.toLowerCase().includes(q) ||
          (e.descripcion || '').toLowerCase().includes(q))
      : this.especialidades();
  });

  totalEspecialidades = computed(() => this.especialidades().length);
  totalActivas = computed(() => this.especialidades().filter(e => e.activa).length);

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: d => { this.especialidades.set(d || []); this.isLoading.set(false); },
      error: () => { this.showToast('Error al cargar especialidades', 'error'); this.isLoading.set(false); }
    });
  }

  openNew() {
    this.editingItem.set(null);
    this.formNombre.set('');
    this.formDescripcion.set('');
    this.isDrawerOpen.set(true);
  }

  openEdit(item: EspecialidadResponse) {
    this.editingItem.set(item);
    this.formNombre.set(item.nombre);
    this.formDescripcion.set(item.descripcion || '');
    this.isDrawerOpen.set(true);
  }

  closeDrawer() { this.isDrawerOpen.set(false); }

  onSubmit() {
    if (!this.formNombre().trim()) {
      this.showToast('El nombre es obligatorio.', 'error');
      return;
    }
    const dto: EspecialidadRequest = { nombre: this.formNombre().trim(), descripcion: this.formDescripcion().trim() };
    const editing = this.editingItem();

    const doSave = () => {
      this.isSaving.set(true);
      const obs = editing
        ? this.service.actualizar(editing.idEspecialidad, dto)
        : this.service.crear(dto);
      obs.subscribe({
        next: () => { this.showToast(editing ? 'Especialidad actualizada.' : 'Especialidad creada.'); this.load(); this.closeDrawer(); this.isSaving.set(false); },
        error: (e) => { this.showToast(e?.error?.message || 'Error al guardar.', 'error'); this.isSaving.set(false); }
      });
    };

    this.openConfirm(
      editing ? 'Confirmar edición' : 'Confirmar registro',
      editing ? `¿Deseas guardar los cambios en "${dto.nombre}"?` : `¿Deseas registrar la especialidad "${dto.nombre}"?`,
      doSave
    );
  }

  askDelete(item: EspecialidadResponse) {
    this.openConfirm('Eliminar especialidad', `¿Seguro que deseas eliminar "${item.nombre}"? Esta acción no se puede deshacer.`, () => {
      this.service.eliminar(item.idEspecialidad).subscribe({
        next: () => { this.showToast('Especialidad eliminada.'); this.load(); },
        error: () => this.showToast('Error al eliminar.', 'error')
      });
    });
  }

  askToggle(item: EspecialidadResponse) {
    const action = item.activa ? 'desactivar' : 'activar';
    this.openConfirm(`${action.charAt(0).toUpperCase() + action.slice(1)} especialidad`,
      `¿Deseas ${action} la especialidad "${item.nombre}"?`, () => {
      this.service.toggleActiva(item.idEspecialidad).subscribe({
        next: () => { this.showToast(`Especialidad ${action}da correctamente.`); this.load(); },
        error: () => this.showToast('Error al cambiar estado.', 'error')
      });
    });
  }

  openConfirm(title: string, message: string, action: () => void) {
    this.confirmTitle.set(title);
    this.confirmMessage.set(message);
    this.confirmAction.set(action);
    this.confirmOpen.set(true);
  }

  doConfirm() {
    this.confirmOpen.set(false);
    const fn = this.confirmAction();
    if (fn) fn();
  }

  cancelConfirm() { this.confirmOpen.set(false); }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
