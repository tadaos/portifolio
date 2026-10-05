// @ts-check
import * as THREE from 'three';
import { PALETTE, mat, box, plane, at, makeUnique } from './materials.js';
import { createDesk } from './desk.js';
import { createTv } from './tv.js';
import { createCorkboard } from './corkboard.js';
import { createProps } from './props.js';

/**
 * Monta o quarto inteiro e devolve o que o resto da app precisa.
 * @param {THREE.Scene} scene
 */
export function buildRoom(scene) {
  const room = new THREE.Group();

  // Chão com ripas
  const floor = plane(8, 8, mat(PALETTE.floor, { roughness: 0.85 }));
  room.add(at(floor, -1, 0, 1, -Math.PI / 2, 0, 0));
  const seam = mat(0x55402e);
  for (let z = -2.8; z < 5; z += 0.36) {
    const line = box(8, 0.002, 0.012, seam, false);
    line.receiveShadow = true;
    room.add(at(line, -1, 0.001, z));
  }

  // Paredes (fundo em z=-3, lateral em x=3)
  room.add(at(plane(8, 3, mat(PALETTE.wall, { roughness: 1 })), -1, 1.5, -3));
  room.add(at(plane(8, 3, mat(PALETTE.wallSide, { roughness: 1 })), 3, 1.5, 1, 0, -Math.PI / 2, 0));
  room.add(at(box(8, 0.1, 0.02, mat(PALETTE.baseboard), false), -1, 0.05, -2.99));
  room.add(at(box(0.02, 0.1, 8, mat(PALETTE.baseboard), false), 2.99, 0.05, 1));

  // Janela na parede lateral com noite lá fora
  const win = new THREE.Group();
  win.position.set(2.975, 1.75, 2.4);
  win.rotation.y = -Math.PI / 2;
  win.add(plane(0.9, 1.1, mat(PALETTE.window, { emissive: PALETTE.window, emissiveIntensity: 0.9 })));
  const winFrame = mat(PALETTE.paper);
  win.add(at(box(0.98, 0.05, 0.05, winFrame, false), 0, 0.575, 0));
  win.add(at(box(0.98, 0.05, 0.05, winFrame, false), 0, -0.575, 0));
  win.add(at(box(0.05, 1.2, 0.05, winFrame, false), -0.465, 0, 0));
  win.add(at(box(0.05, 1.2, 0.05, winFrame, false), 0.465, 0, 0));
  win.add(at(box(0.9, 0.03, 0.03, winFrame, false), 0, 0, 0.005));
  win.add(at(box(0.03, 1.1, 0.03, winFrame, false), 0, 0, 0.005));
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), new THREE.MeshBasicMaterial({ color: PALETTE.moon }));
  win.add(at(moon, 0.22, 0.3, 0.002));
  room.add(win);

  // Tapete
  room.add(at(box(2.3, 0.012, 1.7, mat(PALETTE.rugEdge), false), 0.6, 0.006, -0.9));
  room.add(at(box(2.1, 0.014, 1.5, mat(PALETTE.rug), false), 0.6, 0.007, -0.9));

  // Objetos principais e bagunça
  const desk = createDesk();
  const tv = createTv();
  const cork = createCorkboard();
  const props = createProps();
  room.add(desk.group, tv.group, cork.group, props.group);
  scene.add(room);

  // Objetos minúsculos não projetam sombra: cada luz com sombra re-renderiza todos os casters.
  room.updateMatrixWorld(true);
  const scale = new THREE.Vector3();
  room.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.castShadow) return;
    obj.geometry.computeBoundingSphere();
    obj.getWorldScale(scale);
    const r = (obj.geometry.boundingSphere?.radius ?? 0) * Math.max(scale.x, scale.y, scale.z);
    if (r < 0.16) obj.castShadow = false;
  });

  /** @type {Record<string, {group: THREE.Group, hitbox: THREE.Mesh, materials: THREE.MeshStandardMaterial[]}>} */
  const interactables = {
    computer: { group: desk.group, hitbox: desk.hitbox, materials: makeUnique(desk.group) },
    tv: { group: tv.group, hitbox: tv.hitbox, materials: makeUnique(tv.group) },
    corkboard: { group: cork.group, hitbox: cork.hitbox, materials: makeUnique(cork.group) },
  };

  /** @param {number} t */
  function update(t) {
    desk.update(t);
    tv.update(t);
  }

  return { room, interactables, update, tvGlow: tv.glow };
}
