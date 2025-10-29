'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Production } from '@/lib/types';
import { Calendar, PlusCircle, TrendingUp, Inbox, Leaf, Drumstick, Loader2, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where } from 'firebase/firestore';

export default function ProductionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const productionsQuery = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'productions'));
  }, [user?.uid, firestore]);

  const { data: productions, isLoading } = useCollection<Production>(productionsQuery);

  const getIcon = (type: 'Agrícola' | 'Pecuario') => {
    if (type === 'Pecuario') return Drumstick;
    return Leaf;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mis Producciones</h1>
          <p className="text-muted-foreground mt-2 text-lg">Gestiona y sigue el progreso de tus cultivos y crías.</p>
        </div>
        <Button asChild size="lg" className="h-14 text-lg w-full sm:w-auto shadow-md">
          <Link href="/productor/produccion/nueva">
            <PlusCircle className="mr-3 h-6 w-6" />
            Nueva Producción
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && productions && productions.length === 0 && (
         <Card className="text-center p-12 col-span-full">
            <CardTitle>Aún no tienes producciones</CardTitle>
            <CardDescription className="mt-4 text-lg">
                ¡Es hora de empezar! Registra tu primer cultivo o cría para poder recibir ofertas.
            </CardDescription>
            <CardFooter className='mt-6 flex justify-center'>
                 <Button asChild size="lg" className="h-14 text-lg shadow-md">
                    <Link href="/productor/produccion/nueva">
                        <PlusCircle className="mr-3 h-6 w-6" />
                        Registrar mi primera producción
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      )}

      {!isLoading && productions && productions.length > 0 && (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {productions.map((prod) => {
            const productImage = PlaceHolderImages.find(p => p.imageUrl === prod.productImage);
            const Icon = getIcon(prod.type);
            return (
              <Card key={prod.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0 relative">
                  {productImage ? (
                      <Image
                        src={productImage.imageUrl}
                        alt={prod.name}
                        width={600}
                        height={400}
                        className="object-cover w-full h-48"
                        data-ai-hint={productImage.imageHint}
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <Icon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <CardTitle className="absolute bottom-0 left-0 p-6 text-3xl font-bold text-white">
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-white" />
                      {prod.name}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-6 space-y-4">
                  <div>
                      <div className='flex justify-between items-center mb-2'>
                          <p className="text-sm font-medium text-muted-foreground">{prod.status}</p>
                          <p className="text-sm font-bold text-primary">{prod.progress}%</p>
                      </div>
                    <Progress value={prod.progress} aria-label={`${prod.progress}% completado`} />
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-5 w-5" />
                    <span>Cosecha estimada: <span className="font-bold text-foreground">{new Date(prod.estimatedHarvestDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-muted/50">
                   <Button asChild className="w-full h-12 text-lg">
                      <Link href={`/productor/produccion/${prod.id}`}>
                        <Eye className="mr-3 h-6 w-6"/>
                        Ver Detalles
                      </Link>
                   </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
