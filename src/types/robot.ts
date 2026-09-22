export type ComponentCategory = 'structure' | 'movement' | 'control' | 'energy' | 'sensor' | 'output' | 'actuator';

export interface RobotComponentDef {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  pedagogicalFunction: string;
  typeExplanation: 'Entrada (Sensor)' | 'Salida (Actuador)' | 'Procesamiento' | 'Alimentación' | 'Estructura mecánica';
  input: string;
  output: string;
  icon: string;
  color: string;
  defaultPosition: [number, number, number];
  requiredConnections: string[];
}

export interface InstalledComponent {
  id: string;
  instanceId: string;
  installedAt: number;
}

export type BlockCategory = 'movement' | 'sensors' | 'control' | 'output';

export interface CodeBlock {
  id: string;
  type: string; // 'forward' | 'backward' | 'turn_left' | 'turn_right' | 'stop' | 'if_distance_less' | 'if_light_less' | 'wait' | 'repeat' | 'led_on' | 'led_off' | 'buzzer_beep';
  category: BlockCategory;
  name: string;
  icon: string;
  value?: number; // e.g. 20 cm, or 1 sec, or 3 times
  nestedBlocks?: CodeBlock[];
}

export interface LogicalConnection {
  from: string; // component id
  to: string; // component id
  type: 'power' | 'data' | 'signal';
  label: string;
}

export interface DiagnosticItem {
  id: string;
  title: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  suggestion?: string;
}

export interface Mission {
  id: number;
  title: string;
  subtitle: string;
  objective: string;
  description: string;
  requiredComponents: string[];
  suggestedBlocks: string[];
  scenarioType: 'lab' | 'simple_circuit' | 'obstacle_corridor' | 'exploration_maze' | 'final_arena';
  hints: [string, string, string]; // Hint 1: Conceptual, Hint 2: Components, Hint 3: Logic
  solutionExplanation: string;
  solutionBlocks: CodeBlock[];
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export type AppView = 'home' | 'builder' | 'connections' | 'programmer' | 'simulator' | 'missions' | 'learn';

export type DifficultyLevel = 'inicial' | 'intermedio' | 'desafio';

export interface TeacherSettings {
  activeMissionOverride: number | null;
  difficulty: DifficultyLevel;
  allowHints: boolean;
  allowSolution: boolean;
  demoModeActive: boolean;
}

export interface UserProgress {
  completedMissions: number[];
  unlockedBadges: string[];
  xp: number;
  level?: number;
  hasSeenTutorial: boolean;
}
