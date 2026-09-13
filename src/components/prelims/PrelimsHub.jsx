import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRELIMS_QUESTION_BANK } from '../../data/prelimsQuestions';
import { PrelimsHome } from './PrelimsHome';
import { PrelimsTestConfig } from './PrelimsTestConfig';
import { PrelimsInstructions } from './PrelimsInstructions';
import { PrelimsExamInterface } from './PrelimsExamInterface';
import { PrelimsResultAnalysis } from './PrelimsResultAnalysis';

export function PrelimsHub() {
  const { activeExam, saveEvaluationResult } = useApp();

  const [step, setStep] = useState('home'); // 'home' | 'config' | 'instructions' | 'exam' | 'result'
  const [testConfig, setTestConfig] = useState({
    exam: activeExam,
    testType: 'full_length',
    questionCount: 100,
    negMarking: activeExam === 'bpsc' ? 0.33 : 0.66
  });
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [finalResult, setFinalResult] = useState(null);

  const handleSelectHomeAction = (actionId) => {
    if (actionId === 'pyqs') {
      // PYQs vault → go to config with PYQ filter
      setTestConfig(prev => ({ ...prev, testType: 'full_length', filterPyq: true, questionCount: 50 }));
      setStep('config');
      return;
    }
    // tests action
    setTestConfig(prev => ({ ...prev, testType: 'full_length', questionCount: 100 }));
    setStep('config');
  };

  const handleProceedToInstructions = (configData) => {
    setTestConfig(configData);

    // Filter questions based on exam
    let qSet = PRELIMS_QUESTION_BANK.filter(q => q.exam === (configData.exam || activeExam));
    if (qSet.length === 0) {
      qSet = PRELIMS_QUESTION_BANK;
    }

    // Further filter by selected subjects if subject_wise
    if (configData.testType === 'subject_wise' && configData.selectedSubjects) {
      const activeSubIds = Object.entries(configData.selectedSubjects)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const subFiltered = qSet.filter(q => activeSubIds.some(id => (q.subject || '').toLowerCase().includes(id)));
      if (subFiltered.length > 0) qSet = subFiltered;
    }

    // Shuffle and limit
    const shuffled = [...qSet].sort(() => Math.random() - 0.5);
    setActiveQuestions(shuffled.slice(0, configData.questionCount));
    setStep('instructions');
  };

  const handleStartExam = () => {
    setStep('exam');
  };

  const handleExamCompleted = (resultObj) => {
    // ── Calculate full result stats ──
    const { questions = [], selectedAnswers = {}, config = {}, timeTakenSecs = 0 } = resultObj;
    const isBpsc = (config.exam || activeExam) === 'bpsc';
    const posMark = isBpsc ? 1.0 : (config.testType === 'csat' ? 2.5 : 2.0);
    const negMark = isBpsc ? 0.33 : 0.66;

    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    // Subject-wise accuracy map
    const subjectMap = {};
    questions.forEach(q => {
      const userAns = selectedAnswers[q.id];
      const subj = q.subject || 'General';
      if (!subjectMap[subj]) subjectMap[subj] = { correct: 0, wrong: 0, total: 0 };
      subjectMap[subj].total++;

      if (userAns === undefined) {
        unattemptedCount++;
      } else if (userAns === q.correctIndex) {
        correctCount++;
        subjectMap[subj].correct++;
      } else {
        wrongCount++;
        subjectMap[subj].wrong++;
      }
    });

    const rawScore = (correctCount * posMark) - (wrongCount * negMark);
    const netScore = Math.max(0, rawScore);
    const maxMarks = Math.round(questions.length * posMark);
    const percentage = maxMarks > 0 ? Math.round((netScore / maxMarks) * 100) : 0;
    const accuracy = (correctCount + wrongCount) > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 0;

    const tag = percentage >= 70 ? 'Excellent' : percentage >= 55 ? 'Good' : percentage >= 40 ? 'Average' : 'Needs Work';

    // Build subject breakdown for paper-wise performance
    const subjectBreakdown = Object.entries(subjectMap).reduce((acc, [subj, stats]) => {
      acc[subj] = Math.round(stats.total > 0 ? (stats.correct / stats.total) * 100 : 0);
      return acc;
    }, {});

    const enrichedResult = {
      ...resultObj,
      correctCount,
      wrongCount,
      unattemptedCount,
      score: Number(netScore.toFixed(2)),
      maxMarks,
      percentage,
      accuracy,
      tag,
      subjectBreakdown,
      timeTakenSecs,
    };

    setFinalResult(enrichedResult);

    // ── Save to global evaluations (History + Insights) ──
    saveEvaluationResult({
      evaluationType: 'prelims_test',
      exam: config.exam || activeExam,
      examLabel: (config.exam || activeExam) === 'bpsc' ? 'BPSC Prelims' : 'UPSC Prelims',
      paper: config.testType === 'full_length' ? 'GS Paper I (Full Length)' : `Subject-wise (${config.questionCount}Q)`,
      questionTitle: `${(config.exam || activeExam).toUpperCase()} Prelims ${config.testType === 'full_length' ? 'Full Mock' : 'Practice Test'} — ${questions.length}Q`,
      score: Number(netScore.toFixed(2)),
      maxMarks,
      percentage,
      tag,
      correctCount,
      wrongCount,
      unattemptedCount,
      totalQuestions: questions.length,
      accuracy,
      negMarking: negMark,
      posMarking: posMark,
      timeTakenSecs,
      subjectBreakdown,
      // Dummy Mains-compat fields so Insights doesn't break
      keyStrengths: correctCount > 0 ? [`${correctCount} correct answers`, `${accuracy}% accuracy`] : [],
      keyMistakes: wrongCount > 0 ? [`${wrongCount} wrong answers (negative marking applied)`, unattemptedCount > 0 ? `${unattemptedCount} questions left unattempted` : ''].filter(Boolean) : [],
      missedDemandPoints: [],
      overallFeedback: `Prelims Score: ${netScore.toFixed(2)}/${maxMarks} (${percentage}%). Correct: ${correctCount}, Wrong: ${wrongCount}, Unattempted: ${unattemptedCount}. Time taken: ${Math.floor(timeTakenSecs / 60)} mins ${timeTakenSecs % 60} secs.`,
    });

    setStep('result');
  };

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
      <PrelimsInstructions
        config={testConfig}
        onGoBack={() => setStep('config')}
        onStartTest={handleStartExam}
      />
    );
  }

  if (step === 'exam') {
    return (
      <PrelimsExamInterface
        questions={activeQuestions}
        config={testConfig}
        onTestSubmit={handleExamCompleted}
      />
    );
  }

  if (step === 'result' && finalResult) {
    return (
      <PrelimsResultAnalysis
        resultData={finalResult}
        onBackToDashboard={() => setStep('home')}
      />
    );
  }

  return (
    <PrelimsHome onSelectAction={handleSelectHomeAction} />
  );
}
