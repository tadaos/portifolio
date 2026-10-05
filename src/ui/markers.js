// @ts-check
import * as THREE from 'three';
import { content } from '../content.js';
import { t } from './i18n.js';
import { state, on } from '../state.js';

/** Ponto do mundo acima de cada objeto onde o marcador é ancorado. */
const ANCHORS = {
  computer: new THREE.Vector3(-2.0, 1.52, -2.35),
  tv: new THREE.Vector3(0.7, 1.45, -2.15),
  corkboard: new THREE.Vector3(2.9, 2.18, 0.15),
};

/**
 * Marcadores HTML projetados sobre os objetos interativos. Visíveis só na visão geral.
 * @param {{
 *   camera: THREE.Camera,
 *   onSelect: (id: string) => void,
 *   onHover: (id: string|null) => void,
 * }} opts
 */
export function createMarkers({ camera, onSelect, onHover }) {
  const root = document.createElement('div');
  root.className = 'markers';
  document.body.appendChild(root);

  /** @type {Record<string, {el: HTMLButtonElement, label: HTMLElement}>} */
  const items = {};
  const v = new THREE.Vector3();

  for (const id of Object.keys(ANCHORS)) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'marker';
    el.dataset.id = id;
    el.innerHTML = '<span class="marker__label"></span><span class="marker__arrow"></span>';
    el.addEventListener('click', () => onSelect(id));
    el.addEventListener('pointerenter', () => onHover(id));
    el.addEventListener('pointerleave', () => onHover(null));
    el.addEventListener('focus', () => onHover(id));
    el.addEventListener('blur', () => onHover(null));
    root.appendChild(el);
    items[id] = { el, label: /** @type {HTMLElement} */ (el.querySelector('.marker__label')) };
  }

  function render() {
    for (const [id, { label, el }] of Object.entries(items)) {
      label.textContent = t(content.ui.labels[id]);
      el.setAttribute('aria-label', t(content.ui.labels[id]));
    }
  }

  function updateVisibility() {
    const visible = state.mode === 'overview';
    root.classList.toggle('markers--visible', visible);
    for (const { el } of Object.values(items)) el.tabIndex = visible ? 0 : -1;
  }

  /** @param {string|null} id */
  function highlight(id) {
    for (const [key, { el }] of Object.entries(items)) el.classList.toggle('marker--hot', key === id);
  }

  /** Reposiciona os marcadores a partir da câmera. Chamar a cada frame. */
  function update() {
    if (state.mode !== 'overview' && state.mode !== 'returning' && state.mode !== 'entering') return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const [id, { el }] of Object.entries(items)) {
      v.copy(ANCHORS[id]).project(camera);
      const behind = v.z > 1;
      // Mantém o marcador dentro da tela mesmo quando o objeto encosta na borda.
      const x = Math.min(w - 70, Math.max(70, ((v.x + 1) / 2) * w));
      const y = Math.min(h - 60, Math.max(70, ((1 - v.y) / 2) * h));
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      el.style.visibility = behind ? 'hidden' : '';
    }
  }

  render();
  updateVisibility();
  on('langchange', render);
  on('modechange', updateVisibility);

  return { update, highlight };
}
