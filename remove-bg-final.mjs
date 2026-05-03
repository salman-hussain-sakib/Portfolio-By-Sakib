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
const visited = new Uint8Array(width * height);

function floodFill(startX, startY) {
  const qIdx = startY * width + startX;
  if (visited[qIdx]) return;
  visited[qIdx] = 1;
  const p0 = getPixel(startX, startY);
  if (!isBackground(p0)) return;

  const queue = [[startX, startY]];
  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    setTransparent(cx, cy);
    for (let d = 0; d < 4; d++) {
      const nx = cx + dx[d], ny = cy + dy[d];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const ni = ny * width + nx;
        if (!visited[ni]) {
          visited[ni] = 1;
          const np = getPixel(nx, ny);
          if (isBackground(np)) queue.push([nx, ny]);
        }
      }
    }
  }
}

// Phase 1: Flood-fill from all 4 edges
console.log('Phase 1: Edge flood-fill...');
for (let x = 0; x < width; x++) { floodFill(x, 0); floodFill(x, height-1); }
for (let y = 0; y < height; y++) { floodFill(0, y); floodFill(width-1, y); }

// Phase 2: Expand from transparent pixels to catch interior islands
// (e.g. the gap between arms and body)
console.log('Phase 2: Interior island removal...');
visited.fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (getPixel(x, y).a === 0) {
      for (let d = 0; d < 4; d++) {
        const nx = x + dx[d], ny = y + dy[d];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (isBackground(getPixel(nx, ny))) floodFill(nx, ny);
        }
      }
    }
  }
}

// NO Phase 3 direct scan — preserves eyes, shirt and any interior white parts of the character

await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels } })
  .png()
  .toFile(outputPath);

console.log('Done! Saved avatar-clean.png — eyes preserved ✓');
