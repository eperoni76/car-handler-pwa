import { Component, Input, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../../model/car';
import { Utente } from '../../../model/utente';
import { UserService } from '../../../service/user.service';

@Component({
  selector: 'app-sezione-coproprietari',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sezione-coproprietari.html',
  styleUrl: './sezione-coproprietari.scss',
})
export class SezioneCoproprietari implements OnInit {
  private userService = inject(UserService);

  @Input() car!: Car;
  @Output() carUpdated = new EventEmitter<Car>();

  coproprietariOpen = signal(false);
  showNewCoproprietarioForm = signal(false);
  newCoproprietario = {
    nome: '',
    cognome: '',
    codiceFiscale: ''
  };

  ngOnInit() {
    // coProprietari are already loaded as Utente objects
  }

  toggleCoproprietari() {
    this.coproprietariOpen.set(!this.coproprietariOpen());
  }

  toggleNewCoproprietarioForm() {
    this.showNewCoproprietarioForm.set(!this.showNewCoproprietarioForm());
    if (!this.showNewCoproprietarioForm()) {
      this.resetCoproprietarioForm();
    }
  }



  async addCoproprietario() {
    const cf = this.newCoproprietario.codiceFiscale.trim().toUpperCase();
    const nome = this.newCoproprietario.nome.trim().toUpperCase();
    const cognome = this.newCoproprietario.cognome.trim().toUpperCase();

    if (!cf || !nome || !cognome) {
      alert('Compila tutti i campi');
      return;
    }

    if (this.car.proprietario.codiceFiscale === cf) {
      alert('Il codice fiscale inserito corrisponde al proprietario');
      return;
    }

    if (this.car.coProprietari?.some(cop => cop.codiceFiscale === cf)) {
      alert('Questo coproprietario è già presente');
      return;
    }

    // Verifica se l'utente esiste già nel database
    this.userService.getByCodiceFiscale(cf).subscribe({
      next: async (utenteEsistente) => {
        let utenteId: string;

        if (utenteEsistente) {
          // L'utente esiste già, usa l'ID esistente
          utenteId = utenteEsistente.id;
          console.log('Utente già esistente:', utenteEsistente);
        } else {
          // L'utente non esiste, crealo
          const nuovoUtente: Omit<Utente, 'id'> = {
            nome,
            cognome,
            codiceFiscale: cf,
            dataDiNascita: null,
            email: null,
            annoConseguimentoPatente: null
          };

          // Crea l'utente nel database
          try {
            utenteId = await new Promise<string>((resolve, reject) => {
              this.userService.create(nuovoUtente).subscribe({
                next: (id) => resolve(id),
                error: (err) => reject(err)
              });
            });
            console.log('Nuovo utente creato con ID:', utenteId);
          } catch (error) {
            console.error('Errore nella creazione dell\'utente:', error);
            alert('Errore durante la creazione dell\'utente');
            return;
          }
        }

        // Aggiungi il coproprietario alla macchina
        const coproprietario: Utente = {
          id: utenteId,
          nome,
          cognome,
          codiceFiscale: cf,
          dataDiNascita: null,
          email: null,
          annoConseguimentoPatente: null
        };

        if (!this.car.coProprietari) {
          this.car.coProprietari = [];
        }
        this.car.coProprietari.push(coproprietario);

        this.carUpdated.emit(this.car);
        this.toggleNewCoproprietarioForm();
      },
      error: (err) => {
        console.error('Errore durante la verifica dell\'utente:', err);
        alert('Errore durante la verifica dell\'utente');
      }
    });
  }

  removeCoproprietario(codiceFiscale: string) {
    if (confirm('Sei sicuro di voler rimuovere questo coproprietario?')) {
      this.car.coProprietari = this.car.coProprietari?.filter(cop => cop.codiceFiscale !== codiceFiscale);
      this.carUpdated.emit({ ...this.car });
    }
  }

  resetCoproprietarioForm() {
    this.newCoproprietario = {
      nome: '',
      cognome: '',
      codiceFiscale: ''
    };
  }
}
