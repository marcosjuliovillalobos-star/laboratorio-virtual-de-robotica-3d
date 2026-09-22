import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Lock,
  Play,
  Lightbulb,
  Award,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Eye,
  ArrowRight,
  Hammer,
  Zap,
  Cpu,
  Bot,
} from 'lucide-react';
import { MISSIONS, BADGES } from '../../data/missionsData';
import { Mission, UserProgress, TeacherSettings } from '../../types/robot';
import { sound } from '../../utils/sound';

interface MissionsViewProps {
  progress: UserProgress;
  activeMissionId: number;
  onSelectMission: (missionId: number) => void;
  onLoadSolution: (mission: Mission) => void;
  teacherSettings: TeacherSettings;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  Hammer,
  Zap,
  Cpu,
  Compass,
  Bot,
  Award,
};

export const MissionsView: React.FC<MissionsViewProps> = ({
  progress,
  activeMissionId,
  onSelectMission,
  onLoadSolution,
  teacherSettings,
}) => {
  const [selectedMissionForDetails, setSelectedMissionForDetails] = useState<Mission>(
    MISSIONS.find((m) => m.id === activeMissionId) || MISSIONS[0]
  );
  const [revealedHints, setRevealedHints] = useState<Record<number, number>>({});
  const [solutionRevealed, setSolutionRevealed] = useState<Record<number, boolean>>({});

  const handleRevealHint = (missionId: number, hintNumber: number) => {
    sound.playClick();
    setRevealedHints((prev) => ({
      ...prev,
      [missionId]: Math.max(prev[missionId] || 0, hintNumber),
    }));
  };

  const handleRevealSolution = (missionId: number) => {
    sound.playClick();
    setSolutionRevealed((prev) => ({
      ...prev,
      [missionId]: true,
    }));
  };

  const isCompleted = (id: number) => progress.completedMissions.includes(id);
  const isUnlocked = (id: number) => {
    if (teacherSettings.difficulty === 'desafio' || teacherSettings.demoModeActive) return true;
    if (id === 1) return true;
    return progress.completedMissions.includes(id - 1);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 bg-slate-950 text-slate-100 overflow-y-auto">
      {/* 1. Left List: Mission Cards */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-4 shrink-0 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-base text-cyan-400">Ruta de Misiones</h2>
            <p className="text-xs text-slate-400">Superá los desafíos del taller de robótica</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded border border-cyan-500/30">
            {progress.completedMissions.length} / {MISSIONS.length} Listas
          </span>
        </div>

        {/* Missions Selection Cards */}
        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
          {MISSIONS.map((mission) => {
            const completed = isCompleted(mission.id);
            const unlocked = isUnlocked(mission.id);
            const isCurrent = activeMissionId === mission.id;
            const isSelected = selectedMissionForDetails.id === mission.id;

            return (
              <div
                key={mission.id}
                onClick={() => {
                  setSelectedMissionForDetails(mission);
                  sound.playClick();
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                } ${!unlocked ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm ${
                      completed
                        ? 'bg-emerald-500 text-slate-950'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 animate-pulse'
                        : unlocked
                        ? 'bg-slate-800 text-cyan-300'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {completed ? <CheckCircle2 className="w-5 h-5" /> : !unlocked ? <Lock className="w-4 h-4" /> : mission.id}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white leading-tight">{mission.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{mission.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {completed ? (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                      🟢 Completada
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                      🔵 Activa
                    </span>
                  ) : !unlocked ? (
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueada
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges Preview Bar */}
        <div className="pt-3 border-t border-slate-800">
          <div className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 flex items-center justify-between">
            <span>Insignias de Taller</span>
            <span className="text-cyan-400">{progress.unlockedBadges.length} / {BADGES.length}</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {BADGES.map((b) => {
              const unlocked = progress.unlockedBadges.includes(b.id);
              const Icon = BADGE_ICONS[b.icon] || Award;

              return (
                <div
                  key={b.id}
                  title={`${b.name}: ${b.description}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition border ${
                    unlocked
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-800/40 text-slate-600 border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Right: Mission Detail, Objective, Progressive Hints & Solution */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        {/* Mission Banner */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-1">
              <span>MISIÓN #{selectedMissionForDetails.id}</span>
              <span>•</span>
              <span className="text-emerald-400">+{selectedMissionForDetails.xpReward} XP Recompensa</span>
            </div>
            <h1 className="font-display font-bold text-xl text-white">
              {selectedMissionForDetails.title}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {selectedMissionForDetails.description}
            </p>
          </div>

          <button
            onClick={() => onSelectMission(selectedMissionForDetails.id)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-display font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Cargar Esta Misión en el Laboratorio
          </button>
        </div>

        {/* Objective & Required Hardware */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="font-mono text-xs font-bold uppercase text-cyan-400 mb-2">
              🎯 Objetivo Pedagógico
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {selectedMissionForDetails.objective}
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="font-mono text-xs font-bold uppercase text-emerald-400 mb-2">
              🔧 Componentes Esenciales Sugeridos
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedMissionForDetails.requiredComponents.map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Progressive Hints Section */}
        {teacherSettings.allowHints ? (
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>Sistema de Pistas Progresivas (Pensar antes de pedir ayuda)</span>
            </div>

            <div className="space-y-2">
              {selectedMissionForDetails.hints.map((hint, idx) => {
                const hintNum = idx + 1;
                const isRevealed = (revealedHints[selectedMissionForDetails.id] || 0) >= hintNum;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border bg-slate-900/60 border-slate-800 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {hintNum}
                      </span>
                      <p className={`text-slate-300 leading-relaxed ${!isRevealed ? 'blur-sm select-none opacity-40' : ''}`}>
                        {hint}
                      </p>
                    </div>

                    {!isRevealed && (
                      <button
                        onClick={() => handleRevealHint(selectedMissionForDetails.id, hintNum)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold shrink-0 transition"
                      >
                        Revelar Pista {hintNum}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
            🔒 El docente ha desactivado las pistas para evaluar la resolución autónoma.
          </div>
        )}

        {/* Solution Section (Controlled by Teacher Settings) */}
        {teacherSettings.allowSolution && (
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">
                💡 Solución y Explicación del Algoritmo
              </span>

              {!solutionRevealed[selectedMissionForDetails.id] ? (
                <button
                  onClick={() => handleRevealSolution(selectedMissionForDetails.id)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-xs font-mono transition"
                >
                  Ver Solución
                </button>
              ) : (
                <button
                  onClick={() => onLoadSolution(selectedMissionForDetails)}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-display font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Cargar Bloques de Solución
                </button>
              )}
            </div>

            {solutionRevealed[selectedMissionForDetails.id] && (
              <div className="pt-2 text-xs text-slate-300 leading-relaxed border-t border-slate-800">
                {selectedMissionForDetails.solutionExplanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
