import sharp from 'sharp';

const inputPath = 'public/images/avatar-transparent.png';
const outputPath = 'public/images/avatar-clean.png';

const image = sharp(inputPath).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

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

// Color distance
function colorDist(p, r2, g2, b2) {
  return Math.sqrt((p.r-r2)**2 + (p.g-g2)**2 + (p.b-b2)**2);
}

// Sample corner pixel colors (background)
const corners = [
  getPixel(0, 0), getPixel(width-1, 0),
  getPixel(0, height-1), getPixel(width-1, height-1),
  getPixel(5, 5), getPixel(width-5, 5)
];

// Collect unique background reference colors
const bgColors = corners.filter(c => c.a > 100);
console.log('Background sample colors:', bgColors.map(c => `rgb(${c.r},${c.g},${c.b})`));

// BFS flood-fill from corners to remove background
const visited = new Uint8Array(width * height);
const queue = [];
const TOLERANCE = 60;

// Start from all 4 corners + edges
const seeds = [
  [0,0],[width-1,0],[0,height-1],[width-1,height-1],
  [1,0],[width-2,0],[0,1],[0,height-2],
  [width-1,1],[width-1,height-2],
  [1,height-1],[width-2,height-1]
];

for (const [x,y] of seeds) {
  const idx = y * width + x;
  if (!visited[idx]) {
    visited[idx] = 1;
    queue.push([x, y]);
  }
}

// Use the average of corner colors as background reference
const avgR = Math.round(bgColors.reduce((s,c) => s+c.r, 0) / bgColors.length);
const avgG = Math.round(bgColors.reduce((s,c) => s+c.g, 0) / bgColors.length);
const avgB = Math.round(bgColors.reduce((s,c) => s+c.b, 0) / bgColors.length);
console.log(`Background reference color: rgb(${avgR},${avgG},${avgB})`);

let removed = 0;
const dx = [1,-1,0,0];
const dy = [0,0,1,-1];

while (queue.length > 0) {
  const [cx, cy] = queue.shift();
  const p = getPixel(cx, cy);

  // Also check against both checkerboard colors (light gray ~192 and white ~255)
  const distToBg = colorDist(p, avgR, avgG, avgB);
  const distToGray = colorDist(p, 192, 192, 192);
  const distToWhiteGray = colorDist(p, 220, 220, 220);

  if (distToBg < TOLERANCE || distToGray < 50 || distToWhiteGray < 50) {
    setTransparent(cx, cy);
    removed++;

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

console.log(`Removed ${removed} background pixels`);

await sharp(Buffer.from(pixels.buffer), {
  raw: { width, height, channels }
}).png().toFile(outputPath);

console.log(`Saved: ${outputPath}`);
