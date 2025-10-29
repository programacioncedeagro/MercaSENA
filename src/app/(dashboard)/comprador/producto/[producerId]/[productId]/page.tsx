'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { Production, PurchaseOrder, DeliveryMethod, Buyer } from '@/lib/types';
import { ProductDetailCard } from '@/components/product-detail-card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const producerId = params.producerId as string;
  const productId = params.productId as string;
  
  const [buyerData, setBuyerData] = useState<Buyer | null>(null);
  const [loadingBuyer, setLoadingBuyer] = useState(true);
  
  // Obtener la producción usando la estructura correcta: users/{producerId}/productions/{productId}
  const productionDocRef = firestore && producerId && productId ? 
    doc(firestore, 'users', producerId, 'productions', productId) : null;
  const { data: production, isLoading: loadingProduction, error } = useDoc<Production>(productionDocRef);

  // Cargar datos del comprador para obtener ubicación
  useEffect(() => {
    const loadBuyerData = async () => {
      if (!user) return;
      
      try {
        // Por ahora usamos datos de ejemplo
        setBuyerData({
          id: user.uid,
          name: user.displayName || 'Comprador',
          email: user.email || '',
          location: 'Bogotá, Colombia',
          coordinates: [-74.0721, 4.7110], // Bogotá
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error loading buyer data:', error);
      } finally {
        setLoadingBuyer(false);
      }
    };

    loadBuyerData();
  }, [user]);

  const handleCreateOffer = async (offer: {
    quantity: number;
    pricePerUnit: number;
    deliveryDate: string;
    deliveryMethod: DeliveryMethod;
    notes?: string;
  }) => {
    if (!user || !production || !buyerData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes estar autenticado para crear una oferta"
      });
      return;
    }

    try {
      const purchaseOrder: Omit<PurchaseOrder, 'id'> = {
        buyerId: user.uid,
        producerId: producerId,
        productionId: productId,
        quantity: offer.quantity,
        pricePerUnit: offer.pricePerUnit,
        totalAmount: offer.quantity * offer.pricePerUnit,
        deliveryDate: offer.deliveryDate,
        deliveryMethod: offer.deliveryMethod,
        deliveryAddress: buyerData.location,
        status: 'pendiente',
        paymentTerms: 'Contado',
        qualityRequirements: ['Producto fresco', 'Sin daños'],
        notes: offer.notes,
        trackingInfo: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Crear la orden de compra (simulado por ahora)
      console.log('Creating purchase order:', purchaseOrder);

      toast({
        title: "Oferta enviada exitosamente",
        description: `Tu oferta por ${offer.quantity} unidades ha sido enviada al productor. Te notificaremos cuando responda.`
      });

      // Redirigir a la página de compras para ver el estado
      router.push('/comprador/compras');
      
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        variant: "destructive",
        title: "Error al enviar oferta",
        description: "No se pudo enviar tu oferta. Por favor intenta nuevamente."
      });
    }
  };

  const calculateEstimatedDeliveryTime = (method: DeliveryMethod): number => {
    switch (method) {
      case 'pickup': return 1; // 1 día para coordinación
      case 'delivery': return 3; // 3 días para entrega directa
      case 'shipping': return 7; // 7 días para envío por transportadora
      case 'farm_gate': return 2; // 2 días para punto de encuentro
      default: return 3;
    }
  };

  const handleAddToFavorites = async () => {
    if (!user || !buyerData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes estar autenticado para agregar favoritos"
      });
      return;
    }

    try {
      toast({
        title: "Agregado a favoritos",
        description: "Este producto ha sido agregado a tu lista de favoritos"
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar a favoritos"
      });
    }
  };

  const handleContactProducer = () => {
    // Por ahora simplemente mostrar mensaje, en el futuro se podría implementar chat
    toast({
      title: "Contacto directo",
      description: "Funcionalidad de chat directo próximamente disponible"
    });
  };

  if (loadingProduction || loadingBuyer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !production) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
        <p className="text-gray-600">El producto que buscas no existe o no está disponible.</p>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  // Enriquecer los datos de producción con información del productor
  const enrichedProduction = {
    ...production,
    producerName: 'Juan Pérez', // En una implementación real, esto vendría de la base de datos
    producerId: producerId,
    producerRating: 4.5,
    producerLocation: production.location,
    producerCertifications: production.certifications || ['Orgánico', 'Comercio Justo'],
    distance: buyerData?.coordinates && production.coordinates ? 
      calculateDistance(buyerData.coordinates, production.coordinates) : undefined
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Mercado
        </Button>
      </div>

      <ProductDetailCard
        production={enrichedProduction}
        onCreateOffer={handleCreateOffer}
        onAddToFavorites={handleAddToFavorites}
        onContactProducer={handleContactProducer}
        buyerLocation={buyerData?.coordinates}
      />
    </div>
  );
}

// Función auxiliar para calcular distancia entre dos puntos
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}