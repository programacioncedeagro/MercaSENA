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
import { Loader2, Tractor, ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LocationPicker } from '@/components/location-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';

const productorSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  apellido: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  confirmPassword: z.string(),
  telefono: z.string().min(10, { message: 'El teléfono debe tener al menos 10 dígitos.' }),
  departamento: z.string().min(1, { message: 'Selecciona tu departamento.' }),
  municipio: z.string().min(2, { message: 'Introduce tu municipio.' }),
  coordenadas: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  codigoDivipola: z.string().optional(),
  tipoProductor: z.enum(['agricultura', 'ganaderia', 'mixto'], {
    required_error: 'Selecciona el tipo de producción.',
  }),
  descripcion: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProductorFormValues = z.infer<typeof productorSchema>;

const departamentos = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas',
  'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca',
  'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño',
  'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia',
  'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
];

export default function RegistroProductorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProductorFormValues>({
    resolver: zodResolver(productorSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      telefono: '',
      departamento: '',
      municipio: '',
      descripcion: '',
    },
  });

  // Manejar selección de ubicación
  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    if (location.municipality && location.department) {
      form.setValue('departamento', location.department.name);
      form.setValue('municipio', location.municipality.name);
      form.setValue('coordenadas', {
        lat: location.coordinates[0],
        lng: location.coordinates[1]
      });
      form.setValue('codigoDivipola', location.municipality.id);
    }
  };

  const onSubmit = async (data: ProductorFormValues) => {
    setIsLoading(true);
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Guardar datos del productor en Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        departamento: data.departamento,
        municipio: data.municipio,
        coordenadas: data.coordenadas || null,
        codigoDivipola: data.codigoDivipola || null,
        tipoProductor: data.tipoProductor,
        descripcion: data.descripcion || '',
        role: 'productor',
        fechaRegistro: new Date().toISOString(),
        estado: 'activo',
      });

      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta de productor ha sido creada correctamente.',
      });

      // Redirigir al dashboard del productor
      router.push('/productor');

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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
              <div className="p-3 bg-green-100 rounded-full">
                <Tractor className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-800">Registro de Productor</CardTitle>
                <CardDescription className="text-green-600">
                  Crea tu cuenta para comenzar a vender tus productos
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
                    Ubicación de tu Finca
                  </h3>
                  
                  {/* Selector de ubicación con mapa */}
                  <LocationPicker 
                    onLocationSelect={handleLocationSelect}
                    className="mb-4"
                  />
                  
                  {/* Campos tradicionales como backup */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Departamento" 
                              {...field}
                              readOnly={!!selectedLocation?.department}
                              className={selectedLocation?.department ? 'bg-muted' : ''}
                            />
                          </FormControl>
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
                            <Input 
                              placeholder="Municipio" 
                              {...field}
                              readOnly={!!selectedLocation?.municipality}
                              className={selectedLocation?.municipality ? 'bg-muted' : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {selectedLocation?.coordinates && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        📍 Ubicación georreferenciada
                      </p>
                      <p className="text-xs text-green-600">
                        Coordenadas: {selectedLocation.coordinates[0].toFixed(6)}, {selectedLocation.coordinates[1].toFixed(6)}
                      </p>
                      {selectedLocation.municipality && (
                        <p className="text-xs text-green-600">
                          DIVIPOLA: {selectedLocation.municipality.id}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tipo de Producción */}
                <FormField
                  control={form.control}
                  name="tipoProductor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Producción</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu tipo de producción" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[100]">
                          <SelectItem value="agricultura">🌾 Agricultura</SelectItem>
                          <SelectItem value="ganaderia">🐄 Ganadería</SelectItem>
                          <SelectItem value="mixto">🌾🐄 Mixto (Agricultura y Ganadería)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de tu producción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe brevemente tu actividad productiva..."
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
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta de Productor'
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm">
              ¿Ya tienes una cuenta de productor?{' '}
              <Link href="/auth/productor/login" className="font-bold text-green-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}