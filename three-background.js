import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

const canvas = document.getElementById('bg');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

/* ================== STAR FIELD ================== */
const starCount = 1000;
const starsGeometry = new THREE.BufferGeometry();
const starPositions = [];

for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 200;
  const y = (Math.random() - 0.5) * 200;
  const z = (Math.random() - 0.5) * 200;
  starPositions.push(x, y, z);
}

starsGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starPositions, 3)
);

const starsMaterial = new THREE.PointsMaterial({
  color: 0x00ffea,
  size: 0.5,
  transparent: true,
  opacity: 0.8,
});

const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

/* ================== METEORS ================== */
const meteorCount = 50;
const meteors = [];

for (let i = 0; i < meteorCount; i++) {
  const geometry = new THREE.SphereGeometry(0.3, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ffea });
  const meteor = new THREE.Mesh(geometry, material);
  meteor.position.set(
    (Math.random() - 0.5) * 200,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 200
  );
  meteor.userData = {
    speed: 0.2 + Math.random() * 0.5,
    direction: new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      -Math.random() * 0.5,
      (Math.random() - 0.5) * 0.2
    ),
  };
  meteors.push(meteor);
  scene.add(meteor);
}

/* ================== RESIZE ================== */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ================== ANIMATION ================== */
function animate() {
  requestAnimationFrame(animate);

  // Rotate star field slowly
  starField.rotation.y += 0.0005;
  starField.rotation.x += 0.0002;

  // Move meteors
  meteors.forEach((meteor) => {
    meteor.position.add(meteor.userData.direction.clone().multiplyScalar(meteor.userData.speed));
    if (meteor.position.y < -100) {
      meteor.position.y = 100;
      meteor.position.x = (Math.random() - 0.5) * 200;
      meteor.position.z = (Math.random() - 0.5) * 200;
    }
  });

  renderer.render(scene, camera);
}

animate();
