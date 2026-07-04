export interface MedicoRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string;
  correo: string;
  cop: string;
  idEspecialidad?: number | null;
  password?: string;
}

export interface MedicoResponse {
  idMedico: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  correo: string;
  cop: string;
  idEspecialidad: number;
  nombreEspecialidad: string;
  activo: boolean;
}
