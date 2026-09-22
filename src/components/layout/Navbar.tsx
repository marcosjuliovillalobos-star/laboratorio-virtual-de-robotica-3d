import React from 'react';
import {
  Bot,
  Layers,
  Zap,
  Code,
  Play,
  Compass,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Activity,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { AppView, UserProgress } from '../../types/robot';
import { sound } from '../../utils/sound';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  progress: UserProgress;
  onOpenTeacherModal: () => void;
  onOpenDiagnosisModal: () => void;
  onOpenTutorial: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  progress,
  onOpenTeacherModal,
  onOpenDiagnosisModal,
  onOpenTutorial,
}) => {
  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Inicio', icon: Bot },
    { id: 'builder', label: 'Constructor 3D', icon: Layers },
    { id: 'connections', label: 'Conexiones', icon: Zap },
    { id: 'programmer', label: 'Programador', icon: Code },
    { id: 'simulator', label: 'Simulador 3D', icon: Play },
    { id: 'missions', label: 'Misiones', icon: Compass },
    { id: 'learn', label: 'Aprender', icon: BookOpen },
  ];

  return (
    <header className="w-full bg-slate-950/95 border-b border-slate-800 backdrop-blur px-4 py-2.5 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => {
            sound.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-extrabold text-sm text-white tracking-wide flex items-center gap-1.5">
              ROBOTLAB <span className="text-cyan-400 text-xs font-mono font-normal">3D</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Taller de Robótica • 3.º Año
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onNavigate(item.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Actions & Teacher Mode */}
      <div className="flex items-center gap-2">
        {/* XP and Level Counter */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-white font-bold">{progress.xp} XP</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300">Nivel {progress.level || Math.floor(progress.xp / 150) + 1}</span>
        </div>

        {/* Autodiagnosis Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenDiagnosisModal();
          }}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          title="Autodiagnóstico de componentes y software"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Diagnóstico</span>
        </button>

        {/* Tutorial Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenTutorial();
          }}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          title="Guía rápida en 5 pasos"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Ayuda</span>
        </button>

        {/* Teacher Panel Highlighted Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenTeacherModal();
          }}
          className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-sm"
        >
          <GraduationCap className="w-4 h-4 text-indigo-300" />
          <span>Panel Docente</span>
        </button>
      </div>
    </header>
  );
};
