import sharp from 'sharp';

const inputPath = 'public/images/avatar-transparent.png';
const outputPath = 'public/images/avatar-clean.png';

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
  const isGray  = Math.abs(p.r - 197) < 45 && Math.abs(p.g - 197) < 45 && Math.abs(p.b - 197) < 45;
  const isWhite = p.r > 215 && p.g > 215 && p.b > 215;
  return (isGray || isWhite) && p.a > 10;
}

const dx = [1,-1,0,0];
const dy = [0,0,1,-1];
const processed = new Uint8Array(width * height);

// Standard flood fill - returns list of all pixels in region
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

// Phase 1: Edge flood-fill (marks & removes large outer background)
console.log('Phase 1: Edge flood-fill...');
for (let x = 0; x < width; x++) {
  let r = floodFillRegion(x, 0); r.forEach(([px,py]) => setTransparent(px,py));
  r = floodFillRegion(x, height-1); r.forEach(([px,py]) => setTransparent(px,py));
}
for (let y = 0; y < height; y++) {
  let r = floodFillRegion(0, y); r.forEach(([px,py]) => setTransparent(px,py));
  r = floodFillRegion(width-1, y); r.forEach(([px,py]) => setTransparent(px,py));
}

// Phase 2: Expand from transparent pixels to neighbours
console.log('Phase 2: Interior from transparent neighbours...');
processed.fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (getPixel(x, y).a === 0) {
      for (let d = 0; d < 4; d++) {
        const nx = x + dx[d], ny = y + dy[d];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const r = floodFillRegion(nx, ny);
          r.forEach(([px,py]) => setTransparent(px,py));
        }
      }
    }
  }
}

// Phase 3: Find remaining background islands by SIZE
// Small regions = background island (safe to remove)
// Large regions = shirt / eyes (keep)
const MAX_ISLAND_SIZE = 3000; // pixels — tweak if needed
console.log('Phase 3: Small island removal by size...');
processed.fill(0);
let islandsRemoved = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (!processed[y * width + x] && isBackground(getPixel(x, y))) {
      const region = floodFillRegion(x, y);
      if (region.length > 0 && region.length <= MAX_ISLAND_SIZE) {
        region.forEach(([px,py]) => setTransparent(px,py));
        islandsRemoved++;
        console.log(`  Removed island of ${region.length} pixels at (${x},${y})`);
      }
      // Large regions (eyes, shirt) are left alone
    }
  }
}
console.log(`Removed ${islandsRemoved} background islands`);

await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels } })
  .png()
  .toFile(outputPath);

console.log('Done! Saved avatar-clean.png');
