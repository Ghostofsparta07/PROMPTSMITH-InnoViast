import React, { useState, useRef, ChangeEvent } from 'react';
import { StructuredPrompt } from '../types';
import { 
  Search, Plus, Trash2, FolderPlus, Download, Upload, RefreshCw, 
  Code, Eye, PenTool, Bug, Briefcase, FileText, Check, AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface PromptListProps {
  prompts: StructuredPrompt[];
  activePromptId: string | null;
  onSelectPrompt: (id: string) => void;
  onAddPrompt: (prompt: StructuredPrompt) => void;
  onDeletePrompt: (id: string) => void;
  onResetLibrary: () => void;
}

export default function PromptList({
  prompts,
  activePromptId,
  onSelectPrompt,
  onAddPrompt,
  onDeletePrompt,
  onResetLibrary,
}: PromptListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category mapping for visual tags
  const categories = [
    { value: 'all', label: 'All Fields' },
    { value: 'development', label: 'Development', icon: Code, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/20' },
    { value: 'debugging', label: 'Debugging', icon: Bug, color: 'text-rose-400 bg-rose-950/40 border-rose-500/20' },
    { value: 'writing', label: 'Writing', icon: FileText, color: 'text-amber-400 bg-amber-950/40 border-amber-500/20' },
    { value: 'design', label: 'Design', icon: PenTool, color: 'text-teal-400 bg-teal-950/40 border-teal-500/20' },
    { value: 'business', label: 'Business', icon: Briefcase, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20' },
    { value: 'other', label: 'Other', icon: Eye, color: 'text-slate-400 bg-slate-950/40 border-slate-500/20' },
  ];

  // Filter prompts
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.task.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle Export of prompt library
  const handleExportLibrary = () => {
    try {
      const dataStr = JSON.stringify(prompts, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'prompt_engineering_library_export.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  // Handle Import of prompt library
  const handleImportLibrary = (event: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          let importedCount = 0;
          importedData.forEach((item: any) => {
            // Validate minimal structured prompt structure
            if (item.title && item.task) {
              const validatedPrompt: StructuredPrompt = {
                id: item.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                title: item.title,
                description: item.description || 'Imported structured prompt blueprint.',
                category: ['development', 'writing', 'design', 'debugging', 'business', 'other'].includes(item.category) 
                  ? item.category 
                  : 'other',
                role: item.role || '',
                task: item.task,
                context: item.context || '',
                constraints: item.constraints || '',
                examples: item.examples || '',
                outputFormat: item.outputFormat || '',
                tone: item.tone || '',
                successCriteria: item.successCriteria || '',
                negativeInstructions: item.negativeInstructions || '',
                updatedAt: new Date().toISOString(),
                isCustom: true
              };
              onAddPrompt(validatedPrompt);
              importedCount++;
            }
          });
          
          if (importedCount > 0) {
            setImportStatus({ type: 'success', message: `Imported ${importedCount} prompts successfully!` });
            setTimeout(() => setImportStatus(null), 4000);
          } else {
            setImportStatus({ type: 'error', message: 'No valid prompt structures found in JSON.' });
          }
        } else {
          setImportStatus({ type: 'error', message: 'Imported file must be a JSON array of prompts.' });
        }
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Failed to parse JSON file.' });
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    fileReader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
    }
  };

  const createBlankPrompt = () => {
    const newBlank: StructuredPrompt = {
      id: `custom-${Date.now()}`,
      title: 'Untitled Prompt Template',
      description: 'A custom-built prompt blueprint.',
      category: 'other',
      role: '',
      task: '',
      context: '',
      constraints: '',
      examples: '',
      outputFormat: '',
      tone: '',
      successCriteria: '',
      negativeInstructions: '',
      updatedAt: new Date().toISOString(),
      isCustom: true,
    };
    onAddPrompt(newBlank);
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 border-r border-slate-800">
      {/* Primary Actions & Search */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/20">
        <div className="flex gap-2">
          <button
            onClick={createBlankPrompt}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 font-extrabold py-2.5 px-3 text-xs transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_20px_rgba(20,184,166,0.35)] hover:scale-[1.03] active:scale-[0.97] animate-pulse-brighten"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create Blueprint</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON Prompt"
            className="flex items-center justify-center p-2.5 rounded-lg border border-slate-850 bg-slate-900/60 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all duration-200 cursor-pointer hover:scale-[1.08] active:scale-[0.92] shadow-sm"
          >
            <Upload className="h-4 w-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportLibrary}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleExportLibrary}
            title="Export Prompt Library"
            className="flex items-center justify-center p-2.5 rounded-lg border border-slate-850 bg-slate-900/60 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all duration-200 cursor-pointer hover:scale-[1.08] active:scale-[0.92] shadow-sm"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts & roles..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all"
          />
        </div>
      </div>

      {/* Categories Filter list */}
      <div className="px-4 py-3 border-b border-slate-800 flex gap-2 overflow-x-auto scrollbar-none shrink-0 bg-slate-950/40">
        {categories.map((cat) => {
          const count = cat.value === 'all' 
          ? prompts.length 
          : prompts.filter((p) => p.category === cat.value).length;

          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border hover:scale-[1.05] active:scale-[0.95] ${
                selectedCategory === cat.value
                  ? 'bg-teal-500/15 border-teal-500 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.15)]'
                  : 'bg-slate-900/40 border-slate-850/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {cat.icon && <cat.icon className="h-3 w-3" />}
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Notifications banner */}
      {importStatus && (
        <div className={`p-3 mx-4 mt-3 rounded-lg border flex gap-2 text-xs ${
          importStatus.type === 'success' 
            ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {importStatus.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Main List view */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredPrompts.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs px-4 text-center">
            <Search className="h-8 w-8 mb-2 stroke-[1.5]" />
            <p className="font-semibold">No prompt templates found</p>
            <p className="opacity-75 mt-1">Try widening your filters or create a new template from scratch.</p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => {
            const catInfo = categories.find((c) => c.value === prompt.category) || categories[categories.length - 1];
            const CatIcon = catInfo.icon;
            const isActive = prompt.id === activePromptId;

             return (
              <div
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt.id)}
                className={`group relative rounded-xl border p-3.5 flex flex-col gap-2.5 transition-all duration-300 text-left cursor-pointer select-none hover:scale-[1.02] active:scale-[0.99] ${
                  isActive
                    ? 'bg-slate-900 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.12)]'
                    : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/60 hover:border-slate-750 hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start">
                  {/* Category Tag */}
                  <div className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] border font-mono font-bold ${catInfo.color}`}>
                    <CatIcon className="h-2.5 w-2.5" />
                    <span className="capitalize">{prompt.category}</span>
                  </div>

                  {/* Actions (Delete only for user created / custom prompts) */}
                  {prompt.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePrompt(prompt.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-90"
                      title="Delete Prompt Blueprint"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white tracking-tight line-clamp-1 leading-snug group-hover:text-teal-400 transition-colors duration-200">
                    {prompt.title || 'Untitled Blueprint'}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {prompt.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
                  <span>{prompt.isCustom ? 'Custom Blueprint' : 'Preloaded Template'}</span>
                  <span>{new Date(prompt.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer controls: Reset defaults */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 text-xs font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_12px_rgba(245,158,11,0.08)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Restore Factory Library</span>
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-amber-500 text-center leading-relaxed">
              Are you sure? This will delete all custom blueprints and revert the workspace to factory presets.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onResetLibrary();
                  setShowConfirmReset(false);
                }}
                className="flex-1 bg-amber-500/15 border border-amber-500/35 text-amber-400 hover:bg-amber-500/25 py-2 px-2 rounded text-[10px] font-bold transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              >
                Yes, Restore
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white py-2 px-2 rounded text-[10px] font-bold transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
