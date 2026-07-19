import { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, AlertTriangle, CheckCircle2, BookOpen, ExternalLink, X, Sun, Moon, Settings, Key, Eye, EyeOff, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiHeaders } from '../types';

interface HeaderProps {
  aiProvider: 'gemini' | 'groq';
  onChangeProvider: (p: 'gemini' | 'groq') => void;
  theme: 'dark' | 'light';
  onChangeTheme: (t: 'dark' | 'light') => void;
}

export default function Header({ aiProvider, onChangeProvider, theme, onChangeTheme }: HeaderProps) {
  const [keyStatus, setKeyStatus] = useState<{
    geminiConfigured: boolean;
    groqConfigured: boolean;
  } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [geminiInput, setGeminiInput] = useState('');
  const [groqInput, setGroqInput] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const refreshKeyStatus = () => {
    fetch('/api/check-key', { headers: getApiHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setKeyStatus({
          geminiConfigured: !!data.geminiConfigured,
          groqConfigured: !!data.groqConfigured
        });
      })
      .catch(() => {
        setKeyStatus({ geminiConfigured: false, groqConfigured: false });
      });
  };

  useEffect(() => {
    refreshKeyStatus();
  }, [aiProvider]);

  const openSettings = () => {
    setGeminiInput(localStorage.getItem('innoviast_prompt_workspace_gemini_key') || '');
    setGroqInput(localStorage.getItem('innoviast_prompt_workspace_groq_key') || '');
    setSaveSuccess(false);
    setShowSettings(true);
  };

  const handleSaveKeys = () => {
    if (geminiInput.trim()) {
      localStorage.setItem('innoviast_prompt_workspace_gemini_key', geminiInput.trim());
    } else {
      localStorage.removeItem('innoviast_prompt_workspace_gemini_key');
    }

    if (groqInput.trim()) {
      localStorage.setItem('innoviast_prompt_workspace_groq_key', groqInput.trim());
    } else {
      localStorage.removeItem('innoviast_prompt_workspace_groq_key');
    }

    setSaveSuccess(true);
    refreshKeyStatus();
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSettings(false);
    }, 1200);
  };

  const handleClearKeys = () => {
    localStorage.removeItem('innoviast_prompt_workspace_gemini_key');
    localStorage.removeItem('innoviast_prompt_workspace_groq_key');
    setGeminiInput('');
    setGroqInput('');
    setSaveSuccess(true);
    refreshKeyStatus();
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSettings(false);
    }, 1000);
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-lg bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-400 opacity-75 blur-md animate-glow-pulse"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-750 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.35)]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold tracking-wider text-teal-500 uppercase">Innoviast Week 3</span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                <span className="font-mono text-xs text-slate-400">Track 03</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white font-sans sm:text-2xl">
                Prompt Engineering Workspace
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Provider Toggle Switcher */}
            <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              <button
                onClick={() => onChangeProvider('gemini')}
                title="Use Google Gemini LLM API"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${
                  aiProvider === 'gemini'
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  keyStatus?.geminiConfigured ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.7)]' : 'bg-slate-600'
                }`}></span>
                <span>Gemini API</span>
              </button>
              
              <button
                onClick={() => onChangeProvider('groq')}
                title="Use Groq Llama 3 API (Free & Ultra Fast)"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${
                  aiProvider === 'groq'
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  keyStatus?.groqConfigured ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.7)]' : 'bg-slate-600'
                }`}></span>
                <span>Groq Llama</span>
              </button>
            </div>

            {/* API Status Indicator */}
            {keyStatus === null ? (
              <div className="h-6 w-24 animate-pulse rounded bg-slate-800"></div>
            ) : (aiProvider === 'gemini' ? keyStatus.geminiConfigured : keyStatus.groqConfigured) ? (
              <div className="flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{aiProvider === 'gemini' ? 'Gemini Active' : 'Groq Active'}</span>
                <span className="sm:hidden">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">No Key (Set in Settings)</span>
                <span className="sm:hidden">No Key</span>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={() => onChangeTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 p-2 text-slate-300 hover:text-white transition-all duration-300 cursor-pointer hover:scale-110 active:scale-90 hover:border-slate-700 shadow-md hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400 animate-[spin_20s_linear_infinite]" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>

            {/* API Settings Button */}
            <button
              onClick={openSettings}
              title="Workspace API Settings"
              className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 p-2 text-slate-300 hover:text-white transition-all duration-300 cursor-pointer hover:scale-110 active:scale-90 hover:border-slate-700 hover:shadow-[0_0_12px_rgba(20,184,166,0.15)] animate-pulse-brighten"
            >
              <Settings className="h-4 w-4 text-teal-400" />
            </button>

            {/* Quick Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.96] hover:border-teal-500/30 hover:shadow-[0_0_10px_rgba(20,184,166,0.1)]"
            >
              <HelpCircle className="h-4 w-4 text-teal-400" />
              <span>Workspace Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 text-slate-100 p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="h-6 w-6 text-teal-400" />
                <h2 className="text-xl font-bold text-white font-sans">
                  The 9 Pillars of Professional Prompt Engineering
                </h2>
              </div>

              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Structured prompts produce repeatable, high-quality results from Large Language Models. 
                By declaring clear parameters, you prevent model hallucinations, off-brand tones, and loose instructions.
              </p>

              <div className="space-y-4 font-sans text-sm mb-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80">
                    <h3 className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-teal-950 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">1</span>
                      Role Persona
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Installs the expert domain identity (e.g. "Lead Database Admin", "CRO Copywriter") and deepens domain-specific reasoning context.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80">
                    <h3 className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-teal-950 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">2</span>
                      Primary Task
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The core directive. What exact, highly detailed action the model is commissioned to perform. Keep action-oriented and granular.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80">
                    <h3 className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-teal-950 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">3</span>
                      Context & Stakes
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Explains the background environment, high stakes (e.g., "for a production system with high traffic"), and the psychological purpose.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80">
                    <h3 className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-teal-950 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">4</span>
                      Explicit Constraints
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Saves time by establishing rigid boundaries (e.g., "PostgreSQL 15 only", "under 200 characters", "no external APIs").
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80">
                    <h3 className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-teal-950 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">5</span>
                      Input/Output Examples
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Few-shot learning. Demonstrates exact input formats and ideal output expectations. Highly effective for syntax or layout control.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80">
                    <h3 className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-teal-950 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">6</span>
                      Output Structure
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Specifies structural guidelines: Markdown headings, JSON properties, side-by-side tables, or code blocks.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80">
                    <h3 className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-teal-950 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">7</span>
                      Brand Tone & Voice
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Defines stylistic feel (e.g. "analytical and precise", "friendly and conversational") to prevent robotic or default AI prose.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80">
                    <h3 className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                      <span className="text-xs bg-teal-950 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">8</span>
                      Success Benchmarks
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Milestones the prompt output must clear (e.g., "zero compiler errors", "WCAG accessibility guidelines met").
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80 mt-4">
                  <h3 className="font-semibold text-rose-400 flex items-center gap-1.5 mb-1">
                    <span className="text-xs bg-rose-950 text-rose-400 h-5 w-5 rounded-full flex items-center justify-center font-mono">9</span>
                    Negative Instructions (Critical Safety)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Anti-patterns, words, or lazy approaches to avoid (e.g. "Never use 'any' types", "Never apologize or include conversational fillers"). Essential for shielding and alignment.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-800 pt-4">
                <button
                  onClick={() => setShowGuide(false)}
                  className="rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium px-4 py-2 text-sm cursor-pointer transition"
                >
                  Got it, Let's Build
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* API Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-xl border border-slate-850 bg-slate-900 text-slate-100 p-6 shadow-2xl space-y-6"
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-500/10 p-2 border border-teal-500/20">
                  <Key className="h-5 w-5 text-teal-400 animate-pulse-brighten" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                    Workspace API Keys
                  </h2>
                  <p className="text-xs text-slate-400 leading-normal">
                    Optionally set your custom keys to bypass backend environment limits. Saved locally in your browser.
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-sans text-sm">
                {/* Gemini API Key */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 tracking-wider">
                      GEMINI API KEY
                    </label>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      localStorage.getItem('innoviast_prompt_workspace_gemini_key')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : keyStatus?.geminiConfigured
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {localStorage.getItem('innoviast_prompt_workspace_gemini_key')
                        ? 'Custom Key'
                        : keyStatus?.geminiConfigured
                        ? 'Active (Server env)'
                        : 'Not Set'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={geminiInput}
                      onChange={(e) => setGeminiInput(e.target.value)}
                      placeholder="AI_STUDIO_GEMINI_API_KEY..."
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-10 text-xs text-white font-mono placeholder:text-slate-700 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Groq API Key */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 tracking-wider">
                      GROQ API KEY
                    </label>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      localStorage.getItem('innoviast_prompt_workspace_groq_key')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : keyStatus?.groqConfigured
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {localStorage.getItem('innoviast_prompt_workspace_groq_key')
                        ? 'Custom Key'
                        : keyStatus?.groqConfigured
                        ? 'Active (Server env)'
                        : 'Not Set'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showGroqKey ? "text" : "password"}
                      value={groqInput}
                      onChange={(e) => setGroqInput(e.target.value)}
                      placeholder="gsk_YourGroqAPIKey..."
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-10 text-xs text-white font-mono placeholder:text-slate-700 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showGroqKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {saveSuccess ? (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2.5 text-xs text-emerald-400 font-bold">
                  <Check className="h-4 w-4 animate-bounce" />
                  <span>Keys updated successfully!</span>
                </div>
              ) : (
                <div className="flex gap-2 justify-end border-t border-slate-800 pt-4">
                  {(localStorage.getItem('innoviast_prompt_workspace_gemini_key') || localStorage.getItem('innoviast_prompt_workspace_groq_key')) && (
                    <button
                      onClick={handleClearKeys}
                      className="rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 font-semibold px-4 py-2.5 text-xs cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Keys</span>
                    </button>
                  )}
                  <button
                    onClick={handleSaveKeys}
                    className="rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 text-xs cursor-pointer transition animate-pulse-brighten shadow-lg shadow-teal-500/10 flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
