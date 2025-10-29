'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Wrench, 
  Package, 
  BookOpen, 
  Leaf, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Target,
  Factory,
  BarChart3,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { ComprehensiveWorkPlanOutput } from '@/ai/flows/comprehensive-work-plan';

interface WorkPlanDisplayProps {
  workPlan: ComprehensiveWorkPlanOutput;
  onSave?: () => void;
  onDownload?: () => void;
}

export function WorkPlanDisplay({ workPlan, onSave, onDownload }: WorkPlanDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header del Plan */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{workPlan.projectName}</h1>
            <div className="flex flex-wrap gap-4 text-green-100">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                <span>{workPlan.cropType}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{workPlan.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{workPlan.area} hectáreas</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{workPlan.totalDuration} días</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">Inversión Total</div>
            <div className="text-2xl font-bold">{formatCurrency(workPlan.totalInvestment)}</div>
            <Badge variant="secondary" className="mt-2">
              Confianza: {formatPercentage(workPlan.confidenceLevel * 100)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs Principales */}
      <Tabs defaultValue="5m" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="5m">Metodología 5M</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
          <TabsTrigger value="checklist">Lista Chequeo</TabsTrigger>
          <TabsTrigger value="mercado">Mercado</TabsTrigger>
          <TabsTrigger value="rentabilidad">Rentabilidad</TabsTrigger>
          <TabsTrigger value="agroindustria">Agroindustria</TabsTrigger>
          <TabsTrigger value="imagenes">Imágenes IA</TabsTrigger>
        </TabsList>

        {/* Metodología 5M */}
        <TabsContent value="5m" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mano de Obra */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Mano de Obra
                </CardTitle>
                <CardDescription>{workPlan.mano_de_obra.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Costo Total</div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatCurrency(workPlan.mano_de_obra.costs)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Requerimientos:</h4>
                  <ul className="space-y-1 text-sm">
                    {workPlan.mano_de_obra.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recomendaciones:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {workPlan.mano_de_obra.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Maquinaria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-600" />
                  Maquinaria
                </CardTitle>
                <CardDescription>{workPlan.maquinaria.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">Costo Total</div>
                  <div className="text-xl font-bold text-orange-900">
                    {formatCurrency(workPlan.maquinaria.costs)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Equipos Necesarios:</h4>
                  <ul className="space-y-1 text-sm">
                    {workPlan.maquinaria.equipment.map((eq, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {eq}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recomendaciones:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {workPlan.maquinaria.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Materiales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Materiales
                </CardTitle>
                <CardDescription>{workPlan.materiales.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">Costo Total</div>
                  <div className="text-xl font-bold text-purple-900">
                    {formatCurrency(workPlan.materiales.costs)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Insumos Requeridos:</h4>
                  <ul className="space-y-1 text-sm">
                    {workPlan.materiales.inputs.map((input, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {input}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recomendaciones:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {workPlan.materiales.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Métodos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Métodos
                </CardTitle>
                <CardDescription>{workPlan.metodos.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Técnicas:</h4>
                  <ul className="space-y-1 text-sm">
                    {workPlan.metodos.techniques.map((tech, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Procedimientos:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {workPlan.metodos.procedures.slice(0, 4).map((proc, idx) => (
                      <li key={idx}>• {proc}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Medio Ambiente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Medio Ambiente
                </CardTitle>
                <CardDescription>{workPlan.medio_ambiente.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Condiciones Ideales:</h4>
                  <ul className="space-y-1 text-sm">
                    {workPlan.medio_ambiente.conditions.slice(0, 3).map((cond, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Riesgos:
                  </h4>
                  <ul className="space-y-1 text-sm text-amber-700">
                    {workPlan.medio_ambiente.risks.slice(0, 3).map((risk, idx) => (
                      <li key={idx}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cronograma Detallado */}
        <TabsContent value="cronograma" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumen del Cronograma */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Resumen del Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Duración Total:</span>
                  <Badge variant="outline">{workPlan.cronograma.totalDays} días</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Fases:</span>
                  <Badge variant="outline">{workPlan.cronograma.phases.length} fases</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Actividades:</span>
                  <Badge variant="outline">
                    {workPlan.cronograma.phases.reduce((total, phase) => total + phase.activities.length, 0)} actividades
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hitos Clave:</span>
                  <Badge variant="outline">{workPlan.cronograma.keyMilestones.length} hitos</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Hitos Importantes:</h4>
                  {workPlan.cronograma.keyMilestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Día {milestone.day}:</span>
                      <span className="font-medium">{milestone.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cronograma por Fases */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cronograma Detallado por Fases</CardTitle>
                <CardDescription>
                  Actividades organizadas por categoría y tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {workPlan.cronograma.phases.map((phase, phaseIdx) => (
                    <div key={phaseIdx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            phase.category === 'preparacion' ? 'bg-blue-500' :
                            phase.category === 'siembra' ? 'bg-green-500' :
                            phase.category === 'mantenimiento' ? 'bg-yellow-500' :
                            phase.category === 'cosecha' ? 'bg-orange-500' :
                            'bg-purple-500'
                          }`} />
                          <h4 className="font-semibold text-lg capitalize">{phase.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Días {phase.startDay} - {phase.startDay + phase.duration - 1}
                          </div>
                          <Badge variant="outline">{phase.duration} días</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{phase.description}</p>
                      
                      <div className="space-y-3">
                        {phase.activities.map((activity, actIdx) => (
                          <div key={actIdx} className={`border rounded p-3 ${
                            activity.criticalActivity ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {activity.isKeyMilestone && (
                                  <Target className="w-4 h-4 text-orange-500" />
                                )}
                                {activity.criticalActivity && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="font-medium">{activity.name}</span>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-gray-600">Día {activity.day}</div>
                                <div className="font-medium text-green-600">
                                  {formatCurrency(activity.estimatedCost)}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              {activity.materials.length > 0 && (
                                <div>
                                  <span className="font-medium text-blue-700">Materiales:</span>
                                  <div className="text-gray-600">
                                    {activity.materials.join(', ')}
                                  </div>
                                </div>
                              )}
                              {activity.equipment.length > 0 && (
                                <div>
                                  <span className="font-medium text-green-700">Equipos:</span>
                                  <div className="text-gray-600">
                                    {activity.equipment.join(', ')}
                                  </div>
                                </div>
                              )}
                              {activity.labor.length > 0 && (
                                <div>
                                  <span className="font-medium text-purple-700">Personal:</span>
                                  <div className="text-gray-600">
                                    {activity.labor.join(', ')}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {activity.weatherDependency && (
                              <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Dependiente del clima
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lista de Chequeo */}
        <TabsContent value="checklist" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Resumen de la Lista */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Resumen Lista Chequeo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {workPlan.listaChequeo.totalItems}
                  </div>
                  <div className="text-sm text-gray-600">Items Totales</div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  {Object.entries(workPlan.listaChequeo.itemsPorCategoria).map(([categoria, count]) => (
                    <div key={categoria} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {categoria.replace('_', ' ')}:
                      </span>
                      <Badge variant="outline">{count} items</Badge>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Códigos de Prioridad:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>Alta prioridad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span>Media prioridad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Baja prioridad</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Chequeo por Categorías */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Lista de Chequeo Detallada</CardTitle>
                <CardDescription>
                  Tareas organizadas por fase del proceso productivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preparacion" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="preparacion">Preparación</TabsTrigger>
                    <TabsTrigger value="siembra">Siembra</TabsTrigger>
                    <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
                    <TabsTrigger value="cosecha">Cosecha</TabsTrigger>
                    <TabsTrigger value="postcosecha">Postcosecha</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(workPlan.listaChequeo.categorias).map(([categoria, datos]) => (
                    <TabsContent key={categoria} value={categoria} className="space-y-4">
                      <div className="mb-4">
                        <h4 className="font-semibold text-lg">{datos.nombre}</h4>
                        <p className="text-gray-600 text-sm">{datos.descripcion}</p>
                      </div>
                      
                      <div className="space-y-4">
                        {datos.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-3 h-3 rounded-full mt-1 ${
                                  item.prioridad === 'alta' ? 'bg-red-500' :
                                  item.prioridad === 'media' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`} />
                                <div>
                                  <h5 className="font-medium">{item.tarea}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-gray-600">Día {item.dia}</div>
                                <Badge variant="outline" className="mt-1">
                                  {item.tiempo_estimado}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-blue-700">Recursos Necesarios:</span>
                                <ul className="text-gray-600 text-xs mt-1">
                                  {item.recursos_necesarios.map((recurso, rIdx) => (
                                    <li key={rIdx} className="flex items-center gap-1">
                                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                      {recurso}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <span className="font-medium text-green-700">Criterios de Calidad:</span>
                                <ul className="text-gray-600 text-xs mt-1">
                                  {item.criterios_calidad.map((criterio, cIdx) => (
                                    <li key={cIdx} className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                      {criterio}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            {item.observaciones && (
                              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                <span className="font-medium text-yellow-800">Observaciones:</span>
                                <span className="text-yellow-700 ml-2">{item.observaciones}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análisis de Mercado */}
        <TabsContent value="mercado" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análisis de Mercado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-sm text-green-600">Precio Actual</div>
                    <div className="text-xl font-bold text-green-800">
                      {formatCurrency(workPlan.marketAnalysis.currentPrice)}
                    </div>
                    <div className="text-xs text-green-600">por kg</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-sm text-blue-600">Demanda</div>
                    <div className="text-xl font-bold text-blue-800">
                      {workPlan.marketAnalysis.demand}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Mejores Mercados:</h4>
                  <ul className="space-y-1">
                    {workPlan.marketAnalysis.bestMarkets.map((market, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {market}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recomendaciones de Marketing:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {workPlan.marketAnalysis.marketingRecommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencias Estacionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {workPlan.marketAnalysis.seasonalTrends}
                </p>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Competencia: 
                    <Badge variant="outline" className="ml-2">
                      {workPlan.marketAnalysis.competition}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análisis de Rentabilidad */}
        <TabsContent value="rentabilidad" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Inversión y Gastos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Inversión Total:</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(workPlan.profitabilityAnalysis.totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Gastos Totales:</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(workPlan.profitabilityAnalysis.totalExpenses)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Costos:</span>
                    <span className="font-bold text-red-700">
                      {formatCurrency(workPlan.profitabilityAnalysis.totalInvestment + workPlan.profitabilityAnalysis.totalExpenses)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Ingresos y Utilidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Ingresos Estimados:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(workPlan.profitabilityAnalysis.estimatedRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Utilidad Bruta:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(workPlan.profitabilityAnalysis.grossProfit)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Utilidad Neta:</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(workPlan.profitabilityAnalysis.netProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Indicadores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Margen de Utilidad:</span>
                    <span className="font-semibold text-blue-600">
                      {formatPercentage(workPlan.profitabilityAnalysis.profitMargin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ROI:</span>
                    <span className="font-semibold text-blue-600">
                      {formatPercentage(workPlan.profitabilityAnalysis.roi)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Punto de Equilibrio:</span>
                    <span className="font-semibold text-orange-600">
                      {workPlan.profitabilityAnalysis.breakEvenPoint.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recuperación:</span>
                    <span className="font-semibold text-purple-600">
                      {workPlan.profitabilityAnalysis.paybackPeriod} meses
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de rentabilidad */}
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Rentabilidad Visual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Costos vs Ingresos</span>
                    <span>{formatPercentage((workPlan.profitabilityAnalysis.netProfit / workPlan.profitabilityAnalysis.estimatedRevenue) * 100)}</span>
                  </div>
                  <Progress 
                    value={(workPlan.profitabilityAnalysis.netProfit / workPlan.profitabilityAnalysis.estimatedRevenue) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-600">Total Invertido</div>
                    <div className="text-xl font-bold text-red-800">
                      {formatCurrency(workPlan.profitabilityAnalysis.totalInvestment)}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">Ganancia Neta</div>
                    <div className="text-xl font-bold text-green-800">
                      {formatCurrency(workPlan.profitabilityAnalysis.netProfit)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agroindustrialización */}
        <TabsContent value="agroindustria" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                Oportunidades de Agroindustrialización
              </CardTitle>
              <CardDescription>
                Procesos de valor agregado para aumentar rentabilidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Beneficios del Procesamiento</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Incremento de Valor:</span>
                      <span className="font-semibold text-blue-700">
                        +{formatPercentage(workPlan.agroindustrialProcessing.valueAddition)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Vida Útil:</span>
                      <span className="font-semibold text-blue-700">
                        {workPlan.agroindustrialProcessing.shelfLife}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Inversión Requerida:</span>
                      <span className="font-semibold text-blue-700">
                        {formatCurrency(workPlan.agroindustrialProcessing.requiredInvestment)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Nuevos Mercados:</h4>
                  <ul className="space-y-1">
                    {workPlan.agroindustrialProcessing.newMarkets.map((market, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {market}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Procesos Recomendados:</h4>
                {workPlan.agroindustrialProcessing.processes.map((process, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold">{process.name}</h5>
                      <div className="text-right">
                        <div className="text-sm text-green-600">
                          +{formatPercentage(process.valueIncrease)} valor
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(process.investmentRequired)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{process.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Equipos necesarios:</strong>
                        <ul className="mt-1 space-y-1">
                          {process.equipment.map((eq, eqIdx) => (
                            <li key={eqIdx} className="text-gray-600">• {eq}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Proceso:</strong>
                        <ol className="mt-1 space-y-1">
                          {process.process.map((step, stepIdx) => (
                            <li key={stepIdx} className="text-gray-600">{stepIdx + 1}. {step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <strong className="text-sm">Producto final:</strong> {process.output}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Estándares de Calidad Recomendados:</h4>
                <div className="flex flex-wrap gap-2">
                  {workPlan.agroindustrialProcessing.qualityStandards.map((standard, idx) => (
                    <Badge key={idx} variant="outline">{standard}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imágenes Generadas por IA */}
        <TabsContent value="imagenes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imágenes Ilustrativas del Proceso
              </CardTitle>
              <CardDescription>
                Generadas por IA para visualizar cada fase del proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workPlan.generatedImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {workPlan.generatedImages.map((image, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <img 
                          src={`data:image/png;base64,${image.base64}`}
                          alt={image.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{image.description}</h4>
                          <Badge variant="secondary">{image.phase}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Tamaño: {(image.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No se pudieron generar imágenes para este plan</p>
                  <p className="text-sm">Las imágenes se generarán en próximas actualizaciones</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recomendaciones Generales */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones Técnicas y Prácticas Sostenibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Recomendaciones Técnicas
              </h4>
              <ul className="space-y-2 text-sm">
                {workPlan.technicalRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Prácticas Sostenibles
              </h4>
              <ul className="space-y-2 text-sm">
                {workPlan.sustainabilityPractices.map((practice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Mitigación de Riesgos
              </h4>
              <ul className="space-y-2 text-sm">
                {workPlan.riskMitigation.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Puntos de Control de Calidad
              </h4>
              <ul className="space-y-2 text-sm">
                {workPlan.qualityControlPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-4 justify-end">
        {onDownload && (
          <Button onClick={onDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        )}
        {onSave && (
          <Button onClick={onSave}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Guardar Plan
          </Button>
        )}
      </div>
    </div>
  );
}