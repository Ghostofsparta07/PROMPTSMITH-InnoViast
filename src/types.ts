export interface StructuredPrompt {
  id: string;
  title: string;
  description: string;
  category: 'development' | 'writing' | 'design' | 'debugging' | 'business' | 'other';
  role: string;
  task: string;
  context: string;
  constraints: string;
  examples: string;
  outputFormat: string;
  tone: string;
  successCriteria: string;
  negativeInstructions: string;
  updatedAt: string;
  isCustom?: boolean;
}

export interface PromptEvaluation {
  overallScore: number; // 0-100
  dimensions: {
    clarity: number; // 1-10
    completeness: number; // 1-10
    specificity: number; // 1-10
    safety: number; // 1-10
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    field: keyof StructuredPrompt | 'general';
    recommendation: string;
    beforeAfter?: { before: string; after: string };
  }[];
  verdict: string;
}

export interface SandboxMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
}

export function getApiHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const geminiKey = localStorage.getItem('innoviast_prompt_workspace_gemini_key');
    const groqKey = localStorage.getItem('innoviast_prompt_workspace_groq_key');
    if (geminiKey) headers['x-gemini-key'] = geminiKey;
    if (groqKey) headers['x-groq-key'] = groqKey;
  } catch (e) {
    console.error('Failed to read custom API keys from localStorage', e);
  }
  return headers;
}
