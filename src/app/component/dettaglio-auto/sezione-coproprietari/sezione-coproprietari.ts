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

    const nuovoUtente: Utente = {
      id: '',
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
    this.car.coProprietari.push(nuovoUtente);

    this.carUpdated.emit(this.car);
    this.toggleNewCoproprietarioForm();
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
