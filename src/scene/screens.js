// @ts-check
import * as THREE from 'three';
import { state } from '../state.js';
import { pick } from '../util/math.js';

/** @param {number} w @param {number} h */
function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  return { canvas, ctx };
}

/** @param {HTMLCanvasElement} canvas */
function makeTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

/** Material "ligado": não recebe luz nem tone mapping, fica vivo e brilhante. */
export function screenMaterial(texture) {
  return new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
}

// ---------------------------------------------------------------------------
// Terminal do monitor
// ---------------------------------------------------------------------------
const TERMINAL_LOGS = [
  'git commit -m "fix: sombras no chao"',
  'vite v8  ready in 312 ms',
  'npm test  ...  42 passing',
  'ssh deploy@lofi  ok',
  'warn: cafe.level < 20%',
  'build: dist/ 612 kB gzip 148 kB',
  'docker compose up -d  done',
  'git push origin main',
  'echo "hello, visitor"',
];

export function createTerminalScreen() {
  const W = 256;
  const H = 192;
  const { canvas, ctx } = makeCanvas(W, H);
  const texture = makeTexture(canvas);

  /** @type {string[]} */
  const lines = ['login: dev', 'Last login: Fri 23:41', '', '$ cd ~/portfolio', '$ npm run dev', 'VITE ready in 312 ms', '-> http://localhost:5173'];
  const MAX_LINES = 10;
  let typing = /** @type {{text:string, idx:number}|null} */ (null);
  let nextTypeAt = 4;
  let lastBlink = -1;
  let lastTypedChars = -1;
  let fontReady = false;

  function font(size) {
    return `${size}px "VT323", "Courier New", monospace`;
  }

  function draw(cursorOn) {
    ctx.fillStyle = '#061006';
    ctx.fillRect(0, 0, W, H);
    // vinheta leve nos cantos
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.font = font(18);
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#9fef00';
    const all = typing ? [...lines, '$ ' + typing.text.slice(0, typing.idx)] : [...lines, '$ '];
    const visible = all.slice(-MAX_LINES);
    visible.forEach((line, i) => ctx.fillText(line, 10, 8 + i * 17));
    if (cursorOn) {
      const last = visible[visible.length - 1] ?? '';
      const x = 10 + ctx.measureText(last).width + 2;
      ctx.fillRect(x, 8 + (visible.length - 1) * 17 + 2, 9, 14);
    }
    // scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    texture.needsUpdate = true;
  }

  document.fonts?.ready.then(() => {
    fontReady = true;
    draw(true);
  });
  draw(true);

  /** @param {number} t segundos desde o início */
  function update(t) {
    const blinkHz = state.reducedMotion ? 0.7 : 2;
    const blink = Math.floor(t * blinkHz) % 2;
    let dirty = false;

    if (!state.reducedMotion) {
      if (!typing && t >= nextTypeAt) {
        typing = { text: pick(TERMINAL_LOGS), idx: 0 };
        lastTypedChars = -1;
      }
      if (typing) {
        const chars = Math.min(typing.text.length, Math.floor((t - nextTypeAt) * 22));
        if (chars !== lastTypedChars) {
          typing.idx = chars;
          lastTypedChars = chars;
          dirty = true;
        }
        if (chars >= typing.text.length && t - nextTypeAt > typing.text.length / 22 + 0.6) {
          lines.push('$ ' + typing.text);
          if (lines.length > 40) lines.splice(0, lines.length - 40);
          typing = null;
          nextTypeAt = t + 4 + Math.random() * 5;
          dirty = true;
        }
      }
    }

    if (blink !== lastBlink) {
      lastBlink = blink;
      dirty = true;
    }
    if (dirty) draw(blink === 0);
  }

  return { texture, update, canvas };
}

// ---------------------------------------------------------------------------
// TV de tubo: estática + mini "jogo" alternando
// ---------------------------------------------------------------------------
export function createTvScreen() {
  const W = 128;
  const H = 96;
  const { canvas, ctx } = makeCanvas(W, H);
  const texture = makeTexture(canvas);

  // Frames de ruído pré-gerados
  const FRAMES = 8;
  /** @type {ImageData[]} */
  const noise = [];
  for (let f = 0; f < FRAMES; f++) {
    const img = ctx.createImageData(W, H);
    const px = new Uint32Array(img.data.buffer);
    for (let i = 0; i < px.length; i++) {
      const v = (Math.random() * 190 + 30) | 0;
      // ABGR little-endian; leve tom azulado
      px[i] = (255 << 24) | ((v + 25) << 16) | ((v + 10) << 8) | v;
    }
    noise.push(img);
  }

  const STATIC_SECONDS = 5;
  const GAME_SECONDS = 9;
  const CYCLE = STATIC_SECONDS + GAME_SECONDS;
  const FPS = 12;
  let lastFrame = -1;
  let lastBand = 0;
  const ball = { x: 30, y: 40, vx: 23, vy: 17, size: 10 };
  let lastGameT = 0;

  function drawStatic(frame) {
    ctx.putImageData(noise[((frame % FRAMES) + FRAMES) % FRAMES], 0, 0);
    // faixa escura rolando (CRT roll)
    lastBand = (lastBand + 7) % (H + 20);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, lastBand - 10, W, 12);
  }

  function drawGame(t, dt) {
    ctx.fillStyle = '#102a7a';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1c3d9e';
    for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 1);
    // "chão"
    ctx.fillStyle = '#3a7fd9';
    ctx.fillRect(0, H - 10, W, 10);
    ctx.fillStyle = '#5ab35a';
    ctx.fillRect(0, H - 12, W, 2);

    if (!state.reducedMotion) {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < 0 || ball.x + ball.size > W) ball.vx *= -1;
      if (ball.y < 0 || ball.y + ball.size > H - 12) ball.vy *= -1;
    }
    ctx.fillStyle = '#ffe66d';
    ctx.fillRect(ball.x | 0, ball.y | 0, ball.size, ball.size);
    ctx.fillStyle = '#d93a3a';
    ctx.fillRect((ball.x | 0) + 2, (ball.y | 0) + 2, 3, 3);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe66d';
    ctx.fillText('DEV QUEST', W / 2, 12);
    if (Math.floor(t * 2) % 2 === 0 || state.reducedMotion) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PRESS START', W / 2, H - 28);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1);
  }

  drawStatic(0);
  texture.needsUpdate = true;

  /** @param {number} t */
  function update(t) {
    if (state.reducedMotion) {
      if (lastFrame === -1) {
        drawGame(0, 0);
        texture.needsUpdate = true;
        lastFrame = 0;
      }
      return;
    }
    const frame = Math.floor(t * FPS);
    if (frame === lastFrame) return;
    lastFrame = frame;
    const phase = t % CYCLE;
    if (phase < STATIC_SECONDS) {
      drawStatic(frame);
      lastGameT = t;
    } else {
      const dt = Math.min(0.1, t - lastGameT);
      lastGameT = t;
      drawGame(t, dt);
    }
    texture.needsUpdate = true;
  }

  /** Intensidade de luz sugerida para a TV neste instante (0..1). */
  function glow(t) {
    const phase = t % CYCLE;
    if (phase < STATIC_SECONDS) return 0.75 + Math.sin(t * 23) * 0.12 + Math.sin(t * 7.3) * 0.08;
    return 0.6 + Math.sin(t * 2) * 0.03;
  }

  return { texture, update, glow, canvas };
}

// ---------------------------------------------------------------------------
// Pôsteres estáticos
// ---------------------------------------------------------------------------
/**
 * @param {string[]} lines
 * @param {string} bg
 * @param {string} fg
 * @param {{ accent?: string }} [opts]
 */
export function createPosterTexture(lines, bg, fg, opts = {}) {
  const W = 128;
  const H = 180;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = opts.accent ?? fg;
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, W - 12, H - 12);
  // bloco gráfico simples
  ctx.fillStyle = opts.accent ?? fg;
  ctx.fillRect(24, 28, 80, 60);
  ctx.fillStyle = bg;
  ctx.fillRect(34, 38, 60, 40);
  ctx.fillStyle = opts.accent ?? fg;
  for (let i = 0; i < 5; i++) ctx.fillRect(40 + i * 10, 48 + (i % 2) * 10, 8, 8);

  ctx.font = '12px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = fg;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 104 + i * 22));
  const texture = makeTexture(canvas);
  document.fonts?.ready.then(() => {
    ctx.fillStyle = bg;
    ctx.fillRect(10, 100, W - 20, H - 110);
    ctx.fillStyle = fg;
    ctx.font = '12px "Press Start 2P", monospace';
    lines.forEach((l, i) => ctx.fillText(l, W / 2, 104 + i * 22));
    texture.needsUpdate = true;
  });
  return texture;
}

/**
 * Textura de nota do quadro: fundo colorido com "rabiscos".
 * @param {string} bg
 * @param {string[]} words
 */
export function createNoteTexture(bg, words) {
  const W = 64;
  const H = 64;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(40,40,60,0.85)';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textBaseline = 'top';
  words.forEach((w, i) => ctx.fillText(w, 6, 10 + i * 12));
  // linhas de rabisco
  ctx.fillStyle = 'rgba(40,40,60,0.45)';
  for (let i = words.length; i < 4; i++) {
    const len = 20 + ((i * 17) % 28);
    ctx.fillRect(6, 12 + i * 12, len, 2);
  }
  const texture = makeTexture(canvas);
  document.fonts?.ready.then(() => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(40,40,60,0.85)';
    ctx.font = '7px "Press Start 2P", monospace';
    words.forEach((w, i) => ctx.fillText(w, 6, 10 + i * 12));
    ctx.fillStyle = 'rgba(40,40,60,0.45)';
    for (let i = words.length; i < 4; i++) {
      const len = 20 + ((i * 17) % 28);
      ctx.fillRect(6, 12 + i * 12, len, 2);
    }
    texture.needsUpdate = true;
  });
  return texture;
}
