// @ts-check
import { content } from '../content.js';
import { t } from './i18n.js';
import { state, on } from '../state.js';

/** @param {{ onStart: () => void }} opts */
export function initStartScreen({ onStart }) {
  const el = /** @type {HTMLElement} */ (document.getElementById('start'));
  const title = /** @type {HTMLElement} */ (document.getElementById('start-title'));
  const sub = /** @type {HTMLElement} */ (document.getElementById('start-sub'));
  const press = /** @type {HTMLElement} */ (document.getElementById('start-press'));
  const coin = /** @type {HTMLElement} */ (document.getElementById('start-coin'));
  let started = false;

  function render() {
    title.textContent = content.meta.handle.toUpperCase();
    sub.textContent = t(content.meta.title);
    press.textContent = t(state.coarse ? content.ui.tapStart : content.ui.pressStart);
    coin.textContent = `${t(content.ui.insertCoin)} · ${content.meta.year}`;
  }

  function start() {
    if (started) return;
    started = true;
    window.removeEventListener('keydown', onKey);
    el.classList.add('start--out');
    const hide = () => {
      el.hidden = true;
    };
    el.addEventListener('transitionend', hide, { once: true });
    setTimeout(hide, 900);
    onStart();
  }

  /** @param {KeyboardEvent} e */
  function onKey(e) {
    if (e.key === 'Tab' || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
    if (e.target instanceof HTMLButtonElement) return;
    start();
  }

  render();
  on('langchange', render);
  window.addEventListener('keydown', onKey);
  el.addEventListener('pointerdown', start);
  el.addEventListener('touchstart', start, { passive: true });

  return { start };
}
