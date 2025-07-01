import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { PhysicsService } from './PhysicsService';
import { DEBUG_FORCES } from './ThreeScene';
import { PerformanceService } from './PerformanceService';
import { Node } from './node.interface';
import { centralNode, outerNodes } from './mock-data';

export function initThreeScene(container: HTMLElement, mode: 'night' | 'day' = 'night') {
  const scene = new THREE.Scene();

  // Galaxy-like starfield (always present)
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const starVertices = [];
  for (let i = 0; i < starCount; i++) {
    const r = 400 + Math.random() * 600;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    starVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: true, transparent: true, opacity: 0.7 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Background: black for night, gradient for day
  if (mode === 'day') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#181c2a'); // dark blue
    gradient.addColorStop(1, '#23272f'); // near black
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const bgTexture = new THREE.CanvasTexture(canvas);
    scene.background = bgTexture;
  } else {
    scene.background = new THREE.Color(0x000000); // pure black
  }

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  // Set to top-down view (Y axis)
  camera.position.set(0, 100, 0);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Postprocessing: Bloom for neon effect
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    1.2, // strength
    0.8, // radius
    0.1  // threshold
  );
  composer.addPass(bloomPass);

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Directional light
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 100, 100);
  scene.add(dirLight);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 10;
  controls.maxDistance = 500;

  return { scene, camera, renderer, controls, composer };
}

function createGlowMaterial(color: string) {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.5,
    metalness: 0.7,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    transmission: 0.5,
    transparent: true,
    opacity: 0.95,
  });
}

// Utility to generate random attributes
function randomAttributes(count: number): number[] {
  return Array.from({ length: count }, () => Math.round(Math.random() * 100));
}

// Returns both spheres and node data
export function addCentralAndOuterNodes(
  scene: THREE.Scene,
  centralRadius = 6,
  outerRadius = 3,
  outerCount = 4,
  attributeCount = 3,
  nodeColor: string = '#FF3366',
  centralColor: string = '#C300FF',
  centralNodeIndex: number = 0,
  randomNodeDistribution: boolean = true // <-- add this param
): { spheres: THREE.Mesh[]; nodes: { id: string; attributes: number[]; velocity: THREE.Vector3; mesh?: THREE.Mesh }[] } {
  const spheres: THREE.Mesh[] = [];
  const nodes: { id: string; attributes: number[]; velocity: THREE.Vector3; mesh?: THREE.Mesh }[] = [];
  // Central node: color/size depends on centralNodeIndex
  for (let i = 0; i < outerCount + 1; i++) {
    const isCentral = i === centralNodeIndex;
    const radius = isCentral ? centralRadius : outerRadius;
    const color = isCentral ? centralColor : nodeColor;
    const geometry = new THREE.SphereGeometry(radius, isCentral ? 48 : 32, isCentral ? 48 : 32);
    const material = createGlowMaterial(color);
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 0, 0);
    scene.add(sphere);
    spheres.push(sphere);
    nodes.push({
      id: i === 0 ? 'central' : String.fromCharCode(65 + i - 1),
      attributes: randomAttributes(attributeCount),
      velocity: new THREE.Vector3(),
      mesh: sphere
    });
  }
  // Arrange outer nodes in a circle in the XZ plane
  if (randomNodeDistribution) {
    initializeOrbitRandom(nodes, 40);
  } else {
    initializeOrbitEven(nodes, 40);
  }
  return { spheres, nodes };
}

// Position outer nodes randomly around a sphere centered on the central node
function initializeOrbitRandom(nodes: { mesh?: THREE.Mesh }[], radius: number) {
  if (nodes.length < 2) return;
  const central = nodes[0];
  const outerNodes = nodes.slice(1);
  for (let i = 0; i < outerNodes.length; i++) {
    // Random point on a sphere (uniform distribution)
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = central.mesh ? central.mesh.position.x : 0;
    const y = central.mesh ? central.mesh.position.y : 0;
    const z = central.mesh ? central.mesh.position.z : 0;
    const px = x + radius * Math.sin(phi) * Math.cos(theta);
    const py = y + radius * Math.sin(phi) * Math.sin(theta);
    const pz = z + radius * Math.cos(phi);
    const mesh = outerNodes[i].mesh;
    if (mesh) {
      mesh.position.set(px, py, pz);
    }
  }
}

// Position outer nodes evenly spaced on a circle in the XZ plane
function initializeOrbitEven(nodes: { mesh?: THREE.Mesh }[], radius: number) {
  if (nodes.length < 2) return;
  const central = nodes[0];
  const outerNodes = nodes.slice(1);
  const N = outerNodes.length;
  for (let i = 0; i < N; i++) {
    const angle = (2 * Math.PI * i) / N;
    const x = central.mesh ? central.mesh.position.x : 0;
    const y = central.mesh ? central.mesh.position.y : 0;
    const z = central.mesh ? central.mesh.position.z : 0;
    const px = x + radius * Math.cos(angle);
    const py = y;
    const pz = z + radius * Math.sin(angle);
    const mesh = outerNodes[i].mesh;
    if (mesh) {
      mesh.position.set(px, py, pz);
    }
  }
}

// Accepts node data, force constants, and central node index
export function startPhysicsAnimation(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  composer: EffectComposer,
  spheres: THREE.Mesh[],
  nodes: { id: string; attributes: number[]; velocity: THREE.Vector3; mesh?: THREE.Mesh }[],
  k: number,
  kRep: number,
  centralNodeIndex: number,
  angularSpeed: number = 0.5,
  dragState?: { isCentralDragging: boolean; outerNodeOffsets: THREE.Vector3[] },
  debugForces: boolean = false // <-- add this param
) {
  // Central node selection
  const nodeCentral = nodes[centralNodeIndex] || nodes[0];
  // Outer nodes: all except the central
  const nodeObjects = nodes.filter((_, i) => i !== centralNodeIndex);
  // Velocity arrows (direction arrows)
  const arrowHelpers: THREE.ArrowHelper[] = [];
  nodeObjects.forEach((node, i) => {
    const arrow = new THREE.ArrowHelper(
      node.velocity.length() > 0 ? node.velocity.clone().normalize() : new THREE.Vector3(1, 0, 0),
      node.mesh ? node.mesh.position : new THREE.Vector3(),
      10, // initial length
      0x00ffff, // color
      3, // head length
      2  // head width
    );
    scene.add(arrow);
    arrowHelpers.push(arrow);
    // Hide velocity arrows if not in debug mode
    if (!DEBUG_FORCES) arrow.visible = false;
  });

  // In startPhysicsAnimation, update the default force constants:
  // Slightly increase the speed of attraction and repulsion by scaling k and kRep
  const forceScale = 1.3; // 30% faster
  const constants = { k: k * forceScale, kRep: kRep * forceScale };
  const damping = 0.92;
  let lastTime = performance.now();
  // --- PerformanceService for spatial pruning ---
  const perfService = new PerformanceService(20); // cell size can be tuned
  // --- Debug force arrows ---
  let forceArrows: THREE.ArrowHelper[] = [];
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    // Update grid for current node positions, using node references
    perfService.update(nodeObjects.map(n => ({ position: n.mesh ? n.mesh.position : new THREE.Vector3(), ref: n })));
    // --- Physics: update outer nodes ---
    nodeObjects.forEach((node, i) => {
      let force = new THREE.Vector3();
      // --- Loose springy effect if central is being dragged ---
      if (dragState && dragState.isCentralDragging && dragState.outerNodeOffsets[i]) {
        const target = nodeCentral.mesh!.position.clone().add(dragState.outerNodeOffsets[i]);
        const springK = 2.2; // spring constant, lower = looser
        const springForce = target.clone().sub(node.mesh!.position).multiplyScalar(springK);
        force.add(springForce);
      } else {
        // --- Position-based spring force towards central node ---
        const toCenter = nodeCentral.mesh!.position.clone().sub(node.mesh!.position);
        const dist = toCenter.length();
        const restLength = 40; // same as initial orbit radius
        const springForce = toCenter.normalize().multiplyScalar(constants.k * (dist - restLength));
        force.add(springForce);
        // --- (Optional) Attribute-based force (additive, can be removed if not needed) ---
        /*
        if (nodeCentral.attributes) {
          for (let j = 0; j < node.attributes.length; j++) {
            const diff = nodeCentral.attributes[j] - node.attributes[j];
            const f = constants.k * diff / (Math.pow(diff, 2) + 1);
            force.addScalar(f);
          }
        }
        */
        // Repulsion from nearby nodes only (using spatial grid)
        const neighbors = perfService.getNeighbors({ position: node.mesh ? node.mesh.position : new THREE.Vector3() });
        neighbors.forEach(other => {
          if (other === node) return;
          // Repulsion based on position
          const toOther = node.mesh!.position.clone().sub(other.mesh!.position);
          const d = toOther.length();
          if (d > 0 && d < restLength * 0.9) {
            force.add(toOther.normalize().multiplyScalar(constants.kRep * (restLength * 0.9 - d)));
          }
        });
      }
      node.velocity.add(force.clone().multiplyScalar(dt));
      node.velocity.multiplyScalar(damping);
      if (node.mesh) {
        node.mesh.position.add(node.velocity.clone().multiplyScalar(dt));
        // --- Angular rotation around Y-axis ---
        const deltaAngle = angularSpeed * dt;
        const center = nodeCentral.mesh ? nodeCentral.mesh.position : new THREE.Vector3(0, 0, 0);
        const pos = node.mesh.position.clone().sub(center);
        const cosA = Math.cos(deltaAngle);
        const sinA = Math.sin(deltaAngle);
        const x = pos.x * cosA - pos.z * sinA;
        const z = pos.x * sinA + pos.z * cosA;
        pos.x = x;
        pos.z = z;
        node.mesh.position.copy(center.clone().add(pos));
        // --- End angular rotation ---
        const v = node.velocity.clone();
        const len = Math.min(v.length() * 10, 30);
        if (arrowHelpers[i]) {
          // Show direction of velocity as arrow only in debug mode
          if (debugForces && len > 0.1) {
            arrowHelpers[i].setDirection(v.clone().normalize());
            arrowHelpers[i].setLength(len, 3, 2);
            arrowHelpers[i].position.copy(node.mesh.position);
            arrowHelpers[i].visible = true;
          } else {
            arrowHelpers[i].visible = false;
          }
        }
      }
    });
    // --- Debug force visualization ---
    if (debugForces) {
      // Remove old arrows
      forceArrows.forEach(a => scene.remove(a));
      forceArrows = [];
      // Compute forces
      const forces = PhysicsService.computeForces(nodeObjects, nodeCentral, constants);
      nodeObjects.forEach((node, i) => {
        const force = forces.get(node) || new THREE.Vector3();
        // Draw arrow
        if (node.mesh) {
          const arrow = new THREE.ArrowHelper(
            force.length() > 0 ? force.clone().normalize() : new THREE.Vector3(1, 0, 0),
            node.mesh.position,
            Math.min(force.length() * 30, 30),
            0xC300FF, // neon purple
            4, // head length
            2  // head width
          );
          arrow.line.material = new THREE.MeshBasicMaterial({ color: 0xC300FF });
          arrow.line.material.transparent = true;
          arrow.line.material.opacity = 0.8;
          scene.add(arrow);
          forceArrows.push(arrow);
        }
        // Log force
        // eslint-disable-next-line no-console
        console.log(`Node ${node.id} force:`, force.toArray());
      });
    } else {
      // Remove/hide all force arrows
      forceArrows.forEach(a => scene.remove(a));
      forceArrows = [];
    }
    composer.render();
  }
  animate();
}
