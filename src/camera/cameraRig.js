// @ts-check
import * as THREE from 'three';
import { animate } from '../util/tween.js';
import { damp } from '../util/math.js';
import { state, setMode, emit } from '../state.js';
import { OVERVIEW, START, FOCUS } from './focusPoints.js';

/** @typedef {import('./focusPoints.js').CameraPoint} CameraPoint */

/** @param {THREE.PerspectiveCamera} camera */
export function createCameraRig(camera) {
  const basePos = START.position.clone();
  const baseTarget = START.target.clone();
  const offset = new THREE.Vector3();
  const offsetGoal = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const look = new THREE.Vector3();
  const worldOffset = new THREE.Vector3();
  const mouse = { x: 0, y: 0 };
  const UP = new THREE.Vector3(0, 1, 0);

  let aspect = camera.aspect;
  /** @type {{ promise: Promise<boolean>, cancel: () => void } | null} */
  let current = null;
  /** @type {CameraPoint} */
  let currentPoint = START;
  let t = 0;

  const rig = {
    enabled: true,
    setMouse,
    focusOn,
    returnToOverview,
    enterFromStart,
    update,
    onAspectChange,
    snapTo,
  };

  function baseFov() {
    return aspect < 1 ? 72 : aspect < 1.4 ? 58 : 50;
  }

  /** Ajusta um ponto ao aspecto atual (retrato recua e abaixa o alvo). @param {CameraPoint} point */
  function resolve(point) {
    const position = point.position.clone();
    const target = point.target.clone();
    let fov = point.fov ?? baseFov();
    if (aspect < 1) {
      const dir = position.clone().sub(target);
      if (point.fov) {
        position.copy(target).add(dir.multiplyScalar(1.45));
        target.y -= 0.42;
        position.y -= 0.12;
        fov = 62;
      } else {
        position.copy(target).add(dir.multiplyScalar(1.2));
      }
    } else {
      if (point.shift) target.add(point.shift);
      if (aspect < 1.4 && point.fov) fov = 52;
    }
    return { position, target, fov };
  }

  function applyCamera() {
    camera.fov = Math.min(camera.fov, 120);
    camera.updateProjectionMatrix();
  }

  /**
   * @param {CameraPoint} point
   * @param {number} duration
   * @param {(k:number)=>void} [onProgress]
   */
  function tweenTo(point, duration, onProgress) {
    current?.cancel();
    currentPoint = point;
    const to = resolve(point);
    const from = { p: basePos.clone(), t: baseTarget.clone(), fov: camera.fov };
    current = animate({
      duration,
      onUpdate: (k) => {
        basePos.lerpVectors(from.p, to.position, k);
        baseTarget.lerpVectors(from.t, to.target, k);
        camera.fov = from.fov + (to.fov - from.fov) * k;
        applyCamera();
        onProgress?.(k);
      },
    });
    return current.promise;
  }

  /** Coloca a câmera instantaneamente num ponto. @param {CameraPoint} point */
  function snapTo(point) {
    current?.cancel();
    currentPoint = point;
    const to = resolve(point);
    basePos.copy(to.position);
    baseTarget.copy(to.target);
    camera.fov = to.fov;
    applyCamera();
  }

  async function enterFromStart() {
    if (state.mode !== 'start') return;
    setMode('entering');
    const done = await tweenTo(OVERVIEW, 1.6);
    if (done) setMode('overview');
  }

  /** @param {'computer'|'tv'|'corkboard'} id */
  async function focusOn(id) {
    const point = FOCUS[id];
    if (!point) return;
    if (state.mode === 'start' || state.mode === 'entering') return;
    if (state.focusId && state.focusId !== id) emit('focus:leave');
    state.focusId = id;
    setMode('focusing');
    let fired = false;
    const done = await tweenTo(point, 1.2, (k) => {
      if (!fired && k > 0.6) {
        fired = true;
        emit('focus:panel', id);
      }
    });
    if (done) setMode('focused');
  }

  async function returnToOverview() {
    if (state.mode !== 'focused' && state.mode !== 'focusing') return;
    state.focusId = null;
    setMode('returning');
    emit('focus:leave');
    const done = await tweenTo(OVERVIEW, 1.0);
    if (done) setMode('overview');
  }

  function setMouse(x, y) {
    mouse.x = x;
    mouse.y = y;
  }

  /** @param {number} a */
  function onAspectChange(a) {
    aspect = a;
    if (!current) snapTo(currentPoint);
  }

  /** @param {number} dt */
  function update(dt) {
    t += dt;
    if (!rig.enabled) return;

    if (state.mode === 'start' && !state.reducedMotion) {
      offsetGoal.set(Math.sin(t * 0.3) * 0.18, Math.sin(t * 0.21) * 0.08, 0);
    } else if (state.mode === 'overview' && !state.reducedMotion && !state.coarse) {
      offsetGoal.set(mouse.x * 0.22, mouse.y * 0.1, 0);
    } else {
      offsetGoal.set(0, 0, 0);
    }
    offset.x = damp(offset.x, offsetGoal.x, 4, dt);
    offset.y = damp(offset.y, offsetGoal.y, 4, dt);

    forward.subVectors(baseTarget, basePos).normalize();
    right.crossVectors(forward, UP).normalize();
    up.crossVectors(right, forward).normalize();
    worldOffset.copy(right).multiplyScalar(offset.x).addScaledVector(up, offset.y);

    camera.position.copy(basePos).add(worldOffset);
    look.copy(baseTarget).addScaledVector(worldOffset, 0.35);
    camera.lookAt(look);
  }

  snapTo(START);
  return rig;
}
