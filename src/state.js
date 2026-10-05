// @ts-check
/** @typedef {'start'|'entering'|'overview'|'focusing'|'focused'|'returning'} Mode */
/** @typedef {'computer'|'tv'|'corkboard'} FocusId */

export const state = {
  /** @type {Mode} */
  mode: 'start',
  /** @type {FocusId|null} */
  focusId: null,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  coarse: window.matchMedia('(pointer: coarse)').matches,
  debug: new URLSearchParams(location.search).has('debug'),
};

/** @type {Map<string, Set<(data?: any) => void>>} */
const listeners = new Map();

/**
 * @param {string} event
 * @param {(data?: any) => void} cb
 * @returns {() => void} unsubscribe
 */
export function on(event, cb) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(cb);
  return () => listeners.get(event)?.delete(cb);
}

/** @param {string} event @param {any} [data] */
export function emit(event, data) {
  listeners.get(event)?.forEach((cb) => cb(data));
}

/** @param {Mode} mode */
export function setMode(mode) {
  if (state.mode === mode) return;
  state.mode = mode;
  emit('modechange', mode);
}
