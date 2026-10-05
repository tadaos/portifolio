// @ts-check
import * as THREE from 'three';
import { PALETTE, mat, box, cyl, sphere, plane, at } from './materials.js';
import { createTerminalScreen, screenMaterial } from './screens.js';

/** Mesa bagunçada com computador antigo, cadeira e luminária. Origem em (-2.0, 0, -2.4). */
export function createDesk() {
  const group = new THREE.Group();
  group.position.set(-2.0, 0, -2.4);

  const wood = mat(PALETTE.desk);
  const woodDark = mat(PALETTE.deskDark);
  const beige = mat(PALETTE.beige);
  const beigeDark = mat(PALETTE.beigeDark);
  const dark = mat(PALETTE.dark);

  // Tampo, pernas e gaveteiro
  group.add(at(box(1.6, 0.05, 0.7, wood), 0, 0.75, 0));
  for (const [x, z] of [[-0.75, -0.3], [-0.75, 0.3], [0.75, -0.3], [0.75, 0.3]]) {
    group.add(at(box(0.05, 0.73, 0.05, woodDark), x, 0.365, z));
  }
  group.add(at(box(0.4, 0.6, 0.6, woodDark), 0.55, 0.3, 0));
  group.add(at(box(0.12, 0.015, 0.015, mat(PALETTE.metal, { metalness: 0.6, roughness: 0.4 })), 0.55, 0.45, 0.305));
  group.add(at(box(0.12, 0.015, 0.015, mat(PALETTE.metal, { metalness: 0.6, roughness: 0.4 })), 0.55, 0.2, 0.305));

  // Monitor CRT
  const monitor = new THREE.Group();
  monitor.position.set(-0.2, 1.05, -0.12);
  monitor.rotation.y = 0.08;
  monitor.scale.setScalar(1.25);
  monitor.add(at(box(0.42, 0.36, 0.4, beige), 0, 0, 0));
  monitor.add(at(box(0.36, 0.3, 0.3, beigeDark), 0, 0, -0.1)); // "bunda" do CRT
  // moldura da tela
  const bezel = beigeDark;
  monitor.add(at(box(0.42, 0.04, 0.02, bezel), 0, 0.16, 0.2));
  monitor.add(at(box(0.42, 0.06, 0.02, bezel), 0, -0.15, 0.2));
  monitor.add(at(box(0.05, 0.36, 0.02, bezel), -0.185, 0, 0.2));
  monitor.add(at(box(0.05, 0.36, 0.02, bezel), 0.185, 0, 0.2));
  // tela
  const terminal = createTerminalScreen();
  const screen = plane(0.32, 0.26, screenMaterial(terminal.texture));
  screen.userData.noHover = true;
  monitor.add(at(screen, 0, 0.02, 0.205));
  // botão de power e led
  monitor.add(at(box(0.03, 0.015, 0.01, dark), 0.14, -0.15, 0.211));
  monitor.add(at(box(0.012, 0.012, 0.01, mat(0x5ab35a, { emissive: 0x5ab35a, emissiveIntensity: 2 })), 0.1, -0.15, 0.211));
  group.add(monitor);
  group.add(at(cyl(0.11, 0.13, 0.05, 12, beigeDark), -0.2, 0.8, -0.1));

  // Gabinete bege
  const tower = new THREE.Group();
  tower.position.set(0.27, 1.017, -0.1);
  tower.scale.setScalar(1.15);
  tower.add(box(0.18, 0.42, 0.42, beige));
  tower.add(at(box(0.14, 0.02, 0.01, dark), 0, 0.12, 0.211)); // drive de disquete
  tower.add(at(box(0.14, 0.02, 0.01, dark), 0, 0.07, 0.211));
  tower.add(at(box(0.03, 0.03, 0.01, beigeDark), 0.05, -0.1, 0.211)); // botão
  tower.add(at(box(0.012, 0.012, 0.01, mat(0xd93a3a, { emissive: 0xd93a3a, emissiveIntensity: 2 })), -0.04, -0.1, 0.211));
  group.add(tower);

  // Teclado com teclas instanciadas
  const kb = new THREE.Group();
  kb.position.set(-0.2, 0.7875, 0.24);
  kb.rotation.y = -0.06;
  kb.scale.set(1.1, 1, 1.1);
  kb.add(box(0.42, 0.025, 0.14, beigeDark));
  const keyGeo = new THREE.BoxGeometry(0.022, 0.01, 0.022);
  const keys = new THREE.InstancedMesh(keyGeo, beige, 13 * 4);
  const m = new THREE.Matrix4();
  let i = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      m.makeTranslation(-0.18 + c * 0.03 + r * 0.004, 0.017, -0.045 + r * 0.03);
      keys.setMatrixAt(i++, m);
    }
  }
  keys.castShadow = false;
  keys.receiveShadow = true;
  kb.add(keys);
  group.add(kb);

  // Mouse e mousepad
  group.add(at(box(0.22, 0.004, 0.18, mat(0x2a3a5a)), 0.12, 0.777, 0.2));
  const mouse = box(0.05, 0.03, 0.09, beige);
  group.add(at(mouse, 0.12, 0.795, 0.2, 0, 0.3, 0));

  // Luminária articulada
  const lamp = new THREE.Group();
  const lampMat = mat(PALETTE.lampShade, { roughness: 0.6, metalness: 0.2 });
  lamp.add(at(cyl(0.07, 0.08, 0.02, 12, lampMat), -0.72, 0.785, -0.2));
  lamp.add(at(box(0.02, 0.34, 0.02, lampMat), -0.72, 0.96, -0.2, 0.15, 0, -0.1));
  lamp.add(at(box(0.02, 0.3, 0.02, lampMat), -0.66, 1.12, -0.14, -0.9, 0, -0.6));
  const shade = cyl(0.035, 0.1, 0.13, 12, lampMat, true, true);
  shade.material = mat(PALETTE.lampShade, { roughness: 0.6, metalness: 0.2, side: THREE.DoubleSide });
  lamp.add(at(shade, -0.62, 1.1, -0.1, -0.5, 0, -0.6));
  const bulb = sphere(0.035, 8, 8, mat(PALETTE.lampBulb, { emissive: PALETTE.lampBulb, emissiveIntensity: 3 }), false);
  bulb.userData.noHover = true;
  lamp.add(at(bulb, -0.62, 1.1, -0.1));
  group.add(lamp);

  // Bagunça sobre a mesa: papéis, caneca, post-its no monitor
  const paper = mat(PALETTE.paper, { side: THREE.DoubleSide });
  for (let p = 0; p < 4; p++) {
    const sheet = plane(0.21, 0.3, paper);
    sheet.castShadow = false;
    group.add(at(sheet, 0.4 + p * 0.06, 0.776 + p * 0.002, 0.18 + (p % 2) * 0.05, -Math.PI / 2, 0, (p - 1.5) * 0.3));
  }
  const mug = new THREE.Group();
  mug.add(cyl(0.04, 0.035, 0.09, 12, mat(PALETTE.mugRed)));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 12), mat(PALETTE.mugRed));
  handle.position.set(0.045, 0, 0);
  mug.add(handle);
  group.add(at(mug, -0.6, 0.82, 0.2));
  group.add(at(plane(0.07, 0.07, mat(PALETTE.note1)), -0.42, 1.18, 0.15, 0, 0.08, 0.1));
  group.add(at(plane(0.07, 0.07, mat(PALETTE.note3)), -0.44, 1.07, 0.152, 0, 0.08, -0.15));

  // Fones de ouvido apoiados ao lado do gabinete
  const phones = new THREE.Group();
  const phoneMat = mat(PALETTE.dark, { roughness: 0.6 });
  phones.add(new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 8, 20, Math.PI), phoneMat));
  phones.add(at(cyl(0.035, 0.035, 0.03, 12, mat(0x3a2b5a)), -0.085, 0, 0, 0, 0, Math.PI / 2));
  phones.add(at(cyl(0.035, 0.035, 0.03, 12, mat(0x3a2b5a)), 0.085, 0, 0, 0, 0, Math.PI / 2));
  group.add(at(phones, 0.6, 0.81, 0.12, 0, 0.6, 0));

  // Cadeira giratória
  const chair = new THREE.Group();
  chair.position.set(0.6, 0, 0.72);
  chair.rotation.y = 0.9;
  const chairMat = mat(PALETTE.chair);
  chair.add(at(box(0.46, 0.07, 0.46, mat(PALETTE.chairSeat)), 0, 0.46, 0));
  chair.add(at(box(0.44, 0.48, 0.06, mat(PALETTE.chairSeat)), 0, 0.74, -0.22, -0.1, 0, 0));
  chair.add(at(cyl(0.025, 0.025, 0.4, 8, chairMat), 0, 0.25, 0));
  for (let a = 0; a < 5; a++) {
    const leg = box(0.28, 0.025, 0.04, chairMat);
    const ang = (a / 5) * Math.PI * 2;
    chair.add(at(leg, Math.cos(ang) * 0.14, 0.04, Math.sin(ang) * 0.14, 0, -ang, 0));
    chair.add(at(sphere(0.025, 6, 6, chairMat, false), Math.cos(ang) * 0.27, 0.025, Math.sin(ang) * 0.27));
  }
  group.add(chair);

  // Cabos: monitor -> gabinete -> tomada na parede
  const cableMat = mat(PALETTE.cable, { roughness: 0.7 });
  const c1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0.9, -0.3),
    new THREE.Vector3(-0.05, 0.78, -0.33),
    new THREE.Vector3(0.18, 0.8, -0.3),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 16, 0.007, 6), cableMat));
  const c2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25, 0.8, -0.33),
    new THREE.Vector3(0.45, 0.6, -0.5),
    new THREE.Vector3(0.6, 0.2, -0.56),
    new THREE.Vector3(0.8, 0.15, -0.58),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 24, 0.007, 6), cableMat));

  // Hitbox invisível para o raycast
  const hitbox = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.8, 0.85), new THREE.MeshBasicMaterial());
  hitbox.visible = false;
  hitbox.position.set(-0.05, 1.08, 0.02);
  hitbox.userData.focusId = 'computer';
  group.add(hitbox);

  return { group, hitbox, update: terminal.update };
}
