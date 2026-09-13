import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRELIMS_QUESTION_BANK } from '../../data/prelimsQuestions';
import { PrelimsHome } from './PrelimsHome';
import { PrelimsTestConfig } from './PrelimsTestConfig';
import { PrelimsInstructions } from './PrelimsInstructions';
import { PrelimsExamInterface } from './PrelimsExamInterface';
import { PrelimsResultAnalysis } from './PrelimsResultAnalysis';

export function PrelimsHub() {
  const { activeExam } = useApp();

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
    if (actionId === 'performance') {
      // If result exists show it, else go to config
      if (finalResult) {
        setStep('result');
      } else {
        setStep('config');
      }
      return;
    }

    let defaultType = 'full_length';
    let count = 100;
    if (actionId === 'daily_quiz') { defaultType = 'short'; count = 10; }
    else if (actionId === 'subject_wise') { defaultType = 'subject_wise'; count = 30; }

    setTestConfig(prev => ({
      ...prev,
      testType: defaultType,
      questionCount: count
    }));

    setStep('config');
  };

  const handleProceedToInstructions = (configData) => {
    setTestConfig(configData);

    // Filter questions based on exam
    let qSet = PRELIMS_QUESTION_BANK.filter(q => q.exam === (configData.exam || activeExam));
    if (qSet.length === 0) {
      qSet = PRELIMS_QUESTION_BANK;
    }

    setActiveQuestions(qSet);
    setStep('instructions');
  };

  const handleStartExam = () => {
    setStep('exam');
  };

  const handleExamCompleted = (resultObj) => {
    setFinalResult(resultObj);
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
