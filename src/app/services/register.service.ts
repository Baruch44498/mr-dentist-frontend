import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PacienteRequest, PacienteResponse } from '../models/paciente';
import { envoriment } from '../../env/envoriment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private http = inject(HttpClient);
  private env = new envoriment();
  private apiUrl = `${this.env.apiUrl}/auth/registro-paciente`; // Endpoint correcto de registro de pacientes

  registrarPaciente(paciente: PacienteRequest): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(this.apiUrl, paciente);
  }
}

