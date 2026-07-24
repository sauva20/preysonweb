import sharp from 'sharp';
import fs from 'fs';

async function compress() {
  try {
    const input = 'public/images/logo-mobile.png';
    const output = 'public/images/logo-mobile-optimized.png';
    
    await sharp(input)
      .resize({ width: 250 }) // Suitable width for a mobile navbar logo
      .png({ compressionLevel: 9, quality: 80 })
      .toFile(output);
      
    console.log('Compression successful.');
    
    // Replace original
    fs.renameSync(output, input);
    console.log('File replaced.');
  } catch (err) {
    console.error('Error compressing image:', err);
  }
}

compress();
