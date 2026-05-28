'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Megaphone, ClipboardCheck, Database, BarChart3 } from 'lucide-react';

const resources = [
  {
    title: 'Conformación de Redes Populares',
    description: 'Documento base para la estructura de redes y su circuito territorial.',
    href: '/redes-populares/conformacion',
    icon: FileText,
  },
  {
    title: 'Convocatoria',
    description: 'Lineamientos y criterios para postulación de formas organizativas.',
    href: '/redes-populares/convocatoria',
    icon: Megaphone,
  },
  {
    title: 'Test de Evaluación',
    description: 'Instrumento de campo con registro en Firestore para procesamiento.',
    href: '/redes-populares/evaluacion',
    icon: ClipboardCheck,
  },
  {
    title: 'Informe de Priorización',
    description: 'Listado de organizaciones evaluadas ordenado por puntaje, separado por red.',
    href: '/redes-populares/informe-priorizacion',
    icon: BarChart3,
  },
];

export default function RedesPopularesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel Redes Populares</h1>
        <p className="text-muted-foreground mt-2">
          Espacio para gestionar conformación, convocatoria y evaluaciones en campo.
        </p>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-700" />
            Flujo de gestión y procesamiento
          </CardTitle>
          <CardDescription>
            Usa las opciones de abajo para abrir cada componente del proceso. Las evaluaciones del test se guardan en Firestore.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {resources.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.href}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-emerald-700" />
                  <Badge variant="secondary">Módulo</Badge>
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href={item.href}>Abrir módulo</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acceso al proceso integrado</CardTitle>
          <CardDescription>
            Vista unificada para navegar las tres etapas en una sola pantalla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/redes-populares/proceso">Ir al Proceso</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
