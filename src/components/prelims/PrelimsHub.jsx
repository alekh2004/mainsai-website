import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PRELIMS_QUESTION_BANK } from '../../data/prelimsQuestions';
import { generatePrelimsBatch } from '../../services/prelimsAiGenerator';
import { getPYQsByExam } from '../../data/prelimsPYQs';
import { saveTestToImprovementBook } from '../dashboard/ImprovementBook';
import { PrelimsHome } from './PrelimsHome';
import { PrelimsTestConfig } from './PrelimsTestConfig';
import { PrelimsInstructions } from './PrelimsInstructions';
import { PrelimsExamInterface } from './PrelimsExamInterface';
import { PrelimsResultAnalysis } from './PrelimsResultAnalysis';
import { Loader2, Sparkles, AlertTriangle, BookOpen } from 'lucide-react';

const BATCH_SIZE = 10;

function normalizeKey(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
}

function deduplicateList(existing = [], incoming = []) {
  const seen = new Set(existing.map(q => normalizeKey(q.questionEn || q.questionHi || q.id)));
  const result = [...existing];

  for (const q of incoming) {
    const k = normalizeKey(q.questionEn || q.questionHi || q.id);
    if (k && k.length > 5 && !seen.has(k)) {
      seen.add(k);
      result.push(q);
    }
  }
  return result;
}

// ── Build fallback questions from static bank + PYQs without repetition ──
function buildStaticFallback(exam, configData, count) {
  let pyqSet = [];
  try { pyqSet = getPYQsByExam(exam) || []; } catch (e) {}

  let qSet = [...PRELIMS_QUESTION_BANK.filter(q => q.exam === exam), ...pyqSet];
  if (qSet.length === 0) qSet = [...PRELIMS_QUESTION_BANK, ...pyqSet];

  if (configData?.testType === 'subject_wise' && configData?.selectedSubjects) {
    const activeSubIds = Object.entries(configData.selectedSubjects)
      .filter(([, v]) => v).map(([k]) => k);
    const filtered = qSet.filter(q => activeSubIds.some(id => (q.subject || '').toLowerCase().includes(id)));
    if (filtered.length > 0) qSet = filtered;
  }

  // Shuffle and deduplicate
  const shuffled = [...qSet].sort(() => Math.random() - 0.5);
  const uniqueList = deduplicateList([], shuffled);

  // If unique list is smaller than requested count, fill with distinct ID copies only as last resort
  const result = [...uniqueList];
  let ptr = 0;
  while (result.length < count && uniqueList.length > 0) {
    const item = uniqueList[ptr % uniqueList.length];
    result.push({ ...item, id: `${item.id || 'q'}-variant-${result.length}` });
    ptr++;
  }

  return result.slice(0, count);
}

export function PrelimsHub({ onTestStart, onTestEnd }) {
  const { activeExam, saveEvaluationResult, language, getTeacherPrelimsMCQs } = useApp();
  const { apiKey } = useAuth();
  const isHi = language === 'hi';

  const [step, setStep] = useState('home');
  const [testConfig, setTestConfig] = useState({
    exam: activeExam,
    testType: 'full_length',
    questionCount: 100,
    negMarking: activeExam === 'bpsc' ? 0.33 : 0.66
  });

  // Questions state — starts empty, fills via AI or static
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ done: 0, total: 0 });
  const [apiError, setApiError] = useState('');
  const generationAbortRef = useRef(false);
  const configRef = useRef(testConfig);

  const [finalResult, setFinalResult] = useState(null);

  // Notify parent on test active change
  useEffect(() => {
    if (step === 'exam') onTestStart?.();
    else onTestEnd?.();
  }, [step]);

  const handleSelectHomeAction = (actionId) => {
    if (actionId === 'pyqs') {
      // Load real PYQs directly — skip config/instructions, go straight to PYQ mode
      const pyqs = getPYQsByExam(activeExam);
      if (pyqs.length === 0) {
        alert('No PYQs available yet. Coming soon!');
        return;
      }
      const shuffled = [...pyqs].sort(() => Math.random() - 0.5);
      setActiveQuestions(shuffled);
      setTestConfig(prev => ({
        ...prev,
        exam: activeExam,
        testType: 'pyq',
        questionCount: shuffled.length,
        negMarking: activeExam === 'bpsc' ? 0.33 : 0.66,
        posMarking: activeExam === 'bpsc' ? 1.0 : 2.0,
      }));
      setGenerationProgress({ done: shuffled.length, total: shuffled.length });
      setStep('instructions');
      return;
    }

    if (actionId === 'teacher_questions') {
      // Load teacher/faculty uploaded questions directly — NO AI system!
      const teacherQs = getTeacherPrelimsMCQs ? getTeacherPrelimsMCQs(activeExam) : [];
      if (!teacherQs || teacherQs.length === 0) {
        alert(isHi ? 'अभी तक कोई शिक्षक प्रश्न अपलोड नहीं किया गया है।' : 'No Teacher Premium Questions uploaded yet.');
        return;
      }
      const shuffled = [...teacherQs].sort(() => Math.random() - 0.5);
      setActiveQuestions(shuffled);
      setTestConfig(prev => ({
        ...prev,
        exam: activeExam,
        testType: 'teacher_questions',
        questionCount: shuffled.length,
        negMarking: activeExam === 'bpsc' ? 0.33 : 0.66,
        posMarking: activeExam === 'bpsc' ? 1.0 : 2.0,
      }));
      setGenerationProgress({ done: shuffled.length, total: shuffled.length });
      setStep('instructions');
      return;
    }

    // Normal flow — go to config page
    setTestConfig(prev => ({
      ...prev,
      exam: activeExam,
      testType: 'full_length',
      questionCount: 100,
    }));
    setStep('config');
  };

  // ── Core: Generate questions with Gemini in 10-batch increments ──
  const generateQuestions = useCallback(async (configData) => {
    setIsGenerating(true);
    setApiError('');
    generationAbortRef.current = false;
    configRef.current = configData;

    // Direct return for teacher_questions or pyq — Zero AI call!
    if (configData?.testType === 'teacher_questions' || configData?.testType === 'pyq') {
      const teacherQs = getTeacherPrelimsMCQs ? getTeacherPrelimsMCQs(configData.exam || activeExam) : [];
      const finalQs = teacherQs.length > 0 ? teacherQs : activeQuestions;
      if (finalQs.length > 0) {
        setActiveQuestions(finalQs);
        setGenerationProgress({ done: finalQs.length, total: finalQs.length });
      }
      setIsGenerating(false);
      return;
    }

    setActiveQuestions([]);
    const targetCount = configData.questionCount || 100;
    setGenerationProgress({ done: 0, total: targetCount });

    const exam = configData.exam || activeExam;

    // Determine subject label
    const subjects = configData.selectedSubjects
      ? Object.entries(configData.selectedSubjects).filter(([, v]) => v).map(([k]) => k)
      : null;
    const subject = subjects?.length
      ? subjects.join(', ')
      : (exam === 'bpsc' ? 'Bihar GK, Modern History, Geography, Polity, Economy' : 'History, Geography, Polity, Economy, Environment, Science');
    const difficulty = configData.difficulty || 'medium';

    const key = apiKey?.trim();

    const allQ = [];
    const batchCount = Math.ceil(targetCount / BATCH_SIZE);

    for (let b = 0; b < batchCount; b++) {
      if (generationAbortRef.current) break;
      const remaining = targetCount - allQ.length;
      if (remaining <= 0) break;
      const batchSize = Math.min(BATCH_SIZE, remaining);

      try {
        const previousTitles = allQ.map(q => (q.questionEn || q.questionHi || '').slice(0, 50));
        const batch = await generatePrelimsBatch({
          exam, subject, difficulty,
          batchIndex: b, batchSize,
          apiKey: key, language,
          previousTitles
        });

        if (batch.length > 0) {
          const deduplicated = deduplicateList(allQ, batch);
          allQ.length = 0;
          allQ.push(...deduplicated);
          setActiveQuestions(prev => deduplicateList(prev, batch));
          setGenerationProgress({ done: allQ.length, total: targetCount });
        } else {
          throw new Error('Empty batch');
        }
      } catch (err) {
        console.warn(`[PrelimsHub] Batch ${b + 1} failed:`, err.message);
        // If first batch fails, fall back to static
        if (allQ.length === 0) {
          const fallback = buildStaticFallback(exam, configData, targetCount);
          setActiveQuestions(fallback);
          setGenerationProgress({ done: fallback.length, total: targetCount });
          setApiError(isHi
            ? `AI से कनेक्ट नहीं हो पाया — static प्रश्न बैंक से ${fallback.length} प्रश्न लोड किए।`
            : `AI connection failed — loaded ${fallback.length} questions from static bank.`
          );
          setIsGenerating(false);
          return;
        }
        // Partial: fill remaining with static
        const staticFill = buildStaticFallback(exam, configData, remaining - allQ.length + (allQ.length));
        const needed = remaining;
        allQ.push(...staticFill.slice(0, needed));
        setActiveQuestions(prev => [...prev, ...staticFill.slice(0, needed)]);
        setGenerationProgress({ done: allQ.length, total: targetCount });
        break;
      }
    }

    setIsGenerating(false);
  }, [apiKey, activeExam, language]);

  const handleProceedToInstructions = (configData) => {
    setTestConfig(configData);
    generateQuestions(configData); // start generating right away in background
    setStep('instructions');
  };

  const handleStartExam = () => setStep('exam');

  const handleExamCompleted = (resultObj) => {
    generationAbortRef.current = true;
    const { questions = [], selectedAnswers = {}, config = {}, timeTakenSecs = 0 } = resultObj;
    const isBpsc = (config.exam || activeExam) === 'bpsc';
    const posMark = isBpsc ? 1.0 : (config.testType === 'csat' ? 2.5 : 2.0);
    const negMark = isBpsc ? 0.33 : 0.66;

    let correctCount = 0, wrongCount = 0, unattemptedCount = 0;
    const subjectMap = {};

    questions.forEach(q => {
      const userAns = selectedAnswers[q.id];
      const subj = q.subject || 'General';
      if (!subjectMap[subj]) subjectMap[subj] = { correct: 0, wrong: 0, total: 0 };
      subjectMap[subj].total++;
      if (userAns === undefined) { unattemptedCount++; }
      else if (userAns === q.correctIndex) { correctCount++; subjectMap[subj].correct++; }
      else { wrongCount++; subjectMap[subj].wrong++; }
    });

    const netScore = Math.max(0, (correctCount * posMark) - (wrongCount * negMark));
    const maxMarks = Math.round(questions.length * posMark);
    const percentage = maxMarks > 0 ? Math.round((netScore / maxMarks) * 100) : 0;
    const accuracy = (correctCount + wrongCount) > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0;
    const tag = percentage >= 70 ? 'Excellent' : percentage >= 55 ? 'Good' : percentage >= 40 ? 'Average' : 'Needs Work';
    const subjectBreakdown = Object.entries(subjectMap).reduce((acc, [subj, stats]) => {
      acc[subj] = Math.round(stats.total > 0 ? (stats.correct / stats.total) * 100 : 0);
      return acc;
    }, {});

    const enrichedResult = {
      ...resultObj, correctCount, wrongCount, unattemptedCount,
      score: Number(netScore.toFixed(2)), maxMarks, percentage, accuracy, tag,
      subjectBreakdown, timeTakenSecs,
    };
    setFinalResult(enrichedResult);

    // ── Save all questions to Improvement Book (localStorage, permanent) ──
    try {
      saveTestToImprovementBook({
        questions,
        selectedAnswers,
        exam: config.exam || activeExam,
        testDate: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[PrelimsHub] Could not save to ImprovementBook:', e);
    }

    saveEvaluationResult({
      evaluationType: 'prelims_test',
      exam: config.exam || activeExam,
      examLabel: (config.exam || activeExam) === 'bpsc' ? 'BPSC 72nd CCE Prelims' : 'UPSC Prelims 2026',
      paper: config.testType === 'full_length' ? 'GS Paper I (Full Length)' : config.testType === 'pyq' ? 'PYQ Vault' : `Subject-wise (${config.questionCount}Q)`,
      questionTitle: `${(config.exam || activeExam).toUpperCase()} Prelims ${config.testType === 'full_length' ? 'Full Mock' : config.testType === 'pyq' ? 'PYQ Practice' : 'Practice Test'} — ${questions.length}Q`,
      score: Number(netScore.toFixed(2)), maxMarks, percentage, tag,
      correctCount, wrongCount, unattemptedCount,
      totalQuestions: questions.length, accuracy,
      negMarking: negMark, posMarking: posMark, timeTakenSecs, subjectBreakdown,
      keyStrengths: correctCount > 0 ? [`${correctCount} correct`, `${accuracy}% accuracy`] : [],
      keyMistakes: wrongCount > 0 ? [`${wrongCount} wrong (neg marking)`, unattemptedCount > 0 ? `${unattemptedCount} unattempted` : ''].filter(Boolean) : [],
      missedDemandPoints: [],
      overallFeedback: `Score: ${netScore.toFixed(2)}/${maxMarks} (${percentage}%). Correct: ${correctCount}, Wrong: ${wrongCount}, Unattempted: ${unattemptedCount}. Time: ${Math.floor(timeTakenSecs / 60)}m ${timeTakenSecs % 60}s.`,
    });

    setStep('result');
  };

  // ── Step renders ──

  if (step === 'config') {
    return (
      <PrelimsTestConfig
        onGoBack={() => setStep('home')}
        onProceedToInstructions={handleProceedToInstructions}
      />
    );
  }

  if (step === 'instructions') {
    const pct = generationProgress.total > 0
      ? Math.round((generationProgress.done / generationProgress.total) * 100)
      : 0;

    return (
      <div className="space-y-4">
        {/* Generation Progress */}
        {isGenerating ? (
          <div className="p-4 rounded-2xl border border-blue-500/30 flex items-center gap-3 animate-fadeIn"
            style={{ background: 'rgba(59,130,246,0.07)' }}>
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-blue-600 mb-1.5">
                {isHi
                  ? `⚡ ${generationProgress.done}/${generationProgress.total} प्रश्न तैयार किए जा रहे हैं...`
                  : `⚡ Generating ${generationProgress.done}/${generationProgress.total} questions...`}
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(5, pct)}%` }}
                />
              </div>
              <div className="text-[10px] mt-1 font-medium text-blue-400">
                {isHi ? 'आप Instructions पढ़ते रहें, प्रश्न बैकग्राउंड में तैयार हो रहे हैं।' : 'Read instructions while questions generate in the background.'}
              </div>
            </div>
          </div>
        ) : activeQuestions.length > 0 ? (
          <div className="p-3 rounded-2xl border border-emerald-500/30 flex items-center gap-2 animate-fadeIn"
            style={{ background: 'rgba(16,185,129,0.07)' }}>
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-extrabold text-emerald-600">
              ✅ {isHi ? `${activeQuestions.length} प्रश्न तैयार!` : `${activeQuestions.length} questions ready!`}
              {apiError && <span className="ml-2 font-medium text-amber-600">({apiError})</span>}
            </span>
          </div>
        ) : null}

        <PrelimsInstructions
          config={testConfig}
          onGoBack={() => { generationAbortRef.current = true; setStep('config'); }}
          onStartTest={handleStartExam}
          questionsReady={!isGenerating && activeQuestions.length > 0}
          isGenerating={isGenerating}
          generatedCount={activeQuestions.length}
        />
      </div>
    );
  }

  if (step === 'exam') {
    // Always have questions — use generated or fallback
    const examQs = activeQuestions.length > 0
      ? activeQuestions
      : buildStaticFallback(testConfig.exam || activeExam, testConfig, testConfig.questionCount);

    return (
      <PrelimsExamInterface
        questions={examQs}
        config={testConfig}
        onTestSubmit={handleExamCompleted}
        liveQuestions={activeQuestions} // pass live so palette updates as more generate
      />
    );
  }

  if (step === 'result' && finalResult) {
    return (
      <PrelimsResultAnalysis
        resultData={finalResult}
        onBackToDashboard={() => { setStep('home'); setActiveQuestions([]); setGenerationProgress({ done: 0, total: 0 }); }}
      />
    );
  }

  return <PrelimsHome onSelectAction={handleSelectHomeAction} />;
}
