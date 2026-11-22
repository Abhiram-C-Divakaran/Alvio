export interface AnswerCriterion {
  label: string;
  status: 'strong' | 'partial' | 'needs-improvement';
  detail: string;
}

export interface ParsedInterviewEvaluation {
  score: number | null;
  summary: string;
  criteria: AnswerCriterion[];
  tip: string;
  nextQuestion: string;
}

function extractJsonObjectText(raw: string): string {
  const trimmed = raw.trim();
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  if (candidate.startsWith('{') && candidate.endsWith('}')) return candidate;

  // Locate the first balanced JSON object inside any surrounding prose.
  const start = candidate.indexOf('{');
  if (start === -1) throw new Error('Invalid evaluation structure');

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }
  throw new Error('Invalid evaluation structure');
}

function normalizeStatus(status: unknown): 'strong' | 'partial' | 'needs-improvement' {
  const normalized = typeof status === 'string' ? status.trim().toLowerCase() : '';
  if (normalized === 'strong' || normalized === 'good' || normalized === 'excellent') return 'strong';
  if (normalized === 'partial' || normalized === 'fair' || normalized === 'moderate') return 'partial';
  return 'needs-improvement';
}

function normalizeScore(rawScore: unknown): number | null {
  if (typeof rawScore === 'number' && Number.isFinite(rawScore) && rawScore >= 0 && rawScore <= 100) {
    return Math.round(rawScore);
  }
  if (typeof rawScore === 'string') {
    const match = /^\s*(\d+(?:\.\d+)?)\s*%?\s*$/.exec(rawScore);
    if (match) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n >= 0 && n <= 100) return Math.round(n);
    }
  }
  return null;
}

export function parseInterviewEvaluation(
  rawText: string,
  options: { isFinalQuestion?: boolean } = {}
): ParsedInterviewEvaluation {
  const jsonText = extractJsonObjectText(rawText);
  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid evaluation structure');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid evaluation structure');
  }

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  const nextQuestion = typeof parsed.nextQuestion === 'string' ? parsed.nextQuestion.trim() : '';

  if (!summary) {
    throw new Error('Invalid evaluation structure');
  }
  if (!options.isFinalQuestion && !nextQuestion) {
    throw new Error('Invalid evaluation structure');
  }

  const criteria: AnswerCriterion[] = Array.isArray(parsed.criteria)
    ? parsed.criteria
        .filter((c: any) => c && typeof c.label === 'string' && c.label.trim() && typeof c.detail === 'string' && c.detail.trim())
        .slice(0, 5)
        .map((c: any) => ({
          label: c.label.trim(),
          status: normalizeStatus(c.status),
          detail: c.detail.trim(),
        }))
    : [];

  return {
    score: normalizeScore(parsed.score),
    summary,
    criteria,
    tip: typeof parsed.tip === 'string' ? parsed.tip.trim() : '',
    nextQuestion,
  };
}
