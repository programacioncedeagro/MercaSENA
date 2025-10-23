'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Tractor, Sprout, CheckCircle, PlusCircle, Check, X, MessageCircle, Loader2, Eye, ListOrdered, Inbox } from 'lucide-react';
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

  const { data: offers, isLoading: areOffersLoading } = useCollection<Offer & { buyerName: string }>(offersQuery, {
      fetchBuyerNames: true, // Custom flag to trigger buyer name fetching
      firestore,
  });
  
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

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
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
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl">Detalles de la Producción</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6 text-lg">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-8 w-8 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Origen</p>
                            <p className="font-bold">{production.location}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Cosecha Estimada</p>
                            <p className="font-bold">{new Date(production.estimatedHarvestDate).toLocaleDateString('es-CO', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <div className='flex justify-between items-center mb-2'>
                            <p className="text-lg font-medium text-muted-foreground">Progreso de la Cosecha</p>
                            <p className="text-lg font-bold text-primary">{production.progress}%</p>
                        </div>
                        <Progress value={production.progress} aria-label={`${production.progress}% completado`} />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl flex items-center gap-3"><Inbox />Ofertas Recibidas</CardTitle>
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
                                            <Button size="sm" onClick={() => handleOfferStatusChange(offer.id, 'aceptada')}><Check className="mr-2 h-4 w-4"/>Aceptar</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleOfferStatusChange(offer.id, 'rechazada')}><X className="mr-2 h-4 w-4"/>Rechazar</Button>
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
            
        </div>
        
        <div className="space-y-8">
            <Card className="shadow-lg sticky top-8">
                <CardHeader>
                    <CardTitle className="text-3xl flex items-center gap-3"><ListOrdered/>Trazabilidad</CardTitle>
                    <CardDescription>Añade un nuevo evento a la línea de tiempo de este producto.</CardDescription>
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
                <CardContent>
                    <h4 className='font-bold mb-4'>Historial de Actividades</h4>
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
      </div>
    </div>
  );
}
