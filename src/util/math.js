// @ts-check
/** Aproximação exponencial independente de frame rate. */
export function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a, b, k) {
  return a + (b - a) * k;
}

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function randSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

/** @template T @param {T[]} arr @returns {T} */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
