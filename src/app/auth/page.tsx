'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Tractor, ShoppingCart, ArrowRight, Users, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function AuthSelectionPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Logo className="w-64 h-auto mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-green-800">¡Bienvenido a MercaSENA!</h1>
          <p className="text-xl text-green-600 max-w-2xl mx-auto">
            Conectamos productores agrícolas con compradores para crear un mercado justo y sostenible
          </p>
        </div>

        {/* Selector de Rol */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Productor */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-green-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Tractor className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-800">Soy Productor</CardTitle>
              <p className="text-green-600">Vendo mis productos agrícolas</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Leaf className="w-4 h-4 text-green-500" />
                  <span>Gestiona tus cultivos y producciones</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>Conecta directamente con compradores</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ArrowRight className="w-4 h-4 text-green-500" />
                  <span>Obtén mejores precios por tus productos</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/auth/productor/registro" className="block">
                  <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700">
                    Registrarme como Productor
                  </Button>
                </Link>
                <Link href="/auth/productor/login" className="block">
                  <Button variant="outline" className="w-full h-12 text-lg border-green-600 text-green-600 hover:bg-green-50">
                    Ya tengo cuenta de Productor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Comprador */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <ShoppingCart className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-800">Soy Comprador</CardTitle>
              <p className="text-blue-600">Busco productos agrícolas</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Leaf className="w-4 h-4 text-blue-500" />
                  <span>Encuentra productos frescos y de calidad</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Conecta directamente con productores</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                  <span>Accede a precios competitivos</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/auth/comprador/registro" className="block">
                  <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                    Registrarme como Comprador
                  </Button>
                </Link>
                <Link href="/auth/comprador/login" className="block">
                  <Button variant="outline" className="w-full h-12 text-lg border-blue-600 text-blue-600 hover:bg-blue-50">
                    Ya tengo cuenta de Comprador
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
          <p>
            Al registrarte, aceptas nuestros términos y condiciones. 
            MercaSENA es una plataforma segura que protege la información de todos sus usuarios.
          </p>
        </div>
      </div>
    </div>
  );
}