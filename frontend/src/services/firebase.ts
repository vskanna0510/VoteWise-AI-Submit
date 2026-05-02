/**
 * Firebase Auth + Storage — uses real Firebase when env vars are set.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface FirebaseUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: 'google.com';
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = (): boolean =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let app: FirebaseApp | null = null;

const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    });
  }
  return app;
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  if (!isFirebaseConfigured()) {
    return {
      uid: 'mock-google-uid',
      displayName: 'Demo Google User',
      email: 'demo.google@votewise.ai',
      photoURL: undefined,
      provider: 'google.com',
    };
  }

  const fb = getFirebaseApp();
  if (!fb) throw new Error('Firebase could not initialize. Check Firebase env vars.');
  const auth = getAuth(fb);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const u = result.user;
  return {
    uid: u.uid,
    displayName: u.displayName ?? 'Google User',
    email: u.email ?? '',
    photoURL: u.photoURL ?? undefined,
    provider: 'google.com',
  };
};

export const uploadCertificate = async (
  certId: string,
  blob: Blob
): Promise<{ url: string }> => {
  const fb = getFirebaseApp();
  if (!fb) {
    const url = URL.createObjectURL(blob);
    return { url };
  }
  try {
    const storage = getStorage(fb);
    const safeId = certId.replace(/[^\w\-]/g, '_').slice(0, 80);
    const storageRef = ref(storage, `certificates/${safeId}-${Date.now()}.html`);
    await uploadBytes(storageRef, blob, { contentType: blob.type || 'text/html' });
    const url = await getDownloadURL(storageRef);
    return { url };
  } catch {
    const url = URL.createObjectURL(blob);
    return { url };
  }
};
