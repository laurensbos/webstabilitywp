import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Create a simple icon as SVG
const createIconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="url(#grad)"/>
  <g transform="translate(${size * 0.1}, ${size * 0.25})">
    <path d="M0 ${size * 0.25} 
             L${size * 0.15} ${size * 0.25} 
             L${size * 0.22} ${size * 0.1} 
             L${size * 0.32} ${size * 0.45} 
             L${size * 0.42} ${size * 0.18} 
             L${size * 0.5} ${size * 0.25} 
             L${size * 0.8} ${size * 0.25}" 
          stroke="white" 
          stroke-width="${Math.max(size * 0.04, 4)}" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          fill="none"/>
    <circle cx="${size * 0.78}" cy="${size * 0.25}" r="${size * 0.04}" fill="#22c55e"/>
  </g>
</svg>
`;

async function generateIcons() {
  console.log('Generating PWA icons...');

  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  for (const { name, size } of sizes) {
    const svg = createIconSvg(size);
    const buffer = Buffer.from(svg);
    
    const outputPath = name.startsWith('apple') || name.startsWith('favicon')
      ? join(publicDir, name)
      : join(publicDir, 'icons', name);
    
    await sharp(buffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${outputPath}`);
  }

  // Generate OG image (1200x630)
  const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#818cf8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  
  <!-- Grid pattern -->
  <g opacity="0.05">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="630" stroke="white" stroke-width="1"/>`).join('')}
    ${Array.from({length: 11}, (_, i) => `<line x1="0" y1="${i * 60}" x2="1200" y2="${i * 60}" stroke="white" stroke-width="1"/>`).join('')}
  </g>
  
  <!-- Pulse line -->
  <path d="M0 400 L300 400 L380 280 L460 520 L540 340 L600 400 L1200 400" 
        stroke="url(#textGrad)" 
        stroke-width="4" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        fill="none"
        opacity="0.3"/>
  
  <!-- Logo text -->
  <text x="100" y="280" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="72" 
        font-weight="700" 
        fill="white">
    webstability
  </text>
  
  <!-- Tagline -->
  <text x="100" y="350" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="32" 
        fill="#94a3b8">
    Website Monitoring die echt werkt
  </text>
  
  <!-- Features -->
  <g fill="#6366f1" font-family="system-ui, -apple-system, sans-serif" font-size="20">
    <circle cx="120" cy="440" r="8"/>
    <text x="140" y="447" fill="#e2e8f0">30 seconden detectie</text>
    
    <circle cx="400" cy="440" r="8"/>
    <text x="420" y="447" fill="#e2e8f0">SSL Monitoring</text>
    
    <circle cx="650" cy="440" r="8"/>
    <text x="670" y="447" fill="#e2e8f0">Instant Alerts</text>
  </g>
  
  <!-- CTA -->
  <rect x="100" y="500" width="200" height="50" rx="8" fill="url(#textGrad)"/>
  <text x="200" y="533" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="18" 
        font-weight="600"
        fill="white"
        text-anchor="middle">
    Gratis Starten →
  </text>
  
  <!-- URL -->
  <text x="1100" y="590" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="20" 
        fill="#64748b"
        text-anchor="end">
    webstability.nl
  </text>
</svg>
`;

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(join(publicDir, 'og-image.png'));
  
  console.log('✓ Generated og-image.png');

  // Generate Twitter card (same dimensions work)
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(join(publicDir, 'twitter-image.png'));
  
  console.log('✓ Generated twitter-image.png');

  console.log('\\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
