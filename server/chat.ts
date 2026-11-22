import type { Express, Request, Response } from 'express';
import Groq from 'groq-sdk';
import { requireAuth } from './auth';
import { rateLimit, logFailure, providerCancellation } from './security';

export const DEFAULT_GROQ_CHAT_MODEL = 'openai/gpt-oss-120b';
export const RETIRED_GROQ_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
]);

export const TUTOR_MODES: Record<string, string> = {
  'Teach me': 'Use clear examples and manageable steps.',
  'Give me a hint':
    'Override the code and visualization requirements below: give one progressive hint, with no full solution, code, or revealing visualization unless explicitly requested.',
  'Quiz me':
    'Override the code and visualization requirements below: ask one question and wait for the student answer; do not reveal the answer first.',
  'Review my code': 'Review correctness, edge cases and complexity before proposing fixes.',
  'Mock Interview':
    'Act strictly as a technical interviewer and evaluator following the instructions in the user prompt.',
};

const SERVER_TUTOR_SYSTEM_PROMPT = `You are Alvio — a brilliant, friendly, and patient Data Structures & Algorithms (DSA) tutor powered by Generative AI.
Your mission is to help students truly understand CS concepts through clear explanations, analogies, and interactive 3D visualizations.

PERSONALITY:
- Warm, encouraging, and engaging. Celebrate student progress.
- Use plain English first, then introduce technical terms with definitions.
- Always ask "Does that make sense?" or offer a follow-up question at the end.

CONTENT RULES:
1. Always use Markdown for formatting. Use headers, bullet points, and code blocks liberally.
2. When explaining an algorithm or data structure, ALWAYS provide a working code example.
3. Prefer JavaScript or Python examples. Match the language the user prefers if they mention one.
4. NEVER give vague answers. Be concrete, precise, and thorough.

VISUALIZATION RULES (CRITICAL):
Whenever you explain a data structure or algorithm execution, you MUST include an interactive animated 3D visualization using this exact format:

\`\`\`animated-3d
{
  "type": "array" | "graph" | "binary-tree" | "linked-list",
  "code": "<optional: the solution code as a string>",
  "steps": [
    {
      "values": [<numbers or strings for arrays/linked-lists>],
      "highlight": [<indices or node IDs to highlight>],
      "activeLine": <1-indexed line number in code>,
      "description": "<one sentence describing this step>"
    }
  ]
}
\`\`\`

For GRAPH type, each step uses:
{ "nodes": ["A","B","C"], "edges": [["A","B"]], "highlight": ["A"], "description": "..." }

For BINARY-TREE type, each step uses:
{ "values": [50, 30, 70, 20, 40], "highlight": [0], "description": "..." }

IMPORTANT:
- Include at least 4 steps per visualization (more is better).
- "highlight" must use the SAME values as the actual data, not made-up ones.
- Steps must progress logically (e.g., a sort must actually sort).
- ONLY include ONE animated-3d block per response. Place it after the explanation.`;

const SERVER_INTERVIEW_SYSTEM_PROMPT = `You are Alvio's technical interviewer and evaluator for Data Structures & Algorithms mock interviews.
Follow the exact instructions in the interview prompt carefully:
- When asked to greet and ask a question, output only clear, concise interviewer dialogue (no visualization blocks, no solution spoilers).
- When asked to evaluate an answer in JSON format, return ONLY a single valid raw JSON object matching the requested schema, with no markdown fences, no commentary before or after the JSON, and no extra wrapper keys.
- When asked for a final interview report, return clean, evidence-based Markdown grounded strictly in the provided transcript.`;

export interface ChatMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatStreamChunk {
  choices?: Array<{
    delta?: { content?: string | null; reasoning?: string | null };
    finish_reason?: string | null;
  }>;
}

export interface ChatCompletionParams {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature: number;
  max_tokens: number;
  stream: true;
}

export type ChatStreamFactory = (
  params: ChatCompletionParams,
  options: { signal: AbortSignal; apiKey: string }
) => Promise<AsyncIterable<ChatStreamChunk>>;

export interface RegisterChatOptions {
  createStream?: ChatStreamFactory;
  getEnv?: () => NodeJS.ProcessEnv;
  rateLimitMiddleware?: ReturnType<typeof rateLimit>;
  authMiddleware?: typeof requireAuth;
}

export function resolveChatModel(env: NodeJS.ProcessEnv = process.env): string {
  const configured = typeof env.GROQ_CHAT_MODEL === 'string' ? env.GROQ_CHAT_MODEL.trim() : '';
  return configured || DEFAULT_GROQ_CHAT_MODEL;
}

export function buildChatMessages(
  messages: ChatMessageInput[],
  tutorMode?: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const userMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  if (tutorMode === 'Mock Interview') {
    return [{ role: 'system', content: SERVER_INTERVIEW_SYSTEM_PROMPT }, ...userMessages];
  }

  const tutorInstruction = typeof tutorMode === 'string' ? TUTOR_MODES[tutorMode] || '' : '';
  const systemContent =
    SERVER_TUTOR_SYSTEM_PROMPT +
    (tutorInstruction
      ? `\n\nCURRENT TUTORING MODE (takes precedence over default response formatting): ${tutorInstruction}`
      : '');

  return [{ role: 'system', content: systemContent }, ...userMessages];
}

export function classifyChatProviderError(error: any, model: string): {
  status: number;
  code: string;
  userMessage: string;
  logDetails: Record<string, string | number | boolean | undefined>;
} {
  const providerStatus = typeof error?.status === 'number' ? error.status : undefined;
  const providerCode = String(error?.error?.error?.code || error?.error?.code || error?.code || '');
  const rawMessage = String(error?.error?.error?.message || error?.message || '');
  const aborted = error?.name === 'AbortError' || /abort|timed?\s*out/i.test(rawMessage);

  const logDetails = {
    model,
    providerStatus,
    providerCode: providerCode || undefined,
  };

  if (aborted) {
    return {
      status: 504,
      code: 'AI_TIMEOUT',
      userMessage: 'The AI response timed out. Please try again.',
      logDetails,
    };
  }

  if (providerStatus === 401 || providerStatus === 403 || /invalid_api_key/i.test(providerCode)) {
    return {
      status: 502,
      code: 'AI_AUTH_ERROR',
      userMessage: 'AI service authentication failed on the server. Please check the server configuration.',
      logDetails,
    };
  }

  if (
    providerStatus === 404 ||
    /model_not_found|model_decommissioned/i.test(providerCode) ||
    /does not exist|decommissioned/i.test(rawMessage)
  ) {
    return {
      status: 502,
      code: 'AI_MODEL_UNAVAILABLE',
      userMessage: 'The configured AI model is currently unavailable. Please update the server chat model setting.',
      logDetails,
    };
  }

  if (providerStatus === 429 || /rate_limit/i.test(providerCode)) {
    return {
      status: 429,
      code: 'AI_RATE_LIMITED',
      userMessage: 'The AI provider is temporarily rate-limited. Please wait a moment and retry.',
      logDetails,
    };
  }

  return {
    status: 502,
    code: 'AI_PROVIDER_ERROR',
    userMessage: 'AI assistance is temporarily unavailable. Please try again in a moment.',
    logDetails,
  };
}

const defaultCreateStream: ChatStreamFactory = async (params, { signal, apiKey }) => {
  const groq = new Groq({ apiKey, timeout: 60000, maxRetries: 0 });
  return groq.chat.completions.create(params, { signal }) as Promise<AsyncIterable<ChatStreamChunk>>;
};

export function registerChat(app: Express, options: RegisterChatOptions = {}) {
  const createStream = options.createStream || defaultCreateStream;
  const getEnv = options.getEnv || (() => process.env);
  const auth = options.authMiddleware || requireAuth;
  const limiter = options.rateLimitMiddleware || rateLimit(25, 60000, 'chat', true);

  app.post('/api/chat', auth, limiter, async (req: Request, res: Response) => {
    const request = providerCancellation(res);
    const env = getEnv();
    const model = resolveChatModel(env);

    try {
      const { messages, tutorMode } = req.body ?? {};
      if (
        !Array.isArray(messages) ||
        messages.length < 1 ||
        messages.length > 40 ||
        messages.some(
          (m: any) =>
            !m ||
            !['user', 'assistant', 'system'].includes(m.role) ||
            typeof m.content !== 'string' ||
            m.content.length > 24000
        ) ||
        messages.reduce((n: number, m: any) => n + m.content.length, 0) > 100000
      ) {
        return res.status(400).json({ error: 'Please shorten the conversation or attachment.' });
      }

      if (
        tutorMode !== undefined &&
        (typeof tutorMode !== 'string' || !Object.hasOwn(TUTOR_MODES, tutorMode))
      ) {
        return res.status(400).json({ error: 'Choose a supported tutor mode.' });
      }

      const apiKey = typeof env.GROQ_API_KEY === 'string' ? env.GROQ_API_KEY.trim() : '';
      if (!apiKey) {
        logFailure(req, 'chat_unconfigured', { model });
        return res.status(500).json({
          error: 'AI assistance is temporarily unavailable.',
          code: 'AI_NOT_CONFIGURED',
        });
      }

      const builtMessages = buildChatMessages(messages, tutorMode);
      const isInterview = tutorMode === 'Mock Interview';

      const stream = await createStream(
        {
          model,
          messages: builtMessages,
          temperature: isInterview ? 0.3 : 0.7,
          max_tokens: 8192,
          stream: true,
        },
        { signal: request.signal, apiKey }
      );

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let fullText = '';
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }

      if (!fullText.trim()) {
        logFailure(req, 'chat_empty_response', { model });
        res.write(
          `data: ${JSON.stringify({
            error: 'The AI returned an empty response. Please retry.',
            code: 'AI_EMPTY_RESPONSE',
          })}\n\n`
        );
        res.end();
        return;
      }

      res.write(`data: ${JSON.stringify({ done: true, text: fullText })}\n\n`);
      res.end();
    } catch (error: any) {
      if (res.writableEnded || res.destroyed) return;
      const classified = classifyChatProviderError(error, model);
      logFailure(req, 'chat_failed', classified.logDetails);
      if (res.headersSent) {
        res.write(
          `data: ${JSON.stringify({
            error: 'AI assistance was interrupted. Please retry.',
            code: classified.code,
          })}\n\n`
        );
        res.end();
      } else {
        res.status(classified.status).json({ error: classified.userMessage, code: classified.code });
      }
    } finally {
      request.dispose();
    }
  });
}
