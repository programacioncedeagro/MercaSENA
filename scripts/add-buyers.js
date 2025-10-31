/**
 * Script para agregar compradores de ejemplo a la base de datos
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBMtF7Nj5tMwKVPyhe4zKYxJodKbqDhAIo",
  authDomain: "studio-5379754521-69f86.firebaseapp.com",
  projectId: "studio-5379754521-69f86",
  storageBucket: "studio-5379754521-69f86.firebasestorage.app",
  messagingSenderId: "943518391543",
  appId: "1:943518391543:web:3fbea07ee3b500a56b87f2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de compradores de ejemplo
const sampleBuyers = [
  {
    name: 'Supermercados La Plaza',
    email: 'compras@laplaza.com',
    role: 'comprador'
  },
  {
    name: 'Restaurante El Jardín',
    email: 'chef@eljardin.com',
    role: 'comprador'
  },
  {
    name: 'Mercado Campesino',
    email: 'gerencia@mercadocampesino.com',
    role: 'comprador'
  },
  {
    name: 'Distribuidora Fruver',
    email: 'distribuidora@fruver.com',
    role: 'comprador'
  },
  {
    name: 'Cooperativa Alimentaria',
    email: 'cooperativa@alimentaria.org',
    role: 'comprador'
  }
];

async function addBuyers() {
  try {
    console.log('🛒 Agregando compradores de ejemplo...');

    for (const buyer of sampleBuyers) {
      try {
        const docRef = await addDoc(collection(db, 'users'), buyer);
        console.log(`✅ Comprador creado: ${buyer.name} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Error creando comprador ${buyer.name}:`, error);
      }
    }

    console.log('\n🎉 ¡Compradores agregados exitosamente!');
    console.log(`📊 Total compradores: ${sampleBuyers.length}`);
    
  } catch (error) {
    console.error('💥 Error general agregando compradores:', error);
  }
}

// Ejecutar el script
addBuyers()
  .then(() => {
    console.log('\n✨ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error ejecutando el script:', error);
    process.exit(1);
  });