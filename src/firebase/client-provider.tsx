'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, getSdks } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Firebase is initialized here, on the client, and the instances are passed down.
  const app = initializeFirebase();
  const { auth, firestore } = getSdks(app);

  return (
    <FirebaseProvider
      firebaseApp={app}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
