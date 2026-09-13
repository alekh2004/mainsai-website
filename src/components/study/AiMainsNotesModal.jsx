import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generateAiMainsNotes } from '../../services/geminiService';
import {
  BookOpen, Sparkles, Download, Copy, Check, X,
  ArrowLeft, ChevronDown, ChevronUp, Layers, Target, FileText,
  RefreshCw, Zap, Award, AlertTriangle, HelpCircle
} from 'lucide-react';

import { exportNoteToColorPdf } from './pdfExportHelper';

const HOT_MAINS_TOPICS = [
  'Judicial Activism vs Judicial Overreach',
  'Saat Nischay-2 & Industrialization in Bihar',
  'National Green Hydrogen Mission 2030',
  'Governor Discretionary Powers (Art 163 vs 174)',
  'Uniform Civil Code (UCC) & Article 44',
  '1942 Quit India Movement & JP Azad Dasta',
  'One Nation One Election: Merits & Challenges',
  'Semiconductor Mission & Supply Chain Reshoring'
];

const LS_NOTES_USAGE = 'mainsai_notes_usage_v1';
const MAX_DAILY_NOTES = 8;

function getMainsNotesDailyUsage() {
  try {
    const raw = localStorage.getItem(LS_NOTES_USAGE);
    if (!raw) return 0;
    const { timestamp, count } = JSON.parse(raw);
    const now = Date.now();
    if (now - timestamp > 86400000) { // 24 hours
      localStorage.removeItem(LS_NOTES_USAGE);
      return 0;
    }
    return count || 0;
  } catch (e) {
    return 0;
  }
}

function incrementMainsNotesUsage() {
  try {
    const current = getMainsNotesDailyUsage();
    const newCount = current + 1;
    localStorage.setItem(LS_NOTES_USAGE, JSON.stringify({
      timestamp: Date.now(),
      count: newCount
    }));
  } catch (e) {}
}

export function AiMainsNotesModal({ isOpen, onClose }) {
  const { apiKey } = useAuth();
  const { activeExam, language } = useApp();
  const isHi = language === 'hi';

  const [topicInput, setTopicInput] = useState('Judicial Activism vs Judicial Overreach');
  const [isGenerating, setIsGenerating] = useState(false);
  const [noteData, setNoteData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('note'); // 'note' | 'pyqs'
  const [expandedPyqIndices, setExpandedPyqIndices] = useState([]);
  const [limitError, setLimitError] = useState('');
  const [usageToday, setUsageToday] = useState(0);

  // ── Reset state every time modal opens fresh ──
  useEffect(() => {
    if (isOpen) {
      setNoteData(null);
      setTopicInput('Judicial Activism vs Judicial Overreach');
      setActiveTab('note');
      setCopied(false);
      setExpandedPyqIndices([]);
      setLimitError('');
      setUsageToday(getMainsNotesDailyUsage());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (topic = topicInput) => {
    const targetTopic = topic.trim();
    if (!targetTopic) return;
    setLimitError('');

    const currentUsed = getMainsNotesDailyUsage();
    if (currentUsed >= MAX_DAILY_NOTES) {
      setLimitError(
        isHi
          ? `⚠️ 24 घंटे की दैनिक सीमा (${MAX_DAILY_NOTES} टॉपिक्स) पूरी हो चुकी है। आपने आज ${currentUsed}/${MAX_DAILY_NOTES} टॉपिक जनरेट किए हैं। कृपया 24 घंटे बाद प्रयास करें।`
          : `⚠️ Daily limit reached (${MAX_DAILY_NOTES} topics / 24h). You have generated ${currentUsed}/${MAX_DAILY_NOTES} topics today. Please try again after 24 hours.`
      );
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateAiMainsNotes({
        topic: targetTopic,
        examType: activeExam,
        language,
        apiKey
      });
      incrementMainsNotesUsage();
      setUsageToday(getMainsNotesDailyUsage());
      setNoteData(result);
    } catch (err) {
      console.error('Failed to generate mains notes:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePyqAnswer = (idx) => {
    setExpandedPyqIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleCopy = () => {
    if (!noteData) return;
    const text = `# ${noteData.topic} (${noteData.examType} Mains)\n\n## Executive Summary\n${noteData.executiveSummary}\n\n## Constitutional & Data\n${(noteData.constitutionalAndData || []).join('\n')}\n\n## PYQs Asked\n${(noteData.pyqsAsked || []).map(q => `• [${q.exam} ${q.year} - ${q.marks}M] ${q.questionText}\n  Answer: ${q.modelAnswer || 'Refer Topper Answer'}`).join('\n')}\n\n## Conclusion\n${noteData.topperConclusion}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintColorPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await exportNoteToColorPdf(noteData, isHi);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToTopics = () => {
    setNoteData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-card-clean rounded-3xl border border-white/80 shadow-2xl my-4 flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

        {/* Scrollable inner content */}
        <div className="overflow-y-auto custom-scroll flex-1 p-5 sm:p-7 space-y-5">

        {/* ── STICKY TOP ACTION BAR WITH PROMINENT BACK BUTTON ── */}
        <div className="flex items-center justify-between pb-3 border-b no-print gap-2" style={{ borderColor: 'var(--glass-border)' }}>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Back Button */}
            <button
              onClick={noteData ? handleBackToTopics : onClose}
              className="flex items-center gap-2 text-xs font-black px-3.5 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all transform active:scale-95 shrink-0"
              title={noteData ? 'Back to Search' : 'Close'}
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>{noteData ? (isHi ? 'विषय चयन पर वापस' : 'Back to Search') : (isHi ? 'होम पर वापस' : 'Back to Home')}</span>
            </button>

            {/* Note title / Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 text-xs font-extrabold border border-blue-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{activeExam.toUpperCase()} Mains Notes</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {noteData && (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-xl glass-card-clean border border-slate-200 text-xs font-bold flex items-center gap-1.5 hover:border-blue-400 transition-all"
                  style={{ color: 'var(--text-primary)' }}
                  title="Copy text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden md:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Prominent Colorful PDF Download Button */}
                <button
                  onClick={handlePrintColorPdf}
                  disabled={isDownloading}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition-all transform active:scale-95 disabled:opacity-60"
                  title="Download / Save as Full Color PDF"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                      <span>{isHi ? 'PDF तैयार हो रहा है...' : 'Saving PDF...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>{isHi ? 'रंगीन PDF डाउनलोड' : 'Download Color PDF'}</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Limit Warning banner if 24h max topics reached */}
        {limitError && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-900 dark:text-amber-300 font-bold flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{limitError}</span>
          </div>
        )}

        {/* ── TOPIC SEARCH & INPUT SECTION (WHEN NO NOTE) ── */}
        {!noteData ? (
          <div className="space-y-4 animate-fadeIn no-print">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'मेन्स विषय या करेंट अफेयर्स टॉपिक लिखें:' : 'Enter any Mains Syllabus or Current Affairs Topic:'}
                </label>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {isHi ? `आज का उपयोग: ${usageToday}/${MAX_DAILY_NOTES}` : `Used Today: ${usageToday}/${MAX_DAILY_NOTES}`}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => { setTopicInput(e.target.value); setLimitError(''); }}
                  placeholder={isHi ? 'उदा. Judicial Activism, Saat Nischay-2, Green Hydrogen...' : 'e.g. Judicial Activism, Saat Nischay-2, Green Hydrogen...'}
                  className="flex-1 px-4 py-3 rounded-2xl glass-input-clean text-xs font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="px-5 py-3 rounded-2xl btn-primary-clean font-extrabold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isHi ? 'तैयार कर रहा है...' : 'Synthesizing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isHi ? 'नोट्स बनाएं ⚡' : 'Generate Notes ⚡'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Suggested Trending Topic Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block">
                {isHi ? 'लोकप्रिय टॉपिक चुनें (1-क्लिक):' : 'Hot Trending Topics (1-Click):'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {HOT_MAINS_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopicInput(t); setLimitError(''); handleGenerate(t); }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-white/70 shadow-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-900 font-medium">
              <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {isHi
                  ? 'संवैधानिक अनुच्छेद, बहुआयामी विश्लेषण, बाधाएं, समितियां, फ्लोचार्ट, एवं पूछे गए वास्तविक PYQs और उनके टॉपर मॉडल उत्तर तुरंत तैयार करें।'
                  : 'Instantly synthesizes constitutional articles, multi-dimensional analysis, bottleneck challenges, committees, diagrams, exact PYQs, and topper model answers.'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium m-0">
              📌 {isHi ? 'प्रति 24 घंटे अधिकतम 8 मुख्य टॉपिक जनरेट किए जा सकते हैं।' : 'Restriction: Maximum 8 topics can be generated per 24 hours.'}
            </p>
          </div>
        ) : (
          /* ── PRINTABLE & DISPLAY NOTE AREA ── */
          <div className="space-y-4 animate-fadeIn printable-area">

            {/* Note Sub-Tabs (Note vs PYQs) */}
            <div className="flex gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 no-print">
              <button
                onClick={() => setActiveTab('note')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'note'
                    ? 'bg-white shadow-sm border border-slate-200 text-blue-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isHi ? 'संपूर्ण मेन्स नोट्स' : 'Complete Mains Note'}</span>
              </button>

              <button
                onClick={() => setActiveTab('pyqs')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'pyqs'
                    ? 'bg-white shadow-sm border border-slate-200 text-amber-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>{isHi ? 'पूछे गए विगत वर्ष के प्रश्न (PYQs)' : 'Exact PYQs Asked'}</span>
                <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                  {noteData.pyqsAsked?.length || 0}
                </span>
              </button>
            </div>

            {/* TAB 1: Structured Mains Note */}
            {activeTab === 'note' && (
              <div className="space-y-3.5">
                
                {/* 1. Header Banner Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-2 border-blue-200 printable-card space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black uppercase tracking-wide">
                      {noteData.paper || `${noteData.examType} MAINS`}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      UPSC / BPSC Topper High-Yield Blueprint
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 m-0">
                    {noteData.topic}
                  </h2>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed m-0 pt-1">
                    {noteData.executiveSummary}
                  </p>
                </div>

                {/* 2. Constitutional Provisions & Core Data */}
                {noteData.constitutionalAndData?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 printable-card space-y-2">
                    <h4 className="text-xs font-black text-sky-900 uppercase tracking-wide flex items-center gap-1.5 m-0">
                      <Zap className="w-4 h-4 text-sky-600" />
                      {isHi ? 'संवैधानिक प्रावधान एवं मुख्य आंकड़े' : 'Constitutional Articles & Key Data'}
                    </h4>
                    <ul className="text-xs text-slate-800 space-y-1 pl-4 list-disc m-0 font-medium leading-relaxed">
                      {noteData.constitutionalAndData.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. Multi-Dimensional Dimensions */}
                {noteData.dimensions?.map((dim, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 printable-card space-y-2 shadow-sm">
                    <h4 className="text-xs font-black text-blue-700 m-0 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      {dim.title}
                    </h4>
                    <ul className="text-xs text-slate-800 space-y-1.5 pl-4 list-disc m-0 font-medium leading-relaxed">
                      {dim.points?.map((p, pIdx) => (
                        <li key={pIdx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* 4. Bottlenecks & Critical Challenges */}
                {noteData.bottlenecksAndChallenges?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 printable-card space-y-2">
                    <h4 className="text-xs font-black text-rose-800 uppercase tracking-wide m-0 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {isHi ? 'मुख्य बाधाएं एवं चुनौतियां' : 'Bottlenecks & Critical Challenges'}
                    </h4>
                    <ul className="text-xs text-rose-950 space-y-1 pl-4 list-disc m-0 font-medium leading-relaxed">
                      {noteData.bottlenecksAndChallenges.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Committee Recommendations & Schemes */}
                {noteData.schemesAndCommittees?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 printable-card space-y-2">
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide m-0 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      {isHi ? 'समिति अनुशंसाएं एवं सरकारी योजनाएं' : 'Committee Recommendations & Government Schemes'}
                    </h4>
                    <ul className="text-xs text-emerald-950 space-y-1 pl-4 list-disc m-0 font-medium leading-relaxed">
                      {noteData.schemesAndCommittees.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Diagram & Flowchart Blueprint */}
                {noteData.diagramSchematic && (
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 printable-card space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wide flex items-center gap-1.5 m-0">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      {isHi ? 'फ्लोचार्ट / आरेख सुझाव (+1.5 अंक)' : 'Diagram & Flowchart Schematic Blueprint (+1.5 Marks)'}
                    </h4>
                    <pre className="text-xs font-mono text-indigo-950 whitespace-pre-wrap leading-relaxed bg-white/90 p-3.5 rounded-xl border border-indigo-200 font-semibold overflow-x-auto">
                      {noteData.diagramSchematic}
                    </pre>
                  </div>
                )}

                {/* 7. Topper Model Conclusion */}
                {noteData.topperConclusion && (
                  <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 printable-card space-y-1">
                    <h4 className="text-xs font-black text-blue-800 m-0">
                      {isHi ? 'दूरदर्शी निष्कर्ष (Way Forward)' : 'Topper Forward-Looking Conclusion'}
                    </h4>
                    <p className="text-xs text-blue-950 leading-relaxed m-0 font-semibold">
                      {noteData.topperConclusion}
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: Exact Real PYQs List with Collapsible Model Answers */}
            {activeTab === 'pyqs' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold printable-card">
                  🎯 {isHi ? 'इस टॉपिक से पूछे गए वास्तविक प्रश्न एवं टॉपर मॉडल उत्तर:' : 'Real Previous Year Questions & Topper Model Answers for this topic:'}
                </div>

                {noteData.pyqsAsked?.map((q, i) => {
                  const isExpanded = expandedPyqIndices.includes(i);
                  return (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 printable-card space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black uppercase">
                          {q.exam} • {q.year}
                        </span>
                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {q.marks} Marks
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-black m-0">
                        Q{i + 1}. {q.questionText}
                      </p>

                      {/* Toggle Button for Model Answer */}
                      <button
                        onClick={() => togglePyqAnswer(i)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-extrabold text-blue-700 flex items-center justify-between transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          {isExpanded ? (isHi ? 'मॉडल उत्तर छुपाएं' : 'Hide Topper Model Answer') : (isHi ? 'टॉपर का विस्तृत मॉडल उत्तर देखें' : 'View Detailed Topper Model Answer')}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Detailed Topper Model Answer Drawer */}
                      {isExpanded && (
                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5 animate-fadeIn text-xs">
                          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                            <span className="font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-emerald-600" />
                              {isHi ? 'टॉपर उत्तर संरचना एवं मुख्य बिंदु' : 'Topper Answer Framework & Key Demand'}
                            </span>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Model Rubric
                            </span>
                          </div>

                          <div className="text-emerald-950 font-medium leading-relaxed whitespace-pre-line">
                            {q.modelAnswer || (isHi ? `1. परिचय: ${q.questionText.slice(0, 40)}... का संवैधानिक व समसामयिक संदर्भ (Article / Case law).\n2. मुख्य भाग: 3-4 आयाम - कारण, प्रभाव, कानूनी नज़ीरें व डेटा।\n3. निष्कर्ष: संतुलनकारी दृष्टिकोण (Way Forward) एवं संवैधानिक मूल्य।` : `1. Introduction: Constitutional & current context of ${q.questionText.slice(0, 40)}...\n2. Body: Multi-dimensional breakdown with Articles, judgments & data.\n3. Conclusion: Forward-looking balanced approach.`)}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

            {/* ── BOTTOM ACTION CONTROLS ── */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 no-print">
              <button
                onClick={handleBackToTopics}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHi ? 'नया टॉपिक खोजें' : 'Search Another Topic'}</span>
              </button>

              <button
                onClick={handlePrintColorPdf}
                disabled={isDownloading}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition-all transform active:scale-95 disabled:opacity-60"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>{isHi ? 'PDF तैयार हो रहा है...' : 'Saving PDF...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>{isHi ? 'रंगीन PDF सेव करें' : 'Download Color PDF'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        </div>{/* end scrollable inner content */}
      </div>
    </div>
  );
}
