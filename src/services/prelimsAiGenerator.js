/**
 * Prelims MCQ AI Batch Generator — UPSC / BPSC
 * Generates 10 MCQs at a time using Gemini API.
 * Falls back to static bank if API unavailable.
 */

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-flash-latest',
  'gemini-pro-latest'
];

const HARDCODED_FALLBACK_KEY = typeof window !== 'undefined' ? atob('QVEuQWI4Uk42SWJEeDFfUWJSYXgwNGo5eFduZ0VhRnRJeWhoaF9KYzJjdE1taFB6cTlCWXc=') : '';

async function callGeminiApi(prompt, apiKey) {
  const cleanKey = (apiKey && apiKey.trim().length > 10) ? apiKey.trim() : HARDCODED_FALLBACK_KEY;

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    // Try first with responseMimeType: application/json
    const bodyWithJson = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    };

    const bodyStandard = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    };

    for (const bodyPayload of [bodyWithJson, bodyStandard]) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000); // 20s per call

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.length > 30) {
            console.log(`[Gemini API Success] Model: ${model}`);
            return text;
          }
        } else {
          const errText = await res.text().catch(() => '');
          console.warn(`[Gemini ${model}] HTTP ${res.status}:`, errText.slice(0, 150));
          lastError = new Error(`HTTP ${res.status}: ${errText.slice(0, 100)}`);
        }
      } catch (e) {
        console.warn(`[Gemini ${model}] Fetch failed:`, e.message);
        lastError = e;
      }
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed');
}

function buildPrompt({ exam, subject, difficulty, batchIndex, batchSize, language, previousTitles = [] }) {
  const isBpsc = exam === 'bpsc';
  const examLabel = isBpsc ? 'BPSC 72nd CCE Prelims' : 'UPSC Prelims GS Paper I (2026 Pattern)';
  const optionCount = isBpsc ? 5 : 4;
  const optionNote = isBpsc
    ? 'BPSC 5-option format: Options A, B, C, D, and Option E MUST be "None of the above / More than one of the above"'
    : 'UPSC 4-option format: Options A, B, C, D';
  const negNote = isBpsc ? '1/3 negative marking' : '2/3 negative marking';
  
  const excludeInstruction = previousTitles.length > 0
    ? `CRITICAL UNIQUE RULE: DO NOT generate any question on these topics/questions already generated:\n${previousTitles.slice(-25).map(t => `- ${t}`).join('\n')}`
    : '';

  return `You are a Senior Question Setter for ${examLabel}. Generate exactly ${batchSize} UNIQUE, HIGH-LEVEL MCQ questions for ${examLabel}.

Subject/Topic: ${subject || 'General Studies (Polity, History, Geography, Economy, Environment, Science)'}
Target Difficulty: ${difficulty === 'hard' ? 'High Analytical Depth (UPSC 2024-2026 standards)' : difficulty === 'easy' ? 'Factual with Distractor Options' : 'Moderate Analytical & Conceptual'}
Batch Number: ${batchIndex + 1}
${optionNote}
Negative marking: ${negNote}

${excludeInstruction}

QUESTION PATTERN DISTRIBUTIONS (MUST FOLLOW):
1. 40% Statement-based: "Consider the following statements: 1. ... 2. ... 3. ... Which of the statements given above is/are correct?"
2. 30% Pair Matching: "Consider the following pairs: ... How many of the above pairs are correctly matched?"
3. 20% Assertion-Reason / Analytical: Deep conceptual clarity on Constitution, History, Economy, Environment, S&T.
4. 10% Current Affairs / Special GS facts.

Return ONLY valid JSON array of ${batchSize} objects. Format:
[
  {
    "id": "ai-${exam}-${batchIndex}-0",
    "exam": "${exam}",
    "paper": "gs1",
    "subject": "${subject || 'General Studies'}",
    "year": "2026 AI Model",
    "difficulty": "${difficulty}",
    "questionEn": "Full question text in English...",
    "questionHi": "समान प्रश्न हिंदी में...",
    "optionsEn": ["Option A", "Option B", "Option C", "Option D"${isBpsc ? ', "None of the above / More than one of the above"' : ''}],
    "optionsHi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"${isBpsc ? ', "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक"' : ''}],
    "correctIndex": 0,
    "explanationEn": "Detailed 2-3 sentence explanation with relevant Articles, Acts, or historical facts.",
    "explanationHi": "हिंदी में विस्तृत व्याख्या..."
  }
]

IMPORTANT RULES:
- correctIndex MUST be an integer 0 to ${optionCount - 1}.
- NO DUPLICATE OR REPEATED QUESTIONS.
- Every question must be distinct in subject matter and formulation.
- Return ONLY the raw JSON array. No markdown code blocks, no intro text.`;
}

function parseGeminiBatch(rawText, exam, batchIndex) {
  try {
    let clean = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const match = clean.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) clean = match[0];
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    
    const seen = new Set();
    const result = [];

    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i];
      const qText = (q.questionEn || q.questionHi || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
      if (!qText || seen.has(qText)) continue; // Skip internal batch duplicate
      seen.add(qText);

      result.push({
        id: q.id || `ai-${exam}-${batchIndex}-${i}-${Date.now()}`,
        exam: q.exam || exam,
        paper: q.paper || 'gs1',
        subject: q.subject || 'General Studies',
        year: q.year || '2026 AI Model',
        difficulty: q.difficulty || 'medium',
        questionEn: q.questionEn || '',
        questionHi: q.questionHi || q.questionEn || '',
        optionsEn: Array.isArray(q.optionsEn) ? q.optionsEn : ['Option A', 'Option B', 'Option C', 'Option D'],
        optionsHi: Array.isArray(q.optionsHi) ? q.optionsHi : (Array.isArray(q.optionsEn) ? q.optionsEn : ['A', 'B', 'C', 'D']),
        correctIndex: typeof q.correctIndex === 'number' ? Math.max(0, Math.min(4, q.correctIndex)) : 0,
        explanationEn: q.explanationEn || '',
        explanationHi: q.explanationHi || q.explanationEn || '',
      });
    }

    return result.filter(q => q.questionEn.length > 10);
  } catch (e) {
    console.warn('Failed to parse Gemini batch:', e);
    return [];
  }
}

/**
 * Generate a single batch of 10 MCQs.
 * @returns {Promise<Array>} array of question objects
 */
export async function generatePrelimsBatch({ exam, subject, difficulty, batchIndex, batchSize = 10, apiKey, language = 'en', previousTitles = [] }) {
  const prompt = buildPrompt({ exam, subject, difficulty, batchIndex, batchSize, language, previousTitles });
  const rawText = await callGeminiApi(prompt, apiKey);
  const questions = parseGeminiBatch(rawText, exam, batchIndex);
  if (questions.length === 0) throw new Error('Empty batch returned');
  return questions;
}

/**
 * Check if Gemini API key is stored and valid (non-empty)
 */
export function hasValidApiKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.trim().length > 10;
}
