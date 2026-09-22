import { CodeBlock, TeacherSettings, UserProgress } from '../types/robot';

const KEYS = {
  INSTALLED_COMPONENTS: 'robotlab_installed_components',
  CODE_BLOCKS: 'robotlab_code_blocks',
  USER_PROGRESS: 'robotlab_user_progress',
  TEACHER_SETTINGS: 'robotlab_teacher_settings',
  ACTIVE_MISSION_ID: 'robotlab_active_mission_id',
};

// Initial default configuration: Starter robot mobile
export const DEFAULT_COMPONENTS = ['chassis', 'battery', 'controller', 'left_motor', 'right_motor', 'left_wheel', 'right_wheel'];

export const DEFAULT_BLOCKS: CodeBlock[] = [
  { id: 'b-init-1', type: 'forward', category: 'movement', name: 'Avanzar', icon: 'ArrowUp' },
];

export const DEFAULT_PROGRESS: UserProgress = {
  completedMissions: [],
  unlockedBadges: [],
  xp: 0,
  hasSeenTutorial: false,
};

export const DEFAULT_TEACHER_SETTINGS: TeacherSettings = {
  activeMissionOverride: null,
  difficulty: 'inicial',
  allowHints: true,
  allowSolution: true,
  demoModeActive: false,
};

export const storage = {
  getInstalledComponents(): string[] {
    try {
      const data = localStorage.getItem(KEYS.INSTALLED_COMPONENTS);
      return data ? JSON.parse(data) : DEFAULT_COMPONENTS;
    } catch {
      return DEFAULT_COMPONENTS;
    }
  },

  setInstalledComponents(components: string[]) {
    try {
      localStorage.setItem(KEYS.INSTALLED_COMPONENTS, JSON.stringify(components));
    } catch {
      // Storage full or unavailable
    }
  },

  getCodeBlocks(): CodeBlock[] {
    try {
      const data = localStorage.getItem(KEYS.CODE_BLOCKS);
      return data ? JSON.parse(data) : DEFAULT_BLOCKS;
    } catch {
      return DEFAULT_BLOCKS;
    }
  },

  setCodeBlocks(blocks: CodeBlock[]) {
    try {
      localStorage.setItem(KEYS.CODE_BLOCKS, JSON.stringify(blocks));
    } catch {
      // Storage full or unavailable
    }
  },

  getUserProgress(): UserProgress {
    try {
      const data = localStorage.getItem(KEYS.USER_PROGRESS);
      return data ? JSON.parse(data) : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  },

  setUserProgress(progress: UserProgress) {
    try {
      localStorage.setItem(KEYS.USER_PROGRESS, JSON.stringify(progress));
    } catch {
      // Storage full or unavailable
    }
  },

  getActiveMissionId(): number {
    try {
      const data = localStorage.getItem(KEYS.ACTIVE_MISSION_ID);
      return data ? parseInt(data, 10) : 1;
    } catch {
      return 1;
    }
  },

  setActiveMissionId(id: number) {
    try {
      localStorage.setItem(KEYS.ACTIVE_MISSION_ID, id.toString());
    } catch {
      // Storage full or unavailable
    }
  },

  getTeacherSettings(): TeacherSettings {
    try {
      const data = localStorage.getItem(KEYS.TEACHER_SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_TEACHER_SETTINGS;
    } catch {
      return DEFAULT_TEACHER_SETTINGS;
    }
  },

  setTeacherSettings(settings: TeacherSettings) {
    try {
      localStorage.setItem(KEYS.TEACHER_SETTINGS, JSON.stringify(settings));
    } catch {
      // Storage full or unavailable
    }
  },

  // Reset operations
  resetRobot(): string[] {
    const empty: string[] = ['chassis'];
    this.setInstalledComponents(empty);
    return empty;
  },

  resetMission(missionId: number): { components: string[]; blocks: CodeBlock[] } {
    // Return appropriate initial state for mission
    const comps = missionId === 1 ? ['chassis'] : ['chassis', 'battery', 'controller'];
    const blocks: CodeBlock[] = [];
    this.setInstalledComponents(comps);
    this.setCodeBlocks(blocks);
    return { components: comps, blocks };
  },

  resetProgress(): UserProgress {
    const fresh = { ...DEFAULT_PROGRESS, hasSeenTutorial: true };
    this.setUserProgress(fresh);
    return fresh;
  },

  resetEverything() {
    try {
      localStorage.removeItem(KEYS.INSTALLED_COMPONENTS);
      localStorage.removeItem(KEYS.CODE_BLOCKS);
      localStorage.removeItem(KEYS.USER_PROGRESS);
      localStorage.removeItem(KEYS.TEACHER_SETTINGS);
      localStorage.removeItem(KEYS.ACTIVE_MISSION_ID);
    } catch {
      // Ignored
    }
  },
};
