import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tractor, ShoppingCart } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 text-center">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover -z-10"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm -z-10" />

      <div className="flex flex-col items-center justify-center bg-card/80 p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl">
        <Logo className="w-24 h-24 mb-4 text-primary" />

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
          AgroFuturos Conecta
        </h1>
        <p className="mt-4 max-w-md text-lg md:text-xl text-muted-foreground">
          Revolucionando la comercialización agropecuaria. Conectamos directamente a productores y compradores.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <Button asChild size="lg" className="h-16 text-xl w-full sm:w-auto px-10 py-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <Link href="/signup">
              <Tractor className="mr-3 h-8 w-8" />
              Soy Productor
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-16 text-xl w-full sm:w-auto px-10 py-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <Link href="/signup">
              <ShoppingCart className="mr-3 h-8 w-8" />
              Soy Comprador
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
