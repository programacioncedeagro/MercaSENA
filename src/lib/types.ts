import type { LucideIcon } from 'lucide-react';

export type UserRole = 'productor' | 'comprador';

export type ProductionStatus = 'Planeación' | 'Siembra' | 'Crecimiento' | 'Mantenimiento' | 'Cosecha' | 'Postcosecha';

export type Activity = {
  id: string;
  date: string;
  description: string;
  imageUrl?: string;
};

export type Offer = {
  id: string;
  buyerName: string;
  buyerId: string;
  amount: number;
  pricePerUnit: number;
  deliveryDate: string;
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'negociación';
};

export type Production = {
  id: string;
  name: string;
  type: 'Agrícola' | 'Pecuario';
  productImage?: string;
  producerName: string;
  location: string;
  area: number; // in hectares for agricultural, or units for livestock
  startDate: string;
  status: ProductionStatus;
  progress: number;
  estimatedHarvestDate: string;
  projectedYield: string;
  offers: Offer[];
  activities: Activity[];
  traceabilityId: string;
};
