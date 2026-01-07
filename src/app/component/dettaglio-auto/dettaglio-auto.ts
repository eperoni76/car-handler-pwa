import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../service/car.service';
import { UserService } from '../../service/user.service';
import { Car } from '../../model/car';
import { Utente } from '../../model/utente';
import { SezioneAnagrafica } from './sezione-anagrafica/sezione-anagrafica';
import { SezioneCoproprietari } from './sezione-coproprietari/sezione-coproprietari';
import { SezioneAssicurazioni } from './sezione-assicurazioni/sezione-assicurazioni';
import { SezioneTagliandi } from './sezione-tagliandi/sezione-tagliandi';
import { SezioneRevisioni } from './sezione-revisioni/sezione-revisioni';

@Component({
  selector: 'app-dettaglio-auto',
  imports: [
    CommonModule,
    SezioneAnagrafica,
    SezioneCoproprietari,
    SezioneAssicurazioni,
    SezioneTagliandi,
    SezioneRevisioni
  ],
  templateUrl: './dettaglio-auto.html',
  styleUrl: './dettaglio-auto.scss',
})
export class DettaglioAuto implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carService = inject(CarService);
  private userService = inject(UserService);

  car = signal<Car | null>(null);
  proprietario = signal<Utente | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
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

  async loadCar(targa: string): Promise<void> {
    this.carService.getByTarga(targa).subscribe({
      next: async (car) => {
        if (car) {
          // Inizializza array se non esistono
          if (!car.assicurazioni) car.assicurazioni = [];
          if (!car.tagliandi) car.tagliandi = [];
          if (!car.revisioni) car.revisioni = [];
          if (!car.coProprietari) car.coProprietari = [];
          
          this.car.set(car);
          this.proprietario.set(car.proprietario);
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

  onCarUpdated(updatedCar: Car): void {
    // Pulisci l'oggetto rimuovendo i campi undefined (Firestore non li accetta)
    const cleanedCar = this.cleanUndefinedFields(updatedCar);
    
    this.carService.update(updatedCar.targa, cleanedCar).subscribe({
      next: () => {
        this.successMessage.set('Modifiche salvate con successo');
        this.car.set(updatedCar);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        console.error('Errore nell\'aggiornamento:', err);
        this.errorMessage.set('Errore nel salvataggio delle modifiche');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  private cleanUndefinedFields(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (obj instanceof Date) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefinedFields(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
          cleaned[key] = this.cleanUndefinedFields(obj[key]);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  goBack(): void {
    this.router.navigate(['/elenco-auto']);
  }
}
