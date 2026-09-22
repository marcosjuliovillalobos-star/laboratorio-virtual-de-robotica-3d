import React from 'react';
import {
  Bot,
  Layers,
  Zap,
  Code,
  Play,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { UserProgress, Mission, AppView } from '../../types/robot';
import { sound } from '../../utils/sound';

interface HomeViewProps {
  progress: UserProgress;
  installedComponents: string[];
  activeMission: Mission;
  onNavigate: (view: AppView) => void;
  onOpenTutorial: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  progress,
  installedComponents,
  activeMission,
  onNavigate,
  onOpenTutorial,
}) => {
  const steps = [
    {
      id: 'builder' as AppView,
      step: '1',
      title: 'Construcción 3D',
      desc: 'Montá el chasis, batería, controlador y motores en 3D.',
      icon: Layers,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'connections' as AppView,
      step: '2',
      title: 'Conexión Lógica',
      desc: 'Verificá el circuito de energía y entradas/salidas.',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'programmer' as AppView,
      step: '3',
      title: 'Programación',
      desc: 'Armá la lógica con bloques visuales y mirá el código C++.',
      icon: Code,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      id: 'simulator' as AppView,
      step: '4',
      title: 'Simulación 3D',
      desc: 'Ejecutá el robot en la arena y esquivá obstáculos en vivo.',
      icon: Play,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'learn' as AppView,
      step: '5',
      title: 'Aprender',
      desc: 'Glosario de robótica y mini-desafíos conceptuales.',
      icon: BookOpen,
      color: 'from-violet-500 to-pink-600',
    },
  ];

  return (
    <div className="flex-1 w-full h-full p-6 bg-slate-950 text-slate-100 overflow-y-auto space-y-8">
      {/* 1. Hero Classroom Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334415_1px,transparent_1px),linear-gradient(to_bottom,#08334415_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Taller y Laboratorio de Robótica Educativa
            </div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Laboratorio Virtual de Construcción y Programación 3D
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Diseñado para estudiantes de <strong>3.º año de secundaria</strong>. Experimentá el ciclo completo de la ingeniería robótica:
              montá componentes modulares, programá algoritmos de decisión autónoma y probá tu creación en la arena 3D.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('builder');
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs md:text-sm font-display font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-95"
            >
              <Bot className="w-4 h-4" />
              Ingresar al Taller 3D
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenTutorial();
              }}
              className="px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-2 transition"
            >
              <HelpCircle className="w-4 h-4" />
              Guía de Inicio (5 Pasos)
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-mono uppercase">Misión Actual</div>
              <div className="font-bold text-white text-xs">{activeMission.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-mono uppercase">Puntos de Taller</div>
              <div className="font-bold text-white text-xs">{progress.xp} XP (Nivel {progress.level || Math.floor(progress.xp / 150) + 1})</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-mono uppercase">Completadas</div>
              <div className="font-bold text-white text-xs">{progress.completedMissions.length} de 5 Misiones</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-mono uppercase">Insignias Ganadas</div>
              <div className="font-bold text-white text-xs">{progress.unlockedBadges.length} de 6 Insignias</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Five-Step Learning Pathway */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base md:text-lg text-white flex items-center gap-2">
            <span>Ruta Pedagógica del Taller</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              (CONSTRUIR → CONECTAR → PROGRAMAR → SIMULAR → APRENDER)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(s.id);
                }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-cyan-400">
                    0{s.step}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug mt-1">
                    {s.desc}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 font-semibold pt-1">
                  Abrir sección <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Educational Concept Card: What is a Robot? */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-cyan-400">
            ¿Qué define a un Robot?
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A diferencia de un simple ventilador o juguete a cuerda, un robot es un <strong>sistema electromecánico programable</strong> que percibe su entorno a través de <em>sensores</em>, procesa los datos con un <em>controlador</em> y actúa mediante <em>actuadores</em>.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-amber-400">
            Diferencia Clave: Sensores vs Actuadores
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Los <strong>sensores</strong> son las entradas (ojos y oídos del robot): convierten magnitudes físicas (distancia, luz) en señales eléctricas. Los <strong>actuadores</strong> son las salidas: convierten señales eléctricas en movimiento o sonido.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-emerald-400">
            El Rol del Algoritmo
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El microcontrolador no toma decisiones por magia: ejecuta paso a paso el programa que vos escribís. Si no programás qué hacer ante un obstáculo, el robot simplemente seguirá avanzando hasta colisionar.
          </p>
        </div>
      </div>
    </div>
  );
};
