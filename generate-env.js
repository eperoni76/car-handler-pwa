const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, 'src', 'environments');

// Crea la directory environments se non esiste
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

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

fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), envProdContent);
console.log('✓ Generated environment.prod.ts');
