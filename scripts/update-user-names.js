/**
 * Script para actualizar usuarios sin nombre
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const { firebaseConfig } = require('./firebase-config');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Nombres de ejemplo para usuarios sin nombre
const defaultNames = [
  'Productor Regional',
  'Agricultor Local', 
  'Ganadero Tradicional',
  'Productor Sostenible',
  'Campesino Experto'
];

async function updateUsersWithoutNames() {
  try {
    console.log('🔧 Actualizando usuarios sin nombre...');

    const usersSnapshot = await getDocs(collection(db, 'users'));
    let updatedCount = 0;
    let nameIndex = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Si es productor y no tiene nombre
      if (userData.role === 'productor' && (!userData.name || userData.name === undefined)) {
        try {
          const newName = `${defaultNames[nameIndex % defaultNames.length]} ${Math.floor(Math.random() * 1000)}`;
          
          await updateDoc(doc(db, 'users', userDoc.id), {
            name: newName
          });
          
          console.log(`✅ Actualizado usuario ${userDoc.id} -> ${newName}`);
          updatedCount++;
          nameIndex++;
        } catch (error) {
          console.error(`❌ Error actualizando usuario ${userDoc.id}:`, error);
        }
      } else if (userData.role === 'productor') {
        console.log(`ℹ️  Usuario ${userDoc.id} ya tiene nombre: ${userData.name}`);
      }
    }

    console.log(`\n🎉 Actualización completada: ${updatedCount} usuarios actualizados`);
    
  } catch (error) {
    console.error('💥 Error durante la actualización:', error);
  }
}

// Ejecutar el script
updateUsersWithoutNames()
  .then(() => {
    console.log('\n✨ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error ejecutando el script:', error);
    process.exit(1);
  });