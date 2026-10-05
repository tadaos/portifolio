// @ts-check
import '@fontsource/press-start-2p';
import '@fontsource/vt323';
import './style.css';

import * as THREE from 'three';
import { state, on, setMode } from './state.js';
import { updateTweens } from './util/tween.js';
import { buildRoom } from './scene/room.js';
import { createLights } from './scene/lights.js';
import { createCameraRig } from './camera/cameraRig.js';
import { OVERVIEW } from './camera/focusPoints.js';
import { createPicker } from './interaction/picker.js';
import { createPanels } from './ui/panels.js';
import { initHud } from './ui/hud.js';
import { initStartScreen } from './ui/startScreen.js';
import { createMarkers } from './ui/markers.js';
import { applyHtmlLang } from './ui/i18n.js';

applyHtmlLang();

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('scene'));
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, state.coarse ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04030a);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 50);

const room = buildRoom(scene);
const lights = createLights(scene, { tvGlow: room.tvGlow });
const rig = createCameraRig(camera);
const panels = createPanels({ onClose: () => rig.returnToOverview() });
const hud = initHud({ rig });
const markers = createMarkers({
  camera,
  onSelect: (id) => rig.focusOn(/** @type {any} */ (id)),
  onHover: (id) => picker.hover(id),
});
const picker = createPicker({
  canvas,
  camera,
  interactables: room.interactables,
  rig,
  onHover: (id) => markers.highlight(id),
});
const startScreen = initStartScreen({ onStart: () => rig.enterFromStart() });

on('focus:panel', (id) => panels.open(id));
on('focus:leave', () => panels.close());
on('langchange', () => panels.rerender());

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  rig.onAspectChange(camera.aspect);
}
window.addEventListener('resize', onResize);
onResize();

const timer = new THREE.Timer();
let elapsed = 0;

/** @param {number} time */
function tick(time) {
  timer.update(time);
  const dt = Math.max(0, Math.min(timer.getDelta(), 0.25));
  elapsed += dt;
  updateTweens(dt);
  rig.update(dt);
  room.update(elapsed);
  lights.update(elapsed);
  picker.update(elapsed);
  markers.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(tick);

// Modo debug: ?debug na URL expõe utilidades e permite órbita livre.
if (state.debug) {
  import('three/addons/controls/OrbitControls.js').then(({ OrbitControls }) => {
    /** @type {import('three/addons/controls/OrbitControls.js').OrbitControls | null} */
    let controls = null;
    const api = {
      THREE,
      scene,
      camera,
      renderer,
      rig,
      state,
      lights,
      focusOn: (id) => rig.focusOn(id),
      back: () => rig.returnToOverview(),
      start: () => startScreen.start(),
      orbit(enable = true) {
        if (enable && !controls) {
          controls = new OrbitControls(camera, canvas);
          controls.target.copy(OVERVIEW.target);
          rig.enabled = false;
          if (state.mode === 'start') {
            startScreen.start();
          }
        } else if (!enable && controls) {
          controls.dispose();
          controls = null;
          rig.enabled = true;
        }
        return controls;
      },
      pose() {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        return {
          position: camera.position.toArray().map((n) => +n.toFixed(2)),
          target: camera.position.clone().addScaledVector(dir, 2).toArray().map((n) => +n.toFixed(2)),
          fov: camera.fov,
        };
      },
      setMode,
    };
    // @ts-ignore
    window.__tds = api;
    console.info('[tds] debug: window.__tds pronto. __tds.orbit() para câmera livre, __tds.pose() para ler a pose.');
  });
}
