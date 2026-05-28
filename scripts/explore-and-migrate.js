/**
 * Script para explorar la estructura actual de la base de datos
 * y migrar datos existentes
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, collectionGroup, addDoc } = require('firebase/firestore');
const { firebaseConfig } = require('./firebase-config');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function exploreDatabase() {
  try {
    console.log('🔍 Explorando estructura de la base de datos...\n');

    // 1. Explorar colección users
    console.log('👥 Usuarios en la colección "users":');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`   Total usuarios: ${usersSnapshot.size}`);
    
    usersSnapshot.forEach(userDoc => {
      const userData = userDoc.data();
      console.log(`   - ${userData.name} (${userData.role}) - ID: ${userDoc.id}`);
    });

    // 2. Explorar colección productions (directa)
    console.log('\n🚜 Producciones en la colección "productions":');
    const productionsSnapshot = await getDocs(collection(db, 'productions'));
    console.log(`   Total producciones: ${productionsSnapshot.size}`);
    
    productionsSnapshot.forEach(prodDoc => {
      const prodData = prodDoc.data();
      console.log(`   - ${prodData.name} (${prodData.type}) - Productor ID: ${prodData.producerId}`);
    });

    // 3. Explorar subcoleciiones de producciones (users/{id}/productions)
    console.log('\n📁 Producciones en subcolecciones (users/{id}/productions):');
    const productionsGroupSnapshot = await getDocs(collectionGroup(db, 'productions'));
    console.log(`   Total producciones en subcolecciones: ${productionsGroupSnapshot.size}`);
    
    const subCollectionProductions = [];
    productionsGroupSnapshot.forEach(prodDoc => {
      const prodData = prodDoc.data();
      const pathParts = prodDoc.ref.path.split('/');
      const userId = pathParts[1]; // users/{userId}/productions/{prodId}
      
      console.log(`   - ${prodData.name} (${prodData.type}) - Usuario: ${userId}`);
      subCollectionProductions.push({
        id: prodDoc.id,
        data: prodData,
        userId: userId,
        originalRef: prodDoc.ref.path
      });
    });

    // 4. Migrar datos de subcolecciones a colección principal
    if (subCollectionProductions.length > 0) {
      console.log('\n🔄 ¿Migrar producciones de subcolecciones a colección principal? (Y/n)');
      
      // Para automatizar, vamos a migrar automáticamente
      console.log('✅ Migrando automáticamente...');
      
      for (const production of subCollectionProductions) {
        try {
          const migrationData = {
            ...production.data,
            producerId: production.userId,
            migratedFrom: production.originalRef,
            migratedAt: new Date().toISOString()
          };
          
          const newDocRef = await addDoc(collection(db, 'productions'), migrationData);
          console.log(`   ✅ Migrado: ${production.data.name} -> ${newDocRef.id}`);
        } catch (error) {
          console.error(`   ❌ Error migrando ${production.data.name}:`, error);
        }
      }
    }

    console.log('\n📊 Resumen final:');
    const finalProductionsSnapshot = await getDocs(collection(db, 'productions'));
    console.log(`   Total producciones en colección principal: ${finalProductionsSnapshot.size}`);

  } catch (error) {
    console.error('💥 Error explorando la base de datos:', error);
  }
}

// Ejecutar el script
exploreDatabase()
  .then(() => {
    console.log('\n✨ Exploración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error ejecutando el script:', error);
    process.exit(1);
  });