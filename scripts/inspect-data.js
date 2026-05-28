/**
 * Script para verificar la estructura actual de los datos
 * y mostrar qué campos están disponibles
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, getDocs } = require('firebase/firestore');
const { firebaseConfig } = require('./firebase-config');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectData() {
  try {
    console.log('🔍 Inspeccionando estructura de datos en la base de datos...\n');

    // Obtener todas las producciones usando collectionGroup
    const productionsSnapshot = await getDocs(collectionGroup(db, 'productions'));
    
    console.log(`📊 Total producciones encontradas: ${productionsSnapshot.size}\n`);
    
    if (productionsSnapshot.size === 0) {
      console.log('❌ No se encontraron producciones en la base de datos');
      return;
    }

    productionsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const pathParts = doc.ref.path.split('/');
      const userId = pathParts[1];
      
      console.log(`🌱 Producción ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Usuario ID: ${userId}`);
      console.log(`   Ruta: ${doc.ref.path}`);
      console.log(`   Campos disponibles:`);
      
      // Mostrar todos los campos disponibles
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (typeof value === 'object' && value !== null) {
          console.log(`     ${key}: [objeto con ${Object.keys(value).length} propiedades]`);
        } else {
          console.log(`     ${key}: ${value}`);
        }
      });
      
      console.log('   ───────────────────────────\n');
    });

  } catch (error) {
    console.error('💥 Error inspeccionando datos:', error);
  }
}

// Ejecutar el script
inspectData()
  .then(() => {
    console.log('✨ Inspección completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error ejecutando el script:', error);
    process.exit(1);
  });