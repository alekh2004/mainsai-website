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
  const examLabel = isBpsc ? 'BPSC 72nd CCE Prelims (Bihar Public Service Commission)' : 'UPSC Civil Services Prelims GS Paper I (2025-2026 Pattern)';
  const optionCount = isBpsc ? 5 : 4;
  const optionNote = isBpsc
    ? 'BPSC 5-option format: Options A, B, C, D, and Option E MUST be "None of the above / More than one of the above" (हिंदी: "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक")'
    : 'UPSC 4-option format: Options A, B, C, D';
  const negNote = isBpsc ? '1/3 negative marking' : '2/3 negative marking';
  
  const excludeInstruction = previousTitles.length > 0
    ? `CRITICAL DEDUPLICATION RULE: Do NOT repeat questions or concepts on these recently generated items:\n${previousTitles.slice(-25).map(t => `- ${t}`).join('\n')}`
    : '';

  const textbookReferenceGuide = isBpsc
    ? `AUTHORITATIVE REFERENCE SOURCES TO DRAW FROM:
1. Bihar Special History & Culture: Imtiaz Ahmad (Bihar Ek Parichay), KBC Nano, Dr. UP Thakkur, Bihar Movement 1857 (Kunwar Singh), 1942 Quit India (Azad Dasta, Jayaprakash Narayan), Swami Sahajanand (Kisan Sabha), Champaran Satyagraha 1917.
2. Bihar Geography & Economy: Bihar Economic Survey 2024-25, State Budget, River Systems (Ganga tributaries - Kosi, Gandak, Son, Punpun), Soil types, Agro-climatic zones, Mineral distribution (Rohtas pyrite, Mica, Bauxite).
3. Indian Polity & Governance: M. Laxmikanth (Constitutional Articles, Amendments, Panchayati Raj 73rd/74th Amendments, Governor powers Art 213, State Legislature).
4. Indian History & Freedom Struggle: NCERT Class 6-12, Spectrum (Rajiv Ahir), Modern India, Ancient Era (Magadha Empire, Maurya, Gupta, Nalanda & Vikramshila Mahavihara).
5. Science & Environment: NCERT Physics/Chemistry/Biology, Environmental Conventions, Ramsar sites in Bihar (Kanwar Lake).`
    : `AUTHORITATIVE REFERENCE SOURCES TO DRAW FROM:
1. Indian Polity & Governance: M. Laxmikanth, Constitution of India Articles, Basic Structure doctrine, Landmark Supreme Court Verdicts (Puttaswamy, SR Bommai, Kesavananda), Parliamentary Committees & Writs (Art 32 & 226).
2. Modern, Ancient & Medieval History: NCERT Class 6-12 (Old & New), Spectrum Modern India (Rajiv Ahir), Bipan Chandra, Art & Culture (Nitin Singhania) — Temple architecture, Bhakti/Sufi saints, UNESCO World Heritage sites.
3. Physical & Indian Geography: NCERT Class 11-12, GC Leong, Map-based questions (Straits, Seas, Passes, River Basins, National Parks, Biosphere Reserves).
4. Indian Economy: Ramesh Singh, Sanjiv Verma, RBI Monetary Policy Tools, Economic Survey, Inflation, Balance of Payments, Foreign Direct Investment, WTO agreements.
5. Environment & Science/Tech: Shankar IAS Environment, PIB, Down To Earth, Quantum Technology, Semiconductor Mission, Space Missions (Gaganyaan, Aditya-L1), Biotechnology (CRISPR-Cas9).`;

  return `You are an Expert Member of the Central Question Setting Board for ${examLabel}.
Generate exactly ${batchSize} AUTHENTIC, EXTREMELY HIGH QUALITY, TEXTBOOK-ALIGNED MCQ questions for ${examLabel}.

Subject/Topic: ${subject || 'General Studies (Polity, History, Geography, Economy, Environment, General Science, Current Affairs)'}
Target Difficulty: ${difficulty === 'hard' ? 'High Analytical & Conceptual Depth (UPSC 2024-2026 standards)' : difficulty === 'easy' ? 'Factual with Distractor Options' : 'Moderate Analytical & Conceptual'}
Batch Index: ${batchIndex + 1}
${optionNote}
Negative marking rule: ${negNote}

${textbookReferenceGuide}

${excludeInstruction}

QUESTION FORMAT SPECS (MUST DISTRIBUTE BALANCEDLY):
- 40% Multi-Statement Questions:
  "Consider the following statements regarding [Concept/Topic]:
   1. Statement one details...
   2. Statement two details...
   3. Statement three details...
   Which of the statements given above is/are correct?"
- 30% Pair Matching Questions:
  "Consider the following pairs:
   [List I] - [List II]
   1. Item A - Description X
   2. Item B - Description Y
   How many of the above pairs are correctly matched?"
- 20% Statement-I & Statement-II / Assertion-Reason Questions:
  "Statement-I: ... Statement-II: ... Which one of the following is correct in respect of the above statements?"
- 10% Conceptual / Applied Fact-based Questions.

RETURN ONLY VALID RAW JSON ARRAY of ${batchSize} objects formatted as follows:
[
  {
    "id": "q-${exam}-${batchIndex}-0",
    "exam": "${exam}",
    "paper": "gs1",
    "subject": "${subject || 'General Studies'}",
    "year": "2026 Standard",
    "difficulty": "${difficulty}",
    "questionEn": "Exhaustive question statement in English...",
    "questionHi": "समान विस्तृत प्रश्न विवरण हिंदी में...",
    "optionsEn": ["Option A text", "Option B text", "Option C text", "Option D text"${isBpsc ? ', "None of the above / More than one of the above"' : ''}],
    "optionsHi": ["विकल्प A विवरण", "विकल्प B विवरण", "विकल्प C विवरण", "विकल्प D विवरण"${isBpsc ? ', "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक"' : ''}],
    "correctIndex": 0,
    "explanationEn": "Comprehensive 3-4 sentence detailed explanation key referencing standard textbooks, relevant Articles/Acts, or historical/scientific context.",
    "explanationHi": "मानक पुस्तकों एवं संबंधित अनुच्छेदों के संदर्भ के साथ हिंदी में 3-4 वाक्यों का विस्तृत व्याख्यात्मक समाधान..."
  }
]

CRITICAL CONSTRAINTS:
- correctIndex MUST be an integer between 0 and ${optionCount - 1}.
- Return ONLY the JSON array. Do NOT wrap in extra markdown or intro/outro prose.`;
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
