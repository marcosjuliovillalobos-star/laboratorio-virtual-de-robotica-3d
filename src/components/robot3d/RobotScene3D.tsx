import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface RobotScene3DProps {
  installedComponents: string[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  isSimulating?: boolean;
  robotState?: {
    isMoving?: boolean;
    isTurning?: boolean;
    ledOn?: boolean;
    buzzerOn?: boolean;
    servoAngle?: number;
    sensorDistance?: number;
  };
  cameraView?: 'front' | 'side' | 'top' | 'isometric' | 'reset';
  className?: string;
}

export const RobotScene3D: React.FC<RobotScene3DProps> = ({
  installedComponents,
  selectedComponentId,
  onSelectComponent,
  isSimulating = false,
  robotState,
  cameraView = 'isometric',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);

  // References to animated meshes
  const leftWheelRef = useRef<THREE.Group | null>(null);
  const rightWheelRef = useRef<THREE.Group | null>(null);
  const ledMeshRef = useRef<THREE.Mesh | null>(null);
  const ledLightRef = useRef<THREE.PointLight | null>(null);
  const ultrasonicWavesRef = useRef<THREE.Mesh | null>(null);
  const servoHornRef = useRef<THREE.Group | null>(null);

  // Mouse / Orbit controls state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 4.8, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetLookAt = useRef(new THREE.Vector3(0, 0.45, 0));

  // Raycaster for part selection
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Function to set camera angle preset
  const setCameraPreset = (view: 'front' | 'side' | 'top' | 'isometric' | 'reset') => {
    switch (view) {
      case 'front':
        sphericalRef.current = { radius: 4.5, theta: 0, phi: Math.PI / 2.2 };
        break;
      case 'side':
        sphericalRef.current = { radius: 4.5, theta: Math.PI / 2, phi: Math.PI / 2.2 };
        break;
      case 'top':
        sphericalRef.current = { radius: 4.5, theta: 0, phi: 0.05 };
        break;
      case 'isometric':
      case 'reset':
      default:
        sphericalRef.current = { radius: 4.8, theta: Math.PI / 4, phi: Math.PI / 3.2 };
        break;
    }
    updateCameraPosition();
  };

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const clampedPhi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, phi));
    sphericalRef.current.phi = clampedPhi;

    const x = radius * Math.sin(clampedPhi) * Math.sin(theta);
    const y = radius * Math.cos(clampedPhi);
    const z = radius * Math.sin(clampedPhi) * Math.cos(theta);

    cameraRef.current.position.set(x, y + targetLookAt.current.y, z);
    cameraRef.current.lookAt(targetLookAt.current);
  };

  // Re-orient when cameraView changes
  useEffect(() => {
    setCameraPreset(cameraView);
  }, [cameraView]);

  // Main Three.js setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16); // Deep sci-fi lab slate
    sceneRef.current = scene;

    // Fog for depth
    scene.fog = new THREE.FogExp2(0x090d16, 0.08);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      // Fallback if WebGL has issues
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 1. Lights
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 0.85); // soft cyan-green tint
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    scene.add(dirLight);

    const blueRimLight = new THREE.DirectionalLight(0x00d2ff, 1.2);
    blueRimLight.position.set(-5, 4, -4);
    scene.add(blueRimLight);

    // 2. High-tech Lab Grid Platform
    const gridHelper = new THREE.GridHelper(8, 20, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Platform circular base
    const platformGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.1, 48);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.4,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.05;
    platform.receiveShadow = true;
    scene.add(platform);

    // Glowing platform ring
    const ringGeo = new THREE.RingGeometry(2.35, 2.45, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    scene.add(ring);

    // Master Robot Group
    const robotGroup = new THREE.Group();
    robotGroupRef.current = robotGroup;
    scene.add(robotGroup);

    // Mouse Controls Listeners
    const onMouseDown = (e: MouseEvent) => {
      // Check if clicking on canvas
      if (e.button === 0) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= deltaX * 0.01;
      sphericalRef.current.phi -= deltaY * 0.01;
      updateCameraPosition();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius += e.deltaY * 0.004;
      sphericalRef.current.radius = Math.max(2.2, Math.min(8.0, sphericalRef.current.radius));
      updateCameraPosition();
    };

    // Touch support for tablets & mobile
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
        const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        sphericalRef.current.theta -= deltaX * 0.012;
        sphericalRef.current.phi -= deltaY * 0.012;
        updateCameraPosition();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = (touchStartDist - dist) * 0.01;
        touchStartDist = dist;
        sphericalRef.current.radius = Math.max(2.2, Math.min(8.0, sphericalRef.current.radius + factor));
        updateCameraPosition();
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // Click on component raycasting
    const onCanvasClick = (e: MouseEvent) => {
      // If mouse moved noticeably, it's a drag, not a click
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      if (robotGroupRef.current) {
        const intersects = raycasterRef.current.intersectObjects(robotGroupRef.current.children, true);
        if (intersects.length > 0) {
          // Find root object containing componentId userData
          let curr: THREE.Object3D | null = intersects[0].object;
          while (curr && curr !== robotGroupRef.current) {
            if (curr.userData && curr.userData.componentId) {
              onSelectComponent(curr.userData.componentId);
              break;
            }
            curr = curr.parent;
          }
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onCanvasClick);

    dom.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate wheels if robot is moving in simulation
      if (isSimulating && robotState?.isMoving) {
        if (leftWheelRef.current) leftWheelRef.current.rotation.x += delta * 8;
        if (rightWheelRef.current) rightWheelRef.current.rotation.x += delta * 8;
      } else if (isSimulating && robotState?.isTurning) {
        if (leftWheelRef.current) leftWheelRef.current.rotation.x += delta * 6;
        if (rightWheelRef.current) rightWheelRef.current.rotation.x -= delta * 6;
      }

      // Ultrasonic sensor waves animation
      if (ultrasonicWavesRef.current) {
        const scale = 1 + (Math.sin(elapsed * 6) + 1) * 0.25;
        ultrasonicWavesRef.current.scale.set(scale, scale, scale);
        (ultrasonicWavesRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.abs(Math.sin(elapsed * 4)) * 0.35;
      }

      // LED blink/glow
      if (ledMeshRef.current && ledLightRef.current) {
        if (robotState?.ledOn) {
          ledLightRef.current.intensity = 2.5 + Math.sin(elapsed * 12) * 0.8;
          (ledMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0;
        } else {
          ledLightRef.current.intensity = 0;
          (ledMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
        }
      }

      // Idle float for high-tech pedestal
      if (robotGroupRef.current && !isSimulating) {
        robotGroupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onCanvasClick);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, []);

  // Build the 3D modular robot whenever installedComponents or selection changes
  useEffect(() => {
    const robotGroup = robotGroupRef.current;
    if (!robotGroup) return;

    // Clear old robot meshes
    while (robotGroup.children.length > 0) {
      robotGroup.remove(robotGroup.children[0]);
    }

    leftWheelRef.current = null;
    rightWheelRef.current = null;
    ledMeshRef.current = null;
    ledLightRef.current = null;
    ultrasonicWavesRef.current = null;
    servoHornRef.current = null;

    const has = (id: string) => installedComponents.includes(id);
    const isSel = (id: string) => selectedComponentId === id;

    // Helper material generator with selection highlight
    const createMat = (baseColor: number, isSelected: boolean, roughness = 0.4, metalness = 0.3) => {
      return new THREE.MeshStandardMaterial({
        color: isSelected ? 0x38bdf8 : baseColor,
        emissive: isSelected ? 0x0284c7 : 0x000000,
        emissiveIntensity: isSelected ? 0.45 : 0,
        roughness,
        metalness,
      });
    };

    // 1. CHASIS BASE
    if (has('chassis')) {
      const chassisGroup = new THREE.Group();
      chassisGroup.userData = { componentId: 'chassis' };

      // Main plate
      const baseGeo = new THREE.BoxGeometry(1.2, 0.08, 1.4);
      const baseMat = createMat(0x1e293b, isSel('chassis'), 0.5, 0.4); // Dark futuristic acrylic
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(0, 0.38, 0);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      chassisGroup.add(baseMesh);

      // Neon edge strips on chassis
      const edgeGeo = new THREE.BoxGeometry(1.22, 0.03, 0.04);
      const edgeMat = new THREE.MeshBasicMaterial({ color: isSel('chassis') ? 0x38bdf8 : 0x00f0ff });
      const frontEdge = new THREE.Mesh(edgeGeo, edgeMat);
      frontEdge.position.set(0, 0.38, 0.7);
      chassisGroup.add(frontEdge);

      // Caster wheel (ball) in the rear for 3-point balance
      const casterSupportGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16);
      const casterSupportMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
      const casterSupport = new THREE.Mesh(casterSupportGeo, casterSupportMat);
      casterSupport.position.set(0, 0.25, -0.5);
      chassisGroup.add(casterSupport);

      const ballGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(0, 0.12, -0.5);
      ball.castShadow = true;
      chassisGroup.add(ball);

      robotGroup.add(chassisGroup);
    }

    // 2. SOPORTE SUPERIOR (Upper Mount with 4 standoffs)
    if (has('upper_mount')) {
      const upperGroup = new THREE.Group();
      upperGroup.userData = { componentId: 'upper_mount' };

      // Standoff pillars
      const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });

      const offsets = [
        [-0.45, 0.45],
        [0.45, 0.45],
        [-0.45, -0.45],
        [0.45, -0.45],
      ];

      offsets.forEach(([ox, oz]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(ox, 0.58, oz);
        upperGroup.add(pillar);
      });

      // Upper acrylic plate
      const upperPlateGeo = new THREE.BoxGeometry(1.1, 0.06, 1.2);
      const upperPlateMat = createMat(0x0284c7, isSel('upper_mount'), 0.3, 0.6);
      const upperPlate = new THREE.Mesh(upperPlateGeo, upperPlateMat);
      upperPlate.position.set(0, 0.76, 0);
      upperPlate.castShadow = true;
      upperGroup.add(upperPlate);

      robotGroup.add(upperGroup);
    }

    // 3. MOTOR IZQUIERDO
    if (has('left_motor')) {
      const motorGroup = new THREE.Group();
      motorGroup.userData = { componentId: 'left_motor' };

      // Yellow gearbox block (classic TT DC motor)
      const boxGeo = new THREE.BoxGeometry(0.22, 0.22, 0.45);
      const boxMat = createMat(0xeab308, isSel('left_motor'), 0.4, 0.2);
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(-0.52, 0.35, 0);
      box.castShadow = true;
      motorGroup.add(box);

      // Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 12);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(-0.66, 0.35, 0);
      motorGroup.add(shaft);

      robotGroup.add(motorGroup);
    }

    // 4. MOTOR DERECHO
    if (has('right_motor')) {
      const motorGroup = new THREE.Group();
      motorGroup.userData = { componentId: 'right_motor' };

      const boxGeo = new THREE.BoxGeometry(0.22, 0.22, 0.45);
      const boxMat = createMat(0xeab308, isSel('right_motor'), 0.4, 0.2);
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0.52, 0.35, 0);
      box.castShadow = true;
      motorGroup.add(box);

      const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 12);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(0.66, 0.35, 0);
      motorGroup.add(shaft);

      robotGroup.add(motorGroup);
    }

    // 5. RUEDA IZQUIERDA
    if (has('left_wheel')) {
      const wheelGroup = new THREE.Group();
      wheelGroup.userData = { componentId: 'left_wheel' };
      wheelGroup.position.set(-0.75, 0.35, 0);

      // Rim
      const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 24);
      const rimMat = createMat(0xf97316, isSel('left_wheel'), 0.3, 0.4);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // Rubber Tire
      const tireGeo = new THREE.TorusGeometry(0.33, 0.06, 16, 32);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.y = Math.PI / 2;
      wheelGroup.add(tire);

      leftWheelRef.current = wheelGroup;
      robotGroup.add(wheelGroup);
    }

    // 6. RUEDA DERECHA
    if (has('right_wheel')) {
      const wheelGroup = new THREE.Group();
      wheelGroup.userData = { componentId: 'right_wheel' };
      wheelGroup.position.set(0.75, 0.35, 0);

      const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 24);
      const rimMat = createMat(0xf97316, isSel('right_wheel'), 0.3, 0.4);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      const tireGeo = new THREE.TorusGeometry(0.33, 0.06, 16, 32);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.y = Math.PI / 2;
      wheelGroup.add(tire);

      rightWheelRef.current = wheelGroup;
      robotGroup.add(wheelGroup);
    }

    // 7. BATERÍA
    if (has('battery')) {
      const batteryGroup = new THREE.Group();
      batteryGroup.userData = { componentId: 'battery' };

      // Battery pack body
      const packGeo = new THREE.BoxGeometry(0.6, 0.22, 0.45);
      const packMat = createMat(0x047857, isSel('battery'), 0.4, 0.3); // Emerald/dark battery casing
      const pack = new THREE.Mesh(packGeo, packMat);
      pack.position.set(0, 0.52, -0.2);
      pack.castShadow = true;
      batteryGroup.add(pack);

      // Warning label / battery terminals
      const termGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12);
      const termMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });

      const term1 = new THREE.Mesh(termGeo, termMat);
      term1.position.set(-0.15, 0.65, -0.2);
      batteryGroup.add(term1);

      const term2 = new THREE.Mesh(termGeo, termMat);
      term2.position.set(0.15, 0.65, -0.2);
      batteryGroup.add(term2);

      robotGroup.add(batteryGroup);
    }

    // 8. CONTROLADOR (PCB Board)
    if (has('controller')) {
      const ctlGroup = new THREE.Group();
      ctlGroup.userData = { componentId: 'controller' };

      const yLevel = has('upper_mount') ? 0.82 : 0.46;

      // Green PCB board
      const pcbGeo = new THREE.BoxGeometry(0.7, 0.04, 0.55);
      const pcbMat = createMat(0x059669, isSel('controller'), 0.5, 0.3); // Emerald PCB
      const pcb = new THREE.Mesh(pcbGeo, pcbMat);
      pcb.position.set(0, yLevel, 0.05);
      pcb.castShadow = true;
      ctlGroup.add(pcb);

      // Microcontroller chip (black square)
      const chipGeo = new THREE.BoxGeometry(0.24, 0.04, 0.24);
      const chipMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 });
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(0, yLevel + 0.03, 0.05);
      ctlGroup.add(chip);

      // Pin headers (black rows)
      const headerGeo = new THREE.BoxGeometry(0.6, 0.06, 0.05);
      const headerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const header1 = new THREE.Mesh(headerGeo, headerMat);
      header1.position.set(0, yLevel + 0.04, 0.25);
      ctlGroup.add(header1);

      const header2 = new THREE.Mesh(headerGeo, headerMat);
      header2.position.set(0, yLevel + 0.04, -0.15);
      ctlGroup.add(header2);

      robotGroup.add(ctlGroup);
    }

    // 9. SENSOR ULTRASÓNICO (HC-SR04 with dual transmitter/receiver eyes)
    if (has('ultrasonic')) {
      const usGroup = new THREE.Group();
      usGroup.userData = { componentId: 'ultrasonic' };

      const yLevel = has('upper_mount') ? 0.95 : 0.58;
      usGroup.position.set(0, yLevel, 0.68);

      // Blue PCB plate
      const usPcbGeo = new THREE.BoxGeometry(0.5, 0.22, 0.04);
      const usPcbMat = createMat(0x0284c7, isSel('ultrasonic'), 0.4, 0.3);
      const usPcb = new THREE.Mesh(usPcbGeo, usPcbMat);
      usGroup.add(usPcb);

      // Transmitter cylinder (Silver Eye)
      const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 16);
      const cylMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.8, roughness: 0.3 });

      const eyeLeft = new THREE.Mesh(cylGeo, cylMat);
      eyeLeft.rotation.x = Math.PI / 2;
      eyeLeft.position.set(-0.14, 0, 0.08);
      usGroup.add(eyeLeft);

      // Receiver cylinder (Silver Eye)
      const eyeRight = new THREE.Mesh(cylGeo, cylMat);
      eyeRight.rotation.x = Math.PI / 2;
      eyeRight.position.set(0.14, 0, 0.08);
      usGroup.add(eyeRight);

      // Visual detection sonar cone / arc
      const coneGeo = new THREE.ConeGeometry(0.5, 1.2, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.rotation.x = -Math.PI / 2;
      coneMesh.position.set(0, 0, 0.7);
      ultrasonicWavesRef.current = coneMesh;
      usGroup.add(coneMesh);

      robotGroup.add(usGroup);
    }

    // 10. SENSOR DE LUZ (LDR)
    if (has('light_sensor')) {
      const lightGroup = new THREE.Group();
      lightGroup.userData = { componentId: 'light_sensor' };

      const yLevel = has('upper_mount') ? 0.82 : 0.44;
      lightGroup.position.set(0.38, yLevel, 0.35);

      // Small PCB mount
      const baseGeo = new THREE.BoxGeometry(0.14, 0.04, 0.14);
      const baseMat = createMat(0x7c3aed, isSel('light_sensor'), 0.5, 0.2);
      const base = new THREE.Mesh(baseGeo, baseMat);
      lightGroup.add(base);

      // LDR sensor disc
      const ldrGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12);
      const ldrMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
      const ldr = new THREE.Mesh(ldrGeo, ldrMat);
      ldr.position.y = 0.04;
      lightGroup.add(ldr);

      robotGroup.add(lightGroup);
    }

    // 11. LED INDICADOR
    if (has('led')) {
      const ledGroup = new THREE.Group();
      ledGroup.userData = { componentId: 'led' };

      const yLevel = has('upper_mount') ? 0.82 : 0.44;
      ledGroup.position.set(-0.38, yLevel, 0.35);

      // Base socket
      const sockGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.06, 12);
      const sockMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const sock = new THREE.Mesh(sockGeo, sockMat);
      ledGroup.add(sock);

      // Bulb (hemisphere/dome)
      const bulbGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.2,
        roughness: 0.2,
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 0.08;
      ledMeshRef.current = bulb;
      ledGroup.add(bulb);

      // PointLight for glowing effect
      const pLight = new THREE.PointLight(0xff0044, 0, 1.5);
      pLight.position.y = 0.1;
      ledLightRef.current = pLight;
      ledGroup.add(pLight);

      robotGroup.add(ledGroup);
    }

    // 12. BUZZER
    if (has('buzzer')) {
      const buzzerGroup = new THREE.Group();
      buzzerGroup.userData = { componentId: 'buzzer' };

      const yLevel = has('upper_mount') ? 0.82 : 0.44;
      buzzerGroup.position.set(0, yLevel, -0.45);

      // Black cylinder casing
      const cylGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16);
      const cylMat = createMat(0x18181b, isSel('buzzer'), 0.7, 0.2);
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      buzzerGroup.add(cyl);

      // Sound aperture hole
      const holeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.y = 0.065;
      buzzerGroup.add(hole);

      robotGroup.add(buzzerGroup);
    }

    // 13. SERVOMOTOR
    if (has('servo')) {
      const servoGroup = new THREE.Group();
      servoGroup.userData = { componentId: 'servo' };

      const yLevel = has('upper_mount') ? 0.82 : 0.44;
      servoGroup.position.set(0, yLevel, 0.45);

      // Blue micro servo body (SG90 style)
      const bodyGeo = new THREE.BoxGeometry(0.16, 0.22, 0.24);
      const bodyMat = createMat(0x0284c7, isSel('servo'), 0.4, 0.3);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      servoGroup.add(body);

      // Rotating horn group
      const hornGroup = new THREE.Group();
      hornGroup.position.set(0, 0.14, 0.05);

      const hornGeo = new THREE.BoxGeometry(0.06, 0.02, 0.25);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      hornGroup.add(horn);

      servoHornRef.current = hornGroup;
      servoGroup.add(hornGroup);

      robotGroup.add(servoGroup);
    }
  }, [installedComponents, selectedComponentId]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-xl bg-slate-950 ${className}`}
      title="Usa el mouse o el dedo para rotar 360°, hacer zoom y pulsar sobre cualquier pieza"
    />
  );
};
