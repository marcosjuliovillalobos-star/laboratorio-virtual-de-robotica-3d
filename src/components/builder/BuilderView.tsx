import React, { useState } from 'react';
import {
  Layers,
  Boxes,
  BatteryCharging,
  Cpu,
  Cog,
  Disc,
  Radar,
  SunMedium,
  Sparkles,
  Volume2,
  Wrench,
  Plus,
  Trash2,
  RotateCcw,
  Eye,
  Camera,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { ROBOT_COMPONENTS, COMPONENT_CATEGORIES } from '../../data/componentsData';
import { RobotComponentDef } from '../../types/robot';
import { RobotScene3D } from '../robot3d/RobotScene3D';
import { sound } from '../../utils/sound';

interface BuilderViewProps {
  installedComponents: string[];
  onAddComponent: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  onOpenDiagnosis: () => void;
  onGoToConnections: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Boxes,
  BatteryCharging,
  Cpu,
  Cog,
  Disc,
  Radar,
  SunMedium,
  Sparkles,
  Volume2,
  Wrench,
};

export const BuilderView: React.FC<BuilderViewProps> = ({
  installedComponents,
  onAddComponent,
  onRemoveComponent,
  onOpenDiagnosis,
  onGoToConnections,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('chassis');
  const [cameraView, setCameraView] = useState<'front' | 'side' | 'top' | 'isometric' | 'reset'>('isometric');

  const selectedDef = ROBOT_COMPONENTS.find((c) => c.id === selectedComponentId);
  const isInstalled = (id: string) => installedComponents.includes(id);

  // Filter components
  const filteredComponents = selectedCategory === 'all'
    ? ROBOT_COMPONENTS
    : ROBOT_COMPONENTS.filter((c) => c.category === selectedCategory);

  // Drag and drop support
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && !isInstalled(id)) {
      onAddComponent(id);
      setSelectedComponentId(id);
      sound.playConnected();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 bg-slate-950 text-slate-100 overflow-hidden">
      {/* 1. Left Drawer: Components Catalog */}
      <div className="w-full lg:w-84 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-3 shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-base text-cyan-400">Componentes</h2>
            <p className="text-xs text-slate-400">Arrastrá al 3D o usá el botón para montar</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">
            {installedComponents.length}/{ROBOT_COMPONENTS.length}
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto py-2.5 scrollbar-none text-xs font-mono">
          {COMPONENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                sound.playClick();
              }}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Components List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredComponents.map((comp) => {
            const Icon = ICON_MAP[comp.icon] || Boxes;
            const installed = isInstalled(comp.id);
            const isSel = selectedComponentId === comp.id;

            return (
              <div
                key={comp.id}
                draggable={!installed}
                onDragStart={(e) => handleDragStart(e, comp.id)}
                onClick={() => {
                  setSelectedComponentId(comp.id);
                  sound.playClick();
                }}
                className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2.5 ${
                  isSel
                    ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: comp.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-200">{comp.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{comp.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {installed ? (
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Montado
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddComponent(comp.id);
                        setSelectedComponentId(comp.id);
                        sound.playConnected();
                      }}
                      className="text-[11px] font-bold px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition active:scale-95"
                    >
                      + Montar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Central 3D Canvas with Camera Bar and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex-1 flex flex-col bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden relative"
      >
        {/* Top Camera Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Camera Presets */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-800 p-1 rounded-lg pointer-events-auto shadow-md">
            <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
              <Camera className="w-3 h-3 text-cyan-400" />
              Cámara:
            </span>
            {(
              [
                { id: 'isometric', label: 'Isométrica' },
                { id: 'front', label: 'Frontal' },
                { id: 'side', label: 'Lateral' },
                { id: 'top', label: 'Superior' },
                { id: 'reset', label: 'Centrar' },
              ] as const
            ).map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  setCameraView(cam.id);
                  sound.playClick();
                }}
                className={`px-2 py-1 rounded text-xs font-mono transition ${
                  cameraView === cam.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onOpenDiagnosis}
              className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 shadow-md transition"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Autodiagnóstico
            </button>
          </div>
        </div>

        {/* The 3D Scene */}
        <div className="flex-1 w-full h-full min-h-[360px]">
          <RobotScene3D
            installedComponents={installedComponents}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(id) => {
              setSelectedComponentId(id);
              sound.playClick();
            }}
            cameraView={cameraView}
          />
        </div>

        {/* Bottom Hint Banner */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">💡 Interacción 3D:</span>
            <span>Arrastrá con el mouse para girar 360°, rueda para zoom, o hacé clic en cualquier pieza para inspeccionarla.</span>
          </div>
          <button
            onClick={onGoToConnections}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 ml-2 shrink-0"
          >
            Ver Conexiones Lógicas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Right Panel: Component Educational Inspector */}
      <div className="w-full lg:w-80 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-4 shrink-0">
        <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-wider mb-3">
          Ficha Técnica Pedagógica
        </h3>

        {selectedDef ? (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto space-y-4 pr-1">
            <div className="space-y-3">
              {/* Header with Color & Icon */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md"
                  style={{ backgroundColor: selectedDef.color }}
                >
                  {(() => {
                    const Icon = ICON_MAP[selectedDef.icon] || Boxes;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm leading-snug">{selectedDef.name}</h4>
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
                    {selectedDef.typeExplanation}
                  </span>
                </div>
              </div>

              {/* ¿Qué hace? */}
              <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  ¿Qué función cumple?
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedDef.pedagogicalFunction}
                </p>
              </div>

              {/* Entrada vs Salida */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase mb-1">
                    Entrada (Input)
                  </div>
                  <div className="text-slate-300 text-[11px] leading-snug">{selectedDef.input}</div>
                </div>
                <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase mb-1">
                    Salida (Output)
                  </div>
                  <div className="text-slate-300 text-[11px] leading-snug">{selectedDef.output}</div>
                </div>
              </div>

              {/* Status on Robot */}
              <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Estado en tu Robot:</span>
                {isInstalled(selectedDef.id) ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instalado
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> No montado
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Mount or Remove */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {isInstalled(selectedDef.id) ? (
                <button
                  onClick={() => {
                    onRemoveComponent(selectedDef.id);
                    sound.playClick();
                  }}
                  className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Retirar Componente
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAddComponent(selectedDef.id);
                    sound.playConnected();
                  }}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar al Robot
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-4">
            <HelpCircle className="w-8 h-8 mb-2 opacity-50 text-cyan-400" />
            <p className="text-xs">Seleccioná un componente de la lista o pulsá sobre el robot 3D para ver su explicación pedagógica.</p>
          </div>
        )}
      </div>
    </div>
  );
};
