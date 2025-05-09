import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration for the Pizza Dashboard project (johndoughs app)
// This connects to the Firebase project used by your existing app
const firebaseConfig = {
  apiKey: 'AIzaSyAGdE3NNKFpZuKZ0uI3qCWXVtX92Z', // Replace with actual API key if needed
  authDomain: 'pizza-dashboard-92057.firebaseapp.com',
  projectId: 'pizza-dashboard-92057', 
  storageBucket: 'pizza-dashboard-92057.appspot.com',
  messagingSenderId: '287044348356', // Updated with correct GCM Sender ID
  appId: '1:287044348356:ios:5eb4c95d0f6a3eb2159c91' // Updated with correct App ID
};

// Configuration is now set up with values from your GoogleService-Info.plist

// Initialize Firebase
let app;
let auth;
let db;

// Check if Firebase is already initialized
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Initialize auth with AsyncStorage persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  // Initialize Firestore with settings optimized for mobile
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  });
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

// Firebase Messaging for push notifications will be configured separately
// for iOS and Android using the native Firebase SDKs

/**
 * How to set up push notifications:
 * 
 * For Android:
 * 1. Install @react-native-firebase/messaging
 * 2. Update AndroidManifest.xml
 * 3. Create firebase_messaging_service.xml
 * 
 * For iOS:
 * 1. Setup APNs
 * 2. Add push capability in XCode
 * 3. Configure Info.plist
 * 
 * This functionality would be implemented in a separate module
 * dedicated to handling notifications
 */

export { app, auth, db };
