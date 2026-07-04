import { CitaResponse } from './cita';

export interface AdminDashboardStats {
  totalMedicos: number;
  totalPacientes: number;
  totalCitasHoy: number;
  totalCitasPendientes: number;
  citasRecientes: CitaResponse[];
}
