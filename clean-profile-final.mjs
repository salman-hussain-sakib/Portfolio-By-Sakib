import sharp from 'sharp';

const inputPath = 'public/images/profile-nobg.png';
const outputPath = 'public/images/profile-perfect.png';

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = new Uint8ClampedArray(data);

function getIdx(x, y) { return (y * width + x) * channels; }
function getPixel(x, y) {
  const i = getIdx(x, y);
  return { r: pixels[i], g: pixels[i+1], b: pixels[i+2], a: pixels[i+3] };
}
function setTransparent(x, y) { pixels[getIdx(x, y) + 3] = 0; }

function isBackground(p) {
  // Targeting the specific dark/grey background of the source image
  const isDark = p.r < 60 && p.g < 60 && p.b < 70;
  const isGrey = Math.abs(p.r - 40) < 20 && Math.abs(p.g - 40) < 20 && Math.abs(p.b - 45) < 20;
  return (isDark || isGrey) && p.a > 10;
}

const dx = [1,-1,0,0];
const dy = [0,0,1,-1];
const processed = new Uint8Array(width * height);

function floodFillRegion(startX, startY) {
  const region = [];
  const qi = startY * width + startX;
  if (processed[qi]) return region;
  processed[qi] = 1;
  if (!isBackground(getPixel(startX, startY))) return region;

  const queue = [[startX, startY]];
  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    region.push([cx, cy]);
    for (let d = 0; d < 4; d++) {
      const nx = cx + dx[d], ny = cy + dy[d];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const ni = ny * width + nx;
        if (!processed[ni]) {
          processed[ni] = 1;
          if (isBackground(getPixel(nx, ny))) queue.push([nx, ny]);
        }
      }
    }
  }
  return region;
}

// Flood fill from edges to remove background
for (let x = 0; x < width; x++) {
  floodFillRegion(x, 0).forEach(([px,py]) => setTransparent(px,py));
  floodFillRegion(x, height-1).forEach(([px,py]) => setTransparent(px,py));
}
for (let y = 0; y < height; y++) {
  floodFillRegion(0, y).forEach(([px,py]) => setTransparent(px,py));
  floodFillRegion(width-1, y).forEach(([px,py]) => setTransparent(px,py));
}

// Face area protection (don't remove anything in the top center)
processed.fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (!processed[y * width + x] && isBackground(getPixel(x, y))) {
      const region = floodFillRegion(x, y);
      const isFaceArea = (x > width * 0.3 && x < width * 0.7) && (y < height * 0.4);
      if (!isFaceArea) {
        region.forEach(([px,py]) => setTransparent(px,py));
      }
    }
  }
}

await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels } })
  .png()
  .toFile(outputPath);

console.log('Profile image cleaned perfectly.');
