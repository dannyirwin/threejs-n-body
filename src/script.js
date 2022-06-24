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

import smoke from './smoke.png';
import {
  buildDevSystem,
  buildDualGalaxy,
  buildStableSwirl
} from './initialSystem';

const SIM_SPEED = 0.98;
let isPaused = false;

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Bodies Init
// const [bodies, cameraPosition] = buildDevSystem(1000);
const [bodies, cameraPosition] = buildDualGalaxy(1000);
const system = new System(scene, bodies);

// Fog
let loader = new THREE.TextureLoader();

const getRandRange = (n = 20000) => {
  return Math.random() * n - n / 2;
};
const range = 10000;
const baseFogSize = 10000;
const fogSizeRange = 10000;
const clouds = [];
// loader.load(smoke, function (texture) {
//   const cloudMat = new THREE.MeshLambertMaterial({
//     map: texture,
//     transparent: true
//   });
//   for (let i = 0; i < 30; i++) {
//     const size = baseFogSize + Math.random() * fogSizeRange;
//     const cloudGeo = new THREE.PlaneBufferGeometry(size, size);
//     let cloud = new THREE.Mesh(cloudGeo, cloudMat);
//     cloud.position.set(
//       getRandRange(range),
//       getRandRange(range),
//       getRandRange(range / 2)
//     );
//     cloud.rotation.x = 0;
//     cloud.rotation.y = 0;
//     cloud.rotation.z = Math.random() * 2 * Math.PI;
//     cloud.material.opacity = 0.2;
//     cloud.inc = Math.random() / 800;
//     scene.add(cloud);
//     clouds.push(cloud);
//   }
// });

// Lights
// const pointLight = new THREE.PointLight(0xeeffee, 1.4, 0, 10);
// pointLight.position.x = 0;
// pointLight.position.y = 0;
// pointLight.position.z = 0;
// scene.add(pointLight);

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
camera.position.x = cameraPosition?.x || 0;
camera.position.y = cameraPosition?.y || 0;
camera.position.z = cameraPosition?.z || 8000;
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
  bloomStrength: 3,
  bloomThreshold: 0,
  bloomRadius: 0
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
  // clouds.map(cloud => {
  //   cloud.rotateZ(cloud.inc);
  // });

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
