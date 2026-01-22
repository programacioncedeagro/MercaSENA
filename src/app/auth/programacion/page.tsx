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
import { Loader2, Calendar, ArrowLeft, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña no puede estar vacía.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginProgramacionPage() {
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
        title: 'Acceso Autorizado',
        description: 'Bienvenido al sistema de programación.',
      });

      // Redirigir al panel de administración (donde se ve la programación)
      router.push('/admin');
      
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
        title: 'Error de Acceso',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="w-48 h-auto mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Sistema de Gestión Campesena
          </div>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="h-2 bg-emerald-600 w-full" />
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <CardTitle className="text-2xl text-slate-800">Programación</CardTitle>
                <CardDescription className="text-slate-500">
                  Panel Técnico y Administrativo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Correo Institucional</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input 
                            placeholder="usuario@sena.edu.co" 
                            className="pl-10 h-11 border-slate-200 focus:ring-emerald-500" 
                            {...field} 
                          />
                        </div>
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
                      <FormLabel className="text-slate-700 font-semibold">Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-10 h-11 border-slate-200 focus:ring-emerald-500" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Autenticando...
                    </>
                  ) : (
                    'Entrar al Sistema'
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link href="/auth" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" />
                Volver a la selección de portal
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-xs text-slate-400">
          © 2026 MercaSENA - Sena Regional Boyacá<br/>
          Acceso restringido a instructores y coordinadores autorizados.
        </p>
      </div>
    </div>
  );
}
