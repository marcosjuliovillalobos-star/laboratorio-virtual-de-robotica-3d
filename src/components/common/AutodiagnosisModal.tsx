import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BatteryCharging,
  Cpu,
  Cog,
  Radar,
  Cable,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { CodeBlock } from '../../types/robot';

interface AutodiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  installedComponents: string[];
  blocks: CodeBlock[];
  onNavigate: (view: any) => void;
}

export const AutodiagnosisModal: React.FC<AutodiagnosisModalProps> = ({
  isOpen,
  onClose,
  installedComponents,
  blocks,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const has = (id: string) => installedComponents.includes(id);

  // 1. Batería
  const hasBattery = has('battery');
  // 2. Controlador
  const hasController = has('controller');
  // 3. Motores
  const motorCount = (has('left_motor') ? 1 : 0) + (has('right_motor') ? 1 : 0);
  const wheelCount = (has('left_wheel') ? 1 : 0) + (has('right_wheel') ? 1 : 0);
  // 4. Sensores
  const hasUltrasonic = has('ultrasonic');
  const hasLight = has('light_sensor');
  // 5. Programa
  const hasBlocks = blocks.length > 0;
  const usesUltrasonicInProgram = blocks.some((b) => b.type === 'if_distance_less');

  const tests = [
    {
      id: 'battery',
      title: 'Fuente de Energía (Batería)',
      icon: BatteryCharging,
      status: hasBattery ? ('ok' as const) : ('error' as const),
      message: hasBattery
        ? 'Batería conectada correctamente. Suministra voltaje continuo DC.'
        : 'Falta fuente de alimentación. Los motores y el controlador no encenderán.',
    },
    {
      id: 'controller',
      title: 'Controlador (Cerebro)',
      icon: Cpu,
      status: hasController ? ('ok' as const) : ('error' as const),
      message: hasController
        ? 'Microcontrolador instalado y listo para procesar algoritmos.'
        : 'No hay microcontrolador para interpretar el código ni gestionar los pines.',
    },
    {
      id: 'motors',
      title: 'Sistema de Tracción (Motores + Ruedas)',
      icon: Cog,
      status:
        motorCount === 2 && wheelCount === 2
          ? ('ok' as const)
          : motorCount > 0
          ? ('warning' as const)
          : ('error' as const),
      message:
        motorCount === 2 && wheelCount === 2
          ? 'Tracción diferencial completa: 2 motores y 2 ruedas listos.'
          : motorCount < 2
          ? `Solo hay ${motorCount}/2 motores instalados. El robot no podrá maniobrar derecho.`
          : 'Hay motores pero faltan las ruedas para transmitir la fuerza motriz.',
    },
    {
      id: 'sensors',
      title: 'Percepción Sensorial',
      icon: Radar,
      status: hasUltrasonic || hasLight ? ('ok' as const) : ('warning' as const),
      message: hasUltrasonic
        ? 'Sensor ultrasónico operativo para medición de distancia frontal.'
        : hasLight
        ? 'Sensor de luz operativo.'
        : 'No hay sensores instalados. El robot solo podrá moverse sin percibir obstáculos.',
    },
    {
      id: 'program',
      title: 'Programa y Algoritmo',
      icon: FileCode,
      status:
        hasBlocks && (!hasUltrasonic || usesUltrasonicInProgram)
          ? ('ok' as const)
          : hasBlocks
          ? ('warning' as const)
          : ('error' as const),
      message: !hasBlocks
        ? 'El programa está vacío. Se requieren bloques en el programador.'
        : hasUltrasonic && !usesUltrasonicInProgram
        ? 'Tenés el sensor ultrasónico montado pero aún no lo usás en un bloque "Si Distancia < X".'
        : `${blocks.length} bloques listos para ser ejecutados en el bucle principal.`,
    },
  ];

  const errors = tests.filter((t) => t.status === 'error').length;
  const warnings = tests.filter((t) => t.status === 'warning').length;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white">Autodiagnóstico del Robot</h2>
              <p className="text-[11px] text-slate-400">Verificación pedagógica de hardware y software</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Status Score */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            Resultado de la inspección:
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
              🟢 {tests.filter((t) => t.status === 'ok').length} Correctos
            </span>
            {warnings > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                🟡 {warnings} Avisos
              </span>
            )}
            {errors > 0 && (
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded">
                🔴 {errors} Errores
              </span>
            )}
          </div>
        </div>

        {/* Tests List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 text-xs">
          {tests.map((test) => {
            const Icon = test.icon;
            return (
              <div
                key={test.id}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  test.status === 'ok'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : test.status === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="mt-0.5">
                  {test.status === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : test.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    {test.title}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                    {test.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {errors === 0 ? '¡Listo para simular!' : 'Revisá los componentes señalados.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
