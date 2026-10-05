// @ts-check
import { state } from '../state.js';

export const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
export const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);
export const linear = (x) => x;

/**
 * @typedef {object} Tween
 * @property {number} elapsed
 * @property {number} duration
 * @property {(x:number)=>number} ease
 * @property {(k:number, raw:number)=>void} onUpdate
 * @property {(done:boolean)=>void} resolve
 * @property {boolean} done
 */

/** @type {Tween[]} */
const active = [];

/**
 * Anima de 0 a 1 ao longo de `duration` segundos.
 * @param {{ duration: number, ease?: (x:number)=>number, onUpdate: (k:number, raw:number)=>void }} opts
 * @returns {{ promise: Promise<boolean>, cancel: () => void }}
 */
export function animate({ duration, ease = easeInOutCubic, onUpdate }) {
  const d = Math.max(0.001, state.reducedMotion ? Math.min(duration, 0.25) : duration);
  let resolve = (/** @type {boolean} */ _v) => {};
  const promise = new Promise((r) => (resolve = r));
  /** @type {Tween} */
  const tw = { elapsed: 0, duration: d, ease, onUpdate, resolve, done: false };
  active.push(tw);
  return {
    promise,
    cancel() {
      if (tw.done) return;
      tw.done = true;
      const i = active.indexOf(tw);
      if (i >= 0) active.splice(i, 1);
      tw.resolve(false);
    },
  };
}

/** Chamado uma vez por frame. @param {number} dt segundos */
export function updateTweens(dt) {
  for (let i = active.length - 1; i >= 0; i--) {
    const tw = active[i];
    if (!tw || tw.done) continue;
    tw.elapsed += dt;
    const raw = Math.min(1, tw.elapsed / tw.duration);
    tw.onUpdate(tw.ease(raw), raw);
    if (raw >= 1 && !tw.done) {
      tw.done = true;
      const j = active.indexOf(tw);
      if (j >= 0) active.splice(j, 1);
      tw.resolve(true);
    }
  }
}
