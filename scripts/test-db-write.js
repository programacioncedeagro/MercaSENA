const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, limit } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function testDatabase() {
  console.log('--- Probando Conexión a Firebase ---');
  console.log('Proyecto:', firebaseConfig.projectId);
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('1. Intentando escribir un documento de prueba...');
    const testData = {
      testMessage: "Prueba de conexión desde el asistente",
      timestamp: new Date().toISOString(),
      source: "Assistant Script"
    };

    const docRef = await addDoc(collection(db, 'test_connection'), testData);
    console.log('✅ Éxito al escribir. ID del documento:', docRef.id);

    console.log('2. Intentando leer la colección aulaMovilBookings (vacía o no)...');
    const q = query(collection(db, 'aulaMovilBookings'), limit(1));
    const querySnapshot = await getDocs(q);
    console.log('✅ Éxito al leer. Documentos encontrados:', querySnapshot.size);

    console.log('\n--- PRUEBA FINALIZADA CON ÉXITO ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR DURANTE LA PRUEBA:', error.code, error.message);
    process.exit(1);
  }
}

testDatabase();
