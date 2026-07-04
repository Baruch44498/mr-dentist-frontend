import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicoRequest, MedicoResponse } from '../models/medico';
import { envoriment } from '../../env/envoriment';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private http = inject(HttpClient);
  private env = new envoriment();
  private apiUrl = `${this.env.apiUrl}/admin/medicos`;

  getAll(): Observable<MedicoResponse[]> {
    return this.http.get<MedicoResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<MedicoResponse> {
    return this.http.get<MedicoResponse>(`${this.apiUrl}/${id}`);
  }

  crear(dto: MedicoRequest): Observable<MedicoResponse> {
    return this.http.post<MedicoResponse>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: MedicoRequest): Observable<MedicoResponse> {
    return this.http.put<MedicoResponse>(`${this.apiUrl}/${id}`, dto);
  }

  toggleActivo(id: number): Observable<MedicoResponse> {
    return this.http.patch<MedicoResponse>(`${this.apiUrl}/${id}/toggle`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Legacy compat
  getMedicos(): Observable<MedicoResponse[]> { return this.getAll(); }
}
