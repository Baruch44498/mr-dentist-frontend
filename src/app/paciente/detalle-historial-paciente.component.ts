import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AtencionService } from '../services/atencion.service';
import { CitaService } from '../services/cita.service';
import { MedicoService } from '../services/medico.service';
import { AtencionResponse } from '../models/atencion';
import { CitaResponse } from '../models/cita';
import { MedicoResponse } from '../models/medico';

@Component({
  selector: 'app-detalle-historial-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-historial-paciente.component.html'
})
export class DetalleHistorialPacienteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private atencionService = inject(AtencionService);
  private citaService = inject(CitaService);
  private medicoService = inject(MedicoService);

  citaId = signal<number | null>(null);
  atencion = signal<AtencionResponse | null>(null);
  cita = signal<CitaResponse | null>(null);
  medico = signal<MedicoResponse | null>(null);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  clinicName = signal<string>('MR DENTIST');
  clinicSubtitle = signal<string>('Centro Odontológico');
  clinicPhone = signal<string>('+51 987 654 321');
  clinicAddress = signal<string>('Av. Larco 123, Miraflores');
  clinicEmail = signal<string>('contacto@mrdentist.com');
  showLogo = signal<boolean>(true);

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.clinicName.set(localStorage.getItem('clinicName') || 'MR DENTIST');
      this.clinicSubtitle.set(localStorage.getItem('clinicSubtitle') || 'Centro Odontológico');
      this.clinicPhone.set(localStorage.getItem('clinicPhone') || '+51 987 654 321');
      this.clinicAddress.set(localStorage.getItem('clinicAddress') || 'Av. Larco 123, Miraflores');
      this.clinicEmail.set(localStorage.getItem('clinicEmail') || 'contacto@mrdentist.com');
      this.showLogo.set(localStorage.getItem('clinicShowLogo') !== 'false');
    }

    this.route.queryParams.subscribe(params => {
      const id = params['citaId'];
      const print = params['print'] === 'true';
      if (id) {
        this.citaId.set(Number(id));
        this.cargarDatos(Number(id), print);
      } else {
        this.errorMessage.set('No se especificó una cita válida.');
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  cargarDatos(idCita: number, printAfterLoad: boolean = false) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // 1. Cargar la atención clínica de la cita
    this.atencionService.obtenerPorCita(idCita).subscribe({
      next: (atencionRes: AtencionResponse) => {
        this.atencion.set(atencionRes);

        // 2. Cargar los detalles de la cita para complementar (especialidad, estado, etc.)
        this.citaService.listarMisCitasComoPaciente().subscribe({
          next: (citas: CitaResponse[]) => {
            const foundCita = citas.find(c => c.idCita === idCita);
            if (foundCita) {
              this.cita.set(foundCita);
              
              // 3. Cargar los datos del médico para contacto (teléfono, correo)
              this.medicoService.getById(foundCita.idMedico).subscribe({
                next: (medRes: MedicoResponse) => {
                  this.medico.set(medRes);
                  this.isLoading.set(false);
                  if (printAfterLoad) {
                    setTimeout(() => {
                      window.print();
                    }, 300);
                  }
                },
                error: () => {
                  this.isLoading.set(false);
                  if (printAfterLoad) {
                    setTimeout(() => {
                      window.print();
                    }, 300);
                  }
                }
              });
            } else {
              this.isLoading.set(false);
              if (printAfterLoad) {
                setTimeout(() => {
                  window.print();
                }, 300);
              }
            }
          },
          error: () => {
            // Aún si falla la cita, podemos mostrar la atención
            this.isLoading.set(false);
            if (printAfterLoad) {
              setTimeout(() => {
                window.print();
              }, 300);
            }
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('No se encontró el registro de atención clínica para esta cita o hubo un problema al obtener los datos.');
        this.isLoading.set(false);
      }
    });
  }

  regresar() {
    this.router.navigate(['/paciente/historial']);
  }

  imprimirReceta() {
    window.print();
  }
}
