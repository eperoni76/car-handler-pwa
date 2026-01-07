import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { UserService } from '../../service/user.service';
import { Utente } from '../../model/utente';

@Component({
  selector: 'app-homepage',
  imports: [FormsModule, CommonModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  currentUser = this.authService.currentUser;
  isEditMode = signal(false);
  isSaving = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Form data
  editData = signal<Partial<Utente>>({});

  readonly currentYear = new Date().getFullYear();

  ngOnInit() {
    const user = this.currentUser();
    if (user) {
      this.editData.set({ ...user });
    }
  }

  toggleEditMode() {
    if (this.isEditMode()) {
      // Annulla modifiche
      const user = this.currentUser();
      if (user) {
        this.editData.set({ ...user });
      }
    }
    this.isEditMode.update(val => !val);
    this.clearMessages();
  }

  saveChanges() {
    const user = this.currentUser();
    if (!user) return;

    this.clearMessages();
    this.isSaving.set(true);

    const data = this.editData();
    const updateData: Partial<Utente> = {
      nome: data.nome?.toUpperCase(),
      cognome: data.cognome?.toUpperCase(),
      email: data.email || null,
      dataDiNascita: data.dataDiNascita || null,
      annoConseguimentoPatente: data.annoConseguimentoPatente || null
    };

    this.userService.update(user.id, updateData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditMode.set(false);
        this.successMessage.set('Dati aggiornati con successo!');
        
        // Aggiorna l'utente corrente nel servizio auth
        const updatedUser: Utente = { ...user, ...updateData };
        this.authService['setCurrentUser'](updatedUser);
        
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set('Errore durante il salvataggio. Riprova.');
        console.error('Errore salvataggio:', error);
      }
    });
  }

  private clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  formatDate(date: Date | null): string {
    if (!date) return 'Non impostato';
    try {
      // Gestisce sia Date che Firebase Timestamp
      const d = (date as any).toDate ? (date as any).toDate() : new Date(date);
      return d.toLocaleDateString('it-IT');
    } catch (e) {
      return 'Non impostato';
    }
  }

  getDateInputValue(date: Date | null): string {
    if (!date) return '';
    try {
      // Gestisce sia Date che Firebase Timestamp
      const d = (date as any).toDate ? (date as any).toDate() : new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.editData.update(data => ({
      ...data,
      dataDiNascita: value ? new Date(value) : null
    }));
  }
}
