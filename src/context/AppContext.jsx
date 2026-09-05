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
