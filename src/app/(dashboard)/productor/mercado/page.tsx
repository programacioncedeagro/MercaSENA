'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Leaf, Check, X, MessageCircle, Loader2 } from "lucide-react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import type { Offer, Production } from "@/lib/types";
import { useState, useEffect } from "react";

const statusStyles = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    aceptada: 'bg-green-100 text-green-800 border-green-300',
    rechazada: 'bg-red-100 text-red-800 border-red-300',
    negociación: 'bg-blue-100 text-blue-800 border-blue-300',
};

type OfferWithDetails = Offer & { productName: string };

export default function ProducerMarketPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    
    const offersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'offers'), where('producerId', '==', user.uid));
    }, [user, firestore]);

    const { data: offers, isLoading } = useCollection<Offer>(offersQuery);
    const [offersWithDetails, setOffersWithDetails] = useState<OfferWithDetails[]>([]);

    useEffect(() => {
        if (!offers || !firestore || !user) return;

        const fetchProductDetails = async () => {
            const detailedOffers = await Promise.all(
                offers.map(async (offer) => {
                    try {
                        const productRef = doc(firestore, `users/${user.uid}/productions/${offer.productId}`);
                        const productSnap = await getDoc(productRef);
                        const productName = productSnap.exists() ? (productSnap.data() as Production).name : 'Producto Desconocido';
                        return { ...offer, productName };
                    } catch (e) {
                        console.error("Error fetching product name for offer:", e);
                        return { ...offer, productName: 'Error al cargar' };
                    }
                })
            );
            setOffersWithDetails(detailedOffers);
        };

        fetchProductDetails();
    }, [offers, firestore, user]);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Mercado de Ofertas</h1>
                <p className="text-muted-foreground mt-2 text-lg">Revisa y gestiona las ofertas de los compradores.</p>
            </div>

            {isLoading && <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}

            {!isLoading && (
                <div className="space-y-6">
                    {offersWithDetails.length > 0 ? offersWithDetails.map(offer => (
                        <Card key={offer.id} className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl mb-1 flex items-center gap-2">
                                            <Leaf className="text-primary h-6 w-6"/>
                                            Oferta para {offer.productName}
                                        </CardTitle>
                                        <CardDescription>De: {offer.buyerName || "Comprador Anónimo"}</CardDescription>
                                    </div>
                                    <Badge className={cn("text-sm capitalize", statusStyles[offer.status])}>
                                        {offer.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-3 gap-4 text-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cantidad</p>
                                    <p className="font-bold">{offer.amount} kg</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Precio/kg</p>
                                    <p className="font-bold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(offer.pricePerUnit)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Valor Total</p>
                                    <p className="font-bold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(offer.amount * offer.pricePerUnit)}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-4">
                                <Button size="lg" className="h-12 text-lg flex-grow sm:flex-grow-0">
                                    <Check className="mr-2 h-5 w-5"/> Aceptar
                                </Button>
                                <Button size="lg" variant="secondary" className="h-12 text-lg flex-grow sm:flex-grow-0">
                                    <MessageCircle className="mr-2 h-5 w-5"/> Negociar
                                </Button>
                                <Button size="lg" variant="destructive" className="h-12 text-lg flex-grow sm:flex-grow-0">
                                    <X className="mr-2 h-5 w-5"/> Rechazar
                                </Button>
                            </CardFooter>
                        </Card>
                    )) : (
                        <Card className="text-center p-12">
                            <CardTitle>No hay ofertas</CardTitle>
                            <CardDescription className="mt-2">Aún no has recibido ofertas por tus productos.</CardDescription>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
