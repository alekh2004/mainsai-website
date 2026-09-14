import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Shield, PlusCircle, Image, FileText, X, CheckCircle, Upload, Send, UserCheck, UserX, Clock, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export function AdminQuestionUpload({ isOpen, onClose }) {
  const { user, adminInbox, approveStudentAccess, rejectStudentAccess } = useAuth();
  const { activeExam, addFacultyQuestion, addTeacherPrelimsMCQ } = useApp();

  const [adminTab, setAdminTab] = useState('inbox'); // 'inbox' | 'upload' | 'prelims'

  // Mains Question Upload Form State
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [paper, setPaper] = useState('GS 1');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [maxMarks, setMaxMarks] = useState(activeExam === 'bpsc' ? 38 : 15);
  const [wordLimit, setWordLimit] = useState(activeExam === 'bpsc' ? 400 : 250);
  const [modelAnswer, setModelAnswer] = useState('');
  
  const [scannedImageUrl, setScannedImageUrl] = useState(null);
  const [imageFileName, setImageFileName] = useState('');

  // Prelims MCQ Upload Form State
  const [mcqExam, setMcqExam] = useState(activeExam || 'bpsc');
  const [mcqSubject, setMcqSubject] = useState('History');
  const [mcqQuestionEn, setMcqQuestionEn] = useState('');
  const [mcqQuestionHi, setMcqQuestionHi] = useState('');
  const [optAEn, setOptAEn] = useState('');
  const [optAHi, setOptAHi] = useState('');
  const [optBEn, setOptBEn] = useState('');
  const [optBHi, setOptBHi] = useState('');
  const [optCEn, setOptCEn] = useState('');
  const [optCHi, setOptCHi] = useState('');
  const [optDEn, setOptDEn] = useState('');
  const [optDHi, setOptDHi] = useState('');
  const [optEEn, setOptEEn] = useState('None of the above / More than one of the above');
  const [optEHi, setOptEHi] = useState('उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [mcqExplanationEn, setMcqExplanationEn] = useState('');
  const [mcqExplanationHi, setMcqExplanationHi] = useState('');

  if (!isOpen) return null;

  const handleQuestionImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScannedImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !questionText.trim()) {
      alert('Please enter question title and question text.');
      return;
    }

    addFacultyQuestion({
      examType: activeExam,
      title,
      questionText,
      paper,
      subject: subject || 'General Studies',
      difficulty,
      maxMarks: Number(maxMarks),
      wordLimit: Number(wordLimit),
      modelAnswer: modelAnswer || 'Standard model answer provided by Faculty.',
      scannedImageUrl,
      keyDemandPoints: ['Introduction & Context', 'Core Syllabus Demand', 'Conclusion & Recommendations']
    });

    alert('✅ New Question & Model Solution published to Curated Question Bank!');
    setAdminTab('inbox');
  };

  const handleMcqSubmit = (e) => {
    e.preventDefault();
    if (!mcqQuestionEn.trim() && !mcqQuestionHi.trim()) {
      alert('Please enter question text.');
      return;
    }
    if ((!optAEn.trim() && !optAHi.trim()) || (!optBEn.trim() && !optBHi.trim())) {
      alert('Please enter Option A and Option B.');
      return;
    }

    const optionsEn = [
      optAEn || optAHi,
      optBEn || optBHi,
      optCEn || optCHi || 'Option C',
      optDEn || optDHi || 'Option D',
    ];
    const optionsHi = [
      optAHi || optAEn,
      optBHi || optBEn,
      optCHi || optCEn || 'विकल्प C',
      optDHi || optDEn || 'विकल्प D',
    ];

    if (mcqExam === 'bpsc') {
      optionsEn.push(optEEn || 'None of the above / More than one of the above');
      optionsHi.push(optEHi || 'उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक');
    }

    addTeacherPrelimsMCQ({
      exam: mcqExam,
      subject: mcqSubject,
      questionEn: mcqQuestionEn || mcqQuestionHi,
      questionHi: mcqQuestionHi || mcqQuestionEn,
      optionsEn,
      optionsHi,
      correctIndex: Number(correctIndex),
      explanationEn: mcqExplanationEn || mcqExplanationHi || 'Faculty Solution Key provided.',
      explanationHi: mcqExplanationHi || mcqExplanationEn || 'शिक्षक द्वारा उत्तर व्याख्या।'
    });

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    alert('✅ New Teacher MCQ published to Teacher Premium Bank!');
    setMcqQuestionEn('');
    setMcqQuestionHi('');
    setOptAEn(''); setOptAHi('');
    setOptBEn(''); setOptBHi('');
    setOptCEn(''); setOptCHi('');
    setOptDEn(''); setOptDHi('');
    setMcqExplanationEn(''); setMcqExplanationHi('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-card-clean rounded-3xl p-6 lg:p-8 border border-amber-500/40 shadow-2xl my-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Developer Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white m-0">App Developer Vault (Admin / Faculty Control Panel)</h3>
            <p className="text-xs text-amber-300 m-0 font-medium">Verify student login messages & publish Mains / Prelims questions</p>
          </div>
        </div>

        {/* Admin Section Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-white/15">
          <button
            type="button"
            onClick={() => setAdminTab('inbox')}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              adminTab === 'inbox' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Requests ({adminInbox.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('upload')}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              adminTab === 'upload' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Mains Question</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('prelims')}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              adminTab === 'prelims' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Prelims MCQ</span>
          </button>
        </div>

        {/* TAB 1: Real-Time Student Login Messages Inbox */}
        {adminTab === 'inbox' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-gray-300">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Send className="w-4 h-4" /> Real-Time Student Access Messages
              </span>
              <span className="text-gray-400">Total Requests: {adminInbox.length}</span>
            </div>

            {adminInbox.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/80 rounded-2xl border border-white/10 text-xs text-gray-400">
                No student login messages in inbox.
              </div>
            ) : (
              <div className="space-y-3">
                {adminInbox.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      req.status === 'approved'
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : req.status === 'rejected'
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : 'bg-amber-950/20 border-amber-500/50 shadow-lg'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">{req.name}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-bold">
                          {req.loginType}
                        </span>
                        {req.status === 'approved' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ✓ Approved & Unlocked
                          </span>
                        ) : req.status === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                            ✕ Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 text-[10px] font-bold animate-pulse">
                            ⏳ Pending Approval
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-300 font-mono">
                        <strong>Contact Info:</strong> {req.phone || req.email}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Requested: {new Date(req.requestedAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Action Buttons for Admin */}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            approveStudentAccess(req.id);
                            confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-1 hover:scale-105 transition-all"
                        >
                          <UserCheck className="w-4 h-4 fill-slate-950" />
                          <span>Approve Access ✅</span>
                        </button>

                        <button
                          onClick={() => rejectStudentAccess(req.id)}
                          className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                        >
                          <span>Reject ❌</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Upload Question & Model Solution */}
        {adminTab === 'upload' && (
          <form onSubmit={handleQuestionSubmit} className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bihar Azad Dasta 1942"
                  className="w-full px-3.5 py-2 rounded-xl glass-input-clean text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mains Paper</label>
                <select
                  value={paper}
                  onChange={(e) => setPaper(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input-clean text-xs font-semibold"
                >
                  <option value="GS 1">GS 1</option>
                  <option value="GS 2">GS 2</option>
                  <option value="GS 3">GS 3</option>
                  <option value="GS 4">GS 4</option>
                  <option value="Essay">Essay</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Question Text</label>
              <textarea
                rows={3}
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type full Mains Question here..."
                className="w-full p-3 rounded-xl glass-input-clean text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-amber-400" /> Scanned Question Image (Optional)
              </label>
              <div className="relative border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-amber-500/50 transition-all bg-slate-900/40">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQuestionImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <div className="text-xs font-semibold text-gray-300">
                  {imageFileName ? (
                    <span className="text-amber-400 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Attached: {imageFileName}
                    </span>
                  ) : (
                    <span>Click to attach scanned question paper image</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" /> Official Model Answer Key & Criteria
              </label>
              <textarea
                rows={3}
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                placeholder="Type key points, introduction structure, and ideal conclusion..."
                className="w-full p-3 rounded-xl glass-input-clean text-xs leading-relaxed font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
            >
              <PlusCircle className="w-4 h-4 fill-slate-950" />
              <span>Publish Mains Question to Admin Bank</span>
            </button>
          </form>
        )}

        {/* TAB 3: Upload Prelims MCQ (Teacher Premium Bank) */}
        {adminTab === 'prelims' && (
          <form onSubmit={handleMcqSubmit} className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Exam</label>
                <select
                  value={mcqExam}
                  onChange={(e) => setMcqExam(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input-clean text-xs font-semibold text-white bg-slate-900"
                >
                  <option value="bpsc">🦁 BPSC Prelims (5 Options A-E)</option>
                  <option value="upsc">🏛️ UPSC Prelims (4 Options A-D)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Subject</label>
                <select
                  value={mcqSubject}
                  onChange={(e) => setMcqSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input-clean text-xs font-semibold text-white bg-slate-900"
                >
                  <option value="History">History (इतिहास)</option>
                  <option value="Polity">Polity (राजव्यवस्था)</option>
                  <option value="Geography">Geography (भूगोल)</option>
                  <option value="Economy">Economy (अर्थव्यवस्था)</option>
                  <option value="Science">General Science (सामान्य विज्ञान)</option>
                  <option value="Bihar GK">Bihar GK / Special</option>
                  <option value="Environment">Environment & Ecology</option>
                  <option value="Current Affairs">Current Affairs</option>
                </select>
              </div>
            </div>

            {/* Question Text (En & Hi) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Question (English)</label>
                <textarea
                  rows={2}
                  value={mcqQuestionEn}
                  onChange={(e) => setMcqQuestionEn(e.target.value)}
                  placeholder="Type MCQ statement in English..."
                  className="w-full p-2.5 rounded-xl glass-input-clean text-xs leading-relaxed text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Question (Hindi / हिंदी)</label>
                <textarea
                  rows={2}
                  value={mcqQuestionHi}
                  onChange={(e) => setMcqQuestionHi(e.target.value)}
                  placeholder="प्रश्न का हिंदी विवरण दर्ज करें..."
                  className="w-full p-2.5 rounded-xl glass-input-clean text-xs leading-relaxed text-white"
                />
              </div>
            </div>

            {/* Options A - D */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <label className="block text-xs font-bold text-amber-400">Options / विकल्प (A to D)</label>
              
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Option A (English)" value={optAEn} onChange={e=>setOptAEn(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
                <input type="text" placeholder="विकल्प A (हिंदी)" value={optAHi} onChange={e=>setOptAHi(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Option B (English)" value={optBEn} onChange={e=>setOptBEn(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
                <input type="text" placeholder="विकल्प B (हिंदी)" value={optBHi} onChange={e=>setOptBHi(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Option C (English)" value={optCEn} onChange={e=>setOptCEn(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
                <input type="text" placeholder="विकल्प C (हिंदी)" value={optCHi} onChange={e=>setOptCHi(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Option D (English)" value={optDEn} onChange={e=>setOptDEn(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
                <input type="text" placeholder="विकल्प D (हिंदी)" value={optDHi} onChange={e=>setOptDHi(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
              </div>

              {mcqExam === 'bpsc' && (
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Option E (English)" value={optEEn} onChange={e=>setOptEEn(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
                  <input type="text" placeholder="विकल्प E (हिंदी)" value={optEHi} onChange={e=>setOptEHi(e.target.value)} className="px-3 py-1.5 rounded-xl glass-input-clean text-xs text-white" />
                </div>
              )}
            </div>

            {/* Correct Option Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">Correct Option / सही विकल्प</label>
                <select
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl glass-input-clean text-xs font-black text-emerald-300 bg-slate-900"
                >
                  <option value={0}>Option A (विकल्प A)</option>
                  <option value={1}>Option B (विकल्प B)</option>
                  <option value={2}>Option C (विकल्प C)</option>
                  <option value={3}>Option D (विकल्प D)</option>
                  {mcqExam === 'bpsc' && <option value={4}>Option E (विकल्प E)</option>}
                </select>
              </div>
            </div>

            {/* Explanation / Solution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Explanation Key (English)</label>
                <textarea
                  rows={2}
                  value={mcqExplanationEn}
                  onChange={(e) => setMcqExplanationEn(e.target.value)}
                  placeholder="Detailed solution explanation in English..."
                  className="w-full p-2.5 rounded-xl glass-input-clean text-xs leading-relaxed text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">उत्तर व्याख्या (हिंदी)</label>
                <textarea
                  rows={2}
                  value={mcqExplanationHi}
                  onChange={(e) => setMcqExplanationHi(e.target.value)}
                  placeholder="विस्तृत उत्तर व्याख्या हिंदी में..."
                  className="w-full p-2.5 rounded-xl glass-input-clean text-xs leading-relaxed text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
            >
              <PlusCircle className="w-4 h-4 fill-slate-950" />
              <span>Publish MCQ to Teacher Premium Bank</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
