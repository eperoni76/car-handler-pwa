import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarService } from '../../service/car.service';
import { AuthService } from '../../service/auth.service';
import { Car } from '../../model/car';

@Component({
  selector: 'app-elenco-auto',
  imports: [CommonModule, RouterLink],
  templateUrl: './elenco-auto.html',
  styleUrl: './elenco-auto.scss',
})
export class ElencoAuto implements OnInit {
  private carService = inject(CarService);
  private authService = inject(AuthService);

  auto = signal<Car[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAuto();
  }

  loadAuto(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.error.set('Utente non autenticato');
      this.loading.set(false);
      return;
    }

    this.carService.getByProprietarioOComproprietario(user.id).subscribe({
      next: (cars) => {
        this.auto.set(cars);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore nel caricamento delle auto:', err);
        this.error.set('Errore nel caricamento delle auto');
        this.loading.set(false);
      }
    });
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT');
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '-';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);
  }

  getRuolo(car: Car): string {
    const user = this.authService.currentUser();
    if (!user) return '-';

    if (car.proprietario.id === user.id) {
      return 'Proprietario';
    }

    const isComproprietario = car.coProprietari?.some(cp => cp.id === user.id);
    if (isComproprietario) {
      return 'Coproprietario';
    }

    return '-';
  }
}
