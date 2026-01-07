import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  isRegisterMode = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  readonly currentYear = new Date().getFullYear();

  // Dati form
  nome = '';
  cognome = '';
  codiceFiscale = '';

  toggleMode() {
    this.isRegisterMode.update(val => !val);
    this.clearMessages();
    // Reset form
    this.nome = '';
    this.cognome = '';
    this.codiceFiscale = '';
  }

  onSubmit() {
    this.clearMessages();

    // Validazione base
    if (!this.codiceFiscale.trim()) {
      this.errorMessage.set('Inserisci il codice fiscale.');
      return;
    }

    if (this.codiceFiscale.length !== 16) {
      this.errorMessage.set('Il codice fiscale deve essere di 16 caratteri.');
      return;
    }

    // Validazione per registrazione
    if (this.isRegisterMode()) {
      if (!this.nome.trim() || !this.cognome.trim()) {
        this.errorMessage.set('Inserisci nome e cognome.');
        return;
      }
    }

    this.isLoading.set(true);

    if (this.isRegisterMode()) {
      this.handleRegister();
    } else {
      this.handleLogin();
    }
  }

  private handleLogin() {
    this.authService.loginByCodiceFiscale(this.codiceFiscale.toUpperCase()).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        if (result.success) {
          this.successMessage.set('Login effettuato con successo!');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 500);
        } else {
          this.errorMessage.set(result.message || 'Errore durante il login.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Errore durante il login. Riprova.');
        console.error('Errore login:', error);
      }
    });
  }

  private handleRegister() {
    const userData = {
      nome: this.nome.trim().toUpperCase(),
      cognome: this.cognome.trim().toUpperCase(),
      codiceFiscale: this.codiceFiscale.trim().toUpperCase(),
      email: '', // Non richiesto
      dataDiNascita: new Date(), // Default
      annoConseguimentoPatente: this.currentYear
    };

    this.authService.register(userData).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        if (result.success) {
          this.successMessage.set('Registrazione completata! Accesso in corso...');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        } else {
          this.errorMessage.set(result.message || 'Errore durante la registrazione.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Errore durante la registrazione. Riprova.');
        console.error('Errore registrazione:', error);
      }
    });
  }

  private clearMessages() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
