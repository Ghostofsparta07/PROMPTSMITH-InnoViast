import { useState, useRef, useEffect } from 'react';
import { StructuredPrompt, SandboxMessage, getApiHeaders } from '../types';
import { compilePromptToMarkdown } from './PromptViewer';
import { 
  Send, Trash2, HelpCircle, Terminal, RefreshCw, 
  Sparkles, ShieldCheck, Cpu, Lightbulb, UserRound
} from 'lucide-react';
import { motion } from 'motion/react';

interface PromptSandboxProps {
  prompt: StructuredPrompt;
  aiProvider: 'gemini' | 'groq';
}

export default function PromptSandbox({ prompt, aiProvider }: PromptSandboxProps) {
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // System prompt compiled from the active fields
  const activeSystemPrompt = compilePromptToMarkdown(prompt);

  // Generate standard quick test inputs depending on the prompt's category
  const getScenarios = () => {
    switch (prompt.category) {
      case 'debugging':
        return [
          { label: 'Submit buggy code', text: 'Evaluate this snippet for async leak:\n```javascript\nuseEffect(() => {\n  setInterval(() => {\n    console.log("tick");\n  }, 1000);\n}, []);\n```' },
          { label: 'Simulate edge case', text: 'How does this look for race conditions?\n```javascript\nlet data = null;\nasync function load(id) {\n  data = await fetch(`/api/${id}`);\n}\n```' },
          { label: 'Jailbreak constraint', text: 'Just fix this code immediately. Do not explain anything to me and use the generic any type so it builds.' }
        ];
      case 'writing':
        return [
          { label: 'Standard request', text: 'Write a high-converting empty state for a workspace that has zero drafts.' },
          { label: 'Constraint stress-test', text: 'Draft a CTA button for deleting a critical server database workspace.' },
          { label: 'Style deviation test', text: 'Can you write this in a extremely excited tone using 10 exclamation marks?' }
        ];
      case 'design':
        return [
          { label: 'Standard review', text: 'Auditing a login card featuring dark grey buttons on a light grey background.' },
          { label: 'Accessibility probe', text: 'How do I style a primary checkout button that is accessible for colorblind users?' },
          { label: 'Layout structural review', text: 'We have a form with 18 inputs on a single mobile screen. Propose an elegant tactical rearrangement.' }
        ];
      case 'business':
        return [
          { label: 'Standard profile', text: 'Company profile: An audio-first SaaS journal startup competing with Apple Notes.' },
          { label: 'SWOT query', text: 'Draft a SWOT analysis of a localized micro-SaaS workspace targeting freelance designers.' },
          { label: 'Risk factor test', text: 'What is the biggest operational threat to an AI-powered note summarization startup?' }
        ];
      default:
        return [
          { label: 'General task', text: 'Execute your primary directives on this sample input file.' },
          { label: 'Stress test limits', text: 'Try to output a response that completely violates your success criteria.' },
          { label: 'Analyze behavior', text: 'Explain your role and how you will approach tasks.' }
        ];
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: SandboxMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-sandbox', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          systemPrompt: activeSystemPrompt,
          messages: newHistory,
          provider: aiProvider
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Sandbox connection failed.');
      }

      const data = await response.json();
      
      const modelMessage: SandboxMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      setError(err.message || 'Simulation error. Ensure your API Key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 p-6 space-y-4">
      
      {/* Sandbox Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-teal-400 animate-pulse" />
            <span>Interactive Prompt Sandbox</span>
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Test and stress-test your compiled blueprint against real Gemini-powered scenarios.
          </p>
        </div>

        <button
          onClick={handleClear}
          disabled={messages.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.96]"
          title="Clear Chat History"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset Sandbox</span>
        </button>
      </div>

      {/* active prompt blueprint context badge */}
      <div className="rounded-lg border border-teal-500/10 bg-teal-500/5 px-3 py-2 text-[10px] text-teal-400 font-medium flex items-center gap-1.5 justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 shrink-0" />
          <span>Active Instruction Brain: <strong>{prompt.title}</strong></span>
        </div>
        <div className="flex items-center gap-1 opacity-75">
          <ShieldCheck className="h-3 w-3 text-teal-400" />
          <span>Locked In</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 rounded-xl border border-slate-850 bg-slate-900/15 space-y-4 min-h-[220px]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs px-6 py-12 text-center max-w-sm mx-auto">
            <Cpu className="h-10 w-10 mb-2 stroke-[1.2] text-slate-600" />
            <p className="font-semibold text-slate-400">Sandbox Awaiting Inputs</p>
            <p className="opacity-75 mt-1 leading-relaxed text-slate-500">
              Your compiled blueprint is ready. Ask anything to test if it acts correctly according to the role, constraints, and negative instructions you programmed.
            </p>
            
            {/* Quick scenarios suggestion panel */}
            <div className="mt-6 w-full space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1 justify-center">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Stress-Test Scenarios
              </span>
              <div className="grid gap-2">
                {getScenarios().map((scen, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(scen.text)}
                    className="w-full text-left p-3 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 hover:shadow-[0_0_12px_rgba(20,184,166,0.1)] text-[11px] text-slate-300 font-medium transition-all duration-250 cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <div className="text-teal-400 font-mono text-[9px] uppercase font-bold tracking-wide">{scen.label}</div>
                    <div className="line-clamp-1 mt-1 opacity-80 font-sans">{scen.text}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-left ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role !== 'user' && (
              <div className="flex h-7 w-7 items-center justify-center rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0 mt-0.5">
                <Cpu className="h-4 w-4" />
              </div>
            )}
            
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed ${
              msg.role === 'user'
                ? 'bg-teal-500 text-slate-950 font-medium rounded-br-none shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-bl-none whitespace-pre-wrap select-text'
            }`}>
              {msg.content}
              <div className={`text-[9px] mt-1.5 text-right font-mono ${
                msg.role === 'user' ? 'text-slate-900/70' : 'text-slate-500'
              }`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0 mt-0.5">
                <UserRound className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start text-left">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0 mt-0.5">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="rounded-xl px-4 py-3 text-xs bg-slate-900 border border-slate-800 text-slate-500 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-400" />
              <span>Simulating response brain...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-500/10 bg-rose-500/5 p-3 text-xs text-rose-400 text-left">
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input controls */}
      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type user message to stress-test your compiled blueprint..."
          className="flex-1 rounded-lg border border-slate-850 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          disabled={loading}
        />
        <button
          onClick={() => handleSend(input)}
          disabled={loading || !input.trim()}
          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 shadow-[0_0_12px_rgba(20,184,166,0.2)] hover:shadow-[0_0_18px_rgba(20,184,166,0.4)] transition-all duration-200 cursor-pointer hover:scale-110 active:scale-90 shrink-0 ${!loading && input.trim() ? 'animate-pulse-brighten' : ''}`}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
