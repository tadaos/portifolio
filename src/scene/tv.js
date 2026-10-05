// @ts-check
import * as THREE from 'three';
import { PALETTE, mat, box, cyl, plane, at } from './materials.js';
import { createTvScreen, screenMaterial } from './screens.js';

/** TV de tubo ligada, console retrô, controle no chão. Origem em (0.7, 0, -2.6). */
export function createTv() {
  const group = new THREE.Group();
  group.position.set(0.7, 0, -2.6);

  const wood = mat(PALETTE.deskDark);
  const plastic = mat(PALETTE.plastic, { roughness: 0.7 });
  const plasticLight = mat(PALETTE.plasticLight, { roughness: 0.7 });
  const dark = mat(PALETTE.dark);

  // Rack baixo com prateleira aberta
  group.add(at(box(1.1, 0.05, 0.6, wood), 0, 0.425, 0.05));
  group.add(at(box(1.1, 0.05, 0.6, wood), 0, 0.03, 0.05));
  group.add(at(box(0.05, 0.4, 0.6, wood), -0.525, 0.225, 0.05));
  group.add(at(box(0.05, 0.4, 0.6, wood), 0.525, 0.225, 0.05));
  group.add(at(box(1.0, 0.4, 0.03, mat(0x3a2b1f)), 0, 0.225, -0.235));
  // VCR na prateleira
  group.add(at(box(0.4, 0.09, 0.3, plastic), -0.2, 0.1, 0.05));
  group.add(at(box(0.2, 0.02, 0.01, dark), -0.2, 0.12, 0.205));
  group.add(at(box(0.01, 0.01, 0.01, mat(0x5ab35a, { emissive: 0x5ab35a, emissiveIntensity: 2 })), -0.05, 0.08, 0.205));

  // TV CRT
  const tv = new THREE.Group();
  tv.position.set(0, 0.79, 0.1);
  tv.rotation.y = -0.04;
  tv.scale.setScalar(1.2);
  tv.add(box(0.72, 0.56, 0.6, plastic));
  tv.add(at(box(0.5, 0.4, 0.12, mat(PALETTE.plastic, { roughness: 0.8 })), 0, 0, -0.34));
  tv.add(at(box(0.76, 0.6, 0.04, plasticLight), 0, 0, 0.3));
  // tela ligada
  const tvScreen = createTvScreen();
  const screen = plane(0.56, 0.42, screenMaterial(tvScreen.texture));
  screen.userData.noHover = true;
  tv.add(at(screen, -0.04, 0.02, 0.325));
  // painel de controles à direita
  tv.add(at(box(0.1, 0.42, 0.01, dark), 0.3, 0.02, 0.322));
  for (let k = 0; k < 3; k++) {
    tv.add(at(cyl(0.018, 0.018, 0.015, 10, plasticLight), 0.3, 0.14 - k * 0.07, 0.33, Math.PI / 2, 0, 0));
  }
  tv.add(at(box(0.06, 0.06, 0.01, mat(0x2a3a5a)), 0.3, -0.14, 0.328));
  // antena
  const antMat = mat(PALETTE.metal, { metalness: 0.7, roughness: 0.3 });
  tv.add(at(cyl(0.01, 0.015, 0.04, 8, antMat), 0, 0.3, -0.1));
  tv.add(at(cyl(0.004, 0.004, 0.5, 6, antMat), -0.12, 0.5, -0.1, 0, 0, 0.5));
  tv.add(at(cyl(0.004, 0.004, 0.5, 6, antMat), 0.12, 0.5, -0.1, 0, 0, -0.5));
  group.add(tv);

  // Console no chão, em frente ao rack
  const consoleMat = mat(PALETTE.console, { roughness: 0.6 });
  const consoleDark = mat(PALETTE.consoleDark, { roughness: 0.6 });
  const console3d = new THREE.Group();
  console3d.position.set(-0.2, 0.035, 0.55);
  console3d.rotation.y = 0.12;
  console3d.add(box(0.3, 0.07, 0.22, consoleMat));
  console3d.add(at(box(0.3, 0.02, 0.12, consoleDark), 0, 0.045, -0.04));
  console3d.add(at(box(0.11, 0.005, 0.03, dark), 0, 0.056, -0.04)); // slot
  console3d.add(at(box(0.1, 0.06, 0.02, mat(PALETTE.cartridge)), 0, 0.09, -0.04)); // cartucho inserido
  console3d.add(at(box(0.07, 0.03, 0.005, mat(0xd94c3a)), 0, 0.1, -0.027));
  console3d.add(at(box(0.04, 0.012, 0.02, consoleDark), -0.1, 0.04, 0.09)); // power
  console3d.add(at(box(0.04, 0.012, 0.02, consoleDark), -0.04, 0.04, 0.09)); // reset
  console3d.add(at(box(0.008, 0.008, 0.005, mat(0xff2a2a, { emissive: 0xff2a2a, emissiveIntensity: 3 })), 0.08, 0.02, 0.111));
  console3d.add(at(box(0.04, 0.03, 0.005, dark), 0.09, 0.0, 0.111)); // portas de controle
  console3d.add(at(box(0.04, 0.03, 0.005, dark), 0.04, 0.0, 0.111));
  group.add(console3d);

  // Controle no chão
  const pad = new THREE.Group();
  pad.position.set(0.35, 0.015, 1.0);
  pad.rotation.y = 0.4;
  pad.add(box(0.16, 0.03, 0.07, consoleMat));
  pad.add(at(box(0.012, 0.03, 0.035, consoleDark), -0.05, 0.004, 0)); // d-pad
  pad.add(at(box(0.035, 0.03, 0.012, consoleDark), -0.05, 0.004, 0));
  pad.add(at(cyl(0.009, 0.009, 0.01, 8, mat(0xd93a3a)), 0.045, 0.016, 0.008));
  pad.add(at(cyl(0.009, 0.009, 0.01, 8, mat(0xd93a3a)), 0.065, 0.016, -0.008));
  pad.add(at(box(0.016, 0.005, 0.006, consoleDark), -0.008, 0.016, 0.012));
  pad.add(at(box(0.016, 0.005, 0.006, consoleDark), 0.012, 0.016, 0.012));
  group.add(pad);

  // Cabos: controle -> console, console -> TV, TV -> tomada
  const cableMat = mat(PALETTE.cable, { roughness: 0.7 });
  const padCable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.1, 0.02, 0.66),
    new THREE.Vector3(-0.02, 0.01, 0.8),
    new THREE.Vector3(0.12, 0.01, 0.78),
    new THREE.Vector3(0.2, 0.012, 0.9),
    new THREE.Vector3(0.28, 0.015, 0.97),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(padCable, 32, 0.006, 6), cableMat));
  const avCable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.3, 0.03, 0.5),
    new THREE.Vector3(-0.5, 0.02, 0.3),
    new THREE.Vector3(-0.52, 0.3, -0.1),
    new THREE.Vector3(-0.3, 0.55, -0.3),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(avCable, 32, 0.006, 6), cableMat));
  const power = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, 0.5, -0.32),
    new THREE.Vector3(0.3, 0.25, -0.36),
    new THREE.Vector3(0.5, 0.1, -0.38),
    new THREE.Vector3(0.6, 0.15, -0.39),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(power, 24, 0.007, 6), cableMat));

  // Pilha de cartuchos sobre o rack
  for (let k = 0; k < 4; k++) {
    const cart = new THREE.Group();
    cart.position.set(0.3 + (k % 2) * 0.01, 0.065 + k * 0.022, 0.12 - (k % 3) * 0.012);
    cart.rotation.y = (k - 1.5) * 0.12;
    cart.add(box(0.1, 0.02, 0.07, mat(PALETTE.cartridge)));
    cart.add(at(box(0.07, 0.004, 0.045, mat(PALETTE.cartridgeLabel[k % 4])), 0, 0.011, 0));
    group.add(cart);
  }

  // Hitbox invisível
  const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 0.9), new THREE.MeshBasicMaterial());
  hitbox.visible = false;
  hitbox.position.set(0, 0.78, 0.1);
  hitbox.userData.focusId = 'tv';
  group.add(hitbox);

  return { group, hitbox, update: tvScreen.update, glow: tvScreen.glow };
}
