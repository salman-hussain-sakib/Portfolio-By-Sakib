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
function setTransparent(x, y) {
  const i = getIdx(x, y);
  pixels[i+3] = 0;
}
function isBackground(p) {
  // Checkerboard gray (~197) or white (~255)
  const isGray  = Math.abs(p.r - 197) < 40 && Math.abs(p.g - 197) < 40 && Math.abs(p.b - 197) < 40;
  const isWhite = p.r > 210 && p.g > 210 && p.b > 210;
  return (isGray || isWhite) && p.a > 10;
}

const dx = [1,-1,0,0];
const dy = [0,0,1,-1];
const visited = new Uint8Array(width * height);

function floodFill(startX, startY) {
  const queue = [[startX, startY]];
  const idx = startY * width + startX;
  if (visited[idx]) return;
  visited[idx] = 1;

  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    const p = getPixel(cx, cy);

    if (!isBackground(p)) continue;

    setTransparent(cx, cy);

    for (let d = 0; d < 4; d++) {
      const nx = cx + dx[d];
      const ny = cy + dy[d];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }
}

// ─── Phase 1: Flood-fill from all 4 edges ───────────────────────────────────
console.log('Phase 1: Flood-fill from edges...');
for (let x = 0; x < width; x++) { floodFill(x, 0); floodFill(x, height-1); }
for (let y = 0; y < height; y++) { floodFill(0, y); floodFill(width-1, y); }

// ─── Phase 2: Flood-fill from any already-transparent pixel neighbour ────────
// This catches interior "islands" surrounded by the character outline
console.log('Phase 2: Removing interior islands...');
// Reset visited so we can re-scan transparent neighbours
visited.fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const p = getPixel(x, y);
    // Start from any transparent pixel and check its neighbours for bg colour
    if (p.a === 0) {
      for (let d = 0; d < 4; d++) {
        const nx = x + dx[d];
        const ny = y + dy[d];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nb = getPixel(nx, ny);
          if (isBackground(nb)) {
            floodFill(nx, ny);
          }
        }
      }
    }
  }
}

// ─── Phase 3: Direct pixel scan – nuke any stray checkerboard pixel ──────────
console.log('Phase 3: Direct pixel scan cleanup...');
let direct = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const p = getPixel(x, y);
    if (isBackground(p)) {
      setTransparent(x, y);
      direct++;
    }
  }
}
console.log(`Phase 3 removed ${direct} stray pixels`);

// ─── Save ────────────────────────────────────────────────────────────────────
await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels } })
  .png()
  .toFile(outputPath);

console.log('Done! Saved to', outputPath);
