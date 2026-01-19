'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, TrendingUp, Shield, Smartphone, Brain } from 'lucide-react';

export default function WelcomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    if (user) {
      // Si está autenticado, llevarlo a su dashboard
      router.push('/productor'); // Se puede mejorar con lógica de rol
    } else {
      // Si no está autenticado, llevarlo a registro
      router.push('/auth');
    }
    setIsLoading(false);
  };

  const features = [
    {
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      title: "Gestión Agropecuaria",
      description: "Administra tus cultivos, ganado y producción de manera eficiente"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Marketplace Directo",
      description: "Conecta directamente productores con compradores sin intermediarios"
    },
    {
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      title: "IA Integrada",
      description: "Recomendaciones inteligentes para optimizar tu producción"
    },
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      title: "Trazabilidad",
      description: "Seguimiento completo desde la siembra hasta el consumidor final"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      title: "Analytics",
      description: "Analiza tendencias de mercado y optimiza tus ganancias"
    },
    {
      icon: <Smartphone className="h-6 w-6 text-indigo-600" />,
      title: "Mobile First",
      description: "Accede desde cualquier dispositivo, en cualquier lugar"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">MercaSENA</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                SENA
              </Badge>
            </div>
            {user && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/productor')}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Ir al Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
              Plataforma Integral
              <span className="block text-green-600">Agropecuaria</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Conecta productores y compradores del sector agropecuario con tecnología de vanguardia, 
              inteligencia artificial y trazabilidad completa desde la siembra hasta el consumidor final.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                {isLoading ? 'Cargando...' : user ? 'Acceder al Dashboard' : 'Comenzar Ahora'}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push('/trazabilidad/demo')}
                className="border-green-200 text-green-700 hover:bg-green-50 px-8 py-3 text-lg"
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu negocio agropecuario
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Una plataforma completa desarrollada por el SENA para modernizar el sector agropecuario colombiano
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-green-100 hover:border-green-200 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center bg-green-600 rounded-3xl text-white my-16">
          <div className="max-w-2xl mx-auto space-y-6 px-6">
            <h2 className="text-3xl font-bold">
              Únete a la revolución agropecuaria digital
            </h2>
            <p className="text-green-100 text-lg">
              Plataforma innovadora desarrollada por el SENA para modernizar y digitalizar el sector agropecuario colombiano
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              variant="secondary"
              disabled={isLoading}
              className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg"
            >
              {isLoading ? 'Cargando...' : 'Registrarse Gratis'}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Leaf className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold text-white">MercaSENA</span>
            </div>
            <p className="text-sm">
              Desarrollado por el SENA - Servicio Nacional de Aprendizaje
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} SENA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}