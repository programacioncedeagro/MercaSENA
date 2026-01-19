'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tractor, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña no puede estar vacía.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginProductorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.',
      });

      // Redirigir al dashboard del productor
      router.push('/productor');
      
    } catch (error: any) {
      let errorMessage = 'No se pudo iniciar sesión. Por favor, intenta de nuevo.';
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        errorMessage = 'El correo o la contraseña son incorrectos.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Link href="/auth" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <Logo className="w-32 h-auto" />
              <div className="w-9"></div> {/* Spacer for alignment */}
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Tractor className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-800">Iniciar Sesión</CardTitle>
                <CardDescription className="text-green-600">
                  Acceso para Productores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="tu@correo.com" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 space-y-3 text-center text-sm">
              <div>
                ¿No tienes una cuenta de productor?{' '}
                <Link href="/auth/productor/registro" className="font-bold text-green-600 hover:underline">
                  Regístrate aquí
                </Link>
              </div>
              <div className="text-gray-500">
                ¿Eres comprador?{' '}
                <Link href="/auth/comprador/login" className="text-blue-600 hover:underline">
                  Inicia sesión como comprador
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials info */}
        <Card className="mt-4 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Cuenta de prueba:</h4>
            <div className="text-xs text-green-700 space-y-1">
              <div><strong>Email:</strong> productor@test.com</div>
              <div><strong>Contraseña:</strong> test123456</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}