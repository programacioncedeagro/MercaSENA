'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProductions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, MapPin, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BuyerMarketplacePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Mercado de Futuros</h1>
        <p className="text-muted-foreground mt-2 text-lg">Encuentra y asegura los mejores productos directamente del campo.</p>
      </div>

      <Card className="shadow-lg p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2">
                <label htmlFor="search">Buscar producto</label>
                <Input id="search" placeholder="Ej: Tomate, Lechuga..." className="h-12"/>
            </div>
            <div className="space-y-2">
                <label htmlFor="product-type">Tipo de producto</label>
                 <Select>
                    <SelectTrigger id="product-type" className="h-12"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="agricola">Agrícola</SelectItem>
                        <SelectItem value="pecuario">Pecuario</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label htmlFor="sort-by">Ordenar por</label>
                <Select>
                    <SelectTrigger id="sort-by" className="h-12"><SelectValue placeholder="Fecha de cosecha" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Fecha de cosecha</SelectItem>
                        <SelectItem value="distance">Distancia</SelectItem>
                        <SelectItem value="price">Precio (próximamente)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button size="lg" className="h-12 w-full text-lg"><Search className="mr-2 h-5 w-5"/>Buscar</Button>
        </div>
      </Card>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {mockProductions.map((prod) => {
          const productImage = PlaceHolderImages.find(p => p.imageUrl === prod.productImage);
          return (
            <Card key={prod.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0 relative">
                 {productImage && (
                    <Image
                      src={productImage.imageUrl}
                      alt={prod.name}
                      width={600}
                      height={400}
                      className="object-cover w-full h-48"
                      data-ai-hint={productImage.imageHint}
                    />
                  )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <CardTitle className="absolute bottom-0 left-0 p-6 text-3xl font-bold text-white">
                    {prod.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-6 space-y-4">
                 <CardDescription className="font-bold text-foreground text-lg">
                    Producido por {prod.producerName}
                </CardDescription>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span>{prod.location}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Cosecha estimada: <span className="font-bold text-foreground">{new Date(prod.estimatedHarvestDate).toLocaleDateString('es-CO', { month: 'long', day: 'numeric' })}</span></span>
                </div>
                 <div className="text-sm font-medium">
                    Progreso actual: <span className="font-bold text-primary">{prod.progress}%</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-muted/50">
                <Button asChild className="w-full h-12 text-lg" >
                    <Link href={`/comprador/producto/${prod.id}`}>Ver Producto y Ofertar</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
