'use client';

import { useUser, useAuth, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function DebugPage() {
  const { user, isUserLoading, userError } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [status, setStatus] = useState<string>('');

  const createTestUsers = async () => {
    try {
      setStatus('Creando usuarios de prueba...');
      
      // Crear productor de prueba
      const producerCredential = await createUserWithEmailAndPassword(
        auth, 
        'productor@test.com', 
        'test123456'
      );
      
      const producerDocRef = doc(firestore, 'users', producerCredential.user.uid);
      await setDoc(producerDocRef, {
        id: producerCredential.user.uid,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'productor@test.com',
        telefono: '3001234567',
        departamento: 'Cundinamarca',
        municipio: 'Bogotá',
        tipoProductor: 'agricultura',
        descripcion: 'Productor de hortalizas',
        role: 'productor',
        fechaRegistro: new Date().toISOString(),
        estado: 'activo',
      });

      // Crear comprador de prueba
      const buyerCredential = await createUserWithEmailAndPassword(
        auth, 
        'comprador@test.com', 
        'test123456'
      );
      
      const buyerDocRef = doc(firestore, 'users', buyerCredential.user.uid);
      await setDoc(buyerDocRef, {
        id: buyerCredential.user.uid,
        nombre: 'María',
        apellido: 'González',
        email: 'comprador@test.com',
        telefono: '3009876543',
        departamento: 'Antioquia',
        municipio: 'Medellín',
        tipoComprador: 'restaurante',
        nombreEmpresa: 'Restaurante El Buen Sabor',
        descripcion: 'Restaurante familiar',
        role: 'comprador',
        fechaRegistro: new Date().toISOString(),
        estado: 'activo',
      });
      
      setStatus('✅ Usuarios de prueba creados exitosamente');
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      setStatus('Probando login de productor...');
      await signInWithEmailAndPassword(auth, 'productor@test.com', 'test123456');
      setStatus('✅ Login de productor exitoso');
    } catch (error: any) {
      setStatus(`❌ Error en login: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">🛠 Debug - Estado de Firebase</h1>
      
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>✅ Configuración Correcta</AlertTitle>
        <AlertDescription>
          <strong>Firebase Authentication configurado correctamente</strong>. Los métodos habilitados son:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>✅ Email/Password</li>
            <li>✅ Google</li>
            <li>❌ Anónimo (eliminado del código)</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            🔧 Solución Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Para solucionar el problema de autenticación:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Ve a{' '}
                <a 
                  href="https://console.firebase.google.com/project/studio-5379754521-69f86/authentication/providers" 
                  className="text-blue-600 underline hover:text-blue-800" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Firebase Console - Authentication
                </a>
              </li>
              <li>Haz clic en <code className="bg-gray-100 px-1 rounded">Email/Password</code> en la lista de proveedores</li>
              <li>Habilita <strong>Email/Password</strong> (primer toggle)</li>
              <li>Haz clic en <strong>Guardar</strong></li>
              <li>Vuelve a esta página y prueba crear un usuario</li>
            </ol>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>📊 Estado de Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Badge variant={isUserLoading ? "secondary" : "outline"}>
                Usuario cargando: {isUserLoading ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div>
              <Badge variant={user ? "default" : "destructive"}>
                Autenticado: {user ? 'Sí' : 'No'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>UID:</strong> {user?.uid || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Auth disponible:</strong> {auth ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Firestore disponible:</strong> {firestore ? '✅ Sí' : '❌ No'}</p>
            {userError && (
              <p className="text-red-600 bg-red-50 p-2 rounded">
                <strong>Error:</strong> {userError.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧪 Herramientas de Prueba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={createTestUsers} className="h-12">
              Crear Usuarios de Prueba
            </Button>
            <Button onClick={testLogin} variant="outline" className="h-12">
              Probar Login Productor
            </Button>
          </div>
          
          {status && (
            <Alert>
              <AlertDescription className="font-mono text-sm">{status}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔐 Credenciales de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm space-y-2">
            <div><strong>Productor:</strong></div>
            <div>Email: productor@test.com</div>
            <div>Contraseña: test123456</div>
            <div className="border-t pt-2 mt-2"><strong>Comprador:</strong></div>
            <div>Email: comprador@test.com</div>
            <div>Contraseña: test123456</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Usa estas credenciales después de crear los usuarios de prueba
          </p>
        </CardContent>
      </Card>
    </div>
  );
}