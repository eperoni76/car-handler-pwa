import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, catchError, tap, map, from, switchMap } from 'rxjs';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { UserService } from './user.service';
import { Utente } from '../model/utente';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userService = inject(UserService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private auth = inject(Auth);

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
      switchMap(user => {
        if (!user) {
          return of({ success: false, message: 'Utente non trovato. Registrati per continuare.' });
        }

        // Verifica nome e cognome (case insensitive)
        if (user.nome.toLowerCase() !== nome.toLowerCase() || 
            user.cognome.toLowerCase() !== cognome.toLowerCase()) {
          return of({ success: false, message: 'Nome o cognome non corrispondono al codice fiscale.' });
        }

        // Autentica su Firebase Auth
        const email = this.generateEmailFromCF(codiceFiscale);
        const password = codiceFiscale; // Usa il CF come password
        
        return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
          map(() => {
            // Login riuscito
            console.log('✅ Firebase Auth login riuscito');
            this.setCurrentUser(user);
            return { success: true, user };
          }),
          catchError(error => {
            console.error('❌ Errore Firebase Auth durante il login:', error.code);
            
            // Se l'utente non esiste su Firebase Auth, crealo
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
              console.log('🔧 Creazione account Firebase Auth per utente esistente...');
              return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
                map(() => {
                  console.log('✅ Account Firebase Auth creato');
                  this.setCurrentUser(user);
                  return { success: true, user };
                }),
                catchError(createError => {
                  console.error('❌ Errore creazione account Firebase Auth:', createError);
                  return of({ success: false, message: 'Errore durante il login. Riprova.' });
                })
              );
            }
            
            return of({ success: false, message: 'Errore durante il login. Riprova.' });
          })
        );
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
      switchMap(exists => {
        if (exists) {
          return of({ success: false, message: 'Codice fiscale già registrato. Usa il login per accedere.' });
        }

        // Crea account Firebase Auth
        const email = this.generateEmailFromCF(userData.codiceFiscale);
        const password = userData.codiceFiscale;

        return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
          switchMap(() => {
            // Crea l'utente in Firestore
            return from(new Promise<string>((resolve, reject) => {
              this.userService.create(userData).subscribe({
                next: (userId) => resolve(userId),
                error: (error) => reject(error)
              });
            }));
          }),
          map((userId) => {
            const newUser: Utente = { ...userData, id: userId };
            this.setCurrentUser(newUser);
            return { success: true, user: newUser };
          }),
          catchError(error => {
            console.error('Errore durante la registrazione:', error);
            const message = error.code === 'auth/email-already-in-use' 
              ? 'Codice fiscale già registrato. Usa il login per accedere.'
              : 'Errore durante la registrazione. Riprova.';
            return of({ success: false, message });
          })
        );
      }),
      catchError(error => {
        console.error('Errore durante la registrazione:', error);
        return of({ success: false, message: error.message || 'Errore durante la registrazione. Riprova.' });
      })
    );
  }

  // Logout
  logout(): void {
    signOut(this.auth).then(() => {
      this.currentUserSignal.set(null);
      if (this.isBrowser) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      this.router.navigate(['/login']);
    });
  }

  // Verifica se l'utente è autenticato
  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  // Genera email da codice fiscale (per Firebase Auth)
  private generateEmailFromCF(codiceFiscale: string): string {
    return `${codiceFiscale.toLowerCase()}@carhandler.local`;
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
