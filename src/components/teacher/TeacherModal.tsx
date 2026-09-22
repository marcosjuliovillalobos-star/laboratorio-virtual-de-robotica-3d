import React, { useState } from 'react';
import {
  GraduationCap,
  Sliders,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Check,
  ShieldCheck,
  Play,
  Settings,
} from 'lucide-react';
import { TeacherSettings, DifficultyLevel } from '../../types/robot';
import { MISSIONS } from '../../data/missionsData';
import { sound } from '../../utils/sound';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TeacherSettings;
  onUpdateSettings: (settings: TeacherSettings) => void;
  onResetRobot: () => void;
  onResetMission: () => void;
  onResetProgress: () => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetRobot,
  onResetMission,
  onResetProgress,
}) => {
  const [confirmProgressReset, setConfirmProgressReset] = useState(false);

  if (!isOpen) return null;

  const handleDifficultyChange = (diff: DifficultyLevel) => {
    sound.playClick();
    onUpdateSettings({ ...settings, difficulty: diff });
  };

  const handleToggleHints = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, allowHints: !settings.allowHints });
  };

  const handleToggleSolution = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, allowSolution: !settings.allowSolution });
  };

  const handleToggleDemoMode = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, demoModeActive: !settings.demoModeActive });
  };

  const handleMissionOverride = (mId: number | null) => {
    sound.playClick();
    onUpdateSettings({ ...settings, activeMissionOverride: mId });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white">Panel de Control Docente</h2>
              <p className="text-[11px] text-slate-400">Herramientas pedagógicas para el profesor en el aula</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* 1. Modo Demostración */}
          <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Modo Demostración de Aula
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Desbloquea todas las misiones y pistas para proyectar y explicar frente al curso.
              </p>
            </div>
            <button
              onClick={handleToggleDemoMode}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                settings.demoModeActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {settings.demoModeActive ? 'ACTIVO' : 'INACTIVO'}
            </button>
          </div>

          {/* 2. Nivel de Dificultad */}
          <div className="space-y-2">
            <label className="font-mono font-bold uppercase text-slate-300">
              Nivel de Dificultad Pedagógica
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'inicial', label: 'Inicial', desc: 'Con todas las guías y validaciones' },
                  { id: 'intermedio', label: 'Intermedio', desc: 'Validaciones estándar' },
                  { id: 'desafio', label: 'Desafío', desc: 'Todas las misiones desbloqueadas' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleDifficultyChange(d.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    settings.difficulty === d.id
                      ? 'bg-slate-800 border-cyan-400 text-white font-semibold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs capitalize text-cyan-300">{d.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Permisos de Ayudas y Soluciones */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Sistema de Pistas</div>
                <div className="text-[10px] text-slate-400">Pistas 1, 2 y 3</div>
              </div>
              <button
                onClick={handleToggleHints}
                className={`p-2 rounded-lg transition ${
                  settings.allowHints ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {settings.allowHints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Ver Solución</div>
                <div className="text-[10px] text-slate-400">Bloques resueltos</div>
              </div>
              <button
                onClick={handleToggleSolution}
                className={`p-2 rounded-lg transition ${
                  settings.allowSolution ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {settings.allowSolution ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 4. Forzar Misión Activa para la Clase */}
          <div className="space-y-2">
            <label className="font-mono font-bold uppercase text-slate-300">
              Forzar Misión Activa en el Taller
            </label>
            <select
              value={settings.activeMissionOverride || ''}
              onChange={(e) => handleMissionOverride(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-400"
            >
              <option value="">Dejar progreso normal del estudiante</option>
              {MISSIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  Misión {m.id}: {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Acciones de Reinicio */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <label className="font-mono font-bold uppercase text-slate-400">
              Reinicios y Calibración
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onResetRobot();
                  sound.playClick();
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar Robot
              </button>

              <button
                onClick={() => {
                  onResetMission();
                  sound.playClick();
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar Misión
              </button>
            </div>

            {/* Reiniciar Progreso con Confirmación Obligatoria */}
            {!confirmProgressReset ? (
              <button
                onClick={() => setConfirmProgressReset(true)}
                className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
              >
                Borrar Progreso e Insignias del Aula
              </button>
            ) : (
              <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl space-y-2">
                <div className="text-xs text-rose-200 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ¿Confirmás reiniciar todo el progreso e insignias?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmProgressReset(false);
                      sound.playClick();
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs"
                  >
                    Sí, Borrar Todo
                  </button>
                  <button
                    onClick={() => setConfirmProgressReset(false)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-display font-bold transition shadow-md shadow-cyan-500/20"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
