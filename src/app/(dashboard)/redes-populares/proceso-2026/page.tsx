'use client';

import { type ComponentType } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ClipboardCheck, Megaphone, ArrowRight } from 'lucide-react';

type ProcessStep = {
  id: 'conformacion' | 'convocatoria' | 'test';
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const steps: ProcessStep[] = [
  {
    id: 'conformacion',
    title: '1. Conformación de Redes Populares',
    description: 'Documento base para estructurar las redes populares y su circuito territorial.',
    href: '/redes-populares/conformacion',
    icon: FileText,
  },
  {
    id: 'convocatoria',
    title: '2. Convocatoria',
    description: 'Lineamientos, criterios y condiciones para postular formas organizativas.',
    href: '/redes-populares/convocatoria',
    icon: Megaphone,
  },
  {
    id: 'test',
    title: '3. Test de Evaluación',
    description: 'Instrumento de campo para evaluar y guardar resultados en Firestore.',
    href: '/redes-populares/evaluacion',
    icon: ClipboardCheck,
  },
];

export default function RedesPopularesProcessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proceso de Redes Populares</h1>
        <p className="text-muted-foreground mt-2 max-w-4xl">
          Flujo integrado para conformación, convocatoria y evaluación de redes populares en módulos nativos de la plataforma.
        </p>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardHeader>
          <CardTitle>Etapas del proceso</CardTitle>
          <CardDescription>
            La información ya no se carga desde HTML estático: cada etapa está migrada a páginas de Next.js.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.id} className="rounded-lg border bg-card p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-700" />
                  <Badge variant="secondary">{step.title.split('.')[0]}</Badge>
                </div>
                <p className="font-semibold leading-tight">{step.title.replace(/^\d+\.\s*/, '')}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-snug">{step.description}</p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href={step.href}>
                    Ir al módulo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
