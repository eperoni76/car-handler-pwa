import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Utente } from '../model/utente';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'utenti');

  // Ottieni tutti gli utenti
  getAll(): Observable<Utente[]> {
    return collectionData(this.usersCollection, { idField: 'id' }) as Observable<Utente[]>;
  }

  // Ottieni utente per ID
  getById(id: string): Observable<Utente | undefined> {
    const userDoc = doc(this.firestore, `utenti/${id}`);
    return docData(userDoc, { idField: 'id' }) as Observable<Utente | undefined>;
  }

  // Ottieni utente per codice fiscale
  getByCodiceFiscale(codiceFiscale: string): Observable<Utente | null> {
    const q = query(this.usersCollection, where('codiceFiscale', '==', codiceFiscale.toUpperCase()));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return null;
        }
        const doc = snapshot.docs[0];
        const data = doc.data();
        // Converti Firebase Timestamp in Date
        return {
          id: doc.id,
          ...data,
          dataDiNascita: data['dataDiNascita'] ? (data['dataDiNascita'] as any).toDate() : null
        } as Utente;
      })
    );
  }

  // Crea nuovo utente
  create(utente: Omit<Utente, 'id'>): Observable<string> {
    const utenteData = {
      ...utente,
      codiceFiscale: utente.codiceFiscale.toUpperCase()
    };
    return from(addDoc(this.usersCollection, utenteData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Aggiorna utente
  update(id: string, utente: Partial<Utente>): Observable<void> {
    const userDoc = doc(this.firestore, `utenti/${id}`);
    const updateData = utente.codiceFiscale 
      ? { ...utente, codiceFiscale: utente.codiceFiscale.toUpperCase() }
      : utente;
    return from(updateDoc(userDoc, updateData));
  }

  // Elimina utente
  delete(id: string): Observable<void> {
    const userDoc = doc(this.firestore, `utenti/${id}`);
    return from(deleteDoc(userDoc));
  }

  // Verifica se un codice fiscale esiste già
  checkCodiceFiscaleExists(codiceFiscale: string): Observable<boolean> {
    return this.getByCodiceFiscale(codiceFiscale).pipe(
      map(user => user !== null)
    );
  }
}
