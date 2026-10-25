import { db, auth } from '../firebase';
import {
  doc, setDoc, getDoc, getDocs, collection
} from 'firebase/firestore';

/**
 * Recursively sanitizes any object or array so it can be safely stored in Firestore:
 * - Strips or replaces undefined with null (Firestore throws error on undefined)
 * - Converts Dates to ISO strings
 * - Replaces huge Base64 strings (>500KB) with null to avoid Firestore's 1MB doc limit
 */
export function sanitizeForFirestore(obj) {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item));
  }
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string' && val.length > 500000 && (key.includes('Base64') || key.includes('file'))) {
      clean[key] = null;
      clean[`has_${key}`] = true;
      continue;
    }
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean;
}

/**
 * Deep merges two ImprovementBook objects without duplicates.
 * Each question is uniquely identified by `id`.
 */
export function mergeImprovementBooks(bookA, bookB) {
  const merged = {
    prelims: { ...(bookA?.prelims || {}) },
    mains: { ...(bookA?.mains || {}) }
  };

  ['prelims', 'mains'].forEach(section => {
    const secB = bookB?.[section] || {};
    Object.entries(secB).forEach(([subject, qsB]) => {
      if (!Array.isArray(qsB)) return;
      if (!merged[section][subject]) {
        merged[section][subject] = [...qsB];
      } else {
        const existingQs = merged[section][subject];
        const map = new Map();
        existingQs.forEach(q => { if (q?.id) map.set(q.id, q); });
        qsB.forEach(q => {
          if (!q?.id) return;
          if (!map.has(q.id)) {
            map.set(q.id, q);
          } else {
            // Keep the latest attempt based on savedAt
            const existing = map.get(q.id);
            const dateExisting = new Date(existing.savedAt || 0).getTime();
            const dateNew = new Date(q.savedAt || 0).getTime();
            if (dateNew >= dateExisting) {
              map.set(q.id, { ...existing, ...q });
            }
          }
        });
        merged[section][subject] = Array.from(map.values()).slice(-500);
      }
    });
  });

  return merged;
}

/**
 * Load all Improvement Book questions from Firestore for a user.
 * Reads from both users/{uid} document (guaranteed permission) and subcollections.
 */
export async function loadImprovementBookFromFirestore(uid) {
  if (!uid) return { prelims: {}, mains: {} };
  let cloudBook = { prelims: {}, mains: {} };

  // 1. Primary: Read from user's main document (always authorized)
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data()?.improvementBook) {
      cloudBook = userSnap.data().improvementBook;
    }
  } catch (err) {
    console.warn('Error reading improvementBook from user document:', err);
  }

  // 2. Secondary: Check subcollection users/{uid}/improvement_book (if rules permit)
  try {
    const colRef = collection(db, 'users', uid, 'improvement_book');
    const snap = await getDocs(colRef);
    snap.forEach(d => {
      const data = d.data();
      const section = data.section || 'prelims';
      const subject = data.subject;
      const questions = Array.isArray(data.questions) ? data.questions : [];

      if (subject && (section === 'prelims' || section === 'mains')) {
        if (!cloudBook[section]) cloudBook[section] = {};
        if (!cloudBook[section][subject]) cloudBook[section][subject] = [];
        const map = new Map();
        cloudBook[section][subject].forEach(q => { if (q?.id) map.set(q.id, q); });
        questions.forEach(q => { if (q?.id) map.set(q.id, q); });
        cloudBook[section][subject] = Array.from(map.values());
      }
    });
  } catch (err) {
    // subcollection fallback
  }

  return cloudBook;
}

/**
 * Save a single subject's questions to Firestore.
 */
export async function saveSubjectToFirestore(uid, section, subject, questions) {
  if (!uid || !section || !subject) return;
  try {
    const safeDocId = `${section}__${encodeURIComponent(subject.trim())}`;
    const docRef = doc(db, 'users', uid, 'improvement_book', safeDocId);
    await setDoc(docRef, sanitizeForFirestore({
      section,
      subject,
      questions,
      count: questions.length,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  } catch (err) {
    // subcollection fallback
  }
}

const IB_KEY = 'improvement_book_v2';

/**
 * Full bi-directional sync:
 * 1. Reads local localStorage ('improvement_book_v2')
 * 2. Fetches cloud data from Firestore (users/{uid})
 * 3. Merges without duplicate questions
 * 4. Saves merged data to localStorage
 * 5. Saves merged data to users/{uid} document (guaranteed permission) and subcollection
 */
export async function syncImprovementBookWithCloud(uid) {
  const currentUid = uid || auth?.currentUser?.uid;
  if (!currentUid) {
    try {
      return JSON.parse(localStorage.getItem(IB_KEY) || '{"prelims":{},"mains":{}}');
    } catch {
      return { prelims: {}, mains: {} };
    }
  }

  // 1. Read local
  let localBook = { prelims: {}, mains: {} };
  try {
    localBook = JSON.parse(localStorage.getItem(IB_KEY) || '{"prelims":{},"mains":{}}');
  } catch (e) {
    localBook = { prelims: {}, mains: {} };
  }

  // 2. Fetch cloud
  const cloudBook = await loadImprovementBookFromFirestore(currentUid);

  // 3. Merge
  const mergedBook = mergeImprovementBooks(localBook, cloudBook);

  // 4. Save merged into localStorage
  try {
    localStorage.setItem(IB_KEY, JSON.stringify(mergedBook));
  } catch (e) {
    console.warn('Error saving merged ImprovementBook to localStorage:', e);
  }

  // 5. Always persist merged book to doc(db, 'users', currentUid)
  try {
    await setDoc(doc(db, 'users', currentUid), {
      improvementBook: sanitizeForFirestore(mergedBook),
      improvementBookSummary: {
        totalPrelims: Object.values(mergedBook.prelims || {}).reduce((s, a) => s + (a?.length || 0), 0),
        totalMains: Object.values(mergedBook.mains || {}).reduce((s, a) => s + (a?.length || 0), 0),
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });
  } catch (e) {
    console.warn('Error saving improvementBook to user doc:', e);
  }

  // 6. Also update subcollection if accessible
  try {
    for (const section of ['prelims', 'mains']) {
      const sectionData = mergedBook[section] || {};
      for (const [subject, qs] of Object.entries(sectionData)) {
        await saveSubjectToFirestore(currentUid, section, subject, qs);
      }
    }
  } catch (e) {
    // subcollection fallback
  }

  return mergedBook;
}
