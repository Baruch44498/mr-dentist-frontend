import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AtencionService } from '../services/atencion.service';
import { CitaService } from '../services/cita.service';
import { AtencionResponse } from '../models/atencion';
import { CitaResponse } from '../models/cita';

@Component({
  selector: 'app-recetas-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recetas-paciente.component.html'
})
export class RecetasPacienteComponent implements OnInit {
  private atencionService = inject(AtencionService);
  private citaService = inject(CitaService);
  private router = inject(Router);

  recetas = signal<AtencionResponse[]>([]);
  citas = signal<CitaResponse[]>([]);
  isLoading = signal<boolean>(false);

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.cargarRecetas();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  cargarRecetas() {
    this.isLoading.set(true);

    // Fetch appointments for metadata lookup (such as specialty)
    this.citaService.listarMisCitasComoPaciente().subscribe({
      next: (citasRes: CitaResponse[]) => {
        this.citas.set(citasRes);

        // Fetch clinical attentions and filter out those without prescriptions
        this.atencionService.obtenerMisAtenciones().subscribe({
          next: (res: AtencionResponse[]) => {
            const filtered = res.filter(a => a.receta && a.receta.detalles && a.receta.detalles.length > 0);
            this.recetas.set(filtered);
            this.isLoading.set(false);
          },
          error: () => {
            this.showToast('Error al cargar tu listado de recetas.', 'error');
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.showToast('Error al obtener la información de las citas.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  getEspecialidadMedico(idCita: number): string {
    const cita = this.citas().find(c => c.idCita === idCita);
    return cita ? cita.especialidadMedico : 'Odontología General';
  }

  verDetalle(citaId: number) {
    this.router.navigate(['/paciente/historial/detalle'], { queryParams: { citaId } });
  }

  imprimirReceta(recetaId: number) {
    this.router.navigate(['/paciente/historial/detalle'], { queryParams: { citaId: recetaId, print: 'true' } });
  }
}
