import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RotateCw,
  Square,
  Radar,
  SunMedium,
  Clock,
  Repeat,
  Sparkles,
  Volume2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Code,
  Plus,
  Play,
  RotateCcw as ResetIcon,
  HelpCircle,
  FileCode,
  Check,
} from 'lucide-react';
import { CodeBlock, BlockCategory } from '../../types/robot';
import { sound } from '../../utils/sound';

interface ProgrammerViewProps {
  blocks: CodeBlock[];
  onChangeBlocks: (blocks: CodeBlock[]) => void;
  onRunSimulation: () => void;
  installedComponents: string[];
}

const AVAILABLE_BLOCK_DEFS = [
  // Movimiento
  { type: 'forward', category: 'movement' as BlockCategory, name: 'Avanzar', icon: ArrowUp, color: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400' },
  { type: 'backward', category: 'movement' as BlockCategory, name: 'Retroceder', icon: ArrowDown, color: 'bg-emerald-700 hover:bg-emerald-600 border-emerald-500' },
  { type: 'turn_left', category: 'movement' as BlockCategory, name: 'Girar Izquierda (90°)', icon: RotateCcw, color: 'bg-teal-600 hover:bg-teal-500 border-teal-400' },
  { type: 'turn_right', category: 'movement' as BlockCategory, name: 'Girar Derecha (90°)', icon: RotateCw, color: 'bg-teal-600 hover:bg-teal-500 border-teal-400' },
  { type: 'stop', category: 'movement' as BlockCategory, name: 'Detener Motores', icon: Square, color: 'bg-rose-600 hover:bg-rose-500 border-rose-400' },

  // Sensores y Condicionales
  { type: 'if_distance_less', category: 'sensors' as BlockCategory, name: 'Si Distancia < (cm)', icon: Radar, defaultValue: 25, color: 'bg-amber-600 hover:bg-amber-500 border-amber-400', isContainer: true },
  { type: 'if_light_less', category: 'sensors' as BlockCategory, name: 'Si Luz < (%)', icon: SunMedium, defaultValue: 30, color: 'bg-amber-700 hover:bg-amber-600 border-amber-500', isContainer: true },

  // Control de Tiempo y Bucles
  { type: 'wait', category: 'control' as BlockCategory, name: 'Esperar (segundos)', icon: Clock, defaultValue: 1, color: 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400' },
  { type: 'repeat', category: 'control' as BlockCategory, name: 'Repetir (veces)', icon: Repeat, defaultValue: 3, color: 'bg-indigo-700 hover:bg-indigo-600 border-indigo-500', isContainer: true },

  // Salidas y Actuadores
  { type: 'led_on', category: 'output' as BlockCategory, name: 'Encender LED', icon: Sparkles, color: 'bg-violet-600 hover:bg-violet-500 border-violet-400' },
  { type: 'led_off', category: 'output' as BlockCategory, name: 'Apagar LED', icon: Sparkles, color: 'bg-slate-700 hover:bg-slate-600 border-slate-500' },
  { type: 'buzzer_beep', category: 'output' as BlockCategory, name: 'Activar Buzzer (Beep)', icon: Volume2, color: 'bg-purple-600 hover:bg-purple-500 border-purple-400' },
];

export const ProgrammerView: React.FC<ProgrammerViewProps> = ({
  blocks,
  onChangeBlocks,
  onRunSimulation,
  installedComponents,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BlockCategory | 'all'>('all');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeTargetContainerId, setActiveTargetContainerId] = useState<string | null>(null);

  // Add block to program
  const handleAddBlock = (def: typeof AVAILABLE_BLOCK_DEFS[0]) => {
    sound.playClick();
    const newBlock: CodeBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: def.type,
      category: def.category,
      name: def.name,
      icon: def.type,
      value: def.defaultValue,
      nestedBlocks: def.isContainer ? [] : undefined,
    };

    if (activeTargetContainerId) {
      // Add inside selected container block
      const addNested = (list: CodeBlock[]): CodeBlock[] => {
        return list.map((b) => {
          if (b.id === activeTargetContainerId) {
            return { ...b, nestedBlocks: [...(b.nestedBlocks || []), newBlock] };
          }
          if (b.nestedBlocks) {
            return { ...b, nestedBlocks: addNested(b.nestedBlocks) };
          }
          return b;
        });
      };
      onChangeBlocks(addNested(blocks));
    } else {
      // Add at root
      onChangeBlocks([...blocks, newBlock]);
    }
  };

  // Remove block
  const handleRemoveBlock = (id: string) => {
    sound.playClick();
    const removeRecursive = (list: CodeBlock[]): CodeBlock[] => {
      return list
        .filter((b) => b.id !== id)
        .map((b) => ({
          ...b,
          nestedBlocks: b.nestedBlocks ? removeRecursive(b.nestedBlocks) : undefined,
        }));
    };
    onChangeBlocks(removeRecursive(blocks));
    if (activeTargetContainerId === id) {
      setActiveTargetContainerId(null);
    }
  };

  // Move block up or down
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    sound.playClick();
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    onChangeBlocks(newBlocks);
  };

  // Change value of block (e.g. distance threshold, wait time)
  const handleChangeValue = (id: string, newVal: number) => {
    const updateRecursive = (list: CodeBlock[]): CodeBlock[] => {
      return list.map((b) => {
        if (b.id === id) return { ...b, value: newVal };
        if (b.nestedBlocks) return { ...b, nestedBlocks: updateRecursive(b.nestedBlocks) };
        return b;
      });
    };
    onChangeBlocks(updateRecursive(blocks));
  };

  // Clear program
  const handleClear = () => {
    sound.playClick();
    onChangeBlocks([]);
    setActiveTargetContainerId(null);
  };

  // Generate Arduino / C++ equivalent code
  const generateCppCode = (): string => {
    let out = `// ----------------------------------------------------\n`;
    out += `// Laboratorio Virtual de Robótica 3D - Código Arduino / C++\n`;
    out += `// Traducido automáticamente desde Bloques Visuales\n`;
    out += `// ----------------------------------------------------\n\n`;
    out += `#include <RobotEducation.h>\n\n`;
    out += `// Definición de pines y periféricos\n`;
    out += `const int PIN_TRIGGER = 9;  // Sensor ultrasónico\n`;
    out += `const int PIN_ECHO = 10;\n`;
    out += `const int PIN_LED = 13;     // LED indicador RGB\n`;
    out += `const int PIN_BUZZER = 8;   // Zumbador acústico\n\n`;
    out += `void setup() {\n`;
    out += `  Serial.begin(9600);\n`;
    out += `  iniciarMotores();\n`;
    out += `  pinMode(PIN_TRIGGER, OUTPUT);\n`;
    out += `  pinMode(PIN_ECHO, INPUT);\n`;
    out += `  pinMode(PIN_LED, OUTPUT);\n`;
    out += `  pinMode(PIN_BUZZER, OUTPUT);\n`;
    out += `  Serial.println("Robot iniciado y calibrado.");\n`;
    out += `}\n\n`;
    out += `void loop() {\n`;

    const indent = (level: number) => '  '.repeat(level);

    const renderList = (items: CodeBlock[], depth = 1) => {
      let code = '';
      for (const b of items) {
        if (b.type === 'forward') code += `${indent(depth)}avanzarMotores(255);\n`;
        else if (b.type === 'backward') code += `${indent(depth)}retrocederMotores(200);\n`;
        else if (b.type === 'turn_left') code += `${indent(depth)}girarIzquierda(90);\n`;
        else if (b.type === 'turn_right') code += `${indent(depth)}girarDerecha(90);\n`;
        else if (b.type === 'stop') code += `${indent(depth)}detenerMotores();\n`;
        else if (b.type === 'wait') code += `${indent(depth)}delay(${((b.value || 1) * 1000).toFixed(0)});\n`;
        else if (b.type === 'led_on') code += `${indent(depth)}digitalWrite(PIN_LED, HIGH);\n`;
        else if (b.type === 'led_off') code += `${indent(depth)}digitalWrite(PIN_LED, LOW);\n`;
        else if (b.type === 'buzzer_beep') code += `${indent(depth)}tone(PIN_BUZZER, 2400, 200);\n`;
        else if (b.type === 'if_distance_less') {
          code += `${indent(depth)}int distancia = leerUltrasonico();\n`;
          code += `${indent(depth)}if (distancia < ${b.value || 25}) {\n`;
          if (b.nestedBlocks && b.nestedBlocks.length > 0) {
            code += renderList(b.nestedBlocks, depth + 1);
          } else {
            code += `${indent(depth + 1)}// (Bloques a ejecutar cuando la distancia es menor)\n`;
          }
          code += `${indent(depth)}}\n`;
        } else if (b.type === 'if_light_less') {
          code += `${indent(depth)}int nivelLuz = analogRead(A0);\n`;
          code += `${indent(depth)}if (nivelLuz < ${b.value || 30}) {\n`;
          if (b.nestedBlocks && b.nestedBlocks.length > 0) {
            code += renderList(b.nestedBlocks, depth + 1);
          }
          code += `${indent(depth)}}\n`;
        } else if (b.type === 'repeat') {
          code += `${indent(depth)}for (int i = 0; i < ${b.value || 3}; i++) {\n`;
          if (b.nestedBlocks && b.nestedBlocks.length > 0) {
            code += renderList(b.nestedBlocks, depth + 1);
          }
          code += `${indent(depth)}}\n`;
        }
      }
      return code;
    };

    if (blocks.length === 0) {
      out += `  // Agregá bloques al programa para ver el código generado aquí\n`;
    } else {
      out += renderList(blocks, 1);
    }

    out += `}\n`;
    return out;
  };

  const filteredDefs = selectedCategory === 'all'
    ? AVAILABLE_BLOCK_DEFS
    : AVAILABLE_BLOCK_DEFS.filter((d) => d.category === selectedCategory);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 bg-slate-950 text-slate-100 overflow-hidden">
      {/* 1. Left Pallet: Available Blocks */}
      <div className="w-full lg:w-80 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-3 shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-base text-cyan-400">Paleta de Bloques</h3>
            <p className="text-xs text-slate-400">Tocá un bloque para agregarlo al programa</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-1 my-3 text-xs font-mono">
          {(['all', 'movement', 'sensors', 'control', 'output'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1.5 rounded transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat === 'movement' ? 'Mov.' : cat === 'sensors' ? 'Sensor' : cat === 'control' ? 'Control' : 'Salidas'}
            </button>
          ))}
        </div>

        {/* Target indicator if adding inside a container */}
        {activeTargetContainerId && (
          <div className="mb-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300 flex items-center justify-between">
            <span>Insertando dentro de bloque condicional</span>
            <button
              onClick={() => setActiveTargetContainerId(null)}
              className="underline text-amber-400 hover:text-amber-200"
            >
              Salir
            </button>
          </div>
        )}

        {/* Available blocks list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredDefs.map((def) => {
            const Icon = def.icon;
            // Check hardware warning
            const isUsNeeded = def.type === 'if_distance_less' && !installedComponents.includes('ultrasonic');
            const isLedNeeded = (def.type === 'led_on' || def.type === 'led_off') && !installedComponents.includes('led');
            const isBuzzerNeeded = def.type === 'buzzer_beep' && !installedComponents.includes('buzzer');
            const hasWarning = isUsNeeded || isLedNeeded || isBuzzerNeeded;

            return (
              <button
                key={def.type}
                onClick={() => handleAddBlock(def)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-sm font-medium transition active:scale-95 shadow-sm ${def.color}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-black/25 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold leading-tight">{def.name}</div>
                    {hasWarning && (
                      <div className="text-[10px] text-amber-200 opacity-90">⚠️ Requiere componente</div>
                    )}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-white/80 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Center: Program Sequence Canvas */}
      <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl p-4 overflow-hidden">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-display font-bold text-lg text-white">Programa de Control</h2>
            <span className="text-xs font-mono text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
              {blocks.length} {blocks.length === 1 ? 'bloque' : 'bloques'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition"
            >
              <Code className="w-3.5 h-3.5" />
              Ver Código C++
            </button>

            <button
              onClick={handleClear}
              disabled={blocks.length === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-medium transition disabled:opacity-40"
            >
              Limpiar
            </button>

            <button
              onClick={onRunSimulation}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-display font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Probar en Simulador
            </button>
          </div>
        </div>

        {/* Algorithm Pipeline Canvas */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-2.5">
          {/* Start Block (Always at the top) */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl border border-emerald-400 text-white font-display font-bold text-sm shadow-md">
            <div className="w-7 h-7 rounded bg-black/20 flex items-center justify-center">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <span>AL COMENZAR EL ROBOT</span>
          </div>

          {/* User Blocks Sequence */}
          {blocks.length === 0 ? (
            <div className="h-48 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <p className="text-sm font-medium mb-1">El programa está vacío</p>
              <p className="text-xs max-w-sm text-slate-400">
                Seleccioná bloques en la paleta izquierda para crear el algoritmo. El robot los ejecutará en orden de arriba hacia abajo.
              </p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <RenderBlockItem
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                activeTargetContainerId={activeTargetContainerId}
                onSetActiveTarget={setActiveTargetContainerId}
                onRemove={handleRemoveBlock}
                onMove={handleMoveBlock}
                onChangeValue={handleChangeValue}
              />
            ))
          )}
        </div>
      </div>

      {/* Code Viewer Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2 text-cyan-300 font-display font-bold">
                <FileCode className="w-5 h-5" />
                <span>Traducción a Código Arduino / C++</span>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 overflow-y-auto flex-1 font-mono text-xs text-cyan-200/90 leading-relaxed whitespace-pre selection:bg-cyan-500/30">
              {generateCppCode()}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>Pedagógico: muestra cómo los bloques visuales se transforman en sintaxis textual real.</span>
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent to render individual block item (including nested children)
interface RenderBlockItemProps {
  block: CodeBlock;
  index: number;
  total: number;
  activeTargetContainerId: string | null;
  onSetActiveTarget: (id: string | null) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, dir: 'up' | 'down') => void;
  onChangeValue: (id: string, val: number) => void;
}

const RenderBlockItem: React.FC<RenderBlockItemProps> = ({
  block,
  index,
  total,
  activeTargetContainerId,
  onSetActiveTarget,
  onRemove,
  onMove,
  onChangeValue,
}) => {
  const isContainer = block.nestedBlocks !== undefined;
  const isTargeted = activeTargetContainerId === block.id;

  const getStyle = () => {
    switch (block.category) {
      case 'movement':
        return 'bg-emerald-700/80 border-emerald-500 text-emerald-100';
      case 'sensors':
        return 'bg-amber-700/80 border-amber-500 text-amber-100';
      case 'control':
        return 'bg-indigo-700/80 border-indigo-500 text-indigo-100';
      case 'output':
        return 'bg-violet-700/80 border-violet-500 text-violet-100';
      default:
        return 'bg-slate-800 border-slate-600 text-slate-200';
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        className={`flex items-center justify-between p-2.5 rounded-lg border shadow-sm transition ${getStyle()} ${
          isTargeted ? 'ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs opacity-75">{index + 1}.</span>
          <span className="font-semibold text-sm">{block.name}</span>

          {/* Value inputs for blocks that accept numbers */}
          {block.value !== undefined && (
            <div className="flex items-center gap-1.5 ml-2 bg-black/30 px-2 py-0.5 rounded border border-white/10 font-mono text-xs">
              <input
                type="number"
                min={1}
                max={400}
                value={block.value}
                onChange={(e) => onChangeValue(block.id, parseFloat(e.target.value) || 0)}
                className="w-14 bg-transparent text-white font-bold text-center focus:outline-none"
              />
              <span className="text-[11px] opacity-75">
                {block.type === 'if_distance_less' ? 'cm' : block.type === 'if_light_less' ? '%' : block.type === 'wait' ? 'seg' : 'veces'}
              </span>
            </div>
          )}
        </div>

        {/* Actions (Move, Target, Delete) */}
        <div className="flex items-center gap-1">
          {isContainer && (
            <button
              onClick={() => onSetActiveTarget(isTargeted ? null : block.id)}
              className={`px-2 py-1 text-xs rounded font-mono font-medium transition ${
                isTargeted
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-black/30 hover:bg-black/50 text-cyan-300'
              }`}
            >
              {isTargeted ? 'Cerrar contenedor' : '+ Agregar adentro'}
            </button>
          )}

          <button
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="p-1 hover:bg-black/20 rounded disabled:opacity-30"
            title="Subir"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            disabled={index === total - 1}
            className="p-1 hover:bg-black/20 rounded disabled:opacity-30"
            title="Bajar"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemove(block.id)}
            className="p-1 hover:bg-rose-500/30 text-rose-300 rounded ml-1"
            title="Eliminar bloque"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Nested Blocks Rendering inside conditional / loop containers */}
      {isContainer && block.nestedBlocks && (
        <div className="ml-6 pl-4 border-l-2 border-dashed border-amber-400/50 space-y-1.5 py-1">
          {block.nestedBlocks.length === 0 ? (
            <div className="p-2 bg-black/20 rounded text-xs text-amber-200/70 italic">
              (Vacío: tocá "+ Agregar adentro" y elegí bloques en la paleta izquierda)
            </div>
          ) : (
            block.nestedBlocks.map((child, cIdx) => (
              <RenderBlockItem
                key={child.id}
                block={child}
                index={cIdx}
                total={block.nestedBlocks!.length}
                activeTargetContainerId={activeTargetContainerId}
                onSetActiveTarget={onSetActiveTarget}
                onRemove={onRemove}
                onMove={() => {}}
                onChangeValue={onChangeValue}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
