import { notFound } from 'next/navigation';
import { mockProductions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin, Leaf, Sprout, Tractor, Package } from 'lucide-react';

export default function TraceabilityPage({ params }: { params: { id: string } }) {
  const production = mockProductions.find(p => p.traceabilityId === params.id);

  if (!production) {
    return notFound();
  }

  const bannerImage = PlaceHolderImages.find(img => img.id === 'traceability-banner');
  const findImage = (url: string | undefined) => PlaceHolderImages.find(img => img.imageUrl === url);

  return (
    <div className="bg-background min-h-screen">
      <header className="relative h-64">
        {bannerImage && (
          <Image
            src={bannerImage.imageUrl}
            alt="Traceability banner"
            fill
            className="object-cover"
            data-ai-hint={bannerImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h1 className="text-5xl font-bold">Pasaporte del Producto</h1>
            <p className="text-2xl mt-2 font-light">{production.name}</p>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 md:p-8 -mt-16">
        <Card className="shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Información General</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 text-lg">
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8 text-primary"/>
              <div>
                <p className="text-sm text-muted-foreground">Producto</p>
                <p className="font-bold">{production.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tractor className="h-8 w-8 text-primary"/>
              <div>
                <p className="text-sm text-muted-foreground">Productor</p>
                <p className="font-bold">{production.producerName}</p>
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
                <p className="text-sm text-muted-foreground">Siembra</p>
                <p className="font-bold">{new Date(production.startDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
             <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary"/>
              <div>
                <p className="text-sm text-muted-foreground">Cosecha</p>
                <p className="font-bold">{new Date(production.estimatedHarvestDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl">
            <CardHeader>
                <CardTitle className="text-3xl">Línea de Tiempo de Producción</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative border-l-2 border-primary ml-4 pl-8 space-y-12">
                     <div className="absolute -left-4 top-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <Sprout className="h-5 w-5 text-primary-foreground"/>
                    </div>
                    {production.activities.map((activity, index) => {
                        const activityImage = findImage(activity.imageUrl);
                        return (
                             <div key={activity.id} className="relative">
                                <div className="absolute -left-[2.1rem] top-1.5 h-4 w-4 bg-background border-2 border-primary rounded-full" />
                                <p className="font-bold text-primary">{new Date(activity.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <h3 className="text-xl font-headline font-semibold mt-1">{activity.description}</h3>
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
      </main>
    </div>
  );
}
