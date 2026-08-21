import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const app = initializeApp({
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  measurementId: config.measurementId,
});

// Extract databaseId from config if present, since AI Studio uses a specific database instance
// getFirestore can take a secondary argument for databaseId. Wait, getFirestore doesn't natively take it as second arg in older SDKs?
// In newer Firebase JS SDKs, getFirestore(app, "databaseId") is not officially documented as a string like that in V9 sometimes, wait!
// Actually it is `initializeFirestore(app, {}, "databaseId")` or `getFirestore(app, "databaseId")` in modern versions.
// Wait, looking at AI Studio firebase skill, it says:
// Initialize Firestore with the databaseId if one was provided in the config:
// const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)' 
//    ? initializeFirestore(app, {}, config.firestoreDatabaseId)
//    : getFirestore(app);

// Let's implement that.
import { initializeFirestore } from 'firebase/firestore';

export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? initializeFirestore(app, {}, config.firestoreDatabaseId)
  : getFirestore(app);
