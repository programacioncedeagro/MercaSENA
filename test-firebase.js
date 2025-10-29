// Archivo de prueba para verificar la configuración de Firebase
// Ejecutar desde la consola del navegador en localhost:3000

// Función para probar Firebase Auth
async function testFirebaseAuth() {
  console.log('🔍 Verificando configuración de Firebase...');
  
  // Verificar si Firebase está disponible
  if (typeof window !== 'undefined' && window.firebase) {
    console.log('✅ Firebase está cargado');
  } else {
    console.log('❌ Firebase no está disponible en window');
  }

  try {
    // Crear usuario de prueba
    const testEmail = 'test@producer.com';
    const testPassword = 'test123456';
    
    console.log('🔧 Creando usuario de prueba...');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    
    // Esta función debe ejecutarse desde la consola del navegador
    // donde las funciones de Firebase están disponibles
    console.log('👆 Ejecuta manualmente en la consola del navegador:');
    console.log(`
// 1. Crear usuario de prueba (Productor)
const testUserData = {
  email: '${testEmail}',
  password: '${testPassword}',
  name: 'Usuario Prueba',
  role: 'productor'
};

// 2. Ejecutar desde la página de registro (/signup)
// O usar Firebase Admin para crear el usuario

// 3. Para login manual:
console.log('Test credentials:', {
  email: '${testEmail}',
  password: '${testPassword}'
});
`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Exportar para uso en consola
if (typeof window !== 'undefined') {
  window.testFirebaseAuth = testFirebaseAuth;
}

export default testFirebaseAuth;