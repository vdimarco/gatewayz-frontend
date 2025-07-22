import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "model-insights-yn4er",
  "appId": "1:80845975507:web:453d4da5ec5e8e83258926",
  "storageBucket": "model-insights-yn4er.firebasestorage.app",
  "apiKey": "AIzaSyBOxnyFsGf6ULXxVKhRSzmfXIPZIR_NEG4",
  "authDomain": "model-insights-yn4er.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "80845975507"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
