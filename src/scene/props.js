// @ts-check
import * as THREE from 'three';
import { PALETTE, mat, box, cyl, sphere, plane, at } from './materials.js';
import { createPosterTexture } from './screens.js';

/** Bagunça de dev/gamer espalhada pelo quarto. */
export function createProps() {
  const group = new THREE.Group();
  const cableMat = mat(PALETTE.cable, { roughness: 0.7 });
  const paper = mat(PALETTE.paper, { side: THREE.DoubleSide });

  // Caixa de pizza entreaberta
  const pizza = new THREE.Group();
  pizza.position.set(-0.9, 0, -1.5);
  pizza.rotation.y = 0.35;
  pizza.add(at(box(0.4, 0.04, 0.4, mat(PALETTE.pizza)), 0, 0.02, 0));
  const lid = box(0.4, 0.01, 0.4, mat(PALETTE.pizzaDark));
  lid.position.set(0, 0.045, -0.2);
  lid.geometry.translate(0, 0, 0.2);
  lid.rotation.x = -0.35;
  pizza.add(lid);
  pizza.add(at(cyl(0.16, 0.16, 0.012, 16, mat(0xe0b73a)), 0, 0.046, 0));
  pizza.add(at(cyl(0.08, 0.08, 0.014, 8, mat(0xd93a3a)), 0.05, 0.047, 0.03));
  group.add(pizza);

  // Caneca no chão perto do puff
  const mug = new THREE.Group();
  mug.add(cyl(0.04, 0.035, 0.09, 12, mat(PALETTE.mug)));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 12), mat(PALETTE.mug));
  handle.position.set(0.045, 0, 0);
  mug.add(handle);
  group.add(at(mug, 1.75, 0.045, 1.45, 0, 1.2, 0));

  // Papéis no chão
  for (let p = 0; p < 5; p++) {
    const sheet = plane(0.21, 0.3, paper);
    sheet.castShadow = false;
    group.add(at(sheet, -0.5 + p * 0.18, 0.003 + p * 0.001, -1.0 + Math.sin(p * 2.1) * 0.25, -Math.PI / 2, 0, p * 0.7));
  }

  // Pôsteres
  const posters = [
    { tex: createPosterTexture(['DEV', 'QUEST'], '#2a0a0a', '#ffcc00', { accent: '#d93a3a' }), pos: [-3.3, 1.95, -2.985], rot: [0, 0, 0.02] },
    { tex: createPosterTexture(['LEVEL', 'UP'], '#0a1a2a', '#9fd7f0', { accent: '#3a7fd9' }), pos: [1.95, 2.05, -2.985], rot: [0, 0, -0.03] },
    { tex: createPosterTexture(['INSERT', 'COIN'], '#1a0a2a', '#f6a5c0', { accent: '#ff2fd0' }), pos: [2.985, 2.15, 1.3], rot: [0, -Math.PI / 2, 0.02] },
  ];
  posters.forEach(({ tex, pos, rot }) => {
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
    const poster = plane(0.5, 0.7, m);
    group.add(at(poster, pos[0], pos[1], pos[2], rot[0], rot[1], rot[2]));
  });

  // Cartuchos soltos no chão
  for (let k = 0; k < 3; k++) {
    const cart = new THREE.Group();
    cart.position.set(1.35 + k * 0.08, 0.01, -2.1 + k * 0.12);
    cart.rotation.y = k * 0.9;
    cart.add(box(0.1, 0.02, 0.07, mat(PALETTE.cartridge)));
    cart.add(at(box(0.07, 0.004, 0.045, mat(PALETTE.cartridgeLabel[(k + 1) % 4])), 0, 0.011, 0));
    group.add(cart);
  }

  // Puff
  const bean = sphere(0.45, 14, 10, mat(PALETTE.bean, { flatShading: true, roughness: 1 }));
  bean.scale.set(1, 0.55, 1);
  group.add(at(bean, 2.0, 0.24, 0.95));
  const beanTop = sphere(0.3, 12, 8, mat(PALETTE.bean, { flatShading: true, roughness: 1 }));
  beanTop.scale.set(1, 0.45, 1);
  group.add(at(beanTop, 2.05, 0.4, 0.95));

  // Estantes de livros: uma no canto esquerdo da parede do fundo, outra na parede lateral
  group.add(at(createBookcase(0), -4.0, 0, -2.82));
  group.add(at(createBookcase(3), 2.82, 0, -1.75, 0, -Math.PI / 2, 0));

  // Lixeira com bolas de papel
  const bin = cyl(0.15, 0.12, 0.35, 12, mat(PALETTE.plastic, { side: THREE.DoubleSide }), true, true);
  group.add(at(bin, -1.15, 0.175, -2.55));
  group.add(at(cyl(0.12, 0.12, 0.01, 12, mat(PALETTE.plastic)), -1.15, 0.005, -2.55));
  for (let b = 0; b < 3; b++) {
    const ball = sphere(0.035, 6, 5, mat(PALETTE.paper, { flatShading: true }), false);
    group.add(at(ball, -1.15 + Math.cos(b * 2.1) * 0.25, 0.035, -2.4 + Math.sin(b * 2.1) * 0.2 + 0.1));
  }
  group.add(at(sphere(0.04, 6, 5, mat(PALETTE.paper, { flatShading: true }), false), -1.12, 0.36, -2.56));

  // Latas e salgadinhos perto do controle
  for (let c = 0; c < 3; c++) {
    const can = cyl(0.03, 0.03, 0.12, 10, mat(PALETTE.can[c], { metalness: 0.4, roughness: 0.4 }));
    const lying = c === 1;
    group.add(at(can, 1.2 + c * 0.14, lying ? 0.03 : 0.06, -1.3 + (c % 2) * 0.12, lying ? Math.PI / 2 : 0, 0, lying ? 0.4 : 0));
  }
  const chips = box(0.14, 0.2, 0.05, mat(0xe0b73a));
  group.add(at(chips, 0.2, 0.025, -0.9, Math.PI / 2, 0, 0.5));

  // Cabo-serpente ao longo do rodapé e tomadas
  const outlet = mat(PALETTE.beige);
  group.add(at(box(0.08, 0.08, 0.01, outlet), -1.2, 0.15, -2.985));
  group.add(at(box(0.08, 0.08, 0.01, outlet), 1.3, 0.15, -2.985));
  const snake = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.2, 0.12, -2.95),
    new THREE.Vector3(-0.8, 0.01, -2.9),
    new THREE.Vector3(-0.3, 0.01, -2.85),
    new THREE.Vector3(0.0, 0.01, -2.92),
    new THREE.Vector3(0.3, 0.01, -2.88),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(snake, 32, 0.007, 6), cableMat));
  // régua/filtro de linha
  group.add(at(box(0.3, 0.04, 0.08, mat(PALETTE.beige)), 0.15, 0.02, -2.85));

  // Relógio de parede na parede lateral
  const clock = new THREE.Group();
  clock.position.set(2.975, 2.45, -0.9);
  clock.rotation.y = -Math.PI / 2;
  clock.add(cyl(0.16, 0.16, 0.03, 20, mat(PALETTE.dark), false));
  clock.children[0].rotation.x = Math.PI / 2;
  const face = cyl(0.14, 0.14, 0.01, 20, mat(PALETTE.paper), false);
  face.rotation.x = Math.PI / 2;
  face.position.z = 0.015;
  clock.add(face);
  clock.add(at(box(0.012, 0.09, 0.005, mat(PALETTE.ink)), 0, 0.04, 0.025));
  clock.add(at(box(0.012, 0.07, 0.005, mat(PALETTE.ink)), 0.03, 0.02, 0.026, 0, 0, -1.2));
  group.add(clock);

  // Caixas de papelão empilhadas no canto
  group.add(at(box(0.5, 0.35, 0.45, mat(0xa8844f)), 2.6, 0.175, -2.65, 0, 0.15, 0));
  group.add(at(box(0.4, 0.3, 0.4, mat(0xb8956a)), 2.62, 0.5, -2.62, 0, -0.2, 0));

  // Caixas de som de chão ladeando o rack da TV
  for (const x of [-0.1, 1.5]) {
    const spk = new THREE.Group();
    spk.position.set(x, 0, -2.6);
    spk.rotation.y = x < 0.7 ? 0.25 : -0.25;
    spk.add(at(box(0.28, 0.6, 0.28, mat(0x1c1c22, { roughness: 0.8 })), 0, 0.3, 0));
    spk.add(at(cyl(0.09, 0.09, 0.02, 16, mat(0x33333c)), 0, 0.22, 0.14, Math.PI / 2, 0, 0));
    spk.add(at(cyl(0.05, 0.05, 0.015, 16, mat(0x3a3a44)), 0, 0.22, 0.145, Math.PI / 2, 0, 0));
    spk.add(at(cyl(0.04, 0.04, 0.02, 12, mat(0x33333c)), 0, 0.45, 0.14, Math.PI / 2, 0, 0));
    spk.add(at(box(0.01, 0.01, 0.005, mat(0x5ab35a, { emissive: 0x5ab35a, emissiveIntensity: 2 })), 0.09, 0.08, 0.142));
    group.add(spk);
  }

  // Prateleira acima da TV com caixas de jogos, console pequeno e boneco
  const tvShelf = new THREE.Group();
  tvShelf.position.set(0.7, 1.72, -2.9);
  tvShelf.add(box(1.3, 0.03, 0.2, mat(PALETTE.deskDark)));
  tvShelf.add(at(box(0.03, 0.1, 0.16, mat(PALETTE.deskDark)), -0.5, -0.065, 0));
  tvShelf.add(at(box(0.03, 0.1, 0.16, mat(PALETTE.deskDark)), 0.5, -0.065, 0));
  for (let k = 0; k < 5; k++) {
    tvShelf.add(at(box(0.03, 0.19, 0.14, mat(PALETTE.cartridgeLabel[k % 4])), -0.55 + k * 0.038, 0.11, 0.0, 0, 0, k === 4 ? 0.2 : 0));
  }
  tvShelf.add(at(box(0.22, 0.05, 0.16, mat(0xb8b0a0)), -0.1, 0.04, 0));
  tvShelf.add(at(box(0.12, 0.01, 0.1, mat(0x5c5c66)), -0.1, 0.07, 0));
  tvShelf.add(at(sphere(0.04, 8, 8, mat(0xf7e36b), false), 0.2, 0.14, 0.02));
  tvShelf.add(at(box(0.06, 0.09, 0.05, mat(0x3a7fd9)), 0.2, 0.06, 0.02));
  tvShelf.add(at(box(0.07, 0.1, 0.02, mat(0xb8b0a0)), 0.4, 0.065, 0.02, -0.2, 0, 0));
  tvShelf.add(at(box(0.045, 0.035, 0.005, mat(0x8a9a5a)), 0.4, 0.085, 0.032, -0.2, 0, 0));
  group.add(tvShelf);

  // Prateleira acima da mesa com disquetes, planta e livros deitados
  const deskShelf = new THREE.Group();
  deskShelf.position.set(-2.2, 1.95, -2.9);
  deskShelf.add(box(1.1, 0.03, 0.2, mat(PALETTE.deskDark)));
  deskShelf.add(at(box(0.03, 0.1, 0.16, mat(PALETTE.deskDark)), -0.42, -0.065, 0));
  deskShelf.add(at(box(0.03, 0.1, 0.16, mat(PALETTE.deskDark)), 0.42, -0.065, 0));
  for (let k = 0; k < 6; k++) {
    deskShelf.add(at(box(0.012, 0.09, 0.09, mat(k % 2 ? 0x2a2a2e : 0x3a3a5a)), -0.45 + k * 0.016, 0.06, 0.02, 0, 0, 0.08));
  }
  deskShelf.add(at(box(0.16, 0.1, 0.1, mat(PALETTE.beige)), -0.2, 0.065, 0.02));
  deskShelf.add(at(cyl(0.05, 0.04, 0.09, 10, mat(PALETTE.pot)), 0.1, 0.06, 0.02));
  deskShelf.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 5), mat(PALETTE.plant, { flatShading: true })), 0.1, 0.16, 0.02));
  for (let k = 0; k < 3; k++) {
    deskShelf.add(at(box(0.24 - k * 0.02, 0.03, 0.16, mat(PALETTE.book[(k + 4) % PALETTE.book.length])), 0.35, 0.03 + k * 0.03, 0.01, 0, (k - 1) * 0.08, 0));
  }
  group.add(deskShelf);

  // Frigobar à esquerda da mesa
  const fridge = new THREE.Group();
  fridge.position.set(-3.2, 0, -2.68);
  fridge.add(at(box(0.5, 0.78, 0.5, mat(0x2a2a3a, { roughness: 0.5, metalness: 0.2 })), 0, 0.39, 0));
  fridge.add(at(box(0.46, 0.7, 0.01, mat(0x33334a, { roughness: 0.5, metalness: 0.2 })), 0, 0.41, 0.253));
  fridge.add(at(box(0.015, 0.3, 0.02, mat(PALETTE.metal, { metalness: 0.7, roughness: 0.3 })), 0.18, 0.45, 0.27));
  fridge.add(at(box(0.01, 0.01, 0.005, mat(0x3a7fd9, { emissive: 0x3a7fd9, emissiveIntensity: 2 })), -0.18, 0.72, 0.26));
  fridge.add(at(cyl(0.03, 0.03, 0.12, 10, mat(PALETTE.can[1], { metalness: 0.4, roughness: 0.4 })), -0.12, 0.84, 0.05));
  fridge.add(at(cyl(0.03, 0.03, 0.12, 10, mat(PALETTE.can[0], { metalness: 0.4, roughness: 0.4 })), 0.0, 0.84, -0.08));
  fridge.add(at(box(0.3, 0.12, 0.3, mat(0xa8844f)), 0.1, 0.84, 0.1, 0, 0.3, 0));
  group.add(fridge);

  // Guitarra encostada na parede lateral, perto do puff
  const guitar = new THREE.Group();
  const gBody = mat(0xb63a3a, { roughness: 0.35, metalness: 0.1 });
  const gWood = mat(0x8a6a4a);
  guitar.add(at(cyl(0.17, 0.17, 0.045, 18, gBody), 0, 0.17, 0, Math.PI / 2, 0, 0));
  guitar.add(at(cyl(0.12, 0.12, 0.045, 16, gBody), 0, 0.4, 0, Math.PI / 2, 0, 0));
  guitar.add(at(box(0.05, 0.62, 0.02, gWood), 0, 0.75, 0.0));
  guitar.add(at(box(0.07, 0.12, 0.02, mat(PALETTE.dark)), 0, 1.1, 0.0, 0, 0, 0.05));
  guitar.add(at(box(0.12, 0.02, 0.01, mat(PALETTE.dark)), 0, 0.13, 0.026));
  guitar.add(at(box(0.1, 0.012, 0.01, mat(0xe9e4d6)), 0, 0.28, 0.026));
  guitar.add(at(box(0.11, 0.006, 0.004, mat(PALETTE.metal, { metalness: 0.8, roughness: 0.2 })), 0, 0.2, 0.03));
  guitar.position.set(2.86, 0.02, 1.62);
  guitar.rotateY(-Math.PI / 2);
  guitar.rotateX(-0.16);
  group.add(guitar);
  group.add(at(box(0.5, 0.08, 0.4, mat(PALETTE.dark)), 2.68, 0.04, 2.05, 0, 0.2, 0)); // pedal/amplificador pequeno
  group.add(at(box(0.44, 0.3, 0.36, mat(0x1c1c22)), 2.68, 0.23, 2.05, 0, 0.2, 0));
  group.add(at(box(0.36, 0.2, 0.01, mat(0x3a3a44)), 2.62, 0.25, 2.23, 0, 0.2, 0));

  // Gato dormindo em cima do puff
  const cat = new THREE.Group();
  cat.position.set(2.05, 0.57, 0.95);
  cat.rotation.y = 0.8;
  const fur = mat(0xd9893a, { roughness: 1, flatShading: true });
  const furDark = mat(0xb86a2a, { roughness: 1, flatShading: true });
  const body = sphere(0.13, 10, 8, fur, false);
  body.scale.set(1.25, 0.6, 0.9);
  cat.add(body);
  cat.add(at(sphere(0.075, 10, 8, fur, false), 0.15, 0.03, 0.03));
  cat.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.04, 4), furDark), 0.17, 0.1, 0.0));
  cat.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.04, 4), furDark), 0.13, 0.1, 0.06));
  const tail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, 0, 0.02),
    new THREE.Vector3(-0.2, 0.0, 0.08),
    new THREE.Vector3(-0.12, 0.01, 0.14),
    new THREE.Vector3(0.0, 0.0, 0.12),
  ]);
  cat.add(new THREE.Mesh(new THREE.TubeGeometry(tail, 16, 0.014, 6), furDark));
  for (const s of [-1, 1]) cat.add(at(box(0.03, 0.01, 0.015, furDark), 0.06 * s, -0.07, 0.11));
  group.add(cat);

  return { group };
}

/**
 * Estante de livros 0.8 x 1.8 x 0.3 com quatro prateleiras.
 * @param {number} seed muda a distribuição de cores e alturas
 */
function createBookcase(seed) {
  const shelf = new THREE.Group();
  const shelfMat = mat(PALETTE.deskDark);
  shelf.add(at(box(0.04, 1.8, 0.3, shelfMat), -0.4, 0.9, 0));
  shelf.add(at(box(0.04, 1.8, 0.3, shelfMat), 0.4, 0.9, 0));
  shelf.add(at(box(0.84, 0.03, 0.3, shelfMat), 0, 1.8, 0));
  shelf.add(at(box(0.8, 1.75, 0.02, mat(0x3a2b1f)), 0, 0.9, -0.14));
  for (let s = 0; s < 4; s++) {
    shelf.add(at(box(0.8, 0.03, 0.3, shelfMat), 0, 0.05 + s * 0.45, 0));
    const n = 5 + ((s + seed) * 3) % 4;
    let x = -0.35;
    for (let b = 0; b < n; b++) {
      const h = 0.2 + ((b * 7 + s * 3 + seed) % 5) * 0.03;
      const w = 0.03 + ((b + s + seed) % 3) * 0.012;
      const color = PALETTE.book[(b * 3 + s + seed) % PALETTE.book.length];
      const bookMesh = box(w, h, 0.22, mat(color));
      shelf.add(at(bookMesh, x + w / 2, 0.065 + s * 0.45 + h / 2, 0.02, 0, 0, b === n - 1 ? 0.18 : 0));
      x += w + 0.008;
    }
  }
  // boneco, console pequeno e um porta-retrato
  shelf.add(at(sphere(0.05, 8, 8, mat(seed % 2 ? 0x9fd7f0 : 0xf7e36b), false), 0.25, 1.5, 0.05));
  shelf.add(at(box(0.07, 0.1, 0.06, mat(seed % 2 ? 0x4b8f5a : 0xd93a3a)), 0.25, 1.42, 0.05));
  shelf.add(at(box(0.18, 0.05, 0.14, mat(PALETTE.plasticLight)), 0.15, 0.995, 0.03));
  shelf.add(at(box(0.12, 0.09, 0.01, mat(PALETTE.paper)), -0.2, 1.4, 0.08, -0.15, 0, 0));
  return shelf;
}
