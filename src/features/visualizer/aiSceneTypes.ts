export interface AIElementUpdate {
  primitiveId: string;
  elementId: string;
  state: 'idle' | 'active' | 'comparing' | 'visited' | 'rejected' | 'found' | 'swapping';
  pointerLabels: string[];
  valueChange: { from: any; to: any } | null;
  changes?: Record<string, any>;
  remove?: boolean;
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
  type: 'array' | 'linkedlist' | 'tree' | 'graph' | 'stack' | 'queue' | 'hashmap' | 'matrix' | 'knapsack';
  initialElements: any[];
  nodes?: any[];
  edges?: any[];
  items?: any[];
  cells?: any[];
  directed?: boolean;
  head?: string | number | null;
  root?: string | number | null;
  rows?: number;
  cols?: number;
  capacity?: number;
}

export interface LLMResponse {
  problem: { title: string; difficulty: string; statement: string; constraints: string[] };
  approach: { name: string; dataStructuresUsed: string[]; timeComplexity: string; spaceComplexity: string; whyThisApproach: string };
  code: { language: string; lines: { line: number; text: string }[] };
  scene: { primitives: AIPrimitive[] };
  steps: AIStep[];
  summary: { narration: string; keyTakeaway: string };
}

