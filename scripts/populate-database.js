/**
 * Script simple para poblar la base de datos con datos de ejemplo
 * Versión JavaScript para ejecutar directamente con Node.js
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

// Datos de productores de ejemplo
const sampleProducers = [
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

// Datos de producciones de ejemplo
const sampleProductions = [
  {
    name: 'Tomate Chonto Premium',
    type: 'Agrícola',
    productImage: '/api/placeholder/600/400',
    location: 'Paipa, Boyacá',
    area: 2.5,
    plantingDate: '2024-10-15',
    status: 'Crecimiento',
    progress: 65,
    estimatedHarvestDate: '2025-01-20',
    projectedYield: '37,500 kg estimados',
    coordinates: [5.7812, -73.1178],
    divipolaCode: '15537',
    expectedQuantity: 37500,
    availableQuantity: 37500,
    reservedQuantity: 5000,
    soldQuantity: 0,
    unitPrice: 3200,
    minOrderQuantity: 100,
    maxOrderQuantity: 10000,
    isHarvested: false,
    estimatedDuration: 120,
    totalActivities: 18,
    keyMilestones: 6,
    certifications: ['Orgánico', 'Buenas Prácticas Agrícolas'],
    qualityStandards: ['ICONTEC', 'GlobalGAP'],
    currentPrice: 3200
  },
  {
    name: 'Lechuga Crespa Hidropónica',
    type: 'Agrícola',
    productImage: '/api/placeholder/600/400',
    location: 'Chía, Cundinamarca',
    area: 0.8,
    plantingDate: '2024-11-01',
    status: 'Siembra',
    progress: 25,
    estimatedHarvestDate: '2024-12-20',
    projectedYield: '4,800 kg estimados',
    coordinates: [4.8647, -74.0581],
    divipolaCode: '25175',
    expectedQuantity: 4800,
    availableQuantity: 4800,
    reservedQuantity: 0,
    soldQuantity: 0,
    unitPrice: 4500,
    minOrderQuantity: 50,
    maxOrderQuantity: 2000,
    isHarvested: false,
    estimatedDuration: 50,
    totalActivities: 12,
    keyMilestones: 4,
    certifications: ['Hidropónico', 'Libre de Pesticidas'],
    qualityStandards: ['ICONTEC'],
    currentPrice: 4500
  },
  {
    name: 'Aguacate Hass Orgánico',
    type: 'Agrícola',
    productImage: '/api/placeholder/600/400',
    location: 'Caldas, Antioquia',
    area: 5.0,
    plantingDate: '2022-03-15',
    status: 'Cosecha',
    progress: 95,
    estimatedHarvestDate: '2024-11-30',
    projectedYield: '75,000 kg estimados',
    coordinates: [6.0919, -75.6334],
    divipolaCode: '05129',
    expectedQuantity: 75000,
    availableQuantity: 68000,
    reservedQuantity: 12000,
    soldQuantity: 7000,
    unitPrice: 8500,
    minOrderQuantity: 500,
    maxOrderQuantity: 15000,
    isHarvested: true,
    harvestedQuantity: 75000,
    harvestDate: '2024-11-01',
    estimatedDuration: 960,
    totalActivities: 45,
    keyMilestones: 12,
    certifications: ['Orgánico Certificado', 'Comercio Justo', 'Rainforest Alliance'],
    qualityStandards: ['ICONTEC', 'USDA Organic', 'Fairtrade'],
    currentPrice: 8500
  },
  {
    name: 'Ganado Holstein Premium',
    type: 'Pecuario',
    productImage: '/api/placeholder/600/400',
    location: 'Zipaquirá, Cundinamarca',
    area: 12.0,
    plantingDate: '2024-01-01',
    status: 'Mantenimiento',
    progress: 75,
    estimatedHarvestDate: '2025-06-30',
    projectedYield: '24,000 kg leche/año',
    coordinates: [5.0269, -74.0056],
    divipolaCode: '25899',
    expectedQuantity: 24000,
    availableQuantity: 18000,
    reservedQuantity: 3000,
    soldQuantity: 6000,
    unitPrice: 1800,
    minOrderQuantity: 200,
    maxOrderQuantity: 5000,
    isHarvested: false,
    estimatedDuration: 365,
    totalActivities: 24,
    keyMilestones: 8,
    certifications: ['Bienestar Animal', 'Leche A1'],
    qualityStandards: ['INVIMA', 'ICA'],
    currentPrice: 1800
  },
  {
    name: 'Café Especial Arábica',
    type: 'Agrícola',
    productImage: '/api/placeholder/600/400',
    location: 'Armenia, Quindío',
    area: 3.2,
    plantingDate: '2023-05-01',
    status: 'Cosecha',
    progress: 90,
    estimatedHarvestDate: '2024-12-15',
    projectedYield: '9,600 kg pergamino',
    coordinates: [4.5339, -75.6811],
    divipolaCode: '63001',
    expectedQuantity: 9600,
    availableQuantity: 8500,
    reservedQuantity: 2000,
    soldQuantity: 1100,
    unitPrice: 12000,
    minOrderQuantity: 100,
    maxOrderQuantity: 3000,
    isHarvested: false,
    estimatedDuration: 240,
    totalActivities: 28,
    keyMilestones: 8,
    certifications: ['Café Especial', 'Comercio Justo', 'Orgánico'],
    qualityStandards: ['SCA', 'Rainforest Alliance', 'UTZ'],
    currentPrice: 12000
  },
  {
    name: 'Cebolla Cabezona Amarilla',
    type: 'Agrícola',
    productImage: '/api/placeholder/600/400',
    location: 'Aquitania, Boyacá',
    area: 1.8,
    plantingDate: '2024-09-20',
    status: 'Crecimiento',
    progress: 45,
    estimatedHarvestDate: '2025-02-15',
    projectedYield: '54,000 kg estimados',
    coordinates: [5.5167, -72.8833],
    divipolaCode: '15051',
    expectedQuantity: 54000,
    availableQuantity: 54000,
    reservedQuantity: 8000,
    soldQuantity: 0,
    unitPrice: 2800,
    minOrderQuantity: 200,
    maxOrderQuantity: 15000,
    isHarvested: false,
    estimatedDuration: 150,
    totalActivities: 20,
    keyMilestones: 5,
    certifications: ['Buenas Prácticas Agrícolas'],
    qualityStandards: ['ICONTEC'],
    currentPrice: 2800
  }
];

async function populateDatabase() {
  try {
    console.log('🌱 Iniciando poblado de la base de datos...');

    // Crear productores y obtener sus IDs
    console.log('👥 Creando productores...');
    const producerIds = [];

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
          const productionWithProducer = {
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
populateDatabase()
  .then(() => {
    console.log('\n✨ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error ejecutando el script:', error);
    process.exit(1);
  });