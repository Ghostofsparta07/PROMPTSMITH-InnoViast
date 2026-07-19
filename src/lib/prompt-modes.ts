export type ModeId = "development" | "writing" | "design" | "debugging" | "business";

export interface Mode {
  id: ModeId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  vibe: string;
  fieldLabels: Record<keyof PromptFields, { label: string; placeholder: string; hint?: string }>;
  presets: string[];
}

export interface PromptFields {
  role: string;
  task: string;
  context: string;
  constraints: string;
  examples: string;
  outputFormat: string;
  tone: string;
  successCriteria: string;
  negativeInstructions: string;
}

export const emptyPrompt: PromptFields = {
  role: "",
  task: "",
  context: "",
  constraints: "",
  examples: "",
  outputFormat: "",
  tone: "",
  successCriteria: "",
  negativeInstructions: "",
};

export const MODES: Record<ModeId, Mode> = {
  development: {
    id: "development",
    name: "Development",
    tagline: "// build.systems",
    description: "Phosphor terminals, code architecture, senior engineer energy.",
    icon: "▮",
    vibe: "Type like a hacker. Ship like a staff engineer.",
    fieldLabels: {
      role: { 
        label: "SYSTEM_ROLE", 
        placeholder: "senior_backend_engineer()", 
        hint: "Instruct the model on its technical role, specific technology stack, and level of experience." 
      },
      task: { 
        label: "TASK.exec", 
        placeholder: "refactor auth middleware to support JWT rotation", 
        hint: "Specify the precise coding task, optimization goal, refactoring request, or API design to execute." 
      },
      context: { 
        label: "CONTEXT.load", 
        placeholder: "Node 20, Express, PostgreSQL, existing session-based auth in ./src/auth", 
        hint: "List database schemas, existing code structures, system environment, dependencies, and baseline parameters." 
      },
      constraints: { 
        label: "CONSTRAINTS[]", 
        placeholder: "no breaking API changes; must pass existing test suite; SSR-safe", 
        hint: "Enforce strict boundaries: memory limits, execution safety, backwards compatibility, and SSR requirements." 
      },
      examples: { 
        label: "EXAMPLES.ref", 
        placeholder: "Existing pattern: `withAuth(handler)` in ./src/auth/wrap.ts",
        hint: "Include concrete input/output pairings, syntax templates, or previous code samples as a baseline."
      },
      outputFormat: { 
        label: "OUTPUT.schema", 
        placeholder: "Unified diff patch, followed by a migration checklist",
        hint: "Define the return pattern: standard OpenAPI YAML files, unified patch diffs, or structured JSON schema objects."
      },
      tone: { 
        label: "TONE.set", 
        placeholder: "Direct, no filler. Assume expert reader.",
        hint: "Define communication register: precise, technical, documentation-dense, direct, with absolutely zero conversational fluff."
      },
      successCriteria: { 
        label: "SUCCESS.eq", 
        placeholder: "All routes still authenticate; rotation window ≤ 60s; zero downtime.",
        hint: "Describe the metrics and tests the code must satisfy: complete test pass, zero locking, or high performance."
      },
      negativeInstructions: { 
        label: "NEGATIVE.excl", 
        placeholder: "Do not introduce new dependencies. Do not rewrite unrelated files.",
        hint: "Prohibit unsafe procedures, unrequested external libraries, legacy patterns, or modifying unrelated files."
      },
    },
    presets: ["Refactor legacy code", "Debug a production bug", "Design an API schema", "Write unit tests", "Optimize a slow query"],
  },
  writing: {
    id: "writing",
    name: "Writing",
    tagline: "of pen & thought",
    description: "Cream paper, warm serifs, an editor's steady margin.",
    icon: "✒",
    vibe: "Slow the sentence down. Choose every word.",
    fieldLabels: {
      role: { 
        label: "The Voice", 
        placeholder: "A patient essayist in the tradition of Joan Didion", 
        hint: "Set the voice, narrator perspective, storytelling persona, and literary influences of the writing assistant." 
      },
      task: { 
        label: "The Piece", 
        placeholder: "Write a 600-word personal essay on leaving a city you loved", 
        hint: "Detail the creative work, word counts, narrative structure, or specific prose goal to produce." 
      },
      context: { 
        label: "The Setting", 
        placeholder: "For a personal Substack. Readers know me casually. Season is late autumn.",
        hint: "Provide background setting, audience profile, intended publications, and emotional seasonality of the piece."
      },
      constraints: { 
        label: "The Rules", 
        placeholder: "600 words. Present tense. No em-dashes. Open on a sensory image.",
        hint: "Specify stylistic constraints: forbidden phrases, sentence structures, paragraph limits, or sensory starts."
      },
      examples: { 
        label: "The Precedent", 
        placeholder: "In the manner of 'Goodbye to All That' by Didion — restrained, elegiac.",
        hint: "Provide model texts, tone benchmarks, or stylistic snippets to align writing rhythms."
      },
      outputFormat: { 
        label: "The Form", 
        placeholder: "Three sections separated by ornamental breaks. No headings.",
        hint: "Specify layout requirements: ornamental dividers, bold quote structures, or raw chapter prose with no headings."
      },
      tone: { 
        label: "The Register", 
        placeholder: "Wistful but unsentimental. Dry humor allowed once.",
        hint: "Modulate the emotional resonance, narrative distance, linguistic richness, and level of humor."
      },
      successCriteria: { 
        label: "What It Must Do", 
        placeholder: "The reader should finish and want to reread the opening.",
        hint: "Identify the psychological impact or lingering emotional feeling the prose must invoke in the reader."
      },
      negativeInstructions: { 
        label: "What It Must Not", 
        placeholder: "No clichés about seasons as metaphors. No neat resolution.",
        hint: "Ban cliches, repetitive structures, LinkedIn-style pacing, or tidy happy endings."
      },
    },
    presets: ["Personal essay", "Newsletter draft", "Speech opening", "Product description", "Cover letter"],
  },
  design: {
    id: "design",
    name: "Design",
    tagline: "make it feel!!",
    description: "Coral, cyan, blueprint grids. Loud, playful, opinionated.",
    icon: "◐",
    vibe: "Sketch a whole world, not a screen.",
    fieldLabels: {
      role: { 
        label: "Who's designing?", 
        placeholder: "Art director with a background in editorial + motion", 
        hint: "Assume the perspective of an art director, UX specialist, or interactive system designer." 
      },
      task: { 
        label: "What are we making?", 
        placeholder: "Landing page for a small-batch coffee roaster in Kyoto",
        hint: "Define the visual asset to construct: page layouts, responsive buttons, bento grids, or animation cues."
      },
      context: { 
        label: "The brief", 
        placeholder: "Brand is 3 years old, wants to feel handmade but confident. Audience 25–40.",
        hint: "Share brand backstory, color philosophy, historical context, and user demographic preferences."
      },
      constraints: { 
        label: "Must-haves", 
        placeholder: "Hero image, 3 product cards, subscription CTA, mobile-first",
        hint: "Detail spacing grids (such as 8px), contrast ratios, target accessibility sizes, and dark mode rules."
      },
      examples: { 
        label: "Reference vibe", 
        placeholder: "Think Aesop meets a zine. Not Apple. Not Stripe.",
        hint: "List design reference models, mood boards, tactile visual inspirations, or specific benchmark layouts."
      },
      outputFormat: { 
        label: "Deliverable", 
        placeholder: "Section-by-section wireframe with copy, color palette, and type pairing",
        hint: "Request section-by-section mockups with styling values, typography scales, or interactive transition states."
      },
      tone: { 
        label: "Feeling", 
        placeholder: "Quiet confidence. Warm neutrals. One loud accent.",
        hint: "Choose the design mood: loud maximalist, quiet editorial, brutalist mono, or clean functionalism."
      },
      successCriteria: { 
        label: "Nailed it if…", 
        placeholder: "It feels like a place, not a page.",
        hint: "Define the visual aesthetic polish or layout logic that marks the design as premium."
      },
      negativeInstructions: { 
        label: "Don't", 
        placeholder: "No purple gradients. No generic 'trusted by' logos. No Inter.",
        hint: "Ban low-effort elements: blue/purple gradients, generic SaaS illustrations, or standard cookie-cutter layouts."
      },
    },
    presets: ["Landing page brief", "Brand mood board", "Component redesign", "Poster concept", "Onboarding flow"],
  },
  debugging: {
    id: "debugging",
    name: "Debugging",
    tagline: "TRACE // ISOLATE // KILL",
    description: "Red on graphite. Stack traces, hypotheses, ruthless bisection.",
    icon: "✕",
    vibe: "Every bug has a reason. Find it. Prove it.",
    fieldLabels: {
      role: { 
        label: "Investigator", 
        placeholder: "Principal engineer diagnosing production incidents",
        hint: "Adopt the persona of an expert SRE, cybersecurity auditor, or principal software systems investigator."
      },
      task: { 
        label: "Bug Report", 
        placeholder: "Users report 500s on checkout every ~40 requests, only on Safari iOS",
        hint: "Isolate the precise failure state: memory leaks, race conditions, edge-case crashes, or intermittent 500 errors."
      },
      context: { 
        label: "Evidence", 
        placeholder: "Sentry trace shows null in `session.user`; started after deploy 2f4a1c",
        hint: "Load Sentry traces, error log lines, browser environment details, or recent database migrations."
      },
      constraints: { 
        label: "Boundaries", 
        placeholder: "Cannot deploy hotfix without RCA; must not roll back schema",
        hint: "Specify limits on solutions: no schema overrides, read-only safe-mode execution, or no system downtime."
      },
      examples: { 
        label: "Similar past bugs", 
        placeholder: "Ref incident #1247 — cookie SameSite issue on Safari, resolved by explicit attr",
        hint: "Detail similar historical incidents, common browser quirks, or resolved bug precedents."
      },
      outputFormat: { 
        label: "Report shape", 
        placeholder: "Numbered hypotheses ranked by likelihood, with a verification step per hypothesis",
        hint: "Structure the debug report: clear hypotheses, diagnostic steps, code patches, and post-incident checklists."
      },
      tone: { 
        label: "Register", 
        placeholder: "Forensic. State assumptions explicitly. No hand-waving.",
        hint: "Maintain clinical precision, systematic skepticism, objective analysis, and absolute evidence requirements."
      },
      successCriteria: { 
        label: "Fixed when", 
        placeholder: "Root cause identified with reproducible test; regression test added",
        hint: "Determine proof of resolution: passing integration tests, clean profiling graphs, or fixed exception logs."
      },
      negativeInstructions: { 
        label: "Do not", 
        placeholder: "Do not suggest 'try turning it off and on'. No speculation without evidence.",
        hint: "Omit speculative suggestions, temporary try/catch workarounds, or blind config changes."
      },
    },
    presets: ["Production incident", "Flaky test triage", "Memory leak hunt", "Race condition", "Performance regression"],
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "Strategy · Communication · Growth",
    description: "Navy, ivory, brushed gold. Boardroom-ready, quietly confident.",
    icon: "◆",
    vibe: "Every word costs a stakeholder's minute. Spend well.",
    fieldLabels: {
      role: { 
        label: "Advisor", 
        placeholder: "Fractional COO with SaaS operating experience", 
        hint: "Adopt the posture of a fractional COO, venture partner, or executive board advisor." 
      },
      task: { 
        label: "Deliverable", 
        placeholder: "Draft a board update for Q3 covering revenue, hiring, and product risk",
        hint: "Specify the high-stakes deliverable: investor updates, GTM wedges, SWOT diagrams, or risk assessment memos."
      },
      context: { 
        label: "Situation", 
        placeholder: "Series A SaaS, 22 people, $4M ARR, hiring frozen last month",
        hint: "Detail growth rates, operational headcounts, ARR figures, cash runways, and specific client churn risks."
      },
      constraints: { 
        label: "Requirements", 
        placeholder: "Under 500 words. One page. Metrics table required. No hedging language.",
        hint: "Boundaries: concise writing limits (e.g. 500 words), mandatory charts, or strict tabular layouts."
      },
      examples: { 
        label: "Precedent", 
        placeholder: "Prior updates from Airbnb and Notion in their Series A era — direct, numbers-first",
        hint: "Reference high-growth executive decks, successful Series A letters, or elite board templates."
      },
      outputFormat: { 
        label: "Format", 
        placeholder: "Headline · TL;DR · Metrics · Risks · Asks — in that order",
        hint: "Organize into skimmable sections (e.g. Headline, TL;DR, Metric table, Risks, and asks)."
      },
      tone: { 
        label: "Voice", 
        placeholder: "Confident, calm, specific. Own bad news early.",
        hint: "Exude executive presence: transparent, quietly confident, specific, owning bad news early."
      },
      successCriteria: { 
        label: "Success looks like", 
        placeholder: "Board members can skim in 90 seconds and know what to ask about.",
        hint: "Allow busy board members to scan the update and grasp core strategic issues in under 90 seconds."
      },
      negativeInstructions: { 
        label: "Avoid", 
        placeholder: "No jargon. No 'synergy', 'leverage', 'unlock'. No vanity metrics.",
        hint: "Exclude corporate speak: buzzwords (synergize, leverage, unlock), vanity metrics, or defensive hedging."
      },
    },
    presets: ["Board update", "Pitch deck outline", "Customer email", "Strategic memo", "Hiring rubric"],
  },
};

export const MODE_ORDER: ModeId[] = ["development", "writing", "design", "debugging", "business"];

export function assemblePrompt(fields: PromptFields, mode: ModeId): string {
  const m = MODES[mode];
  const parts: string[] = [];
  const line = (label: string, value: string) => {
    if (value && value.trim()) parts.push(`## ${label}\n${value.trim()}`);
  };
  parts.push(`# Prompt — ${m.name} mode\n`);
  line("Role", fields.role);
  line("Task", fields.task);
  line("Context", fields.context);
  line("Constraints", fields.constraints);
  line("Examples / References", fields.examples);
  line("Output Format", fields.outputFormat);
  line("Tone & Style", fields.tone);
  line("Success Criteria", fields.successCriteria);
  line("Do NOT", fields.negativeInstructions);
  return parts.join("\n\n");
}
