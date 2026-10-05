// @ts-check
import * as THREE from 'three';
import { PALETTE, mat, box, cyl, sphere, plane, at } from './materials.js';
import { createNoteTexture } from './screens.js';

const NOTE_COLORS = ['#f7e36b', '#f6a5c0', '#9fd7f0', '#bdf09a', '#f7e36b', '#f6a5c0', '#9fd7f0', '#f1e9d2'];
const NOTE_WORDS = [['TODO', 'fix bug'], ['deploy', 'sexta'], ['ler', 'docs'], ['cafe!'], ['idea:', 'jogo'], ['dentista', '14h'], ['backup', 'saves'], ['ligar', 'pra mae']];

/** Quadro de cortiça na parede lateral. Origem em (2.98, 1.55, 0.15), virado para -X. */
export function createCorkboard() {
  const group = new THREE.Group();
  group.position.set(2.98, 1.55, 0.15);
  group.rotation.y = -Math.PI / 2;

  group.add(box(1.5, 1.0, 0.03, mat(PALETTE.corkFrame)));
  const cork = plane(1.42, 0.92, mat(PALETTE.cork, { roughness: 1 }));
  group.add(at(cork, 0, 0, 0.016));

  // Notas em grade 4x2 com jitter
  const pinPositions = [];
  for (let i = 0; i < 8; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = -0.52 + col * 0.35 + (Math.sin(i * 7.3) * 0.04);
    const y = 0.22 - row * 0.42 + (Math.cos(i * 3.1) * 0.03);
    const tex = createNoteTexture(NOTE_COLORS[i], NOTE_WORDS[i]);
    const noteMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 });
    const note = plane(0.17, 0.17, noteMat);
    note.castShadow = false;
    group.add(at(note, x, y, 0.022, 0, 0, Math.sin(i * 5.7) * 0.15));
    pinPositions.push(new THREE.Vector3(x, y + 0.07, 0.03));
  }

  // Fotos com borda branca
  const photoSpots = [
    [0.55, -0.02, -0.08],
    [-0.15, 0.0, 0.1],
  ];
  photoSpots.forEach(([x, y, rz], i) => {
    const frame = plane(0.2, 0.15, mat(PALETTE.photo, { roughness: 0.8 }));
    frame.castShadow = false;
    group.add(at(frame, x, y, 0.024, 0, 0, rz));
    const img = plane(0.17, 0.11, mat(i === 0 ? 0x2f6b8f : 0x4b8f5a, { roughness: 0.8 }));
    img.castShadow = false;
    group.add(at(img, x, y + 0.008, 0.026, 0, 0, rz));
    pinPositions.push(new THREE.Vector3(x, y + 0.065, 0.03));
  });

  // Alfinetes
  const pinHead = (c) => mat(c, { roughness: 0.4, metalness: 0.1 });
  const pinNeedle = mat(PALETTE.metal, { metalness: 0.8, roughness: 0.3 });
  pinPositions.forEach((p, i) => {
    group.add(at(sphere(0.013, 8, 8, pinHead(PALETTE.pin[i % 4]), false), p.x, p.y, p.z + 0.01));
    const needle = cyl(0.002, 0.002, 0.02, 5, pinNeedle, false);
    group.add(at(needle, p.x, p.y, p.z, Math.PI / 2, 0, 0));
  });

  // Barbante vermelho ligando dois alfinetes
  const a = pinPositions[1];
  const b = pinPositions[6];
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const string = cyl(0.0025, 0.0025, len, 5, mat(PALETTE.string), false);
  string.position.copy(a).add(b).multiplyScalar(0.5);
  string.position.z += 0.012;
  string.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  group.add(string);

  // Prateleira com planta e alguns livros abaixo do quadro
  const shelf = new THREE.Group();
  shelf.position.set(0, -0.68, 0.08);
  shelf.add(box(1.0, 0.03, 0.16, mat(PALETTE.deskDark)));
  shelf.add(at(box(0.03, 0.08, 0.14, mat(PALETTE.deskDark)), -0.4, -0.055, 0));
  shelf.add(at(box(0.03, 0.08, 0.14, mat(PALETTE.deskDark)), 0.4, -0.055, 0));
  const pot = cyl(0.05, 0.04, 0.09, 10, mat(PALETTE.pot));
  shelf.add(at(pot, 0.3, 0.06, 0));
  const leaves = mat(PALETTE.plant, { flatShading: true });
  shelf.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 6), leaves), 0.3, 0.18, 0));
  shelf.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 5), leaves), 0.34, 0.26, 0.02));
  const bookColors = PALETTE.book;
  for (let k = 0; k < 5; k++) {
    shelf.add(at(box(0.03, 0.14 + (k % 3) * 0.02, 0.11, mat(bookColors[(k + 2) % bookColors.length])), -0.35 + k * 0.035, 0.085 + (k % 3) * 0.01, 0));
  }
  // um gameboy apoiado
  shelf.add(at(box(0.07, 0.12, 0.02, mat(0xb8b0a0)), 0.05, 0.075, 0.02, -0.25, 0, 0));
  shelf.add(at(box(0.045, 0.04, 0.005, mat(0x8a9a5a)), 0.05, 0.1, 0.034, -0.25, 0, 0));
  group.add(shelf);

  // Hitbox invisível
  const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.16), new THREE.MeshBasicMaterial());
  hitbox.visible = false;
  hitbox.position.set(0, 0, 0.05);
  hitbox.userData.focusId = 'corkboard';
  group.add(hitbox);

  return { group, hitbox };
}
