import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AppContext = createContext();

// ── Auto-clean expired file data from evaluations ──
function purgeExpiredUploads(evals) {
  const now = Date.now();
  return evals.map(e => {
    if (e.uploadExpiresAt && now > e.uploadExpiresAt && e.uploadedFileBase64) {
      const { uploadedFileBase64, ...rest } = e;
      return { ...rest, uploadedFileExpired: true };
    }
    return e;
  });
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [activeExam, setActiveExamState] = useState(() =>
    localStorage.getItem('active_exam') || 'upsc'
  );
  const [examStage, setExamStageState] = useState(() =>
    localStorage.getItem('exam_stage') || 'mains'
  );

  const setActiveExam = (exam) => {
    setActiveExamState(exam);
    localStorage.setItem('active_exam', exam);
  };

  const setExamStage = (stage) => {
    setExamStageState(stage);
    localStorage.setItem('exam_stage', stage);
  };
  const [activeMode, setActiveMode] = useState('ai_gen');
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app_language');
    // Default to English if never set before
    if (!saved) return 'en';
    return saved;
  });

  // ── Theme & Background System (Defaults: Light + Minimal) ──
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    if (!saved) return 'light'; // Default: light
    return saved;
  });
  const [accentColor, setAccentColor] = useState(() =>
    localStorage.getItem('app_accent') || 'cyan'
  );
  const [bgStyle, setBgStyle] = useState(() => {
    const saved = localStorage.getItem('app_bg_style');
    if (!saved) return 'minimal'; // Default: minimal clean gradient
    return saved;
  });
  const [glassIntensity, setGlassIntensity] = useState(() => {
    const saved = localStorage.getItem('app_glass_intensity');
    // Migrate old 'low'/'med'/'high' string values to numbers
    if (saved === 'low') return 20;
    if (saved === 'med') return 55;
    if (saved === 'high') return 90;
    const n = Number(saved);
    return (!isNaN(n) && n >= 0 && n <= 100) ? n : 55;
  });

  // Apply theme classes AND direct CSS variable overrides to document root
  useEffect(() => {
    const root = document.documentElement;
    // 1. Reset all dynamic classes
    root.className = root.className
      .replace(/theme-\w+/g, '')
      .replace(/accent-\w+/g, '')
      .replace(/bg-style-\w+/g, '')
      .replace(/glass-intensity-\w+/g, '')
      .trim();
    if (theme !== 'light') root.classList.add(`theme-${theme}`);
    root.classList.add(`accent-${accentColor}`);
    root.classList.add(`bg-style-${bgStyle}`);
    root.classList.add(`glass-intensity-${glassIntensity}`);

    // Map accent color to RGB and Hex for instant application across mobile & desktop
    const ACCENT_MAP = {
      cyan:    { rgb: '8 145 178',   hex: '#0891b2' },
      blue:    { rgb: '37 99 235',   hex: '#2563eb' },
      emerald: { rgb: '5 150 105',   hex: '#059669' },
      violet:  { rgb: '124 58 237', hex: '#7c3aed' },
      rose:    { rgb: '225 29 72',   hex: '#e11d48' },
      amber:   { rgb: '180 83 9',    hex: '#b45309' },
    };
    const accInfo = ACCENT_MAP[accentColor] || ACCENT_MAP.cyan;
    root.style.setProperty('--accent', accInfo.rgb);
    root.style.setProperty('--accent-hex', accInfo.hex);

    // 2. Directly wire glass intensity (0-100) to CSS variables
    const isDark = theme === 'dark';
    const isMedium = theme === 'medium';
    const baseR = isDark ? '15,23,42' : isMedium ? '30,41,59' : '255,255,255';
    const g = Number(glassIntensity) || 55;
    const minAlpha = isDark || isMedium ? 0.60 : 0.72;
    const maxAlpha = isDark || isMedium ? 0.97 : 0.99;
    const alpha = parseFloat((maxAlpha - ((g / 100) * (maxAlpha - minAlpha))).toFixed(3));
    const blurPx = Math.round(2 + (g / 100) * 32);
    const saturate = (1.0 + (g / 100) * 0.75).toFixed(2);
    root.style.setProperty('--card-bg', `rgba(${baseR},${alpha})`);
    root.style.setProperty('--glass-blur', `${blurPx}px`);
    root.style.setProperty('--glass-saturate', saturate);
    root.style.setProperty('--glass-opacity', String(alpha));

    localStorage.setItem('app_theme', theme);
    localStorage.setItem('app_accent', accentColor);
    localStorage.setItem('app_bg_style', bgStyle);
    localStorage.setItem('app_glass_intensity', glassIntensity);
  }, [theme, accentColor, bgStyle, glassIntensity]);

  // ── Admin Questions Bank ──
  const [adminQuestions, setAdminQuestions] = useState(() => {
    const saved = localStorage.getItem('admin_questions_bank');
    return saved ? JSON.parse(saved) : [
      {
        id: 'q-admin-1',
        examType: 'bpsc',
        paper: 'GS 1',
        title: 'बिहार में 1857 की क्रांति और कुंवर सिंह की भूमिका',
        questionText: '1857 के स्वतंत्रता संग्राम में बिहार के योगदान का मूल्यांकन कीजिए। बाबू वीर कुंवर सिंह की भूमिका का विशेष रूप से उल्लेख करें।',
        maxMarks: 38,
        wordLimit: 400,
        difficulty: 'medium',
        modelAnswer: 'प्रस्तावना: 1857 का विद्रोह भारत का प्रथम स्वतंत्रता संग्राम था।\nमुख्य बिंदु:\n1. जगदीशपुर के जमींदार बाबू कुंवर सिंह का नेतृत्व\n2. अरा, रोहतास और छोटानागपुर क्षेत्र में संघर्ष\n3. अंतिम सांस तक अंग्रेजों को चुनौती देना\nनिष्कर्ष: कुंवर सिंह का योगदान बिहार के इतिहास में अमर रहेगा।',
        keyDemandPoints: ['1857 का विद्रोह', 'कुंवर सिंह का नेतृत्व', 'जगदीशपुर युद्ध', 'बिहार का योगदान'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'q-admin-2',
        examType: 'upsc',
        paper: 'GS 2',
        title: 'Judicial Activism vs Judicial Overreach',
        questionText: 'Examine the fine line between Judicial Activism and Judicial Overreach in the Indian Constitutional framework. (15 Marks, 250 Words)',
        maxMarks: 15,
        wordLimit: 250,
        difficulty: 'hard',
        modelAnswer: 'Introduction: Judicial Activism = proactive role under Art 32/226.\nBody:\n1. Activism: Kesavananda (Basic Structure), Vishaka (Sexual Harassment), Puttaswamy (Privacy).\n2. Overreach: Highway Liquor Ban, NJAC judgment.\n3. Article 50 — Separation of Powers must be respected.\nConclusion: Judicial restraint ensures constitutional equilibrium.',
        keyDemandPoints: ['Article 32/226', 'Kesavananda Bharati', 'Judicial Overreach examples', 'Separation of Powers'],
        createdAt: new Date().toISOString()
      }
    ];
  });

  // ── Teacher Prelims MCQs Bank ──
  const [teacherPrelimsMCQs, setTeacherPrelimsMCQs] = useState(() => {
    const saved = localStorage.getItem('mainsai_teacher_prelims_mcqs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'tq-mcq-1',
        exam: 'bpsc',
        subject: 'History',
        questionEn: 'Which among the following was the primary objective of the Azad Dasta formed by Jayaprakash Narayan during the 1942 Quit India Movement in Bihar?',
        questionHi: '1942 के भारत छोड़ो आंदोलन के दौरान बिहार में जयप्रकाश नारायण द्वारा गठित आजाद दस्ता का प्राथमिक उद्देश्य निम्नलिखित में से क्या था?',
        optionsEn: [
          'To organize open non-violent civil disobedience rallies across Patna',
          'To carry out underground guerrilla resistance and disrupt British communication and transport infrastructure',
          'To form a constitutional negotiating team with the Viceroy Lord Linlithgow',
          'To lead a peasant agitation in Champaran against indigo plantation owners',
          'None of the above / More than one of the above'
        ],
        optionsHi: [
          'पटना भर में खुले अहिंसक सविनय अवज्ञा रैलियों का आयोजन करना',
          'भूमिगत छापामार प्रतिरोध चलाना तथा ब्रिटिश संचार और परिवहन बुनियादी ढांचे में बाधा डालना',
          'वायसराय लॉर्ड लिनलिथगो के साथ एक संवैधानिक वार्ता दल का गठन करना',
          'नील बागान मालिकों के खिलाफ चंपारण में किसान आंदोलन का नेतृत्व करना',
          'उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक'
        ],
        correctIndex: 1,
        explanationEn: 'Azad Dasta was established in Rajveer (Nepal forests) by Jayaprakash Narayan after escaping Hazaribagh Jail in 1942 for underground sabotage of British machinery.',
        explanationHi: '1942 में हजारीबाग जेल से भागने के बाद जयप्रकाश नारायण द्वारा नेपाल के राजवीर जंगलों में आजाद दस्ता की स्थापना की गई थी। इसका मुख्य उद्देश्य ब्रिटिश शासन के संचार और परिवहन साधनों को पंगु बनाना था।',
        author: 'Faculty Team',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tq-mcq-2',
        exam: 'bpsc',
        subject: 'Polity',
        questionEn: 'Under which Article of the Indian Constitution does the Governor of Bihar hold the power to promulgate Ordinances during recess of the State Legislature?',
        questionHi: 'भारतीय संविधान के किस अनुच्छेद के तहत बिहार के राज्यपाल के पास राज्य विधानमंडल के विश्रांति काल में अध्यादेश प्रख्यापित करने की शक्ति है?',
        optionsEn: [
          'Article 123',
          'Article 213',
          'Article 163',
          'Article 200',
          'None of the above / More than one of the above'
        ],
        optionsHi: [
          'अनुच्छेद 123',
          'अनुच्छेद 213',
          'अनुच्छेद 163',
          'अनुच्छेद 200',
          'उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक'
        ],
        correctIndex: 1,
        explanationEn: 'Article 213 empowers the Governor to promulgate ordinances when the state legislature is not in session.',
        explanationHi: 'अनुच्छेद 213 राज्य के राज्यपाल को विधानमंडल का सत्र न चलने पर अध्यादेश जारी करने की शक्ति देता है।',
        author: 'Faculty Team',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tq-mcq-3',
        exam: 'upsc',
        subject: 'Polity',
        questionEn: 'With reference to the Writ jurisdiction in India, consider the following statements:\n1. Supreme Court can issue writs only for enforcement of Fundamental Rights.\n2. High Courts can issue writs for enforcement of Fundamental Rights as well as ordinary legal rights.\nWhich of the statements given above is/are correct?',
        questionHi: 'भारत में रिट अधिकारिता के संदर्भ में निम्नलिखित कथनों पर विचार कीजिए:\n1. उच्चतम न्यायालय केवल मौलिक अधिकारों के प्रवर्तन के लिए रिट जारी कर सकता है।\n2. उच्च न्यायालय मौलिक अधिकारों के साथ-साथ किसी अन्य सामान्य कानूनी अधिकार के लिए भी रिट जारी कर सकते हैं।\nउपर्युक्त कथनों में से कौन-सा/से सही है/हैं?',
        optionsEn: [
          '1 only',
          '2 only',
          'Both 1 and 2',
          'Neither 1 nor 2'
        ],
        optionsHi: [
          'केवल 1',
          'केवल 2',
          '1 और 2 दोनों',
          'न तो 1, न ही 2'
        ],
        correctIndex: 2,
        explanationEn: 'Article 32 is restricted to Fundamental Rights, whereas Article 226 extends to ordinary legal rights as well.',
        explanationHi: 'अनुच्छेद 32 केवल मौलिक अधिकारों के लिए है, जबकि अनुच्छेद 226 अन्य कानूनी अधिकारों के लिए भी है।',
        author: 'Faculty Team',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tq-mcq-4',
        exam: 'upsc',
        subject: 'Economy',
        questionEn: 'Which of the following measures is most likely to be taken by the Reserve Bank of India (RBI) to control runaway inflation?',
        questionHi: 'अर्थव्यवस्था में बेकाबू मुद्रास्फीति को नियंत्रित करने के लिए भारतीय रिजर्व बैंक (RBI) द्वारा निम्नलिखित में से कौन सा कदम उठाए जाने की सर्वाधिक संभावना है?',
        optionsEn: [
          'Lowering the Repo Rate and CRR',
          'Increasing the Repo Rate and selling Government Securities in Open Market Operations',
          'Buying Government Securities under Open Market Operations',
          'Decreasing the MSF Rate'
        ],
        optionsHi: [
          'रेपो दर और CRR को घटाना',
          'रेपो दर बढ़ाना तथा खुले बाजार की प्रक्रियाओं (OMO) में सरकारी प्रतिभूतियों को बेचना',
          'खुले बाजार की प्रक्रियाओं के तहत सरकारी प्रतिभूतियां खरीदना',
          'MSF दर को घटाना'
        ],
        correctIndex: 1,
        explanationEn: 'To curtail inflation, RBI tightens liquidity by raising Repo rate and selling government securities.',
        explanationHi: 'मुद्रास्फीति को कम करने के लिए, आरबीआई रेपो दर बढ़ाकर और सरकारी प्रतिभूतियों को बेचकर तरलता को नियंत्रित करता है।',
        author: 'Faculty Team',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mainsai_teacher_prelims_mcqs', JSON.stringify(teacherPrelimsMCQs));
  }, [teacherPrelimsMCQs]);

  const addTeacherPrelimsMCQ = (mcqObj) => {
    const newMcq = {
      id: `tq-mcq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: user?.name || 'Faculty Member',
      ...mcqObj
    };
    setTeacherPrelimsMCQs(prev => [newMcq, ...prev]);
    return newMcq;
  };

  const getTeacherPrelimsMCQs = (exam) => {
    if (!exam) return teacherPrelimsMCQs;
    const filtered = teacherPrelimsMCQs.filter(q => (q.exam || 'bpsc').toLowerCase() === exam.toLowerCase());
    return filtered.length > 0 ? filtered : teacherPrelimsMCQs;
  };

  // ── Evaluations History (Isolated per User) ──
  const getEvaluationStorageKey = (uid) => uid ? `mainsai_evaluations_${uid}` : 'mainsai_evaluations_guest';

  const [evaluations, setEvaluations] = useState([]);
  const loadedUidRef = useRef(user?.uid || null);
  const isInitialLoadRef = useRef(false);

  // Clean legacy global key once if present
  useEffect(() => {
    try {
      localStorage.removeItem('bpsc_upsc_evaluations_v3');
    } catch (e) {}
  }, []);

  // Sync evaluations whenever user?.uid changes (login, logout, switch account)
  useEffect(() => {
    const currentUid = user?.uid || null;
    const storageKey = getEvaluationStorageKey(currentUid);
    loadedUidRef.current = currentUid;

    // 1. Immediate local cache load for zero UI latency
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setEvaluations(purgeExpiredUploads(Array.isArray(parsed) ? parsed : []));
      } else {
        setEvaluations([]);
      }
    } catch (err) {
      console.error('Error loading user evaluations:', err);
      setEvaluations([]);
    }
    isInitialLoadRef.current = true;

    // 2. Fetch latest from Cloud Firestore
    if (currentUid) {
      (async () => {
        try {
          const q = query(
            collection(db, 'evaluations'),
            where('userId', '==', currentUid)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const cloudEvals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setEvaluations(prev => {
              const map = new Map();
              cloudEvals.forEach(e => map.set(e.id, e));
              prev.forEach(e => {
                if (!map.has(e.id)) map.set(e.id, e);
              });
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
              );
              return purgeExpiredUploads(merged);
            });
          }
        } catch (cloudErr) {
          console.warn('Firestore evaluations sync fallback:', cloudErr);
        }
      })();
    }
  }, [user?.uid]);

  // Persist evaluations whenever evaluations change, for the currently active user
  useEffect(() => {
    if (!isInitialLoadRef.current) return;
    const currentUid = user?.uid || null;
    // Guard against saving to wrong user during switch
    if (loadedUidRef.current !== currentUid) return;

    const storageKey = getEvaluationStorageKey(currentUid);
    try {
      const purged = purgeExpiredUploads(evaluations);
      localStorage.setItem(storageKey, JSON.stringify(purged));
    } catch (err) {
      console.error('Error persisting user evaluations:', err);
    }
  }, [evaluations, user?.uid]);

  useEffect(() => { localStorage.setItem('active_exam', activeExam); }, [activeExam]);
  useEffect(() => { localStorage.setItem('app_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('admin_questions_bank', JSON.stringify(adminQuestions)); }, [adminQuestions]);

  const toggleLanguage = () => setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));

  const addAdminQuestion = (qObj) => {
    const newQ = { id: `q-admin-${Date.now()}`, createdAt: new Date().toISOString(), ...qObj };
    setAdminQuestions(prev => [newQ, ...prev]);
  };

  const saveEvaluationResult = (evalObj) => {
    const newEval = {
      id: `eval-${Date.now()}`,
      userId: user?.uid || null,
      userEmail: user?.email || null,
      createdAt: new Date().toISOString(),
      ...evalObj
    };
    setEvaluations(prev => purgeExpiredUploads([newEval, ...prev]));

    // Sync to Cloud Firestore (strip big raw binary/base64 to stay well below Firestore's 1MB document limit)
    if (user?.uid) {
      try {
        const { uploadedFileBase64, annotatedFileBase64, ...cloudData } = newEval;
        setDoc(doc(db, 'evaluations', newEval.id), {
          ...cloudData,
          hasUploadedFile: !!uploadedFileBase64,
          syncedAt: new Date().toISOString()
        }).catch(err => console.warn('Firestore evaluation upload fallback:', err));
      } catch (e) {
        console.warn('Firestore evaluation upload error:', e);
      }
    }

    return newEval;
  };

  // ── Computed insights helpers — returns mains + prelims separately ──
  const getInsightsData = () => {
    try {
      const allEvals = (evaluations || []).filter(e => e && e.score != null);
      if (!allEvals.length) return null;

      // Split by type
      const mainsEvals = allEvals.filter(e => e.evaluationType !== 'prelims_test');
      const prelimsEvals = allEvals.filter(e => e.evaluationType === 'prelims_test');

      const calcPct = (e) => {
        if (typeof e.percentage === 'number' && !isNaN(e.percentage)) {
          return Math.max(0, Math.min(100, Math.round(e.percentage)));
        }
        const s = Number(e.score) || 0;
        const m = Number(e.maxMarks) || 15;
        return m > 0 ? Math.max(0, Math.min(100, Math.round((s / m) * 100))) : 0;
      };

      // ── Compute Mains data ──
      const computeSection = (evals) => {
        if (!evals.length) return null;
        const sumPct = evals.reduce((s, e) => s + calcPct(e), 0);
        const avgPct = Math.round(sumPct / evals.length) || 0;
        const best = evals.reduce((a, b) => calcPct(b) > calcPct(a) ? b : a, evals[0]);
        const weakest = evals.reduce((a, b) => calcPct(b) < calcPct(a) ? b : a, evals[0]);

        const byPaper = {};
        evals.forEach(e => {
          const key = e.paper || 'GS';
          if (!byPaper[key]) byPaper[key] = { scores: [], titles: [] };
          byPaper[key].scores.push(calcPct(e));
          byPaper[key].titles.push(e.questionTitle || 'Test');
        });

        const trend = evals.slice(0, 10).reverse().map((e, i) => {
          let dateStr = 'Recent';
          try {
            if (e.createdAt) {
              let d;
              if (typeof e.createdAt?.toDate === 'function') {
                d = e.createdAt.toDate();
              } else if (e.createdAt?.seconds) {
                d = new Date(e.createdAt.seconds * 1000);
              } else {
                d = new Date(e.createdAt);
              }
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
              }
            }
          } catch (_) {}
          return {
            index: i + 1,
            date: dateStr,
            pct: calcPct(e),
            tag: e.tag || 'Checked',
            questionTitle: e.questionTitle || 'Test'
          };
        });

        const missedFreq = {};
        evals.forEach(e => {
          (e.missedDemandPoints || []).forEach(p => {
            if (p) missedFreq[p] = (missedFreq[p] || 0) + 1;
          });
        });
        const topMissed = Object.entries(missedFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([point, count]) => ({ point, count }));

        return { avgPct, best, weakest, byPaper, trend, topMissed, totalTests: evals.length };
      };

      // ── Prelims-specific extra stats ──
      const computePrelims = (evals) => {
        if (!evals.length) return null;
        const base = computeSection(evals);

        // Accuracy chart (not score%, but answer accuracy%)
        const totalCorrect = evals.reduce((s, e) => s + (e.correctCount || 0), 0);
        const totalAttempted = evals.reduce((s, e) => s + ((e.correctCount || 0) + (e.wrongCount || 0)), 0);
        const avgAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

        // Avg negative deduction per test
        const avgWrong = evals.length > 0
          ? Math.round(evals.reduce((s, e) => s + (e.wrongCount || 0), 0) / evals.length)
          : 0;

        // Subject-wise aggregate from subjectBreakdown
        const subjectAgg = {};
        evals.forEach(e => {
          if (e.subjectBreakdown && typeof e.subjectBreakdown === 'object') {
            Object.entries(e.subjectBreakdown).forEach(([subj, acc]) => {
              if (!subjectAgg[subj]) subjectAgg[subj] = [];
              subjectAgg[subj].push(acc);
            });
          }
        });
        const subjectAvg = Object.entries(subjectAgg).map(([subj, accs]) => ({
          subject: subj,
          avg: Math.round(accs.reduce((a, b) => a + b, 0) / accs.length)
        })).sort((a, b) => b.avg - a.avg);

        return { ...base, avgAccuracy, avgWrong, subjectAvg };
      };

      const mains = computeSection(mainsEvals);
      const prelims = computePrelims(prelimsEvals);

      return {
        // Legacy flat fields for backward-compat (use mainsEvals or all)
        ...(mains || computeSection(allEvals) || {}),
        totalTests: allEvals.length,
        // Sectioned data
        mains,
        prelims,
        mainsCount: mainsEvals.length,
        prelimsCount: prelimsEvals.length,
      };
    } catch (err) {
      console.warn('Error computing insights:', err);
      return null;
    }
  };


  // ── Notifications System ──
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('mainsai_notifications_v2');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-1',
        type: 'question',
        title: 'New Daily Mains Question Uploaded',
        titleHi: 'शिक्षक द्वारा आज का नया प्रश्न अपलोड किया गया',
        message: 'Faculty added: Judicial Activism vs Overreach (GS 2, 15 Marks). Tap to attempt!',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        actionType: 'open_question',
        questionId: 'q-admin-2'
      },
      {
        id: 'notif-2',
        type: 'evaluation',
        title: 'Evaluation Portal Live',
        titleHi: 'शिक्षक सत्यापन पोर्टल सक्रिय है',
        message: 'Submit your handwritten answers to get them checked with red-pen annotations!',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mainsai_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ── Teacher Review Queue ──
  const [teacherQueue, setTeacherQueue] = useState(() => {
    const saved = localStorage.getItem('teacher_review_queue_v2');
    return saved ? JSON.parse(saved) : [
      {
        id: 'tq-demo-1',
        studentName: 'Aman Kumar',
        rollNumber: 'BPSC-2025-4421',
        paper: 'GS 1 (Modern Bihar)',
        examType: 'bpsc',
        questionTitle: '1942 Quit India Movement & Azad Dasta',
        questionText: 'Analyze the significance of Azad Dasta during 1942 Quit India Movement in Bihar. बाबू वीर कुंवर सिंह एवं 1942 के भारत छोड़ो आंदोलन का मूल्यांकन करें। (38 Marks)',
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'pending',
        maxMarks: 38,
        score: null,
        feedback: null,
        uploadedFileBase64: null,
        annotatedFileBase64: null
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('teacher_review_queue_v2', JSON.stringify(teacherQueue));
  }, [teacherQueue]);

  // Student submits answer to teacher queue
  const submitToTeacherQueue = (evalObj) => {
    const newQueueItem = {
      id: `tq-${Date.now()}`,
      userId: user?.uid || null,
      userEmail: user?.email || null,
      studentName: evalObj.studentName || user?.name || 'Aspirant Student',
      rollNumber: evalObj.rollNumber || 'UPSC-2025-8819',
      paper: evalObj.paper,
      examType: evalObj.examType || activeExam,
      questionTitle: evalObj.questionTitle,
      questionText: evalObj.questionText,
      maxMarks: evalObj.maxMarks || 15,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      score: null,
      feedback: null,
      uploadedFileBase64: evalObj.uploadedFileBase64,
      uploadedFileName: evalObj.uploadedFileName,
      uploadedFileType: evalObj.uploadedFileType,
      annotatedFileBase64: null
    };

    setTeacherQueue(prev => [newQueueItem, ...prev]);

    // Persist to Cloud Firestore teacherQueue collection
    try {
      const { uploadedFileBase64, annotatedFileBase64, ...cloudQueueData } = newQueueItem;
      setDoc(doc(db, 'teacherQueue', newQueueItem.id), {
        ...cloudQueueData,
        hasUploadedFile: !!uploadedFileBase64,
        syncedAt: new Date().toISOString()
      }).catch(err => console.warn('Firestore teacherQueue upload fallback:', err));
    } catch (e) {
      console.warn('Firestore teacherQueue error:', e);
    }

    // Also save in student's evaluations history as pending
    saveEvaluationResult({
      ...evalObj,
      queueId: newQueueItem.id,
      tag: 'Pending Teacher Review',
      evaluationType: 'teacher',
      score: null
    });

    // Notify teacher
    addNotification({
      type: 'teacher_submission',
      title: `New Copy Submitted: ${evalObj.studentName || 'Student'}`,
      titleHi: `नई उत्तरपुस्तिका जमा: ${evalObj.studentName || 'छात्र'}`,
      message: `${evalObj.questionTitle} (${evalObj.paper}) is waiting for manual verification.`,
      queueId: newQueueItem.id
    });

    return newQueueItem;
  };

  // Teacher grades & annotates copy
  const completeTeacherEvaluation = (queueId, { score, feedback, annotatedFileBase64, scoreBreakdown }) => {
    let updatedItem = null;

    setTeacherQueue(prev => prev.map(item => {
      if (item.id === queueId) {
        updatedItem = {
          ...item,
          status: 'reviewed',
          score,
          feedback,
          annotatedFileBase64: annotatedFileBase64 || item.uploadedFileBase64,
          scoreBreakdown: scoreBreakdown || {},
          reviewedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return item;
    }));

    // Update in evaluations history
    setEvaluations(prev => prev.map(ev => {
      if (ev.queueId === queueId || ev.id === queueId) {
        return {
          ...ev,
          score,
          percentage: ev.maxMarks ? Math.round((score / ev.maxMarks) * 100) : 70,
          tag: (score / (ev.maxMarks || 15)) >= 0.7 ? 'Excellent' : 'Good',
          annotatedFileBase64: annotatedFileBase64 || ev.uploadedFileBase64,
          overallFeedback: feedback,
          scoreBreakdown: scoreBreakdown || ev.scoreBreakdown,
          evaluationType: 'teacher_verified',
          reviewedBy: 'Senior Faculty Member'
        };
      }
      return ev;
    }));

    // Update Cloud Firestore teacherQueue
    try {
      updateDoc(doc(db, 'teacherQueue', queueId), {
        status: 'reviewed',
        score,
        feedback: feedback || '',
        scoreBreakdown: scoreBreakdown || {},
        reviewedAt: new Date().toISOString()
      }).catch(err => console.warn('Firestore teacherQueue update fallback:', err));
    } catch (e) {
      console.warn('Firestore teacherQueue update error:', e);
    }

    // Notify student that copy is evaluated
    addNotification({
      type: 'copy_evaluated',
      title: `Answer Sheet Checked: ${score} Marks Awarded`,
      titleHi: `उत्तरपुस्तिका जांची गई: ${score} अंक प्राप्त हुए`,
      message: `Your answer copy for "${updatedItem?.questionTitle || 'Question'}" has been checked with red-pen annotations! Tap to view.`,
      resultId: queueId
    });
  };

  const updateTeacherReview = (id, score, feedback) => {
    completeTeacherEvaluation(id, { score, feedback });
  };

  // Faculty adds a new question
  const addFacultyQuestion = (qObj) => {
    const newQ = { id: `q-faculty-${Date.now()}`, createdAt: new Date().toISOString(), ...qObj };
    setAdminQuestions(prev => [newQ, ...prev]);

    // Push notification to all students
    addNotification({
      type: 'new_question',
      title: `New Question Added by Faculty: ${newQ.title}`,
      titleHi: `शिक्षक द्वारा नया प्रश्न अपलोड: ${newQ.title}`,
      message: `${newQ.paper} • ${newQ.maxMarks} Marks • Model Answer Key Included. Tap to solve now!`,
      questionId: newQ.id
    });

    return newQ;
  };

  return (
    <AppContext.Provider value={{
      activeExam, setActiveExam,
      examStage, setExamStage,
      activeMode, setActiveMode,
      language, setLanguage, toggleLanguage,
      theme, setTheme,
      accentColor, setAccentColor,
      bgStyle, setBgStyle,
      glassIntensity, setGlassIntensity,
      adminQuestions, addAdminQuestion, addFacultyQuestion,
      teacherPrelimsMCQs, addTeacherPrelimsMCQ, getTeacherPrelimsMCQs,
      evaluations, saveEvaluationResult,
      teacherQueue, submitToTeacherQueue, completeTeacherEvaluation, updateTeacherReview,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead,
      getInsightsData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
