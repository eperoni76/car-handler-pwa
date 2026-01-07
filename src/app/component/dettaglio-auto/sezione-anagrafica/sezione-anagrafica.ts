import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../../model/car';
import { Utente } from '../../../model/utente';

@Component({
  selector: 'app-sezione-anagrafica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sezione-anagrafica.html',
  styleUrl: './sezione-anagrafica.scss',
})
export class SezioneAnagrafica {
  @Input() car!: Car;
  @Input() proprietario!: Utente;
  @Output() carUpdated = new EventEmitter<Car>();

  anagraficaOpen = signal(false);
  editMode = signal(false);
  originalCar: Car | null = null;

  toggleAnagrafica() {
    this.anagraficaOpen.set(!this.anagraficaOpen());
  }

  toggleEditMode() {
    if (!this.editMode()) {
      this.originalCar = JSON.parse(JSON.stringify(this.car));
    }
    this.editMode.set(!this.editMode());
  }

  saveChanges() {
    this.carUpdated.emit(this.car);
    this.editMode.set(false);
    this.originalCar = null;
  }

  cancelEdit() {
    if (this.originalCar) {
      Object.assign(this.car, this.originalCar);
    }
    this.editMode.set(false);
    this.originalCar = null;
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '-';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);
  }
}
