// @ts-check
import * as THREE from 'three';

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

/**
 * `target` é o centro do objeto. `shift` desloca o alvo em paisagem para o objeto
 * sair de trás do painel lateral; em retrato (painel embaixo) o shift é ignorado.
 * @typedef {{ position: THREE.Vector3, target: THREE.Vector3, shift?: THREE.Vector3, fov?: number, panelSide?: 'left'|'right' }} CameraPoint
 */

/** @type {CameraPoint} */
export const OVERVIEW = { position: v3(-1.75, 1.75, 3.0), target: v3(0.25, 1.0, -1.2) };
/** @type {CameraPoint} */
export const START = { position: v3(-2.7, 2.4, 4.3), target: v3(0.25, 1.0, -1.2) };

/** @type {Record<'computer'|'tv'|'corkboard', CameraPoint>} */
export const FOCUS = {
  computer: { position: v3(-1.68, 1.22, -1.05), target: v3(-2.05, 1.05, -2.5), shift: v3(0.15, 0, -0.05), panelSide: 'right', fov: 45 },
  tv: { position: v3(1.15, 1.12, -0.45), target: v3(0.7, 0.74, -2.2), shift: v3(0.33, 0, 0), panelSide: 'right', fov: 45 },
  corkboard: { position: v3(1.1, 1.5, 0.5), target: v3(2.97, 1.45, 0.15), shift: v3(0, 0, -0.35), panelSide: 'left', fov: 45 },
};
