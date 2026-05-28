/**
 * Shared Firebase web config loader for local scripts.
 * Priority: NEXT_PUBLIC_* env vars -> FIREBASE_WEBAPP_CONFIG JSON.
 */
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

let webAppConfig = {};
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    webAppConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
  } catch (error) {
    console.warn('No se pudo parsear FIREBASE_WEBAPP_CONFIG:', error.message);
  }
}

function readConfig(publicEnvKey, firebaseKeyName) {
  return process.env[publicEnvKey] || webAppConfig[firebaseKeyName] || '';
}

const firebaseConfig = {
  apiKey: readConfig('NEXT_PUBLIC_FIREBASE_API_KEY', 'apiKey'),
  authDomain: readConfig('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'authDomain'),
  projectId: readConfig('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'projectId'),
  storageBucket: readConfig('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'storageBucket'),
  messagingSenderId: readConfig('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId'),
  appId: readConfig('NEXT_PUBLIC_FIREBASE_APP_ID', 'appId'),
};

const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
const missing = required.filter((key) => !firebaseConfig[key]);
if (missing.length > 0) {
  throw new Error(
    `Faltan variables Firebase para scripts: ${missing.join(', ')}. Configure .env.local o FIREBASE_WEBAPP_CONFIG.`,
  );
}

module.exports = { firebaseConfig };
