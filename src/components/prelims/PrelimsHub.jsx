import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PRELIMS_QUESTION_BANK } from '../../data/prelimsQuestions';
import { generatePrelimsBatch, hasValidApiKey } from '../../services/prelimsAiGenerator';
import { PrelimsHome } from './PrelimsHome';
import { PrelimsTestConfig } from './PrelimsTestConfig';
import { PrelimsInstructions } from './PrelimsInstructions';
import { PrelimsExamInterface } from './PrelimsExamInterface';
import { PrelimsResultAnalysis } from './PrelimsResultAnalysis';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';

const BATCH_SIZE = 10;

export function PrelimsHub({ onTestStart, onTestEnd }) {
  const { activeExam, saveEvaluationResult, language } = useApp();
  const { apiKey } = useAuth();
  const isHi = language === 'hi';

  const [step, setStep] = useState('home');
  const [testConfig, setTestConfig] = useState({
    exam: activeExam,
    testType: 'full_length',
    questionCount: 100,
    negMarking: activeExam === 'bpsc' ? 0.33 : 0.66
  });

  // Batch generation state
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ done: 0, total: 0 });
  const [generationError, setGenerationError] = useState('');
  const generationAbortRef = useRef(false);

  const [finalResult, setFinalResult] = useState(null);

  // Notify parent when test active status changes
  useEffect(() => {
    if (step === 'exam') onTestStart?.();
    else onTestEnd?.();
  }, [step]);

  const handleSelectHomeAction = (actionId) => {
    setTestConfig(prev => ({
      ...prev,
      exam: activeExam,
      testType: actionId === 'pyqs' ? 'full_length' : 'full_length',
      questionCount: actionId === 'pyqs' ? 50 : 100,
      filterPyq: actionId === 'pyqs'
    }));
    setStep('config');
  };

  // ── Core: Generate questions using Gemini in batches ──
  const generateQuestions = async (configData) => {
    setIsGenerating(true);
    setGenerationError('');
    generationAbortRef.current = false;
    const targetCount = configData.questionCount || 100;
    setGenerationProgress({ done: 0, total: targetCount });

    const exam = configData.exam || activeExam;
    const subjects = configData.selectedSubjects
      ? Object.entries(configData.selectedSubjects).filter(([, v]) => v).map(([k]) => k)
      : null;
    const subject = subjects?.length ? subjects.join(', ') : (exam === 'bpsc' ? 'General Studies Bihar' : 'General Studies');
    const difficulty = configData.difficulty || 'medium';

    // Fall back to static bank if no API key
    if (!hasValidApiKey(apiKey)) {
      console.warn('[PrelimsHub] No API key — using static question bank');
      const staticQ = buildStaticFallback(exam, configData, targetCount);
      setActiveQuestions(staticQ);
      setIsGenerating(false);
      return staticQ;
    }

    const allQ = [];
    const batchCount = Math.ceil(targetCount / BATCH_SIZE);

    // Generate first batch synchronously (show immediately)
    try {
      const firstBatch = await generatePrelimsBatch({
        exam, subject, difficulty,
        batchIndex: 0, batchSize: Math.min(BATCH_SIZE, targetCount),
        apiKey, language
      });
      allQ.push(...firstBatch);
      setActiveQuestions([...allQ]);
      setGenerationProgress({ done: allQ.length, total: targetCount });
    } catch (err) {
      console.warn('[PrelimsHub] First batch failed, using static fallback:', err.message);
      const fallback = buildStaticFallback(exam, configData, targetCount);
      setActiveQuestions(fallback);
      setIsGenerating(false);
      return fallback;
    }

    // Generate remaining batches in background
    for (let b = 1; b < batchCount; b++) {
      if (generationAbortRef.current) break;
      const remaining = targetCount - allQ.length;
      if (remaining <= 0) break;
      try {
        const batch = await generatePrelimsBatch({
          exam, subject, difficulty,
          batchIndex: b, batchSize: Math.min(BATCH_SIZE, remaining),
          apiKey, language
        });
        allQ.push(...batch);
        setActiveQuestions([...allQ]);
        setGenerationProgress({ done: allQ.length, total: targetCount });
      } catch (err) {
        console.warn(`[PrelimsHub] Batch ${b} failed:`, err.message);
        // Fill remaining with static questions
        const staticFill = buildStaticFallback(exam, configData, remaining);
        allQ.push(...staticFill.slice(0, remaining));
        setActiveQuestions([...allQ]);
        break;
      }
    }

    setIsGenerating(false);
    return allQ.slice(0, targetCount);
  };

  function buildStaticFallback(exam, configData, count) {
    let qSet = PRELIMS_QUESTION_BANK.filter(q => q.exam === exam);
    if (qSet.length === 0) qSet = PRELIMS_QUESTION_BANK;

    if (configData.testType === 'subject_wise' && configData.selectedSubjects) {
      const activeSubIds = Object.entries(configData.selectedSubjects)
        .filter(([, v]) => v).map(([k]) => k);
      const filtered = qSet.filter(q => activeSubIds.some(id => (q.subject || '').toLowerCase().includes(id)));
      if (filtered.length > 0) qSet = filtered;
    }
    // Shuffle and repeat to fill count
    const shuffled = [...qSet].sort(() => Math.random() - 0.5);
    while (shuffled.length < count) shuffled.push(...qSet.sort(() => Math.random() - 0.5));
    return shuffled.slice(0, count);
  }

  const handleProceedToInstructions = async (configData) => {
    setTestConfig(configData);
    // Start generating in background right away
    generateQuestions(configData);
    setStep('instructions');
  };

  const handleStartExam = () => {
    setStep('exam');
  };

  const handleExamCompleted = (resultObj) => {
    generationAbortRef.current = true; // stop background generation
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

    const rawScore = (correctCount * posMark) - (wrongCount * negMark);
    const netScore = Math.max(0, rawScore);
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

    saveEvaluationResult({
      evaluationType: 'prelims_test',
      exam: config.exam || activeExam,
      examLabel: (config.exam || activeExam) === 'bpsc' ? 'BPSC Prelims' : 'UPSC Prelims',
      paper: config.testType === 'full_length' ? 'GS Paper I (Full Length)' : `Subject-wise (${config.questionCount}Q)`,
      questionTitle: `${(config.exam || activeExam).toUpperCase()} Prelims ${config.testType === 'full_length' ? 'Full Mock' : 'Practice Test'} — ${questions.length}Q`,
      score: Number(netScore.toFixed(2)), maxMarks, percentage, tag,
      correctCount, wrongCount, unattemptedCount,
      totalQuestions: questions.length, accuracy,
      negMarking: negMark, posMarking: posMark, timeTakenSecs, subjectBreakdown,
      keyStrengths: correctCount > 0 ? [`${correctCount} correct answers`, `${accuracy}% accuracy`] : [],
      keyMistakes: wrongCount > 0 ? [`${wrongCount} wrong answers (neg marking)`, unattemptedCount > 0 ? `${unattemptedCount} unattempted` : ''].filter(Boolean) : [],
      missedDemandPoints: [],
      overallFeedback: `Score: ${netScore.toFixed(2)}/${maxMarks} (${percentage}%). Correct: ${correctCount}, Wrong: ${wrongCount}, Unattempted: ${unattemptedCount}. Time: ${Math.floor(timeTakenSecs / 60)}m ${timeTakenSecs % 60}s.`,
    });

    setStep('result');
  };

  // ── Render ──

  if (step === 'config') {
    return (
      <PrelimsTestConfig
        onGoBack={() => setStep('home')}
        onProceedToInstructions={handleProceedToInstructions}
      />
    );
  }

  if (step === 'instructions') {
    return (
      <div className="space-y-4">
        {/* Generation Progress Banner */}
        {isGenerating && (
          <div className="glass-card-clean p-4 rounded-2xl border border-blue-500/30 flex items-center gap-3"
            style={{ background: 'rgba(59,130,246,0.08)' }}>
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-blue-600 mb-1">
                {isHi ? `AI प्रश्न तैयार हो रहे हैं... (${generationProgress.done}/${generationProgress.total})` : `AI generating questions... (${generationProgress.done}/${generationProgress.total})`}
              </div>
              <div className="h-1.5 bg-blue-200/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress.total > 0 ? (generationProgress.done / generationProgress.total) * 100 : 10}%` }}
                />
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          </div>
        )}
        {!isGenerating && activeQuestions.length > 0 && (
          <div className="glass-card-clean p-3 rounded-2xl border border-emerald-500/30 flex items-center gap-2"
            style={{ background: 'rgba(16,185,129,0.07)' }}>
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-extrabold text-emerald-600">
              {isHi ? `✅ ${activeQuestions.length} प्रश्न तैयार हैं!` : `✅ ${activeQuestions.length} questions ready!`}
            </span>
          </div>
        )}
        <PrelimsInstructions
          config={testConfig}
          onGoBack={() => { generationAbortRef.current = true; setStep('config'); }}
          onStartTest={handleStartExam}
          questionsReady={activeQuestions.length > 0}
          isGenerating={isGenerating}
        />
      </div>
    );
  }

  if (step === 'exam') {
    const examQs = activeQuestions.length > 0 ? activeQuestions : buildStaticFallback(activeExam, testConfig, testConfig.questionCount);
    return (
      <PrelimsExamInterface
        questions={examQs}
        config={testConfig}
        onTestSubmit={handleExamCompleted}
        backgroundQuestions={activeQuestions}
      />
    );
  }

  if (step === 'result' && finalResult) {
    return (
      <PrelimsResultAnalysis
        resultData={finalResult}
        onBackToDashboard={() => { setStep('home'); setActiveQuestions([]); }}
      />
    );
  }

  return <PrelimsHome onSelectAction={handleSelectHomeAction} />;
}
