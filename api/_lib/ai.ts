// Free-tier friendly: Gemini (Google AI Studio key) and/or OpenRouter ":free" models.
// Tries providers in AI_PROVIDERS order and falls back on error / rate limit.

type Img = { mime: string; b64: string; label?: string };
type JsonRecord = Record<string, any>;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isTransient = (error: unknown) => {
  const msg = String((error as Error)?.message || error);
  return /\b429\b|\b503\b|\b504\b|rate.?limit|resource.?exhausted|high demand|unavailable|timeout|aborted|econnreset/i.test(msg);
};
const finite = (value: unknown) => typeof value === 'number' && Number.isFinite(value);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const asText = (value: unknown, max = 600) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const asRecord = (value: unknown): JsonRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {};

const RADAR_DIMENSIONS = [
  'Visual Hierarchy', 'CTA Effectiveness', 'Trust and Credibility',
  'Content Clarity', 'Navigation and UX', 'Mobile Usability'
];

function normaliseHeatmap(raw: unknown, width: number, height: number) {
  const source = asRecord(raw);
  const annotations = Array.isArray(source.annotations) ? source.annotations.flatMap((item, index) => {
    const annotation = asRecord(item);
    const x = annotation.x; const y = annotation.y; const w = annotation.width; const h = annotation.height;
    const issue = asText(annotation.issue, 160);
    const reason = asText(annotation.reason, 500);
    if (![x, y, w, h].every(finite) || !issue || !reason || w <= 0 || h <= 0 || x >= width || y >= height) return [];
    const safeX = clamp(x, 0, width - 1); const safeY = clamp(y, 0, height - 1);
    const safeW = clamp(w, 1, width - safeX); const safeH = clamp(h, 1, height - safeY);
    return [{
      id: asText(annotation.id, 80) || `region-${index + 1}`,
      x: safeX, y: safeY, width: safeW, height: safeH,
      prominence: finite(annotation.prominence) ? clamp(annotation.prominence, 0, 100) : undefined,
      issue, reason,
      evidence: asText(annotation.evidence, 500),
      recommendation: asText(annotation.recommendation, 500),
    }];
  }) : [];
  return { imageWidth: width, imageHeight: height, annotations };
}

function normaliseVisualizations(raw: unknown) {
  const value = asRecord(raw);
  const radarRaw = asRecord(value.radar);
  const seen = new Set<string>();
  const dimensions = (Array.isArray(radarRaw.dimensions) ? radarRaw.dimensions : []).flatMap((item) => {
    const dimension = asRecord(item);
    const name = asText(dimension.name, 80);
    const score = dimension.score;
    const reason = asText(dimension.reason, 500);
    if (!RADAR_DIMENSIONS.includes(name) || seen.has(name) || !finite(score) || !reason) return [];
    seen.add(name);
    return [{ name, score: clamp(score, 0, 100), confidence: finite(dimension.confidence) ? clamp(dimension.confidence, 0, 1) : undefined, reason }];
  });

  const impactRaw = asRecord(value.impactEffort);
  const items = (Array.isArray(impactRaw.items) ? impactRaw.items : []).flatMap((item, index) => {
    const issue = asRecord(item);
    const title = asText(issue.title, 180); const evidence = asText(issue.evidence, 600); const recommendation = asText(issue.recommendation, 600);
    if (!title || !evidence || !recommendation || !finite(issue.impact) || !finite(issue.effort)) return [];
    return [{
      id: asText(issue.id, 80) || `issue-${index + 1}`,
      title, category: asText(issue.category, 80) || 'General', severity: asText(issue.severity, 30) || 'info',
      impact: clamp(issue.impact, 1, 10), effort: clamp(issue.effort, 1, 10),
      confidence: finite(issue.confidence) ? clamp(issue.confidence, 0, 1) : undefined,
      evidence, recommendation,
    }];
  });

  const heatmap = asRecord(value.attentionHeatmap);
  return {
    radar: { dimensions },
    attentionHeatmap: {
      desktop: normaliseHeatmap(heatmap.desktop, 1366, 768),
      mobile: normaliseHeatmap(heatmap.mobile, 390, 844),
    },
    impactEffort: { items },
  };
}

function parseJson(text: string): any {
  const t = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(t);
  } catch {}
  const s = t.indexOf('{');
  const e = t.lastIndexOf('}');
  if (s >= 0 && e > s) {
    try {
      return JSON.parse(t.slice(s, e + 1));
    } catch {}
  }
  throw new Error('AI returned invalid JSON: ' + t.slice(0, 150));
}

async function gemini(system: string, prompt: string, images: Img[] = []) {
  const parts: any[] = [{ text: prompt }];

  for (const img of images) {
    if (img.label) parts.push({ text: `The following image is the ${img.label} screenshot. Use only its visible content for ${img.label} annotations.` });
    parts.push({ inline_data: { mime_type: img.mime, data: img.b64 } });
  }

  const requestedModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const models = [requestedModel, 'gemini-flash-lite-latest', 'gemini-flash-latest'].filter(
    (m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx
  );

  let lastError: any;
  for (const model of models) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(images.length > 0 ? 30000 : 35000),
      });

      if (!r.ok) {
        const errText = await r.text();
        throw new Error(`Gemini ${r.status} (${model}): ${errText.slice(0, 200)}`);
      }

      const j: any = await r.json();
      const content = j.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
      if (content) return content;
      throw new Error(`Gemini (${model}) returned empty candidates`);
    } catch (err: any) {
      lastError = err;
      const isUnavailable = /\b503\b|\b404\b|high demand|unavailable|timeout|aborted/i.test(err?.message || '');
      if (isUnavailable && model !== models[models.length - 1]) {
        console.warn(`Gemini model ${model} failed (${err?.message}), trying fallback model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error('Gemini generation failed');
}

async function openrouter(system: string, prompt: string, images: Img[] = []) {
  const content: any[] = [{ type: 'text', text: prompt }];
  for (const img of images) {
    if (img.label) content.push({ type: 'text', text: `The following image is the ${img.label} screenshot.` });
    content.push({ type: 'image_url', image_url: { url: `data:${img.mime};base64,${img.b64}` } });
  }

  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content },
      ],
    }),
    signal: AbortSignal.timeout(35000),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`OpenRouter ${r.status}: ${errText.slice(0, 200)}`);
  }

  const j: any = await r.json();
  return j.choices?.[0]?.message?.content || '';
}

export async function askJson(system: string, prompt: string, images: Img[] = []): Promise<any> {
  const order = (process.env.AI_PROVIDERS || 'gemini').split(',').map((s) => s.trim());
  let lastErr: any;

  // If images are provided, try with images first.
  // If the vision call fails (due to payload size, timeout, 503, or rate limit),
  // automatically fall back to fast text-only analysis so the audit never fails.
  const attempts: Img[][] = images.length > 0 ? [images, []] : [[]];

  for (const currentImages of attempts) {
    for (const p of order) {
      const provider = p === 'gemini' && process.env.GEMINI_API_KEY
        ? () => gemini(system, prompt, currentImages)
        : p === 'openrouter' && process.env.OPENROUTER_API_KEY
          ? () => openrouter(system, prompt, currentImages)
          : null;
      if (!provider) continue;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          return parseJson(await provider());
        } catch (e: any) {
          lastErr = e;
          if (!isTransient(e) || attempt === 1) {
            console.error(`AI provider ${p} attempt failed:`, e?.message || e);
            break;
          }
          await pause(1000 * (attempt + 1));
        }
      }
    }
    if (currentImages.length > 0) {
      console.warn('Vision analysis failed or timed out; falling back to text-only CRO audit...');
    }
  }

  throw lastErr || new Error('No AI provider configured');
}

const SYSTEM = `You are a world-class Conversion Rate Optimization (CRO) and eCommerce growth expert.
You audit web pages based on scraped HTML content, value propositions, headings, call-to-actions, trust signals, and layout structure.

Core evaluation criteria:
1. Value Proposition: Is the hero headline crystal clear? Does it answer "What do you sell and why should I care?" within 5 seconds?
2. Call to Action (CTA): Are CTAs action-oriented, distinct, and high-contrast? Is there visual hierarchy?
3. Social Proof & Trust: Are there customer reviews, testimonials, guarantees, return policy mentions, or security badges?
4. Friction Reduction: Are forms minimal and clean? Are steps clear?
5. Content & Messaging: Does the copy focus on customer benefits over company features?
6. Scannability & Hierarchy: Headings (H1/H2), bullet points, clear sections.

Rules:
- NEVER give vague advice like "improve UX" or "make it modern". Be concrete: state exact element, current issue, and exact recommended change.
- Quote actual elements or text from the scraped data in the "evidence" field.
- Return ONLY valid JSON matching the exact schema specified. No markdown fences.`;

export async function analyzePage(extracted: unknown, screenshots: Img[] = []) {
  const prompt = `Perform a comprehensive CRO audit on this page using ONLY the scraped content below:

PAGE SCRAPED DATA:
${JSON.stringify(extracted, null, 2).slice(0, 9500)}

Return JSON in this EXACT schema:
{
  "score": 0-100,
  "subscores": {
    "value_proposition": 0-100,
    "cta": 0-100,
    "trust": 0-100,
    "mobile": 0-100,
    "forms_friction": 0-100,
    "visual_hierarchy": 0-100
  },
  "findings": [
    {
      "severity": "high",
      "category": "value_proposition",
      "issue": "Concise title of the conversion issue",
      "evidence": "Quoted text or specific element from the scraped data",
      "recommendation": "Concrete fix with copy or layout recommendation",
      "expected_impact": "How this change will increase conversion rate or revenue"
    }
  ],
  "quick_wins": [
    "Quick high-impact fix 1",
    "Quick high-impact fix 2",
    "Quick high-impact fix 3"
  ],
  "croVisualizations": {
    "radar": {
      "dimensions": [{ "name": "Visual Hierarchy", "score": 0, "confidence": 0.0, "reason": "Evidence-based explanation" }]
    },
    "attentionHeatmap": {
      "desktop": { "imageWidth": 1366, "imageHeight": 768, "annotations": [{ "id": "region-1", "x": 0, "y": 0, "width": 1, "height": 1, "prominence": 0, "issue": "What is visible", "reason": "Screenshot evidence", "evidence": "Visible element", "recommendation": "Specific improvement" }] },
      "mobile": { "imageWidth": 390, "imageHeight": 844, "annotations": [] }
    },
    "impactEffort": {
      "items": [{ "id": "issue-1", "title": "Existing audit issue", "category": "CTA", "severity": "high", "impact": 1, "effort": 1, "confidence": 0.0, "evidence": "Observed evidence", "recommendation": "Specific fix" }]
    }
  }
}

Provide 4 to 8 high-impact findings, ordered by highest severity first.

For croVisualizations:
- Radar: evaluate only the six exact names: ${RADAR_DIMENSIONS.join(', ')}. Omit a dimension if the supplied evidence is insufficient; never guess a score.
- Screenshot heatmap: only annotate elements visibly present in the supplied screenshot(s). Use the exact pixel coordinate systems stated in the schema, keep each box inside its image, and return an empty annotations array when a screenshot is not supplied or evidence is insufficient. This is predicted visual prominence, never eye-tracking data.
- Impact/effort: include only issues supported by this audit's findings or screenshot evidence. impact and effort are integer estimates from 1 to 10, not measured conversion gains. Do not create placeholder items.`;

  const result = await askJson(SYSTEM, prompt, screenshots);
  const analysis = asRecord(result);
  return { ...analysis, croVisualizations: normaliseVisualizations(analysis.croVisualizations) };
}

export function summarizeAudit(url: string, pages: { url: string; score: number; findings: any[] }[]) {
  const slim = pages.map((p) => ({
    url: p.url,
    score: p.score,
    findings: p.findings?.slice(0, 5).map((f) => ({
      issue: f.issue,
      severity: f.severity,
      recommendation: f.recommendation,
    })),
  }));

  const prompt = `Website audited: ${url}
Per-page audit findings:
${JSON.stringify(slim, null, 2).slice(0, 12000)}

Return JSON in this EXACT schema:
{
  "executive_summary": "3-4 concise, punchy sentences summarizing the store's biggest conversion bottlenecks and greatest opportunities for revenue growth.",
  "top_priorities": [
    {
      "title": "Actionable priority title",
      "why": "Detailed explanation of why this priority matters and how to execute it",
      "pages": ["page url"],
      "effort": "low",
      "impact": "high"
    }
  ],
  "sitewide_patterns": [
    "Key sitewide pattern or weakness 1",
    "Key sitewide pattern or weakness 2"
  ]
}

Provide 3 to 5 top priorities ordered by highest impact and lowest effort.`;

  return askJson(SYSTEM, prompt, []);
}
