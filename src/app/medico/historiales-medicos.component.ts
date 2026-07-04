import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../services/cita.service';
import { AtencionService } from '../services/atencion.service';
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
  selector: 'app-historiales-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historiales-medicos.component.html'
})
export class HistorialesMedicosComponent implements OnInit {
  private citaService = inject(CitaService);
  private atencionService = inject(AtencionService);

  pacientes = signal<PacienteInfo[]>([]);
  filteredPacientes = signal<PacienteInfo[]>([]);
  isLoadingPacientes = signal<boolean>(false);
  
  // Search query
  searchQuery = signal<string>('');

  // Selected Patient & Medical History
  selectedPaciente = signal<PacienteInfo | null>(null);
  historialAtenciones = signal<AtencionResponse[]>([]);
  isLoadingHistorial = signal<boolean>(false);

  // Recipe View modal
  selectedAtencion = signal<AtencionResponse | null>(null);
  showRecetaModal = signal<boolean>(false);

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
    this.isLoadingPacientes.set(true);
    this.citaService.listarPacientesDeMedico().subscribe({
      next: (res: any[]) => {
        this.pacientes.set(res);
        this.filteredPacientes.set(res);
        this.isLoadingPacientes.set(false);
      },
      error: () => {
        this.showToast('Error al cargar el listado de pacientes.', 'error');
        this.isLoadingPacientes.set(false);
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

  seleccionarPaciente(paciente: PacienteInfo) {
    this.selectedPaciente.set(paciente);
    this.isLoadingHistorial.set(true);
    this.historialAtenciones.set([]);

    this.atencionService.obtenerHistorialPaciente(paciente.idPaciente).subscribe({
      next: (res: AtencionResponse[]) => {
        this.historialAtenciones.set(res);
        this.isLoadingHistorial.set(false);
      },
      error: () => {
        this.showToast('Error al obtener el historial de atenciones clínicas.', 'error');
        this.isLoadingHistorial.set(false);
      }
    });
  }

  cerrarHistorial() {
    this.selectedPaciente.set(null);
    this.historialAtenciones.set([]);
  }

  verReceta(atencion: AtencionResponse) {
    this.selectedAtencion.set(atencion);
    this.showRecetaModal.set(true);
  }

  cerrarReceta() {
    this.showRecetaModal.set(false);
    this.selectedAtencion.set(null);
  }
}
