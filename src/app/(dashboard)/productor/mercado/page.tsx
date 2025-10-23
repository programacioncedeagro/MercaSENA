import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProductions } from "@/lib/data";
import type { Offer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Leaf, Check, X, MessageCircle } from "lucide-react";

const statusStyles = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    aceptada: 'bg-green-100 text-green-800 border-green-300',
    rechazada: 'bg-red-100 text-red-800 border-red-300',
    negociación: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function ProducerMarketPage() {
    const allOffers = mockProductions.flatMap(p => p.offers.map(o => ({ ...o, productName: p.name, productIcon: p.icon })));

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Mercado de Ofertas</h1>
                <p className="text-muted-foreground mt-2 text-lg">Revisa y gestiona las ofertas de los compradores.</p>
            </div>

            <div className="space-y-6">
                {allOffers.length > 0 ? allOffers.map(offer => (
                    <Card key={offer.id} className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl mb-1 flex items-center gap-2">
                                        <Leaf className="text-primary h-6 w-6"/>
                                        Oferta para {offer.productName}
                                    </CardTitle>
                                    <CardDescription>De: {offer.buyerName}</CardDescription>
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
        </div>
    );
}
