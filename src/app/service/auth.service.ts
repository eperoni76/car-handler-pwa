import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, catchError, tap, map } from 'rxjs';
import { UserService } from './user.service';
import { Utente } from '../model/utente';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userService = inject(UserService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private currentUserSignal = signal<Utente | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  private readonly STORAGE_KEY = 'currentUser';
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Ripristina l'utente dalla localStorage all'avvio (solo nel browser)
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  // Login - verifica che l'utente esista con nome, cognome e codice fiscale
  login(nome: string, cognome: string, codiceFiscale: string): Observable<{ success: boolean, message?: string, user?: Utente }> {
    return this.userService.getByCodiceFiscale(codiceFiscale).pipe(
      map(user => {
        if (!user) {
          return { success: false, message: 'Utente non trovato. Registrati per continuare.' };
        }

        // Verifica nome e cognome (case insensitive)
        if (user.nome.toLowerCase() !== nome.toLowerCase() || 
            user.cognome.toLowerCase() !== cognome.toLowerCase()) {
          return { success: false, message: 'Nome o cognome non corrispondono al codice fiscale.' };
        }

        // Login riuscito
        this.setCurrentUser(user);
        return { success: true, user };
      }),
      catchError(error => {
        console.error('Errore durante il login:', error);
        return of({ success: false, message: 'Errore durante il login. Riprova.' });
      })
    );
  }

  // Login solo con codice fiscale
  loginByCodiceFiscale(codiceFiscale: string): Observable<{ success: boolean, message?: string, user?: Utente }> {
    return this.userService.getByCodiceFiscale(codiceFiscale).pipe(
      map(user => {
        if (!user) {
          return { success: false, message: 'Utente non trovato. Registrati per continuare.' };
        }

        // Login riuscito
        this.setCurrentUser(user);
        return { success: true, user };
      }),
      catchError(error => {
        console.error('Errore durante il login:', error);
        return of({ success: false, message: 'Errore durante il login. Riprova.' });
      })
    );
  }

  // Registrazione - crea un nuovo utente
  register(userData: Omit<Utente, 'id'>): Observable<{ success: boolean, message?: string, user?: Utente }> {
    return this.userService.checkCodiceFiscaleExists(userData.codiceFiscale).pipe(
      map(exists => {
        if (exists) {
          throw new Error('Codice fiscale già registrato. Usa il login per accedere.');
        }
        return exists;
      }),
      // Se non esiste, crea l'utente
      tap(() => {}),
      map(() => {
        // Crea l'utente
        this.userService.create(userData).subscribe({
          next: (userId) => {
            const newUser: Utente = { ...userData, id: userId };
            this.setCurrentUser(newUser);
          },
          error: (error) => {
            console.error('Errore durante la registrazione:', error);
          }
        });
        return { success: true };
      }),
      catchError(error => {
        console.error('Errore durante la registrazione:', error);
        return of({ success: false, message: error.message || 'Errore durante la registrazione. Riprova.' });
      })
    );
  }

  // Logout
  logout(): void {
    this.currentUserSignal.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.router.navigate(['/login']);
  }

  // Verifica se l'utente è autenticato
  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  // Imposta l'utente corrente
  private setCurrentUser(user: Utente): void {
    this.currentUserSignal.set(user);
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
  }

  // Carica l'utente dalla localStorage
  private loadUserFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }
    
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as Utente;
        this.currentUserSignal.set(user);
      } catch (error) {
        console.error('Errore nel parsing dell\'utente salvato:', error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }
}
