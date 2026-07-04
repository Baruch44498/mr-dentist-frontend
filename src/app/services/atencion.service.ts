import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtencionRequest, AtencionResponse } from '../models/atencion';
import { envoriment } from '../../env/envoriment';

@Injectable({
  providedIn: 'root'
})
export class AtencionService {
  private http = inject(HttpClient);
  private env = new envoriment();
  private apiUrl = `${this.env.apiUrl}/atenciones`;

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Registrar atención clínica y receta médica
  registrarAtencion(atencion: AtencionRequest): Observable<AtencionResponse> {
    return this.http.post<AtencionResponse>(this.apiUrl, atencion, { headers: this.getHeaders() });
  }

  // Obtener historial clínico del paciente
  obtenerHistorialPaciente(idPaciente: number): Observable<AtencionResponse[]> {
    return this.http.get<AtencionResponse[]>(`${this.apiUrl}/paciente/${idPaciente}`, { headers: this.getHeaders() });
  }

  // Obtener historial clínico del paciente logueado
  obtenerMisAtenciones(): Observable<AtencionResponse[]> {
    return this.http.get<AtencionResponse[]>(`${this.apiUrl}/mis-atenciones`, { headers: this.getHeaders() });
  }

  // Obtener atención médica de una cita específica
  obtenerPorCita(idCita: number): Observable<AtencionResponse> {
    return this.http.get<AtencionResponse>(`${this.apiUrl}/cita/${idCita}`, { headers: this.getHeaders() });
  }
}
