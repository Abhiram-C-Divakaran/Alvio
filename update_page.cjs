const fs = require('fs');
let content = fs.readFileSync('src/features/visualizer/AIVisualizerPage.tsx', 'utf8');

// Replace Interfaces
const oldInterfaces = `interface TraceStep {
  step: number;
  line: number;
  description: string;
  narration?: string;
  cameraPosition?: [number, number, number];
  dataState: any;
}

interface LLMResponse {
  language: string;
  dataStructureType: string;
  code: string;
  trace: TraceStep[];
}`;

const newInterfaces = `export interface AIElementUpdate {
  primitiveId: string;
  elementId: string;
  state: 'idle' | 'active' | 'comparing' | 'visited' | 'rejected' | 'found' | 'swapping';
  pointerLabels: string[];
  valueChange: { from: any; to: any } | null;
}

export interface AIStep {
  stepIndex: number;
  title: string;
  codeLineActive: number | number[];
  elementUpdates: AIElementUpdate[];
  cameraFocus: string;
  narration: { text: string; estimatedDurationSeconds: number };
}

export interface AIPrimitive {
  id: string;
  type: 'array' | 'linkedlist' | 'tree' | 'graph' | 'stack' | 'queue' | 'hashmap' | 'matrix';
  initialElements: any[];
}

export interface LLMResponse {
  problem: { title: string; difficulty: string; statement: string; constraints: string[] };
  approach: { name: string; dataStructuresUsed: string[]; timeComplexity: string; spaceComplexity: string; whyThisApproach: string };
  code: { language: string; lines: { line: number; text: string }[] };
  scene: { primitives: AIPrimitive[] };
  steps: AIStep[];
  summary: { narration: string; keyTakeaway: string };
}`;

content = content.replace(oldInterfaces, newInterfaces);

// Add getComputedPrimitives
const reducerInsert = `
  const getComputedPrimitives = () => {
    if (!llmResult) return [];
    // Deep clone initial primitives
    const computedPrimitives = JSON.parse(JSON.stringify(llmResult.scene.primitives));
    for (let i = 0; i <= currentStepIdx; i++) {
      const step = llmResult.steps[i];
      if (!step || !step.elementUpdates) continue;
      for (const update of step.elementUpdates) {
        const prim = computedPrimitives.find(p => p.id === update.primitiveId);
        if (prim) {
          let el = prim.initialElements.find(e => e.id === update.elementId);
          if (!el) {
            el = { id: update.elementId };
            prim.initialElements.push(el);
          }
          el.state = update.state;
          el.pointerLabels = update.pointerLabels || [];
          if (update.valueChange !== null) {
            el.value = update.valueChange.to;
          }
        }
      }
    }
    return computedPrimitives;
  };
`;

content = content.replace(
  'const timelineRef = useRef<HTMLDivElement>(null);\n  const codeRef = useRef<HTMLPreElement>(null);',
  `const timelineRef = useRef<HTMLDivElement>(null);\n  const codeRef = useRef<HTMLPreElement>(null);\n${reducerInsert}`
);

// Update TTS references
content = content.replace(/llmResult\.trace\[currentStepIdx\]/g, 'llmResult.steps[currentStepIdx]');
content = content.replace(/llmResult\.trace\.length/g, 'llmResult.steps.length');
content = content.replace(/currentStep\.narration \|\| currentStep\.description \|\| "Next step\."/g, 'currentStep.narration?.text || currentStep.title || "Next step."');
content = content.replace(/const activeLine = llmResult\.trace\[currentStepIdx\]\?\.line;/g, 'const activeLine = Array.isArray(llmResult.steps[currentStepIdx]?.codeLineActive) ? llmResult.steps[currentStepIdx]?.codeLineActive[0] : llmResult.steps[currentStepIdx]?.codeLineActive;');
content = content.replace(/llmResult\?\.trace/g, 'llmResult?.steps');
content = content.replace(/const currentStep = llmResult\?\.trace\[currentStepIdx\];/g, 'const currentStep = llmResult?.steps[currentStepIdx];');
content = content.replace(/llmResult\.language/g, 'llmResult.code?.language');

// Fix code rendering
const oldCodeRender = `llmResult.code?.split('\\n').map((line, idx) => {
                    const isCurrentLine = currentStep?.line === idx + 1;`;

const newCodeRender = `llmResult.code?.lines?.map((lineObj) => {
                    const idx = lineObj.line - 1;
                    const line = lineObj.text;
                    const activeLines = Array.isArray(currentStep?.codeLineActive) ? currentStep.codeLineActive : [currentStep?.codeLineActive];
                    const isCurrentLine = activeLines.includes(idx + 1);`;

content = content.replace(oldCodeRender, newCodeRender);

// Timeline items rendering
content = content.replace(/llmResult\.trace\.map\(\(step, idx\)/g, 'llmResult.steps.map((step, idx)');
content = content.replace(/step\.step/g, 'step.stepIndex');
content = content.replace(/step\.description/g, 'step.title');

// Pass computed primitives to Engine
content = content.replace(
  /<AIVisualizerEngine\s*\n\s*dataState=\{currentStep\?\.dataState\}\s*\n\s*cameraPosition=\{currentStep\?\.cameraPosition\}\s*\n\s*\/>/,
  `<AIVisualizerEngine\n                    primitives={getComputedPrimitives()}\n                    cameraFocus={currentStep?.cameraFocus}\n                  />`
);
content = content.replace(
  /<AIVisualizerEngine dataState=\{currentStep\?\.dataState\} cameraPosition=\{currentStep\?\.cameraPosition\} \/>/,
  `<AIVisualizerEngine primitives={getComputedPrimitives()} cameraFocus={currentStep?.cameraFocus} />`
);

// Narration text display in the UI (not TTS)
content = content.replace(
  /\{currentStep\?\.narration \|\| currentStep\?\.description\}/,
  '{currentStep?.narration?.text || currentStep?.title}'
);

// We also need to add Problem UI components since we have a new schema structure
const problemUI = `
            <div className="flex-shrink-0 bg-[#111827] rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex flex-col md:flex-row gap-6 items-stretch">
                <div className="flex-1 flex flex-col gap-3">
                  <h2 className="text-[18px] font-semibold text-white tracking-tight flex items-center gap-2">
                    <Box className="w-5 h-5 text-[#8B5CF6]" /> Define Problem
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                      type="text"
                      value={problemText}
                      onChange={(e) => setProblemText(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') handleGenerate(); }}
                      placeholder="e.g., Explain the Two Sum algorithm..."
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white placeholder-white/40 text-sm outline-none focus:border-[#8B5CF6]/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
`;

// Replace the old Define Problem block to also show the LLM generated Problem statement and approach
const newProblemUI = \`
            <div className="flex-shrink-0 bg-[#111827] rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex flex-col md:flex-row gap-6 items-stretch">
                <div className="flex-1 flex flex-col gap-3">
                  <h2 className="text-[18px] font-semibold text-white tracking-tight flex items-center gap-2">
                    <Box className="w-5 h-5 text-[#8B5CF6]" /> \${llmResult.problem.title} 
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#3B82F6]/20 text-[#3B82F6] uppercase border border-[#3B82F6]/30">
                      \${llmResult.problem.difficulty}
                    </span>
                  </h2>
                  <p className="text-[13px] text-white/70 leading-relaxed">\${llmResult.problem.statement}</p>
                </div>
                <div className="w-px bg-white/10 hidden md:block" />
                <div className="flex-1 flex flex-col gap-3">
                  <h2 className="text-[18px] font-semibold text-white tracking-tight flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#c026d3]" /> Approach: \${llmResult.approach.name}
                  </h2>
                  <p className="text-[13px] text-white/70 leading-relaxed">\${llmResult.approach.whyThisApproach}</p>
                  <div className="flex gap-2 text-[11px] font-mono mt-1">
                    <span className="bg-white/5 px-2 py-1 rounded text-white/60">⏱️ \${llmResult.approach.timeComplexity}</span>
                    <span className="bg-white/5 px-2 py-1 rounded text-white/60">💾 \${llmResult.approach.spaceComplexity}</span>
                  </div>
                </div>
              </div>
            </div>
\`;

content = content.replace(/<div className="flex-shrink-0 bg-\[#111827\] rounded-\[18px\] border border-white\/\[0\.08\] shadow-\[0_8px_32px_rgba\(0,0,0,0\.4\)\] p-6 flex flex-col gap-4 relative overflow-hidden group">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newProblemUI);

fs.writeFileSync('src/features/visualizer/AIVisualizerPage.tsx', content);
console.log("Updated AIVisualizerPage.tsx");
