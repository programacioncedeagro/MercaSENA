/**
 * Script para limpiar la colección 'productions' directa
 * y mantener solo las subcolecciones users/{userId}/productions
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc } = require('firebase/firestore');

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

async function cleanupProductionsCollection() {
  try {
    console.log('🧹 Limpiando colección "productions" directa...');

    const productionsSnapshot = await getDocs(collection(db, 'productions'));
    console.log(`   Encontrados ${productionsSnapshot.size} documentos para eliminar`);

    if (productionsSnapshot.size === 0) {
      console.log('✅ No hay documentos que eliminar en la colección "productions"');
      return;
    }

    for (const docSnapshot of productionsSnapshot.docs) {
      try {
        await deleteDoc(docSnapshot.ref);
        console.log(`   ✅ Eliminado: ${docSnapshot.data().name || docSnapshot.id}`);
      } catch (error) {
        console.error(`   ❌ Error eliminando ${docSnapshot.id}:`, error);
      }
    }

    console.log('\n🎉 ¡Limpieza completada!');
    console.log('📊 Ahora todas las producciones están organizadas por usuario en users/{userId}/productions');
    
  } catch (error) {
    console.error('💥 Error durante la limpieza:', error);
  }
}

// Ejecutar el script
cleanupProductionsCollection()
  .then(() => {
    console.log('\n✨ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error ejecutando el script:', error);
    process.exit(1);
  });