import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HorarioMedicoRequest, HorarioMedicoResponse, SlotDisponible } from '../models/horario';
import { envoriment } from '../../env/envoriment';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private http = inject(HttpClient);
  private env = new envoriment();
  private apiUrl = `${this.env.apiUrl}/medico/horarios`;

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  crearHorario(horario: HorarioMedicoRequest): Observable<HorarioMedicoResponse> {
    return this.http.post<HorarioMedicoResponse>(this.apiUrl, horario, { headers: this.getHeaders() });
  }

  listarMisHorarios(): Observable<HorarioMedicoResponse[]> {
    return this.http.get<HorarioMedicoResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  eliminarHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  toggleActivo(id: number): Observable<HorarioMedicoResponse> {
    return this.http.patch<HorarioMedicoResponse>(`${this.apiUrl}/${id}/toggle`, {}, { headers: this.getHeaders() });
  }

  // Obtener slots disponibles (público)
  getSlotsDisponibles(idMedico: number, fecha: string): Observable<SlotDisponible[]> {
    return this.http.get<SlotDisponible[]>(`${this.apiUrl}/slots`, {
      params: { idMedico: idMedico.toString(), fecha },
      headers: this.getHeaders()
    });
  }
}
