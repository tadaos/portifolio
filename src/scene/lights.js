// @ts-check
import * as THREE from 'three';
import { state } from '../state.js';

/**
 * @param {THREE.Scene} scene
 * @param {{ tvGlow?: (t:number)=>number }} [opts]
 */
export function createLights(scene, opts = {}) {
  const hemi = new THREE.HemisphereLight(0x4a2a8a, 0x0e0714, 0.28);
  scene.add(hemi);

  // Luz fria roxa entrando pela janela da parede lateral
  const moon = new THREE.DirectionalLight(0x8a5cff, 0.7);
  moon.position.set(5, 4, 2.5);
  moon.target.position.set(0, 0.5, -1);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.near = 0.5;
  moon.shadow.camera.far = 16;
  moon.shadow.camera.left = -5;
  moon.shadow.camera.right = 5;
  moon.shadow.camera.top = 5;
  moon.shadow.camera.bottom = -5;
  moon.shadow.bias = -0.0003;
  moon.shadow.normalBias = 0.02;
  scene.add(moon, moon.target);

  // Luminária da mesa (única point light com sombra)
  const lamp = new THREE.PointLight(0xffb46a, 5, 3.5, 2);
  lamp.position.set(-2.55, 1.12, -2.5);
  lamp.castShadow = !state.coarse;
  lamp.shadow.mapSize.set(512, 512);
  lamp.shadow.bias = -0.002;
  lamp.shadow.normalBias = 0.02;
  scene.add(lamp);

  // Brilho esverdeado do monitor
  const monitor = new THREE.PointLight(0x9fff9f, 0.7, 1.4, 2);
  monitor.position.set(-2.2, 1.08, -1.9);
  scene.add(monitor);

  // Brilho azulado da TV, tremula junto com a estática
  const tv = new THREE.PointLight(0x6fa8ff, 3, 3.2, 2);
  tv.position.set(0.7, 1.0, -1.6);
  scene.add(tv);

  // Preenchimento roxo fraco vindo de trás da câmera para não ficar preto
  const fill = new THREE.PointLight(0x7a3cff, 1.6, 7, 2);
  fill.position.set(-2.5, 2.4, 2.5);
  scene.add(fill);

  // Fita de LED neon no alto da parede do fundo: tira emissiva + duas luzes
  const neonColor = 0xc23cff;
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.025, 0.03),
    new THREE.MeshBasicMaterial({ color: neonColor, toneMapped: false })
  );
  strip.position.set(-1, 2.86, -2.975);
  scene.add(strip);
  const neonA = new THREE.PointLight(neonColor, 5, 6, 2);
  neonA.position.set(-2.2, 2.75, -2.6);
  const neonB = new THREE.PointLight(neonColor, 5, 6, 2);
  neonB.position.set(1.4, 2.75, -2.6);
  scene.add(neonA, neonB);

  // Arandela magenta acima do quadro de cortiça
  const board = new THREE.PointLight(0xff4df0, 2.8, 4, 2);
  board.position.set(2.3, 2.3, 0.3);
  scene.add(board);

  /** @param {number} t */
  function update(t) {
    const g = opts.tvGlow ? opts.tvGlow(t) : 0.7;
    tv.intensity = 1.2 + g * 2.6;
    if (!state.reducedMotion) {
      const pulse = 5 + Math.sin(t * 1.3) * 0.5 + Math.sin(t * 9.1) * 0.15;
      neonA.intensity = pulse;
      neonB.intensity = pulse;
      lamp.intensity = 5 + Math.sin(t * 31) * 0.08 + Math.sin(t * 13.7) * 0.05;
    }
  }

  return { update, lights: { hemi, moon, lamp, monitor, tv, fill, board, neonA, neonB } };
}
