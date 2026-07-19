import { useState } from 'react';
import { StructuredPrompt, getApiHeaders } from '../types';
import { 
  Sparkles, Layers, Sliders, ChevronLeft, ChevronRight, HelpCircle, 
  Wand2, Save, Info, AlertCircle, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PromptBuilderProps {
  prompt: StructuredPrompt | null;
  onChangePrompt: (updated: StructuredPrompt) => void;
  onSavePrompt: () => void;
  aiProvider: 'gemini' | 'groq';
}

export default function PromptBuilder({
  prompt,
  onChangePrompt,
  onSavePrompt,
  aiProvider,
}: PromptBuilderProps) {
  const [editorMode, setEditorMode] = useState<'wizard' | 'sheet'>('wizard');
  const [activeStep, setActiveStep] = useState(0);
  const [goalInput, setGoalInput] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandingError, setExpandingError] = useState<string | null>(null);
  const [refiningField, setRefiningField] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!prompt) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/10">
        <Layers className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-slate-400">No Prompt Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          Select an existing prompt template from the library or create a custom blueprint to start engineering your prompt.
        </p>
      </div>
    );
  }

  // Field explanations and metadata
  const fieldsMeta: Record<string, { label: string; desc: string; placeholder: string; step: number }> = {
    title: {
      label: 'Blueprint Title',
      desc: 'Give your blueprint a memorable, searchable, professional name.',
      placeholder: 'e.g., Surgical Code Debugger, SaaS UX Copywriter...',
      step: 0
    },
    category: {
      label: 'Category Domain',
      desc: 'Categorize your prompt to organize your personal engineering library.',
      placeholder: '',
      step: 0
    },
    description: {
      label: 'Blueprint Purpose',
      desc: 'A short, one-sentence description explaining what this prompt achieves.',
      placeholder: 'e.g., Expert systems engineer prompt for identifying subtle bugs...',
      step: 0
    },
    role: {
      label: 'Role Persona (1)',
      desc: 'Installs the expert persona. Define who the AI is, their credentials, and background.',
      placeholder: 'e.g., You are a Senior Database Administrator and PostgreSQL optimization expert with 15+ years experience...',
      step: 1
    },
    task: {
      label: 'Primary Task (2)',
      desc: 'The core directive. Describe exactly what the AI must perform or build.',
      placeholder: 'e.g., Analyze the slow SQL query and generate fully optimized indexes and refactored code...',
      step: 1
    },
    context: {
      label: 'Context & High Stakes (3)',
      desc: 'Provides background situation, environment details, and highlights why this task is crucial (adds weight).',
      placeholder: 'e.g., The database is currently experiencing transactional locking issues under high traffic, causing API timeouts...',
      step: 2
    },
    constraints: {
      label: 'Technical Constraints (4)',
      desc: 'Established boundaries, technical limitations, length, and strict requirements to prevent deviation.',
      placeholder: 'e.g., Optimize for PostgreSQL 15+. All DDL must use CONCURRENTLY for indexes. Do not block production tables...',
      step: 2
    },
    examples: {
      label: 'Input / Output Examples (5)',
      desc: 'Few-shot learning examples demonstrating the exact inputs and the ideal formatted output style.',
      placeholder: 'Input:\nSELECT * FROM table;\n\nOutput:\n- Issue: Full table scan\n- Surgical Fix:\nCREATE INDEX...',
      step: 3
    },
    outputFormat: {
      label: 'Structure & Formatting (6)',
      desc: 'Rigid layout requirements: Markdown headers, side-by-side tables, specific JSON fields, or files.',
      placeholder: 'Return a structured Markdown report with these 4 sections:\n1. Anomaly Diagnosis\n2. Root Cause Anatomy\n3. Surgical Fix\n4. Performance Check...',
      step: 3
    },
    tone: {
      label: 'Brand Tone & Voice (7)',
      desc: 'Defines communication style, level of detail, complexity, and attitude to prevent generic AI style.',
      placeholder: 'e.g., Rigorous, authoritative, highly precise, constructive, and direct. Avoid conversational pleasantries or apologies...',
      step: 4
    },
    successCriteria: {
      label: 'Success Criteria (8)',
      desc: 'Exact benchmarks that verify the prompt has produced a perfect response.',
      placeholder: 'e.g., All queries achieve O(log N) complexity, zero lock timeouts occur, and the output DDL matches strict standard specifications...',
      step: 4
    },
    negativeInstructions: {
      label: 'Negative Instructions (9)',
      desc: 'Anti-patterns or bad habits the AI must absolutely avoid (crucial for defensive steering).',
      placeholder: 'e.g., Never suggest creating indexes blindly. Never use raw SELECT * in recommendations. Never make vague statements...',
      step: 4
    }
  };

  const steps = [
    { title: 'Core Metadata', fields: ['title', 'category', 'description'], icon: Layers },
    { title: 'Persona & Directives', fields: ['role', 'task'], icon: Wand2 },
    { title: 'Context & Boundaries', fields: ['context', 'constraints'], icon: Sliders },
    { title: 'Few-Shot & Layout', fields: ['examples', 'outputFormat'], icon: Info },
    { title: 'Voice & Guardrails', fields: ['tone', 'successCriteria', 'negativeInstructions'], icon: Sparkles }
  ];

  const handleFieldChange = (key: keyof StructuredPrompt, value: string) => {
    onChangePrompt({
      ...prompt,
      [key]: value,
      updatedAt: new Date().toISOString()
    });
  };

  // call server-side optimize API to auto-fill all fields based on a goal
  const handleAutoExplode = async () => {
    if (!goalInput.trim()) return;
    setIsExpanding(true);
    setExpandingError(null);
    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ goal: goalInput, category: prompt.category, provider: aiProvider }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Optimization request failed.');
      }
      const data = await response.json();
      
      // Update local prompt
      onChangePrompt({
        ...prompt,
        title: data.title || prompt.title,
        description: data.description || prompt.description,
        category: data.category || prompt.category,
        role: data.role || '',
        task: data.task || '',
        context: data.context || '',
        constraints: data.constraints || '',
        examples: data.examples || '',
        outputFormat: data.outputFormat || '',
        tone: data.tone || '',
        successCriteria: data.successCriteria || '',
        negativeInstructions: data.negativeInstructions || '',
        updatedAt: new Date().toISOString()
      });
      
      setGoalInput('');
      setActiveStep(1); // Advance to persona & directives step
    } catch (err: any) {
      setExpandingError(err.message || 'Could not connect to the AI API. Ensure the key is configured.');
    } finally {
      setIsExpanding(false);
    }
  };

  // call server-side single field refine API
  const handleRefineField = async (fieldName: string) => {
    const currentValue = (prompt as any)[fieldName];
    if (!currentValue?.trim()) return;

    setRefiningField(fieldName);
    try {
      const response = await fetch('/api/refine-field', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          fieldName,
          fieldValue: currentValue,
          title: prompt.title,
          description: prompt.description,
          provider: aiProvider
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Refinement failed.');
      }
      const data = await response.json();
      handleFieldChange(fieldName as keyof StructuredPrompt, data.refinedValue);
    } catch (err) {
      console.error('Field refinement failed', err);
    } finally {
      setRefiningField(null);
    }
  };

  const handleSave = () => {
    onSavePrompt();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="flex h-full flex-col bg-slate-900/30">
      {/* Top Builder Control bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">WORKSPACE MODE:</span>
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => setEditorMode('wizard')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                editorMode === 'wizard'
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Guided Wizard
            </button>
            <button
              onClick={() => setEditorMode('sheet')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                editorMode === 'sheet'
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Expert Blueprint
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 px-4 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_20px_rgba(20,184,166,0.35)] hover:scale-[1.03] active:scale-[0.97] animate-pulse-brighten"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Main Form workspace */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          
          {/* AI Generator Banner inside step 0 or when prompt task is empty */}
          {((editorMode === 'wizard' && activeStep === 0) || (editorMode === 'sheet' && !prompt.task)) && (
            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-500/5 blur-xl"></div>
              <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-indigo-500/5 blur-xl"></div>
              
              <div className="relative flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">AI Structured Prompt Exploder</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Have a rough goal? Write it below and Gemini will decompose, expand, and structure it into the 9 professional engineering components instantly.
                  </p>
                  
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder="e.g., Make a specialized code refactoring assistant for Python async code..."
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAutoExplode();
                      }}
                    />
                    <button
                      onClick={handleAutoExplode}
                      disabled={isExpanding || !goalInput.trim()}
                      className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-4 py-2.5 text-xs transition-all duration-200 shrink-0 cursor-pointer hover:scale-[1.04] active:scale-[0.96] shadow-[0_0_15px_rgba(20,184,166,0.12)] hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] ${!isExpanding && goalInput.trim() ? 'animate-pulse-brighten' : ''}`}
                    >
                      {isExpanding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      <span>{isExpanding ? 'Generating...' : 'Explode Goal'}</span>
                    </button>
                  </div>
                  
                  {expandingError && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{expandingError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          <AnimatePresence>
            {showSavedToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-teal-500/20 bg-slate-950 px-4 py-2 text-xs font-semibold text-teal-400 shadow-2xl"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Prompt Blueprint saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {editorMode === 'wizard' ? (
            /* ================= GUIDED WIZARD MODE ================= */
            <div className="space-y-6">
              {/* Progress Tracker */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-semibold font-mono">
                  <span>STEP {activeStep + 1} OF {steps.length}</span>
                  <span className="text-teal-400">{steps[activeStep].title}</span>
                </div>
                
                <div className="flex gap-1.5 h-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`flex-1 rounded-full cursor-pointer transition-all ${
                        i === activeStep 
                          ? 'bg-teal-500' 
                          : i < activeStep 
                            ? 'bg-teal-500/30' 
                            : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Form Step Workspace */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-6 min-h-[340px]">
                {steps[activeStep].fields.map((fieldKey) => {
                  const meta = fieldsMeta[fieldKey];
                  const value = (prompt as any)[fieldKey] || '';

                  return (
                    <div key={fieldKey} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200 tracking-tight flex items-center gap-1.5">
                          {meta.label}
                        </label>
                        
                         {/* Inline field AI refinement */}
                        {fieldKey !== 'category' && value.trim().length > 5 && (
                          <button
                            onClick={() => handleRefineField(fieldKey)}
                            disabled={refiningField !== null}
                            className="flex items-center gap-1 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white hover:border-teal-500/30 px-2.5 py-1 transition-all duration-200 cursor-pointer hover:scale-[1.05] active:scale-[0.95] hover:shadow-[0_0_8px_rgba(20,184,166,0.1)]"
                          >
                            {refiningField === fieldKey ? (
                              <RefreshCw className="h-3 w-3 animate-spin text-teal-400" />
                            ) : (
                              <Sparkles className="h-3 w-3 text-teal-400" />
                            )}
                            <span>{refiningField === fieldKey ? 'Refining...' : 'AI Refine'}</span>
                          </button>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed">{meta.desc}</p>
                      
                      {fieldKey === 'category' ? (
                        <select
                          value={value}
                          onChange={(e) => handleFieldChange('category', e.target.value as any)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                        >
                          <option value="development">Development</option>
                          <option value="debugging">Debugging</option>
                          <option value="writing">Writing</option>
                          <option value="design">Design</option>
                          <option value="business">Business</option>
                          <option value="other">Other</option>
                        </select>
                      ) : fieldKey === 'title' || fieldKey === 'description' ? (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleFieldChange(fieldKey as any, e.target.value)}
                          placeholder={meta.placeholder}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10"
                        />
                      ) : (
                        <textarea
                          value={value}
                          onChange={(e) => handleFieldChange(fieldKey as any, e.target.value)}
                          placeholder={meta.placeholder}
                          rows={fieldKey === 'examples' || fieldKey === 'task' ? 6 : 4}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-xs text-white font-sans placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10 leading-relaxed"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

               {/* Wizard Nav buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 disabled:opacity-30 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.96] hover:border-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous Step</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950/80 px-2 py-1 rounded border border-slate-900">
                    Step {activeStep + 1} / {steps.length}
                  </span>
                </div>

                {activeStep < steps.length - 1 ? (
                  <button
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-900 text-teal-400 hover:text-teal-300 transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.96] hover:border-teal-500/30 hover:shadow-[0_0_12px_rgba(20,184,166,0.12)]"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold rounded-lg bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 shadow-[0_0_12px_rgba(20,184,166,0.2)] hover:shadow-[0_0_18px_rgba(20,184,166,0.4)] transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.96] animate-pulse-brighten"
                  >
                    <Save className="h-4 w-4" />
                    <span>Complete & Save</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ================= EXPERT BLUEPRINT MODE (FULL SHEET) ================= */
            <div className="space-y-6">
              {steps.map((step, stepIndex) => {
                const StepIcon = step.icon;
                return (
                  <div key={stepIndex} className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 border border-slate-800 text-teal-400">
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{step.title}</h3>
                    </div>

                    <div className="space-y-5">
                      {step.fields.map((fieldKey) => {
                        const meta = fieldsMeta[fieldKey];
                        const value = (prompt as any)[fieldKey] || '';

                        return (
                          <div key={fieldKey} className="space-y-1.5 text-left">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                {meta.label}
                              </label>
                              
                              {/* Inline refinement */}
                              {fieldKey !== 'category' && value.trim().length > 5 && (
                                <button
                                  onClick={() => handleRefineField(fieldKey)}
                                  disabled={refiningField !== null}
                                  className="flex items-center gap-1 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white hover:border-teal-500/30 px-2.5 py-1 transition-all duration-200 cursor-pointer hover:scale-[1.05] active:scale-[0.95] hover:shadow-[0_0_8px_rgba(20,184,166,0.1)]"
                                >
                                  {refiningField === fieldKey ? (
                                    <RefreshCw className="h-3 w-3 animate-spin text-teal-400" />
                                  ) : (
                                    <Sparkles className="h-3 w-3 text-teal-400" />
                                  )}
                                  <span>{refiningField === fieldKey ? 'Refining...' : 'AI Refine'}</span>
                                </button>
                              )}
                            </div>

                            {fieldKey === 'category' ? (
                              <select
                                value={value}
                                onChange={(e) => handleFieldChange('category', e.target.value as any)}
                                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                              >
                                <option value="development">Development</option>
                                <option value="debugging">Debugging</option>
                                <option value="writing">Writing</option>
                                <option value="design">Design</option>
                                <option value="business">Business</option>
                                <option value="other">Other</option>
                              </select>
                            ) : fieldKey === 'title' || fieldKey === 'description' ? (
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleFieldChange(fieldKey as any, e.target.value)}
                                placeholder={meta.placeholder}
                                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                              />
                            ) : (
                              <textarea
                                value={value}
                                onChange={(e) => handleFieldChange(fieldKey as any, e.target.value)}
                                placeholder={meta.placeholder}
                                rows={fieldKey === 'examples' || fieldKey === 'task' ? 5 : 3}
                                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-teal-500 leading-relaxed"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
