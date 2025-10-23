import { Leaf, Drumstick } from 'lucide-react';
import type { Production } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || '';

export const mockProductions: Production[] = [
  {
    id: 'prod_1',
    name: 'Tomates Saladette',
    type: 'Agrícola',
    productImage: findImage('tomato-crop-1'),
    icon: Leaf,
    producerName: 'Juan Valdez',
    location: 'Villa de Leyva, Boyacá',
    area: 2.5,
    startDate: '2024-05-15',
    status: 'Crecimiento',
    progress: 75,
    estimatedHarvestDate: '2024-08-20',
    projectedYield: '10-12 Toneladas',
    offers: [
      { id: 'off_1', buyerName: 'Supermercado El Éxito', buyerId: 'buy_1', amount: 500, pricePerUnit: 2500, deliveryDate: '2024-08-22', status: 'pendiente' },
      { id: 'off_2', buyerName: 'Restaurante Crepes & Waffles', buyerId: 'buy_2', amount: 200, pricePerUnit: 2800, deliveryDate: '2024-08-21', status: 'negociación' },
    ],
    activities: [
      { id: 'act_1', date: '2024-05-15', description: 'Siembra de plántulas' },
      { id: 'act_2', date: '2024-06-01', description: 'Primera fertilización', imageUrl: findImage('production-timeline-1') },
      { id: 'act_3', date: '2024-06-20', description: 'Control de plagas preventivo' },
      { id: 'act_4', date: '2024-07-10', description: 'Riego por goteo instalado', imageUrl: findImage('tomato-crop-2') },
    ],
    traceabilityId: 'qr_tomate_juan_2024_lote1',
  },
  {
    id: 'prod_2',
    name: 'Lechuga Batavia',
    type: 'Agrícola',
    productImage: findImage('lettuce-crop-1'),
    icon: Leaf,
    producerName: 'Maria Rodriguez',
    location: 'La Sabana, Cundinamarca',
    area: 5,
    startDate: '2024-06-01',
    status: 'Crecimiento',
    progress: 40,
    estimatedHarvestDate: '2024-08-05',
    projectedYield: '8 Toneladas',
    offers: [
      { id: 'off_3', buyerName: 'Tienda D1', buyerId: 'buy_3', amount: 1000, pricePerUnit: 1200, deliveryDate: '2024-08-06', status: 'aceptada' },
    ],
    activities: [
      { id: 'act_5', date: '2024-06-01', description: 'Siembra directa de semillas' },
      { id: 'act_6', date: '2024-06-15', description: 'Riego por aspersión' },
    ],
    traceabilityId: 'qr_lechuga_maria_2024_lote1',
  },
  {
    id: 'prod_3',
    name: 'Pollos de Engorde',
    type: 'Pecuario',
    productImage: findImage('poultry-farm-1'),
    icon: Drumstick,
    producerName: 'Carlos Jimenez',
    location: 'Santander',
    area: 500, // Represents number of birds
    startDate: '2024-06-20',
    status: 'Crecimiento',
    progress: 25,
    estimatedHarvestDate: '2024-08-30',
    projectedYield: '1.2 Toneladas de carne',
    offers: [],
    activities: [
        { id: 'act_7', date: '2024-06-20', description: 'Recepción de pollitos de un día' },
        { id: 'act_8', date: '2024-07-01', description: 'Cambio a alimento de crecimiento' },
    ],
    traceabilityId: 'qr_pollos_carlos_2024_lote3',
  }
];
