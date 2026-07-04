import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaRequest, CitaResponse, PostergarCitaRequest } from '../models/cita';
import { envoriment } from '../../env/envoriment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private http = inject(HttpClient);
  private env = new envoriment();
  private apiUrl = `${this.env.apiUrl}/citas`;

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Reservar cita como paciente
  reservarCitaPaciente(cita: CitaRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(`${this.apiUrl}/paciente`, cita, { headers: this.getHeaders() });
  }

  // Reservar cita como administrador
  reservarCitaComoAdmin(idPaciente: number, cita: CitaRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(`${this.apiUrl}/admin`, cita, {
      params: { idPaciente: idPaciente.toString() },
      headers: this.getHeaders()
    });
  }

  // Listar citas del paciente logueado
  listarMisCitasComoPaciente(): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.apiUrl}/paciente`, { headers: this.getHeaders() });
  }

  // Listar citas del médico logueado
  listarMisCitasComoMedico(): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.apiUrl}/medico`, { headers: this.getHeaders() });
  }

  // Cancelar cita
  cancelarCita(id: number): Observable<CitaResponse> {
    return this.http.patch<CitaResponse>(`${this.apiUrl}/${id}/cancelar`, {}, { headers: this.getHeaders() });
  }

  // Reprogramar / Postergar cita
  postergarCita(id: number, req: PostergarCitaRequest): Observable<CitaResponse> {
    return this.http.patch<CitaResponse>(`${this.apiUrl}/${id}/postergar`, req, { headers: this.getHeaders() });
  }

  // Obtener pacientes únicos asociados a este médico
  listarPacientesDeMedico(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/medico/pacientes`, { headers: this.getHeaders() });
  }

  // Obtener el historial de citas de un paciente con este médico
  listarHistorialCitasPacienteConMedico(idPaciente: number): Observable<CitaResponse[]> {
    return this.http.get<CitaResponse[]>(`${this.apiUrl}/medico/pacientes/${idPaciente}/historial`, { headers: this.getHeaders() });
  }
}

