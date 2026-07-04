export interface PacienteRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string;
  correo: string;
  password: string;
  fechaNacimiento?: string | null;
}

export interface PacienteResponse {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  correo: string;
  fechaRegistro: string;
  activo: boolean;
}