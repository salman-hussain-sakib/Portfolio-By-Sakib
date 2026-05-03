import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const inputPath = 'public/images/avatar-transparent.png';
const outputPath = 'public/images/avatar-nobg.png';

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data);

for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];

  // Remove dark background pixels (near-black and dark navy)
  if (r < 45 && g < 45 && b < 75) {
    pixels[i + 3] = 0; // fully transparent
  }
}

await sharp(pixels, {
  raw: { width: info.width, height: info.height, channels: 4 }
})
  .png()
  .toFile(outputPath);

console.log(`Done! Saved to ${outputPath}`);
