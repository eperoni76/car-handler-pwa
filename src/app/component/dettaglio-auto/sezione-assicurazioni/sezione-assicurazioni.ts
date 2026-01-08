import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../../model/car';
import { Assicurazione } from '../../../model/assicurazione';
import { StorageService } from '../../../service/storage.service';

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

  private storageService = inject(StorageService);

  assicurazioniOpen = signal(false);
  showNewAssicurazioneForm = signal(false);
  newAssicurazione: Assicurazione = this.getEmptyAssicurazione();
  copertureInput: string = '';
  editingAssicurazioneId: string | null = null;
  editAssicurazione: Assicurazione | null = null;
  editCopertureInput: string = '';
  selectedFile = signal<File | null>(null);
  editSelectedFile = signal<File | null>(null);
  uploadingFile = signal(false);

  toggleAssicurazioni() {
    this.assicurazioniOpen.set(!this.assicurazioniOpen());
  }

  toggleNewAssicurazioneForm() {
    this.showNewAssicurazioneForm.set(!this.showNewAssicurazioneForm());
    if (!this.showNewAssicurazioneForm()) {
      this.newAssicurazione = this.getEmptyAssicurazione();
      this.copertureInput = '';
      this.selectedFile.set(null);
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

  async addAssicurazione() {
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

    // Upload del file se presente
    if (this.selectedFile()) {
      this.uploadingFile.set(true);
      try {
        const path = this.storageService.getAssicurazionePath(
          this.car.targa,
          assicurazioneToAdd.id,
          this.selectedFile()!.name
        );
        
        const url = await this.storageService.uploadFile(this.selectedFile()!, path);
        
        assicurazioneToAdd.documento = {
          nome: this.selectedFile()!.name,
          url: url,
          dimensione: this.selectedFile()!.size,
          dataCaricamento: new Date()
        };
      } catch (error) {
        console.error('Errore durante l\'upload del file:', error);
        alert('Errore durante il caricamento del file. L\'assicurazione verrà salvata senza documento.');
      } finally {
        this.uploadingFile.set(false);
      }
    }

    this.car.assicurazioni.push(assicurazioneToAdd);
    this.carUpdated.emit(this.car);
    this.toggleNewAssicurazioneForm();
  }

  async deleteAssicurazione(id: string) {
    if (confirm('Sei sicuro di voler eliminare questa assicurazione?')) {
      const assicurazione = this.car.assicurazioni?.find(a => a.id === id);
      
      // Elimina il documento se presente
      if (assicurazione?.documento?.url) {
        try {
          const path = this.storageService.getPathFromUrl(assicurazione.documento.url);
          await this.storageService.deleteFile(path);
        } catch (error) {
          console.error('Errore durante l\'eliminazione del file:', error);
        }
      }
      
      this.car.assicurazioni = this.car.assicurazioni?.filter(a => a.id !== id);
      this.carUpdated.emit(this.car);
    }
  }

  startEditAssicurazione(assicurazione: Assicurazione) {
    this.editingAssicurazioneId = assicurazione.id;
    this.editAssicurazione = { ...assicurazione };
    this.editCopertureInput = assicurazione.coperture ? assicurazione.coperture.join(', ') : '';
    this.editSelectedFile.set(null);
  }

  cancelEdit() {
    this.editingAssicurazioneId = null;
    this.editAssicurazione = null;
    this.editCopertureInput = '';
    this.editSelectedFile.set(null);
  }

  async saveEditAssicurazione() {
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
      const updatedAssicurazione: Assicurazione = {
        ...this.editAssicurazione,
        compagnia: this.editAssicurazione.compagnia.toUpperCase(),
        numeroPolizza: this.editAssicurazione.numeroPolizza.toUpperCase(),
        coperture: coperture
      };

      // Upload del nuovo file se presente
      if (this.editSelectedFile()) {
        this.uploadingFile.set(true);
        try {
          // Elimina il vecchio file se presente
          if (updatedAssicurazione.documento?.url) {
            const oldPath = this.storageService.getPathFromUrl(updatedAssicurazione.documento.url);
            await this.storageService.deleteFile(oldPath);
          }

          // Upload del nuovo file
          const path = this.storageService.getAssicurazionePath(
            this.car.targa,
            updatedAssicurazione.id,
            this.editSelectedFile()!.name
          );
          
          const url = await this.storageService.uploadFile(this.editSelectedFile()!, path);
          
          updatedAssicurazione.documento = {
            nome: this.editSelectedFile()!.name,
            url: url,
            dimensione: this.editSelectedFile()!.size,
            dataCaricamento: new Date()
          };
        } catch (error) {
          console.error('Errore durante l\'upload del file:', error);
          alert('Errore durante il caricamento del file. Le modifiche verranno salvate senza cambiare il documento.');
        } finally {
          this.uploadingFile.set(false);
        }
      }

      this.car.assicurazioni[index] = updatedAssicurazione;
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validazione dimensione file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Il file è troppo grande. Dimensione massima consentita: 5MB');
        input.value = '';
        return;
      }
      this.selectedFile.set(file);
    }
  }

  onEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validazione dimensione file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Il file è troppo grande. Dimensione massima consentita: 5MB');
        input.value = '';
        return;
      }
      this.editSelectedFile.set(file);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDocumentDate(date: Date | any): string {
    if (!date) return '-';
    // Se è un timestamp di Firestore, convertilo
    if (date.toDate && typeof date.toDate === 'function') {
      const d = date.toDate();
      return d.toLocaleDateString('it-IT') + ' alle ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
    // Se è già un oggetto Date
    if (date instanceof Date) {
      return date.toLocaleDateString('it-IT') + ' alle ' + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
    // Se è una stringa o numero, prova a convertirlo
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('it-IT') + ' alle ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  }
}
