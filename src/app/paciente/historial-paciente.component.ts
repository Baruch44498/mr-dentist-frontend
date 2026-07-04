import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtencionService } from '../services/atencion.service';
import { CitaService } from '../services/cita.service';
import { AtencionResponse } from '../models/atencion';
import { CitaResponse } from '../models/cita';

@Component({
  selector: 'app-historial-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-paciente.component.html'
})
export class HistorialPacienteComponent implements OnInit {
  private atencionService = inject(AtencionService);
  private citaService = inject(CitaService);
  private router = inject(Router);

  atenciones = signal<AtencionResponse[]>([]);
  citas = signal<CitaResponse[]>([]);
  isLoading = signal<boolean>(false);

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.cargarHistorial();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  cargarHistorial() {
    this.isLoading.set(true);
    
    this.citaService.listarMisCitasComoPaciente().subscribe({
      next: (citasRes: CitaResponse[]) => {
        this.citas.set(citasRes);
        
        this.atencionService.obtenerMisAtenciones().subscribe({
          next: (res: AtencionResponse[]) => {
            this.atenciones.set(res);
            this.isLoading.set(false);
          },
          error: () => {
            this.showToast('Error al cargar tu historial de tratamientos.', 'error');
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.showToast('Error al cargar información de tus citas.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  getMotivoCita(idCita: number): string {
    const cita = this.citas().find(c => c.idCita === idCita);
    return cita ? cita.motivoCita : 'Consulta Odontológica';
  }

  getEspecialidadMedico(idCita: number): string {
    const cita = this.citas().find(c => c.idCita === idCita);
    return cita ? cita.especialidadMedico : 'Odontología General';
  }

  verDetalle(citaId: number) {
    this.router.navigate(['/paciente/historial/detalle'], { queryParams: { citaId } });
  }
}
