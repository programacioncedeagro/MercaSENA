'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Leaf, Calendar, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import type { Offer, Production } from "@/lib/types";
import { useEffect, useState } from "react";

const statusStyles = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    aceptada: 'bg-green-100 text-green-800 border-green-300',
    rechazada: 'bg-red-100 text-red-800 border-red-300',
    negociación: 'bg-blue-100 text-blue-800 border-blue-300',
};

type OfferWithDetails = Offer & {
    productName: string;
    productImage?: string;
    producerName: string;
    estimatedHarvestDate: string;
};


export default function MyPurchasesPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [myOffers, setMyOffers] = useState<OfferWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !firestore) return;

        const fetchOffers = async () => {
            setIsLoading(true);
            const offersQuery = query(collection(firestore, 'offers'), where('buyerId', '==', user.uid));
            const offersSnapshot = await getDocs(offersQuery);
            const offers: OfferWithDetails[] = [];

            for (const offerDoc of offersSnapshot.docs) {
                const offerData = offerDoc.data() as Offer;
                
                // Firestore paths can't be fetched directly like this, need to traverse.
                // This is a simplification. A real app might need a denormalized product reference.
                try {
                    const productRef = doc(firestore, `productions/${offerData.productId}`);
                    const productionDoc = (await getDocs(query(collection(firestore, 'users').withConverter({fromFirestore: (snapshot): {id: string, name: string} => ({id: snapshot.id, name: snapshot.data().name}), toFirestore: (model) => model}), where('__name__', '==', offerData.producerId)))).docs[0];

                    const productionSnap = await getDocs(query(collection(firestore, `users/${productionDoc.id}/productions`), where('__name__', '==', offerData.productId)));
                    if (!productionSnap.empty) {
                        const productionData = productionSnap.docs[0].data() as Production;
                         offers.push({
                            ...offerData,
                            id: offerDoc.id,
                            productName: productionData.name,
                            productImage: productionData.productImage,
                            producerName: productionDoc.data().name,
                            estimatedHarvestDate: productionData.estimatedHarvestDate,
                        });
                    }
                } catch(e) {
                    console.error("Error fetching related product data for offer:", e)
                }
            }
            
            setMyOffers(offers);
            setIsLoading(false);
        };

        fetchOffers();

    }, [user, firestore]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Mis Compras y Ofertas</h1>
                <p className="text-muted-foreground mt-2 text-lg">Sigue el estado de tus ofertas y futuras compras.</p>
            </div>

             <div className="space-y-6">
                {myOffers.length > 0 ? myOffers.map(offer => {
                    const productImage = PlaceHolderImages.find(p => p.imageUrl === offer.productImage);
                    return (
                        <Card key={offer.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col sm:flex-row overflow-hidden">
                           {productImage && (
                                <div className="relative sm:w-1/3">
                                    <Image 
                                        src={productImage.imageUrl}
                                        alt={offer.productName}
                                        width={400}
                                        height={400}
                                        className="object-cover w-full h-48 sm:h-full"
                                        data-ai-hint={productImage.imageHint}
                                    />
                                </div>
                           )}
                            <div className="flex flex-col flex-grow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-2xl mb-1 flex items-center gap-2">
                                                <Leaf className="text-primary h-6 w-6"/>
                                                {offer.productName}
                                            </CardTitle>
                                            <CardDescription>De: {offer.producerName}</CardDescription>
                                        </div>
                                        <Badge className={cn("text-sm capitalize", statusStyles[offer.status])}>
                                            {offer.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid sm:grid-cols-2 gap-4 text-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cantidad Ofertada</p>
                                        <p className="font-bold">{offer.pricePerUnit} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Precio Ofertado/kg</p>
                                        <p className="font-bold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(offer.pricePerUnit)}</p>
                                    </div>
                                     <div className="flex items-center text-muted-foreground">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        <span>Cosecha: {new Date(offer.estimatedHarvestDate).toLocaleDateString('es-CO', { month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    )
                }) : (
                     <Card className="text-center p-12">
                        <CardTitle>No has realizado ofertas</CardTitle>
                        <CardDescription className="mt-2">Explora el mercado para encontrar productos y asegurar tu cosecha.</CardDescription>
                    </Card>
                )}
            </div>
        </div>
    )
}
