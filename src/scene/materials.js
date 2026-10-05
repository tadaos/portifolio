// @ts-check
import * as THREE from 'three';

export const PALETTE = {
  wall: 0x2a2648,
  wallSide: 0x252242,
  floor: 0x6b4f3a,
  baseboard: 0x2b2420,
  rug: 0x7a3b3b,
  rugEdge: 0xc9a46d,
  desk: 0x8a6a4a,
  deskDark: 0x5e4630,
  beige: 0xd9cfae,
  beigeDark: 0xb8ae8c,
  dark: 0x2a2a2e,
  plastic: 0x3c3c42,
  plasticLight: 0x6a6a72,
  crt: 0x0b100b,
  cork: 0xb98b5a,
  corkFrame: 0x4a3524,
  note1: 0xf7e36b,
  note2: 0xf6a5c0,
  note3: 0x9fd7f0,
  note4: 0xbdf09a,
  paper: 0xf1e9d2,
  photo: 0xffffff,
  ink: 0x2b2b3a,
  cable: 0x111114,
  pizza: 0xc9a46d,
  pizzaDark: 0xa8844f,
  mug: 0xe9e4d6,
  mugRed: 0xb63a3a,
  metal: 0x8f9499,
  chair: 0x23232b,
  chairSeat: 0x3a3a4a,
  lampShade: 0x3f6b4a,
  lampBulb: 0xffd79a,
  bean: 0x4b6b9a,
  book: [0xb63a3a, 0x2f6b8f, 0xd9a441, 0x4b8f5a, 0x6c4b8f, 0xd96a3a, 0xe9e4d6],
  console: 0x9a9aa0,
  consoleDark: 0x5c5c66,
  cartridge: 0x8a8a92,
  cartridgeLabel: [0xd94c3a, 0x3a7fd9, 0xe0b73a, 0x5ab35a],
  can: [0xd93a3a, 0x3a6fd9, 0x5ab35a],
  plant: 0x3f8f4a,
  pot: 0xb86a3a,
  pin: [0xd93a3a, 0x3a6fd9, 0xe0b73a, 0x5ab35a],
  window: 0x1a0c3a,
  moon: 0xdfe8ff,
  string: 0xd93a3a,
};

/** @type {Map<string, THREE.MeshStandardMaterial>} */
const cache = new Map();

/**
 * Material MeshStandard com cache por parâmetros.
 * @param {number} color
 * @param {{ roughness?: number, metalness?: number, emissive?: number, emissiveIntensity?: number, flatShading?: boolean, side?: THREE.Side, unique?: boolean, transparent?: boolean, opacity?: number }} [opts]
 */
export function mat(color, opts = {}) {
  const {
    roughness = 0.9,
    metalness = 0,
    emissive = 0x000000,
    emissiveIntensity = 1,
    flatShading = false,
    side = THREE.FrontSide,
    unique = false,
    transparent = false,
    opacity = 1,
  } = opts;
  const key = [color, roughness, metalness, emissive, emissiveIntensity, flatShading, side, transparent, opacity].join('|');
  if (!unique && cache.has(key)) return cache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
    flatShading,
    side,
    transparent,
    opacity,
  });
  if (!unique) cache.set(key, m);
  return m;
}

/** @param {THREE.Mesh} mesh @param {boolean} [cast] @param {boolean} [receive] */
function shadows(mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

/** @param {number} w @param {number} h @param {number} d @param {THREE.Material} material */
export function box(w, h, d, material, cast = true) {
  return shadows(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material), cast);
}

/** Cilindro. @param {number} rt @param {number} rb @param {number} h @param {number} seg @param {THREE.Material} material */
export function cyl(rt, rb, h, seg, material, cast = true, openEnded = false) {
  return shadows(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, openEnded), material), cast);
}

/** @param {number} r @param {number} ws @param {number} hs @param {THREE.Material} material */
export function sphere(r, ws, hs, material, cast = true) {
  return shadows(new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), material), cast);
}

/** @param {number} w @param {number} h @param {THREE.Material} material */
export function plane(w, h, material) {
  return shadows(new THREE.Mesh(new THREE.PlaneGeometry(w, h), material), false, true);
}

/**
 * Posiciona e opcionalmente rotaciona um objeto. Devolve o próprio objeto.
 * @template {THREE.Object3D} T
 * @param {T} obj
 */
export function at(obj, x, y, z, rx = 0, ry = 0, rz = 0) {
  obj.position.set(x, y, z);
  obj.rotation.set(rx, ry, rz);
  return obj;
}

/**
 * Clona os materiais de um grupo para que efeitos (hover emissivo) não vazem
 * para outros objetos que compartilham o cache. Devolve a lista de materiais únicos.
 * @param {THREE.Object3D} group
 * @returns {THREE.MeshStandardMaterial[]}
 */
export function makeUnique(group) {
  /** @type {Map<THREE.Material, THREE.MeshStandardMaterial>} */
  const clones = new Map();
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (!(obj.material instanceof THREE.MeshStandardMaterial)) return;
    if (obj.userData.noHover) return;
    let clone = clones.get(obj.material);
    if (!clone) {
      clone = obj.material.clone();
      clones.set(obj.material, clone);
    }
    obj.material = clone;
  });
  return [...clones.values()];
}
