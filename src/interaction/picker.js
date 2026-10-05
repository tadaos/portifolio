// @ts-check
import * as THREE from 'three';
import { state } from '../state.js';
import { animate, easeOutCubic } from '../util/tween.js';

const HOVER_EMISSIVE = new THREE.Color(0x5a3c16);
const PHASE = { computer: 0, tv: 2.1, corkboard: 4.2 };

/**
 * @param {{
 *   canvas: HTMLCanvasElement,
 *   camera: THREE.Camera,
 *   interactables: Record<string, {group: THREE.Group, hitbox: THREE.Mesh, materials: THREE.MeshStandardMaterial[]}>,
 *   rig: { focusOn: (id: any) => Promise<void>, returnToOverview: () => Promise<void>, setMouse: (x:number, y:number) => void },
 *   onHover?: (id: string|null, x: number, y: number) => void,
 * }} opts
 */
export function createPicker({ canvas, camera, interactables, rig, onHover }) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hitboxes = Object.values(interactables).map((i) => i.hitbox);
  /** @type {string|null} */
  let hovered = null;
  let dirty = false;
  /** @type {{x:number, y:number}|null} */
  let down = null;
  const last = { x: 0, y: 0 };
  /** @type {Map<string, {cancel: () => void}>} */
  const pulses = new Map();

  function updateNdc(e) {
    ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    last.x = e.clientX;
    last.y = e.clientY;
  }

  function pick() {
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hitboxes, false)[0];
    return hit ? /** @type {string} */ (hit.object.userData.focusId) : null;
  }

  /** Intensidade do brilho (0..1) aplicada a todos os materiais de um objeto. @param {string} id @param {number} k */
  function applyEmissive(id, k) {
    const item = interactables[id];
    if (!item) return;
    for (const m of item.materials) {
      if (m.userData.baseEmissive === undefined) m.userData.baseEmissive = m.emissive.getHex();
      if (m.userData.baseEmissive !== 0) continue; // LEDs e lâmpadas mantêm o próprio brilho
      m.emissive.copy(HOVER_EMISSIVE).multiplyScalar(k);
    }
  }

  /** @param {string} id @param {boolean} on */
  function applyHover(id, on) {
    const item = interactables[id];
    if (!item) return;
    pulses.get(id)?.cancel();
    const from = item.group.scale.x;
    const to = on ? 1.012 : 1;
    pulses.set(
      id,
      animate({
        duration: 0.18,
        ease: easeOutCubic,
        onUpdate: (k) => item.group.scale.setScalar(from + (to - from) * k),
      })
    );
  }

  /** @param {string|null} id */
  function setHover(id) {
    if (id === hovered) {
      if (id) onHover?.(id, last.x, last.y);
      return;
    }
    if (hovered) applyHover(hovered, false);
    hovered = id;
    if (hovered) applyHover(hovered, true);
    canvas.style.cursor = hovered ? 'pointer' : '';
    onHover?.(hovered, last.x, last.y);
  }

  canvas.addEventListener('pointermove', (e) => {
    updateNdc(e);
    rig.setMouse(ndc.x, ndc.y);
    dirty = true;
  });
  canvas.addEventListener('pointerleave', () => {
    if (hovered) setHover(null);
  });
  canvas.addEventListener('pointerdown', (e) => {
    updateNdc(e);
    down = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6;
    down = null;
    if (moved) return;
    updateNdc(e);
    if (state.mode === 'overview') {
      const id = pick();
      if (id) {
        setHover(null);
        rig.focusOn(id);
      }
    } else if (state.mode === 'focused') {
      rig.returnToOverview();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (state.mode === 'focused' || state.mode === 'focusing')) {
      rig.returnToOverview();
    }
  });

  let glowing = false;

  /** @param {number} t segundos desde o início */
  function update(t) {
    if (state.mode !== 'overview') {
      if (hovered) setHover(null);
      if (glowing) {
        for (const id of Object.keys(interactables)) applyEmissive(id, 0);
        glowing = false;
      }
      dirty = false;
      return;
    }
    if (dirty) {
      dirty = false;
      setHover(pick());
    }
    // Pulso lento de brilho nos objetos clicáveis; o objeto sob o cursor fica no máximo.
    glowing = true;
    for (const id of Object.keys(interactables)) {
      const k = id === hovered ? 0.55 : state.reducedMotion ? 0.14 : 0.12 + 0.08 * Math.sin(t * 1.6 + PHASE[id]);
      applyEmissive(id, k);
    }
  }

  /** Hover vindo de fora (marcadores HTML). @param {string|null} id */
  function hover(id) {
    if (state.mode !== 'overview') return;
    setHover(id);
  }

  return { update, hover };
}
