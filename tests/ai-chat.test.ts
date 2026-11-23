import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer } from 'node:http';
import {
  DEFAULT_GROQ_CHAT_MODEL,
  RETIRED_GROQ_MODELS,
  resolveChatModel,
  buildChatMessages,
  classifyChatProviderError,
  registerChat,
  type ChatCompletionParams,
} from '../server/chat';
import { parseInterviewEvaluation } from '../src/features/ai-tutor/interviewParser';
import {
  DEFAULT_GROQ_VISUALIZER_MODEL,
  resolveVisualizerModel,
  registerVisualizer,
  type VisualizerCompletionParams,
} from '../server/visualizer';
import { example as visualizerExample } from '../src/features/ai-visualizer/example';

async function withMockChatServer(
  options: Parameters<typeof registerChat>[1],
  fn: (origin: string) => Promise<void>
) {
  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerChat(app, {
    authMiddleware: (req, _res, next) => {
      req.userId = 1;
      req.requestId = 'test-req';
      next();
    },
    rateLimitMiddleware: (_req, _res, next) => next(),
    ...options,
  });

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as { port: number };
  const origin = `http://127.0.0.1:${port}`;
  try {
    await fn(origin);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test('chat model defaults to supported openai/gpt-oss-120b and supports GROQ_CHAT_MODEL override', () => {
  assert.equal(DEFAULT_GROQ_CHAT_MODEL, 'openai/gpt-oss-120b');
  assert.equal(RETIRED_GROQ_MODELS.has(DEFAULT_GROQ_CHAT_MODEL), false);
  assert.equal(RETIRED_GROQ_MODELS.has('llama-3.3-70b-versatile'), true);
  assert.equal(resolveChatModel({}), 'openai/gpt-oss-120b');
  assert.equal(resolveChatModel({ GROQ_CHAT_MODEL: '   ' }), 'openai/gpt-oss-120b');
  assert.equal(
    resolveChatModel({ GROQ_CHAT_MODEL: '  openai/gpt-oss-20b  ' }),
    'openai/gpt-oss-20b'
  );
});

test('buildChatMessages isolates Mock Interview prompt and filters client system messages', () => {
  const interviewMsgs = buildChatMessages(
    [
      { role: 'system', content: 'client injected system prompt' },
      { role: 'user', content: 'Begin the interview.' },
    ],
    'Mock Interview'
  );
  assert.equal(interviewMsgs.length, 2);
  assert.equal(interviewMsgs[0].role, 'system');
  assert.match(interviewMsgs[0].content, /technical interviewer/i);
  assert.doesNotMatch(interviewMsgs[0].content, /animated-3d/);
  assert.equal(interviewMsgs[1].content, 'Begin the interview.');

  const hintMsgs = buildChatMessages(
    [{ role: 'user', content: 'How do I reverse a linked list?' }],
    'Give me a hint'
  );
  assert.match(hintMsgs[0].content, /give one progressive hint/i);
});

test('/api/chat streams SSE deltas using configured model and ignores reasoning-only chunks', async () => {
  let captured: ChatCompletionParams | null = null;
  await withMockChatServer(
    {
      getEnv: () => ({ GROQ_API_KEY: 'test-key-not-real', GROQ_CHAT_MODEL: 'openai/gpt-oss-120b' }),
      createStream: async (params) => {
        captured = params;
        return (async function* () {
          yield { choices: [{ delta: { reasoning: 'internal reasoning only' } }] };
          yield { choices: [{ delta: { content: 'A stack uses ' } }] };
          yield { choices: [{ delta: { content: 'LIFO order.' } }] };
        })();
      },
    },
    async (origin) => {
      const res = await fetch(origin + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorMode: 'Teach me',
          messages: [{ role: 'user', content: 'Explain a stack.' }],
        }),
      });
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type') || '', /text\/event-stream/);
      const body = await res.text();
      assert.match(body, /A stack uses /);
      assert.match(body, /LIFO order\./);
      assert.match(body, /"done":true/);
      assert.doesNotMatch(body, /internal reasoning only/);
      assert.equal(captured?.model, 'openai/gpt-oss-120b');
    }
  );
});

test('/api/chat emits explicit SSE error when model returns empty content', async () => {
  await withMockChatServer(
    {
      getEnv: () => ({ GROQ_API_KEY: 'test-key-not-real' }),
      createStream: async () =>
        (async function* () {
          yield { choices: [{ delta: { reasoning: 'spent all tokens thinking' } }] };
        })(),
    },
    async (origin) => {
      const res = await fetch(origin + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorMode: 'Teach me',
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.text();
      assert.match(body, /AI_EMPTY_RESPONSE/);
      assert.match(body, /empty response/i);
    }
  );
});

test('/api/chat maps provider errors safely without leaking API keys', async () => {
  const retiredErr = Object.assign(new Error('model not found'), {
    status: 404,
    error: { error: { code: 'model_not_found', message: 'The model does not exist.' } },
  });
  const classified404 = classifyChatProviderError(retiredErr, 'llama-3.3-70b-versatile');
  assert.equal(classified404.status, 502);
  assert.equal(classified404.code, 'AI_MODEL_UNAVAILABLE');

  const rateLimitErr = Object.assign(new Error('too many requests'), { status: 429 });
  assert.equal(classifyChatProviderError(rateLimitErr, 'openai/gpt-oss-120b').status, 429);

  await withMockChatServer(
    {
      getEnv: () => ({ GROQ_API_KEY: 'gsk_super_secret_should_never_leak' }),
      createStream: async () => {
        throw retiredErr;
      },
    },
    async (origin) => {
      const res = await fetch(origin + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorMode: 'Mock Interview',
          messages: [{ role: 'user', content: 'Begin the interview.' }],
        }),
      });
      assert.equal(res.status, 502);
      const text = await res.text();
      assert.doesNotMatch(text, /gsk_super_secret/);
      assert.match(text, /AI_MODEL_UNAVAILABLE/);
    }
  );
});

test('/api/chat handles mid-stream failure with SSE error frame', async () => {
  await withMockChatServer(
    {
      getEnv: () => ({ GROQ_API_KEY: 'test-key-not-real' }),
      createStream: async () =>
        (async function* () {
          yield { choices: [{ delta: { content: 'Partial answer...' } }] };
          throw new Error('upstream connection reset');
        })(),
    },
    async (origin) => {
      const res = await fetch(origin + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorMode: 'Teach me',
          messages: [{ role: 'user', content: 'Explain mergesort' }],
        }),
      });
      assert.equal(res.status, 200);
      const body = await res.text();
      assert.match(body, /Partial answer/);
      assert.match(body, /AI assistance was interrupted/);
    }
  );
});

test('parseInterviewEvaluation parses raw JSON, fenced JSON, prose-wrapped JSON, and final question cleanly', () => {
  const raw = JSON.stringify({
    score: 84,
    summary: 'Solid explanation of hash map lookup.',
    criteria: [{ label: 'Time Complexity', status: 'strong', detail: 'Correctly stated O(1) average.' }],
    tip: 'Mention worst-case O(n) collisions.',
    nextQuestion: 'How does resizing affect amortized cost?',
  });
  const p1 = parseInterviewEvaluation(raw);
  assert.equal(p1.score, 84);
  assert.equal(p1.criteria.length, 1);
  assert.equal(p1.criteria[0].status, 'strong');
  assert.equal(p1.nextQuestion, 'How does resizing affect amortized cost?');

  const fencedWithProse = `Here is the evaluation:\n\`\`\`json\n${JSON.stringify({
    score: '78%',
    summary: 'Good intuition with minor edge-case omission.',
    criteria: [{ label: 'Edge cases', status: 'good', detail: 'Handled empty array.' }],
    tip: 'Discuss duplicate keys.',
    nextQuestion: 'How would you implement LRU cache?',
  })}\n\`\`\`\nGood luck!`;
  const p2 = parseInterviewEvaluation(fencedWithProse);
  assert.equal(p2.score, 78);
  assert.equal(p2.criteria[0].status, 'strong');
  assert.equal(p2.nextQuestion, 'How would you implement LRU cache?');

  // Final question (Question 8 of 8) is valid even when nextQuestion is empty
  const finalQ = parseInterviewEvaluation(
    JSON.stringify({
      score: 90,
      summary: 'Strong closing answer.',
      criteria: [{ label: 'Trade-offs', status: 'strong', detail: 'Clear space/time trade-off.' }],
      tip: 'Keep structuring answers clearly.',
      nextQuestion: '',
    }),
    { isFinalQuestion: true }
  );
  assert.equal(finalQ.score, 90);
  assert.equal(finalQ.nextQuestion, '');
});

async function withMockVisualizerServer(
  options: Parameters<typeof registerVisualizer>[1],
  fn: (origin: string) => Promise<void>
) {
  const app = express();
  app.use(express.json({ limit: '512kb' }));
  registerVisualizer(app, {
    authMiddleware: (req, _res, next) => {
      req.userId = 1;
      req.requestId = 'test-vis-req';
      next();
    },
    rateLimitMiddleware: (_req, _res, next) => next(),
    ...options,
  });

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as { port: number };
  const origin = `http://127.0.0.1:${port}`;
  try {
    await fn(origin);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test('visualizer model defaults to openai/gpt-oss-120b and respects GROQ_VISUALIZER_MODEL', () => {
  assert.equal(DEFAULT_GROQ_VISUALIZER_MODEL, 'openai/gpt-oss-120b');
  assert.equal(resolveVisualizerModel({}), 'openai/gpt-oss-120b');
  assert.equal(resolveVisualizerModel({ GROQ_VISUALIZER_MODEL: '  ' }), 'openai/gpt-oss-120b');
  assert.equal(resolveVisualizerModel({ GROQ_VISUALIZER_MODEL: ' openai/gpt-oss-20b ' }), 'openai/gpt-oss-20b');
});

test('/api/visualizer rejects malformed inputs and invalid follow-up context with 400', async () => {
  await withMockVisualizerServer({ getEnv: () => ({ GROQ_API_KEY: 'test-key' }) }, async (origin) => {
    const emptyRes = await fetch(origin + '/api/visualizer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: '   ', language: 'python' }),
    });
    assert.equal(emptyRes.status, 400);

    const badLang = await fetch(origin + '/api/visualizer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: 'Sort [3,1,2]', language: 'rust' }),
    });
    assert.equal(badLang.status, 400);

    const badMode = await fetch(origin + '/api/visualizer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: 'Sort [3,1,2]', language: 'python', mode: 'Invalid Mode' }),
    });
    assert.equal(badMode.status, 400);

    const badFollowup = await fetch(origin + '/api/visualizer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: 'Insert 30', question: 'Why?', context: { spec: { broken: true }, index: 0 } }),
    });
    assert.equal(badFollowup.status, 400);
  });
});

test('/api/visualizer forwards HTTP 429 rate-limit and isolates follow-up provider errors cleanly', async () => {
  const rateErr = Object.assign(new Error('rate_limit_exceeded'), { status: 429 });
  await withMockVisualizerServer(
    {
      getEnv: () => ({ GROQ_API_KEY: 'gsk_secret_vis_never_leak' }),
      createCompletion: async () => {
        throw rateErr;
      },
    },
    async (origin) => {
      const genRes = await fetch(origin + '/api/visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: 'Bubble sort [4, 2, 1]', language: 'python', mode: 'Explain Solution' }),
      });
      assert.equal(genRes.status, 429);
      const genText = await genRes.text();
      assert.match(genText, /AI_RATE_LIMITED/);
      assert.doesNotMatch(genText, /gsk_secret_vis/);

      const folRes = await fetch(origin + '/api/visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: 'Insert 30',
          question: 'Why update pointers?',
          context: { spec: visualizerExample, index: 2 },
          mode: 'Explain Solution',
        }),
      });
      assert.equal(folRes.status, 429);
    }
  );

  // Generic provider error during follow-up returns follow-up-specific error message (not "generate this visualization")
  await withMockVisualizerServer(
    {
      getEnv: () => ({ GROQ_API_KEY: 'test-key' }),
      createCompletion: async () => {
        throw new Error('provider network error');
      },
    },
    async (origin) => {
      const folRes = await fetch(origin + '/api/visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: 'Insert 30',
          question: 'Why update pointers?',
          context: { spec: visualizerExample, index: 2 },
          mode: 'Explain Solution',
        }),
      });
      assert.equal(folRes.status, 502);
      const body = await folRes.json();
      assert.match(body.error, /explain this step/i);
      assert.doesNotMatch(body.error, /generate this visualization/i);
    }
  );
});

test('/api/visualizer follow-up passes 4096 max_tokens and returns answer cleanly', async () => {
  let captured: VisualizerCompletionParams | null = null;
  await withMockVisualizerServer(
    {
      getEnv: () => ({ GROQ_API_KEY: 'test-key' }),
      createCompletion: async (params) => {
        captured = params;
        return { choices: [{ message: { content: 'Pointing the new node first preserves the rest of the list.' } }] };
      },
    },
    async (origin) => {
      const res = await fetch(origin + '/api/visualizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: 'Insert 30',
          question: 'Why update newNode.next first?',
          context: { spec: visualizerExample, index: 2 },
          mode: 'Explain Solution',
        }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.match(data.answer, /preserves the rest of the list/);
      assert.equal(captured?.max_tokens, 4096);
    }
  );
});

test('parseInterviewEvaluation rejects malformed, non-JSON, or incomplete evaluation responses', () => {
  assert.throws(() => parseInterviewEvaluation('Great job! You explained hashing well.'), /Invalid evaluation structure/);
  assert.throws(() => parseInterviewEvaluation('{not valid json}'), /Invalid evaluation structure/);
  assert.throws(
    () => parseInterviewEvaluation(JSON.stringify({ score: 80, summary: 'Missing next question', nextQuestion: '' })),
    /Invalid evaluation structure/
  );
  assert.throws(
    () => parseInterviewEvaluation(JSON.stringify({ score: 80, nextQuestion: 'Next?' })),
    /Invalid evaluation structure/
  );
});
