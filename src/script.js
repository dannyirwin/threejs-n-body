import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
// import {
//   EffectComposer,
//   RenderPass,
//   ShaderPass,
//   UnrealBloomPass,
//   SMAAEffect
// } from 'postprocessing';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import Body from './Body';
import { Vector3 } from 'three';
import { System } from './System';

const SIM_SPEED = 0.98;
let isPaused = false;

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

const system = new System(scene);

// Mesh
for (let i = 0; i < 1000; i++) {
  const pos = new Vector3(7000, 0, 0);

  const vel = new Vector3(0, 1, 0.4);
  vel.setLength(200);
  const mass = 2000 + Math.random() * 10000;

  const body = new Body(pos, vel, mass);
  system.addBody(body);
}
const bigBody = new Body(
  new Vector3(3000, 0, 0),
  new Vector3(0, -3, 0),
  1000000000
);
const bigBody2 = new Body(
  new Vector3(-3000, 0, 0),
  new Vector3(0, 3, 0),
  1000000000
);
system.addBody(bigBody);
system.addBody(bigBody2);

// Lights

const pointLight = new THREE.PointLight(0xeeffee, 1.4, 0, 10);
pointLight.position.x = 0;
pointLight.position.y = 0;
pointLight.position.z = 0;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  100,
  sizes.width / sizes.height,
  10000,
  0
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 8000;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: false,
  powerPreference: 'high-performance',
  stencil: false,
  depth: false
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const params = {
  exposure: 1,
  bloomStrength: 2,
  bloomThreshold: 0.9,
  bloomRadius: 1
};

const composer = new EffectComposer(renderer);
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass();

composer.addPass(renderScene);
composer.addPass(bloomPass);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const tick = () => {
  // const elapsedTime = clock.getElapsedTime()

  // Update objects
  system.update();

  // Update Orbital Controls
  controls.update();

  // Render
  // renderer.render(scene, camera);
  composer.render();

  // Call tick again on the next frame
  !isPaused && requestAnimationFrame(tick);
};

tick();

window.addEventListener('keydown', e => {
  if (e.key === 'p') {
    isPaused = !isPaused;
    requestAnimationFrame(tick);
  }
  if (e.key === ' ') {
    isPaused && requestAnimationFrame(tick);
  }
});
