'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  MapPin,
  BarChart3,
  Target,
  Settings,
  Plus,
  Filter,
  Download,
  Repeat,
  Eye,
  MessageSquare,
  ArrowUpDown
} from 'lucide-react';
import { PurchaseOrder, StockItem, RecurringPurchase, DeliveryMethod } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos de ejemplo - en implementación real vendrían de Firebase
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    buyerId: 'buyer1',
    buyerName: 'María González',
    producerId: 'prod1',
    producerName: 'Finca Los Rosales',
    productionId: 'production1',
    productName: 'Tomate',
    quantity: 100,
    unitPrice: 2500,
    pricePerUnit: 2500,
    totalAmount: 250000,
    deliveryDate: '2024-12-30',
    deliveryMethod: 'delivery',
    deliveryAddress: 'Bogotá, Colombia',
    status: 'confirmado',
    paymentStatus: 'pendiente',
    paymentTerms: 'Contado',
    qualityRequirements: ['Producto fresco', 'Sin daños'],
    notes: 'Entrega urgente para eventos navideños',
    requestedDate: '2024-12-20T10:00:00Z',
    trackingUpdates: [],
    trackingInfo: {
      dispatchDate: '2024-12-28',
      estimatedArrival: '2024-12-30',
      currentLocation: 'En tránsito desde Boyacá'
    },
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-28T08:00:00Z'
  },
  {
    id: '2',
    buyerId: 'buyer1',
    buyerName: 'María González',
    producerId: 'prod2',
    producerName: 'Hacienda San Pedro',
    productionId: 'production2',
    productName: 'Lechuga',
    quantity: 50,
    unitPrice: 1800,
    pricePerUnit: 1800,
    totalAmount: 90000,
    deliveryDate: '2025-01-15',
    deliveryMethod: 'pickup',
    deliveryAddress: 'Finca El Rosal, Cundinamarca',
    status: 'pendiente',
    paymentStatus: 'pendiente',
    paymentTerms: 'Contado',
    qualityRequirements: ['Certificación orgánica'],
    requestedDate: '2024-12-25T14:30:00Z',
    trackingUpdates: [],
    createdAt: '2024-12-25T14:30:00Z',
    updatedAt: '2024-12-25T14:30:00Z'
  }
];

const mockStockItems: StockItem[] = [
  {
    id: '1',
    productType: 'Papa',
    productName: 'Papa Criolla',
    currentStock: 150,
    minStockLevel: 50,
    maxStockLevel: 300,
    unit: 'kg',
    averageCost: 2300,
    lastRestockDate: '2024-12-20',
    expirationDate: '2025-01-05',
    location: 'Bodega Principal',
    coordinates: [-74.0721, 4.7110],
    supplierId: 'prod1',
    lastMovements: [
      {
        id: '1',
        type: 'entrada',
        quantity: 100,
        unitCost: 2500,
        date: '2024-12-20',
        reason: 'Compra a productor',
        reference: 'ORDER-001'
      }
    ]
  },
  {
    id: '2',
    productType: 'Tomate',
    productName: 'Tomate Cherry',
    currentStock: 25,
    minStockLevel: 30,
    maxStockLevel: 150,
    unit: 'kg',
    averageCost: 4500,
    lastRestockDate: '2024-12-18',
    expirationDate: '2024-12-30',
    location: 'Bodega Refrigerada',
    coordinates: [-74.0721, 4.7110]
  }
];

const mockRecurringPurchases: RecurringPurchase[] = [
  {
    id: '1',
    buyerId: 'buyer1',
    productType: 'Papa',
    quantity: 100,
    frequency: 'semanal',
    maxPrice: 2800,
    deliveryMethod: 'delivery',
    location: {
      address: 'Bogotá, Colombia',
      coordinates: [-74.0721, 4.7110]
    },
    qualityRequirements: ['Producto fresco', 'Certificación orgánica'],
    isActive: true,
    nextPurchaseDate: '2025-01-05',
    preferredSuppliers: ['prod1', 'prod2'],
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z'
  }
];

export default function ComprasAdvancedPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState('ordenes');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [sortBy, setSortBy] = useState('fecha');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStockItems);
  const [recurringPurchases, setRecurringPurchases] = useState<RecurringPurchase[]>(mockRecurringPurchases);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'confirmado': return 'bg-blue-500';
      case 'en_transito': return 'bg-yellow-500';
      case 'entregado': return 'bg-green-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="w-4 h-4" />;
      case 'en_transito': return <Truck className="w-4 h-4" />;
      case 'entregado': return <Package className="w-4 h-4" />;
      case 'cancelado': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    if (filterStatus === 'todas') return true;
    return order.status === filterStatus;
  });

  const totalSpent = purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = purchaseOrders.filter(order => order.status === 'pendiente').length;
  const activeRecurring = recurringPurchases.filter(r => r.isActive).length;
  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minStockLevel).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Compras</h1>
          <p className="text-gray-600 mt-2">Controla tu cadena de suministro y optimiza tus compras</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Compra
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-2">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Órdenes Pendientes</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">Requieren atención</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compras Recurrentes</p>
                <p className="text-2xl font-bold">{activeRecurring}</p>
              </div>
              <Repeat className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">Activas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-red-600">Requieren reposición</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ordenes">Órdenes de Compra</TabsTrigger>
          <TabsTrigger value="stock">Gestión de Stock</TabsTrigger>
          <TabsTrigger value="recurrentes">Compras Recurrentes</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="ordenes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Órdenes de Compra</CardTitle>
                  <CardDescription>Gestiona todas tus órdenes de compra y su estado</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="confirmada">Confirmadas</SelectItem>
                      <SelectItem value="en_transito">En Tránsito</SelectItem>
                      <SelectItem value="entregado">Entregadas</SelectItem>
                      <SelectItem value="cancelado">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="border-l-4" style={{borderLeftColor: getStatusColor(order.status).replace('bg-', '')}}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-500">#{order.id}</span>
                          </div>
                          <h3 className="font-semibold">Orden de {order.quantity} unidades</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Entrega: {order.deliveryDate ? format(new Date(order.deliveryDate), 'PPP', { locale: es }) : 'Por definir'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{order.deliveryMethod === 'delivery' ? 'Entrega a domicilio' : 'Recogida en finca'}</span>
                            </div>
                          </div>
                          {order.trackingInfo?.currentLocation && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Truck className="w-4 h-4" />
                              <span>{order.trackingInfo.currentLocation}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(order.totalAmount)}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(order.pricePerUnit)}/unidad</div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Inventario</CardTitle>
              <CardDescription>Controla tus niveles de stock y movimientos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stockItems.map((item) => (
                  <Card key={item.id} className={`${item.currentStock <= item.minStockLevel ? 'border-red-200 bg-red-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{item.productName}</h3>
                          <p className="text-sm text-gray-600">{item.productType}</p>
                        </div>
                        {item.currentStock <= item.minStockLevel && (
                          <Badge variant="destructive" className="text-xs">
                            Stock Bajo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Stock actual:</span>
                          <span className="font-medium">{item.currentStock} {item.unit}</span>
                        </div>
                        <Progress 
                          value={(item.currentStock / item.maxStockLevel) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Min: {item.minStockLevel}</span>
                          <span>Max: {item.maxStockLevel}</span>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Costo promedio:</span>
                          <span>{formatCurrency(item.averageCost)}/{item.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Última reposición:</span>
                          <span>{format(new Date(item.lastRestockDate), 'dd/MM/yyyy')}</span>
                        </div>
                        {item.expirationDate && (
                          <div className="flex justify-between">
                            <span>Vencimiento:</span>
                            <span className={new Date(item.expirationDate) < new Date() ? 'text-red-600' : ''}>
                              {format(new Date(item.expirationDate), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          <ArrowUpDown className="w-4 h-4 mr-1" />
                          Movimientos
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Plus className="w-4 h-4 mr-1" />
                          Reabastecer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurrentes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Compras Recurrentes</CardTitle>
                  <CardDescription>Automatiza tus compras regulares</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Suscripción
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recurringPurchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{purchase.productType}</h3>
                            <Badge variant={purchase.isActive ? 'default' : 'secondary'}>
                              {purchase.isActive ? 'Activa' : 'Pausada'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Cantidad:</span> {purchase.quantity} unidades
                            </div>
                            <div>
                              <span className="font-medium">Frecuencia:</span> {purchase.frequency}
                            </div>
                            <div>
                              <span className="font-medium">Precio máximo:</span> {formatCurrency(purchase.maxPrice)}
                            </div>
                            <div>
                              <span className="font-medium">Próxima compra:</span> {format(new Date(purchase.nextPurchaseDate), 'PPP', { locale: es })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-1" />
                            Configurar
                          </Button>
                          <Button variant="outline" size="sm">
                            {purchase.isActive ? 'Pausar' : 'Activar'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Gasto</CardTitle>
                <CardDescription>Análisis de tus compras en el tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gráfico de tendencias próximamente disponible</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Proveedores</CardTitle>
                <CardDescription>Calificación y métricas de tus proveedores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Análisis de proveedores próximamente disponible</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}