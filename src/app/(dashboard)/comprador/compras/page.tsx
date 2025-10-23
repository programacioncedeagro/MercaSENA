'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProductions } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Leaf, Calendar, Info } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const statusStyles = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    aceptada: 'bg-green-100 text-green-800 border-green-300',
    rechazada: 'bg-red-100 text-red-800 border-red-300',
    negociación: 'bg-blue-100 text-blue-800 border-blue-300',
};

// For simulation, we assume all offers belong to one buyer.
// In a real app, this would be filtered by the logged-in user's ID.
export default function MyPurchasesPage() {
    const myOffers = mockProductions.flatMap(p => 
        p.offers.map(o => ({ 
            ...o, 
            productName: p.name, 
            productImage: p.productImage, 
            producerName: p.producerName,
            estimatedHarvestDate: p.estimatedHarvestDate
        }))
    );

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
                                        <p className="font-bold">{offer.amount} kg</p>
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
