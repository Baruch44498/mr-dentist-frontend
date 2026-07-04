export interface EspecialidadRequest {
  nombre: string;
  descripcion: string;
}

export interface EspecialidadResponse {
  idEspecialidad: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
}
