import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const canvas = document.querySelector('#triangle-canvas');
const stage = document.querySelector('#triangle-stage');
const fallback = document.querySelector('.fallback-triangle');
const toast = document.querySelector('#toast');
const tradeButton = document.querySelector('#trade-button');
document.querySelector('#year').textContent = new Date().getFullYear();

// Trading links must be real, verified project destinations; none is guessed here.
const configuredTradeUrl = window.BRES_CONFIG?.tradeUrl?.trim() || '';
if (/^https:\/\//i.test(configuredTradeUrl)) {
  tradeButton.href = configuredTradeUrl;
  tradeButton.target = '_blank';
  tradeButton.rel = 'noopener noreferrer';
  tradeButton.removeAttribute('aria-disabled');
} else {
  tradeButton.href = '#trade';
  tradeButton.setAttribute('aria-disabled', 'true');
  tradeButton.addEventListener('click', (event) => {
    event.preventDefault();
    toast.textContent = 'Trading destination not configured. Add the verified pair URL in config.js.';
    toast.classList.add('visible');
    window.clearTimeout(toast._hideTimer);
    toast._hideTimer = window.setTimeout(() => toast.classList.remove('visible'), 3600);
  });


}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 2), 3));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  fallback.style.display = 'none';
} catch (error) {
  console.warn('WebGL unavailable; showing CSS triangle fallback.', error);
}

if (renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 9.6);

  scene.add(new THREE.AmbientLight(0x91b9ff, 1.0));
  const keyLight = new THREE.PointLight(0x7db4ff, 80, 18, 2);
  keyLight.position.set(-4, 3.8, 5);
  scene.add(keyLight);
  const redLight = new THREE.PointLight(0xff385f, 60, 16, 2);
  redLight.position.set(4, -2.2, 2.7);
  scene.add(redLight);
  const rimLight = new THREE.PointLight(0x39d9ff, 45, 14, 2);
  rimLight.position.set(1.5, 4.5, -3);
  scene.add(rimLight);

  const root = new THREE.Group();
  scene.add(root);
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.75);
  shape.lineTo(-1.58, -1.16);
  shape.lineTo(1.58, -1.16);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.075,
    bevelThickness: 0.07,
    curveSegments: 16
  });
  geometry.center();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x5b9eff,
    metalness: 0.78,
    roughness: 0.19,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    iridescence: 0.78,
    iridescenceIOR: 1.42,
    iridescenceThicknessRange: [180, 620],
    emissive: 0x071a43,
    emissiveIntensity: 0.42,
    side: THREE.DoubleSide
  });
  const prism = new THREE.Mesh(geometry, material);
  root.add(prism);

  const edgeGeometry = new THREE.EdgesGeometry(geometry, 16);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xa9d4ff, transparent: true, opacity: 0.78 });
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  edges.scale.setScalar(1.006);
  root.add(edges);

  const innerShape = new THREE.Shape();
  innerShape.moveTo(0, 1.2);
  innerShape.lineTo(-1.1, -0.84);
  innerShape.lineTo(1.1, -0.84);
  innerShape.closePath();
  const innerGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 1.2, 0.23), new THREE.Vector3(-1.1, -0.84, 0.23),
    new THREE.Vector3(1.1, -0.84, 0.23), new THREE.Vector3(0, 1.2, 0.23)
  ]);
  const innerLines = new THREE.Line(innerGeometry, new THREE.LineBasicMaterial({ color: 0xeff8ff, transparent: true, opacity: 0.48 }));
  root.add(innerLines);

  // Floating motes around the geometry.
  const moteCount = 500;
  const motePositions = new Float32Array(moteCount * 3);
  const moteColors = new Float32Array(moteCount * 3);
  const moteSeeds = [];
  for (let i = 0; i < moteCount; i++) {
    const radius = 2.15 + Math.random() * 1.65;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    motePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    motePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    motePositions[i * 3 + 2] = radius * Math.cos(phi) * 0.55;
    const color = new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.72, 0.62);
    moteColors.set([color.r, color.g, color.b], i * 3);
    moteSeeds.push(Math.random() * Math.PI * 2);
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  moteGeo.setAttribute('color', new THREE.BufferAttribute(moteColors, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ size: 0.022, vertexColors: true, transparent: true, opacity: 0.62, sizeAttenuation: true, depthWrite: false }));
  scene.add(motes);

  // The colour-burst particles are pooled and re-fired on each genuine mesh hover.
  const burstCount = 1500;
  const burstPositions = new Float32Array(burstCount * 3);
  const burstColors = new Float32Array(burstCount * 3);
  const velocities = new Float32Array(burstCount * 3);
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3).setUsage(THREE.DynamicDrawUsage));
  burstGeo.setAttribute('color', new THREE.BufferAttribute(burstColors, 3));
  const burstMat = new THREE.PointsMaterial({ size: 0.038, vertexColors: true, transparent: true, opacity: 0, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const burst = new THREE.Points(burstGeo, burstMat);
  scene.add(burst);
  let burstLife = 0;

  function fireBurst() {
    burstLife = 1;
    burstMat.opacity = 1;
    const colors = burstGeo.attributes.color.array;
    for (let i = 0; i < burstCount; i++) {
      const k = i * 3;
      const u = Math.random() * 2 - 1;
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.sqrt(1 - u * u);
      const dx = Math.cos(angle) * spread;
      const dy = u;
      const dz = Math.sin(angle) * spread;
      burstPositions[k] = dx * 0.7;
      burstPositions[k + 1] = dy * 0.7;
      burstPositions[k + 2] = dz * 0.25;
      const speed = 1.35 + Math.random() * 3.9;
      velocities[k] = dx * speed;
      velocities[k + 1] = dy * speed;
      velocities[k + 2] = dz * speed;
      const color = new THREE.Color().setHSL(Math.random(), 0.92, 0.62);
      colors[k] = color.r; colors[k + 1] = color.g; colors[k + 2] = color.b;
    }
    burstGeo.attributes.position.needsUpdate = true;
    burstGeo.attributes.color.needsUpdate = true;
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(99, 99);
  let isOverTriangle = false;
  let targetX = 0, targetY = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  stage.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    targetX = (event.clientX / window.innerWidth - 0.5) * 0.32;
    targetY = (event.clientY / window.innerHeight - 0.5) * 0.25;
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { pointer.set(99, 99); isOverTriangle = false; });

  const clock = new THREE.Clock();
  function resize() {
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  function animate() {
    const delta = Math.min(clock.getDelta(), 0.04);
    const elapsed = clock.elapsedTime;
    if (!reducedMotion) {
      root.rotation.y += (0.0019 + (isOverTriangle ? 0.008 : 0)) * 60 * delta;
      root.rotation.x += (0.0007 + targetY * 0.012) * 60 * delta;
      root.rotation.y += (targetX - root.rotation.y * 0.03) * 0.006;
      root.position.y = Math.sin(elapsed * 0.7) * 0.09;
      motes.rotation.y = elapsed * 0.025;
      motes.rotation.x = Math.sin(elapsed * 0.2) * 0.08;
    }

    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(prism, false).length > 0;
    if (hit && !isOverTriangle) fireBurst();
    isOverTriangle = hit;

    if (burstLife > 0) {
      burstLife = Math.max(0, burstLife - delta * 0.62);
      const damping = Math.pow(0.982, delta * 60);
      for (let i = 0; i < burstCount; i++) {
        const k = i * 3;
        burstPositions[k] += velocities[k] * delta;
        burstPositions[k + 1] += velocities[k + 1] * delta;
        burstPositions[k + 2] += velocities[k + 2] * delta;
        velocities[k] *= damping; velocities[k + 1] *= damping; velocities[k + 2] *= damping;
      }
      burstGeo.attributes.position.needsUpdate = true;
      burstMat.opacity = burstLife;
    } else {
      burstMat.opacity = 0;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('beforeunload', () => { resizeObserver.disconnect(); renderer.dispose(); });
}
