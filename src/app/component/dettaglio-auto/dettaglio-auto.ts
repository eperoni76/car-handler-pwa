import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../service/car.service';
import { UserService } from '../../service/user.service';
import { Car } from '../../model/car';
import { Assicurazione } from '../../model/assicurazione';
import { Utente } from '../../model/utente';
import { Tagliando } from '../../model/tagliando';

@Component({
  selector: 'app-dettaglio-auto',
  imports: [CommonModule, FormsModule],
  templateUrl: './dettaglio-auto.html',
  styleUrl: './dettaglio-auto.scss',
})
export class DettaglioAuto implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carService = inject(CarService);
  private userService = inject(UserService);

  car = signal<Car | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Accordion state
  anagraficaOpen = signal(false);
  assicurazioniOpen = signal(false);
  coproprietariOpen = signal(false);
  tagliandiOpen = signal(false);
  
  // Edit mode per anagrafica
  editMode = signal(false);
  
  // Form nuova assicurazione
  showNewAssicurazioneForm = signal(false);
  newAssicurazione: Assicurazione = this.getEmptyAssicurazione();
  
  // Form nuovo coproprietario
  showNewCoproprietarioForm = signal(false);
  newCoproprietario = {
    nome: '',
    cognome: '',
    codiceFiscale: ''
  };
  
  // Form nuovo tagliando
  showNewTagliandoForm = signal(false);
  newTagliando: Tagliando = this.getEmptyTagliando();
  
  // Messages
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const targa = this.route.snapshot.paramMap.get('targa');
    if (!targa) {
      this.error.set('Targa non specificata');
      this.loading.set(false);
      return;
    }
    this.loadCar(targa);
  }

  loadCar(targa: string): void {
    this.carService.getByTarga(targa).subscribe({
      next: (car) => {
        if (car) {
          // Inizializza array assicurazioni se non esiste
          if (!car.assicurazioni) {
            car.assicurazioni = [];
          }
          this.car.set(car);
        } else {
          this.error.set('Auto non trovata');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento dell\'auto:', err);
        this.error.set('Errore nel caricamento dell\'auto');
        this.loading.set(false);
      }
    });
  }

  // Toggle accordion
  toggleAnagrafica(): void {
    this.anagraficaOpen.set(!this.anagraficaOpen());
  }

  toggleAssicurazioni(): void {
    this.assicurazioniOpen.set(!this.assicurazioniOpen());
  }

  toggleCoproprietari(): void {
    this.coproprietariOpen.set(!this.coproprietariOpen());
  }

  toggleTagliandi(): void {
    this.tagliandiOpen.set(!this.tagliandiOpen());
  }

  // Edit mode anagrafica
  toggleEditMode(): void {
    this.editMode.set(!this.editMode());
  }

  saveAnagrafica(): void {
    const car = this.car();
    if (!car) return;

    this.carService.update(car.targa, car).subscribe({
      next: () => {
        this.successMessage.set('Dati auto aggiornati con successo');
        this.editMode.set(false);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error('Errore nell\'aggiornamento:', err);
        this.errorMessage.set('Errore nell\'aggiornamento dei dati');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  cancelEdit(): void {
    this.editMode.set(false);
    const targa = this.route.snapshot.paramMap.get('targa');
    if (targa) {
      this.loadCar(targa);
    }
  }

  // Assicurazioni
  getAssicurazioneAttiva(): Assicurazione | null {
    const car = this.car();
    if (!car || !car.assicurazioni) return null;

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    return car.assicurazioni.find(a => {
      const dataFine = new Date(a.dataFine);
      dataFine.setHours(0, 0, 0, 0);
      return dataFine >= oggi;
    }) || null;
  }

  getStoricoAssicurazioni(): Assicurazione[] {
    const car = this.car();
    if (!car || !car.assicurazioni) return [];

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    return car.assicurazioni
      .filter(a => {
        const dataFine = new Date(a.dataFine);
        dataFine.setHours(0, 0, 0, 0);
        return dataFine < oggi;
      })
      .sort((a, b) => new Date(b.dataFine).getTime() - new Date(a.dataFine).getTime());
  }

  hasAssicurazioneAttiva(): boolean {
    return this.getAssicurazioneAttiva() !== null;
  }

  toggleNewAssicurazioneForm(): void {
    this.showNewAssicurazioneForm.set(!this.showNewAssicurazioneForm());
    if (this.showNewAssicurazioneForm()) {
      this.newAssicurazione = this.getEmptyAssicurazione();
    }
  }

  addAssicurazione(): void {
    const car = this.car();
    if (!car) return;

    // Validazione base
    if (!this.newAssicurazione.compagnia || !this.newAssicurazione.numeroPolizza ||
        !this.newAssicurazione.dataInizio || !this.newAssicurazione.dataFine ||
        !this.newAssicurazione.costoAnnuale) {
      this.errorMessage.set('Compila tutti i campi obbligatori');
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }

    const dataFine = new Date(this.newAssicurazione.dataFine);
    dataFine.setHours(0, 0, 0, 0);
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    // Se la scadenza è futura, controlla se esiste già un'assicurazione attiva
    if (dataFine >= oggi) {
      const attiva = this.getAssicurazioneAttiva();
      if (attiva) {
        this.errorMessage.set('Esiste già un\'assicurazione attiva. Elimina prima quella esistente.');
        setTimeout(() => this.errorMessage.set(null), 3000);
        return;
      }
    }

    // Genera ID univoco
    this.newAssicurazione.id = `ass_${Date.now()}`;

    // Aggiungi all'array
    if (!car.assicurazioni) {
      car.assicurazioni = [];
    }
    car.assicurazioni.push({ ...this.newAssicurazione });

    // Salva su database
    this.carService.update(car.targa, { assicurazioni: car.assicurazioni }).subscribe({
      next: () => {
        this.successMessage.set('Assicurazione aggiunta con successo');
        this.showNewAssicurazioneForm.set(false);
        this.newAssicurazione = this.getEmptyAssicurazione();
        setTimeout(() => this.successMessage.set(null), 3000);
        
        // Ricarica i dati
        this.loadCar(car.targa);
      },
      error: (err) => {
        console.error('Errore nell\'aggiunta dell\'assicurazione:', err);
        this.errorMessage.set('Errore nell\'aggiunta dell\'assicurazione');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  updateAssicurazione(assicurazione: Assicurazione): void {
    const car = this.car();
    if (!car) return;

    const index = car.assicurazioni.findIndex(a => a.id === assicurazione.id);
    if (index === -1) return;

    car.assicurazioni[index] = { ...assicurazione };

    this.carService.update(car.targa, { assicurazioni: car.assicurazioni }).subscribe({
      next: () => {
        this.successMessage.set('Assicurazione aggiornata con successo');
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadCar(car.targa);
      },
      error: (err) => {
        console.error('Errore nell\'aggiornamento dell\'assicurazione:', err);
        this.errorMessage.set('Errore nell\'aggiornamento dell\'assicurazione');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  deleteAssicurazione(assicurazioneId: string): void {
    const car = this.car();
    if (!car) return;

    if (!confirm('Sei sicuro di voler eliminare questa assicurazione?')) {
      return;
    }

    car.assicurazioni = car.assicurazioni.filter(a => a.id !== assicurazioneId);

    this.carService.update(car.targa, { assicurazioni: car.assicurazioni }).subscribe({
      next: () => {
        this.successMessage.set('Assicurazione eliminata con successo');
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadCar(car.targa);
      },
      error: (err) => {
        console.error('Errore nell\'eliminazione dell\'assicurazione:', err);
        this.errorMessage.set('Errore nell\'eliminazione dell\'assicurazione');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  // Utilities
  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '-';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);
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

  // Coproprietari
  toggleNewCoproprietarioForm(): void {
    this.showNewCoproprietarioForm.set(!this.showNewCoproprietarioForm());
    if (this.showNewCoproprietarioForm()) {
      this.newCoproprietario = { nome: '', cognome: '', codiceFiscale: '' };
    }
  }

  addCoproprietario(): void {
    const car = this.car();
    if (!car) return;

    // Validazione
    if (!this.newCoproprietario.nome || !this.newCoproprietario.cognome || !this.newCoproprietario.codiceFiscale) {
      this.errorMessage.set('Compila tutti i campi obbligatori');
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }

    const codiceFiscale = this.newCoproprietario.codiceFiscale.toUpperCase();

    // Verifica se è già coproprietario
    if (car.coProprietari.some(c => c.codiceFiscale === codiceFiscale)) {
      this.errorMessage.set('Questo utente è già un coproprietario');
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }

    // Verifica se è il proprietario
    if (car.proprietario.codiceFiscale === codiceFiscale) {
      this.errorMessage.set('Questo utente è già il proprietario dell\'auto');
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }

    // Verifica se l'utente esiste già nel database
    this.userService.getByCodiceFiscale(codiceFiscale).subscribe({
      next: (existingUser) => {
        if (existingUser) {
          // Utente esiste, aggiungilo come coproprietario
          car.coProprietari.push(existingUser);
          this.saveCoproprietari(car);
        } else {
          // Utente non esiste, crealo prima
          const newUser: Omit<Utente, 'id'> = {
            nome: this.newCoproprietario.nome.toUpperCase(),
            cognome: this.newCoproprietario.cognome.toUpperCase(),
            codiceFiscale: codiceFiscale,
            email: null,
            dataDiNascita: null,
            annoConseguimentoPatente: null
          };

          this.userService.create(newUser).subscribe({
            next: (userId) => {
              // Aggiungi il nuovo utente come coproprietario
              car.coProprietari.push({ id: userId, ...newUser });
              this.saveCoproprietari(car);
            },
            error: (err) => {
              console.error('Errore nella creazione dell\'utente:', err);
              this.errorMessage.set('Errore nella creazione dell\'utente');
              setTimeout(() => this.errorMessage.set(null), 3000);
            }
          });
        }
      },
      error: (err) => {
        console.error('Errore nella verifica dell\'utente:', err);
        this.errorMessage.set('Errore nella verifica dell\'utente');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  private saveCoproprietari(car: Car): void {
    this.carService.update(car.targa, { coProprietari: car.coProprietari }).subscribe({
      next: () => {
        this.successMessage.set('Coproprietario aggiunto con successo');
        this.showNewCoproprietarioForm.set(false);
        this.newCoproprietario = { nome: '', cognome: '', codiceFiscale: '' };
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadCar(car.targa);
      },
      error: (err) => {
        console.error('Errore nell\'aggiunta del coproprietario:', err);
        this.errorMessage.set('Errore nell\'aggiunta del coproprietario');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  removeCoproprietario(codiceFiscale: string): void {
    const car = this.car();
    if (!car) return;

    if (!confirm('Sei sicuro di voler rimuovere questo coproprietario?')) {
      return;
    }

    car.coProprietari = car.coProprietari.filter(c => c.codiceFiscale !== codiceFiscale);

    this.carService.update(car.targa, { coProprietari: car.coProprietari }).subscribe({
      next: () => {
        this.successMessage.set('Coproprietario rimosso con successo');
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadCar(car.targa);
      },
      error: (err) => {
        console.error('Errore nella rimozione del coproprietario:', err);
        this.errorMessage.set('Errore nella rimozione del coproprietario');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  // Tagliandi
  getTagliandiOrdinati(): Tagliando[] {
    const car = this.car();
    if (!car || !car.tagliandi) return [];

    return [...car.tagliandi].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }

  toggleNewTagliandoForm(): void {
    this.showNewTagliandoForm.set(!this.showNewTagliandoForm());
    if (this.showNewTagliandoForm()) {
      this.newTagliando = this.getEmptyTagliando();
    }
  }

  addTagliando(): void {
    const car = this.car();
    if (!car) return;

    // Validazione
    if (!this.newTagliando.data || !this.newTagliando.chilometraggio || 
        !this.newTagliando.descrizione || !this.newTagliando.costo) {
      this.errorMessage.set('Compila tutti i campi obbligatori');
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }

    // Genera ID univoco
    this.newTagliando.id = `tag_${Date.now()}`;

    // Aggiungi all'array
    if (!car.tagliandi) {
      car.tagliandi = [];
    }
    car.tagliandi.push({ ...this.newTagliando });

    // Salva su database
    this.carService.update(car.targa, { tagliandi: car.tagliandi }).subscribe({
      next: () => {
        this.successMessage.set('Tagliando aggiunto con successo');
        this.showNewTagliandoForm.set(false);
        this.newTagliando = this.getEmptyTagliando();
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadCar(car.targa);
      },
      error: (err) => {
        console.error('Errore nell\'aggiunta del tagliando:', err);
        this.errorMessage.set('Errore nell\'aggiunta del tagliando');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  deleteTagliando(tagliandoId: string): void {
    const car = this.car();
    if (!car) return;

    if (!confirm('Sei sicuro di voler eliminare questo tagliando?')) {
      return;
    }

    car.tagliandi = car.tagliandi.filter(t => t.id !== tagliandoId);

    this.carService.update(car.targa, { tagliandi: car.tagliandi }).subscribe({
      next: () => {
        this.successMessage.set('Tagliando eliminato con successo');
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadCar(car.targa);
      },
      error: (err) => {
        console.error('Errore nell\'eliminazione del tagliando:', err);
        this.errorMessage.set('Errore nell\'eliminazione del tagliando');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
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

  goBack(): void {
    this.router.navigate(['/elenco-auto']);
  }
}

