import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generateAiMainsNotes } from '../../services/geminiService';
import {
  BookOpen, Sparkles, Download, Copy, Check, X,
  ArrowLeft, ChevronLeft, ChevronRight, Layers, Target, FileText,
  RefreshCw, Zap, Award, Search, ArrowUp
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

  if (!isOpen) return null;

  const handleGenerate = async (topic = topicInput) => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      const result = await generateAiMainsNotes({
        topic: topic.trim(),
        examType: activeExam,
        language,
        apiKey
      });
      setNoteData(result);
    } catch (err) {
      console.error('Failed to generate mains notes:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!noteData) return;
    const text = `# ${noteData.topic} (${noteData.examType} Mains)\n\n## Executive Summary\n${noteData.executiveSummary}\n\n## Constitutional & Data\n${(noteData.constitutionalAndData || []).join('\n')}\n\n## PYQs Asked\n${(noteData.pyqsAsked || []).map(q => `• [${q.exam} ${q.year} - ${q.marks}M] ${q.questionText}`).join('\n')}\n\n## Conclusion\n${noteData.topperConclusion}`;
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
              title={noteData ? 'Back to Topic Selection' : 'Close and Back to Dashboard'}
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

        {/* ── TOPIC SEARCH & INPUT SECTION (WHEN NO NOTE OR SWITCHING) ── */}
        {!noteData ? (
          <div className="space-y-4 animate-fadeIn no-print">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                {isHi ? 'मेन्स विषय या करेंट अफेयर्स टॉपिक लिखें:' : 'Enter any Mains Syllabus or Current Affairs Topic:'}
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
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
                    onClick={() => { setTopicInput(t); handleGenerate(t); }}
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
                  ? 'Gemini AI तुरंत संवैधानिक अनुच्छेद, बहुआयामी विश्लेषण, बाधाएं, समितियां, फ्लोचार्ट, और पूछे गए वास्तविक PYQs तैयार करेगा।'
                  : 'Gemini AI will instantly synthesize constitutional articles, multi-dimensional analysis, bottleneck challenges, committees, diagrams, and exact PYQs.'}
              </span>
            </div>
          </div>
        ) : (
          /* ── PRINTABLE & DISPLAY NOTE AREA (VIVID COLORFUL FORMAT) ── */
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
                
                {/* 1. Header Banner Card (Vivid Blue/Indigo) */}
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

                {/* 2. Constitutional Provisions & Core Data (Cyan/Sky) */}
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

                {/* 3. Multi-Dimensional Dimensions (Clean White/Blue) */}
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

                {/* 4. Bottlenecks & Critical Challenges (Rose/Red) */}
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

                {/* 5. Committee Recommendations & Schemes (Emerald/Green) */}
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

                {/* 6. Diagram & Flowchart Blueprint (Indigo) */}
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

                {/* 7. Topper Model Conclusion (Blue) */}
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

            {/* TAB 2: Exact Real PYQs List */}
            {activeTab === 'pyqs' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold printable-card">
                  🎯 {isHi ? 'इस टॉपिक से UPSC और BPSC में पूछे गए वास्तविक विगत वर्ष के प्रश्न:' : 'Real Previous Year Questions asked on this topic in UPSC CSE & BPSC Mains:'}
                </div>

                {noteData.pyqsAsked?.map((q, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 printable-card space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black uppercase">
                        {q.exam} • {q.year}
                      </span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {q.marks} Marks
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 leading-relaxed font-bold m-0">
                      {q.questionText}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ── BOTTOM ACTION CONTROLS (ALWAYS VISIBLE WHEN SCROLLED) ── */}
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
