import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where, getDocs, setDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Car } from '../model/car';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private firestore = inject(Firestore);
  private carsCollection = collection(this.firestore, 'auto');

  // Ottieni tutte le auto
  getAll(): Observable<Car[]> {
    return collectionData(this.carsCollection, { idField: 'targa' }) as Observable<Car[]>;
  }

  // Ottieni auto per targa
  getByTarga(targa: string): Observable<Car | undefined> {
    const carDoc = doc(this.firestore, `auto/${targa}`);
    return docData(carDoc, { idField: 'targa' }).pipe(
      map(data => {
        if (!data) return undefined;
        return this.convertFirebaseTimestamps(data as any);
      })
    ) as Observable<Car | undefined>;
  }

  // Ottieni auto per proprietario (userId)
  getByProprietario(userId: string): Observable<Car[]> {
    const q = query(this.carsCollection, where('proprietario.id', '==', userId));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return this.convertFirebaseTimestamps({ ...data, targa: doc.id });
        });
      })
    );
  }

  // Ottieni auto di cui l'utente è proprietario o comproprietario
  getByProprietarioOComproprietario(userId: string): Observable<Car[]> {
    // Prima query: auto dove l'utente è proprietario
    const qProprietario = query(this.carsCollection, where('proprietario.id', '==', userId));
    
    // Per i coproprietari, dobbiamo recuperare tutte le auto e filtrare lato client
    // perché Firestore array-contains non supporta query parziali su oggetti
    return from(Promise.all([getDocs(qProprietario), getDocs(this.carsCollection)])).pipe(
      map(([snapshotProprietario, snapshotAll]) => {
        const autoSet = new Map<string, Car>();
        
        // Aggiungi auto come proprietario
        snapshotProprietario.docs.forEach(doc => {
          const data = doc.data();
          autoSet.set(doc.id, this.convertFirebaseTimestamps({ ...data, targa: doc.id }));
        });
        
        // Filtra auto come comproprietario
        snapshotAll.docs.forEach(doc => {
          if (!autoSet.has(doc.id)) {
            const data = doc.data();
            const coProprietari = data['coProprietari'] || [];
            
            // Verifica se l'utente è tra i coproprietari
            const isComproprietario = coProprietari.some((cp: any) => cp.id === userId);
            
            if (isComproprietario) {
              autoSet.set(doc.id, this.convertFirebaseTimestamps({ ...data, targa: doc.id }));
            }
          }
        });
        
        return Array.from(autoSet.values());
      })
    );
  }

  // Crea nuova auto (usa targa come ID documento)
  create(car: Car): Observable<void> {
    const carDoc = doc(this.firestore, `auto/${car.targa.toUpperCase()}`);
    const carData = {
      ...car,
      targa: car.targa.toUpperCase()
    };
    return from(setDoc(carDoc, carData));
  }

  // Aggiorna auto
  update(targa: string, car: Partial<Car>): Observable<void> {
    const carDoc = doc(this.firestore, `auto/${targa.toUpperCase()}`);
    return from(updateDoc(carDoc, car as any));
  }

  // Elimina auto
  delete(targa: string): Observable<void> {
    const carDoc = doc(this.firestore, `auto/${targa.toUpperCase()}`);
    return from(deleteDoc(carDoc));
  }

  // Verifica se una targa esiste già
  checkTargaExists(targa: string): Observable<boolean> {
    return this.getByTarga(targa).pipe(
      map(car => car !== undefined)
    );
  }

  // Converti Firebase Timestamp in Date
  private convertFirebaseTimestamps(data: any): Car {
    return {
      ...data,
      dataDiAcquisto: data.dataDiAcquisto?.toDate ? data.dataDiAcquisto.toDate() : data.dataDiAcquisto,
      dataDiVendita: data.dataDiVendita?.toDate ? data.dataDiVendita.toDate() : data.dataDiVendita,
      dataProssimoTagliando: data.dataProssimoTagliando?.toDate ? data.dataProssimoTagliando.toDate() : data.dataProssimoTagliando,
      dataProssimaRevisione: data.dataProssimaRevisione?.toDate ? data.dataProssimaRevisione.toDate() : data.dataProssimaRevisione,
      assicurazioni: data.assicurazioni?.map((a: any) => ({
        ...a,
        dataInizio: a.dataInizio?.toDate ? a.dataInizio.toDate() : a.dataInizio,
        dataFine: a.dataFine?.toDate ? a.dataFine.toDate() : a.dataFine
      })) || [],
      tagliandi: data.tagliandi?.map((t: any) => ({
        ...t,
        data: t.data?.toDate ? t.data.toDate() : t.data
      })) || [],
      revisioni: data.revisioni?.map((r: any) => ({
        ...r,
        data: r.data?.toDate ? r.data.toDate() : r.data
      })) || []
    } as Car;
  }
}
