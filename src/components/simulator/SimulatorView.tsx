import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Terminal,
  Compass,
  Zap,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CodeBlock, Mission } from '../../types/robot';
import { SimulatorScene3D } from './SimulatorScene3D';
import { sound } from '../../utils/sound';

interface SimulatorViewProps {
  installedComponents: string[];
  blocks: CodeBlock[];
  activeMission: Mission;
  onMissionCompleted: (missionId: number) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  installedComponents,
  blocks,
  activeMission,
  onMissionCompleted,
}) => {
  // Simulator State
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [robotPose, setRobotPose] = useState({ x: 0, z: -7.5, angle: 0 }); // Starts at green start pad
  const [robotStatus, setRobotStatus] = useState({
    isMoving: false,
    isTurning: false,
    ledOn: false,
    buzzerOn: false,
  });
  const [distanceMeasured, setDistanceMeasured] = useState(120);
  const [isAtGoal, setIsAtGoal] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'Simulador 3D preparado. Presioná ▶ EJECUTAR para correr el programa.',
  ]);

  // Selected scenario
  const [selectedScenario, setSelectedScenario] = useState(activeMission.scenarioType);

  useEffect(() => {
    setSelectedScenario(activeMission.scenarioType);
    handleReset();
  }, [activeMission]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTelemetryLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 30)]);
  };

  // Robot navigation loop
  const timerRef = useRef<number | null>(null);
  const executionIndexRef = useRef(0);
  const executionTickRef = useRef(0);

  const startSimulation = () => {
    if (blocks.length === 0) {
      addLog('⚠️ No hay bloques en el programa. Dirigite a Programador para crear la secuencia.');
      sound.playError();
      return;
    }

    if (!installedComponents.includes('battery') || !installedComponents.includes('controller')) {
      addLog('❌ Error de hardware: el robot necesita Batería y Controlador para encender.');
      sound.playError();
      return;
    }

    if (!installedComponents.includes('left_motor') || !installedComponents.includes('right_motor')) {
      addLog('⚠️ Alerta: El robot no tiene los 2 motores instalados para desplazarse.');
      sound.playError();
      return;
    }

    sound.playSimStart();
    setIsRunning(true);
    setIsPaused(false);
    addLog(`Iniciando programa: "${activeMission.title}" en escenario virtual...`);
  };

  const pauseSimulation = () => {
    setIsPaused(true);
    sound.playClick();
    addLog('Simulación pausada.');
  };

  const stopSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRobotStatus({ isMoving: false, isTurning: false, ledOn: false, buzzerOn: false });
    sound.playClick();
    addLog('Simulación detenida por el usuario.');
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRobotPose({ x: 0, z: -7.5, angle: 0 });
    setRobotStatus({ isMoving: false, isTurning: false, ledOn: false, buzzerOn: false });
    setIsAtGoal(false);
    setDistanceMeasured(120);
    executionIndexRef.current = 0;
    executionTickRef.current = 0;
    sound.playClick();
    addLog('Robot reubicado en la zona de inicio.');
  };

  // Main tick loop
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setRobotPose((prevPose) => {
        let newX = prevPose.x;
        let newZ = prevPose.z;
        let newAngle = prevPose.angle;

        // Calculate obstacle distance along robot forward vector (angle)
        // Obstacles locations based on scenario
        let minObsDist = 200;
        const obstaclePositions = [
          { x: 0, z: -2, radius: 1.4 },
          { x: 0, z: 3, radius: 1.4 },
          { x: -2.5, z: 0.5, radius: 1.4 },
          { x: 2.5, z: 1.5, radius: 1.4 },
        ];

        obstaclePositions.forEach((obs) => {
          const dx = obs.x - newX;
          const dz = obs.z - newZ;
          const dist = Math.hypot(dx, dz) * 20; // in cm
          // check if obstacle is in front
          const toAngle = Math.atan2(dx, dz);
          const angleDiff = Math.abs(toAngle - newAngle);
          if (angleDiff < Math.PI / 3 && dist < minObsDist) {
            minObsDist = dist;
          }
        });

        // Walls check
        const wallDistForward = Math.abs(10 - newZ) * 20;
        if (wallDistForward < minObsDist) minObsDist = wallDistForward;

        setDistanceMeasured(minObsDist);

        // Evaluate user block execution
        const hasUltrasonic = installedComponents.includes('ultrasonic');
        let moveForward = false;
        let turnAngle = 0;
        let ledActive = false;
        let buzzerActive = false;

        // Scan blocks in user program
        for (const block of blocks) {
          if (block.type === 'forward') {
            moveForward = true;
          } else if (block.type === 'stop') {
            moveForward = false;
          } else if (block.type === 'turn_right') {
            turnAngle = -0.06;
          } else if (block.type === 'turn_left') {
            turnAngle = 0.06;
          } else if (block.type === 'led_on') {
            ledActive = true;
          } else if (block.type === 'buzzer_beep') {
            buzzerActive = true;
          } else if (block.type === 'if_distance_less') {
            const threshold = block.value || 25;
            if (hasUltrasonic && minObsDist < threshold) {
              // Condition matched!
              addLog(`⚡ Condición cumplida: Distancia (${minObsDist.toFixed(0)} cm) < ${threshold} cm`);
              if (block.nestedBlocks) {
                for (const nested of block.nestedBlocks) {
                  if (nested.type === 'stop') moveForward = false;
                  if (nested.type === 'turn_right') turnAngle = -0.09;
                  if (nested.type === 'turn_left') turnAngle = 0.09;
                  if (nested.type === 'forward') moveForward = true;
                  if (nested.type === 'led_on') ledActive = true;
                  if (nested.type === 'buzzer_beep') buzzerActive = true;
                }
              }
            }
          }
        }

        // Apply movement
        if (moveForward) {
          const speed = 0.08;
          newX += Math.sin(newAngle) * speed;
          newZ += Math.cos(newAngle) * speed;
        }

        if (turnAngle !== 0) {
          newAngle += turnAngle;
        }

        // Clamp boundaries
        newX = Math.max(-8.5, Math.min(8.5, newX));
        newZ = Math.max(-8.5, Math.min(8.5, newZ));

        // Update status for wheels and lights
        setRobotStatus({
          isMoving: moveForward,
          isTurning: turnAngle !== 0,
          ledOn: ledActive,
          buzzerOn: buzzerActive,
        });

        // Check if goal reached! (Goal pad at z = 7.5)
        if (newZ >= 6.8 && Math.abs(newX) < 2.0 && !isAtGoal) {
          setIsAtGoal(true);
          sound.playSuccess();
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch {
            // Ignored
          }
          addLog('🎉 ¡META ALCANZADA! El robot completó el recorrido con éxito.');
          onMissionCompleted(activeMission.id);
        }

        return { x: newX, z: newZ, angle: newAngle };
      });
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, blocks, installedComponents, activeMission]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 bg-slate-950 text-slate-100 overflow-hidden">
      {/* 1. Main 3D Simulator Arena Canvas */}
      <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden relative">
        {/* Top Control Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Mission Indicator Pill */}
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 pointer-events-auto shadow-md">
            <Compass className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Misión en Curso:</div>
              <div className="text-xs font-bold font-display text-white">{activeMission.title}</div>
            </div>
          </div>

          {/* Player Execution Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 p-1.5 rounded-xl pointer-events-auto shadow-xl">
            {!isRunning ? (
              <button
                onClick={startSimulation}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg text-xs font-display font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                EJECUTAR
              </button>
            ) : isPaused ? (
              <button
                onClick={startSimulation}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Reanudar
              </button>
            ) : (
              <button
                onClick={pauseSimulation}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Pause className="w-3.5 h-3.5" />
                Pausar
              </button>
            )}

            <button
              onClick={stopSimulation}
              disabled={!isRunning && !isPaused}
              className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Detener
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              title="Volver a la zona inicial"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar Posición
            </button>
          </div>
        </div>

        {/* 3D Scene View */}
        <div className="flex-1 w-full h-full min-h-[380px]">
          <SimulatorScene3D
            scenarioType={selectedScenario}
            installedComponents={installedComponents}
            robotPose={robotPose}
            robotStatus={robotStatus}
            distanceMeasured={distanceMeasured}
            isAtGoal={isAtGoal}
          />
        </div>

        {/* Bottom Legend */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Zona Inicio
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Zona Llegada
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Obstáculos
            </span>
          </div>
          <div className="text-[11px] font-mono text-cyan-300">
            Posición: X: {robotPose.x.toFixed(1)} | Z: {robotPose.z.toFixed(1)}
          </div>
        </div>
      </div>

      {/* 2. Right Side: Mission Briefing & Live Telemetry Logs */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-4 shrink-0 space-y-4">
        {/* Mission Goal Card */}
        <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400">
              Objetivo de la Misión
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-500/20">
              +{activeMission.xpReward} XP
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {activeMission.objective}
          </p>
        </div>

        {/* Real-Time Telemetry Terminal */}
        <div className="flex-1 flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between p-2.5 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Consola de Telemetría
            </div>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          </div>

          <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-cyan-300/90 space-y-1.5 selection:bg-cyan-500/30">
            {telemetryLogs.map((log, idx) => (
              <div key={idx} className="leading-snug">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help for 3rd year students */}
        <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-xs text-cyan-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-cyan-300">
            <Zap className="w-3.5 h-3.5" /> Consejo Pedagógico:
          </div>
          <p className="text-[11px] text-slate-300">
            Si el robot choca, revisá el bloque condicional <strong>"Si Distancia &lt; X"</strong> y asegurate de darle tiempo para girar antes de continuar avanzando.
          </p>
        </div>
      </div>
    </div>
  );
};
