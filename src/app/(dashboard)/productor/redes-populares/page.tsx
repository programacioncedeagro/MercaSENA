'use client';

import { useMemo, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, ClipboardCheck, Megaphone } from 'lucide-react';

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
    title: '1. Conformacion de Redes Populares',
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
    title: '3. Test de Evaluacion',
    description: 'Instrumento de campo para evaluar y guardar resultados en Firestore.',
    href: '/redes-populares/evaluacion',
    icon: ClipboardCheck,
  },
];

export default function RedesPopularesProcessPage() {
  const [activeStepId, setActiveStepId] = useState<ProcessStep['id']>('conformacion');

  const activeStep = useMemo(() => {
    return steps.find((step) => step.id === activeStepId) ?? steps[0];
  }, [activeStepId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion de Redes Populares</h1>
        <p className="text-muted-foreground mt-2 max-w-4xl">
          Nuevo proceso integrado para conformacion, convocatoria y evaluacion de redes populares.
        </p>
      </div>

      <Card className="border-green-200 bg-green-50/40">
        <CardHeader>
          <CardTitle>Flujo integrado del proceso</CardTitle>
          <CardDescription>
            Selecciona una etapa para visualizarla dentro de MercaSENA. Cada módulo está migrado a páginas nativas de la
            aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStepId;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepId(step.id)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  isActive
                    ? 'border-green-600 bg-green-100/70'
                    : 'border-border bg-card hover:border-green-300 hover:bg-green-50/40'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-green-700" />
                  <Badge variant={isActive ? 'default' : 'secondary'}>{step.title.split('.')[0]}</Badge>
                </div>
                <p className="font-semibold leading-tight">{step.title.replace(/^\d+\.\s*/, '')}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-snug">{step.description}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{activeStep.title}</CardTitle>
            <CardDescription>{activeStep.description}</CardDescription>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={activeStep.href}>
              Ir al módulo
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            La etapa seleccionada se gestiona directamente en la plataforma para mantener consistencia visual,
            trazabilidad y mantenimiento centralizado.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
