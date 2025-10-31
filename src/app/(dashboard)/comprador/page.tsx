'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, MapPin, Search, Loader2, Scale } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, getDocs, collectionGroup } from 'firebase/firestore';
import type { Production } from '@/lib/types';
import { useEffect, useState } from 'react';

type ProductionWithProducer = Production & { producerName: string, producerId: string };

export default function BuyerMarketplacePage() {
  const firestore = useFirestore();
  const [productions, setProductions] = useState<ProductionWithProducer[]>([]);
  const [filteredProductions, setFilteredProductions] = useState<ProductionWithProducer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productType, setProductType] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (!firestore) return;
    
    const fetchProductions = async () => {
      setIsLoading(true);
      try {
        const allProductions: ProductionWithProducer[] = [];
        
        // Primero obtenemos todos los usuarios productores
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        const producers = new Map();
        
        usersSnapshot.forEach(userDoc => {
          const userData = userDoc.data();
          if (userData.role === 'productor') {
            producers.set(userDoc.id, userData.name);
          }
        });
        
        // Luego obtenemos todas las producciones usando collectionGroup
        // Esto busca en todas las subcolecciones llamadas 'productions'
        const productionsSnapshot = await getDocs(collectionGroup(firestore, 'productions'));
        
        productionsSnapshot.forEach(prodDoc => {
          const productionData = prodDoc.data() as Production;
          
          // El producerId ya está en los datos de la producción
          const actualProducerId = productionData.producerId;
          const producerName = producers.get(actualProducerId) || 'Productor desconocido';
          
          allProductions.push({
            ...productionData,
            id: prodDoc.id,
            producerName,
            producerId: actualProducerId,
          });
        });
        
        setProductions(allProductions);
        setFilteredProductions(allProductions);
      } catch (error) {
        console.error('Error fetching productions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductions();
  }, [firestore]);

  // Ejecutar búsqueda automáticamente cuando cambien los filtros
  useEffect(() => {
    handleSearch();
  }, [searchTerm, productType, sortBy, productions]);

  // Función para filtrar y ordenar producciones
  const handleSearch = () => {
    let filtered = [...productions];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(prod => 
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.producerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo de producto
    if (productType && productType !== 'all') {
      filtered = filtered.filter(prod => {
        if (productType === 'agricola') {
          return prod.type === 'Agrícola';
        } else if (productType === 'pecuario') {
          return prod.type === 'Pecuario';
        }
        return true;
      });
    }

    // Ordenar
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.estimatedHarvestDate).getTime() - new Date(b.estimatedHarvestDate).getTime());
    } else if (sortBy === 'progress') {
      filtered.sort((a, b) => b.progress - a.progress);
    } else if (sortBy === 'area') {
      filtered.sort((a, b) => b.area - a.area);
    }

    setFilteredProductions(filtered);
  };

  // Calcular cantidad potencial estimada con control de stock
  const calculatePotentialQuantity = (production: Production) => {
    // Si ya está cosechado, usar cantidad real disponible
    if (production.isHarvested && production.availableQuantity !== undefined) {
      return production.availableQuantity;
    }
    
    // Si tiene cantidad esperada definida, usarla
    if (production.expectedQuantity) {
      return production.expectedQuantity;
    }
    
    // Si ya tiene cantidad disponible calculada, usarla
    if (production.totalQuantityAvailable) {
      return production.totalQuantityAvailable;
    }

    // Rendimientos promedio por hectárea en Colombia
    const yieldPerHectare: { [key: string]: number } = {
      'agrícola': 15000, // kg/ha promedio para cultivos agrícolas
      'pecuario': 2000,  // kg por ciclo/ha promedio para ganadería
    };

    const typeKey = production.type.toLowerCase();
    const baseYield = yieldPerHectare[typeKey] || yieldPerHectare['agrícola'];
    
    // Ajustar por progreso y área
    const progressFactor = production.progress / 100;
    const estimatedQuantity = Math.round(baseYield * production.area * progressFactor);
    
    return estimatedQuantity;
  };

  // Función para obtener el estado del stock
  const getStockStatus = (production: Production) => {
    const totalQuantity = calculatePotentialQuantity(production);
    const available = production.availableQuantity ?? totalQuantity;
    const reserved = production.reservedQuantity ?? 0;
    const sold = production.soldQuantity ?? 0;
    
    return {
      total: totalQuantity,
      available: Math.max(0, available - reserved),
      reserved,
      sold,
      percentage: totalQuantity > 0 ? Math.round(((available - reserved) / totalQuantity) * 100) : 0
    };
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Mercado de Futuros</h1>
        <p className="text-muted-foreground mt-2 text-lg">Encuentra y asegura los mejores productos directamente del campo.</p>
      </div>

      <Card className="shadow-lg p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2">
                <label htmlFor="search">Buscar producto</label>
                <Input 
                  id="search" 
                  placeholder="Ej: Tomate, Lechuga..." 
                  className="h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="product-type">Tipo de producto</label>
                 <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger id="product-type" className="h-12">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="agricola">Agrícola</SelectItem>
                        <SelectItem value="pecuario">Pecuario</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label htmlFor="sort-by">Ordenar por</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort-by" className="h-12">
                      <SelectValue placeholder="Fecha de cosecha" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Fecha de cosecha</SelectItem>
                        <SelectItem value="progress">Progreso</SelectItem>
                        <SelectItem value="area">Área cultivada</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button 
              size="lg" 
              className="h-12 w-full text-lg" 
              onClick={handleSearch}
            >
              <Search className="mr-2 h-5 w-5"/>Buscar
            </Button>
        </div>
      </Card>

      {isLoading && <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}

      {!isLoading && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {filteredProductions.length === productions.length 
                ? `${productions.length} productos disponibles` 
                : `${filteredProductions.length} de ${productions.length} productos`}
            </h2>
            {filteredProductions.length !== productions.length && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setProductType('');
                  setSortBy('date');
                  setFilteredProductions(productions);
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredProductions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="bg-muted rounded-lg p-8">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || productType 
                      ? "Intenta ajustar tus filtros de búsqueda."
                      : "No hay productos disponibles en este momento."}
                  </p>
                  {(searchTerm || productType) && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setProductType('');
                        setSortBy('date');
                        setFilteredProductions(productions);
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              filteredProductions.map((prod) => {
                const potentialQuantity = calculatePotentialQuantity(prod);
                const stockStatus = getStockStatus(prod);
                
                return (
                  <Card key={prod.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {/* Header con título del producto */}
                    <CardHeader className="p-6 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl font-bold text-primary mb-2">
                            {prod.name || 'Producto sin nombre'}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                              {prod.type}
                            </span>
                            <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                              prod.status === 'Cosecha' ? 'bg-green-100 text-green-800' :
                              prod.status === 'Crecimiento' ? 'bg-blue-100 text-blue-800' :
                              prod.status === 'Planeación' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {prod.status || 'Estado desconocido'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="font-semibold text-foreground text-lg mt-2">
                        Producido por {prod.producerName || 'Productor desconocido'}
                      </CardDescription>
                    </CardHeader>
                  <CardContent className="flex-grow p-6 space-y-4">
                    <CardDescription className="font-bold text-foreground text-lg">
                        Producido por {prod.producerName}
                    </CardDescription>
                    <div className="space-y-3">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-5 w-5 flex-shrink-0" />
                        <span>{prod.location}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-5 w-5 flex-shrink-0" />
                        <span>Cosecha estimada: <span className="font-bold text-foreground">{new Date(prod.estimatedHarvestDate).toLocaleDateString('es-CO', { month: 'long', day: 'numeric' })}</span></span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground">Progreso</div>
                          <div className="text-xl font-bold text-primary">{prod.progress}%</div>
                        </div>
                        <div className={`text-center p-3 rounded-lg ${
                          stockStatus.available > 0 ? 'bg-green-50' : 'bg-yellow-50'
                        }`}>
                          <div className="text-sm text-muted-foreground">
                            {prod.isHarvested ? 'Disponible' : 'Cantidad Estimada'}
                          </div>
                          <div className={`text-xl font-bold ${
                            stockStatus.available > 0 ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {stockStatus.available > 0 ? `${stockStatus.available.toLocaleString()} kg` : 
                             potentialQuantity > 0 ? `${potentialQuantity.toLocaleString()} kg` : 'Por calcular'}
                          </div>
                        </div>
                      </div>
                      {stockStatus.reserved > 0 && (
                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Cantidad Reservada</div>
                          <div className="text-lg font-semibold text-orange-600">{stockStatus.reserved.toLocaleString()} kg</div>
                        </div>
                      )}
                      {/* Información del Plan de Trabajo */}
                      {prod.workPlan && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-foreground">Plan de Trabajo IA</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-blue-50 p-2 rounded">
                              <div className="text-muted-foreground">Duración</div>
                              <div className="font-semibold text-blue-600">
                                {prod.workPlan.totalDuration || prod.estimatedDuration || 'N/A'} días
                              </div>
                            </div>
                            <div className="bg-purple-50 p-2 rounded">
                              <div className="text-muted-foreground">Actividades</div>
                              <div className="font-semibold text-purple-600">
                                {(prod.workPlan as any).activities?.length || prod.totalActivities || 0} total
                              </div>
                            </div>
                          </div>
                          {(prod.workPlan as any).activities && (prod.workPlan as any).activities.length > 0 && (
                            <div className="bg-amber-50 p-2 rounded">
                              <div className="text-xs text-muted-foreground mb-1">Próxima actividad:</div>
                              <div className="text-xs font-medium text-amber-700">
                                {(prod.workPlan as any).activities[0].description || (prod.workPlan as any).activities[0].name || 'Actividad programada'}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Área cultivada</div>
                        <div className="text-lg font-semibold text-blue-600">{prod.area} hectáreas</div>
                      </div>
                      {(prod.unitPrice || prod.currentPrice) && (
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Precio por kg</div>
                          <div className="text-lg font-semibold text-purple-600">
                            ${(prod.unitPrice || prod.currentPrice || 0).toLocaleString()} COP
                          </div>
                        </div>
                      )}
                      {/* Certificaciones y estándares de calidad */}
                      {prod.certifications && prod.certifications.length > 0 && (
                        <div className="bg-green-50 p-2 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Certificaciones:</div>
                          <div className="flex flex-wrap gap-1">
                            {prod.certifications.slice(0, 2).map((cert, index) => (
                              <span key={index} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                {cert}
                              </span>
                            ))}
                            {prod.certifications.length > 2 && (
                              <span className="text-xs text-green-600">+{prod.certifications.length - 2} más</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 bg-muted/50">
                    <Button asChild className="w-full h-12 text-lg" >
                        <Link href={`/comprador/producto/${prod.producerId}/${prod.id}`}>Ver Producto y Ofertar</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
