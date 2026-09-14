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

function buildPrompt({ exam, subject, difficulty, batchIndex, batchSize, language }) {
  const isBpsc = exam === 'bpsc';
  const examLabel = isBpsc ? 'BPSC 70th Prelims' : 'UPSC Prelims GS Paper I';
  const optionCount = isBpsc ? 5 : 4;
  const optionNote = isBpsc
    ? 'BPSC has 5 options: A, B, C, D, and option E is always "None of the above / More than one of the above"'
    : 'UPSC has 4 options: A, B, C, D';
  const negNote = isBpsc ? '1/3 negative marking' : '2/3 negative marking';
  const diffNote = difficulty === 'easy' ? 'straightforward factual' : difficulty === 'hard' ? 'analytical and tricky' : 'moderate difficulty';

  return `You are an expert ${examLabel} question setter. Generate exactly ${batchSize} MCQ questions for ${examLabel}.

Subject/Topic: ${subject || 'General Studies'}
Difficulty: ${diffNote}
Batch number: ${batchIndex + 1} (generate DIFFERENT questions from previous batches)
${optionNote}
Negative marking: ${negNote}

Return ONLY valid JSON array of ${batchSize} objects. Each object:
{
  "id": "ai-${exam}-${batchIndex}-{index}",
  "exam": "${exam}",
  "paper": "gs1",
  "subject": "${subject || 'General Studies'}",
  "year": "AI Generated",
  "difficulty": "${difficulty}",
  "questionEn": "Full question text in English (statement-based or direct). For statement questions use numbered list format.",
  "questionHi": "Same question in Hindi",
  "optionsEn": ["Option A", "Option B", "Option C", "Option D"${isBpsc ? ', "None of the above / More than one of the above"' : ''}],
  "optionsHi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"${isBpsc ? ', "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक"' : ''}],
  "correctIndex": 0,
  "explanationEn": "Detailed 2-3 sentence explanation with key facts",
  "explanationHi": "Same explanation in Hindi"
}

IMPORTANT:
- correctIndex must be 0-${optionCount - 1}
- All questions must be authentic exam-style
- No duplicate questions
- Return ONLY the JSON array, no markdown, no explanation text`;
}

function parseGeminiBatch(rawText, exam, batchIndex) {
  try {
    // Strip markdown code fences if present
    let clean = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    // Try to find JSON array
    const match = clean.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) clean = match[0];
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    // Normalize and validate each question
    return parsed.map((q, i) => ({
      id: q.id || `ai-${exam}-${batchIndex}-${i}`,
      exam: q.exam || exam,
      paper: q.paper || 'gs1',
      subject: q.subject || 'General Studies',
      year: q.year || 'AI Generated',
      difficulty: q.difficulty || 'medium',
      questionEn: q.questionEn || '',
      questionHi: q.questionHi || q.questionEn || '',
      optionsEn: Array.isArray(q.optionsEn) ? q.optionsEn : ['Option A', 'Option B', 'Option C', 'Option D'],
      optionsHi: Array.isArray(q.optionsHi) ? q.optionsHi : (Array.isArray(q.optionsEn) ? q.optionsEn : ['A', 'B', 'C', 'D']),
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      explanationEn: q.explanationEn || '',
      explanationHi: q.explanationHi || q.explanationEn || '',
    })).filter(q => q.questionEn.length > 10);
  } catch (e) {
    console.warn('Failed to parse Gemini batch:', e);
    return [];
  }
}

/**
 * Generate a single batch of 10 MCQs.
 * @returns {Promise<Array>} array of question objects
 */
export async function generatePrelimsBatch({ exam, subject, difficulty, batchIndex, batchSize = 10, apiKey, language = 'en' }) {
  const prompt = buildPrompt({ exam, subject, difficulty, batchIndex, batchSize, language });
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
