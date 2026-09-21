import * as THREE from 'three';

// Generates a perfectly smooth circular radial glow texture
export function createRadialGlowTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cx = 128;
  const cy = 128;
  const radius = 120;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, `${colorHex}40`);
  grad.addColorStop(0.35, `${colorHex}18`);
  grad.addColorStop(0.7, `${colorHex}05`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generates a soft, luminous solar corona texture (zero hard edges, zero gray artifacts)
export function createCoronaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cx = 256;
  const cy = 256;
  const radius = 250;

  const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, radius);
  grad.addColorStop(0, 'rgba(255, 230, 140, 0.35)');
  grad.addColorStop(0.25, 'rgba(255, 200, 90, 0.18)');
  grad.addColorStop(0.55, 'rgba(255, 160, 50, 0.07)');
  grad.addColorStop(0.85, 'rgba(240, 120, 30, 0.02)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 8-15% organic, cloudy/marbled procedural surface variations tailored per topic
export function createPlanetTexture(
  _type: string,
  baseColorHex: string,
  secondaryColorHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const base = new THREE.Color(baseColorHex);
  const secondary = new THREE.Color(secondaryColorHex);
  const light = base.clone().lerp(new THREE.Color('#ffffff'), 0.12);
  const dark = secondary.clone().lerp(new THREE.Color('#000000'), 0.14);

  // 1. Soft atmospheric base gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, dark.getStyle());
  grad.addColorStop(0.3, secondary.getStyle());
  grad.addColorStop(0.5, light.getStyle());
  grad.addColorStop(0.7, base.getStyle());
  grad.addColorStop(1, dark.getStyle());
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // 2. Soft organic cloudy patches (low-frequency cellular variation)
  for (let i = 0; i < 14; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 256;
    const rx = Math.random() * 75 + 30;
    const ry = Math.random() * 25 + 10;

    const cloudGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    const alpha = Math.random() * 0.05 + 0.02;
    cloudGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    cloudGrad.addColorStop(0.7, `rgba(255,255,255,${alpha * 0.25})`);
    cloudGrad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Subtle darker depth patches
  for (let i = 0; i < 10; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 256;
    const rx = Math.random() * 65 + 25;
    const ry = Math.random() * 22 + 8;

    const darkGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    const alpha = Math.random() * 0.06 + 0.02;
    darkGrad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    darkGrad.addColorStop(0.7, `rgba(0,0,0,${alpha * 0.2})`);
    darkGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = darkGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Subtle fine micro-grain noise
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 1.2 + 0.4;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.018)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
