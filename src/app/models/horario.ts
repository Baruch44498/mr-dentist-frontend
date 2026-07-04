export interface HorarioMedicoRequest {
  diaSemana: string;
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  duracionMinutos: number;
}

export interface HorarioMedicoResponse {
  idHorario: number;
  idMedico: number;
  nombreMedico: string;
  diaSemana: string;
  horaInicio: string; // "HH:mm:ss"
  horaFin: string; // "HH:mm:ss"
  duracionMinutos: number;
  activo: boolean;
}

export interface SlotDisponible {
  fecha: string; // "YYYY-MM-DD"
  hora: string; // "HH:mm"
  idMedico: number;
  nombreMedico: string;
  disponible: boolean;
}
