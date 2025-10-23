import type { LucideIcon } from 'lucide-react';

export type UserRole = 'productor' | 'comprador';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ProductionStatus = 'Planeación' | 'Siembra' | 'Crecimiento' | 'Mantenimiento' | 'Cosecha' | 'Postcosecha';

export type Activity = {
  id: string;
  date: string;
  description: string;
  imageUrl?: string;
};

export type OfferStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'negociación';

export type Offer = {
  id: string;
  buyerId: string;
  producerId: string;
  productId: string; // This is the ID of the Production document
  amount: number;
  pricePerUnit: number;
  deliveryDate: string;
  status: OfferStatus;
  createdAt: string;
  // Denormalized fields for easier display
  buyerName?: string; 
  producerName?: string;
};

export type Production = {
  id: string;
  name: string;
  type: 'Agrícola' | 'Pecuario';
  productImage?: string;
  producerId: string;
  location: string;
  area: number; // in hectares for agricultural, or units for livestock
  plantingDate: string;
  status: ProductionStatus;
  progress: number;
  estimatedHarvestDate: string;
  projectedYield?: string;
  activities?: Activity[];
  traceabilityId?: string;
  offers?: Offer[]; // This might be populated from a sub-collection or separate query
};
