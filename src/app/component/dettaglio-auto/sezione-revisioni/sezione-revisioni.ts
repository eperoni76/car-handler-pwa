import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../../model/car';
import { Revisione } from '../../../model/revisione';

@Component({
  selector: 'app-sezione-revisioni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sezione-revisioni.html',
  styleUrl: './sezione-revisioni.scss',
})
export class SezioneRevisioni {
  @Input() car!: Car;
  @Output() carUpdated = new EventEmitter<Car>();

  revisioniOpen = signal(false);
  showNewRevisioneForm = signal(false);
  newRevisione: Revisione = this.getEmptyRevisione();
  editingRevisioneId: string | null = null;
  editRevisione: Revisione | null = null;

  toggleRevisioni() {
    this.revisioniOpen.set(!this.revisioniOpen());
  }

  toggleNewRevisioneForm() {
    this.showNewRevisioneForm.set(!this.showNewRevisioneForm());
    if (!this.showNewRevisioneForm()) {
      this.newRevisione = this.getEmptyRevisione();
    }
  }

  getRevisioniOrdinate(): Revisione[] {
    if (!this.car.revisioni || this.car.revisioni.length === 0) {
      return [];
    }
    return [...this.car.revisioni]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  getDataProssimaRevisione(): Date | null {
    if (!this.car.dataDiAcquisto) {
      return null;
    }

    const dataAcquisto = new Date(this.car.dataDiAcquisto);
    const oggi = new Date();
    
    const anniDallaAcquisto = (oggi.getTime() - dataAcquisto.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (anniDallaAcquisto < 4) {
      const primaRevisione = new Date(dataAcquisto);
      primaRevisione.setFullYear(primaRevisione.getFullYear() + 4);
      return primaRevisione;
    }
    
    const revisioni = this.getRevisioniOrdinate();
    if (revisioni.length === 0) {
      const primaRevisione = new Date(dataAcquisto);
      primaRevisione.setFullYear(primaRevisione.getFullYear() + 4);
      return primaRevisione;
    }
    
    const ultimaRevisione = new Date(revisioni[0].data);
    const prossimaRevisione = new Date(ultimaRevisione);
    prossimaRevisione.setFullYear(prossimaRevisione.getFullYear() + 2);
    
    return prossimaRevisione;
  }

  isRevisioneInScadenza(): boolean {
    const prossima = this.getDataProssimaRevisione();
    if (!prossima) return false;
    
    const oggi = new Date();
    const diff = prossima.getTime() - oggi.getTime();
    const giorniMancanti = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return giorniMancanti <= 30 && giorniMancanti > 0;
  }

  isRevisioneScaduta(): boolean {
    const prossima = this.getDataProssimaRevisione();
    if (!prossima) return false;
    
    const oggi = new Date();
    return prossima < oggi;
  }

  getStatoRevisione(): 'valida' | 'in_scadenza' | 'scaduta' | 'non_richiesta' {
    if (!this.car.dataDiAcquisto) {
      return 'non_richiesta';
    }

    const dataAcquisto = new Date(this.car.dataDiAcquisto);
    const oggi = new Date();
    const anniDallaAcquisto = (oggi.getTime() - dataAcquisto.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (anniDallaAcquisto < 4) {
      return 'non_richiesta';
    }

    if (this.isRevisioneScaduta()) {
      return 'scaduta';
    }

    if (this.isRevisioneInScadenza()) {
      return 'in_scadenza';
    }

    return 'valida';
  }

  addRevisione() {
    if (!this.newRevisione.data || !this.newRevisione.chilometraggio || !this.newRevisione.esito) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const revisioneToAdd: Revisione = {
      id: Date.now().toString(),
      data: this.newRevisione.data,
      chilometraggio: this.newRevisione.chilometraggio,
      esito: this.newRevisione.esito,
      note: this.newRevisione.note?.toUpperCase()
    };

    if (!this.car.revisioni) {
      this.car.revisioni = [];
    }

    this.car.revisioni.push(revisioneToAdd);
    this.carUpdated.emit(this.car);
    this.toggleNewRevisioneForm();
  }

  deleteRevisione(id: string) {
    if (confirm('Sei sicuro di voler eliminare questa revisione?')) {
      this.car.revisioni = this.car.revisioni?.filter(r => r.id !== id);
      this.carUpdated.emit(this.car);
    }
  }

  startEditRevisione(revisione: Revisione) {
    this.editingRevisioneId = revisione.id;
    this.editRevisione = { ...revisione };
  }

  cancelEditRevisione() {
    this.editingRevisioneId = null;
    this.editRevisione = null;
  }

  saveEditRevisione() {
    if (!this.editRevisione || !this.editRevisione.data || !this.editRevisione.chilometraggio || !this.editRevisione.esito) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const index = this.car.revisioni?.findIndex(r => r.id === this.editingRevisioneId);
    if (index !== undefined && index !== -1 && this.car.revisioni) {
      this.car.revisioni[index] = {
        ...this.editRevisione,
        note: this.editRevisione.note?.toUpperCase()
      };
      this.carUpdated.emit(this.car);
      this.cancelEditRevisione();
    }
  }

  getEmptyRevisione(): Revisione {
    return {
      id: '',
      data: new Date(),
      chilometraggio: 0,
      esito: 'positiva',
      note: ''
    };
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  }
}
