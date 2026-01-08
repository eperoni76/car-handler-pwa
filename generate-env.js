const fs = require('fs');
const path = require('path');

// Carica variabili d'ambiente dal file .env se esiste
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    // Rimuovi spazi e ignora commenti e righe vuote
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const separatorIndex = line.indexOf('=');
    if (separatorIndex !== -1) {
      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  console.log('✓ Loaded environment variables from .env');
}

const envDir = path.join(__dirname, 'src', 'environments');

// Crea la directory environments se non esiste
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// File environment.ts per lo sviluppo (RICHIEDE variabili d'ambiente)
const envContent = `export const environment = {
  production: false,
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
