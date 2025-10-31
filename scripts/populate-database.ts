/**
 * Script para poblar la base de datos con datos de ejemplo
 * Incluye productores y sus producciones correspondientes
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import { sampleProductions } from '../src/lib/sample-productions';
import type { User, Production } from '../src/lib/types';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de productores de ejemplo
const sampleProducers: Omit<User, 'id'>[] = [
  {
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    role: 'productor'
  },
  {
    name: 'María García',
    email: 'maria.garcia@example.com',
    role: 'productor'
  },
  {
    name: 'José Martínez',
    email: 'jose.martinez@example.com',
    role: 'productor'
  },
  {
    name: 'Ana López',
    email: 'ana.lopez@example.com',
    role: 'productor'
  },
  {
    name: 'Fernando Silva',
    email: 'fernando.silva@example.com',
    role: 'productor'
  },
  {
    name: 'Diana Morales',
    email: 'diana.morales@example.com',
    role: 'productor'
  }
];

async function populateDatabase() {
  try {
    console.log('🌱 Iniciando poblado de la base de datos...');

    // Crear productores y obtener sus IDs
    console.log('👥 Creando productores...');
    const producerIds: string[] = [];

    for (const [index, producer] of sampleProducers.entries()) {
      try {
        const docRef = await addDoc(collection(db, 'users'), producer);
        producerIds.push(docRef.id);
        console.log(`✅ Productor creado: ${producer.name} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Error creando productor ${producer.name}:`, error);
      }
    }

    // Crear producciones asociadas a los productores
    console.log('\n🚜 Creando producciones...');
    
    for (const [index, production] of sampleProductions.entries()) {
      if (index < producerIds.length) {
        try {
          const productionWithProducer: Omit<Production, 'id'> = {
            ...production,
            producerId: producerIds[index]
          };

          const docRef = await addDoc(collection(db, 'productions'), productionWithProducer);
          console.log(`✅ Producción creada: ${production.name} (ID: ${docRef.id}) - Productor: ${sampleProducers[index].name}`);
        } catch (error) {
          console.error(`❌ Error creando producción ${production.name}:`, error);
        }
      }
    }

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${producerIds.length} productores creados`);
    console.log(`   - ${sampleProductions.length} producciones creadas`);
    
  } catch (error) {
    console.error('💥 Error general poblando la base de datos:', error);
  }
}

// Ejecutar el script
if (require.main === module) {
  populateDatabase()
    .then(() => {
      console.log('\n✨ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error ejecutando el script:', error);
      process.exit(1);
    });
}

export { populateDatabase };