import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [activeExam, setActiveExam] = useState(() =>
    localStorage.getItem('active_exam') || 'upsc'
  );
  const [activeMode, setActiveMode] = useState('ai_gen');
  const [language, setLanguage] = useState(() =>
    localStorage.getItem('app_language') || 'hi'
  );

  // ── Theme & Background System ──
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('app_theme') || 'dark'
  );
  const [accentColor, setAccentColor] = useState(() =>
    localStorage.getItem('app_accent') || 'cyan'
  );
  const [bgStyle, setBgStyle] = useState(() =>
    localStorage.getItem('app_bg_style') || 'world-map'
  );
  const [glassIntensity, setGlassIntensity] = useState(() =>
    localStorage.getItem('app_glass_intensity') || 'med'
  );

  // Apply theme classes to document root
  useEffect(() => {
    const root = document.documentElement;
    root.className = root.className
      .replace(/theme-\w+/g, '')
      .replace(/accent-\w+/g, '')
      .replace(/bg-style-\w+/g, '')
      .replace(/glass-intensity-\w+/g, '')
      .trim();
    if (theme !== 'light') root.classList.add(`theme-${theme}`);
    if (accentColor !== 'blue') root.classList.add(`accent-${accentColor}`);
    root.classList.add(`bg-style-${bgStyle}`);
    root.classList.add(`glass-intensity-${glassIntensity}`);
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

  // ── Evaluations History — with auto-expiry ──
  const [evaluations, setEvaluations] = useState(() => {
    const saved = localStorage.getItem('bpsc_upsc_evaluations_v3');
    const parsed = saved ? JSON.parse(saved) : getDemoEvaluations();
    return purgeExpiredUploads(parsed);
  });

  function getDemoEvaluations() {
    const now = Date.now();
    return [
      {
        id: 'eval-demo-1',
        examType: 'upsc',
        paper: 'GS 2',
        questionTitle: 'Judicial Activism vs Overreach',
        questionText: 'Examine the fine line between Judicial Activism and Judicial Overreach. (15 Marks)',
        maxMarks: 15,
        wordLimit: 250,
        keyDemandPoints: ['Article 32/226', 'Kesavananda Bharati', 'Overreach examples', 'Separation of Powers'],
        modelAnswer: 'Introduction: Judicial Activism = proactive role under Art 32/226.\nBody: Kesavananda (Basic Structure), Vishaka Guidelines.\nOverreach: Highway Liquor Ban.\nConclusion: Judicial restraint ensures balance.',
        score: 11,
        percentage: 73,
        tag: 'Good',
        handwritingLegibility: 'Clear',
        wordCountEstimate: 230,
        hasDiagram: true,
        diagramQuality: 'Basic',
        lineByLineReview: [
          { section: 'Introduction', studentContent: 'Judicial Activism refers to proactive role under Art 32...', assessment: 'Strong', marksAwarded: 2, marksMaximum: 2, comment: 'Excellent constitutional reference to Article 32 cited in first para.' },
          { section: 'Body — Point 1 (Activism)', studentContent: 'Kesavananda Bharati case established Basic Structure...', assessment: 'Strong', marksAwarded: 3, marksMaximum: 3, comment: 'Correct case citation with holding — full marks.' },
          { section: 'Body — Point 2 (Overreach)', studentContent: 'Highway liquor ban — judiciary stepped into executive...', assessment: 'Adequate', marksAwarded: 2, marksMaximum: 3, comment: 'Good example but NJAC judgment also required — 1 mark deducted.' },
          { section: 'Conclusion', studentContent: 'Need for judicial restraint to preserve democracy...', assessment: 'Adequate', marksAwarded: 1, marksMaximum: 2, comment: 'Forward-looking but missing specific policy recommendation.' }
        ],
        scoreBreakdown: { introduction: 2, bodyContent: 5, examples: 2, conclusion: 1, presentation: 1 },
        keyStrengths: ['Article 32/226 correctly cited in intro', 'Kesavananda Bharati judgment with correct holding'],
        keyMistakes: ['NJAC judgment missed as overreach example', 'Conclusion lacked specific policy suggestion'],
        missedDemandPoints: ['NJAC judgment as overreach example'],
        improvementSuggestions: ['Add NJAC 2015 judgment as overreach', 'Cite Article 50 (Separation of Powers) in conclusion', 'Draw a Venn diagram — Activism vs Overreach'],
        overallFeedback: 'Strong answer! Constitutional references are accurate. The NJAC judgment would have fetched the missing mark in overreach section. [हिंदी]: अच्छा उत्तर! NJAC निर्णय का उल्लेख अवश्य करें।',
        modelComparisonNote: 'Covered ~78% of official model answer key demands.',
        uploadedFileType: 'image',
        uploadExpiresAt: now + (24 * 60 * 60 * 1000),
        uploadedFileBase64: null,
        modelUsed: 'gemini-2.5-flash',
        createdAt: new Date(now - 86400000).toISOString()
      },
      {
        id: 'eval-demo-2',
        examType: 'bpsc',
        paper: 'GS 1',
        questionTitle: '1942 Quit India — Bihar & Azad Dasta',
        questionText: '1942 के भारत छोड़ो आंदोलन में बिहार की भूमिका। (38 अंक)',
        maxMarks: 38,
        wordLimit: 400,
        keyDemandPoints: ['Secretariat Shooting 11 Aug 1942', 'JP Hazaribagh escape', 'Azad Dasta', 'Rural parallel government'],
        modelAnswer: 'Introduction: August 1942 — Do or Die call.\nBody: Secretariat Shooting, JP Escape, Azad Dasta Nepal.\nConclusion: Bihar\'s heroic resistance.',
        score: 26,
        percentage: 68,
        tag: 'Good',
        handwritingLegibility: 'Moderate',
        wordCountEstimate: 360,
        hasDiagram: false,
        diagramQuality: 'None',
        lineByLineReview: [
          { section: 'Introduction', studentContent: 'Gandhi ne August 1942 mein Do or Die ka naara diya...', assessment: 'Strong', marksAwarded: 5, marksMaximum: 6, comment: 'Good context. Missing "Gandhi Maidan Patna" specific reference.' },
          { section: 'Body — Secretariat Shooting', studentContent: '11 August 1942 ko 7 chhatron ki shahdat hui...', assessment: 'Strong', marksAwarded: 8, marksMaximum: 8, comment: 'Excellent — exact date, location, and martyrs count all correct.' },
          { section: 'Body — JP Escape', studentContent: 'Hazaribagh jail se JP ki natak jaisi bhagadaud...', assessment: 'Adequate', marksAwarded: 5, marksMaximum: 8, comment: 'JP escape mentioned but Azad Dasta operations not detailed.' },
          { section: 'Body — Azad Dasta', studentContent: 'Nepal jungle mein aazad dasta ne guerilla yudh kiya...', assessment: 'Weak', marksAwarded: 4, marksMaximum: 8, comment: 'Radio broadcast mention missing. Nepal camp name "Rajvilas" not written.' },
          { section: 'Conclusion', studentContent: 'Bihar ka yogdan bharat ki azadi mein amulya raha...', assessment: 'Adequate', marksAwarded: 4, marksMaximum: 8, comment: 'Generic conclusion. Should reference legacy for 1952 elections.' }
        ],
        scoreBreakdown: { introduction: 5, bodyContent: 13, examples: 4, conclusion: 2, presentation: 2 },
        keyStrengths: ['Secretariat Shooting date (11 Aug) correctly cited', 'Guerilla warfare context explained well'],
        keyMistakes: ['Azad Dasta — Rajvilas camp in Nepal not named', 'Underground radio broadcast detail missing'],
        missedDemandPoints: ['Rajvilas Forest camp name', 'Underground radio broadcasts by JP'],
        improvementSuggestions: ['Write "Rajvilas Forest, Nepal" specifically', 'Add that JP broadcast radio messages from Nepal', 'Mention parallel government in Bhojpur district'],
        overallFeedback: 'Good answer with accurate Secretariat Shooting details. Azad Dasta section needs depth — Rajvilas camp + radio broadcasts are scoring points. [हिंदी]: अच्छा उत्तर। आजाद दस्ता खंड में राजविलास शिविर एवं रेडियो प्रसारण का उल्लेख आवश्यक है।',
        modelComparisonNote: 'Covered ~72% of official model answer key demands.',
        uploadedFileType: 'image',
        uploadExpiresAt: now - (25 * 60 * 60 * 1000), // already expired
        uploadedFileExpired: true,
        uploadedFileBase64: null,
        modelUsed: 'gemini-2.5-flash',
        createdAt: new Date(now - 3 * 86400000).toISOString()
      }
    ];
  }

  // Persist evaluations (without big base64 data in key to save space)
  useEffect(() => {
    const purged = purgeExpiredUploads(evaluations);
    localStorage.setItem('bpsc_upsc_evaluations_v3', JSON.stringify(purged));
  }, [evaluations]);

  useEffect(() => { localStorage.setItem('active_exam', activeExam); }, [activeExam]);
  useEffect(() => { localStorage.setItem('app_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('admin_questions_bank', JSON.stringify(adminQuestions)); }, [adminQuestions]);

  const toggleLanguage = () => setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));

  const addAdminQuestion = (qObj) => {
    const newQ = { id: `q-admin-${Date.now()}`, createdAt: new Date().toISOString(), ...qObj };
    setAdminQuestions(prev => [newQ, ...prev]);
  };

  const saveEvaluationResult = (evalObj) => {
    const newEval = { id: `eval-${Date.now()}`, createdAt: new Date().toISOString(), ...evalObj };
    setEvaluations(prev => purgeExpiredUploads([newEval, ...prev]));
    return newEval;
  };

  // ── Computed insights helpers ──
  const getInsightsData = () => {
    const evals = evaluations.filter(e => e.score != null);
    if (!evals.length) return null;

    const avgPct = Math.round(evals.reduce((s, e) => s + (e.percentage || (e.score / e.maxMarks * 100)), 0) / evals.length);
    const best = evals.reduce((a, b) => (b.percentage || 0) > (a.percentage || 0) ? b : a, evals[0]);
    const weakest = evals.reduce((a, b) => (b.percentage || 100) < (a.percentage || 100) ? b : a, evals[0]);

    // Group by paper
    const byPaper = {};
    evals.forEach(e => {
      const key = e.paper || 'Unknown';
      if (!byPaper[key]) byPaper[key] = { scores: [], titles: [] };
      byPaper[key].scores.push(e.percentage || Math.round(e.score / e.maxMarks * 100));
      byPaper[key].titles.push(e.questionTitle);
    });

    // Trend over last 10
    const trend = evals.slice(0, 10).reverse().map((e, i) => ({
      index: i + 1,
      date: new Date(e.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      pct: e.percentage || Math.round(e.score / e.maxMarks * 100),
      tag: e.tag,
      questionTitle: e.questionTitle
    }));

    // Missed demand points frequency
    const missedFreq = {};
    evals.forEach(e => {
      (e.missedDemandPoints || []).forEach(p => {
        missedFreq[p] = (missedFreq[p] || 0) + 1;
      });
    });
    const topMissed = Object.entries(missedFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([point, count]) => ({ point, count }));

    return { avgPct, best, weakest, byPaper, trend, topMissed, totalTests: evals.length };
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
      studentName: evalObj.studentName || 'Aspirant Student',
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
      activeMode, setActiveMode,
      language, setLanguage, toggleLanguage,
      theme, setTheme,
      accentColor, setAccentColor,
      bgStyle, setBgStyle,
      glassIntensity, setGlassIntensity,
      adminQuestions, addAdminQuestion, addFacultyQuestion,
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
