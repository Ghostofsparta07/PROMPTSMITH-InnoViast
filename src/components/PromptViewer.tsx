import { useState } from 'react';
import { StructuredPrompt } from '../types';
import { Copy, Check, FileDown, Eye, FileText, ClipboardList } from 'lucide-react';

interface PromptViewerProps {
  prompt: StructuredPrompt;
}

export function compilePromptToMarkdown(p: StructuredPrompt): string {
  const parts = [];

  if (p.role) {
    parts.push(`## 🎭 ROLE & PERSONA\n${p.role.trim()}`);
  }
  if (p.task) {
    parts.push(`## 🎯 PRIMARY DIRECTIVE & TASK\n${p.task.trim()}`);
  }
  if (p.context) {
    parts.push(`## 🌐 CONTEXT & BACKGROUND STAKES\n${p.context.trim()}`);
  }
  if (p.constraints) {
    parts.push(`## 🛡️ EXPLICIT CONSTRAINTS & LIMITS\n${p.constraints.trim()}`);
  }
  if (p.examples) {
    parts.push(`## 🧬 FEW-SHOT INPUT/OUTPUT EXAMPLES\n${p.examples.trim()}`);
  }
  if (p.outputFormat) {
    parts.push(`## 🏗️ OUTPUT STRUCTURE & FORMATTING\n${p.outputFormat.trim()}`);
  }
  if (p.tone) {
    parts.push(`## 🗣️ STYLE, TONE & BRAND VOICE\n${p.tone.trim()}`);
  }
  if (p.successCriteria) {
    parts.push(`## 🏅 SUCCESS BENCHMARKS\n${p.successCriteria.trim()}`);
  }
  if (p.negativeInstructions) {
    parts.push(`## ⚠️ CRITICAL SAFETY & NEGATIVE INSTRUCTIONS\n${p.negativeInstructions.trim()}`);
  }

  return parts.join('\n\n');
}

export default function PromptViewer({ prompt }: PromptViewerProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'compiled' | 'segments'>('compiled');

  const compiledMarkdown = compilePromptToMarkdown(prompt);
  const wordCount = compiledMarkdown.split(/\s+/).filter(Boolean).length;
  const charCount = compiledMarkdown.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    try {
      const element = document.createElement('a');
      const file = new Blob([compiledMarkdown], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `${prompt.title.toLowerCase().replace(/\s+/g, '_')}_blueprint.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      console.error('Failed to download markdown', e);
    }
  };

  // List of fields to display in individual segmented tabs
  const displayFields = [
    { label: 'Role Persona', val: prompt.role, emoji: '🎭' },
    { label: 'Primary Task', val: prompt.task, emoji: '🎯' },
    { label: 'Context', val: prompt.context, emoji: '🌐' },
    { label: 'Constraints', val: prompt.constraints, emoji: '🛡️' },
    { label: 'Examples', val: prompt.examples, emoji: '🧬' },
    { label: 'Output Format', val: prompt.outputFormat, emoji: '🏗️' },
    { label: 'Tone', val: prompt.tone, emoji: '🗣️' },
    { label: 'Success Criteria', val: prompt.successCriteria, emoji: '🏅' },
    { label: 'Negative Instructions', val: prompt.negativeInstructions, emoji: '⚠️' }
  ];

  return (
    <div className="flex h-full flex-col bg-slate-950 p-6 space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('compiled')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.96] ${
              viewMode === 'compiled'
                ? 'bg-teal-500/15 border-teal-500 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.15)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Compiled Markdown</span>
          </button>
          
          <button
            onClick={() => setViewMode('segments')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer hover:scale-[1.04] active:scale-[0.96] ${
              viewMode === 'segments'
                ? 'bg-teal-500/15 border-teal-500 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.15)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Structured Blocks</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-750 transition-all duration-200 cursor-pointer hover:scale-[1.05] active:scale-[0.95]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5 text-teal-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            title="Download prompt as .md file"
            className="flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-750 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-90"
          >
            <FileDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main view container */}
      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {viewMode === 'compiled' ? (
          /* Compiled Markdown view */
          <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-5 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap text-left h-full max-h-[60vh]">
            {compiledMarkdown ? (
              compiledMarkdown
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 font-sans p-6 text-center">
                <Eye className="h-10 w-10 mb-2 stroke-[1.5]" />
                <p className="font-semibold text-slate-400 text-sm">Preview Empty</p>
                <p className="text-xs mt-1 text-slate-500 max-w-xs">Start filling fields in the editor workspace to generate the fully structured prompt blueprint.</p>
              </div>
            )}
          </div>
        ) : (
          /* Structured blocks segment layout */
          <div className="space-y-4">
            {displayFields.map((field, idx) => (
              <div key={idx} className="rounded-xl border border-slate-850 bg-slate-900/30 p-4 text-left">
                <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2 mb-2">
                  <span className="text-xs">{field.emoji}</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">{field.label}</h4>
                </div>
                {field.val ? (
                  <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">{field.val.trim()}</p>
                ) : (
                  <p className="text-xs text-slate-600 italic font-sans">Field remains empty. This section is omitted from the compiled prompt.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom telemetry indicators */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-[10px] text-slate-500 font-mono shrink-0">
        <span>Structure: {displayFields.filter(f => f.val?.trim()).length} / 9 blocks active</span>
        <div className="flex gap-3">
          <span>Words: {wordCount}</span>
          <span>Chars: {charCount}</span>
        </div>
      </div>
    </div>
  );
}
