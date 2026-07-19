import { useState } from 'react';
import { StructuredPrompt, PromptEvaluation, getApiHeaders } from '../types';
import { 
  Sparkles, Check, AlertTriangle, Play, RefreshCw, Compass, ShieldAlert,
  ArrowRight, ShieldCheck, HeartPulse, Sparkle, Settings, Layers
} from 'lucide-react';
import { motion } from 'motion/react';

interface PromptEvaluatorProps {
  prompt: StructuredPrompt;
  onChangePrompt: (updated: StructuredPrompt) => void;
  onSavePrompt: () => void;
  aiProvider: 'gemini' | 'groq';
}

export default function PromptEvaluator({
  prompt,
  onChangePrompt,
  onSavePrompt,
  aiProvider,
}: PromptEvaluatorProps) {
  const [evaluation, setEvaluation] = useState<PromptEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Record<number, boolean>>({});

  const handleAudit = async () => {
    setLoading(true);
    setError(null);
    setAppliedFixes({});
    try {
      const response = await fetch('/api/evaluate-prompt', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ ...prompt, provider: aiProvider }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Evaluation failed.');
      }

      const data = await response.json();
      setEvaluation(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete prompt audit. Verify your API key is active.');
    } finally {
      setLoading(false);
    }
  };

  const applyCorrection = (index: number, suggestion: any) => {
    if (!evaluation || !suggestion.beforeAfter) return;
    
    const fieldKey = suggestion.field as keyof StructuredPrompt;
    const currentFieldValue = prompt[fieldKey];
    
    if (typeof currentFieldValue !== 'string') return;

    const beforeText = suggestion.beforeAfter.before;
    const afterText = suggestion.beforeAfter.after;

    let updatedValue = currentFieldValue;
    
    // Attempt exact replacement
    if (currentFieldValue.includes(beforeText)) {
      updatedValue = currentFieldValue.replace(beforeText, afterText);
    } else {
      // Fallback: If it doesn't match perfectly, append or overwrite if field is short
      if (currentFieldValue.length < 50) {
        updatedValue = afterText;
      } else {
        updatedValue = `${currentFieldValue}\n\n${afterText}`;
      }
    }

    // Update parent prompt state
    onChangePrompt({
      ...prompt,
      [fieldKey]: updatedValue,
      updatedAt: new Date().toISOString()
    });

    setAppliedFixes((prev) => ({ ...prev, [index]: true }));
    onSavePrompt();
  };

  // Score styling helpers
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 65) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 65) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 p-6 space-y-5">
      {/* Primary Audit Action */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <HeartPulse className="h-4 w-4 text-teal-400" />
            <span>Gemini Prompt Auditor</span>
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
            Submit your blueprint to Gemini to rate its clarity, completeness, specificity, and safety.
          </p>
        </div>

        <button
          onClick={handleAudit}
          disabled={loading}
          className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold px-4.5 py-2 text-xs transition-all duration-200 cursor-pointer shrink-0 hover:scale-[1.04] active:scale-[0.96] shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_20px_rgba(20,184,166,0.35)] ${!loading ? 'animate-pulse-brighten' : ''}`}
        >
          {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          <span>{loading ? 'Auditing...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {/* Main Audit Display */}
      <div className="flex-1 overflow-y-auto space-y-5 min-h-[300px]">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-left flex gap-2.5 text-xs text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Audit Execution Terminated</p>
              <p className="opacity-80 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {!evaluation && !loading && !error && (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs px-4 text-center">
            <Compass className="h-10 w-10 mb-2 stroke-[1.2] text-slate-600 animate-pulse" />
            <p className="font-semibold text-slate-400">Audit Diagnostics Offline</p>
            <p className="opacity-75 mt-1 text-slate-500 max-w-xs">Click "Run Diagnostics" to assess quality against professional prompt engineering heuristics.</p>
          </div>
        )}

        {loading && (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 text-teal-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Analyzing prompt structures...</p>
            <p className="text-[10px] text-slate-500 max-w-xs text-center leading-relaxed">
              Gemini is assessing linguistic quality, validating security thresholds, and preparing tactical before/after optimization corrections.
            </p>
          </div>
        )}

        {evaluation && !loading && (
          <div className="space-y-6 text-left">
            {/* Top Score summary */}
            <div className={`rounded-xl border p-5 flex flex-col md:flex-row gap-5 items-center justify-between ${getScoreColor(evaluation.overallScore)}`}>
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-75 font-semibold">Overall Strength Score</span>
                <div className="flex items-baseline justify-center md:justify-start gap-1">
                  <span className="text-4xl font-extrabold tracking-tight font-sans text-white">{evaluation.overallScore}</span>
                  <span className="text-sm font-semibold opacity-70">/ 100</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-md mt-1 font-medium">{evaluation.verdict}</p>
              </div>

              {/* Graphical radial score mockup or clean simple bar */}
              <div className="relative flex h-24 w-24 items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border border-slate-800 bg-slate-950/40"></div>
                {/* SVG Progress Circle */}
                <svg className="h-20 w-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#1e293b"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="transition-all duration-1000"
                    stroke={evaluation.overallScore >= 85 ? '#10b981' : evaluation.overallScore >= 65 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - evaluation.overallScore / 100)}
                  />
                </svg>
                <span className="absolute text-sm font-bold font-mono text-white">{evaluation.overallScore}%</span>
              </div>
            </div>

            {/* Dimensional checks */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Sparkle className="h-3.5 w-3.5 text-indigo-400" /> Objective Clarity
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{evaluation.dimensions.clarity}/10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${evaluation.dimensions.clarity * 10}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-teal-400" /> Structure Completeness
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{evaluation.dimensions.completeness}/10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${evaluation.dimensions.completeness * 10}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Settings className="h-3.5 w-3.5 text-amber-400" /> Explicit Specificity
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{evaluation.dimensions.specificity}/10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${evaluation.dimensions.specificity * 10}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-rose-400" /> Defensive Guardrails
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{evaluation.dimensions.safety}/10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${evaluation.dimensions.safety * 10}%` }} />
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Split */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Strengths */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-emerald-400 tracking-wider uppercase font-mono flex items-center gap-1">
                  <Check className="h-4 w-4" /> Structural Strengths
                </h4>
                <div className="space-y-2">
                  {evaluation.strengths.map((str, idx) => (
                    <div key={idx} className="flex gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 text-xs text-slate-300 leading-relaxed font-sans font-medium">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-2"></div>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-rose-400 tracking-wider uppercase font-mono flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4" /> Opportunities for Alignment
                </h4>
                <div className="space-y-2">
                  {evaluation.weaknesses.map((weak, idx) => (
                    <div key={idx} className="flex gap-2 rounded-lg bg-rose-500/5 border border-rose-500/10 p-3 text-xs text-slate-300 leading-relaxed font-sans font-medium">
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0 mt-2"></div>
                      <span>{weak}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Surgical corrections */}
            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-teal-400 tracking-wider uppercase font-mono flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> Tactically Recommended Fixes
                </h4>
                
                <div className="space-y-4">
                  {evaluation.suggestions.map((sug, idx) => {
                    const isApplied = appliedFixes[idx];
                    
                    return (
                      <div key={idx} className="rounded-xl border border-slate-850 bg-slate-900/20 overflow-hidden">
                        {/* Header details */}
                        <div className="flex justify-between items-center bg-slate-950 px-4 py-2 border-b border-slate-850/80 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-teal-400 uppercase font-bold">Field: {sug.field}</span>
                          </div>
                          
                          {sug.beforeAfter && (
                            <button
                              onClick={() => applyCorrection(idx, sug)}
                              disabled={isApplied}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer hover:scale-[1.05] active:scale-[0.95] ${
                                isApplied
                                  ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 hover:shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                              }`}
                            >
                              {isApplied ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                              <span>{isApplied ? 'Surgical Fix Applied' : 'Auto-Apply Fix'}</span>
                            </button>
                          )}
                        </div>

                        <div className="p-4 space-y-3">
                          <p className="text-xs text-slate-300 font-sans leading-relaxed font-medium">{sug.recommendation}</p>

                          {/* Before / After visual differences */}
                          {sug.beforeAfter && (
                            <div className="grid gap-2 text-[11px] font-mono">
                              <div className="rounded-lg bg-rose-950/20 border border-rose-500/10 p-2.5 text-left text-rose-300">
                                <span className="text-[9px] bg-rose-950 px-1 py-0.2 rounded font-bold uppercase tracking-wider text-rose-400">Current</span>
                                <p className="mt-1 leading-relaxed whitespace-pre-wrap">{sug.beforeAfter.before}</p>
                              </div>
                              <div className="flex justify-center text-slate-600">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                              <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/10 p-2.5 text-left text-emerald-300">
                                <span className="text-[9px] bg-emerald-950 px-1 py-0.2 rounded font-bold uppercase tracking-wider text-emerald-400 font-sans">Surgical Recommendation</span>
                                <p className="mt-1 leading-relaxed whitespace-pre-wrap">{sug.beforeAfter.after}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
