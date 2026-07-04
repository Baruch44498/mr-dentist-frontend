export interface CitaRequest {
  idMedico: number;
  fecha: string; // "YYYY-MM-DD"
  hora: string; // "HH:mm"
  motivoCita?: string;
}

export interface CitaResponse {
  idCita: number;
  fecha: string; // "YYYY-MM-DD"
  hora: string; // "HH:mm:ss"
  estadoCita: string; // "PENDIENTE", "ATENDIDA", "CANCELADA", "POSTERGADA"
  motivoCita: string;
  notaPostergacion?: string;
  idPaciente: number;
  nombrePaciente: string;
  idMedico: number;
  nombreMedico: string;
  especialidadMedico: string;
}

export interface PostergarCitaRequest {
  nuevaFecha: string; // "YYYY-MM-DD"
  nuevaHora: string; // "HH:mm"
  notaPostergacion: string;
}
