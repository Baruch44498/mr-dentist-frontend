import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../services/cita.service';
import { HorarioService } from '../services/horario.service';
import { AtencionService } from '../services/atencion.service';
import { CitaResponse } from '../models/cita';
import { HorarioMedicoResponse, SlotDisponible } from '../models/horario';
import { DetalleRecetaRequest, AtencionResponse } from '../models/atencion';

@Component({
  selector: 'app-agenda-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda-medico.component.html'
})
export class AgendaMedicoComponent implements OnInit {
  private citaService = inject(CitaService);
  private horarioService = inject(HorarioService);
  private atencionService = inject(AtencionService);

  // States
  activeTab = signal<'citas' | 'horarios'>('citas');
  citas = signal<CitaResponse[]>([]);
  horarios = signal<HorarioMedicoResponse[]>([]);
  
  isLoadingCitas = signal<boolean>(false);
  isLoadingHorarios = signal<boolean>(false);

  // Reprogramming Modal State
  selectedCita = signal<CitaResponse | null>(null);
  showReprogramModal = signal<boolean>(false);
  reprogFecha = signal<string>('');
  reprogHora = signal<string>('');
  reprogNota = signal<string>('');
  reprogSlots = signal<string[]>([]);
  isLoadingReprogSlots = signal<boolean>(false);

  // Attention & Prescription Modal State
  showAtencionModal = signal<boolean>(false);
  citaParaAtender = signal<CitaResponse | null>(null);
  formDiagnostico = signal<string>('');
  formTratamiento = signal<string>('');
  formObservaciones = signal<string>('');
  
  // Recipe form state
  formGenerarReceta = signal<boolean>(false);
  formIndicacionesGenerales = signal<string>('');
  medicamentos = signal<DetalleRecetaRequest[]>([]);
  medNombre = signal<string>('');
  medDosis = signal<string>('');
  medFrecuencia = signal<string>('');
  isSavingAtencion = signal<boolean>(false);

  // View Attention Modal State (for already attended appointments)
  showVerAtencionModal = signal<boolean>(false);
  atencionVisualizada = signal<AtencionResponse | null>(null);
  isLoadingVerAtencion = signal<boolean>(false);

  // New Schedule Form State
  formDia = signal<string>('LUNES');
  formHoraInicio = signal<string>('08:00');
  formHoraFin = signal<string>('12:00');
  formDuracion = signal<number>(30);
  isSavingHorario = signal<boolean>(false);

  // Toast notification
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];


  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }
    this.cargarCitas();
    this.cargarHorarios();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  cargarCitas() {
    this.isLoadingCitas.set(true);
    this.citaService.listarMisCitasComoMedico().subscribe({
      next: (res: CitaResponse[]) => {
        this.citas.set(res);
        this.isLoadingCitas.set(false);
      },
      error: () => {
        this.showToast('Error al cargar la agenda.', 'error');
        this.isLoadingCitas.set(false);
      }
    });
  }

  cargarHorarios() {
    this.isLoadingHorarios.set(true);
    this.horarioService.listarMisHorarios().subscribe({
      next: (res: HorarioMedicoResponse[]) => {
        this.horarios.set(res);
        this.isLoadingHorarios.set(false);
      },
      error: () => {
        this.showToast('Error al cargar la planeación de horarios.', 'error');
        this.isLoadingHorarios.set(false);
      }
    });
  }

  cancelarCita(cita: CitaResponse) {
    if (confirm(`¿Estás seguro de que deseas cancelar la cita de ${cita.nombrePaciente}?`)) {
      this.citaService.cancelarCita(cita.idCita).subscribe({
        next: () => {
          this.showToast('Cita cancelada correctamente.', 'success');
          this.cargarCitas();
        },
        error: (err: any) => {
          const msg = err?.error?.message || 'Error al cancelar la cita.';
          this.showToast(msg, 'error');
        }
      });
    }
  }

  abrirReprogramar(cita: CitaResponse) {
    this.selectedCita.set(cita);
    this.reprogFecha.set('');
    this.reprogHora.set('');
    this.reprogNota.set('');
    this.reprogSlots.set([]);
    this.showReprogramModal.set(true);
  }

  cerrarReprogramar() {
    this.showReprogramModal.set(false);
    this.selectedCita.set(null);
  }

  onReprogFechaChange() {
    const fecha = this.reprogFecha();
    const cita = this.selectedCita();
    if (!fecha || !cita) return;

    this.isLoadingReprogSlots.set(true);
    this.reprogSlots.set([]);
    
    this.horarioService.getSlotsDisponibles(cita.idMedico, fecha).subscribe({
      next: (res: SlotDisponible[]) => {
        // Filtrar solo los slots disponibles
        const libres = res.filter((s: SlotDisponible) => s.disponible).map((s: SlotDisponible) => s.hora.substring(0, 5));
        this.reprogSlots.set(libres);
        this.isLoadingReprogSlots.set(false);
      },
      error: () => {
        this.showToast('Error al consultar horarios para esa fecha.', 'error');
        this.isLoadingReprogSlots.set(false);
      }
    });
  }

  guardarReprogramacion() {
    const cita = this.selectedCita();
    const fecha = this.reprogFecha();
    const hora = this.reprogHora();
    const nota = this.reprogNota();

    if (!cita || !fecha || !hora || !nota.trim()) {
      this.showToast('Todos los campos son obligatorios para postergar.', 'error');
      return;
    }

    this.citaService.postergarCita(cita.idCita, {
      nuevaFecha: fecha,
      nuevaHora: hora + ':00',
      notaPostergacion: nota
    }).subscribe({
      next: () => {
        this.showToast('Cita reprogramada con éxito.', 'success');
        this.cerrarReprogramar();
        this.cargarCitas();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Error al reprogramar la cita.';
        this.showToast(msg, 'error');
      }
    });
  }

  crearHorario() {
    const dia = this.formDia();
    const inicio = this.formHoraInicio();
    const fin = this.formHoraFin();
    const duracion = this.formDuracion();

    if (!dia || !inicio || !fin || duracion <= 0) {
      this.showToast('Valores de formulario inválidos.', 'error');
      return;
    }

    this.isSavingHorario.set(true);
    this.horarioService.crearHorario({
      diaSemana: dia,
      horaInicio: inicio + ':00',
      horaFin: fin + ':00',
      duracionMinutos: duracion
    }).subscribe({
      next: () => {
        this.showToast('Bloque de horario creado correctamente.', 'success');
        this.cargarHorarios();
        this.isSavingHorario.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Error al programar horario.';
        this.showToast(msg, 'error');
        this.isSavingHorario.set(false);
      }
    });
  }

  toggleActivoHorario(id: number) {
    this.horarioService.toggleActivo(id).subscribe({
      next: () => {
        this.showToast('Estado del horario actualizado.', 'success');
        this.cargarHorarios();
      },
      error: () => {
        this.showToast('Error al actualizar el horario.', 'error');
      }
    });
  }

  eliminarHorario(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este bloque de horario?')) {
      this.horarioService.eliminarHorario(id).subscribe({
        next: () => {
          this.showToast('Bloque de horario eliminado.', 'success');
          this.cargarHorarios();
        },
        error: () => {
          this.showToast('Error al eliminar el bloque de horario.', 'error');
        }
      });
    }
  }

  // --- MÉTODOS DE ATENCIÓN CLÍNICA Y RECETA ---

  abrirAtencion(cita: CitaResponse) {
    this.citaParaAtender.set(cita);
    this.formDiagnostico.set('');
    this.formTratamiento.set('');
    this.formObservaciones.set('');
    this.formGenerarReceta.set(false);
    this.formIndicacionesGenerales.set('');
    this.medicamentos.set([]);
    this.medNombre.set('');
    this.medDosis.set('');
    this.medFrecuencia.set('');
    this.showAtencionModal.set(true);
  }

  cerrarAtencion() {
    this.showAtencionModal.set(false);
    this.citaParaAtender.set(null);
  }

  agregarMedicamento() {
    const nombre = this.medNombre().trim();
    const dosis = this.medDosis().trim();
    const frecuencia = this.medFrecuencia().trim();

    if (!nombre || !dosis || !frecuencia) {
      this.showToast('Completa los campos del medicamento.', 'error');
      return;
    }

    this.medicamentos.update(arr => [...arr, { medicamento: nombre, dosis, frecuencia }]);
    this.medNombre.set('');
    this.medDosis.set('');
    this.medFrecuencia.set('');
  }

  quitarMedicamento(index: number) {
    this.medicamentos.update(arr => arr.filter((_, i) => i !== index));
  }

  guardarAtencion() {
    const cita = this.citaParaAtender();
    const diag = this.formDiagnostico().trim();
    const trat = this.formTratamiento().trim();
    const obs = this.formObservaciones().trim();

    if (!cita || !diag || !trat) {
      this.showToast('El diagnóstico y tratamiento son obligatorios.', 'error');
      return;
    }

    this.isSavingAtencion.set(true);

    // Si el usuario llenó los inputs de medicamento pero olvidó hacer clic en el botón (+),
    // lo agregamos de manera automática antes de enviar la receta.
    const medNom = this.medNombre().trim();
    const medDos = this.medDosis().trim();
    const medFre = this.medFrecuencia().trim();
    if (this.formGenerarReceta() && medNom && medDos && medFre) {
      this.medicamentos.update(arr => [...arr, { medicamento: medNom, dosis: medDos, frecuencia: medFre }]);
      this.medNombre.set('');
      this.medDosis.set('');
      this.medFrecuencia.set('');
    }

    const atencionRequest: any = {
      idCita: cita.idCita,
      diagnostico: diag,
      tratamiento: trat,
      observaciones: obs,
      receta: null
    };

    if (this.formGenerarReceta()) {
      atencionRequest.receta = {
        indicacionesGenerales: this.formIndicacionesGenerales().trim() || 'Tomar según indicaciones.',
        detalles: this.medicamentos()
      };
    }

    this.atencionService.registrarAtencion(atencionRequest).subscribe({
      next: () => {
        this.showToast('¡Atención y receta médica guardadas con éxito!', 'success');
        this.cerrarAtencion();
        this.cargarCitas();
        this.isSavingAtencion.set(false);
      },
      error: (err: any) => {
        const errorMsg = err?.error?.message || 'Error al guardar la atención médica.';
        this.showToast(errorMsg, 'error');
        this.isSavingAtencion.set(false);
      }
    });
  }

  verFichaCitaAtendida(cita: CitaResponse) {
    this.isLoadingVerAtencion.set(true);
    this.atencionVisualizada.set(null);
    this.showVerAtencionModal.set(true);

    this.atencionService.obtenerPorCita(cita.idCita).subscribe({
      next: (res: AtencionResponse) => {
        this.atencionVisualizada.set(res);
        this.isLoadingVerAtencion.set(false);
      },
      error: () => {
        this.showToast('No se encontró atención clínica registrada para esta cita.', 'error');
        this.showVerAtencionModal.set(false);
        this.isLoadingVerAtencion.set(false);
      }
    });
  }

  cerrarVerAtencion() {
    this.showVerAtencionModal.set(false);
    this.atencionVisualizada.set(null);
  }
}


