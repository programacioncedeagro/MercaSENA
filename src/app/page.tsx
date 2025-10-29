'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // Si el usuario está autenticado, ir a la ruta de dashboard que sí existe
        // Usaremos la estructura existente (dashboard)
        router.push('/productor'); // Temporal - la lógica de rol se manejará en el layout
      } else {
        // Si no está autenticado, ir a la página de selección de auth
        router.push('/auth');
      }
    }
  }, [user, isUserLoading, router]);

  // Mostrar loading mientras se determina el estado de autenticación
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="text-green-800 font-medium">Cargando MercaSENA...</p>
      </div>
    </div>
  );
}