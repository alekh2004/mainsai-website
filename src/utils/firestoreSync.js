import { db, auth } from '../firebase';
import {
  doc, setDoc, getDoc, getDocs, collection, query, where
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
 * Reads directly from users/{uid}.improvementBook (always has full read permissions)
 * as well as subcollections.
 */
export async function loadImprovementBookFromFirestore(uid) {
  if (!uid) return { prelims: {}, mains: {} };
  let cloudBook = { prelims: {}, mains: {} };

  // 1. Primary: Read directly from user document (100% permission guaranteed)
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.improvementBook && typeof data.improvementBook === 'object') {
        cloudBook = mergeImprovementBooks(cloudBook, data.improvementBook);
      }
    }
  } catch (err) {
    console.warn('Error reading improvementBook from user document:', err);
  }

  // 2. Secondary: Read from subcollection if permitted
  try {
    const colRef = collection(db, 'users', uid, 'improvement_book');
    const snap = await getDocs(colRef);
    snap.forEach(d => {
      const data = d.data();
      const section = data.section || 'prelims';
      const subject = data.subject;
      const questions = Array.isArray(data.questions) ? data.questions : [];

      if (subject && (section === 'prelims' || section === 'mains')) {
        if (!cloudBook[section][subject]) cloudBook[section][subject] = [];
        cloudBook[section][subject] = questions;
      }
    });
  } catch (_) {
    // Subcollection might be restricted by rules; user doc is primary
  }

  return cloudBook;
}

/**
 * Save a single subject's questions to Firestore user document.
 */
export async function saveSubjectToFirestore(uid, section, subject, questions) {
  if (!uid || !section || !subject) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    let existingBook = { prelims: {}, mains: {} };
    if (userSnap.exists() && userSnap.data()?.improvementBook) {
      existingBook = userSnap.data().improvementBook;
    }
    if (!existingBook[section]) existingBook[section] = {};
    existingBook[section][subject] = questions;

    await setDoc(userDocRef, {
      improvementBook: sanitizeForFirestore(existingBook),
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn(`Error saving subject ${subject} to Firestore:`, err);
  }
}

const IB_KEY = 'improvement_book_v2';

/**
 * Full bi-directional sync:
 * 1. Reads local localStorage ('improvement_book_v2')
 * 2. Fetches cloud data from Firestore (users/{uid}.improvementBook)
 * 3. Merges without duplicate questions
 * 4. Saves merged data to localStorage
 * 5. Uploads merged book back to users/{uid}.improvementBook in Firestore
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

  // 3. Merge both sources
  const mergedBook = mergeImprovementBooks(localBook, cloudBook);

  // 4. Save merged into localStorage
  try {
    localStorage.setItem(IB_KEY, JSON.stringify(mergedBook));
  } catch (e) {
    console.warn('Error saving merged ImprovementBook to localStorage:', e);
  }

  // 5. Persist merged book to Firestore directly on user doc (100% permission guaranteed)
  try {
    const cleanPayload = sanitizeForFirestore(mergedBook);
    const userDocRef = doc(db, 'users', currentUid);
    await setDoc(userDocRef, {
      improvementBook: cleanPayload,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Error saving improvementBook to user doc:', e);
  }

  return mergedBook;
}

/**
 * Load all user evaluations from Firestore (Primary: users/{uid}.savedEvaluations)
 */
export async function loadUserEvaluationsFromCloud(uid) {
  if (!uid) return [];
  const map = new Map();

  // 1. Primary: users/{uid}.savedEvaluations array (full permission guaranteed)
  try {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (Array.isArray(data.savedEvaluations)) {
        data.savedEvaluations.forEach(e => {
          if (e?.id) map.set(e.id, e);
        });
      }
    }
  } catch (err) {
    console.warn('Error reading savedEvaluations from user doc:', err);
  }

  // 2. Secondary: Root 'evaluations' collection (if permitted)
  try {
    const qRoot = query(
      collection(db, 'evaluations'),
      where('userId', '==', uid)
    );
    const snapRoot = await getDocs(qRoot);
    snapRoot.forEach(d => {
      const cloudItem = { id: d.id, ...d.data() };
      map.set(d.id, { ...(map.get(d.id) || {}), ...cloudItem });
    });
  } catch (_) {}

  // 3. Tertiary: Subcollection 'users/{uid}/evaluations' (if permitted)
  try {
    const qSub = query(collection(db, 'users', uid, 'evaluations'));
    const snapSub = await getDocs(qSub);
    snapSub.forEach(d => {
      const cloudItem = { id: d.id, ...d.data() };
      map.set(d.id, { ...(map.get(d.id) || {}), ...cloudItem });
    });
  } catch (_) {}

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

/**
 * Persist user evaluations to Firestore.
 * Always saves directly to users/{uid}.savedEvaluations and updates totalEvaluationsCount.
 */
export async function saveUserEvaluationsToCloud(uid, evaluationsList) {
  if (!uid || !Array.isArray(evaluationsList)) return;
  try {
    // Keep last 100 tests in user doc to stay well within 1MB doc limit
    const cleanList = sanitizeForFirestore(evaluationsList.slice(0, 100));
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      savedEvaluations: cleanList,
      totalEvaluationsCount: evaluationsList.length,
      lastEvaluationAt: evaluationsList[0]?.createdAt || new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving evaluations to user document:', err);
  }
}
