'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Bot, Loader2, Wand2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { getHarvestEstimateAction } from '@/app/actions';
import type { ProjectedHarvestEstimatesOutput } from '@/ai/flows/projected-harvest-estimates';

const productionSchema = z.object({
  cropType: z.string().min(1, 'El tipo de cultivo es requerido.'),
  plantingDate: z.date({ required_error: 'La fecha de siembra es requerida.' }),
  location: z.string().min(1, 'La ubicación es requerida.'),
  area: z.coerce.number().min(0.1, 'El área debe ser mayor a 0.'),
});

type ProductionFormValues = z.infer<typeof productionSchema>;

export default function NewProductionPage() {
  const { toast } = useToast();
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationResult, setEstimationResult] = useState<ProjectedHarvestEstimatesOutput | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ProductionFormValues>({
    resolver: zodResolver(productionSchema),
  });
  
  const watchedFields = watch();

  const handleEstimate: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    const { cropType, plantingDate, location } = watchedFields;

    if (!cropType || !plantingDate || !location) {
      toast({
        variant: "destructive",
        title: "Faltan datos para la estimación",
        description: "Por favor, completa el tipo de cultivo, la fecha de siembra y la ubicación.",
      });
      return;
    }

    setIsEstimating(true);
    setEstimationResult(null);

    const result = await getHarvestEstimateAction({
      cropType,
      plantingDate: format(plantingDate, 'yyyy-MM-dd'),
      location,
    });

    setIsEstimating(false);

    if (result.success && result.data) {
      setEstimationResult(result.data);
      toast({
        title: "Estimación Exitosa",
        description: `Fecha de cosecha estimada: ${format(new Date(result.data.estimatedHarvestDate), 'PPP', { locale: es })}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error en la estimación",
        description: result.error,
      });
    }
  };

  const onSubmit: SubmitHandler<ProductionFormValues> = (data) => {
    console.log(data, estimationResult);
    toast({
      title: 'Producción Registrada (Simulación)',
      description: `Se ha registrado el cultivo de ${data.cropType}.`,
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Registrar Nueva Producción</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Ingresa los detalles de tu nuevo cultivo o cría para empezar a recibir ofertas.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos esenciales de la producción.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="cropType">Tipo de Producto</Label>
              <Select onValueChange={(value) => control._formValues.cropType = value}>
                <SelectTrigger id="cropType">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tomate">Tomate</SelectItem>
                  <SelectItem value="Lechuga">Lechuga</SelectItem>
                  <SelectItem value="Papa">Papa</SelectItem>
                  <SelectItem value="Pollo">Pollo</SelectItem>
                  <SelectItem value="Maiz">Maíz</SelectItem>
                </SelectContent>
              </Select>
              {errors.cropType && <p className="text-destructive text-sm">{errors.cropType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación (Municipio, Departamento)</Label>
              <Input id="location" placeholder="Ej: Villa de Leyva, Boyacá" {...register('location')} />
              {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plantingDate">Fecha de Siembra/Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-12 text-base">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedFields.plantingDate ? format(watchedFields.plantingDate, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedFields.plantingDate}
                    onSelect={(date) => control._formValues.plantingDate = date}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              {errors.plantingDate && <p className="text-destructive text-sm">{errors.plantingDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área (hectáreas) o Cantidad (unidades)</Label>
              <Input id="area" type="number" step="0.1" placeholder="Ej: 2.5" {...register('area')} />
              {errors.area && <p className="text-destructive text-sm">{errors.area.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary"/> Proyecciones con IA
            </CardTitle>
            <CardDescription>
              Usa nuestra inteligencia artificial para estimar la fecha de cosecha.
            </CardDescription>
          </Header>
          <CardContent className="space-y-6">
            <Button
              onClick={handleEstimate}
              disabled={isEstimating || !watchedFields.cropType || !watchedFields.plantingDate || !watchedFields.location}
              className="w-full h-14 text-lg"
            >
              {isEstimating ? (
                <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Estimando...</>
              ) : (
                <><Wand2 className="mr-2 h-6 w-6" /> Estimar Cosecha con IA</>
              )}
            </Button>
            {estimationResult && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
                 <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle className="text-primary"/> ¡Estimación Lista!</h3>
                 <p><strong>Fecha de Cosecha Estimada:</strong> {format(new Date(estimationResult.estimatedHarvestDate), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}</p>
                 <p><strong>Nivel de Confianza:</strong> {estimationResult.confidenceLevel}</p>
                 <div>
                    <strong>Justificación:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{estimationResult.reasoning}</p>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="h-16 text-xl min-w-[200px]">
            Registrar Producción
          </Button>
        </div>
      </form>
    </div>
  );
}
