'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Truck, 
  Shield, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  DollarSign,
  BarChart3,
  Route,
  FileText,
  Star,
  Award,
  Leaf,
  Factory,
  Users,
  Calculator,
  Target,
  ShoppingCart,
  Heart,
  MessageSquare
} from 'lucide-react';
import { Production, PurchaseOrder, DeliveryMethod } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailCardProps {
  production: Production & { 
    producerName: string; 
    producerId: string;
    producerRating?: number;
    producerLocation?: string;
    producerCertifications?: string[];
    distance?: number; // km from buyer
  };
  onCreateOffer: (offer: {
    quantity: number;
    pricePerUnit: number;
    deliveryDate: string;
    deliveryMethod: DeliveryMethod;
    notes?: string;
  }) => void;
  onAddToFavorites?: () => void;
  onContactProducer?: () => void;
  buyerLocation?: [number, number];
}

export function ProductDetailCard({ 
  production, 
  onCreateOffer,
  onAddToFavorites,
  onContactProducer,
  buyerLocation
}: ProductDetailCardProps) {
  const { toast } = useToast();
  const [offerQuantity, setOfferQuantity] = useState<number>(1);
  const [offerPrice, setOfferPrice] = useState<number>(production.currentPrice || 0);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [offerNotes, setOfferNotes] = useState<string>('');
  const [priceNegotiation, setPriceNegotiation] = useState<number>(0); // porcentaje de descuento

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateDistance = () => {
    if (!buyerLocation || !production.coordinates) return null;
    // Fórmula simplificada de distancia euclidiana
    const dx = buyerLocation[1] - production.coordinates[1];
    const dy = buyerLocation[0] - production.coordinates[0];
    return Math.sqrt(dx * dx + dy * dy) * 111; // aproximación en km
  };

  const handlePriceNegotiation = (percentage: number) => {
    if (!production.currentPrice) return;
    const discountedPrice = production.currentPrice * (1 - percentage / 100);
    setOfferPrice(discountedPrice);
    setPriceNegotiation(percentage);
  };

  const handleCreateOffer = () => {
    if (!offerQuantity || !offerPrice || !deliveryDate) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios"
      });
      return;
    }

    onCreateOffer({
      quantity: offerQuantity,
      pricePerUnit: offerPrice,
      deliveryDate,
      deliveryMethod,
      notes: offerNotes
    });

    toast({
      title: "Oferta enviada",
      description: `Tu oferta por ${offerQuantity} unidades ha sido enviada al productor`
    });
  };

  const distance = calculateDistance();
  const daysToHarvest = production.estimatedHarvestDate ? 
    Math.ceil((new Date(production.estimatedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header con información principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{production.name}</h1>
              <div className="flex items-center gap-4 text-green-100">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {production.type}
                </Badge>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{production.location}</span>
                  {distance && <span className="text-sm">({distance.toFixed(1)} km)</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{production.producerName}</span>
                {production.producerRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    <span>{production.producerRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-sm text-green-100">Precio por unidad</div>
              <div className="text-3xl font-bold">
                {production.currentPrice ? formatCurrency(production.currentPrice) : 'Consultar'}
              </div>
              {production.totalQuantityAvailable && (
                <div className="text-sm text-green-100">
                  {production.totalQuantityAvailable.toLocaleString()} unidades disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información detallada del producto */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="detalles" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="detalles">Detalles</TabsTrigger>
              <TabsTrigger value="proceso">Proceso</TabsTrigger>
              <TabsTrigger value="calidad">Calidad</TabsTrigger>
              <TabsTrigger value="logistica">Logística</TabsTrigger>
              <TabsTrigger value="trazabilidad">Trazabilidad</TabsTrigger>
            </TabsList>

            <TabsContent value="detalles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Información del Producto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Área de Cultivo</Label>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span>{production.area} hectáreas</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Fecha de Siembra</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{format(new Date(production.plantingDate), 'PPP', { locale: es })}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Estado Actual</Label>
                      <Badge variant={production.status === 'Cosecha' ? 'default' : 'secondary'}>
                        {production.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Progreso</Label>
                      <div className="space-y-1">
                        <Progress value={production.progress} className="h-2" />
                        <span className="text-sm text-gray-600">{production.progress}% completado</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fecha Estimada de Cosecha</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>{format(new Date(production.estimatedHarvestDate), 'PPP', { locale: es })}</span>
                      <Badge variant="outline">
                        {daysToHarvest > 0 ? `${daysToHarvest} días` : 'Disponible ahora'}
                      </Badge>
                    </div>
                  </div>

                  {production.projectedYield && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rendimiento Proyectado</Label>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span>{production.projectedYield}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proceso" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Proceso Productivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {production.workPlan ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Plan de Trabajo Certificado</h4>
                        <p className="text-sm text-green-700">
                          Este productor cuenta con un plan de trabajo completo basado en metodología 5M 
                          que garantiza procesos estandarizados y trazabilidad.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Metodología Aplicada</Label>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline">Mano de Obra</Badge>
                            <Badge variant="outline">Maquinaria</Badge>
                            <Badge variant="outline">Materiales</Badge>
                            <Badge variant="outline">Métodos</Badge>
                            <Badge variant="outline">Medio Ambiente</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Nivel de Confianza</Label>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>85% - Muy Alto</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Este productor no ha compartido detalles del proceso productivo</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calidad" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certificaciones y Calidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {production.certifications && production.certifications.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Certificaciones</Label>
                        <div className="flex flex-wrap gap-2">
                          {production.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="default" className="bg-green-600">
                              <Shield className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {production.qualityStandards && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Estándares de Calidad</Label>
                          <ul className="space-y-1">
                            {production.qualityStandards.map((standard, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                {standard}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No se han reportado certificaciones específicas</p>
                      <p className="text-sm">Contacta al productor para más información</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logistica" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Información Logística
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Ubicación del Productor</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="text-sm">{production.location}</span>
                      </div>
                    </div>
                    {distance && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Distancia Estimada</Label>
                        <div className="flex items-center gap-2">
                          <Route className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{distance.toFixed(1)} km</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Métodos de Entrega Disponibles</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Recogida en finca</Badge>
                      <Badge variant="outline">Entrega a domicilio</Badge>
                      <Badge variant="outline">Punto de encuentro</Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Información de Entrega</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Entregas programadas según disponibilidad</li>
                      <li>• Confirmación 24 horas antes</li>
                      <li>• Tracking disponible para pedidos grandes</li>
                      <li>• Empaque especializado incluido</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trazabilidad" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Trazabilidad del Producto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {production.traceabilityId ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">ID de Trazabilidad</h4>
                        <p className="text-sm text-green-700 font-mono">{production.traceabilityId}</p>
                      </div>

                      {production.activities && production.activities.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Actividades Registradas</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {production.activities.slice(0, 5).map((activity, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{activity.description}</div>
                                  <div className="text-xs text-gray-500">
                                    {format(new Date(activity.date), 'PPP', { locale: es })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Trazabilidad no disponible</p>
                      <p className="text-sm">Contacta al productor para más información</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel de ofertas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Hacer Oferta
              </CardTitle>
              <CardDescription>
                Crea una oferta personalizada para este producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad (unidades)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(Number(e.target.value))}
                  min="1"
                  max={production.totalQuantityAvailable || undefined}
                />
              </div>

              <div className="space-y-2">
                <Label>Precio por Unidad</Label>
                {production.currentPrice && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Precio base: {formatCurrency(production.currentPrice)}</span>
                      {priceNegotiation > 0 && (
                        <Badge variant="secondary">-{priceNegotiation}%</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePriceNegotiation(5)}
                      >
                        -5%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePriceNegotiation(10)}
                      >
                        -10%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePriceNegotiation(15)}
                      >
                        -15%
                      </Button>
                    </div>
                  </div>
                )}
                <Input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Fecha de Entrega Deseada</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryMethod">Método de Entrega</Label>
                <Select 
                  value={deliveryMethod} 
                  onValueChange={(value: DeliveryMethod) => setDeliveryMethod(value)}
                >
                  <SelectTrigger id="deliveryMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Recogida en finca</SelectItem>
                    <SelectItem value="delivery">Entrega a domicilio</SelectItem>
                    <SelectItem value="shipping">Envío por transportadora</SelectItem>
                    <SelectItem value="farm_gate">Punto de encuentro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                <Textarea
                  id="notes"
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="Requisitos especiales, condiciones de pago, etc."
                  rows={3}
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium mb-1">Total de la Oferta</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(offerQuantity * offerPrice)}
                </div>
              </div>

              <Button onClick={handleCreateOffer} className="w-full" size="lg">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Enviar Oferta
              </Button>
            </CardContent>
          </Card>

          {/* Acciones adicionales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {onAddToFavorites && (
                <Button variant="outline" className="w-full" onClick={onAddToFavorites}>
                  <Heart className="w-4 h-4 mr-2" />
                  Agregar a Favoritos
                </Button>
              )}
              {onContactProducer && (
                <Button variant="outline" className="w-full" onClick={onContactProducer}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contactar Productor
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}