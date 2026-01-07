import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../../model/car';
import { Manutenzione } from '../../../model/manutenzione';

@Component({
  selector: 'app-sezione-manutenzione',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sezione-manutenzione.html',
  styleUrl: './sezione-manutenzione.scss',
})
export class SezioneManutenzione {
  @Input() car!: Car;
  @Output() carUpdated = new EventEmitter<Car>();

  manutenzioneOpen = signal(false);
  showNewManutenzioneForm = signal(false);
  newManutenzione: Manutenzione = this.getEmptyManutenzione();
  editingManutenzioneId: string | null = null;
  editManutenzione: Manutenzione | null = null;

  toggleManutenzione() {
    this.manutenzioneOpen.set(!this.manutenzioneOpen());
  }

  toggleNewManutenzioneForm() {
    this.showNewManutenzioneForm.set(!this.showNewManutenzioneForm());
    if (!this.showNewManutenzioneForm()) {
      this.newManutenzione = this.getEmptyManutenzione();
    }
  }

  getManutenzioniOrdinate(): Manutenzione[] {
    if (!this.car.manutenzioni || this.car.manutenzioni.length === 0) {
      return [];
    }
    return [...this.car.manutenzioni]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  addManutenzione() {
    if (!this.newManutenzione.data || !this.newManutenzione.chilometraggio || !this.newManutenzione.tipologia) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const manutenzioneToAdd: Manutenzione = {
      id: Date.now().toString(),
      data: this.newManutenzione.data,
      chilometraggio: this.newManutenzione.chilometraggio,
      descrizione: this.newManutenzione.descrizione?.toUpperCase() || '',
      costo: this.newManutenzione.costo,
      tipologia: this.newManutenzione.tipologia
    };

    if (!this.car.manutenzioni) {
      this.car.manutenzioni = [];
    }

    this.car.manutenzioni.push(manutenzioneToAdd);
    this.carUpdated.emit(this.car);
    this.toggleNewManutenzioneForm();
  }

  deleteManutenzione(id: string) {
    if (confirm('Sei sicuro di voler eliminare questa manutenzione?')) {
      this.car.manutenzioni = this.car.manutenzioni?.filter(t => t.id !== id);
      this.carUpdated.emit(this.car);
    }
  }

  startEditManutenzione(manutenzione: Manutenzione) {
    this.editingManutenzioneId = manutenzione.id;
    this.editManutenzione = { ...manutenzione };
  }

  cancelEditManutenzione() {
    this.editingManutenzioneId = null;
    this.editManutenzione = null;
  }

  saveEditManutenzione() {
    if (!this.editManutenzione || !this.editManutenzione.data || !this.editManutenzione.chilometraggio || !this.editManutenzione.tipologia) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const index = this.car.manutenzioni?.findIndex(t => t.id === this.editingManutenzioneId);
    if (index !== undefined && index !== -1 && this.car.manutenzioni) {
      this.car.manutenzioni[index] = {
        ...this.editManutenzione,
        descrizione: this.editManutenzione.descrizione?.toUpperCase() || ''
      };
      this.carUpdated.emit(this.car);
      this.cancelEditManutenzione();
    }
  }

  getEmptyManutenzione(): Manutenzione {
    return {
      id: '',
      data: new Date(),
      chilometraggio: 0,
      descrizione: '',
      costo: 0,
      tipologia: 'ordinaria'
    };
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
