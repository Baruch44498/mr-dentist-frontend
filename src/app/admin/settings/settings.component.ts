import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Form fields
  clinicName = signal<string>('');
  clinicSubtitle = signal<string>('');
  clinicPhone = signal<string>('');
  clinicAddress = signal<string>('');
  clinicEmail = signal<string>('');
  showLogo = signal<boolean>(true);

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.cargarConfiguraciones();
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  cargarConfiguraciones() {
    this.isLoading.set(true);
    if (typeof window !== 'undefined') {
      this.clinicName.set(localStorage.getItem('clinicName') || 'MR DENTIST');
      this.clinicSubtitle.set(localStorage.getItem('clinicSubtitle') || 'Centro Odontológico');
      this.clinicPhone.set(localStorage.getItem('clinicPhone') || '+51 987 654 321');
      this.clinicAddress.set(localStorage.getItem('clinicAddress') || 'Av. Larco 123, Miraflores');
      this.clinicEmail.set(localStorage.getItem('clinicEmail') || 'contacto@mrdentist.com');
      this.showLogo.set(localStorage.getItem('clinicShowLogo') !== 'false');
    }
    this.isLoading.set(false);
  }

  guardarConfiguraciones() {
    if (!this.clinicName().trim() || !this.clinicSubtitle().trim()) {
      this.showToast('El nombre de la clínica y el subtítulo son obligatorios.', 'error');
      return;
    }

    this.isSaving.set(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('clinicName', this.clinicName().trim());
      localStorage.setItem('clinicSubtitle', this.clinicSubtitle().trim());
      localStorage.setItem('clinicPhone', this.clinicPhone().trim());
      localStorage.setItem('clinicAddress', this.clinicAddress().trim());
      localStorage.setItem('clinicEmail', this.clinicEmail().trim());
      localStorage.setItem('clinicShowLogo', String(this.showLogo()));
    }

    setTimeout(() => {
      this.isSaving.set(false);
      this.showToast('Configuraciones guardadas exitosamente.', 'success');
    }, 500);
  }
}
