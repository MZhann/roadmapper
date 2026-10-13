const sharp = require('sharp');
const fs = require('node:fs');
const brand = fs.readFileSync('src/theme/brand.ts', 'utf8').match(/logo: '([^']+)'/)[1];
sharp(`milo-design/brand/logo-${brand}.svg`).resize(1024, 1024).png().toFile('assets/images/milo-icon.png');
