import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = inject(Storage);
  private auth = inject(Auth);

  /**
   * Carica un file su Firebase Storage
   * @param file File da caricare
   * @param path Path dove salvare il file (es: 'assicurazioni/ABC123/polizza.pdf')
   * @returns URL del file caricato
   */
  async uploadFile(file: File, path: string): Promise<string> {
    // Debug: verifica autenticazione
    const user = this.auth.currentUser;
    console.log('Upload file - User authenticated:', !!user);
    console.log('Upload file - User email:', user?.email);
    console.log('Upload file - Path:', path);
    
    if (!user) {
      throw new Error('Utente non autenticato. Effettua il login prima di caricare file.');
    }
    
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  /**
   * Elimina un file da Firebase Storage
   * @param path Path del file da eliminare
   */
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }

  /**
   * Genera un path univoco per un file assicurazione
   * @param targa Targa dell'auto
   * @param assicurazioneId ID dell'assicurazione
   * @param fileName Nome originale del file
   * @returns Path completo
   */
  getAssicurazionePath(targa: string, assicurazioneId: string, fileName: string): string {
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    return `assicurazioni/${targa}/${assicurazioneId}_${timestamp}.${extension}`;
  }

  /**
   * Estrae il path da un URL Firebase Storage
   * @param url URL completo del file
   * @returns Path del file
   */
  getPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/o/')[1]?.split('?')[0];
      return decodeURIComponent(path || '');
    } catch {
      return '';
    }
  }
}
