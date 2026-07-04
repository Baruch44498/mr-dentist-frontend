import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard, roleGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'admin/medicos', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Rutas del Admin (sin guards en modo pruebas)
  { path: 'admin/dashboard', component: DashboardComponent },
  { path: 'admin/medicos', component: DashboardComponent },
  { path: 'admin/pacientes', component: DashboardComponent },
  { path: 'admin/especialidades', component: DashboardComponent },
  { path: 'admin/citas', component: DashboardComponent },
  { path: 'admin/settings', component: DashboardComponent },

  // Rutas del Médico
  {
    path: 'medico/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'MEDICO' }
  },
  {
    path: 'medico/pacientes',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'MEDICO' }
  },
  {
    path: 'medico/historiales',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'MEDICO' }
  },
  {
    path: 'medico/perfil',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'MEDICO' }
  },

  // Rutas del Paciente
  {
    path: 'paciente/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'PACIENTE' }
  },
  {
    path: 'paciente/reservar',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'PACIENTE' }
  },
  {
    path: 'paciente/historial',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'PACIENTE' }
  },
  {
    path: 'paciente/historial/detalle',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'PACIENTE' }
  },
  {
    path: 'paciente/recetas',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'PACIENTE' }
  },
  {
    path: 'paciente/perfil',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  // Redirección comodín
  { path: '**', redirectTo: 'admin/medicos' }
];

