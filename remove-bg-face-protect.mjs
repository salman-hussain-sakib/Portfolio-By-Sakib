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

// 1. Edge flood-fill
for (let x = 0; x < width; x++) {
  let r = floodFillRegion(x, 0); r.forEach(([px,py]) => setTransparent(px,py));
  r = floodFillRegion(x, height-1); r.forEach(([px,py]) => setTransparent(px,py));
}
for (let y = 0; y < height; y++) {
  let r = floodFillRegion(0, y); r.forEach(([px,py]) => setTransparent(px,py));
  r = floodFillRegion(width-1, y); r.forEach(([px,py]) => setTransparent(px,py));
}

// 2. Expand from transparent
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

// 3. PROTECTED Island removal
// We protect the FACE AREA (Top center)
processed.fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (!processed[y * width + x] && isBackground(getPixel(x, y))) {
      const region = floodFillRegion(x, y);
      if (region.length > 0) {
        // PROTECTION LOGIC:
        // Do not remove if the island is in the upper middle area (Face/Eyes)
        const isFaceArea = (x > width * 0.3 && x < width * 0.7) && (y < height * 0.4);
        
        if (!isFaceArea) {
          region.forEach(([px,py]) => setTransparent(px,py));
          console.log(`Removed island of ${region.length} at (${x},${y})`);
        } else {
          console.log(`Protected potential Eye/Face island of ${region.length} at (${x},${y})`);
        }
      }
    }
  }
}

await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels } })
  .png()
  .toFile(outputPath);

console.log('Done! Eyes protected, arm gaps cleared.');
