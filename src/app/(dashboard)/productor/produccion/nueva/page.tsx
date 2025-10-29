'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Bot, Loader2, Wand2, CheckCircle, FileText, Sparkles, ListChecks } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { getHarvestEstimateAction, generateComprehensiveWorkPlanAction } from '@/app/actions';
import type { ProjectedHarvestEstimatesOutput } from '@/ai/flows/projected-harvest-estimates';
import type { ComprehensiveWorkPlanOutput } from '@/ai/flows/comprehensive-work-plan';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { WorkPlanDisplay } from '@/components/work-plan-display';

const productionSchema = z.object({
  name: z.string().min(1, 'El nombre del producto es requerido.'),
  type: z.enum(['Agrícola', 'Pecuario'], { required_error: 'El tipo de producto es requerido.'}),
  plantingDate: z.date({ required_error: 'La fecha de siembra es requerida.' }),
  location: z.string().min(1, 'La ubicación es requerida.'),
  area: z.coerce.number().min(0.1, 'El área debe ser mayor a 0.'),
});

type ProductionFormValues = z.infer<typeof productionSchema>;

export default function NewProductionPage() {
  const { toast } = useToast();
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationResult, setEstimationResult] = useState<ProjectedHarvestEstimatesOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [workPlan, setWorkPlan] = useState<ComprehensiveWorkPlanOutput | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ProductionFormValues>({
    resolver: zodResolver(productionSchema),
  });
  
  const watchedFields = watch();

  const handleEstimate: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    const { name, plantingDate, location, area: areaValue } = watchedFields;

    if (!name || !plantingDate || !location || !areaValue) {
      toast({
        variant: "destructive",
        title: "Faltan datos para la estimación",
        description: "Por favor, completa el nombre del producto, fecha de siembra, ubicación y área.",
      });
      return;
    }

    setIsEstimating(true);
    setEstimationResult(null);

    const result = await getHarvestEstimateAction({
      cropType: name,
      plantingDate: format(plantingDate, 'yyyy-MM-dd'),
      location,
      area: Number(areaValue),
    });

    setIsEstimating(false);

    if (result.success && result.data) {
      setEstimationResult(result.data);
      toast({
        title: "Estimación Exitosa",
        description: `Fecha de cosecha estimada: ${format(new Date(result.data.estimatedHarvestDate), 'PPP', { locale: es })}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error en la estimación",
        description: result.error,
      });
    }
  };

  const handleGenerateWorkPlan: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    const { name, plantingDate, location, area: areaValue } = watchedFields;

    if (!name || !plantingDate || !location || !areaValue) {
      toast({
        variant: "destructive",
        title: "Faltan datos para generar el plan",
        description: "Por favor, completa todos los campos antes de generar el plan de trabajo.",
      });
      return;
    }

    setIsGeneratingPlan(true);
    setWorkPlan(null);

    const result = await generateComprehensiveWorkPlanAction({
      cropType: name,
      area: Number(areaValue),
      location,
      plantingDate: format(plantingDate, 'yyyy-MM-dd'),
      experience: 'Intermedio' // Puedes hacer esto configurable más adelante
    });

    setIsGeneratingPlan(false);

    if (result.success && result.data) {
      setWorkPlan(result.data);
      setShowPlan(true);
      toast({
        title: "Plan de Trabajo Generado",
        description: "Se ha creado un plan completo con metodología 5M, cronograma y análisis de rentabilidad.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error generando el plan",
        description: result.error,
      });
    }
  };

  const onSubmit: SubmitHandler<ProductionFormValues> = async (data) => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo registrar, intenta de nuevo.'});
        return;
    }
    if (!estimationResult) {
        toast({ variant: 'destructive', title: 'Estimación requerida', description: 'Por favor, genera una estimación de cosecha con IA antes de registrar.'});
        return;
    }
    if (!workPlan) {
        toast({ variant: 'destructive', title: 'Plan de trabajo requerido', description: 'Por favor, genera un plan de trabajo integral con IA antes de registrar.'});
        return;
    }

    setIsSubmitting(true);

    // Extraer actividades del cronograma del plan de trabajo IA
    const planActivities = workPlan.cronograma.phases.flatMap(phase => 
      phase.activities.map(activity => ({
        id: activity.id,
        date: format(addDays(data.plantingDate, activity.day - 1), 'yyyy-MM-dd'),
        description: activity.description,
        metadata: {
          name: activity.name,
          isKeyMilestone: activity.isKeyMilestone,
          category: activity.category,
          daysFromStart: activity.day - 1,
          materials: activity.materials,
          equipment: activity.equipment,
          labor: activity.labor,
          estimatedCost: activity.estimatedCost,
          weatherDependency: activity.weatherDependency,
          criticalActivity: activity.criticalActivity
        }
      }))
    );

    // Actividad inicial de registro
    const initialActivity = {
      id: 'initial',
      date: new Date().toISOString(),
      description: `Registro inicial del cultivo de ${data.name}. Plan de trabajo integral generado con IA.`,
      metadata: {
        name: 'Registro inicial',
        isKeyMilestone: true,
        category: 'preparacion' as const,
        daysFromStart: 0
      }
    };

    const productionData = {
        ...data,
        plantingDate: format(data.plantingDate, 'yyyy-MM-dd'),
        estimatedHarvestDate: estimationResult.estimatedHarvestDate,
        progress: 5, // Initial progress
        status: 'Planeación',
        producerId: user.uid,
        createdAt: new Date().toISOString(),
        // Incluir todas las actividades del plan de trabajo IA
        activities: [initialActivity, ...planActivities],
        // Incluir el plan de trabajo completo
        workPlan: {
          ...workPlan,
          // Remover las imágenes para no sobrecargar Firebase (se pueden guardar por separado)
          generatedImages: workPlan.generatedImages.map(img => ({
            description: img.description,
            phase: img.phase,
            size: img.size,
            // Solo guardar un identificador o URL, no el base64 completo
            imageId: `${user.uid}_${Date.now()}_${img.phase}`
          }))
        },
        // Información adicional del cronograma del plan IA
        estimatedDuration: workPlan.cronograma.totalDays,
        totalActivities: planActivities.length + 1,
        keyMilestones: workPlan.cronograma.keyMilestones.length
    };
    
    const productionsRef = collection(firestore, 'users', user.uid, 'productions');
    await addDocumentNonBlocking(productionsRef, productionData);

    toast({
      title: '¡Producción Registrada!',
      description: `Se ha registrado el cultivo de ${data.name} con plan de trabajo integral incluyendo cronograma y lista de chequeo generados con IA.`,
    });
    setIsSubmitting(false);
    router.push('/productor/produccion');
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Registrar Nueva Producción</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Ingresa los detalles de tu nuevo cultivo o cría para empezar a recibir ofertas.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos esenciales de la producción.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input id="name" placeholder="Ej: Tomate, Lechuga, Pollo..." {...register('name')} />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Producto</Label>
              <Select onValueChange={(value: 'Agrícola' | 'Pecuario') => setValue('type', value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agrícola">Agrícola</SelectItem>
                  <SelectItem value="Pecuario">Pecuario</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-destructive text-sm">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación (Municipio, Departamento)</Label>
              <Input id="location" placeholder="Ej: Villa de Leyva, Boyacá" {...register('location')} />
              {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plantingDate">Fecha de Siembra/Inicio</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-12 text-base">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedFields.plantingDate ? format(watchedFields.plantingDate, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedFields.plantingDate}
                    onSelect={(date) => date && setValue('plantingDate', date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              {errors.plantingDate && <p className="text-destructive text-sm">{errors.plantingDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área (hectáreas) o Cantidad (unidades)</Label>
              <Input id="area" type="number" step="0.1" placeholder="Ej: 2.5" {...register('area')} />
              {errors.area && <p className="text-destructive text-sm">{errors.area.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary"/> Proyecciones con IA
            </CardTitle>
            <CardDescription>
              Usa nuestra inteligencia artificial para estimar la fecha de cosecha. Este paso es obligatorio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleEstimate}
              disabled={isEstimating || !watchedFields.name || !watchedFields.plantingDate || !watchedFields.location}
              className="w-full h-14 text-lg"
            >
              {isEstimating ? (
                <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Estimando...</>
              ) : (
                <><Wand2 className="mr-2 h-6 w-6" /> Estimar Cosecha con IA</>
              )}
            </Button>
            {estimationResult && (
              <div className="space-y-6">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle className="text-primary"/> ¡Estimación de Cosecha Lista!
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Fecha de Cosecha Estimada:</strong></p>
                      <p className="text-lg font-semibold text-primary">
                        {format(new Date(estimationResult.estimatedHarvestDate), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                      </p>
                    </div>
                    {estimationResult.optimalHarvestWindow && (
                      <div>
                        <p><strong>Ventana Óptima de Cosecha:</strong></p>
                        <p className="text-sm">
                          {format(new Date(estimationResult.optimalHarvestWindow.startDate), 'dd/MM', { locale: es })} - {format(new Date(estimationResult.optimalHarvestWindow.endDate), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                    )}
                  </div>
                  <p><strong>Nivel de Confianza:</strong> {estimationResult.confidenceLevel}</p>
                </div>

                {estimationResult.marketAnalysis && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                    <h4 className="font-semibold text-green-800">Análisis de Mercado</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Precios Actuales:</strong></p>
                        <p className="text-green-700">{estimationResult.marketAnalysis.currentPrices}</p>
                      </div>
                      <div>
                        <p><strong>Proyección de Precios:</strong></p>
                        <p className="text-green-700">{estimationResult.marketAnalysis.priceProjection}</p>
                      </div>
                      <div>
                        <p><strong>Demanda Proyectada:</strong></p>
                        <p className="text-green-700">{estimationResult.marketAnalysis.demandForecast}</p>
                      </div>
                      <div>
                        <p><strong>Estrategia Recomendada:</strong></p>
                        <p className="text-green-700">{estimationResult.marketAnalysis.recommendedStrategy}</p>
                      </div>
                    </div>
                  </div>
                )}

                {estimationResult.qualityFactors && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <h4 className="font-semibold text-blue-800">Factores de Calidad</h4>
                    <div className="text-sm space-y-2">
                      <div>
                        <p><strong>Madurez Óptima:</strong></p>
                        <p className="text-blue-700">{estimationResult.qualityFactors.optimalRipeness}</p>
                      </div>
                      <div>
                        <p><strong>Almacenamiento:</strong></p>
                        <p className="text-blue-700">{estimationResult.qualityFactors.storageRecommendations}</p>
                      </div>
                    </div>
                  </div>
                )}

                {estimationResult.riskFactors && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                    <h4 className="font-semibold text-yellow-800">Análisis de Riesgos</h4>
                    <div className="text-sm space-y-2">
                      <div>
                        <p><strong>Riesgos Climáticos:</strong></p>
                        <p className="text-yellow-700">{estimationResult.riskFactors.weatherRisks}</p>
                      </div>
                      <div>
                        <p><strong>Estrategias de Mitigación:</strong></p>
                        <p className="text-yellow-700">{estimationResult.riskFactors.mitigationStrategies}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <strong>Justificación del Análisis:</strong>
                  <p className="text-sm text-muted-foreground mt-1 bg-gray-50 p-3 rounded">
                    {estimationResult.reasoning}
                  </p>
                </div>

                {estimationResult.generatedImages && estimationResult.generatedImages.length > 0 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-3">Visualización del Proceso</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {estimationResult.generatedImages.map((img, index) => (
                        <div key={index} className="text-center">
                          <div className="bg-gray-200 rounded-lg p-8 mb-2">
                            <p className="text-sm text-gray-600">Imagen: {img.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Fase: {img.phase}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview del Plan de Trabajo Integral */}
        {watchedFields.name && (
          <Card className="shadow-lg border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-green-600" />
                Plan de Trabajo Integral con IA
              </CardTitle>
              <CardDescription>
                El Plan de Trabajo Integral incluye metodología 5M, cronograma detallado, lista de chequeo,
                análisis de mercado y rentabilidad para {watchedFields.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workPlan ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="font-bold text-2xl text-green-600">{workPlan.cronograma.totalDays}</div>
                      <div className="text-sm text-green-800">Días del cronograma</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-green-600">
                        {workPlan.cronograma.phases.reduce((total, phase) => total + phase.activities.length, 0)}
                      </div>
                      <div className="text-sm text-green-800">Actividades</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-green-600">{workPlan.listaChequeo.totalItems}</div>
                      <div className="text-sm text-green-800">Items de chequeo</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-green-600">{workPlan.cronograma.keyMilestones.length}</div>
                      <div className="text-sm text-green-800">Hitos clave</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-green-800">Fases del cronograma incluidas:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {workPlan.cronograma.phases.map((phase, index) => (
                        <div key={index} className="p-3 bg-white border border-green-200 rounded">
                          <div className="font-medium capitalize">{phase.name}</div>
                          <div className="text-sm text-gray-600">
                            {phase.activities.length} actividades • {phase.duration} días
                          </div>
                          <div className="text-xs text-green-600 mt-1 capitalize">
                            Categoría: {phase.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Incluye también:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                      <div>• Metodología 5M completa</div>
                      <div>• Análisis de mercado y precios</div>
                      <div>• Análisis de rentabilidad detallado</div>
                      <div>• Recomendaciones agroindustriales</div>
                      <div>• Lista de chequeo por categorías</div>
                      <div>• Cronograma con fechas específicas</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <strong>� El Plan de Trabajo Integral incluirá:</strong>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• <strong>Metodología 5M:</strong> Mano de obra, Maquinaria, Materiales, Métodos, Medio ambiente</li>
                        <li>• <strong>Cronograma detallado:</strong> Actividades específicas por días con recursos necesarios</li>
                        <li>• <strong>Lista de chequeo:</strong> Items categorizados por fase productiva</li>
                        <li>• <strong>Análisis de mercado:</strong> Precios, demanda y estrategias de comercialización</li>
                        <li>• <strong>Análisis de rentabilidad:</strong> Costos, ingresos, ROI y punto de equilibrio</li>
                        <li>• <strong>Recomendaciones agroindustriales:</strong> Valor agregado y nuevos mercados</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      onClick={handleGenerateWorkPlan}
                      disabled={isGeneratingPlan || !watchedFields.name || !watchedFields.plantingDate || !watchedFields.location || !watchedFields.area}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isGeneratingPlan ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando Plan Integral...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generar Plan de Trabajo Integral con IA
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mostrar el plan de trabajo si está disponible */}
        {showPlan && workPlan && (
          <div className="mt-8">
            <WorkPlanDisplay 
              workPlan={workPlan}
              onSave={() => {
                toast({
                  title: "Plan guardado",
                  description: "El plan de trabajo se ha guardado con la producción",
                });
              }}
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="h-16 text-xl min-w-[200px]" disabled={isSubmitting || !estimationResult}>
            {isSubmitting ? (
              <><Loader2 className="animate-spin mr-2" /> Creando...</>
            ) : (
              <>
                <ListChecks className="mr-2 h-6 w-6" />
                Crear Producción con Cronograma
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
