import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

const askBodySchema = z.object({
  question: z.string().optional(),
  prompt: z.string().optional(),
  language: z.enum(['am', 'en']).optional().default('en'),
});

function systemPrompt(language: 'am' | 'en'): string {
  const base =
    'You are a friendly programming tutor for learners on the AlphaX Programming platform (Amharic and English). ' +
    'The curriculum covers C++ and web development (HTML, CSS, JavaScript). Answer questions about any of these topics with equal care — do not steer learners back to C++ when they ask about the web stack, and do not assume they are only learning C++. ' +
    'Give concise hints, explanations, and small examples — avoid dumping full assignment solutions. ' +
    'For C++, encourage good practices (memory safety, const correctness, clear names). ' +
    'For HTML, encourage semantic elements, accessibility (alt text, labels, heading order), and valid structure. ' +
    'For CSS, encourage maintainable selectors, the cascade and specificity, box model clarity, and responsive layout. ' +
    'For JavaScript, encourage clear functions, avoiding global pollution, careful DOM updates, and modern, safe patterns.';
  if (language === 'am') {
    return (
      base +
      ' Respond in Amharic (አማርኛ) when the learner uses Amharic or when helpful; keep technical terms in English when standard.'
    );
  }
  return base + ' Respond in English.';
}

type GeminiResult =
  | { ok: true; text: string }
  | { ok: false; message: string };

type GeminiFailure = Extract<GeminiResult, { ok: false }>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Shorter default = faster generation for hint-style answers (override with GEMINI_MAX_OUTPUT_TOKENS). */
function geminiMaxOutputTokens(): number {
  const raw = process.env.GEMINI_MAX_OUTPUT_TOKENS?.trim();
  if (raw) {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) return Math.min(4096, Math.max(256, n));
  }
  return 1200;
}

function openAiMaxTokens(): number {
  const raw = process.env.OPENAI_MAX_TOKENS?.trim();
  if (raw) {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) return Math.min(4096, Math.max(256, n));
  }
  return 1000;
}

/** Seconds until retry from Gemini body or Retry-After header (capped). */
function parseRetryDelaySeconds(rawBody: string, headers: Headers): number | null {
  const h = headers.get('retry-after');
  if (h) {
    const n = parseInt(h, 10);
    if (!Number.isNaN(n) && n >= 0) return Math.min(n, 60);
  }
  const m = rawBody.match(/Please retry in ([\d.]+)\s*s/i);
  if (m) {
    const sec = parseFloat(m[1]);
    if (!Number.isNaN(sec) && sec >= 0) return Math.min(sec, 60);
  }
  return null;
}

/** True when Gemini is overloaded or account/plan has no quota (fallback to OpenAI if configured). */
function isGeminiQuotaOrRateLimitMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('quota') ||
    m.includes('resource_exhausted') ||
    m.includes('rate limit') ||
    m.includes('too many requests') ||
    m.includes('exceeded your current quota')
  );
}

function clientFacingGeminiError(raw: string): string {
  if (isGeminiQuotaOrRateLimitMessage(raw)) {
    return (
      'Gemini quota or free tier is exhausted for this model (or your project has limit 0). ' +
      'Enable billing in Google AI Studio, leave GEMINI_MODEL unset to auto-pick from ListModels, ' +
      'or set OPENAI_API_KEY in backend/.env for fallback. ' +
      'See https://ai.google.dev/gemini-api/docs/rate-limits'
    );
  }
  return raw;
}

/** When ListModels fails, try these (lite/smaller models often keep free-tier quota). */
const GEMINI_FALLBACK_MODEL_ORDER = [
  'gemini-2.0-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

let cachedGeminiModelOrder: { apiKey: string; order: string[] } | null = null;

/** List model IDs that support generateContent (Google AI Studio key). */
async function listGeminiModelIds(apiKey: string): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  for (;;) {
    const url = new URL('https://generativelanguage.googleapis.com/v1beta/models');
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    let res: globalThis.Response;
    try {
      res = await fetch(url.toString(), {
        headers: { 'x-goog-api-key': apiKey },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[ai-tutor] listModels fetch failed:', msg);
      return [];
    }
    const raw = await res.text();
    if (!res.ok) {
      console.error('[ai-tutor] listModels HTTP', res.status, raw.slice(0, 400));
      return [];
    }
    let data: {
      models?: { name?: string; supportedGenerationMethods?: string[] }[];
      nextPageToken?: string;
    };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      return [];
    }
    for (const m of data.models ?? []) {
      if (!m.supportedGenerationMethods?.includes('generateContent')) continue;
      const id = (m.name ?? '').replace(/^models\//, '');
      if (id) ids.push(id);
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return ids;
}

/** Prefer lite / flash / 8b (usually friendlier for free-tier quota than full 2.0-flash). */
function rankGeminiModels(ids: string[]): string[] {
  const score = (id: string): number => {
    const lower = id.toLowerCase();
    if (lower.includes('embedding') || lower.includes('embed')) return 10000;
    if (lower.includes('gemini-3') && lower.includes('flash') && lower.includes('lite')) return 0;
    if (lower.includes('gemini-2.5') && lower.includes('flash') && lower.includes('lite')) return 1;
    if (lower.includes('flash-lite') || lower.includes('flash_lite')) return 2;
    if (lower.includes('1.5-flash-8b') || lower.includes('8b')) return 3;
    if (lower.includes('gemini-2.5') && lower.includes('flash') && !lower.includes('pro')) return 5;
    if (lower.includes('gemini-2.0') && lower.includes('flash') && !lower.includes('lite')) return 15;
    if (lower.includes('gemini-1.5') && lower.includes('flash')) return 12;
    if (lower.includes('flash') && !lower.includes('pro')) return 20;
    if (lower.includes('pro')) return 80;
    return 50;
  };
  return [...ids].sort((a, b) => {
    const d = score(a) - score(b);
    if (d !== 0) return d;
    return a.localeCompare(b);
  });
}

async function getGeminiModelOrder(apiKey: string): Promise<string[]> {
  if (cachedGeminiModelOrder?.apiKey === apiKey) {
    return cachedGeminiModelOrder.order;
  }
  const listed = await listGeminiModelIds(apiKey);
  let order: string[];
  if (listed.length === 0) {
    console.warn('[ai-tutor] ListModels empty or failed — using built-in lite-first fallback list');
    order = [...GEMINI_FALLBACK_MODEL_ORDER];
  } else {
    order = rankGeminiModels(listed);
    console.info('[ai-tutor] Gemini models (generateContent), trying lite/flash first:', order.slice(0, 8).join(', '));
  }
  cachedGeminiModelOrder = { apiKey, order };
  return order;
}

function shouldTryNextGeminiModel(message: string): boolean {
  const m = message.toLowerCase();
  if (isGeminiQuotaOrRateLimitMessage(message)) return true;
  if (m.includes('not found') || m.includes('not supported') || m.includes('does not exist')) return true;
  return false;
}

function shouldAbortGeminiAttempts(message: string): boolean {
  const m = message.toLowerCase();
  if (m.includes('api key not valid') || m.includes('api_key_invalid')) return true;
  if (m.includes('invalid') && m.includes('key') && m.includes('api')) return true;
  return false;
}

/** Single generateContent call; optional one 429 retry on same model. */
async function geminiGenerateContent(
  apiKey: string,
  modelId: string,
  question: string,
  language: 'am' | 'en',
  allowRetry429: boolean,
): Promise<GeminiResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent`;

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt(language) }],
    },
    contents: [
      {
        parts: [{ text: question }],
      },
    ],
    generationConfig: {
      maxOutputTokens: geminiMaxOutputTokens(),
      temperature: 0.55,
    },
  };

  let geminiRes: globalThis.Response;
  try {
    geminiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[ai-tutor] Gemini fetch failed:', msg);
    return { ok: false, message: `Network error calling Gemini: ${msg}` };
  }

  const raw = await geminiRes.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error('[ai-tutor] Gemini non-JSON', geminiRes.status, raw.slice(0, 400));
    return { ok: false, message: `Gemini returned invalid response (HTTP ${geminiRes.status})` };
  }

  if (!geminiRes.ok) {
    const errObj = data as { error?: { message?: string; status?: string } };
    const msg =
      errObj.error?.message ??
      `Gemini request failed (HTTP ${geminiRes.status}). Check GEMINI_MODEL and API key.`;
    console.error('[ai-tutor] Gemini HTTP', modelId, geminiRes.status, msg.slice(0, 200));

    if (allowRetry429 && geminiRes.status === 429) {
      const delaySec = parseRetryDelaySeconds(raw, geminiRes.headers);
      if (delaySec != null && delaySec > 0) {
        console.warn(`[ai-tutor] Gemini 429 on ${modelId} — retrying once after ${delaySec}s`);
        await sleep(Math.ceil(delaySec * 1000));
        return geminiGenerateContent(apiKey, modelId, question, language, false);
      }
    }

    return { ok: false, message: msg };
  }

  const parsed = data as {
    candidates?: {
      content?: { parts?: { text?: string }[] };
      finishReason?: string;
    }[];
    promptFeedback?: { blockReason?: string };
  };

  if (parsed.promptFeedback?.blockReason) {
    return {
      ok: false,
      message: `Prompt blocked: ${parsed.promptFeedback.blockReason}`,
    };
  }

  const candidate = parsed.candidates?.[0];
  const finish = candidate?.finishReason;
  if (finish && finish !== 'STOP' && finish !== 'MAX_TOKENS') {
    console.warn('[ai-tutor] Gemini finishReason:', modelId, finish);
  }

  const parts = candidate?.content?.parts;
  const out = parts?.map((p) => p.text ?? '').join('').trim() ?? '';
  if (!out) {
    return {
      ok: false,
      message: 'Gemini returned an empty answer. Try a different question or check GEMINI_MODEL.',
    };
  }

  return { ok: true, text: out };
}

/**
 * If GEMINI_MODEL is unset: ListModels + prefer lite/flash, then try each until one succeeds
 * (skips models that hit quota / not found). If GEMINI_MODEL is set, only that model is used.
 */
async function callGemini(question: string, language: 'am' | 'en'): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: 'GEMINI_API_KEY is missing' };
  }

  const explicitModel = process.env.GEMINI_MODEL?.trim();
  if (explicitModel && explicitModel.toLowerCase() !== 'auto') {
    return geminiGenerateContent(apiKey, explicitModel, question, language, true);
  }

  const order = await getGeminiModelOrder(apiKey);
  let last: GeminiResult = { ok: false, message: 'No Gemini model available' };

  for (const modelId of order) {
    const result = await geminiGenerateContent(apiKey, modelId, question, language, true);
    if (result.ok) {
      console.info('[ai-tutor] Using Gemini model:', modelId);
      return result;
    }
    last = result;
    const msg = (result as GeminiFailure).message;
    if (shouldAbortGeminiAttempts(msg)) {
      return result;
    }
    if (shouldTryNextGeminiModel(msg)) {
      console.warn(`[ai-tutor] Skipping model ${modelId}: ${msg.slice(0, 120)}`);
      continue;
    }
    return result;
  }

  return last;
}

async function callOpenAI(question: string, language: 'am' | 'en'): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt(language) },
        { role: 'user', content: question },
      ],
      max_tokens: openAiMaxTokens(),
      temperature: 0.55,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[ai-tutor] OpenAI HTTP', res.status, text.slice(0, 500));
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

router.post('/ask', authenticate, async (req: Request, res: Response): Promise<void> => {
  const parsed = askBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body: send { question, language? }' });
    return;
  }

  const raw = String(parsed.data.question ?? parsed.data.prompt ?? '').trim();
  if (!raw) {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  const language = parsed.data.language;

  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (!hasGemini && !hasOpenAI) {
    res.status(503).json({
      error:
        'AI tutor is not configured. Set GEMINI_API_KEY (recommended) or OPENAI_API_KEY in backend/.env and restart the server.',
    });
    return;
  }

  try {
    if (hasGemini) {
      const gemini = await callGemini(raw, language);
      if (!gemini.ok) {
        const errMsg = (gemini as GeminiFailure).message;
        if (hasOpenAI && isGeminiQuotaOrRateLimitMessage(errMsg)) {
          console.warn('[ai-tutor] Gemini exhausted after model attempts — OpenAI fallback');
          const text = await callOpenAI(raw, language);
          if (text) {
            res.json({ response: text });
            return;
          }
          res.status(502).json({
            error:
              'OpenAI fallback failed after Gemini quota errors. Check OPENAI_API_KEY or Gemini billing.',
          });
          return;
        }
        const status = isGeminiQuotaOrRateLimitMessage(errMsg) ? 503 : 502;
        res.status(status).json({ error: clientFacingGeminiError(errMsg) });
        return;
      }
      res.json({ response: gemini.text });
      return;
    }

    const text = await callOpenAI(raw, language);
    if (!text) {
      res.status(502).json({
        error: 'OpenAI returned no answer. Check OPENAI_API_KEY and model name.',
      });
      return;
    }

    res.json({ response: text });
  } catch (err) {
    console.error('[ai-tutor] ask error:', err);
    res.status(503).json({ error: 'AI tutor service is temporarily unavailable.' });
  }
});

router.get('/history', authenticate, async (_req: Request, res: Response): Promise<void> => {
  res.json({ history: [] });
});

/**
 * Preload Gemini ListModels + model order so the first user question is not paying that cost.
 * No-op if GEMINI_API_KEY is missing or GEMINI_MODEL is set to a fixed model name.
 */
export async function warmupAiTutorGeminiCache(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return;
  const explicit = process.env.GEMINI_MODEL?.trim();
  if (explicit && explicit.toLowerCase() !== 'auto') return;
  try {
    await getGeminiModelOrder(apiKey);
    console.info('[ai-tutor] Gemini model list preloaded');
  } catch (e) {
    console.warn('[ai-tutor] Gemini model preload failed (non-fatal):', e instanceof Error ? e.message : e);
  }
}

export default router;
