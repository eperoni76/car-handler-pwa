const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, 'src', 'environments');

// Crea la directory environments se non esiste
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// File environment.ts per lo sviluppo (usa variabili d'ambiente se presenti, altrimenti valori di default)
const envContent = `export const environment = {
  production: false,
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || 'AIzaSyDXJt6EVbf255KW_pQnwxLjEznyOJ2oC40'}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || 'car-handler-pwa.firebaseapp.com'}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || 'car-handler-pwa'}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || 'car-handler-pwa.firebasestorage.app'}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || '142359734732'}",
    appId: "${process.env.FIREBASE_APP_ID || '1:142359734732:web:5838f327ae0a65045ad569'}"
  }
};
`;

// File environment.prod.ts per la produzione
const envProdContent = `export const environment = {
  production: true,
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || ''}"
  }
};
`;

fs.writeFileSync(path.join(envDir, 'environment.ts'), envContent);
console.log('✓ Generated environment.ts');

fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), envProdContent);
console.log('✓ Generated environment.prod.ts');
