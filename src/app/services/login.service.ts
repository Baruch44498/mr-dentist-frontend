import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login';
import { envoriment } from '../../env/envoriment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);
  private env = new envoriment();
  private apiUrl = `${this.env.apiUrl}/auth/login`;

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap(response => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.rol?.toUpperCase() || '');
          localStorage.setItem('userName', response.nombreCompleto || response.username || '');
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    if (typeof window === 'undefined') return null;
    // Primero intentamos desde localStorage (fuente directa del backend)
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) return storedRole;
    // Fallback: decodificar JWT
    return this.getDecodedToken()?.role || this.getDecodedToken()?.rol || null;
  }

  getUserName(): string | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('userName');
    if (stored) return stored;
    const payload = this.getDecodedToken();
    return payload?.nombre || payload?.sub || payload?.username || null;
  }

  getUserEmail(): string | null {
    if (typeof window === 'undefined') return null;
    const payload = this.getDecodedToken();
    return payload?.correo || payload?.email || payload?.sub || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getDecodedToken(): any {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
