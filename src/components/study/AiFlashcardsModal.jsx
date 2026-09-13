import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generateAiFlashcards } from '../../services/geminiService';
import {
  Sparkles, X, ChevronLeft, ChevronRight, RotateCw, Shuffle,
  CheckCircle2, BookOpen, Layers, ArrowLeft, RefreshCw, Award, Tag, Zap, AlertTriangle
} from 'lucide-react';

const SUGGESTED_TOPICS = [
  'Polity & Constitutional Articles',
  'Modern Indian History & Freedom Struggle',
  'Bihar Freedom Movement & Azad Dasta',
  'Supreme Court Landmark Judgments',
  'National Green Hydrogen & Net Zero 2070',
  'Saat Nischay-2 & Bihar Industrialization',
  'Economy, MSME & SIGHT Scheme',
  'Ethics, Nolan Committee & Governance'
];

const LS_FC_USAGE = 'mainsai_flashcard_usage_v1';
const MAX_DAILY_FLASHCARDS = 40;

function getFlashcardDailyUsage() {
  try {
    const raw = localStorage.getItem(LS_FC_USAGE);
    if (!raw) return 0;
    const { timestamp, count } = JSON.parse(raw);
    const now = Date.now();
    if (now - timestamp > 86400000) { // 24 hours
      localStorage.removeItem(LS_FC_USAGE);
      return 0;
    }
    return count || 0;
  } catch (e) {
    return 0;
  }
}

function incrementFlashcardUsage(addedCount) {
  try {
    const current = getFlashcardDailyUsage();
    const newCount = current + addedCount;
    localStorage.getItem(LS_FC_USAGE);
    localStorage.setItem(LS_FC_USAGE, JSON.stringify({
      timestamp: Date.now(),
      count: newCount
    }));
  } catch (e) {}
}

export function AiFlashcardsModal({ isOpen, onClose }) {
  const { apiKey } = useAuth();
  const { activeExam, language } = useApp();
  const isHi = language === 'hi';

  const [topic, setTopic] = useState('Polity & Constitutional Articles');
  const [customTopic, setCustomTopic] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deck, setDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState([]);
  const [limitError, setLimitError] = useState('');
  const [usageToday, setUsageToday] = useState(0);

  // ── Reset state every time modal opens fresh ──
  useEffect(() => {
    if (isOpen) {
      setDeck(null);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds([]);
      setCustomTopic('');
      setTopic('Polity & Constitutional Articles');
      setCardCount(10);
      setLimitError('');
      setUsageToday(getFlashcardDailyUsage());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (selectedTopic = topic) => {
    const finalTopic = customTopic.trim() || selectedTopic;
    setLimitError('');

    const currentUsed = getFlashcardDailyUsage();
    if (currentUsed + cardCount > MAX_DAILY_FLASHCARDS) {
      setLimitError(
        isHi
          ? `⚠️ 24 घंटे की दैनिक सीमा (${MAX_DAILY_FLASHCARDS} कार्ड्स) पूरी हो चुकी है। आपने आज ${currentUsed}/${MAX_DAILY_FLASHCARDS} कार्ड उपयोग किए हैं। कृपया 24 घंटे बाद प्रयास करें।`
          : `⚠️ Daily limit reached (${MAX_DAILY_FLASHCARDS} cards / 24h). You have used ${currentUsed}/${MAX_DAILY_FLASHCARDS} cards today. Please try again after 24 hours.`
      );
      return;
    }

    setIsGenerating(true);
    setIsFlipped(false);
    setCurrentIndex(0);

    try {
      const result = await generateAiFlashcards({
        topic: finalTopic,
        count: cardCount,
        examType: activeExam,
        language,
        apiKey
      });
      incrementFlashcardUsage(cardCount);
      setUsageToday(getFlashcardDailyUsage());
      setDeck(result);
    } catch (err) {
      console.error('Failed to generate flashcards:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCard = deck?.cards?.[currentIndex];

  const handleNext = () => {
    if (!deck) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
  };

  const handlePrev = () => {
    if (!deck) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.cards.length) % deck.cards.length);
  };

  const handleShuffle = () => {
    if (!deck) return;
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setDeck({ ...deck, cards: shuffled });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleMastered = (id) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card-clean rounded-3xl p-6 lg:p-8 border border-white/80 shadow-2xl my-8 space-y-6">

        {/* Modal Top Bar with Back and Close */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl glass-card-clean border border-white/40 hover:border-white/80 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: 'rgb(var(--accent))' }} />
              <span>{isHi ? 'वापस' : 'Back'}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgb(var(--accent)/0.15)', border: '1px solid rgb(var(--accent)/0.35)' }}>
                <Layers className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'रैपिड रिवीज़न फ्लैशकार्ड' : 'Rapid Revision Flashcards'}
                </h3>
                <span className="text-[10px] font-medium opacity-75" style={{ color: 'var(--text-secondary)' }}>
                  {activeExam.toUpperCase()} Mains • 3D Flip Mode
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Limit Warning if Daily Max Exceeded */}
        {limitError && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-300 font-bold flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{limitError}</span>
          </div>
        )}

        {/* Generator Controls (Topic & Card Count) */}
        {!deck ? (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                {isHi ? '1. विषय चुनें या टाइप करें' : '1. Select or Type Topic'}
              </label>
              
              {/* Quick Topic Chips */}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTopic(t); setCustomTopic(''); setLimitError(''); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      topic === t && !customTopic
                        ? 'border-current shadow-sm'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                    style={topic === t && !customTopic ? { color: 'rgb(var(--accent))', borderColor: 'rgb(var(--accent))', background: 'rgb(var(--accent)/0.12)' } : { color: 'var(--text-secondary)' }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Custom Topic Input */}
              <input
                type="text"
                placeholder={isHi ? 'या कोई भी कस्टम टॉपिक टाइप करें...' : 'Or type custom current affairs topic...'}
                value={customTopic}
                onChange={(e) => { setCustomTopic(e.target.value); setLimitError(''); }}
                className="w-full px-4 py-2.5 rounded-2xl glass-input-clean text-xs font-medium"
              />
            </div>

            {/* Card Count Selector (5, 10, 15, 20) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? '2. कार्ड की संख्या चुनें' : '2. Number of Flashcards'}
                </label>
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {isHi ? `आज का उपयोग: ${usageToday}/${MAX_DAILY_FLASHCARDS}` : `Used Today: ${usageToday}/${MAX_DAILY_FLASHCARDS}`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => { setCardCount(num); setLimitError(''); }}
                    className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                      cardCount === num
                        ? 'shadow-md scale-[1.02]'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                    style={cardCount === num ? { background: 'rgb(var(--accent))', color: '#fff', borderColor: 'rgb(var(--accent))' } : { color: 'var(--text-secondary)' }}
                  >
                    {num} Cards
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-medium m-0 pt-0.5">
                📌 {isHi ? 'प्रति 24 घंटे अधिकतम 40 फ्लैशकार्ड्स जेनरेट किए जा सकते हैं।' : 'Restriction: Maximum 40 flashcards allowed per 24 hours.'}
              </p>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl btn-primary-clean font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{isHi ? 'फ्लैशकार्ड्स तैयार हो रहे हैं...' : 'Generating Flashcards...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{isHi ? `${cardCount} फ्लैशकार्ड जेनरेट करें ⚡` : `Generate ${cardCount} Flashcards ⚡`}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Flashcard Deck Interactive Viewer */
          <div className="space-y-5 animate-fadeIn">
            {/* Top Deck Info Bar */}
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg" style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>
                  {deck.topic}
                </span>
                <span>
                  {currentIndex + 1} / {deck.cards.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Shuffle Cards"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeck(null)}
                  className="text-xs font-extrabold underline hover:opacity-80"
                  style={{ color: 'rgb(var(--accent))' }}
                >
                  {isHi ? 'नया डेक' : 'New Deck'}
                </button>
              </div>
            </div>

            {/* 3D Flip Card Container */}
            <div
              className="flashcard-container cursor-pointer select-none"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ perspective: '1200px' }}
            >
              <div
                className={`flashcard-inner relative w-full min-h-[320px] sm:min-h-[360px] rounded-3xl transition-transform duration-500 transform-gpu ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* ── CARD FRONT (Question / Concept) ── */}
                <div
                  className="flashcard-face flashcard-front absolute inset-0 p-6 sm:p-8 rounded-3xl glass-card-clean border border-white/40 shadow-xl flex flex-col justify-between overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                      {currentCard?.badge || 'Mains Concept'}
                    </span>
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                      CARD #{currentCard?.cardNumber}
                    </span>
                  </div>

                  <div className="space-y-3 my-auto py-4 text-center overflow-y-auto custom-scroll max-h-[220px]">
                    <p className="text-base sm:text-lg font-extrabold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {currentCard?.frontPrompt}
                    </p>
                    {currentCard?.pyqReference && (
                      <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        🎯 PYQ Ref: {currentCard.pyqReference}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium shrink-0 pt-2 border-t border-white/10" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      {isHi ? 'उत्तर देखने के लिए टैप करें' : 'Tap to Flip for Model Answer'}
                    </span>
                    <span>{currentIndex + 1} of {deck.cards.length}</span>
                  </div>
                </div>

                {/* ── CARD BACK (Topper Key Answer) ── */}
                <div
                  className="flashcard-face flashcard-back absolute inset-0 p-6 sm:p-8 rounded-3xl glass-card-clean border border-emerald-500/40 shadow-xl flex flex-col justify-between overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="flex items-center justify-between shrink-0 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-500" />
                      {isHi ? 'मॉडल उत्तर कुंजी' : 'Topper Model Key'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMastered(currentCard?.id);
                      }}
                      className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                        masteredIds.includes(currentCard?.id)
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'glass-card-clean border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{masteredIds.includes(currentCard?.id) ? 'Mastered' : 'Mark Done'}</span>
                    </button>
                  </div>

                  {/* Scrollable Answer Container: Never spills out into black background */}
                  <div className="flex-1 overflow-y-auto custom-scroll pr-1.5 my-1 space-y-2.5 text-left">
                    <div className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                      {currentCard?.backAnswer}
                    </div>

                    {/* Keywords List */}
                    {currentCard?.keyKeywords && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {currentCard.keyKeywords.map((kw, i) => (
                          <span key={i} className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium shrink-0 pt-2 border-t border-white/10" style={{ color: 'var(--text-secondary)' }}>
                    <span>🔄 {isHi ? 'सवाल पर लौटने के लिए टैप करें' : 'Tap to Flip back'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✨ High Scoring Point</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Card Controls: Prev, Flip, Next */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handlePrev}
                className="px-4 py-3 rounded-2xl glass-card-clean border border-white/60 text-xs font-extrabold flex items-center gap-1.5 hover:border-white/90 transition-all"
                style={{ color: 'var(--text-primary)' }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isHi ? 'पिछला' : 'Previous'}</span>
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex-1 py-3 rounded-2xl glass-card-clean border border-white/60 text-xs font-extrabold flex items-center justify-center gap-2 hover:border-white/90 transition-all shadow-sm"
                style={{ color: 'rgb(var(--accent))' }}
              >
                <RotateCw className="w-4 h-4" />
                <span>{isFlipped ? (isHi ? 'प्रश्न देखें' : 'View Question') : (isHi ? 'उत्तर देखें' : 'View Answer')}</span>
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-3 rounded-2xl btn-primary-clean text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>{isHi ? 'अगला' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mastered Progress Indicator */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
              <span>{isHi ? `कवर किए गए कार्ड्स: ${masteredIds.length}/${deck.cards.length}` : `Mastered: ${masteredIds.length}/${deck.cards.length}`}</span>
              <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(masteredIds.length / deck.cards.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
