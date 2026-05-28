/**
 * Generador de iconos PNG a partir del SVG fuente.
 *
 * Uso:
 *   node scripts/generate-icons.js
 *
 * Lee `assets/icon-source.svg` y escribe:
 *   - assets/icon.png            1024x1024 (icono principal iOS/genérico)
 *   - assets/adaptive-icon.png   1024x1024 (foreground Android, sin fondo)
 *   - assets/splash-icon.png     1242x1242 (splash centrado)
 *   - assets/favicon.png         48x48     (web favicon)
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'assets', 'icon-source.svg');
const OUT_DIR = path.join(__dirname, '..', 'assets');

async function generateIcon(filename, size, options = {}) {
  const svgBuffer = fs.readFileSync(SRC);
  let pipeline = sharp(svgBuffer).resize(size, size, { fit: 'contain' });
  if (options.background) {
    pipeline = pipeline.flatten({ background: options.background });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, filename));
  const stats = fs.statSync(path.join(OUT_DIR, filename));
  console.log(`✓ ${filename.padEnd(22)} ${size}x${size}  ${Math.round(stats.size / 1024)} KB`);
}

(async () => {
  console.log('\nGenerando iconos a partir de', path.relative(process.cwd(), SRC), '\n');
  await generateIcon('icon.png', 1024);
  await generateIcon('adaptive-icon.png', 1024);
  await generateIcon('splash-icon.png', 1242);
  await generateIcon('favicon.png', 48);
  console.log('\nListo. Reinicia Expo para ver los nuevos iconos.\n');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
