import React, { useState, useEffect } from 'react';
import { AppView, CodeBlock, Mission, TeacherSettings, UserProgress } from './types/robot';
import { MISSIONS } from './data/missionsData';
import { storage } from './utils/storage';
import { sound } from './utils/sound';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { HomeView } from './components/home/HomeView';
import { BuilderView } from './components/builder/BuilderView';
import { ConnectionsView } from './components/connections/ConnectionsView';
import { ProgrammerView } from './components/programmer/ProgrammerView';
import { SimulatorView } from './components/simulator/SimulatorView';
import { MissionsView } from './components/missions/MissionsView';
import { LearnView } from './components/learn/LearnView';
import { TeacherModal } from './components/teacher/TeacherModal';
import { AutodiagnosisModal } from './components/common/AutodiagnosisModal';
import { TutorialModal } from './components/common/TutorialModal';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Robot State (persisted locally)
  const [installedComponents, setInstalledComponents] = useState<string[]>(() => {
    return storage.getInstalledComponents();
  });

  const [blocks, setBlocks] = useState<CodeBlock[]>(() => {
    return storage.getCodeBlocks();
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    return storage.getUserProgress();
  });

  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings>(() => {
    return storage.getTeacherSettings();
  });

  const [activeMissionId, setActiveMissionId] = useState<number>(1);

  // Modals State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    return !progress.hasSeenTutorial;
  });

  // Effective Active Mission (respects teacher override if configured)
  const effectiveMissionId = teacherSettings.activeMissionOverride || activeMissionId;
  const activeMission = MISSIONS.find((m) => m.id === effectiveMissionId) || MISSIONS[0];

  // Sync state to local storage
  useEffect(() => {
    storage.setInstalledComponents(installedComponents);
  }, [installedComponents]);

  useEffect(() => {
    storage.setCodeBlocks(blocks);
  }, [blocks]);

  useEffect(() => {
    storage.setUserProgress(progress);
  }, [progress]);

  useEffect(() => {
    storage.setTeacherSettings(teacherSettings);
  }, [teacherSettings]);

  // Component Management
  const handleAddComponent = (id: string) => {
    if (!installedComponents.includes(id)) {
      const updated = [...installedComponents, id];
      setInstalledComponents(updated);

      // Check badge for builder
      if (updated.length >= 6 && !progress.unlockedBadges.includes('constructor')) {
        unlockBadge('constructor', 50);
      }
    }
  };

  const handleRemoveComponent = (id: string) => {
    setInstalledComponents(installedComponents.filter((c) => c !== id));
  };

  // Badge unlock helper
  const unlockBadge = (badgeId: string, bonusXp = 50) => {
    if (!progress.unlockedBadges.includes(badgeId)) {
      setProgress((prev: UserProgress) => {
        const newXp = prev.xp + bonusXp;
        const newLevel = Math.floor(newXp / 150) + 1;
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          unlockedBadges: [...prev.unlockedBadges, badgeId],
        };
      });
      sound.playSuccess();
    }
  };

  // Mission Completion
  const handleMissionCompleted = (mId: number) => {
    const completed = progress.completedMissions.includes(mId);
    if (!completed) {
      const completedList = [...progress.completedMissions, mId];
      const newXp = progress.xp + activeMission.xpReward;
      const newLevel = Math.floor(newXp / 150) + 1;

      // Check badges:
      const newBadges = [...progress.unlockedBadges];
      if (mId === 1 && !newBadges.includes('robotico')) newBadges.push('robotico');
      if (mId === 2 && !newBadges.includes('ingeniero')) newBadges.push('ingeniero');
      if (mId === 3 && !newBadges.includes('programador')) newBadges.push('programador');
      if (mId === 4 && !newBadges.includes('explorador')) newBadges.push('explorador');
      if (completedList.length >= 5 && !newBadges.includes('maestro')) newBadges.push('maestro');

      setProgress({
        ...progress,
        completedMissions: completedList,
        xp: newXp,
        level: newLevel,
        unlockedBadges: newBadges,
      });

      // Advance active mission if not overridden
      if (!teacherSettings.activeMissionOverride && mId < MISSIONS.length) {
        setActiveMissionId(mId + 1);
      }
    }
  };

  // Load Mission Solution into Program & Robot
  const handleLoadSolution = (mission: Mission) => {
    // 1. Ensure required components are mounted
    const required = mission.requiredComponents;
    const merged = Array.from(new Set([...installedComponents, ...required]));
    setInstalledComponents(merged);

    // 2. Set recommended blocks
    const newBlocks: CodeBlock[] = [];
    if (mission.id === 1) {
      newBlocks.push({ id: 'b1', type: 'forward', category: 'movement', name: 'Avanzar', icon: 'forward' });
    } else if (mission.id === 2 || mission.id === 3) {
      newBlocks.push(
        { id: 'b1', type: 'forward', category: 'movement', name: 'Avanzar', icon: 'forward' },
        {
          id: 'b2',
          type: 'if_distance_less',
          category: 'sensors',
          name: 'Si Distancia < (cm)',
          icon: 'if_distance_less',
          value: 25,
          nestedBlocks: [
            { id: 'b2-1', type: 'stop', category: 'movement', name: 'Detener Motores', icon: 'stop' },
            { id: 'b2-2', type: 'turn_right', category: 'movement', name: 'Girar Derecha (90°)', icon: 'turn_right' },
            { id: 'b2-3', type: 'forward', category: 'movement', name: 'Avanzar', icon: 'forward' },
          ],
        }
      );
    } else {
      newBlocks.push(
        { id: 'b1', type: 'forward', category: 'movement', name: 'Avanzar', icon: 'forward' },
        {
          id: 'b2',
          type: 'if_distance_less',
          category: 'sensors',
          name: 'Si Distancia < (cm)',
          icon: 'if_distance_less',
          value: 30,
          nestedBlocks: [
            { id: 'b2-1', type: 'led_on', category: 'output', name: 'Encender LED', icon: 'led_on' },
            { id: 'b2-2', type: 'buzzer_beep', category: 'output', name: 'Activar Buzzer (Beep)', icon: 'buzzer_beep' },
            { id: 'b2-3', type: 'stop', category: 'movement', name: 'Detener Motores', icon: 'stop' },
            { id: 'b2-4', type: 'turn_right', category: 'movement', name: 'Girar Derecha (90°)', icon: 'turn_right' },
            { id: 'b2-5', type: 'forward', category: 'movement', name: 'Avanzar', icon: 'forward' },
          ],
        }
      );
    }

    setBlocks(newBlocks);
    sound.playConnected();
    setCurrentView('simulator');
  };

  // Teacher reset handlers
  const handleResetRobot = () => {
    setInstalledComponents(['chassis']);
    setBlocks([]);
  };

  const handleResetMission = () => {
    setActiveMissionId(1);
    setBlocks([]);
  };

  const handleResetProgress = () => {
    const fresh: UserProgress = {
      xp: 0,
      level: 1,
      completedMissions: [],
      unlockedBadges: [],
      hasSeenTutorial: true,
    };
    setProgress(fresh);
    storage.setUserProgress(fresh);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        progress={progress}
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
        onOpenDiagnosisModal={() => setIsDiagnosisModalOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Main Work Area */}
      <main className="flex-1 w-full overflow-hidden relative">
        {currentView === 'home' && (
          <HomeView
            progress={progress}
            installedComponents={installedComponents}
            activeMission={activeMission}
            onNavigate={setCurrentView}
            onOpenTutorial={() => setIsTutorialOpen(true)}
          />
        )}

        {currentView === 'builder' && (
          <BuilderView
            installedComponents={installedComponents}
            onAddComponent={handleAddComponent}
            onRemoveComponent={handleRemoveComponent}
            onOpenDiagnosis={() => setIsDiagnosisModalOpen(true)}
            onGoToConnections={() => setCurrentView('connections')}
          />
        )}

        {currentView === 'connections' && (
          <ConnectionsView
            installedComponents={installedComponents}
            blocks={blocks}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'programmer' && (
          <ProgrammerView
            blocks={blocks}
            onChangeBlocks={setBlocks}
            onRunSimulation={() => setCurrentView('simulator')}
            installedComponents={installedComponents}
          />
        )}

        {currentView === 'simulator' && (
          <SimulatorView
            installedComponents={installedComponents}
            blocks={blocks}
            activeMission={activeMission}
            onMissionCompleted={handleMissionCompleted}
          />
        )}

        {currentView === 'missions' && (
          <MissionsView
            progress={progress}
            activeMissionId={effectiveMissionId}
            onSelectMission={(id) => {
              setActiveMissionId(id);
              setCurrentView('simulator');
            }}
            onLoadSolution={handleLoadSolution}
            teacherSettings={teacherSettings}
          />
        )}

        {currentView === 'learn' && <LearnView />}
      </main>

      {/* Mobile/Tablet Bottom Navigation */}
      <MobileNav currentView={currentView} onNavigate={setCurrentView} />

      {/* Teacher Control Modal */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        settings={teacherSettings}
        onUpdateSettings={setTeacherSettings}
        onResetRobot={handleResetRobot}
        onResetMission={handleResetMission}
        onResetProgress={handleResetProgress}
      />

      {/* Autodiagnosis Modal */}
      <AutodiagnosisModal
        isOpen={isDiagnosisModalOpen}
        onClose={() => setIsDiagnosisModalOpen(false)}
        installedComponents={installedComponents}
        blocks={blocks}
        onNavigate={setCurrentView}
      />

      {/* 5-Step Interactive Tutorial */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          if (!progress.hasSeenTutorial) {
            setProgress((p: UserProgress) => ({ ...p, hasSeenTutorial: true }));
          }
        }}
        onGoToView={(view) => {
          setCurrentView(view);
          setIsTutorialOpen(false);
          if (!progress.hasSeenTutorial) {
            setProgress((p: UserProgress) => ({ ...p, hasSeenTutorial: true }));
          }
        }}
      />
    </div>
  );
}
