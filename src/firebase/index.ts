'use client';

import { firebaseConfig as firebaseConfigTemplate } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Attempt to import the local config, which should be ignored by git.
// Fallback to the template if it doesn't exist.
let activeConfig;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localConfig = require('./config.local');
  activeConfig = localConfig.firebaseConfigLocal;
} catch (e) {
  activeConfig = firebaseConfigTemplate;
}


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): FirebaseApp {
  // This is the standard singleton pattern for Firebase initialization.
  // It ensures that Firebase is initialized only once.
  if (!getApps().length) {
    return initializeApp(activeConfig);
  } else {
    return getApp();
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
