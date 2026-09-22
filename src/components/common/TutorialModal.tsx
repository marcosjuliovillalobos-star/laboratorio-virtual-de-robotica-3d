import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Zap,
  Code,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToView: (view: any) => void;
}

const STEPS = [
  {
    step: 1,
    title: '¡Bienvenido al Laboratorio Virtual de Robótica 3D!',
    icon: Bot,
    subtitle: 'Taller de Robótica para 3.º Año de Secundaria',
    description:
      'En este laboratorio vas a experimentar de forma práctica cómo se crea un robot autónomo. Aprenderás a construirlo pieza por pieza, comprenderás su circuito eléctrico y lógico, programarás sus decisiones mediante bloques y lo verás navegar en un entorno 3D.',
    pedagogicalTip: 'Recordá la regla de oro: un robot no es solo metal, es la unión de una estructura física (hardware) y un pensamiento lógico (software).',
    actionText: 'Comenzar Recorrido',
  },
  {
    step: 2,
    title: 'Paso 1: Construye tu Robot en 3D',
    icon: Layers,
    subtitle: 'Hardware, Estructura y Tracción',
    description:
      'En el panel de Constructor podés arrastrar o montar los componentes esenciales: Chasis (soporte mecánico), Batería (energía), Controlador (cerebro) y Motores con Ruedas (movimiento). Podés rotar la cámara 360° para inspeccionar cada ángulo.',
    pedagogicalTip: 'Cada componente tiene una Ficha Técnica que te explica qué hace, qué recibe como entrada (Input) y qué produce como salida (Output).',
    actionText: 'Entendido, ver Conexiones',
  },
  {
    step: 3,
    title: 'Paso 2: Verifica Conexiones Lógicas',
    icon: Zap,
    subtitle: 'Flujo de Energía e Información',
    description:
      'Antes de arrancar, el robot necesita verificar que la batería alimenta al controlador y que los sensores transmiten datos a sus pines. El sistema de diagnóstico te avisará si falta alguna pieza clave como una rueda o la fuente de energía.',
    pedagogicalTip: 'La arquitectura robótica clásica es: ENTRADA (Sensores) → PROCESAMIENTO (Controlador) → SALIDA (Actuadores).',
    actionText: 'Continuar a Programación',
  },
  {
    step: 4,
    title: 'Paso 3: Programa con Bloques Visuales',
    icon: Code,
    subtitle: 'Algoritmos y Lógica de Control',
    description:
      'Armá el algoritmo arrastrando o pulsando bloques de movimiento (avanzar, girar), tiempos de espera y sensores condicionales (como "Si Distancia < 25 cm"). Además, podés ver cómo tus bloques se traducen automáticamente a código C++ real de Arduino.',
    pedagogicalTip: 'Un algoritmo es una secuencia finita, ordenada e inequívoca de instrucciones para resolver un problema.',
    actionText: 'Continuar al Simulador',
  },
  {
    step: 5,
    title: 'Paso 4: Simula y Supera Misiones',
    icon: Play,
    subtitle: 'Pruebas en el Escenario Virtual 3D',
    description:
      'Poné a prueba tu robot en la arena. Si colocaste un sensor ultrasónico, verás el haz de sonar en tiempo real detectando obstáculos. Si el robot llega a la meta, ganarás puntos de experiencia (XP) y desbloquearás insignias de taller.',
    pedagogicalTip: '¡No te frustres si al principio choca! En robótica, el error es parte fundamental del aprendizaje (probar, depurar y corregir).',
    actionText: '¡Ingresar al Laboratorio!',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onGoToView,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[currentStepIdx];
  const Icon = current.icon;
  const isLast = currentStepIdx === STEPS.length - 1;

  const handleNext = () => {
    sound.playClick();
    if (isLast) {
      onClose();
      onGoToView('builder');
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Step Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-cyan-300 rounded border border-slate-700">
              Paso {currentStepIdx + 1} de {STEPS.length}
            </span>
          </div>

          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              {current.subtitle}
            </div>
            <h2 className="font-display font-bold text-xl text-white mt-1">
              {current.title}
            </h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-200 space-y-1">
            <div className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Clave Pedagógica:
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed italic">
              "{current.pedagogicalTip}"
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg disabled:opacity-30 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Anterior
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-400 hover:text-slate-300"
            >
              Omitir tutorial
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-display font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
            >
              {current.actionText} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
