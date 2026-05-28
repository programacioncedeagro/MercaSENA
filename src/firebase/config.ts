type FirebaseWebAppConfig = {
  apiKey?: string;
  appId?: string;
  authDomain?: string;
  messagingSenderId?: string;
  projectId?: string;
  storageBucket?: string;
  measurementId?: string;
};

function parseFirebaseWebAppConfig(): FirebaseWebAppConfig {
  const raw = process.env.FIREBASE_WEBAPP_CONFIG;
  if (!raw) return {};

  try {
    return JSON.parse(raw) as FirebaseWebAppConfig;
  } catch {
    return {};
  }
}

const systemConfig = parseFirebaseWebAppConfig();

export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || systemConfig.projectId || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || systemConfig.appId || '',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || systemConfig.apiKey || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || systemConfig.authDomain || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || systemConfig.measurementId || '',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || systemConfig.messagingSenderId || '',
};
