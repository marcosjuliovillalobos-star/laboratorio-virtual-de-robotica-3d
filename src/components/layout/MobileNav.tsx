import React from 'react';
import {
  Bot,
  Layers,
  Zap,
  Code,
  Play,
  Compass,
  BookOpen,
} from 'lucide-react';
import { AppView } from '../../types/robot';
import { sound } from '../../utils/sound';

interface MobileNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Inicio', icon: Bot },
    { id: 'builder', label: '3D', icon: Layers },
    { id: 'connections', label: 'Circuito', icon: Zap },
    { id: 'programmer', label: 'Bloques', icon: Code },
    { id: 'simulator', label: 'Simulador', icon: Play },
    { id: 'missions', label: 'Misiones', icon: Compass },
    { id: 'learn', label: 'Aprender', icon: BookOpen },
  ];

  return (
    <div className="lg:hidden flex items-center justify-around bg-slate-950/95 border-t border-slate-800 p-1.5 shrink-0 select-none z-30">
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
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-mono transition ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
