export interface DetalleRecetaRequest {
  medicamento: string;
  dosis: string;
  frecuencia: string;
}

export interface RecetaRequest {
  indicacionesGenerales: string;
  detalles: DetalleRecetaRequest[];
}

export interface AtencionRequest {
  idCita: number;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
  receta?: RecetaRequest | null;
}

export interface DetalleRecetaResponse {
  idDetalle: number;
  medicamento: string;
  dosis: string;
  frecuencia: string;
}

export interface RecetaResponse {
  idReceta: number;
  indicacionesGenerales: string;
  detalles: DetalleRecetaResponse[];
}

export interface AtencionResponse {
  idAtencion: number;
  fechaAtencion: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  idCita: number;
  idPaciente: number;
  pacienteNombre: string;
  pacienteDni: string;
  medicoNombre: string;
  medicoCop: string;
  receta?: RecetaResponse | null;
}
