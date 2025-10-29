import { format, addDays } from 'date-fns';
import type { Activity } from '@/lib/types';

// Definición de actividades por tipo de cultivo
interface CropActivity {
  name: string;
  description: string;
  daysFromStart: number;
  duration: number;
  isKeyMilestone: boolean;
  category: 'preparacion' | 'siembra' | 'cuidado' | 'cosecha' | 'postcosecha';
  equipment?: string[];
  materials?: string[];
  laborRequired?: string[];
}

interface CropTemplate {
  name: string;
  totalDuration: number;
  activities: CropActivity[];
}

// Templates de cultivos comunes en Colombia
const cropTemplates: Record<string, CropTemplate> = {
  // HORTALIZAS
  'tomate': {
    name: 'Tomate',
    totalDuration: 120,
    activities: [
      { name: 'Preparación del terreno', description: 'Limpieza y arado del terreno', daysFromStart: 0, duration: 3, isKeyMilestone: true, category: 'preparacion', equipment: ['Arado', 'Rastrillo'], laborRequired: ['2 operarios'] },
      { name: 'Análisis de suelo', description: 'Toma de muestras y análisis químico del suelo', daysFromStart: 4, duration: 2, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Incorporación de materia orgánica', description: 'Aplicación de compost o abono orgánico', daysFromStart: 7, duration: 2, isKeyMilestone: false, category: 'preparacion', materials: ['Compost 2 ton/ha'] },
      { name: 'Construcción de semillero', description: 'Preparación de semillero en ambiente protegido', daysFromStart: 10, duration: 1, isKeyMilestone: true, category: 'preparacion' },
      { name: 'Siembra en semillero', description: 'Siembra de semillas en bandejas germinadoras', daysFromStart: 12, duration: 1, isKeyMilestone: true, category: 'siembra', materials: ['Semillas certificadas', 'Sustrato'] },
      { name: 'Cuidado de plántulas', description: 'Riego y control de temperatura en semillero', daysFromStart: 13, duration: 25, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Preparación de camas de trasplante', description: 'Preparación del terreno definitivo con surcos', daysFromStart: 30, duration: 2, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Trasplante', description: 'Trasplante de plántulas al terreno definitivo', daysFromStart: 38, duration: 3, isKeyMilestone: true, category: 'siembra', laborRequired: ['4 operarios'] },
      { name: 'Instalación de tutorado', description: 'Colocación de estacas y sistema de soporte', daysFromStart: 42, duration: 2, isKeyMilestone: false, category: 'cuidado', materials: ['Estacas', 'Alambre'] },
      { name: 'Primera fertilización', description: 'Aplicación de fertilizante de crecimiento', daysFromStart: 45, duration: 1, isKeyMilestone: false, category: 'cuidado', materials: ['Fertilizante NPK'] },
      { name: 'Control de malezas', description: 'Deshierbe manual o mecánico', daysFromStart: 50, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Segunda fertilización', description: 'Aplicación de fertilizante de floración', daysFromStart: 60, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control fitosanitario', description: 'Aplicación preventiva de fungicidas e insecticidas', daysFromStart: 65, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Poda de formación', description: 'Eliminación de chupones y hojas innecesarias', daysFromStart: 70, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Inicio de floración', description: 'Monitoreo del inicio de la floración', daysFromStart: 75, duration: 1, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Tercera fertilización', description: 'Aplicación de fertilizante de fructificación', daysFromStart: 80, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Primera cosecha', description: 'Inicio de cosecha de frutos maduros', daysFromStart: 95, duration: 1, isKeyMilestone: true, category: 'cosecha' },
      { name: 'Cosecha continua', description: 'Cosecha escalonada cada 3-4 días', daysFromStart: 96, duration: 20, isKeyMilestone: false, category: 'cosecha' },
      { name: 'Clasificación y empaque', description: 'Selección, clasificación y empaque del producto', daysFromStart: 96, duration: 20, isKeyMilestone: false, category: 'postcosecha' },
      { name: 'Limpieza final', description: 'Retiro de residuos vegetales y preparación para próximo ciclo', daysFromStart: 117, duration: 3, isKeyMilestone: false, category: 'postcosecha' }
    ]
  },
  
  'lechuga': {
    name: 'Lechuga',
    totalDuration: 75,
    activities: [
      { name: 'Preparación del terreno', description: 'Arado y nivelación del suelo', daysFromStart: 0, duration: 2, isKeyMilestone: true, category: 'preparacion' },
      { name: 'Análisis de suelo', description: 'Toma de muestras para análisis químico', daysFromStart: 3, duration: 1, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Incorporación de compost', description: 'Aplicación de materia orgánica', daysFromStart: 5, duration: 1, isKeyMilestone: false, category: 'preparacion', materials: ['Compost 1.5 ton/ha'] },
      { name: 'Preparación de semillero', description: 'Construcción de camas de semillero', daysFromStart: 7, duration: 1, isKeyMilestone: true, category: 'preparacion' },
      { name: 'Siembra en semillero', description: 'Siembra de semillas en bandejas', daysFromStart: 8, duration: 1, isKeyMilestone: true, category: 'siembra' },
      { name: 'Cuidado de plántulas', description: 'Riego y manejo de semillero', daysFromStart: 9, duration: 20, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Preparación de camas definitivas', description: 'Preparación del terreno para trasplante', daysFromStart: 25, duration: 2, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Trasplante', description: 'Trasplante al sitio definitivo', daysFromStart: 28, duration: 2, isKeyMilestone: true, category: 'siembra' },
      { name: 'Primera fertilización', description: 'Aplicación de fertilizante de establecimiento', daysFromStart: 32, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control de malezas', description: 'Deshierbe manual', daysFromStart: 40, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Segunda fertilización', description: 'Aplicación de fertilizante de crecimiento', daysFromStart: 45, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control fitosanitario', description: 'Aplicación preventiva de productos biológicos', daysFromStart: 50, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Monitoreo de crecimiento', description: 'Evaluación del desarrollo del cultivo', daysFromStart: 55, duration: 1, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Cosecha', description: 'Corte de cabezas maduras', daysFromStart: 65, duration: 5, isKeyMilestone: true, category: 'cosecha' },
      { name: 'Lavado y empaque', description: 'Proceso de lavado, desinfección y empaque', daysFromStart: 65, duration: 5, isKeyMilestone: false, category: 'postcosecha' },
      { name: 'Limpieza del lote', description: 'Retiro de residuos y preparación para nuevo ciclo', daysFromStart: 71, duration: 4, isKeyMilestone: false, category: 'postcosecha' }
    ]
  },

  'papa': {
    name: 'Papa',
    totalDuration: 150,
    activities: [
      { name: 'Preparación del terreno', description: 'Arado profundo y surcado', daysFromStart: 0, duration: 5, isKeyMilestone: true, category: 'preparacion', equipment: ['Tractor', 'Arado', 'Surcadora'] },
      { name: 'Análisis de suelo', description: 'Análisis completo de suelo y recomendaciones', daysFromStart: 6, duration: 2, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Preparación de semilla', description: 'Selección y pre-brotado de tubérculos semilla', daysFromStart: 10, duration: 15, isKeyMilestone: true, category: 'preparacion', materials: ['Tubérculos semilla certificados'] },
      { name: 'Fertilización de fondo', description: 'Aplicación de fertilizante al fondo del surco', daysFromStart: 25, duration: 2, isKeyMilestone: false, category: 'preparacion', materials: ['Fertilizante complejo', 'Materia orgánica'] },
      { name: 'Siembra', description: 'Siembra de tubérculos semilla', daysFromStart: 28, duration: 3, isKeyMilestone: true, category: 'siembra', laborRequired: ['6 operarios'] },
      { name: 'Primera emergencia', description: 'Monitoreo de emergencia de plantas', daysFromStart: 45, duration: 5, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Primera cultivada', description: 'Control de malezas y aporque ligero', daysFromStart: 50, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Primera fertilización', description: 'Aplicación de fertilizante nitrogenado', daysFromStart: 55, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control fitosanitario 1', description: 'Aplicación preventiva contra gota', daysFromStart: 60, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Segunda cultivada y aporque', description: 'Control de malezas y aporque medio', daysFromStart: 70, duration: 3, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Segunda fertilización', description: 'Aplicación de fertilizante potásico', daysFromStart: 75, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Inicio de floración', description: 'Monitoreo del inicio de floración', daysFromStart: 80, duration: 1, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Control fitosanitario 2', description: 'Control de gota y plagas', daysFromStart: 85, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Aporque final', description: 'Aporque alto para formación de tubérculos', daysFromStart: 90, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Tercera fertilización', description: 'Aplicación de fertilizante foliar', daysFromStart: 95, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control fitosanitario 3', description: 'Control preventivo de plagas del tubérculo', daysFromStart: 110, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Inicio de senescencia', description: 'Monitoreo del amarillamiento del follaje', daysFromStart: 120, duration: 5, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Corte de follaje', description: 'Eliminación del follaje para maduración', daysFromStart: 130, duration: 2, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Cosecha', description: 'Desenterrado y recolección de tubérculos', daysFromStart: 140, duration: 5, isKeyMilestone: true, category: 'cosecha', laborRequired: ['8 operarios'] },
      { name: 'Secado y curado', description: 'Secado al aire y curado de tubérculos', daysFromStart: 145, duration: 3, isKeyMilestone: false, category: 'postcosecha' },
      { name: 'Clasificación y empaque', description: 'Selección por tamaños y empaque', daysFromStart: 148, duration: 2, isKeyMilestone: false, category: 'postcosecha' }
    ]
  },

  'maiz': {
    name: 'Maíz',
    totalDuration: 140,
    activities: [
      { name: 'Preparación del terreno', description: 'Arado y rastrillado del suelo', daysFromStart: 0, duration: 3, isKeyMilestone: true, category: 'preparacion' },
      { name: 'Análisis de suelo', description: 'Toma de muestras y análisis', daysFromStart: 4, duration: 1, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Surcado', description: 'Formación de surcos para siembra', daysFromStart: 6, duration: 1, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Siembra', description: 'Siembra directa de semillas', daysFromStart: 8, duration: 2, isKeyMilestone: true, category: 'siembra', materials: ['Semilla híbrida certificada'] },
      { name: 'Emergencia', description: 'Monitoreo de germinación', daysFromStart: 18, duration: 3, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Primera fertilización', description: 'Aplicación de fertilizante de arranque', daysFromStart: 25, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control de malezas', description: 'Aplicación de herbicida selectivo', daysFromStart: 30, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Segunda fertilización', description: 'Aplicación de nitrógeno', daysFromStart: 45, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control fitosanitario', description: 'Control de gusano cogollero', daysFromStart: 50, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Aporque', description: 'Acumulación de tierra en la base de plantas', daysFromStart: 60, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Floración masculina', description: 'Aparición de la panoja', daysFromStart: 70, duration: 3, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Floración femenina', description: 'Aparición de sedas en mazorcas', daysFromStart: 75, duration: 3, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Tercera fertilización', description: 'Aplicación foliar de micronutrientes', daysFromStart: 80, duration: 1, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Llenado de grano', description: 'Monitoreo del desarrollo del grano', daysFromStart: 85, duration: 25, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Madurez fisiológica', description: 'Evaluación de madurez del grano', daysFromStart: 120, duration: 5, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Cosecha', description: 'Recolección de mazorcas', daysFromStart: 130, duration: 5, isKeyMilestone: true, category: 'cosecha' },
      { name: 'Secado', description: 'Secado del grano al sol', daysFromStart: 135, duration: 5, isKeyMilestone: false, category: 'postcosecha' }
    ]
  },

  'cafe': {
    name: 'Café',
    totalDuration: 365, // Ciclo anual
    activities: [
      { name: 'Preparación del terreno', description: 'Limpieza y adecuación del lote', daysFromStart: 0, duration: 15, isKeyMilestone: true, category: 'preparacion' },
      { name: 'Análisis de suelo', description: 'Análisis químico completo', daysFromStart: 16, duration: 3, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Ahoyado', description: 'Apertura de hoyos para siembra', daysFromStart: 20, duration: 10, isKeyMilestone: false, category: 'preparacion' },
      { name: 'Siembra de colinos', description: 'Plantación de material vegetativo', daysFromStart: 35, duration: 7, isKeyMilestone: true, category: 'siembra' },
      { name: 'Fertilización inicial', description: 'Primera aplicación de fertilizante', daysFromStart: 45, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control de malezas', description: 'Deshierbe manual y químico', daysFromStart: 60, duration: 30, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Poda de formación', description: 'Formación de la estructura del árbol', daysFromStart: 120, duration: 10, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Segunda fertilización', description: 'Aplicación de fertilizante de crecimiento', daysFromStart: 135, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Control fitosanitario', description: 'Control de broca y roya', daysFromStart: 180, duration: 5, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Floración', description: 'Monitoreo de la floración', daysFromStart: 210, duration: 15, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Tercera fertilización', description: 'Fertilización de producción', daysFromStart: 240, duration: 2, isKeyMilestone: false, category: 'cuidado' },
      { name: 'Desarrollo del fruto', description: 'Monitoreo del crecimiento del fruto', daysFromStart: 270, duration: 30, isKeyMilestone: true, category: 'cuidado' },
      { name: 'Cosecha', description: 'Recolección de café cereza maduro', daysFromStart: 320, duration: 30, isKeyMilestone: true, category: 'cosecha' },
      { name: 'Beneficio húmedo', description: 'Despulpado, fermentado y lavado', daysFromStart: 320, duration: 30, isKeyMilestone: false, category: 'postcosecha' },
      { name: 'Secado', description: 'Secado del café pergamino', daysFromStart: 350, duration: 15, isKeyMilestone: false, category: 'postcosecha' }
    ]
  }
};

// Función para generar actividades basadas en el tipo de cultivo
export function generateCropActivities(
  cropName: string, 
  plantingDate: Date
): Activity[] {
  // Normalizar el nombre del cultivo
  const normalizedCropName = cropName.toLowerCase().trim();
  
  // Buscar template exacto o parcial
  let template = cropTemplates[normalizedCropName];
  
  if (!template) {
    // Buscar coincidencias parciales
    const matchingKey = Object.keys(cropTemplates).find(key => 
      normalizedCropName.includes(key) || key.includes(normalizedCropName)
    );
    
    if (matchingKey) {
      template = cropTemplates[matchingKey];
    }
  }
  
  // Si no hay template específico, usar un template genérico
  if (!template) {
    template = {
      name: 'Cultivo Genérico',
      totalDuration: 120,
      activities: [
        { name: 'Preparación del terreno', description: 'Preparación y adecuación del suelo', daysFromStart: 0, duration: 5, isKeyMilestone: true, category: 'preparacion' },
        { name: 'Análisis de suelo', description: 'Análisis químico y físico del suelo', daysFromStart: 6, duration: 2, isKeyMilestone: false, category: 'preparacion' },
        { name: 'Siembra/Plantación', description: 'Establecimiento del cultivo', daysFromStart: 10, duration: 3, isKeyMilestone: true, category: 'siembra' },
        { name: 'Emergencia/Establecimiento', description: 'Monitoreo de la germinación o prendimiento', daysFromStart: 20, duration: 5, isKeyMilestone: true, category: 'cuidado' },
        { name: 'Primera fertilización', description: 'Aplicación de fertilizantes de establecimiento', daysFromStart: 30, duration: 1, isKeyMilestone: false, category: 'cuidado' },
        { name: 'Control de malezas', description: 'Control mecánico o químico de arvenses', daysFromStart: 40, duration: 3, isKeyMilestone: false, category: 'cuidado' },
        { name: 'Segunda fertilización', description: 'Aplicación de fertilizantes de crecimiento', daysFromStart: 60, duration: 1, isKeyMilestone: false, category: 'cuidado' },
        { name: 'Control fitosanitario', description: 'Control preventivo de plagas y enfermedades', daysFromStart: 70, duration: 2, isKeyMilestone: false, category: 'cuidado' },
        { name: 'Floración/Fructificación', description: 'Monitoreo de la etapa reproductiva', daysFromStart: 80, duration: 10, isKeyMilestone: true, category: 'cuidado' },
        { name: 'Maduración', description: 'Monitoreo de la maduración del producto', daysFromStart: 100, duration: 10, isKeyMilestone: true, category: 'cuidado' },
        { name: 'Cosecha', description: 'Recolección del producto', daysFromStart: 110, duration: 5, isKeyMilestone: true, category: 'cosecha' },
        { name: 'Postcosecha', description: 'Procesamiento y acondicionamiento', daysFromStart: 115, duration: 5, isKeyMilestone: false, category: 'postcosecha' }
      ]
    };
  }
  
  // Convertir las actividades del template a objetos Activity
  const activities: Activity[] = template.activities.map((activity, index) => {
    const activityDate = addDays(plantingDate, activity.daysFromStart);
    
    return {
      id: `activity-${index}`,
      date: activityDate.toISOString(),
      description: `${activity.name}: ${activity.description}`,
      imageUrl: undefined, // Se puede agregar después si se desea
      // Metadatos adicionales para el cronograma
      metadata: {
        name: activity.name,
        duration: activity.duration,
        isKeyMilestone: activity.isKeyMilestone,
        category: activity.category,
        equipment: activity.equipment || [],
        materials: activity.materials || [],
        laborRequired: activity.laborRequired || [],
        daysFromStart: activity.daysFromStart,
        endDate: addDays(activityDate, activity.duration).toISOString()
      }
    };
  });
  
  return activities;
}

// Función para obtener la duración total estimada del cultivo
export function getCropDuration(cropName: string): number {
  const normalizedCropName = cropName.toLowerCase().trim();
  let template = cropTemplates[normalizedCropName];
  
  if (!template) {
    const matchingKey = Object.keys(cropTemplates).find(key => 
      normalizedCropName.includes(key) || key.includes(normalizedCropName)
    );
    if (matchingKey) {
      template = cropTemplates[matchingKey];
    }
  }
  
  return template?.totalDuration || 120; // Default 120 días
}

// Función para obtener las actividades de una categoría específica
export function getActivitiesByCategory(activities: Activity[], category: string): Activity[] {
  return activities.filter(activity => 
    activity.metadata?.category === category
  );
}

// Función para obtener solo los hitos clave
export function getKeyMilestones(activities: Activity[]): Activity[] {
  return activities.filter(activity => 
    activity.metadata?.isKeyMilestone === true
  );
}