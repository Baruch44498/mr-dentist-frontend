import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { SideBard } from "../models/sidebard";
import { LoginService } from "../services/login.service";

@Component({
  selector: 'app-sideBar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sideBar.component.html',
  styleUrl: './sideBar.component.css',
})
export class SideBarComponent implements OnInit {
  private loginService = inject(LoginService);
  private router = inject(Router);

  userRole: string | null = null;
  userName: string = 'Usuario';
  userEmail: string = '';
  sideBar: SideBard[] = [];

  ngOnInit() {
    this.loadUserMenu();
  }

  loadUserMenu() {
    this.userRole = this.loginService.getRole();
    this.userName = this.loginService.getUserName() || 'Paciente';
    this.userEmail = this.loginService.getUserEmail() || 'paciente@mrdentist.com';
    const role = this.userRole?.toUpperCase() || 'PACIENTE';

    if (role === 'ADMIN') {
      this.sideBar = [
        { nameButton: 'Panel Principal', path: '/admin/dashboard', icon: 'dashboard' },
        { nameButton: 'Gestionar Médicos', path: '/admin/medicos', icon: 'medical_services' },
        { nameButton: 'Gestionar Pacientes', path: '/admin/pacientes', icon: 'group' },
        { nameButton: 'Gestionar Especialidades', path: '/admin/especialidades', icon: 'workspace_premium' },
        { nameButton: 'Gestionar Citas', path: '/admin/citas', icon: 'calendar_month' },
        { nameButton: 'Mi Perfil', path: '/paciente/perfil', icon: 'person' },
        { nameButton: 'Configuración', path: '/admin/settings', icon: 'settings' }
      ];
    } else if (role === 'MEDICO') {
      this.sideBar = [
        { nameButton: 'Mi Agenda', path: '/medico/dashboard', icon: 'calendar_today' },
        { nameButton: 'Mis Pacientes', path: '/medico/pacientes', icon: 'group' },
        { nameButton: 'Historiales Clínicos', path: '/medico/historiales', icon: 'description' },
        { nameButton: 'Mi Perfil', path: '/paciente/perfil', icon: 'person' }
      ];
    } else {
      // PACIENTE
      this.sideBar = [
        { nameButton: 'Mis Citas', path: '/paciente/dashboard', icon: 'event' },
        { nameButton: 'Reservar Cita', path: '/paciente/reservar', icon: 'add_circle' },
        { nameButton: 'Mi Historial', path: '/paciente/historial', icon: 'medical_information' },
        { nameButton: 'Mis Recetas', path: '/paciente/recetas', icon: 'receipt_long' },
        { nameButton: 'Mi Perfil', path: '/paciente/perfil', icon: 'person' }
      ];
    }
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}