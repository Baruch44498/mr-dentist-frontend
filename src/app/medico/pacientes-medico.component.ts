import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../services/cita.service';
import { AtencionService } from '../services/atencion.service';
import { CitaResponse } from '../models/cita';
import { AtencionResponse } from '../models/atencion';

interface PacienteInfo {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  correo: string;
  fechaRegistro: string;
  activo: boolean;
}

@Component({
  selector: 'app-pacientes-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-medico.component.html'
})
export class PacientesMedicoComponent implements OnInit {
  private citaService = inject(CitaService);
  private atencionService = inject(AtencionService);

  pacientes = signal<PacienteInfo[]>([]);
  filteredPacientes = signal<PacienteInfo[]>([]);
  isLoading = signal<boolean>(false);
  
  // Search query
  searchQuery = signal<string>('');

  // Selected Patient Details & History
  selectedPaciente = signal<PacienteInfo | null>(null);
  citasHistorial = signal<CitaResponse[]>([]);
  isLoadingHistory = signal<boolean>(false);

  // View Attention Modal State (for already attended appointments)
  showVerAtencionModal = signal<boolean>(false);
  atencionVisualizada = signal<AtencionResponse | null>(null);
  isLoadingVerAtencion = signal<boolean>(false);

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.cargarPacientes();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  cargarPacientes() {
    this.isLoading.set(true);
    this.citaService.listarPacientesDeMedico().subscribe({
      next: (res: any[]) => {
        this.pacientes.set(res);
        this.filteredPacientes.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.showToast('Error al cargar la lista de tus pacientes.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange() {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      this.filteredPacientes.set(this.pacientes());
      return;
    }

    const filtered = this.pacientes().filter(p => 
      p.nombres.toLowerCase().includes(query) || 
      p.apellidos.toLowerCase().includes(query) || 
      p.dni.includes(query)
    );
    this.filteredPacientes.set(filtered);
  }

  verHistorial(paciente: PacienteInfo) {
    this.selectedPaciente.set(paciente);
    this.isLoadingHistory.set(true);
    this.citasHistorial.set([]);

    this.citaService.listarHistorialCitasPacienteConMedico(paciente.idPaciente).subscribe({

      next: (res: CitaResponse[]) => {
        this.citasHistorial.set(res);
        this.isLoadingHistory.set(false);
      },
      error: () => {
        this.showToast('Error al consultar el historial del paciente.', 'error');
        this.isLoadingHistory.set(false);
      }
    });
  }

  cerrarHistorial() {
    this.selectedPaciente.set(null);
    this.citasHistorial.set([]);
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

