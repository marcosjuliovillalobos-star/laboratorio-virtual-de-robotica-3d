import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../../utils/sound';

export interface SimulatorObstacle {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
}

interface SimulatorScene3DProps {
  scenarioType: 'lab' | 'simple_circuit' | 'obstacle_corridor' | 'exploration_maze' | 'final_arena';
  installedComponents: string[];
  robotPose: { x: number; z: number; angle: number };
  robotStatus: {
    isMoving: boolean;
    isTurning: boolean;
    ledOn: boolean;
    buzzerOn: boolean;
  };
  distanceMeasured: number; // in cm
  isAtGoal: boolean;
  onPoseChange?: (pose: { x: number; z: number; angle: number }) => void;
  className?: string;
}

export const SimulatorScene3D: React.FC<SimulatorScene3DProps> = ({
  scenarioType,
  installedComponents,
  robotPose,
  robotStatus,
  distanceMeasured,
  isAtGoal,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const sonarBeamRef = useRef<THREE.Mesh | null>(null);
  const leftWheelRef = useRef<THREE.Group | null>(null);
  const rightWheelRef = useRef<THREE.Group | null>(null);
  const ledMeshRef = useRef<THREE.Mesh | null>(null);
  const ledLightRef = useRef<THREE.PointLight | null>(null);

  // Camera Orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraOffsetRef = useRef({ distance: 10, theta: Math.PI / 4, phi: Math.PI / 3.4 });

  // Update robot position and orientation in real-time
  useEffect(() => {
    if (robotGroupRef.current) {
      robotGroupRef.current.position.set(robotPose.x, 0, robotPose.z);
      robotGroupRef.current.rotation.y = robotPose.angle;
    }
  }, [robotPose]);

  // Handle buzzer sounds
  useEffect(() => {
    if (robotStatus.buzzerOn && installedComponents.includes('buzzer')) {
      sound.playBuzzer();
    }
  }, [robotStatus.buzzerOn]);

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Dark arena
    scene.fog = new THREE.FogExp2(0x060913, 0.04);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.75);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(8, 14, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x00f0ff, 1.8, 16);
    cyanPoint.position.set(0, 4, 0);
    scene.add(cyanPoint);

    // Arena Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Sci-fi track grid
    const grid = new THREE.GridHelper(24, 24, 0x00f0ff, 0x1e293b);
    grid.position.y = 0.005;
    scene.add(grid);

    // Outer Perimeter Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 });
    const wallThickness = 0.3;
    const wallHeight = 1.0;
    const arenaSize = 20;

    const createWall = (x: number, z: number, w: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, wallHeight, d);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, wallHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    };

    // 4 Border walls
    createWall(0, -arenaSize / 2, arenaSize, wallThickness);
    createWall(0, arenaSize / 2, arenaSize, wallThickness);
    createWall(-arenaSize / 2, 0, wallThickness, arenaSize);
    createWall(arenaSize / 2, 0, wallThickness, arenaSize);

    // Start Zone (Green Glowing Pad)
    const startPadGeo = new THREE.BoxGeometry(2.4, 0.02, 2.4);
    const startPadMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.4,
    });
    const startPad = new THREE.Mesh(startPadGeo, startPadMat);
    startPad.position.set(0, 0.01, -7.5);
    scene.add(startPad);

    // Start Label outline ring
    const startRingGeo = new THREE.RingGeometry(1.4, 1.48, 32);
    const startRingMat = new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide });
    const startRing = new THREE.Mesh(startRingGeo, startRingMat);
    startRing.rotation.x = -Math.PI / 2;
    startRing.position.set(0, 0.02, -7.5);
    scene.add(startRing);

    // Goal Zone (Blue Glowing Pad)
    const goalPadGeo = new THREE.BoxGeometry(2.6, 0.02, 2.6);
    const goalPadMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
    });
    const goalPad = new THREE.Mesh(goalPadGeo, goalPadMat);
    goalPad.position.set(0, 0.01, 7.5);
    scene.add(goalPad);

    // Goal Beacon (floating crystal prism)
    const beaconGeo = new THREE.OctahedronGeometry(0.4, 0);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.1,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 1.2, 7.5);
    scene.add(beacon);

    // Obstacles depending on Scenario
    const obsMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red hazard crates
      roughness: 0.4,
      metalness: 0.3,
    });

    const addObstacleBox = (x: number, z: number, w = 1.6, d = 1.6, h = 1.2) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(geo, obsMat);
      m.position.set(x, h / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;

      // Hazard yellow-black stripes border
      const borderGeo = new THREE.BoxGeometry(w + 0.02, 0.12, d + 0.02);
      const borderMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.set(0, 0, 0);
      m.add(border);

      scene.add(m);
    };

    if (scenarioType === 'simple_circuit') {
      // Circuit with clear side lane guide barriers
      createWall(-2.8, 0, 0.2, 16);
      createWall(2.8, 0, 0.2, 16);
    } else if (scenarioType === 'obstacle_corridor') {
      // Central obstacles blocking direct forward path
      createWall(-3.2, 0, 0.2, 16);
      createWall(3.2, 0, 0.2, 16);
      addObstacleBox(0, -2, 2.0, 1.2, 1.2);
      addObstacleBox(0, 3, 2.0, 1.2, 1.2);
    } else if (scenarioType === 'exploration_maze' || scenarioType === 'final_arena') {
      // Complex labyrinth of barriers
      addObstacleBox(0, -3.5, 2.4, 1.0, 1.2);
      addObstacleBox(-2.5, 0.5, 2.2, 1.2, 1.2);
      addObstacleBox(2.5, 1.5, 2.2, 1.2, 1.2);
      addObstacleBox(0, 4.5, 2.8, 1.0, 1.2);
    } else {
      // Free lab with a couple of test pylons
      addObstacleBox(-2.5, 0, 1.2, 1.2, 1.0);
      addObstacleBox(2.5, 0, 1.2, 1.2, 1.0);
    }

    // Master Robot 3D in Arena
    const robotGroup = new THREE.Group();
    robotGroupRef.current = robotGroup;
    robotGroup.position.set(robotPose.x, 0, robotPose.z);
    robotGroup.rotation.y = robotPose.angle;
    scene.add(robotGroup);

    // Chassis
    const baseGeo = new THREE.BoxGeometry(0.8, 0.08, 1.0);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.25;
    base.castShadow = true;
    robotGroup.add(base);

    // Top Controller Plate
    const ctlGeo = new THREE.BoxGeometry(0.55, 0.06, 0.5);
    const ctlMat = new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.3 });
    const ctl = new THREE.Mesh(ctlGeo, ctlMat);
    ctl.position.set(0, 0.32, 0);
    robotGroup.add(ctl);

    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 18);

    const lWheelGroup = new THREE.Group();
    lWheelGroup.position.set(-0.48, 0.24, 0);
    const lWheel = new THREE.Mesh(wheelGeo, wheelMat);
    lWheel.rotation.z = Math.PI / 2;
    lWheelGroup.add(lWheel);
    leftWheelRef.current = lWheelGroup;
    robotGroup.add(lWheelGroup);

    const rWheelGroup = new THREE.Group();
    rWheelGroup.position.set(0.48, 0.24, 0);
    const rWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rWheel.rotation.z = Math.PI / 2;
    rWheelGroup.add(rWheel);
    rightWheelRef.current = rWheelGroup;
    robotGroup.add(rWheelGroup);

    // Front Caster sphere
    const castorGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const castorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const castor = new THREE.Mesh(castorGeo, castorMat);
    castor.position.set(0, 0.08, -0.38);
    robotGroup.add(castor);

    // Sensor Ultrasonic Eyes (HC-SR04)
    if (installedComponents.includes('ultrasonic')) {
      const usEyeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12);
      const usEyeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 });

      const eyeL = new THREE.Mesh(usEyeGeo, usEyeMat);
      eyeL.rotation.x = Math.PI / 2;
      eyeL.position.set(-0.1, 0.36, 0.52);
      robotGroup.add(eyeL);

      const eyeR = new THREE.Mesh(usEyeGeo, usEyeMat);
      eyeR.rotation.x = Math.PI / 2;
      eyeR.position.set(0.1, 0.36, 0.52);
      robotGroup.add(eyeR);

      // Visual Sonar Beam Cone
      const coneGeo = new THREE.ConeGeometry(0.6, 2.5, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const beam = new THREE.Mesh(coneGeo, coneMat);
      beam.rotation.x = -Math.PI / 2;
      beam.position.set(0, 0.36, 1.7);
      sonarBeamRef.current = beam;
      robotGroup.add(beam);
    }

    // LED
    if (installedComponents.includes('led')) {
      const ledGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const lMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.2 });
      const ledM = new THREE.Mesh(ledGeo, lMat);
      ledM.position.set(-0.2, 0.36, 0.2);
      ledMeshRef.current = ledM;
      robotGroup.add(ledM);

      const lLight = new THREE.PointLight(0xff2222, 0, 2);
      lLight.position.set(-0.2, 0.45, 0.2);
      ledLightRef.current = lLight;
      robotGroup.add(lLight);
    }

    // Buzzer cylinder
    if (installedComponents.includes('buzzer')) {
      const bzGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12);
      const bzMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      const bz = new THREE.Mesh(bzGeo, bzMat);
      bz.position.set(0.2, 0.35, -0.2);
      robotGroup.add(bz);
    }

    // Orbit Camera Controls
    const updateCam = () => {
      const { distance, theta, phi } = cameraOffsetRef.current;
      const robotX = robotGroupRef.current ? robotGroupRef.current.position.x : 0;
      const robotZ = robotGroupRef.current ? robotGroupRef.current.position.z : 0;

      const x = robotX + distance * Math.sin(phi) * Math.sin(theta);
      const y = distance * Math.cos(phi);
      const z = robotZ + distance * Math.sin(phi) * Math.cos(theta);

      camera.position.set(x, y + 1.2, z);
      camera.lookAt(robotX, 0.4, robotZ);
    };
    updateCam();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      cameraOffsetRef.current.theta -= dx * 0.008;
      cameraOffsetRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, cameraOffsetRef.current.phi - dy * 0.008));
      updateCam();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraOffsetRef.current.distance = Math.max(4.0, Math.min(18.0, cameraOffsetRef.current.distance + e.deltaY * 0.01));
      updateCam();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Resize Observer
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

      // Spin beacon prism
      beacon.rotation.y += delta * 1.5;
      beacon.position.y = 1.1 + Math.sin(elapsed * 2.5) * 0.15;

      // Wheel rotation
      if (robotStatus.isMoving) {
        if (leftWheelRef.current) leftWheelRef.current.rotation.x += delta * 10;
        if (rightWheelRef.current) rightWheelRef.current.rotation.x += delta * 10;
      } else if (robotStatus.isTurning) {
        if (leftWheelRef.current) leftWheelRef.current.rotation.x += delta * 8;
        if (rightWheelRef.current) rightWheelRef.current.rotation.x -= delta * 8;
      }

      // Sonar beam visualization
      if (sonarBeamRef.current) {
        const pulse = 1 + (Math.sin(elapsed * 8) + 1) * 0.15;
        sonarBeamRef.current.scale.set(pulse, pulse, pulse);
        // Color changes to red warning if close obstacle
        const mat = sonarBeamRef.current.material as THREE.MeshBasicMaterial;
        if (distanceMeasured < 30) {
          mat.color.setHex(0xef4444);
          mat.opacity = 0.6;
        } else {
          mat.color.setHex(0x00f0ff);
          mat.opacity = 0.25;
        }
      }

      // LED glowing
      if (ledMeshRef.current && ledLightRef.current) {
        if (robotStatus.ledOn) {
          ledLightRef.current.intensity = 3.0;
          (ledMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0;
        } else {
          ledLightRef.current.intensity = 0;
          (ledMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
        }
      }

      // Update camera smooth follow
      updateCam();

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
      renderer.dispose();
    };
  }, [scenarioType, installedComponents]);

  return (
    <div className={`w-full h-full relative overflow-hidden rounded-xl select-none ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Real-Time HUD Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
        {/* Sensor Live Readout */}
        {installedComponents.includes('ultrasonic') && (
          <div className="bg-slate-900/90 backdrop-blur border border-cyan-500/40 px-3.5 py-2.5 rounded-lg shadow-lg flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${distanceMeasured < 30 ? 'bg-red-500 animate-ping' : 'bg-cyan-400'}`} />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-display">
                📡 Sensor Ultrasónico
              </div>
              <div className="text-sm font-mono font-bold text-white flex items-center gap-2">
                Distancia:{' '}
                <span className={distanceMeasured < 30 ? 'text-red-400' : 'text-cyan-300'}>
                  {distanceMeasured.toFixed(0)} cm
                </span>
                {distanceMeasured < 30 && (
                  <span className="text-[11px] font-semibold bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                    ⚠️ Obstáculo
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LED & Actuator Status */}
        <div className="flex gap-2">
          {installedComponents.includes('led') && (
            <div className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border flex items-center gap-1.5 ${
              robotStatus.ledOn ? 'bg-red-500/30 border-red-500 text-red-300' : 'bg-slate-900/80 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${robotStatus.ledOn ? 'bg-red-400 shadow-[0_0_8px_#f87171]' : 'bg-slate-600'}`} />
              LED RGB: {robotStatus.ledOn ? 'ON' : 'OFF'}
            </div>
          )}

          {installedComponents.includes('buzzer') && (
            <div className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border flex items-center gap-1.5 ${
              robotStatus.buzzerOn ? 'bg-violet-500/30 border-violet-500 text-violet-300' : 'bg-slate-900/80 border-slate-800 text-slate-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${robotStatus.buzzerOn ? 'bg-violet-400 shadow-[0_0_8px_#c084fc]' : 'bg-slate-600'}`} />
              Buzzer: {robotStatus.buzzerOn ? 'SONANDO' : 'SILENCIO'}
            </div>
          )}
        </div>
      </div>

      {/* Goal Victory Notification Overlay */}
      {isAtGoal && (
        <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl mb-3 shadow-[0_0_24px_rgba(6,182,212,0.5)]">
            🎯
          </div>
          <h3 className="text-2xl font-bold font-display text-white mb-1">
            ¡Meta Alcanzada con Éxito!
          </h3>
          <p className="text-cyan-200 text-sm max-w-md">
            Tu robot ejecutó el algoritmo, navegó por el escenario y completó el circuito virtual.
          </p>
        </div>
      )}
    </div>
  );
};
