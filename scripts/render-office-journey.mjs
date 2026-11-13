// Local motion-design renderer. Source photos remain unchanged; no generated geography.
// npm install --prefix artifacts/journey-tools --no-save --package-lock=false @napi-rs/canvas ffmpeg-static
// node scripts/render-office-journey.mjs
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';

const require = createRequire(path.resolve('artifacts/journey-tools/package.json'));
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const ffmpeg = require('ffmpeg-static');
const directory = 'public/brand/journey';
await mkdir('artifacts/journey-preview', { recursive: true });
const [earth, office, vehicle, logo] = await Promise.all([
  `${directory}/earth.jpg`, `${directory}/office.png`, `${directory}/vehicle.png`, 'public/brand/logo.png',
].map(async source => loadImage(await readFile(source))));
const W = 1280, H = 720, fps = 30, duration = 12;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = n => { const p = clamp(n); return p * p * (3 - 2 * p); };
const lerp = (a, b, p) => a + (b - a) * p;
function text(value, x, y, size = 20, color = '#fff', weight = 400) {
  ctx.fillStyle = color; ctx.font = `${weight} ${size}px Arial`; ctx.fillText(value, x, y);
}
function roundRect(x, y, w, h, r, fill) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
}
function brand(x, y, width) {
  const height = width * logo.height / logo.width;
  roundRect(x - 12, y - 9, width + 24, height + 18, 10, '#ffffff');
  ctx.drawImage(logo, x, y, width, height);
}
function draw(t) {
  ctx.globalAlpha = 1; ctx.fillStyle = '#04070d'; ctx.fillRect(0, 0, W, H);
  if (t < 5) {
    // Deterministic star field; never flashes or loops.
    for (let i = 0; i < 160; i++) {
      const x = (i * 167 + 31) % W, y = (i * 97 + 13) % H;
      ctx.fillStyle = `rgba(218,233,255,${.12 + (i % 4) * .09})`;
      ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, 1);
    }
    const p = smooth((t - 1.5) / 3.2);
    const size = 700 * Math.exp(p * 2.15);
    // Aim at the western South American coast in the supplied Earth photograph.
    const cx = lerp(920, 640, smooth((t - 1.2) / 2.6));
    const cy = lerp(425, 360, smooth((t - 1.2) / 2.6));
    ctx.drawImage(earth, cx - size * .512, cy - size * (earth.height / earth.width) * .583,
      size, size * earth.height / earth.width);
    const shade = ctx.createLinearGradient(0, 0, 850, 0);
    shade.addColorStop(0, 'rgba(4,7,13,.96)'); shade.addColorStop(1, 'rgba(4,7,13,0)');
    ctx.fillStyle = shade; ctx.globalAlpha = 1 - smooth((t - 2) / 1.1); ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(-40 * smooth((t - 1.8) / 1.3), 0);
    text('RENTING CAR A&M', 76, 214, 16, '#ffad32', 700);
    text('Tu próximo viaje', 72, 303, 56, '#fff', 700);
    text('empieza aquí.', 72, 369, 56, '#fff', 700);
    text('Lima, Perú · Nuestra sede en Surco', 76, 426, 21, '#c3ccd8');
    ctx.restore(); ctx.globalAlpha = 1;
    if (t > 2.6) {
      ctx.globalAlpha = smooth((t - 2.6) / .4) * (1 - smooth((t - 3.9) / .6));
      roundRect(511, 324, 258, 72, 36, '#07111dd9');
      text('LIMA, PERÚ', 559, 368, 24, '#fff', 700);
      ctx.globalAlpha = 1;
    }
  }
  if (t >= 4.2) {
    const p = smooth((t - 4.2) / 4);
    // Gentle settle on the authentic facade, keeping the complete supplied capture visible at the end.
    const scale = lerp(1.1, 1, p);
    const width = W * scale, height = width * office.height / office.width;
    ctx.globalAlpha = smooth((t - 4.2) / .65);
    ctx.drawImage(office, (W - width) / 2, (H - height) / 2, width, height);
    ctx.globalAlpha = 1;
    const shade = ctx.createLinearGradient(0, H * .48, 0, H);
    shade.addColorStop(0, 'rgba(2,8,15,0)'); shade.addColorStop(1, 'rgba(2,8,15,.97)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);
    const a = smooth((t - 5.8) / 1.2);
    ctx.globalAlpha = a;
    // Marker over the grey office, without replacing its real signs or architecture.
    const mx = 710, my = 226;
    ctx.beginPath(); ctx.arc(mx, my, 11, 0, Math.PI * 2); ctx.fillStyle = '#ff9d00'; ctx.fill();
    ctx.beginPath(); ctx.arc(mx, my, 21, 0, Math.PI * 2); ctx.strokeStyle = '#ffb64d'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, my + 25); ctx.lineTo(mx, my + 57); ctx.stroke();
    roundRect(mx - 100, my - 64, 200, 34, 17, '#07111de8');
    text('NUESTRA OFICINA', mx - 77, my - 41, 15, '#fff', 700);
    brand(74, 502, 195);
    text('Nos vemos en Surco.', 60, 619, 45, '#fff', 700);
    text('Av. Santiago de Surco 3573 · Lima', 63, 659, 23, '#d5deea');
    roundRect(967, 607, 254, 49, 24, '#ff9d00');
    text('rentingcaraym.com', 992, 639, 21, '#10151c', 700);
    ctx.globalAlpha = 1;
    // Attribution survives the reframing as well as the supplied screenshot's original overlay.
    text('Imagen de referencia: Google Street View · oct. 2025', 829, 697, 14, '#e4e9f0');
  }
  // A soft atmospheric transition communicates the edit between two photographs.
  const clouds = smooth((t - 3.65) / .65) * (1 - smooth((t - 4.55) / .85));
  if (clouds > 0) {
    ctx.globalAlpha = clouds;
    ctx.fillStyle = '#e5ecf2'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) {
      const x = (i * 317 + t * (i % 2 ? 45 : -60)) % (W + 500) - 150;
      const y = (i * 219) % H;
      const gradient = ctx.createRadialGradient(x, y, 10, x, y, 350);
      gradient.addColorStop(0, '#fff'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }
}

// Poster uses the supplied vehicle as an editorial cover, not as a fabricated office scene.
ctx.drawImage(vehicle, 0, -40, W, W * vehicle.height / vehicle.width);
const coverShade = ctx.createLinearGradient(0, 0, W, 0);
coverShade.addColorStop(0, 'rgba(3,9,18,.96)'); coverShade.addColorStop(1, 'rgba(3,9,18,.1)');
ctx.fillStyle = coverShade; ctx.fillRect(0, 0, W, H);
text('RENTING CAR A&M / SURCO, LIMA', 66, 250, 17, '#ffaf40', 700);
text('De la Tierra', 62, 334, 63, '#fff', 700);
text('a nuestra sede.', 62, 407, 63, '#fff', 700);
text('Un recorrido de 12 segundos.', 66, 462, 25, '#e4eaf1');
await writeFile(`${directory}/poster.jpg`, canvas.toBuffer('image/jpeg', 88));
const output = `${directory}/tierra-a-surco.mp4`;
const proc = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo',
  '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(fps), '-i', 'pipe:0', '-an',
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', output], { stdio: ['pipe', 'ignore', 'inherit'], windowsHide: true });
const completion = new Promise((resolve, reject) => {
  proc.once('error', reject);
  proc.once('exit', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)));
});
for (let frame = 0; frame < duration * fps; frame++) {
  draw(frame / fps);
  if ([0, 90, 150, 240, 359].includes(frame)) {
    await writeFile(`artifacts/journey-preview/frame-${frame}.jpg`, canvas.toBuffer('image/jpeg', 88));
  }
  if (!proc.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data))) await once(proc.stdin, 'drain');
}
proc.stdin.end();
await completion;
console.log(`Rendered ${output}: ${duration}s, ${W}x${H}, ${fps}fps, silent.`);
