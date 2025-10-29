'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Tractor, Sprout, CheckCircle, PlusCircle, Check, X, MessageCircle, Loader2, Eye, ListOrdered, Inbox, BookOpen, Users, Wrench, Package, Leaf, BarChart3, Target, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, arrayUnion } from 'firebase/firestore';
import type { Production, Offer, User } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { WorkPlanDisplay } from '@/components/work-plan-display';
import { Checkbox } from '@/components/ui/checkbox';

const statusStyles = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    aceptada: 'bg-green-100 text-green-800 border-green-300',
    rechazada: 'bg-red-100 text-red-800 border-red-300',
    negociación: 'bg-blue-100 text-blue-800 border-blue-300',
};


export default function ProducerProductDetailPage() {
  const params = useParams();
  const productionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toast } = useToast();

  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const firestore = useFirestore();
  const { user } = useUser();

  const productionDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !productionId) return null;
    return doc(firestore, `users/${user.uid}/productions/${productionId}`);
  }, [firestore, user?.uid, productionId]);

  const { data: production, isLoading: isProductionLoading } = useDoc<Production>(productionDocRef);

  const offersQuery = useMemoFirebase(() => {
    if (!firestore || !productionId) return null;
    return query(collection(firestore, 'offers'), where('productId', '==', productionId));
  }, [firestore, productionId]);

  const { data: offers, isLoading: areOffersLoading } = useCollection<Offer & { buyerName: string }>(offersQuery);
  
  const findImage = (url: string | undefined) => PlaceHolderImages.find(img => img.imageUrl === url);
  const productImage = findImage(production?.productImage);

  if (isProductionLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!production) {
    return notFound();
  }
  
  const handleOfferStatusChange = (offerId: string, status: 'aceptada' | 'rechazada') => {
    if (!firestore) return;
    const offerRef = doc(firestore, 'offers', offerId);
    updateDocumentNonBlocking(offerRef, { status });
    toast({
        title: `Oferta ${status}`,
        description: `La oferta ha sido marcada como ${status}.`,
    });
  }

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityDescription.trim() || !productionDocRef) return;

    setIsAddingActivity(true);

    const newActivity = {
        date: new Date().toISOString(),
        description: newActivityDescription,
    };

    await updateDocumentNonBlocking(productionDocRef, {
        activities: arrayUnion(newActivity)
    });

    toast({
        title: "Actividad Añadida",
        description: "El nuevo evento de trazabilidad ha sido registrado."
    })
    setNewActivityDescription('');
    setIsAddingActivity(false);
  }

  const handleTaskToggle = (phaseId: string, taskId: string, completed: boolean) => {
    const key = `${phaseId}-${taskId}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: completed
    }));
    
    toast({
      title: completed ? "Tarea completada" : "Tarea pendiente",
      description: completed ? "La tarea ha sido marcada como completada." : "La tarea ha sido marcada como pendiente.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCurrentPhase = () => {
    if (!production.workPlan?.phases) return null;
    
    const now = new Date();
    const plantingDate = new Date(production.plantingDate);
    const daysSinceStart = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let cumulativeDays = 0;
    for (const phase of production.workPlan.phases) {
      if (daysSinceStart <= cumulativeDays + phase.duration) {
        return phase;
      }
      cumulativeDays += phase.duration;
    }
    return production.workPlan.phases[production.workPlan.phases.length - 1];
  };

  const currentPhase = getCurrentPhase();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header del Producto */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl">
        {productImage && (
          <Image
            src={productImage.imageUrl}
            alt={production.name}
            fill
            className="object-cover"
            data-ai-hint={productImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-5xl font-bold text-white">{production.name}</h1>
          <p className="text-xl text-white/90 mt-2">{production.type}</p>
          {currentPhase && (
            <Badge className="mt-4 bg-green-600 text-white">
              <Sprout className="w-4 h-4 mr-2" />
              Fase actual: {currentPhase.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="planificacion">Planificación</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
          <TabsTrigger value="chequeo">Lista Chequeo</TabsTrigger>
          <TabsTrigger value="ofertas">Ofertas</TabsTrigger>
          <TabsTrigger value="trazabilidad">Trazabilidad</TabsTrigger>
        </TabsList>

        {/* Tab Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Target className="h-6 w-6" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-primary"/>
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-bold">{production.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-primary"/>
                  <div>
                    <p className="text-sm text-muted-foreground">Cosecha Estimada</p>
                    <p className="font-bold">{new Date(production.estimatedHarvestDate).toLocaleDateString('es-CO', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-primary"/>
                  <div>
                    <p className="text-sm text-muted-foreground">Área</p>
                    <p className="font-bold">{production.area} hectáreas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-primary"/>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge variant="secondary">{production.status}</Badge>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className='flex justify-between items-center mb-2'>
                    <p className="text-lg font-medium text-muted-foreground">Progreso de la Cosecha</p>
                    <p className="text-lg font-bold text-primary">{production.progress}%</p>
                  </div>
                  <Progress value={production.progress} aria-label={`${production.progress}% completado`} />
                </div>
                {production.workPlan && (
                  <div className="sm:col-span-2 grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Inversión Total</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(production.workPlan.totalInvestment)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rentabilidad Esperada</p>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(production.workPlan.profitabilityAnalysis?.netProfit || 0)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Métricas Rápidas */}
              {production.workPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Métricas Clave</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">ROI Esperado</span>
                      <span className="font-bold text-green-600">
                        {(production.workPlan.profitabilityAnalysis?.roi || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Margen de Ganancia</span>
                      <span className="font-bold">
                        {(production.workPlan.profitabilityAnalysis?.profitMargin || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duración Total</span>
                      <span className="font-bold">{production.workPlan.totalDuration} días</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fases del Proyecto</span>
                      <span className="font-bold">{production.workPlan.phases?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fase Actual */}
              {currentPhase && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Sprout className="h-5 w-5" />
                      Fase Actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-bold text-lg mb-2">{currentPhase.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Duración: {currentPhase.duration} días
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Costo estimado: {formatCurrency(currentPhase.estimatedCost)}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Actividades principales:</p>
                      {currentPhase.activities?.slice(0, 3).map((activity, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {activity.name}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab Planificación - Plan de Trabajo Completo */}
        <TabsContent value="planificacion">
          {production.workPlan ? (
            <WorkPlanDisplay workPlan={production.workPlan} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay plan de trabajo disponible</h3>
                <p className="text-muted-foreground mb-6">
                  Este producto no tiene un plan de trabajo comprehensive generado.
                </p>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Generar Plan de Trabajo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Cronograma */}
        <TabsContent value="cronograma" className="space-y-6">
          {production.activities && production.activities.length > 1 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Calendar className="h-6 w-6" />
                    Cronograma del Cultivo de {production.name}
                  </CardTitle>
                  <CardDescription>
                    Timeline detallado de todas las actividades específicas para este cultivo
                  </CardDescription>
                  {production.totalActivities && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                      <div className="text-center">
                        <div className="font-bold text-2xl text-blue-600">{production.totalActivities}</div>
                        <div className="text-sm text-blue-800">Actividades</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-green-600">{production.keyMilestones || 0}</div>
                        <div className="text-sm text-green-800">Hitos clave</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-orange-600">{production.estimatedDuration || 0}</div>
                        <div className="text-sm text-orange-800">Días totales</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-purple-600">{production.progress}%</div>
                        <div className="text-sm text-purple-800">Progreso</div>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {production.activities.map((activity, index) => {
                      if (index === 0) return null; // Skip initial activity
                      
                      const isKeyMilestone = activity.metadata?.isKeyMilestone;
                      const category = activity.metadata?.category;
                      const dayFromStart = activity.metadata?.daysFromStart;
                      const plantingDate = new Date(production.plantingDate);
                      const activityDate = activity.metadata?.daysFromStart ? 
                        new Date(plantingDate.getTime() + (activity.metadata.daysFromStart * 24 * 60 * 60 * 1000)) :
                        new Date(activity.date);
                      
                      const categoryColors = {
                        preparacion: 'border-blue-500 bg-blue-50',
                        siembra: 'border-green-500 bg-green-50',
                        cuidado: 'border-yellow-500 bg-yellow-50',
                        cosecha: 'border-orange-500 bg-orange-50',
                        postcosecha: 'border-purple-500 bg-purple-50'
                      };
                      
                      const categoryIcons = {
                        preparacion: '🔧',
                        siembra: '🌱',
                        cuidado: '🌿',
                        cosecha: '🌾',
                        postcosecha: '📦'
                      };

                      return (
                        <div 
                          key={index} 
                          className={cn(
                            "relative border-l-4 ml-4 pl-8 pb-8",
                            isKeyMilestone ? "border-red-500" : "border-gray-300"
                          )}
                        >
                          <div className={cn(
                            "absolute -left-3 top-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                            isKeyMilestone ? "bg-red-500 text-white" : "bg-gray-300 text-gray-700"
                          )}>
                            {dayFromStart !== undefined ? dayFromStart : index}
                          </div>
                          
                          <Card className={cn(
                            "transition-all duration-200",
                            category ? categoryColors[category as keyof typeof categoryColors] : '',
                            isKeyMilestone ? "ring-2 ring-red-300 shadow-lg" : "shadow-sm"
                          )}>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className={cn(
                                    "text-lg flex items-center gap-2",
                                    isKeyMilestone ? "text-red-700" : ""
                                  )}>
                                    {category && categoryIcons[category as keyof typeof categoryIcons]} 
                                    {activity.metadata?.name || activity.description}
                                    {isKeyMilestone && (
                                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded ml-2">Hito Clave</span>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {format(activityDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                                  </CardDescription>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">Día</div>
                                  <div className="font-bold text-lg">{dayFromStart || 0}</div>
                                  {activity.metadata?.duration && (
                                    <>
                                      <div className="text-sm text-muted-foreground mt-1">Duración</div>
                                      <div className="font-bold">{activity.metadata.duration} días</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-sm mb-3">
                                {activity.description.replace(`${activity.metadata?.name}: `, '')}
                              </p>
                              
                              {(activity.metadata?.materials?.length || activity.metadata?.equipment?.length || activity.metadata?.laborRequired?.length) && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {activity.metadata?.materials && activity.metadata.materials.length > 0 && (
                                    <div className="p-2 bg-white bg-opacity-50 rounded">
                                      <div className="font-medium text-xs text-gray-600 mb-1">📦 Materiales</div>
                                      <div className="text-sm">
                                        {activity.metadata.materials.join(', ')}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {activity.metadata?.equipment && activity.metadata.equipment.length > 0 && (
                                    <div className="p-2 bg-white bg-opacity-50 rounded">
                                      <div className="font-medium text-xs text-gray-600 mb-1">🔧 Equipos</div>
                                      <div className="text-sm">
                                        {activity.metadata.equipment.join(', ')}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {activity.metadata?.laborRequired && activity.metadata.laborRequired.length > 0 && (
                                    <div className="p-2 bg-white bg-opacity-50 rounded">
                                      <div className="font-medium text-xs text-gray-600 mb-1">👥 Mano de obra</div>
                                      <div className="text-sm">
                                        {activity.metadata.laborRequired.join(', ')}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay cronograma disponible</h3>
                <p className="text-muted-foreground">
                  Este producto fue creado antes del sistema de cronograma automático. 
                  Las nuevas producciones incluyen cronogramas completos con actividades específicas del cultivo.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Lista de Chequeo */}
        <TabsContent value="chequeo" className="space-y-6">
          {production.activities && production.activities.length > 1 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <ClipboardList className="h-6 w-6" />
                    Lista de Chequeo del Cronograma
                  </CardTitle>
                  <CardDescription>
                    Actividades específicas para el cultivo de {production.name}. Marque las tareas completadas para realizar seguimiento del progreso.
                  </CardDescription>
                  {production.totalActivities && (
                    <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="font-bold text-2xl text-blue-600">{production.totalActivities}</div>
                        <div className="text-sm text-blue-800">Actividades totales</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-green-600">{production.keyMilestones || 0}</div>
                        <div className="text-sm text-green-800">Hitos clave</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-orange-600">{production.estimatedDuration || 0}</div>
                        <div className="text-sm text-orange-800">Días estimados</div>
                      </div>
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Agrupar actividades por categoría */}
              {['preparacion', 'siembra', 'cuidado', 'cosecha', 'postcosecha'].map(category => {
                const categoryActivities = production.activities?.filter(activity => 
                  activity.metadata?.category === category
                ) || [];
                
                if (categoryActivities.length === 0) return null;
                
                const completedInCategory = categoryActivities.filter((_, index) => 
                  completedTasks[`${category}-${index}`]
                ).length;
                const categoryProgress = categoryActivities.length > 0 ? (completedInCategory / categoryActivities.length) * 100 : 0;
                
                const categoryLabels = {
                  preparacion: { name: 'Preparación', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  siembra: { name: 'Siembra', color: 'text-green-700 bg-green-50 border-green-200' },
                  cuidado: { name: 'Cuidado y Manejo', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
                  cosecha: { name: 'Cosecha', color: 'text-orange-700 bg-orange-50 border-orange-200' },
                  postcosecha: { name: 'Postcosecha', color: 'text-purple-700 bg-purple-50 border-purple-200' }
                };
                
                return (
                  <Card key={category} className={`border-2 ${categoryLabels[category as keyof typeof categoryLabels].color}`}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${category === 'preparacion' ? 'bg-blue-500' : 
                                                                    category === 'siembra' ? 'bg-green-500' :
                                                                    category === 'cuidado' ? 'bg-yellow-500' :
                                                                    category === 'cosecha' ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
                          {categoryLabels[category as keyof typeof categoryLabels].name}
                        </CardTitle>
                        <Badge variant={categoryProgress === 100 ? "default" : "secondary"}>
                          {completedInCategory}/{categoryActivities.length} completadas
                        </Badge>
                      </div>
                      <Progress value={categoryProgress} className="mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryActivities.map((activity, activityIndex) => {
                          const taskKey = `${category}-${activityIndex}`;
                          const isCompleted = completedTasks[taskKey] || false;
                          const isKeyMilestone = activity.metadata?.isKeyMilestone;
                          
                          return (
                            <div key={activityIndex} className={`flex items-start space-x-3 p-3 border rounded-lg ${
                              isKeyMilestone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}>
                              <Checkbox
                                id={taskKey}
                                checked={isCompleted}
                                onCheckedChange={(checked) => handleTaskToggle(category, activityIndex.toString(), checked as boolean)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <label 
                                  htmlFor={taskKey} 
                                  className={cn(
                                    "font-medium cursor-pointer flex items-center gap-2",
                                    isCompleted ? "line-through text-muted-foreground" : ""
                                  )}
                                >
                                  {activity.metadata?.name || activity.description}
                                  {isKeyMilestone && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Hito Clave</span>
                                  )}
                                </label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {activity.description.replace(`${activity.metadata?.name}: `, '')}
                                </p>
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>📅 Día {activity.metadata?.daysFromStart}</span>
                                  <span>⏱️ {activity.metadata?.duration} días</span>
                                  {activity.metadata?.materials && activity.metadata.materials.length > 0 && (
                                    <span>📦 {activity.metadata.materials.join(', ')}</span>
                                  )}
                                  {activity.metadata?.equipment && activity.metadata.equipment.length > 0 && (
                                    <span>🔧 {activity.metadata.equipment.join(', ')}</span>
                                  )}
                                  {activity.metadata?.laborRequired && activity.metadata.laborRequired.length > 0 && (
                                    <span>👥 {activity.metadata.laborRequired.join(', ')}</span>
                                  )}
                                </div>
                              </div>
                              {isCompleted && (
                                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay cronograma disponible</h3>
                <p className="text-muted-foreground">
                  Este producto fue creado antes del sistema de cronograma automático. 
                  Las nuevas producciones incluyen un cronograma completo con actividades específicas del cultivo.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Ofertas */}
        <TabsContent value="ofertas">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Inbox className="h-6 w-6" />
                Ofertas Recibidas
              </CardTitle>
              <CardDescription>Gestiona las ofertas de los compradores para este producto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {areOffersLoading && <Loader2 className="animate-spin" />}
              {offers && offers.length > 0 ? offers.map(offer => (
                <Card key={offer.id} className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <p className="font-bold">{offer.buyerName || 'Comprador Anónimo'}</p>
                      <p className="text-sm text-muted-foreground">{offer.amount} kg a {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(offer.pricePerUnit)}/kg</p>
                      <p className="text-lg font-bold text-primary">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(offer.amount * offer.pricePerUnit)}</p>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <Badge className={cn("text-sm capitalize", statusStyles[offer.status])}>
                        {offer.status}
                      </Badge>
                      {offer.status === 'pendiente' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleOfferStatusChange(offer.id, 'aceptada')}>
                            <Check className="mr-2 h-4 w-4"/>Aceptar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleOfferStatusChange(offer.id, 'rechazada')}>
                            <X className="mr-2 h-4 w-4"/>Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )) : (
                <p className="text-muted-foreground text-center py-4">No hay ofertas para este producto todavía.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Trazabilidad */}
        <TabsContent value="trazabilidad">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <ListOrdered className="h-6 w-6"/>
                  Añadir Actividad
                </CardTitle>
                <CardDescription>Registra nuevos eventos en la línea de tiempo de este producto.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddActivity}>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                        <Label htmlFor="activity-description">Descripción de la Actividad</Label>
                        <Textarea 
                            id="activity-description" 
                            placeholder="Ej: Aplicación de fertilizante orgánico."
                            value={newActivityDescription}
                            onChange={(e) => setNewActivityDescription(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                     <Button type="submit" className="w-full h-12 text-lg" disabled={isAddingActivity || !newActivityDescription.trim()}>
                        {isAddingActivity ? <Loader2 className="animate-spin" /> : <><PlusCircle className="mr-3 h-6 w-6"/>Añadir Actividad</>}
                    </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Historial de Actividades</CardTitle>
                <CardDescription>Línea de tiempo completa del producto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-primary ml-4 pl-8 space-y-8 py-4 max-h-96 overflow-y-auto">
                  <div className="absolute -left-4 top-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-primary-foreground"/>
                  </div>
                  {production.activities && production.activities.length > 0 ? production.activities.map((activity, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[2.1rem] top-1.5 h-4 w-4 bg-background border-2 border-primary rounded-full" />
                      <p className="font-bold text-primary text-sm">{format(new Date(activity.date), "d MMM yyyy, h:mm a", {locale: es})}</p>
                      <h3 className="text-base font-semibold mt-1">{activity.description}</h3>
                    </div>
                  )).reverse() : <p className="text-sm text-muted-foreground">No hay actividades registradas.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
