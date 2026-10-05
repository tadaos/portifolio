// @ts-check
import { templates, themes } from './templates.js';
import { FOCUS } from '../camera/focusPoints.js';
import { toggleLang } from './i18n.js';

/** @param {{ onClose: () => void }} opts */
export function createPanels({ onClose }) {
  const el = /** @type {HTMLElement} */ (document.getElementById('panel'));
  /** @type {string|null} */
  let openId = null;

  function bind() {
    el.querySelector('.panel__close')?.addEventListener('click', onClose);
    el.querySelector('.panel__lang')?.addEventListener('click', toggleLang);
  }

  /** @param {'computer'|'tv'|'corkboard'} id */
  function open(id) {
    openId = id;
    el.className = `panel panel--${themes[id]} panel--${FOCUS[id].panelSide}`;
    el.innerHTML = templates[id]();
    el.hidden = false;
    el.scrollTop = 0;
    document.body.classList.add('is-focused');
    bind();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (openId !== id) return;
        el.classList.add('panel--open');
        /** @type {HTMLElement|null} */ (el.querySelector('.panel__title'))?.focus({ preventScroll: true });
      })
    );
  }

  function close() {
    if (!openId) return;
    openId = null;
    document.body.classList.remove('is-focused');
    el.classList.remove('panel--open');
    const hide = () => {
      if (!openId) el.hidden = true;
    };
    el.addEventListener('transitionend', hide, { once: true });
    setTimeout(hide, 450);
  }

  function rerender() {
    if (!openId) return;
    const id = /** @type {'computer'|'tv'|'corkboard'} */ (openId);
    el.innerHTML = templates[id]();
    bind();
  }

  return { open, close, rerender, get openId() { return openId; } };
}
