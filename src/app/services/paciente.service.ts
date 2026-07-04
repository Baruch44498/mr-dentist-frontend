import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PacienteRequest, PacienteResponse } from '../models/paciente';
import { envoriment } from '../../env/envoriment';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private env = new envoriment();
  private apiUrl = `${this.env.apiUrl}/admin/pacientes`;

  getAll(): Observable<PacienteResponse[]> {
    return this.http.get<PacienteResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.apiUrl}/${id}`);
  }

  crear(dto: PacienteRequest): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: PacienteRequest): Observable<PacienteResponse> {
    return this.http.put<PacienteResponse>(`${this.apiUrl}/${id}`, dto);
  }

  toggleActivo(id: number): Observable<PacienteResponse> {
    return this.http.patch<PacienteResponse>(`${this.apiUrl}/${id}/toggle`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Legacy compat
  getPacientes(): Observable<PacienteResponse[]> { return this.getAll(); }
}
