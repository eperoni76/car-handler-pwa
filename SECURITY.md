# Configurazione Sicurezza Firebase

## ⚠️ IMPORTANTE: Gestione delle Credenziali

Questo progetto utilizza Firebase e richiede credenziali API che **NON DEVONO MAI** essere committate su Git.

## Setup Iniziale

1. **Crea un file `.env`** nella root del progetto (non verrà tracciato da Git):
   ```bash
   cp .env.example .env
   ```

2. **Compila il file `.env`** con le tue credenziali Firebase reali:
   ```env
   FIREBASE_API_KEY=la_tua_api_key
   FIREBASE_AUTH_DOMAIN=il_tuo_progetto.firebaseapp.com
   FIREBASE_PROJECT_ID=il_tuo_project_id
   FIREBASE_STORAGE_BUCKET=il_tuo_progetto.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=il_tuo_sender_id
   FIREBASE_APP_ID=il_tuo_app_id
   ```

3. **Genera i file environment**:
   ```bash
   node generate-env.js
   ```

4. **Avvia l'applicazione**:
   ```bash
   npm start
   ```

## Sviluppo Locale

Prima di avviare l'app in locale, assicurati di:
- Aver creato il file `.env` con le credenziali corrette
- Aver eseguito `node generate-env.js` per generare i file environment
- I file `src/environments/environment.ts` e `src/environments/environment.prod.ts` sono generati automaticamente e non devono essere committati

## Deploy in Produzione

Quando fai il deploy su piattaforme di hosting (GitHub Pages, Netlify, Vercel, ecc.), configura le variabili d'ambiente nella dashboard della piattaforma. Il processo di build eseguirà automaticamente `generate-env.js`.

## Se hai esposto le credenziali per errore

1. **Rigenera immediatamente la chiave API** nella [Console Firebase](https://console.firebase.google.com/)
2. **Aggiungi restrizioni** alla nuova chiave API (domini autorizzati, IP, ecc.)
3. **Rimuovi la chiave compromessa** dalla cronologia Git:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch src/environments/environment.ts" \
   --prune-empty --tag-name-filter cat -- --all
   ```
4. **Forza il push**:
   ```bash
   git push origin --force --all
   ```

## Best Practices

- ✅ Usa sempre variabili d'ambiente per le credenziali
- ✅ Aggiungi restrizioni alle chiavi API nella Firebase Console
- ✅ Monitora l'utilizzo delle API per rilevare accessi non autorizzati
- ❌ Non committare mai file `.env` o credenziali hardcoded
- ❌ Non condividere le credenziali su chat, email o repository pubblici
