'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Tractor, Sprout, CheckCircle, Scale, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { Production } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProductDetailPage() {
  const params = useParams();
  // The url is /comprador/producto/[producerId]/[productionId]
  const producerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const productionId = Array.isArray(params.id) ? params.id[1] : '';
  const { toast } = useToast();
  const router = useRouter();

  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();

  const productionDocRef = useMemoFirebase(() => {
    if (!firestore || !producerId || !productionId) return null;
    return doc(firestore, `users/${producerId}/productions/${productionId}`);
  }, [firestore, producerId, productionId]);

  const { data: production, isLoading: isProductionLoading } = useDoc<Production>(productionDocRef);

  const producerDocRef = useMemoFirebase(() => {
    if (!firestore || !producerId) return null;
    return doc(firestore, 'users', producerId);
  }, [firestore, producerId]);

  const { data: producer, isLoading: isProducerLoading } = useDoc<{name: string}>(producerDocRef);

  if (isProductionLoading || isProducerLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!production) {
    return notFound();
  }

  const findImage = (url: string | undefined) => PlaceHolderImages.find(img => img.imageUrl === url);
  const productImage = findImage(production.productImage);
  const totalValue = quantity * price;

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: "Error", description: "Debes iniciar sesión para ofertar." });
        return;
    }
    setIsSubmitting(true);
    
    const offerRef = collection(firestore, 'offers');
    
    await addDocumentNonBlocking(offerRef, {
        buyerId: user.uid,
        producerId: producerId,
        productId: productionId,
        amount: quantity,
        pricePerUnit: price,
        deliveryDate: production.estimatedHarvestDate, // For now, use the estimated harvest date
        status: 'pendiente',
        createdAt: new Date().toISOString(),
    });

    toast({
        title: "¡Oferta Enviada!",
        description: `Tu oferta de ${quantity}kg a ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)}/kg ha sido enviada.`,
    });
    
    setIsSubmitting(false);
    router.push('/comprador/compras');
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
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
          <p className="text-xl text-white/90 mt-2">Una oportunidad de cosecha futura.</p>
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
                        <Tractor className="h-8 w-8 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Productor</p>
                            <p className="font-bold">{producer?.name}</p>
                        </div>
                    </div>
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
                </CardContent>
            </Card>
            
            {production.activities && production.activities.length > 0 && (
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">Trazabilidad del Producto</CardTitle>
                        <CardDescription>Sigue el viaje de tu alimento desde la semilla.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l-2 border-primary ml-4 pl-8 space-y-12 py-4">
                            <div className="absolute -left-4 top-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                                <Sprout className="h-5 w-5 text-primary-foreground"/>
                            </div>
                            {production.activities.map((activity) => {
                                const activityImage = findImage(activity.imageUrl);
                                return (
                                    <div key={activity.id} className="relative">
                                        <div className="absolute -left-[2.1rem] top-1.5 h-4 w-4 bg-background border-2 border-primary rounded-full" />
                                        <p className="font-bold text-primary">{format(new Date(activity.date), "d 'de' MMMM", {locale: es})}</p>
                                        <h3 className="text-xl font-semibold mt-1">{activity.description}</h3>
                                        {activityImage && (
                                            <Image
                                                src={activityImage.imageUrl}
                                                alt={activity.description}
                                                width={400}
                                                height={250}
                                                className="mt-3 rounded-lg shadow-md"
                                                data-ai-hint={activityImage.imageHint}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                            <div className="absolute -left-4 bottom-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-primary-foreground"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        
        <div className="space-y-8">
            <Card className="shadow-lg sticky top-8">
                <CardHeader>
                    <CardTitle className="text-3xl">Realizar Oferta</CardTitle>
                    <CardDescription>Asegura tu parte de la cosecha.</CardDescription>
                </CardHeader>
                <form onSubmit={handleOfferSubmit}>
                    <CardContent className="space-y-6">
                        <div>
                             <div className='flex justify-between items-center mb-2'>
                                <p className="text-lg font-medium text-muted-foreground">Progreso</p>
                                <p className="text-lg font-bold text-primary">{production.progress}%</p>
                            </div>
                            <Progress value={production.progress} aria-label={`${production.progress}% completado`} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-lg">Cantidad (Kg)</Label>
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="h-12 text-xl text-right" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="price" className="text-lg">Precio Ofertado (por Kg)</Label>
                            <Input id="price" type="number" step="50" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="h-12 text-xl text-right" />
                        </div>
                        <Card className="bg-muted/50 p-4">
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Valor Total Ofertado:</span>
                                <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalValue)}</span>
                            </div>
                        </Card>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" size="lg" className="w-full h-14 text-xl" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Scale className="mr-3 h-6 w-6"/> Enviar Oferta</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
      </div>
    </div>
  );
}
