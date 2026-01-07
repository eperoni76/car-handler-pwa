import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../../model/car';
import { Tagliando } from '../../../model/tagliando';

@Component({
  selector: 'app-sezione-tagliandi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sezione-tagliandi.html',
  styleUrl: './sezione-tagliandi.scss',
})
export class SezioneTagliandi {
  @Input() car!: Car;
  @Output() carUpdated = new EventEmitter<Car>();

  tagliandiOpen = signal(false);
  showNewTagliandoForm = signal(false);
  newTagliando: Tagliando = this.getEmptyTagliando();

  toggleTagliandi() {
    this.tagliandiOpen.set(!this.tagliandiOpen());
  }

  toggleNewTagliandoForm() {
    this.showNewTagliandoForm.set(!this.showNewTagliandoForm());
    if (!this.showNewTagliandoForm()) {
      this.newTagliando = this.getEmptyTagliando();
    }
  }

  getTagliandiOrdinati(): Tagliando[] {
    if (!this.car.tagliandi || this.car.tagliandi.length === 0) {
      return [];
    }
    return [...this.car.tagliandi]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  addTagliando() {
    if (!this.newTagliando.data || !this.newTagliando.chilometraggio) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const tagliandoToAdd: Tagliando = {
      id: Date.now().toString(),
      data: this.newTagliando.data,
      chilometraggio: this.newTagliando.chilometraggio,
      descrizione: this.newTagliando.descrizione?.toUpperCase() || '',
      costo: this.newTagliando.costo
    };

    if (!this.car.tagliandi) {
      this.car.tagliandi = [];
    }

    this.car.tagliandi.push(tagliandoToAdd);
    this.carUpdated.emit(this.car);
    this.toggleNewTagliandoForm();
  }

  deleteTagliando(id: string) {
    if (confirm('Sei sicuro di voler eliminare questo tagliando?')) {
      this.car.tagliandi = this.car.tagliandi?.filter(t => t.id !== id);
      this.carUpdated.emit(this.car);
    }
  }

  getEmptyTagliando(): Tagliando {
    return {
      id: '',
      data: new Date(),
      chilometraggio: 0,
      descrizione: '',
      costo: 0
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
