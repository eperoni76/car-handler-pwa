const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function drawCarIcon(canvas, size) {
  const ctx = canvas.getContext('2d');
  
  // Sfondo gradiente purple (tema app)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Parametri scalabili
  const scale = size / 512;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Auto stilizzata (vista laterale moderna)
  ctx.save();
  ctx.translate(centerX, centerY);
  
  // Colore auto bianco
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Dimensioni auto
  const carWidth = 280 * scale;
  const carHeight = 120 * scale;
  const carX = -carWidth / 2;
  const carY = -carHeight / 2;
  
  // Corpo auto (forma arrotondata)
  ctx.beginPath();
  ctx.moveTo(carX + 40 * scale, carY + carHeight);
  ctx.lineTo(carX + 20 * scale, carY + carHeight * 0.6);
  ctx.quadraticCurveTo(carX, carY + carHeight * 0.3, carX + 30 * scale, carY + carHeight * 0.2);
  ctx.lineTo(carX + 80 * scale, carY);
  ctx.lineTo(carX + 180 * scale, carY);
  ctx.quadraticCurveTo(carX + 220 * scale, carY, carX + 240 * scale, carY + carHeight * 0.3);
  ctx.lineTo(carX + 260 * scale, carY + carHeight * 0.6);
  ctx.lineTo(carX + 240 * scale, carY + carHeight);
  ctx.closePath();
  ctx.fill();
  
  // Finestrini
  ctx.fillStyle = '#667eea';
  
  // Finestrino posteriore
  ctx.beginPath();
  ctx.moveTo(carX + 50 * scale, carY + carHeight * 0.25);
  ctx.lineTo(carX + 90 * scale, carY + carHeight * 0.15);
  ctx.lineTo(carX + 110 * scale, carY + carHeight * 0.15);
  ctx.lineTo(carX + 110 * scale, carY + carHeight * 0.55);
  ctx.lineTo(carX + 40 * scale, carY + carHeight * 0.55);
  ctx.closePath();
  ctx.fill();
  
  // Finestrino anteriore
  ctx.beginPath();
  ctx.moveTo(carX + 130 * scale, carY + carHeight * 0.15);
  ctx.lineTo(carX + 190 * scale, carY + carHeight * 0.15);
  ctx.lineTo(carX + 220 * scale, carY + carHeight * 0.35);
  ctx.lineTo(carX + 220 * scale, carY + carHeight * 0.55);
  ctx.lineTo(carX + 130 * scale, carY + carHeight * 0.55);
  ctx.closePath();
  ctx.fill();
  
  // Ruote
  ctx.fillStyle = '#2c3e50';
  
  // Ruota posteriore
  ctx.beginPath();
  ctx.arc(carX + 70 * scale, carY + carHeight, 30 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Ruota anteriore
  ctx.beginPath();
  ctx.arc(carX + 210 * scale, carY + carHeight, 30 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Cerchi ruote (dettagli bianchi)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3 * scale;
  
  // Cerchio ruota posteriore
  ctx.beginPath();
  ctx.arc(carX + 70 * scale, carY + carHeight, 12 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Cerchio ruota anteriore
  ctx.beginPath();
  ctx.arc(carX + 210 * scale, carY + carHeight, 12 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

async function generateIcons() {
  console.log('🚗 Generazione icone Car Handler PWA...\n');
  
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    drawCarIcon(canvas, size);
    
    const buffer = canvas.toBuffer('image/png');
    const filename = `public/icons/icon-${size}x${size}.png`;
    
    fs.writeFileSync(filename, buffer);
    console.log(`✅ Generata: ${filename}`);
  }
  
  // Genera anche favicon.ico (usa l'icona 128x128)
  const faviconCanvas = createCanvas(128, 128);
  drawCarIcon(faviconCanvas, 128);
  const faviconBuffer = faviconCanvas.toBuffer('image/png');
  fs.writeFileSync('public/favicon.ico', faviconBuffer);
  console.log('✅ Generata: public/favicon.ico');
  
  console.log('\n✨ Tutte le icone sono state generate con successo!');
}

// Verifica che canvas sia installato
try {
  require('canvas');
  generateIcons().catch(console.error);
} catch (err) {
  console.error('❌ Errore: il modulo "canvas" non è installato.');
  console.error('Installa con: npm install --save-dev canvas');
  process.exit(1);
}
