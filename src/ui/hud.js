// @ts-check
import { content } from '../content.js';
import { t, toggleLang } from './i18n.js';
import { state, on } from '../state.js';

/** @param {{ rig: { returnToOverview: () => Promise<void> } }} opts */
export function initHud({ rig }) {
  const back = /** @type {HTMLButtonElement} */ (document.getElementById('back'));
  const lang = /** @type {HTMLButtonElement} */ (document.getElementById('lang'));
  const hint = /** @type {HTMLElement} */ (document.getElementById('hint'));
  const tip = /** @type {HTMLElement} */ (document.getElementById('tooltip'));
  /** @type {string|null} */
  let tipId = null;

  function render() {
    lang.textContent = t(content.ui.langToggle);
    back.textContent = state.coarse ? t(content.ui.back) : `[ESC] ${t(content.ui.back)}`;
    const focused = state.mode === 'focused' || state.mode === 'focusing';
    back.hidden = !focused;
    if (state.mode === 'overview') {
      hint.textContent = t(content.ui.hintOverview);
    } else if (focused) {
      hint.textContent = t(state.coarse ? content.ui.hintFocusedTouch : content.ui.hintFocused);
    } else {
      hint.textContent = '';
    }
    hint.hidden = state.mode === 'start' || state.mode === 'entering';
    if (tipId) tip.textContent = t(content.ui.labels[tipId]);
  }

  /** @param {string|null} id @param {number} x @param {number} y */
  function tooltip(id, x, y) {
    if (!id || state.coarse) {
      tipId = null;
      tip.hidden = true;
      return;
    }
    if (tipId !== id) {
      tipId = id;
      tip.textContent = t(content.ui.labels[id]);
      tip.hidden = false;
    }
    const flip = x > window.innerWidth - 160;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
    tip.style.transform = flip ? 'translate(calc(-100% - 14px), 14px)' : 'translate(14px, 14px)';
  }

  lang.addEventListener('click', toggleLang);
  back.addEventListener('click', () => rig.returnToOverview());
  on('modechange', render);
  on('langchange', render);
  render();

  return { render, tooltip };
}
