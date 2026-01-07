import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CarService } from '../../service/car.service';
import { Car } from '../../model/car';

@Component({
  selector: 'app-nuova-auto',
  imports: [FormsModule, CommonModule],
  templateUrl: './nuova-auto.html',
  styleUrl: './nuova-auto.scss',
})
export class NuovaAuto {
  private authService = inject(AuthService);
  private carService = inject(CarService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isSaving = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  readonly currentYear = new Date().getFullYear();

  // Dati form
  targa = '';
  marca = '';
  modello = '';
  anno = this.currentYear;
  colore = '';
  prezzoDiAcquisto = 0;
  dataDiAcquisto = '';

  onSubmit() {
    this.clearMessages();

    const user = this.currentUser();
    if (!user) {
      this.errorMessage.set('Utente non autenticato.');
      return;
    }

    // Validazione base
    if (!this.targa.trim() || !this.marca.trim() || !this.modello.trim() || !this.dataDiAcquisto) {
      this.errorMessage.set('Compila tutti i campi obbligatori.');
      return;
    }

    if (this.targa.length < 6 || this.targa.length > 10) {
      this.errorMessage.set('La targa deve essere tra 6 e 10 caratteri.');
      return;
    }

    this.isSaving.set(true);

    // Verifica se la targa esiste già
    this.carService.checkTargaExists(this.targa).subscribe({
      next: (exists) => {
        if (exists) {
          this.isSaving.set(false);
          this.errorMessage.set('Targa già esistente.');
          return;
        }

        // Crea l'auto
        const newCar: Car = {
          targa: this.targa.trim().toUpperCase(),
          marca: this.marca.trim().toUpperCase(),
          modello: this.modello.trim().toUpperCase(),
          anno: this.anno,
          colore: this.colore.trim().toUpperCase(),
          prezzoDiAcquisto: this.prezzoDiAcquisto,
          dataDiAcquisto: new Date(this.dataDiAcquisto),
          proprietario: user,
          coProprietari: [],
          tagliandi: [],
          revisioni: []
        };

        this.carService.create(newCar).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.successMessage.set('Auto aggiunta con successo!');
            setTimeout(() => {
              this.router.navigate(['/elenco-auto']);
            }, 1500);
          },
          error: (error) => {
            this.isSaving.set(false);
            this.errorMessage.set('Errore durante il salvataggio. Riprova.');
            console.error('Errore salvataggio auto:', error);
          }
        });
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set('Errore durante la verifica. Riprova.');
        console.error('Errore verifica targa:', error);
      }
    });
  }

  resetForm() {
    this.targa = '';
    this.marca = '';
    this.modello = '';
    this.anno = this.currentYear;
    this.colore = '';
    this.prezzoDiAcquisto = 0;
    this.dataDiAcquisto = '';
    this.clearMessages();
  }

  private clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
