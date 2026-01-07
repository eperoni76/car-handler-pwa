import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../../model/car';
import { Assicurazione } from '../../../model/assicurazione';

@Component({
  selector: 'app-sezione-assicurazioni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sezione-assicurazioni.html',
  styleUrl: './sezione-assicurazioni.scss',
})
export class SezioneAssicurazioni {
  @Input() car!: Car;
  @Output() carUpdated = new EventEmitter<Car>();

  assicurazioniOpen = signal(false);
  showNewAssicurazioneForm = signal(false);
  newAssicurazione: Assicurazione = this.getEmptyAssicurazione();
  copertureInput: string = '';
  editingAssicurazioneId: string | null = null;
  editAssicurazione: Assicurazione | null = null;
  editCopertureInput: string = '';

  toggleAssicurazioni() {
    this.assicurazioniOpen.set(!this.assicurazioniOpen());
  }

  toggleNewAssicurazioneForm() {
    this.showNewAssicurazioneForm.set(!this.showNewAssicurazioneForm());
    if (!this.showNewAssicurazioneForm()) {
      this.newAssicurazione = this.getEmptyAssicurazione();
      this.copertureInput = '';
    }
  }

  getAssicurazioneAttiva(): Assicurazione | null {
    if (!this.car.assicurazioni || this.car.assicurazioni.length === 0) {
      return null;
    }

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const attiva = this.car.assicurazioni.find(ass => {
      const inizio = new Date(ass.dataInizio);
      const fine = new Date(ass.dataFine);
      inizio.setHours(0, 0, 0, 0);
      fine.setHours(0, 0, 0, 0);
      return inizio <= oggi && fine >= oggi;
    });

    return attiva || null;
  }

  getStoricoAssicurazioni(): Assicurazione[] {
    if (!this.car.assicurazioni || this.car.assicurazioni.length === 0) {
      return [];
    }

    const assicurazioneAttiva = this.getAssicurazioneAttiva();
    
    return [...this.car.assicurazioni]
      .filter(ass => !assicurazioneAttiva || ass.id !== assicurazioneAttiva.id)
      .sort((a, b) => new Date(b.dataInizio).getTime() - new Date(a.dataInizio).getTime());
  }

  isAssicurazioneInScadenza(dataFine: Date): boolean {
    const oggi = new Date();
    const fine = new Date(dataFine);
    const diff = fine.getTime() - oggi.getTime();
    const giorniMancanti = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return giorniMancanti <= 30 && giorniMancanti >= 0;
  }

  isAssicurazioneScaduta(dataFine: Date): boolean {
    const oggi = new Date();
    const fine = new Date(dataFine);
    return fine < oggi;
  }

  addAssicurazione() {
    if (!this.newAssicurazione.compagnia || !this.newAssicurazione.numeroPolizza ||
        !this.newAssicurazione.dataInizio || !this.newAssicurazione.dataFine) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const inizio = new Date(this.newAssicurazione.dataInizio);
    const fine = new Date(this.newAssicurazione.dataFine);

    if (fine <= inizio) {
      alert('La data di fine deve essere successiva alla data di inizio');
      return;
    }

    if (this.car.assicurazioni) {
      for (const ass of this.car.assicurazioni) {
        const existingInizio = new Date(ass.dataInizio);
        const existingFine = new Date(ass.dataFine);

        if ((inizio >= existingInizio && inizio <= existingFine) ||
            (fine >= existingInizio && fine <= existingFine) ||
            (inizio <= existingInizio && fine >= existingFine)) {
          alert('Le date si sovrappongono con un\'altra assicurazione esistente');
          return;
        }
      }
    }

    // Processa le coperture dall'input separato da virgole
    const coperture = this.copertureInput
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length > 0);

    const assicurazioneToAdd: Assicurazione = {
      id: Date.now().toString(),
      compagnia: this.newAssicurazione.compagnia.toUpperCase(),
      numeroPolizza: this.newAssicurazione.numeroPolizza.toUpperCase(),
      dataInizio: this.newAssicurazione.dataInizio,
      dataFine: this.newAssicurazione.dataFine,
      costoAnnuale: this.newAssicurazione.costoAnnuale || 0,
      coperture: coperture
    };

    if (!this.car.assicurazioni) {
      this.car.assicurazioni = [];
    }

    this.car.assicurazioni.push(assicurazioneToAdd);
    this.carUpdated.emit(this.car);
    this.toggleNewAssicurazioneForm();
  }

  deleteAssicurazione(id: string) {
    if (confirm('Sei sicuro di voler eliminare questa assicurazione?')) {
      this.car.assicurazioni = this.car.assicurazioni?.filter(a => a.id !== id);
      this.carUpdated.emit(this.car);
    }
  }

  startEditAssicurazione(assicurazione: Assicurazione) {
    this.editingAssicurazioneId = assicurazione.id;
    this.editAssicurazione = { ...assicurazione };
    this.editCopertureInput = assicurazione.coperture ? assicurazione.coperture.join(', ') : '';
  }

  cancelEdit() {
    this.editingAssicurazioneId = null;
    this.editAssicurazione = null;
    this.editCopertureInput = '';
  }

  saveEditAssicurazione() {
    if (!this.editAssicurazione || !this.editAssicurazione.compagnia || !this.editAssicurazione.numeroPolizza ||
        !this.editAssicurazione.dataInizio || !this.editAssicurazione.dataFine) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const inizio = new Date(this.editAssicurazione.dataInizio);
    const fine = new Date(this.editAssicurazione.dataFine);

    if (fine <= inizio) {
      alert('La data di fine deve essere successiva alla data di inizio');
      return;
    }

    // Processa le coperture dall'input separato da virgole
    const coperture = this.editCopertureInput
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => c.length > 0);

    const index = this.car.assicurazioni?.findIndex(a => a.id === this.editingAssicurazioneId);
    if (index !== undefined && index !== -1 && this.car.assicurazioni) {
      this.car.assicurazioni[index] = {
        ...this.editAssicurazione,
        compagnia: this.editAssicurazione.compagnia.toUpperCase(),
        numeroPolizza: this.editAssicurazione.numeroPolizza.toUpperCase(),
        coperture: coperture
      };
      this.carUpdated.emit(this.car);
      this.cancelEdit();
    }
  }

  getEmptyAssicurazione(): Assicurazione {
    return {
      id: '',
      compagnia: '',
      numeroPolizza: '',
      dataInizio: new Date(),
      dataFine: new Date(),
      costoAnnuale: 0,
      coperture: []
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
