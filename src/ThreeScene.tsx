import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { initThreeScene, addCentralAndOuterNodes } from './ThreeSceneCore';

// FIX: Rename the legacy React component file to avoid import collision
// This file was previously ThreeScene.tsx and is now renamed to ThreeSceneLegacy.tsx

// Debug toggle for force visualization
export const DEBUG_FORCES = false;

const ACCENT_COLOR = new THREE.Color('#FF3366');

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let spheres: THREE.Mesh[] = [];
    let raycaster: THREE.Raycaster;
    let mouse: THREE.Vector2;
    let hoveredStarIndex: number | null = null;
    let starGlowFactors: number[] = [];
    let starfield: THREE.Points | null = null;
    let starfieldBasePositions: Float32Array | null = null;
    let lastNodeCenter = new THREE.Vector3();
    let animationId: number;

    if (mountRef.current) {
      const { scene, renderer, camera } = initThreeScene(mountRef.current);
      // --- Neon Starfield with Custom Shader ---
      const starCount = 1200;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const baseGlow = new Float32Array(starCount);
      starGlowFactors = new Array(starCount).fill(0);
      for (let i = 0; i < starCount; i++) {
        // Spread stars in a large sphere
        const r = 180 + Math.random() * 320;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        // 30% neon, 30% blue, 40% white
        const rand = Math.random();
        if (rand < 0.3) {
          // Neon colors
          const neonColors = [
            [1.0, 0.2, 1.0], // magenta
            [0.1, 1.0, 1.0], // cyan
            [0.5, 1.0, 0.3], // green
            [1.0, 1.0, 0.2], // yellow
          ];
          const c = neonColors[Math.floor(Math.random() * neonColors.length)];
          colors[i * 3] = c[0];
          colors[i * 3 + 1] = c[1];
          colors[i * 3 + 2] = c[2];
        } else if (rand < 0.6) {
          // Sparkling blue
          const blue = 0.7 + Math.random() * 0.3;
          colors[i * 3] = 0.3 * blue;
          colors[i * 3 + 1] = 0.5 * blue;
          colors[i * 3 + 2] = 1.0;
        } else {
          // White
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 1.0;
          colors[i * 3 + 2] = 1.0;
        }
        baseGlow[i] = 0.7 + Math.random() * 0.4;
      }
      starfieldBasePositions = positions.slice();
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      starGeometry.setAttribute('baseGlow', new THREE.BufferAttribute(baseGlow, 1));
      // ShaderMaterial for glow
      const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 39 }, // 3x bigger stars
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uHovered: { value: -1 },
        },
        vertexShader: `
          attribute float baseGlow;
          varying float vGlow;
          varying vec3 vColor;
          void main() {
            vColor = color;
            float pulse = 0.7 + 0.3 * sin(baseGlow + uTime * 1.5 + position.x * 0.01);
            vGlow = baseGlow * pulse;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * vGlow * (340.0 / length(mvPosition.xyz));
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying float vGlow;
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            float alpha = smoothstep(0.5, 0.2, dist) * vGlow;
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      starfield = new THREE.Points(starGeometry, starMaterial);
      scene.add(starfield);

      // Responsive: update renderer and camera on window resize
      function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (starMaterial.uniforms.uResolution) {
          starMaterial.uniforms.uResolution.value.set(width, height);
        }
      }
      window.addEventListener('resize', handleResize);
      handleResize();

      // Mouse interaction for star hover
      let pointer = { x: 0, y: 0 };
      function updatePointerFromEvent(e: MouseEvent | TouchEvent) {
        let clientX = 0, clientY = 0;
        if ('touches' in e && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      }
      renderer.domElement.addEventListener('mousemove', updatePointerFromEvent);
      renderer.domElement.addEventListener('touchmove', updatePointerFromEvent);

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      renderer.domElement.addEventListener('mousemove', (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      });

      // Animation loop
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        // Animate starfield
        if (starfield && starfieldBasePositions) {
          const time = performance.now() * 0.001;
          starMaterial.uniforms.uTime.value = time;
          // Outward drift for 3D effect
          const positionsAttr = starfield.geometry.getAttribute('position');
          for (let i = 0; i < starCount; i++) {
            let baseX = starfieldBasePositions[i * 3];
            let baseY = starfieldBasePositions[i * 3 + 1];
            let baseZ = starfieldBasePositions[i * 3 + 2];
            // Move outward slowly
            const driftSpeed = 0.01;
            const driftAmount = time * driftSpeed;
            const norm = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ) || 1;
            baseX += (baseX / norm) * driftAmount;
            baseY += (baseY / norm) * driftAmount;
            baseZ += (baseZ / norm) * driftAmount;
            positionsAttr.setX(i, baseX);
            positionsAttr.setY(i, baseY);
            positionsAttr.setZ(i, baseZ);
          }
          positionsAttr.needsUpdate = true;
        }
        // Raycast for star hover
        if (starfield) {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObject(starfield);
          let closestIndex = -1;
          let minDist = 0.08; // screen space threshold
          if (intersects.length > 0) {
            const intersect = intersects[0];
            closestIndex = intersect.index ?? -1;
          }
          // Animate glow for hovered star
          for (let i = 0; i < starCount; i++) {
            if (i === closestIndex) {
              starGlowFactors[i] += (1.5 - starGlowFactors[i]) * 0.15;
            } else {
              starGlowFactors[i] += (1.0 - starGlowFactors[i]) * 0.08;
            }
          }
          // Pass glow to geometry
          const baseGlowAttr = starfield.geometry.getAttribute('baseGlow');
          for (let i = 0; i < starCount; i++) {
            baseGlowAttr.setX(i, starGlowFactors[i]);
          }
          baseGlowAttr.needsUpdate = true;
        }
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animationId);
        renderer.domElement.removeEventListener('mousemove', updatePointerFromEvent);
        renderer.domElement.removeEventListener('touchmove', updatePointerFromEvent);
        window.removeEventListener('resize', handleResize);
        if (starfield) scene.remove(starfield);
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    }
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};

export default ThreeScene;
