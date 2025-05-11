import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase using the web SDK (works better with Expo)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for Firestore (if needed)
// This requires additional setup with enableIndexedDbPersistence
// but we'll keep it simple for now

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
