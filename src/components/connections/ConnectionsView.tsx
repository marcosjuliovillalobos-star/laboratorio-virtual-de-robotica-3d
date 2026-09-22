import React from 'react';
import {
  BatteryCharging,
  Cpu,
  Radar,
  Cog,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowDown,
  ArrowRight,
  Zap,
  HelpCircle,
  Play,
} from 'lucide-react';
import { CodeBlock } from '../../types/robot';

interface ConnectionsViewProps {
  installedComponents: string[];
  blocks: CodeBlock[];
  onNavigate: (view: any) => void;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({
  installedComponents,
  blocks,
  onNavigate,
}) => {
  const has = (id: string) => installedComponents.includes(id);

  const hasBattery = has('battery');
  const hasController = has('controller');
  const motorCount = (has('left_motor') ? 1 : 0) + (has('right_motor') ? 1 : 0);
  const wheelCount = (has('left_wheel') ? 1 : 0) + (has('right_wheel') ? 1 : 0);
  const hasUltrasonic = has('ultrasonic');
  const hasLightSensor = has('light_sensor');
  const hasLed = has('led');
  const hasBuzzer = has('buzzer');
  const hasBlocks = blocks.length > 0;

  // Diagnostics evaluation
  const diagnostics: { type: 'error' | 'warning' | 'ok'; title: string; desc: string }[] = [];

  if (!hasBattery) {
    diagnostics.push({
      type: 'error',
      title: 'Falta Fuente de Energía (Batería)',
      desc: 'Los circuitos electrónicos y los motores no pueden activarse sin una fuente de voltaje continuo.',
    });
  }

  if (!hasController) {
    diagnostics.push({
      type: 'error',
      title: 'Falta el Controlador (Cerebro)',
      desc: 'Sin microcontrolador no hay procesador que interprete los algoritmos ni lea las señales de los sensores.',
    });
  }

  if (motorCount > 0 && !hasBattery) {
    diagnostics.push({
      type: 'warning',
      title: 'Motores sin Alimentación',
      desc: 'El motor está fijado al chasis pero no recibirá corriente eléctrica sin la batería.',
    });
  }

  if (motorCount < 2) {
    diagnostics.push({
      type: 'warning',
      title: 'Tracción Incompleta',
      desc: `Hay ${motorCount} de 2 motores instalados. Un robot móvil diferencial necesita 2 motores para avanzar en línea recta y girar.`,
    });
  }

  if (wheelCount < motorCount) {
    diagnostics.push({
      type: 'warning',
      title: 'Ejes sin Ruedas',
      desc: 'El motor girará mecánicamente pero sin neumáticos no podrá transmitir tracción al suelo.',
    });
  }

  if (hasUltrasonic && !hasController) {
    diagnostics.push({
      type: 'warning',
      title: 'Sensor sin Cerebro Receptor',
      desc: 'El sensor ultrasónico emite señales analógicas que solo un controlador puede medir y traducir a centímetros.',
    });
  }

  if (!hasBlocks) {
    diagnostics.push({
      type: 'warning',
      title: 'Programa sin Algoritmo',
      desc: 'El hardware está conectado pero la memoria del controlador está vacía. Necesitás programar bloques de acción.',
    });
  }

  const isAllGood = diagnostics.filter((d) => d.type === 'error').length === 0 && motorCount === 2 && hasBattery && hasController;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 bg-slate-950 text-slate-100 overflow-y-auto">
      {/* 1. Left: Architectural Pipeline (Energy -> Control -> Sensors -> Processing -> Actuators) */}
      <div className="flex-1 flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-cyan-400">
              Circuito Lógico: Entrada → Procesamiento → Salida
            </h2>
            <p className="text-xs text-slate-400">
              Comprendé cómo fluye la energía eléctrica y la información en un robot autónomo
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            Arquitectura EPS
          </span>
        </div>

        {/* Pipeline Diagram */}
        <div className="flex-1 flex flex-col justify-around py-2 space-y-4">
          {/* Level 1: ENERGÍA (Batería) */}
          <div className="flex items-center gap-4">
            <div
              className={`flex-1 p-3.5 rounded-xl border flex items-center justify-between transition ${
                hasBattery
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasBattery ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase text-amber-400 font-bold">1. Alimentación (Energía)</div>
                  <div className="font-bold text-sm text-white">Batería 9V / LiPo</div>
                  <div className="text-xs text-slate-400">Suministra voltaje continuo a todo el sistema</div>
                </div>
              </div>
              <span className={`text-xs font-mono font-semibold px-2 py-1 rounded ${hasBattery ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {hasBattery ? '🟢 Conectada' : '🔴 Desconectada'}
              </span>
            </div>
          </div>

          <div className="flex justify-center text-cyan-400/60">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>

          {/* Level 2: CONTROLADOR (Cerebro) */}
          <div className="flex items-center gap-4">
            <div
              className={`flex-1 p-3.5 rounded-xl border flex items-center justify-between transition ${
                hasController
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasController ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold">2. Procesamiento Central</div>
                  <div className="font-bold text-sm text-white">Controlador (Microcomputadora)</div>
                  <div className="text-xs text-slate-400">Ejecuta el programa cargado y calcula las decisiones lógicas</div>
                </div>
              </div>
              <span className={`text-xs font-mono font-semibold px-2 py-1 rounded ${hasController ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {hasController ? '🟢 Operativo' : '🔴 Falta cerebro'}
              </span>
            </div>
          </div>

          <div className="flex justify-center text-cyan-400/60">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>

          {/* Level 3: ENTRADAS (Sensores) vs SALIDAS (Actuadores) Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ENTRADAS */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-bold text-cyan-400 flex items-center justify-between">
                <span>3A. ENTRADAS (Sensores)</span>
                <span className="text-[10px] text-slate-400">Captan el entorno</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className={`p-2 rounded border flex items-center justify-between ${hasUltrasonic ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="flex items-center gap-2">
                    <Radar className="w-3.5 h-3.5" /> Sensor Ultrasónico
                  </span>
                  <span>{hasUltrasonic ? '🟢 Listo' : '⚪ No instalado'}</span>
                </div>
                <div className={`p-2 rounded border flex items-center justify-between ${hasLightSensor ? 'bg-purple-950/30 border-purple-500/40 text-purple-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Sensor de Luz LDR
                  </span>
                  <span>{hasLightSensor ? '🟢 Listo' : '⚪ No instalado'}</span>
                </div>
              </div>
            </div>

            {/* SALIDAS */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-bold text-orange-400 flex items-center justify-between">
                <span>3B. SALIDAS (Actuadores)</span>
                <span className="text-[10px] text-slate-400">Generan acción</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className={`p-2 rounded border flex items-center justify-between ${motorCount === 2 ? 'bg-orange-950/30 border-orange-500/40 text-orange-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="flex items-center gap-2">
                    <Cog className="w-3.5 h-3.5" /> 2 Motores + Ruedas
                  </span>
                  <span>{motorCount === 2 ? '🟢 2 Motores' : `🟡 ${motorCount}/2`}</span>
                </div>
                <div className={`p-2 rounded border flex items-center justify-between ${hasLed || hasBuzzer ? 'bg-violet-950/30 border-violet-500/40 text-violet-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> LED & Buzzer
                  </span>
                  <span>{hasLed ? '🟢 LED' : ''} {hasBuzzer ? '🟢 Buzzer' : ''} {!hasLed && !hasBuzzer ? '⚪ Opcional' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right: Diagnostics & Status Audit */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Diagnóstico de Conexiones
          </h3>
          <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
            isAllGood ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {isAllGood ? '🟢 LISTO' : '⚠️ ATENCIÓN'}
          </span>
        </div>

        {/* Overall Status Banner */}
        <div className={`p-3 rounded-xl border mb-4 text-xs ${
          isAllGood
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
        }`}>
          {isAllGood ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span><strong>¡Circuito Correcto!</strong> La batería alimenta el microcontrolador y los actuadores están sincronizados.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Hay observaciones mecánicas o eléctricas que resolver antes de navegar.</span>
            </div>
          )}
        </div>

        {/* Diagnostic Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {diagnostics.map((diag, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs leading-relaxed ${
                diag.type === 'error'
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {diag.type === 'error' ? <XCircle className="w-3.5 h-3.5 text-rose-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                {diag.title}
              </div>
              <p className="text-slate-300 opacity-90">{diag.desc}</p>
            </div>
          ))}

          {diagnostics.length === 0 && (
            <div className="p-4 bg-slate-950/50 rounded-lg text-center text-xs text-slate-400">
              No se detectaron fallas de conexión.
            </div>
          )}
        </div>

        {/* Quick Nav Shortcut */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => onNavigate('programmer')}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-display font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition"
          >
            Ir al Programador de Bloques <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
