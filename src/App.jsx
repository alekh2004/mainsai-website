import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';
import { DashboardSidebar } from './components/common/DashboardSidebar';
import { ThemeSwitcher } from './components/common/ThemeSwitcher';
import { AuthModal } from './components/auth/AuthModal';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { ExamSelector } from './components/dashboard/ExamSelector';
import { PaperSelector } from './components/dashboard/PaperSelector';
import { StatsOverview } from './components/dashboard/StatsOverview';
import { InsightsView } from './components/dashboard/InsightsView';
import { ProfileView } from './components/dashboard/ProfileView';
import { TestHistory } from './components/dashboard/TestHistory';
import { ModeSelector } from './components/test/ModeSelector';
import { AiQuestionGenerator } from './components/test/AiQuestionGenerator';
import { ManualQuestionBank } from './components/test/ManualQuestionBank';
import { AnswerSubmitModal } from './components/test/AnswerSubmitModal';
import { EvaluationResultModal } from './components/evaluation/EvaluationResultModal';
import { TeacherReviewQueue } from './components/evaluation/TeacherReviewQueue';
import { StudentTeacherSubmissionsModal } from './components/evaluation/StudentTeacherSubmissionsModal';
import { DeepAnswerChecker } from './components/evaluation/DeepAnswerChecker';
import { AdminQuestionUpload } from './components/admin/AdminQuestionUpload';
import { SubscriptionModal } from './components/payment/SubscriptionModal';
import { AiFlashcardsModal } from './components/study/AiFlashcardsModal';
import { AiMainsNotesModal } from './components/study/AiMainsNotesModal';
import { ArrowLeft, Heart, Home, Sparkles, History, BarChart3, User, Layers, BookOpen } from 'lucide-react';

import { BackgroundRenderer } from './components/common/BackgroundRenderer';


function MainAppContent() {
  const { user, setShowPayModal: openPayModal } = useAuth();
  const { activeMode, language, adminQuestions, evaluations } = useApp();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState('home');
  const [selectedPaper, setSelectedPaper] = useState(null);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentTeacherModal, setShowStudentTeacherModal] = useState(false);

  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [showMainsNotesModal, setShowMainsNotesModal] = useState(false);
  const [showDeepChecker, setShowDeepChecker] = useState(false);
  const [deepCheckerQuestion, setDeepCheckerQuestion] = useState(null);

  const [selectedAttemptQuestion, setSelectedAttemptQuestion] = useState(null);
  const [activeEvaluationResult, setActiveEvaluationResult] = useState(null);

  const handleResetToHome = () => {
    setActiveTab('home');
    setSelectedPaper(null);
    setSelectedAttemptQuestion(null);
    setActiveEvaluationResult(null);
  };

  const handleQuickActionFromHome = (actionKey) => {
    if (actionKey === 'ai_test' || actionKey === 'upload') {
      setActiveTab('evaluate');
      setSelectedPaper(null);
    } else if (actionKey === 'history') {
      setActiveTab('history');
    } else if (actionKey === 'insights') {
      setActiveTab('insights');
    } else if (actionKey === 'teacher') {
      if (user?.role === 'teacher' || user?.role === 'admin') {
        setShowTeacherModal(true);
      } else {
        setShowStudentTeacherModal(true);
      }
    }
  };

  const handleOpenQuestionFromAlert = (qId) => {
    const q = adminQuestions?.find(item => item.id === qId);
    if (q) {
      setSelectedAttemptQuestion(q);
    } else {
      setActiveTab('evaluate');
    }
  };

  const handleOpenEvaluationFromAlert = (resultId) => {
    const ev = evaluations?.find(item => item.queueId === resultId || item.id === resultId);
    if (ev) {
      setActiveEvaluationResult(ev);
    } else {
      setActiveTab('history');
    }
  };

  if (!user) return <AuthModal isFullScreen={true} />;

  return (
    <div className="app-root min-h-screen flex flex-col selection:bg-blue-500 selection:text-white">

      {/* Dynamic Glassmorphic Background (World Map / Universe / Aurora / Minimal) */}
      <BackgroundRenderer />

      <div className="content-layer flex flex-col min-h-screen">

        {/* Navbar â€” pass theme switcher as slot */}
        <Navbar
          onOpenApiKey={() => setShowApiKeyModal(true)}
          onOpenAdmin={() => setShowAdminModal(true)}
          onOpenTeacherQueue={() => setShowTeacherModal(true)}
          onOpenQuestion={handleOpenQuestionFromAlert}
          onOpenEvaluation={handleOpenEvaluationFromAlert}
          onGoHome={handleResetToHome}
          rightSlot={<ThemeSwitcher />}
        />

        {/* â”€â”€ Main Layout: Sidebar (desktop) + Content â”€â”€ */}
        <div className="flex flex-1 overflow-hidden">

          {/* Desktop Sidebar */}
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={(tab) => { setActiveTab(tab); if (tab === 'evaluate') setSelectedPaper(null); }}
            onOpenFlashcards={() => setShowFlashcardsModal(true)}
            onOpenMainsNotes={() => setShowMainsNotesModal(true)}
            onOpenSubscription={() => openPayModal(true)}
          />

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

            {/* Main Content */}
            <main className="flex-1 w-full px-4 lg:px-8 py-6 space-y-6 pb-24 md:pb-12 max-w-5xl">

              {activeTab === 'home' && (
                <div className="animate-fadeIn">
                  <StatsOverview
                    onQuickAction={handleQuickActionFromHome}
                    onViewEvaluation={(evalItem) => setActiveEvaluationResult(evalItem)}
                    onOpenFlashcards={() => setShowFlashcardsModal(true)}
                    onOpenMainsNotes={() => setShowMainsNotesModal(true)}
                  />
                </div>
              )}

              {activeTab === 'evaluate' && (
                <div className="space-y-5 animate-fadeIn">
                  {!selectedPaper ? (
                    <>
                      <ExamSelector />
                      <PaperSelector onSelectPaper={setSelectedPaper} />
                    </>
                  ) : (
                    <div className="space-y-5">
                      <button
                        onClick={() => setSelectedPaper(null)}
                        className="glass-card-clean px-3.5 py-2 rounded-xl border border-white/40 text-xs font-bold flex items-center gap-1.5 transition-all hover:border-white/70"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <ArrowLeft className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
                        {isHi ? 'à¤ªà¥‡à¤ªà¤° à¤šà¤¯à¤¨ à¤ªà¤° à¤µà¤¾à¤ªà¤¸' : 'Back to Paper Selection'}
                      </button>
                      <ModeSelector />
                      {activeMode === 'ai_gen'
                        ? <AiQuestionGenerator onAttemptQuestion={setSelectedAttemptQuestion} onGoBack={() => setSelectedPaper(null)} />
                        : <ManualQuestionBank onAttemptQuestion={setSelectedAttemptQuestion} onOpenAdmin={() => setShowAdminModal(true)} onGoBack={() => setSelectedPaper(null)} />
                      }
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="animate-fadeIn">
                  <TestHistory onViewReport={setActiveEvaluationResult} onGoBack={handleResetToHome} />
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="animate-fadeIn">
                  <InsightsView />
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="animate-fadeIn">
                  <ProfileView onOpenSubscription={() => openPayModal(true)} onOpenSettings={() => setShowApiKeyModal(true)} />
                </div>
              )}

            </main>

            {/* Footer */}
            <footer
              className="w-full px-4 lg:px-8 py-5 border-t text-center text-xs font-medium"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>for UPSC &amp; BPSC Aspirants â€¢ Gemini Vision AI Evaluation</span>
              </div>
            </footer>

          </div>
        </div>

        {/* Mobile Bottom Dock */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>


      {/* â”€â”€ Modals â”€â”€ */}
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
      <AdminQuestionUpload isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
      <TeacherReviewQueue isOpen={showTeacherModal} onClose={() => setShowTeacherModal(false)} />
      <StudentTeacherSubmissionsModal
        isOpen={showStudentTeacherModal}
        onClose={() => setShowStudentTeacherModal(false)}
        onViewCheckedResult={(checkedItem) => {
          setActiveEvaluationResult(checkedItem);
        }}
        onOpenSubmitModal={() => {
          setActiveTab('evaluate');
          setSelectedPaper(null);
        }}
      />
      <SubscriptionModal />
      <AiFlashcardsModal isOpen={showFlashcardsModal} onClose={() => setShowFlashcardsModal(false)} />
      <AiMainsNotesModal isOpen={showMainsNotesModal} onClose={() => setShowMainsNotesModal(false)} />

      <AnswerSubmitModal
        isOpen={!!selectedAttemptQuestion}
        question={selectedAttemptQuestion}
        onClose={() => setSelectedAttemptQuestion(null)}
        onEvaluationComplete={(evalResult) => {
          setActiveEvaluationResult(evalResult);
          setActiveTab('history');
        }}
        onOpenDeepChecker={(q) => {
          setDeepCheckerQuestion(q);
          setShowDeepChecker(true);
          setSelectedAttemptQuestion(null);
        }}
      />

      <DeepAnswerChecker
        isOpen={showDeepChecker}
        question={deepCheckerQuestion}
        onClose={() => { setShowDeepChecker(false); setDeepCheckerQuestion(null); }}
        onEvaluationComplete={(evalResult) => {
          setActiveEvaluationResult(evalResult);
          setActiveTab('history');
        }}
      />

      <EvaluationResultModal
        isOpen={!!activeEvaluationResult}
        result={activeEvaluationResult}
        onClose={() => setActiveEvaluationResult(null)}
        onRequestTeacherReview={() => alert('Submitted to Teacher Queue!')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}

