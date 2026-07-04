import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EspecialidadService } from '../services/especialidad.service';
import { MedicoService } from '../services/medico.service';
import { HorarioService } from '../services/horario.service';
import { CitaService } from '../services/cita.service';
import { EspecialidadResponse } from '../models/especialidad';
import { MedicoResponse } from '../models/medico';
import { SlotDisponible } from '../models/horario';
import { CitaResponse } from '../models/cita';
import { AtencionService } from '../services/atencion.service';
import { AtencionResponse } from '../models/atencion';

@Component({
  selector: 'app-reservar-cita-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservar-cita.component.html'
})
export class ReservarCitaComponent implements OnInit {
  private especialidadService = inject(EspecialidadService);
  private medicoService = inject(MedicoService);
  private horarioService = inject(HorarioService);
  private citaService = inject(CitaService);
  private atencionService = inject(AtencionService);
  private router = inject(Router);

  // Lists & data sources
  especialidades = signal<EspecialidadResponse[]>([]);
  medicos = signal<MedicoResponse[]>([]);
  citasHistorial = signal<CitaResponse[]>([]);

  // Wizard Steps & State
  step = signal<number>(1);
  selectedEspecialidadId = signal<number | null>(null);
  selectedMedico = signal<MedicoResponse | null>(null);
  selectedFecha = signal<string>('');
  selectedSlot = signal<SlotDisponible | null>(null);
  formMotivo = signal<string>('');

  slots = signal<SlotDisponible[]>([]);
  isLoadingSlots = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isLoadingHistorial = signal<boolean>(false);

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }
    this.cargarEspecialidades();
    this.cargarMedicos();
    this.cargarMisCitas();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  cargarEspecialidades() {
    this.especialidadService.getAll().subscribe({
      next: (res) => this.especialidades.set(res.filter(e => e.activa))
    });
  }

  cargarMedicos() {
    this.medicoService.getAll().subscribe({
      next: (res) => this.medicos.set(res)
    });
  }

  cargarMisCitas() {
    this.isLoadingHistorial.set(true);
    this.citaService.listarMisCitasComoPaciente().subscribe({
      next: (res) => {
        this.citasHistorial.set(res);
        this.isLoadingHistorial.set(false);
      },
      error: () => {
        this.showToast('Error al cargar historial de citas.', 'error');
        this.isLoadingHistorial.set(false);
      }
    });
  }

  // Filtrado de médicos según especialidad seleccionada
  getMedicosFiltrados(): MedicoResponse[] {
    const espId = this.selectedEspecialidadId();
    if (!espId) return [];
    return this.medicos().filter(m => m.idEspecialidad === espId);
  }

  selectEspecialidad(id: number) {
    this.selectedEspecialidadId.set(id);
    this.selectedMedico.set(null);
    this.step.set(2);
  }

  selectMedico(medico: MedicoResponse) {
    this.selectedMedico.set(medico);
    this.selectedFecha.set('');
    this.selectedSlot.set(null);
    this.slots.set([]);
    this.step.set(3);
  }

  onFechaChange() {
    const fecha = this.selectedFecha();
    const medico = this.selectedMedico();
    if (!fecha || !medico) return;

    this.isLoadingSlots.set(true);
    this.slots.set([]);
    this.selectedSlot.set(null);

    this.horarioService.getSlotsDisponibles(medico.idMedico, fecha).subscribe({
      next: (res) => {
        this.slots.set(res);
        this.isLoadingSlots.set(false);
      },
      error: () => {
        this.showToast('Error al obtener la agenda de este odontólogo.', 'error');
        this.isLoadingSlots.set(false);
      }
    });
  }

  selectSlot(slot: SlotDisponible) {
    if (!slot.disponible) return;
    this.selectedSlot.set(slot);
  }

  prevStep() {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  goToStep4() {
    if (!this.selectedSlot()) {
      this.showToast('Por favor, selecciona un horario para tu cita.', 'error');
      return;
    }
    this.step.set(4);
  }

  confirmarReserva() {
    const slot = this.selectedSlot();
    const medico = this.selectedMedico();
    if (!slot || !medico) return;

    this.isSubmitting.set(true);
    
    // Si la hora ya incluye segundos (formato HH:mm:ss), la enviamos directamente.
    // De lo contrario, le concatenamos ':00'.
    const horaEnvio = slot.hora.split(':').length === 2 ? `${slot.hora}:00` : slot.hora;

    this.citaService.reservarCitaPaciente({
      idMedico: medico.idMedico,
      fecha: slot.fecha,
      hora: horaEnvio,
      motivoCita: this.formMotivo().trim() || 'Consulta Odontológica'
    }).subscribe({
      next: () => {
        this.showToast('¡Cita programada con éxito!', 'success');
        this.resetWizard();
        this.cargarMisCitas();
      },
      error: (err) => {
        const errorMsg = err?.error?.message || 'Error al programar la cita. Verifica que el horario siga disponible.';
        this.showToast(errorMsg, 'error');
        this.isSubmitting.set(false);
      }
    });
  }

  resetWizard() {
    this.step.set(1);
    this.selectedEspecialidadId.set(null);
    this.selectedMedico.set(null);
    this.selectedFecha.set('');
    this.selectedSlot.set(null);
    this.formMotivo.set('');
    this.slots.set([]);
    this.isSubmitting.set(false);
  }

  cancelarCita(id: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.citaService.cancelarCita(id).subscribe({
        next: () => {
          this.showToast('Cita cancelada correctamente.', 'success');
          this.cargarMisCitas();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Error al cancelar la cita.';
          this.showToast(msg, 'error');
        }
      });
    }
  }

  verReceta(citaId: number) {
    this.router.navigate(['/paciente/historial/detalle'], { queryParams: { citaId } });
  }
}

