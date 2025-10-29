'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart, ArrowLeft, MapPin, Phone, User, Building } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';

const compradorSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  apellido: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  confirmPassword: z.string(),
  telefono: z.string().min(10, { message: 'El teléfono debe tener al menos 10 dígitos.' }),
  departamento: z.string().min(1, { message: 'Selecciona tu departamento.' }),
  municipio: z.string().min(2, { message: 'Introduce tu municipio.' }),
  tipoComprador: z.enum(['individual', 'restaurante', 'hotel', 'supermercado', 'distribuidor', 'otro'], {
    required_error: 'Selecciona el tipo de comprador.',
  }),
  nombreEmpresa: z.string().optional(),
  nit: z.string().optional(),
  descripcion: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type CompradorFormValues = z.infer<typeof compradorSchema>;

const departamentos = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas',
  'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca',
  'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño',
  'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia',
  'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
];

export default function RegistroCompradorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CompradorFormValues>({
    resolver: zodResolver(compradorSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      telefono: '',
      departamento: '',
      municipio: '',
      nombreEmpresa: '',
      nit: '',
      descripcion: '',
    },
  });

  const tipoComprador = form.watch('tipoComprador');
  const esEmpresa = tipoComprador && tipoComprador !== 'individual';

  const onSubmit = async (data: CompradorFormValues) => {
    setIsLoading(true);
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Guardar datos del comprador en Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        departamento: data.departamento,
        municipio: data.municipio,
        tipoComprador: data.tipoComprador,
        nombreEmpresa: data.nombreEmpresa || '',
        nit: data.nit || '',
        descripcion: data.descripcion || '',
        role: 'comprador',
        fechaRegistro: new Date().toISOString(),
        estado: 'activo',
      });

      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta de comprador ha sido creada correctamente.',
      });

      // Redirigir al dashboard del comprador
      router.push('/comprador');

    } catch (error: any) {
      let errorMessage = 'No se pudo crear la cuenta. Por favor, intenta de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo electrónico ya está registrado.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error en el registro',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-800">Registro de Comprador</CardTitle>
                <CardDescription className="text-blue-600">
                  Crea tu cuenta para acceder a productos agrícolas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu apellido" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Teléfono
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="3001234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ubicación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Ubicación
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departamentos.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="municipio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Municipio</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu municipio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Tipo de Comprador */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Información Comercial
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="tipoComprador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Comprador</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de comprador" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">Comprador Individual</SelectItem>
                            <SelectItem value="restaurante">Restaurante</SelectItem>
                            <SelectItem value="hotel">Hotel</SelectItem>
                            <SelectItem value="supermercado">Supermercado</SelectItem>
                            <SelectItem value="distribuidor">Distribuidor</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {esEmpresa && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nombreEmpresa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la Empresa</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre de tu empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NIT (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789-1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de tu negocio (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe brevemente tu actividad comercial..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Credenciales */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-800">Credenciales de Acceso</h3>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="tu@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta de Comprador'
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm">
              ¿Ya tienes una cuenta de comprador?{' '}
              <Link href="/auth/comprador/login" className="font-bold text-blue-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}