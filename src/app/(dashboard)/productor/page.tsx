'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, DollarSign, MessageSquare, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Production, Offer } from '@/lib/types';

export default function ProducerDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const productionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/productions`));
  }, [user, firestore]);

  const offersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'offers'), where('producerId', '==', user.uid));
  }, [user, firestore]);

  const { data: productions, isLoading: isProductionsLoading } = useCollection<Production>(productionsQuery);
  const { data: offers, isLoading: isOffersLoading } = useCollection<Offer>(offersQuery);

  const isLoading = isUserLoading || isProductionsLoading || isOffersLoading;

  const activeProductions = productions?.length ?? 0;
  const newOffers = offers?.filter(o => o.status === 'pendiente').length ?? 0;

  const acceptedOffers = offers?.filter(o => o.status === 'aceptada') ?? [];
  const projectedIncome = acceptedOffers.reduce((sum, offer) => sum + (offer.amount * offer.pricePerUnit), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard del Productor</h1>
          <p className="text-muted-foreground mt-2 text-lg">Resumen de tu actividad en la plataforma.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i} className="shadow-lg h-36 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard del Productor</h1>
        <p className="text-muted-foreground mt-2 text-lg">Resumen de tu actividad en la plataforma.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Producciones Activas</CardTitle>
            <Leaf className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{activeProductions}</div>
            <p className="text-xs text-muted-foreground">Cultivos y crías en seguimiento.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Nuevas Ofertas</CardTitle>
            <MessageSquare className="h-6 w-6 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{newOffers}</div>
            <p className="text-xs text-muted-foreground">Ofertas recibidas por tus productos.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Ingresos Asegurados</CardTitle>
            <DollarSign className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(projectedIncome)}
            </div>
            <p className="text-xs text-muted-foreground">Total de contratos cerrados.</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future charts and more detailed info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aquí se mostrará un feed de la actividad reciente en tus producciones.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Proyección de Cosechas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aquí se mostrará una línea de tiempo con las próximas cosechas.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
