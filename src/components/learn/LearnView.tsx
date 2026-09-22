import React, { useState } from 'react';
import {
  BookOpen,
  Bot,
  Cpu,
  BatteryCharging,
  GitBranch,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { EDUCATIONAL_TOPICS, EducationalTopic } from '../../data/educationalData';
import { sound } from '../../utils/sound';

const TOPIC_ICONS: Record<string, React.ElementType> = {
  Bot,
  Cpu,
  BatteryCharging,
  GitBranch,
  Layers,
};

export const LearnView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<EducationalTopic>(EDUCATIONAL_TOPICS[0]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelectTopic = (topic: EducationalTopic) => {
    setSelectedTopic(topic);
    setSelectedOption(null);
    setHasAnswered(false);
    sound.playClick();
  };

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);
    if (idx === selectedTopic.questionTest.correctIndex) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  const IconComponent = TOPIC_ICONS[selectedTopic.icon] || BookOpen;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4 bg-slate-950 text-slate-100 overflow-y-auto">
      {/* 1. Left Drawer: Topics Navigator */}
      <div className="w-full lg:w-80 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-4 shrink-0 space-y-2">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="font-display font-bold text-base text-cyan-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Conceptos Clave de Robótica
          </h2>
          <p className="text-xs text-slate-400">Guía para 3.º año de secundaria</p>
        </div>

        <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
          {EDUCATIONAL_TOPICS.map((topic) => {
            const Icon = TOPIC_ICONS[topic.icon] || BookOpen;
            const isSel = selectedTopic.id === topic.id;

            return (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic)}
                className={`w-full p-3 rounded-lg border text-left transition flex items-center gap-3 ${
                  isSel
                    ? 'bg-slate-800 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)] text-white'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${isSel ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs leading-tight">{topic.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{topic.shortSummary}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Didactic Tip */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="text-cyan-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Consejo de Taller
          </div>
          <p className="text-[11px] leading-relaxed">
            Recordá que en robótica la lógica siempre precede al cableado: primero definí qué debe hacer el robot, luego conectá los componentes.
          </p>
        </div>
      </div>

      {/* 2. Main Content & Interactive Quiz */}
      <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
              Módulo: {selectedTopic.category}
            </span>
            <h1 className="font-display font-bold text-2xl text-white mt-0.5">
              {selectedTopic.title}
            </h1>
            <p className="text-xs text-cyan-200/80 mt-1">
              {selectedTopic.shortSummary}
            </p>
          </div>
        </div>

        {/* Explanatory Paragraphs */}
        <div className="space-y-3 text-sm text-slate-200 leading-relaxed font-normal">
          {selectedTopic.content.map((p, idx) => (
            <p key={idx} className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/80">
              {p}
            </p>
          ))}
        </div>

        {/* Key Takeaway Callout */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 rounded-xl border border-cyan-500/30 flex items-start gap-3">
          <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-mono font-bold uppercase text-cyan-300 mb-1">
              Concepto Fundamental para Recordar
            </div>
            <div className="text-sm font-semibold text-white">
              {selectedTopic.keyTakeaway}
            </div>
          </div>
        </div>

        {/* Interactive Self-Assessment Quiz */}
        <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>Mini Desafío Conceptual</span>
          </div>

          <p className="text-sm font-semibold text-slate-100">
            {selectedTopic.questionTest.question}
          </p>

          <div className="space-y-2 pt-2">
            {selectedTopic.questionTest.options.map((opt, oIdx) => {
              const isCorrect = oIdx === selectedTopic.questionTest.correctIndex;
              const isChosen = selectedOption === oIdx;

              let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
              if (hasAnswered) {
                if (isCorrect) btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                else if (isChosen) btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 font-semibold';
                else btnStyle = 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60';
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={hasAnswered}
                  className={`w-full p-3 rounded-lg border text-left text-xs transition flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-black/30 font-mono text-[11px] flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {hasAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {hasAnswered && (
            <div className={`p-3 rounded-lg border text-xs leading-relaxed animate-in fade-in duration-200 ${
              selectedOption === selectedTopic.questionTest.correctIndex
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}>
              <div className="font-bold mb-1">
                {selectedOption === selectedTopic.questionTest.correctIndex ? '¡Excelente respuesta!' : 'Respuesta incorrecta:'}
              </div>
              <p>{selectedTopic.questionTest.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
