import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EspecialidadRequest, EspecialidadResponse } from '../models/especialidad';
import { envoriment } from '../../env/envoriment';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private http = inject(HttpClient);
  private env = new envoriment();
  private apiUrl = `${this.env.apiUrl}/admin/especialidades`;

  getAll(): Observable<EspecialidadResponse[]> {
    return this.http.get<EspecialidadResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<EspecialidadResponse> {
    return this.http.get<EspecialidadResponse>(`${this.apiUrl}/${id}`);
  }

  crear(dto: EspecialidadRequest): Observable<EspecialidadResponse> {
    return this.http.post<EspecialidadResponse>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: EspecialidadRequest): Observable<EspecialidadResponse> {
    return this.http.put<EspecialidadResponse>(`${this.apiUrl}/${id}`, dto);
  }

  toggleActiva(id: number): Observable<EspecialidadResponse> {
    return this.http.patch<EspecialidadResponse>(`${this.apiUrl}/${id}/toggle`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Legacy compat
  getEspecialidades(): Observable<EspecialidadResponse[]> { return this.getAll(); }
}
