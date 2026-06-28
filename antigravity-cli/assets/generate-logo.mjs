// generate-logo.mjs
// Generates a 600×140 pixel-art atom logo for Antigravity CLI.
// Run once:  node assets/generate-logo.mjs
//
// Design: glowing nucleus + 3 tilted electron orbitals + floating particles,
// representing a "quantum gravity well".  At this resolution, chafa
// downscales to fit the terminal instead of upscaling (no blocky pixels).

import fs            from 'fs';
import path          from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Canvas ────────────────────────────────────────────────────────────────
const W  = 600;
const H  = 140;
const CX = W / 2;   // nucleus center x
const CY = H / 2;   // nucleus center y

// ── Colors ────────────────────────────────────────────────────────────────
const BRIGHT   = [57, 255, 20];   // matrix neon green
const GLOW_IN  = [22, 110,  8];   // tight inner halo
const GLOW_MID = [ 9,  48,  3];   // medium halo
const GLOW_FAR = [ 3,  16,  1];   // wide soft halo
const ORB_LINE = [ 0,  55,  0];   // orbital ring color
const ORB_GLOW = [ 0,  18,  0];   // orbital ring glow
const LINE_DIM = [ 0,  40,  0];   // border accent
const TICK_COL = [ 0,  90,  0];   // tick marks

// ── Pixel buffer ──────────────────────────────────────────────────────────
const buf = new Uint8Array(W * H * 3);  // all black

// setPixel: only paints if new pixel is brighter (glow layers stay behind cores)
function setPixel(x, y, r, g, b) {
  const xi = Math.round(x), yi = Math.round(y);
  if (xi < 0 || xi >= W || yi < 0 || yi >= H) return;
  const i = (yi * W + xi) * 3;
  if (r + g + b <= buf[i] + buf[i+1] + buf[i+2]) return;
  buf[i] = r;  buf[i+1] = g;  buf[i+2] = b;
}

// forcePaint: always writes (used for bright core elements)
function forcePaint(x, y, r, g, b) {
  const xi = Math.round(x), yi = Math.round(y);
  if (xi < 0 || xi >= W || yi < 0 || yi >= H) return;
  const i = (yi * W + xi) * 3;
  buf[i] = r;  buf[i+1] = g;  buf[i+2] = b;
}

// ── Helpers ───────────────────────────────────────────────────────────────

// Draws a glowing circle (glow halos then bright core)
function drawCircle(x, y, r, coreColor, glowMid, glowFar) {
  const gr = r + 6;
  for (let dy = -gr; dy <= gr; dy++)
    for (let dx = -gr; dx <= gr; dx++) {
      const d2 = dx*dx + dy*dy;
      if (d2 <= (r+6)*(r+6)) setPixel(x+dx, y+dy, ...glowFar);
      if (d2 <= (r+3)*(r+3)) setPixel(x+dx, y+dy, ...glowMid);
      if (d2 <= (r+1)*(r+1)) setPixel(x+dx, y+dy, ...GLOW_IN);
    }
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx*dx + dy*dy <= r*r)
        forcePaint(x+dx, y+dy, ...coreColor);
}

// Draws one orbital ellipse using parametric curve
// phi = rotation angle of the ellipse plane
function drawOrbital(a, b, phi) {
  const steps = 3000;
  for (let i = 0; i <= steps; i++) {
    const t  = (i / steps) * Math.PI * 2;
    const ex = CX + a*Math.cos(t)*Math.cos(phi) - b*Math.sin(t)*Math.sin(phi);
    const ey = CY + a*Math.cos(t)*Math.sin(phi) + b*Math.sin(t)*Math.cos(phi);
    // 1px glow around the ring line
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        setPixel(ex+dx, ey+dy, ...ORB_GLOW);
    // The ring line itself
    setPixel(ex, ey, ...ORB_LINE);
  }
}

// Returns the x,y position of a point on orbital [a,b,phi] at parameter t
function orbitalPoint(a, b, phi, t) {
  return [
    CX + a*Math.cos(t)*Math.cos(phi) - b*Math.sin(t)*Math.sin(phi),
    CY + a*Math.cos(t)*Math.sin(phi) + b*Math.sin(t)*Math.cos(phi),
  ];
}

// ── 1. Orbital rings (drawn before nucleus so nucleus renders on top) ──────
const A = 125;  // semi-major axis (px)
const B = 38;   // semi-minor axis (px)

const orbitals = [
  { phi: 0,              eT: 0.8  },   // horizontal ellipse
  { phi: Math.PI / 3,    eT: 2.5  },   // 60° tilt
  { phi: 2 * Math.PI/3,  eT: 4.3  },   // 120° tilt
];

for (const { phi } of orbitals) {
  drawOrbital(A, B, phi);
}

// ── 2. Electrons on each orbital ──────────────────────────────────────────
for (const { phi, eT } of orbitals) {
  const [ex, ey] = orbitalPoint(A, B, phi, eT);
  drawCircle(ex, ey, 5, BRIGHT, GLOW_MID, GLOW_FAR);
}

// ── 3. Nucleus (bright glowing core at center) ────────────────────────────
drawCircle(CX, CY, 10, BRIGHT, GLOW_MID, GLOW_FAR);

// ── 4. Floating particles (anti-gravity aesthetic) ────────────────────────
// Arranged so they look scattered and floating, not symmetrical
const particles = [
  // left field
  [62,  18], [38,  72], [88,  105], [120, 30], [25,  48],
  // right field
  [530, 22], [568, 80], [495, 112], [545, 55], [580, 110],
  // top/bottom sparse
  [200, 12], [390, 16], [160, 128], [420, 132], [300, 8],
];
for (const [px, py] of particles) {
  drawCircle(px, py, 3, BRIGHT, GLOW_MID, GLOW_FAR);
}

// ── 5. Tiny star sparkles (single-pixel + cross glow) ─────────────────────
const sparkles = [
  [145, 55], [470, 48], [110, 118], [500, 100],
  [220, 22], [385, 125], [55,  95], [560, 35],
];
for (const [sx, sy] of sparkles) {
  // 3-px cross arm glow
  for (const [dx, dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0],[0,2],[0,-2]]) {
    setPixel(sx+dx, sy+dy, ...GLOW_MID);
  }
  forcePaint(sx, sy, ...BRIGHT);
  // 1px arm tips
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    forcePaint(sx+dx, sy+dy, ...GLOW_IN);
  }
}

// ── 6. Decorative border accent lines ────────────────────────────────────
const TL = 7;      // top line y
const BL = H - 8;  // bottom line y
for (let x = 0; x < W; x++) {
  setPixel(x, TL,   ...LINE_DIM);
  setPixel(x, TL+1, ...LINE_DIM);
  setPixel(x, BL,   ...LINE_DIM);
  setPixel(x, BL+1, ...LINE_DIM);
}
// Tick marks every 50px
for (let x = 0; x < W; x += 50) {
  for (let y = TL - 3; y <= TL + 1; y++) forcePaint(x, y, ...TICK_COL);
  for (let y = BL;     y <= BL + 3; y++) forcePaint(x, y, ...TICK_COL);
}
// Corner L-brackets
const BRACK = 10;
for (const [bx, by, sx, sy] of [
  [0,     0,      1,  1],
  [W-1,   0,     -1,  1],
  [0,     H-1,    1, -1],
  [W-1,   H-1,   -1, -1],
]) {
  for (let k = 0; k < BRACK; k++) {
    forcePaint(bx + k*sx, by,       ...TICK_COL);
    forcePaint(bx,        by + k*sy, ...TICK_COL);
  }
}

// ── Encode as PPM P3 ──────────────────────────────────────────────────────
const rowStrs = [];
for (let y = 0; y < H; y++) {
  const cells = [];
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    cells.push(`${buf[i]} ${buf[i+1]} ${buf[i+2]}`);
  }
  rowStrs.push(cells.join('  '));
}
const ppm = `P3\n${W} ${H}\n255\n${rowStrs.join('\n')}\n`;

const ppmOut = path.join(__dirname, 'logo.ppm');
const pngOut = path.join(__dirname, 'logo.png');

fs.writeFileSync(ppmOut, ppm, 'utf8');
console.log(`Generated ${W}×${H} PPM (${(ppm.length/1024).toFixed(0)} KB)`);

const ffr = spawnSync('ffmpeg', ['-y', '-i', ppmOut, '-update', '1', pngOut], {
  encoding: 'utf8', stdio: 'pipe',
});
if (ffr.status === 0) {
  fs.rmSync(ppmOut);
  console.log(`Converted → ${pngOut}`);
} else {
  console.warn('ffmpeg not found — keeping logo.ppm (may not render on Windows chafa).');
}
