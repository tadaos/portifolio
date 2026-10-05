// @ts-check
import { emit } from '../state.js';

/** @typedef {'pt'|'en'} Lang */
const KEY = 'tds.lang';

/** @type {Lang} */
let lang = readInitial();

function readInitial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {}
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function getLang() {
  return lang;
}

/** @param {Lang} next */
export function setLang(next) {
  if (next === lang) return;
  lang = next;
  try {
    localStorage.setItem(KEY, lang);
  } catch {}
  applyHtmlLang();
  emit('langchange', lang);
}

export function toggleLang() {
  setLang(lang === 'pt' ? 'en' : 'pt');
}

export function applyHtmlLang() {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
}

/**
 * Resolve um valor traduzível. Objetos { pt, en } viram a string do idioma atual;
 * qualquer outro valor é devolvido como está.
 * @template T
 * @param {T | {pt: T, en: T}} value
 * @returns {T}
 */
export function t(value) {
  if (value && typeof value === 'object' && 'pt' in value && 'en' in value) {
    return /** @type {any} */ (value)[lang];
  }
  return /** @type {T} */ (value);
}
