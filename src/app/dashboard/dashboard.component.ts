import { Component, OnInit, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from '../layout/sideBar.component';
import { LoginService } from '../services/login.service';
import { CitaService } from '../services/cita.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CrudMedicosComponent } from '../admin/crud-medicos/crud-medicos.component';
import { CrudPacientesComponent } from '../admin/crud-pacientes/crud-pacientes.component';
import { CrudEspecialidadesComponent } from '../admin/crud-especialidades/crud-especialidades.component';
import { AgendaMedicoComponent } from '../medico/agenda-medico.component';
import { PacientesMedicoComponent } from '../medico/pacientes-medico.component';
import { HistorialesMedicosComponent } from '../medico/historiales-medicos.component';
import { ReservarCitaComponent } from '../paciente/reservar-cita.component';
import { HistorialPacienteComponent } from '../paciente/historial-paciente.component';
import { DetalleHistorialPacienteComponent } from '../paciente/detalle-historial-paciente.component';
import { RecetasPacienteComponent } from '../paciente/recetas-paciente.component';
import { PerfilComponent } from '../profile/perfil.component';
import { SettingsComponent } from '../admin/settings/settings.component';
import { DashboardAdminComponent } from '../admin/dashboard-admin.component';
import { CitaResponse } from '../models/cita';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SideBarComponent,
    CrudMedicosComponent,
    CrudPacientesComponent,
    CrudEspecialidadesComponent,
    AgendaMedicoComponent,
    PacientesMedicoComponent,
    HistorialesMedicosComponent,
    ReservarCitaComponent,
    HistorialPacienteComponent,
    DetalleHistorialPacienteComponent,
    RecetasPacienteComponent,
    PerfilComponent,
    SettingsComponent,
    DashboardAdminComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private loginService = inject(LoginService);
  private citaService = inject(CitaService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  userRole = '';
  userName = '';
  currentPath = '';

  pacienteCitas = signal<CitaResponse[]>([]);
  proximaCitaPaciente = signal<CitaResponse | null>(null);

  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }

    this.userRole = this.loginService.getRole() || 'PACIENTE';
    this.userName = this.loginService.getUserName() || 'Usuario';
    this.currentPath = this.router.url;

    if (this.userRole === 'PACIENTE') {
      this.cargarCitasPaciente();
    }

    // Escuchar eventos de navegación para actualizar currentPath de forma reactiva
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      this.currentPath = event.urlAfterRedirects || event.url;
      if (this.userRole === 'PACIENTE') {
        this.cargarCitasPaciente();
      }
    });
  }

  cargarCitasPaciente() {
    this.citaService.listarMisCitasComoPaciente().subscribe({
      next: (res) => {
        this.pacienteCitas.set(res);
        // Filtrar la primera cita pendiente más cercana
        const pendientes = res.filter(c => c.estadoCita === 'PENDIENTE');
        if (pendientes.length > 0) {
          // Ordenar por fecha y hora
          pendientes.sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);
            return dateA.getTime() - dateB.getTime();
          });
          this.proximaCitaPaciente.set(pendientes[0]);
        } else {
          this.proximaCitaPaciente.set(null);
        }
      }
    });
  }

  irAReservar() {
    this.router.navigate(['/paciente/reservar']);
  }
}
// Trigger dev server watch rebuild

