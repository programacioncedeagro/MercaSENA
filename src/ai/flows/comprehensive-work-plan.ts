import { 
  CropRecommendationOutput 
} from './ai-powered-crop-recommendations';
import { ai } from '../genkit';
import { z } from 'zod';

// Interfaces auxiliares
export interface GeneratedImage {
  base64: string;
  description: string;
  phase: string;
  size: number; // bytes
}

// Esquemas de validación
const WorkPlanPhaseSchema = z.object({
  name: z.string(),
  duration: z.number(),
  dependencies: z.array(z.string()),
  activities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    duration: z.number(),
    cost: z.number(),
    materials: z.array(z.string()),
    equipment: z.array(z.string()),
    labor: z.array(z.string()),
    techniques: z.array(z.string()),
  })),
  criticalPath: z.boolean(),
  estimatedCost: z.number(),
  resources: z.array(z.object({
    name: z.string(),
    type: z.enum(['material', 'equipment', 'labor', 'service']),
    quantity: z.number(),
    unit: z.string(),
    unitCost: z.number(),
    totalCost: z.number(),
    supplier: z.string().optional(),
  })),
});

const ComprehensiveWorkPlanSchema = z.object({
  projectName: z.string(),
  cropType: z.string(),
  area: z.number(),
  location: z.string(),
  totalDuration: z.number(),
  totalInvestment: z.number(),
  
  mano_de_obra: z.object({
    description: z.string(),
    requirements: z.array(z.string()),
    costs: z.number(),
    recommendations: z.array(z.string()),
  }),
  maquinaria: z.object({
    description: z.string(),
    equipment: z.array(z.string()),
    costs: z.number(),
    recommendations: z.array(z.string()),
  }),
  materiales: z.object({
    description: z.string(),
    inputs: z.array(z.string()),
    costs: z.number(),
    recommendations: z.array(z.string()),
  }),
  metodos: z.object({
    description: z.string(),
    techniques: z.array(z.string()),
    procedures: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  medio_ambiente: z.object({
    description: z.string(),
    conditions: z.array(z.string()),
    risks: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),

  // Cronograma detallado con actividades específicas
  cronograma: z.object({
    totalDays: z.number(),
    phases: z.array(z.object({
      name: z.string(),
      description: z.string(),
      startDay: z.number(),
      duration: z.number(),
      category: z.enum(['preparacion', 'siembra', 'mantenimiento', 'cosecha', 'postcosecha']),
      activities: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        day: z.number(),
        duration: z.number(),
        category: z.enum(['preparacion', 'siembra', 'mantenimiento', 'cosecha', 'postcosecha']),
        isKeyMilestone: z.boolean(),
        materials: z.array(z.string()),
        equipment: z.array(z.string()),
        labor: z.array(z.string()),
        estimatedCost: z.number(),
        weatherDependency: z.boolean(),
        criticalActivity: z.boolean(),
      })),
    })),
    keyMilestones: z.array(z.object({
      name: z.string(),
      day: z.number(),
      description: z.string(),
      category: z.string(),
    })),
  }),

  // Lista de chequeo detallada
  listaChequeo: z.object({
    categorias: z.object({
      preparacion: z.object({
        nombre: z.string(),
        descripcion: z.string(),
        items: z.array(z.object({
          id: z.string(),
          tarea: z.string(),
          descripcion: z.string(),
          dia: z.number(),
          prioridad: z.enum(['alta', 'media', 'baja']),
          tiempo_estimado: z.string(),
          recursos_necesarios: z.array(z.string()),
          criterios_calidad: z.array(z.string()),
          observaciones: z.string().optional(),
        })),
      }),
      siembra: z.object({
        nombre: z.string(),
        descripcion: z.string(),
        items: z.array(z.object({
          id: z.string(),
          tarea: z.string(),
          descripcion: z.string(),
          dia: z.number(),
          prioridad: z.enum(['alta', 'media', 'baja']),
          tiempo_estimado: z.string(),
          recursos_necesarios: z.array(z.string()),
          criterios_calidad: z.array(z.string()),
          observaciones: z.string().optional(),
        })),
      }),
      mantenimiento: z.object({
        nombre: z.string(),
        descripcion: z.string(),
        items: z.array(z.object({
          id: z.string(),
          tarea: z.string(),
          descripcion: z.string(),
          dia: z.number(),
          prioridad: z.enum(['alta', 'media', 'baja']),
          tiempo_estimado: z.string(),
          recursos_necesarios: z.array(z.string()),
          criterios_calidad: z.array(z.string()),
          observaciones: z.string().optional(),
        })),
      }),
      cosecha: z.object({
        nombre: z.string(),
        descripcion: z.string(),
        items: z.array(z.object({
          id: z.string(),
          tarea: z.string(),
          descripcion: z.string(),
          dia: z.number(),
          prioridad: z.enum(['alta', 'media', 'baja']),
          tiempo_estimado: z.string(),
          recursos_necesarios: z.array(z.string()),
          criterios_calidad: z.array(z.string()),
          observaciones: z.string().optional(),
        })),
      }),
      postcosecha: z.object({
        nombre: z.string(),
        descripcion: z.string(),
        items: z.array(z.object({
          id: z.string(),
          tarea: z.string(),
          descripcion: z.string(),
          dia: z.number(),
          prioridad: z.enum(['alta', 'media', 'baja']),
          tiempo_estimado: z.string(),
          recursos_necesarios: z.array(z.string()),
          criterios_calidad: z.array(z.string()),
          observaciones: z.string().optional(),
        })),
      }),
    }),
    totalItems: z.number(),
    itemsPorCategoria: z.object({
      preparacion: z.number(),
      siembra: z.number(),
      mantenimiento: z.number(),
      cosecha: z.number(),
      postcosecha: z.number(),
    }),
  }),

  phases: z.array(WorkPlanPhaseSchema),
  criticalPath: z.array(z.string()),
  timeline: z.array(z.object({
    phase: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  })),
  
  marketAnalysis: z.object({
    currentPrice: z.number(),
    historicalPrices: z.array(z.object({
      month: z.string(),
      price: z.number(),
    })),
    demand: z.enum(['Baja', 'Media', 'Alta']),
    competition: z.enum(['Baja', 'Media', 'Alta']),
    bestMarkets: z.array(z.string()),
    seasonalTrends: z.string(),
    marketingRecommendations: z.array(z.string()),
  }),
  
  profitabilityAnalysis: z.object({
    totalInvestment: z.number(),
    totalExpenses: z.number(),
    estimatedRevenue: z.number(),
    grossProfit: z.number(),
    netProfit: z.number(),
    profitMargin: z.number(),
    breakEvenPoint: z.number(),
    roi: z.number(),
    paybackPeriod: z.number(),
  }),
  
  agroindustrialProcessing: z.object({
    processes: z.array(z.object({
      name: z.string(),
      description: z.string(),
      equipment: z.array(z.string()),
      process: z.array(z.string()),
      output: z.string(),
      valueIncrease: z.number(),
      investmentRequired: z.number(),
    })),
    valueAddition: z.number(),
    requiredInvestment: z.number(),
    newMarkets: z.array(z.string()),
    shelfLife: z.string(),
    qualityStandards: z.array(z.string()),
  }),
  
  technicalRecommendations: z.array(z.string()),
  riskMitigation: z.array(z.string()),
  qualityControlPoints: z.array(z.string()),
  sustainabilityPractices: z.array(z.string()),
  
  generatedImages: z.array(z.object({
    base64: z.string(),
    description: z.string(),
    phase: z.string(),
    size: z.number(),
  })),
  
  generatedAt: z.string(),
  confidenceLevel: z.number(),
});

// Función para generar imágenes con IA
async function generateImages(cropType: string, area: number, location: string): Promise<GeneratedImage[]> {
  try {
    // Por ahora, creamos imágenes placeholder ya que la generación de imágenes requiere 
    // configuración adicional y tokens específicos
    const imagePrompts = [
      {
        description: 'Preparación del terreno',
        phase: 'Preparación',
        prompt: `Preparación del terreno para cultivo de ${cropType} en ${location}, Colombia. Maquinaria agrícola trabajando la tierra, suelo bien preparado, paisaje rural colombiano realista.`
      },
      {
        description: 'Proceso de siembra',
        phase: 'Siembra',
        prompt: `Siembra de ${cropType} en campo agrícola colombiano. Trabajadores sembrando, semillas, surcos ordenados, técnicas modernas de siembra, ambiente rural de ${location}.`
      },
      {
        description: 'Mantenimiento del cultivo',
        phase: 'Mantenimiento',
        prompt: `Mantenimiento y cuidado del cultivo de ${cropType}. Plantas creciendo saludables, riego, fertilización, trabajadores aplicando cuidados, campo verde próspero.`
      },
      {
        description: 'Proceso de cosecha',
        phase: 'Cosecha',
        prompt: `Cosecha de ${cropType} en Colombia. Trabajadores recolectando productos maduros, canastas llenas, maquinaria de cosecha, productos de calidad, satisfacción del agricultor.`
      }
    ];

    // Crear imágenes placeholder con información de los prompts
    // En el futuro, aquí se integraría con el servicio de generación de imágenes
    const images: GeneratedImage[] = imagePrompts.map((prompt, index) => {
      // Crear un placeholder base64 pequeño (1x1 pixel transparente)
      const placeholderBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
      
      return {
        base64: placeholderBase64,
        description: prompt.description,
        phase: prompt.phase,
        size: 100 // tamaño pequeño para el placeholder
      };
    });

    console.log(`Generadas ${images.length} imágenes placeholder para ${cropType}`);
    return images;
    
  } catch (error) {
    console.error('Error generando imágenes:', error);
    return [];
  }
}

// Flujo principal para generar plan de trabajo completo
export const comprehensiveWorkPlanFlow = ai.defineFlow(
  {
    name: 'comprehensiveWorkPlan',
    inputSchema: z.object({
      cropType: z.string().describe('Tipo de cultivo o producción'),
      area: z.number().describe('Área en hectáreas'),
      location: z.string().describe('Ubicación geográfica'),
      plantingDate: z.string().describe('Fecha de siembra en formato YYYY-MM-DD'),
      budget: z.number().optional().describe('Presupuesto disponible'),
      experience: z.enum(['Principiante', 'Intermedio', 'Avanzado']).optional().describe('Nivel de experiencia del productor'),
    }),
    outputSchema: ComprehensiveWorkPlanSchema,
  },
  async ({ cropType, area, location, plantingDate, budget, experience = 'Intermedio' }) => {
    const prompt = `
Como experto agrónomo especializado en Colombia, genera un plan de trabajo COMPLETO y DETALLADO para la producción de ${cropType} en ${area} hectáreas en ${location}, iniciando el ${plantingDate}.

Usa la METODOLOGÍA 5M (Mano de obra, Maquinaria, Materiales, Métodos, Medio ambiente) como base estructural.

El productor tiene nivel ${experience}${budget ? ` con presupuesto de $${budget.toLocaleString()} COP` : ''}.

GENERA UN ANÁLISIS COMPLETO que incluya:

## 1. METODOLOGÍA 5M

### MANO DE OBRA:
- Descripción de personal necesario
- Requerimientos específicos de capacitación
- Costos de mano de obra detallados
- Recomendaciones para optimización

### MAQUINARIA:
- Equipos necesarios por fase
- Costos de alquiler/compra
- Recomendaciones de proveedores locales
- Alternativas según presupuesto

### MATERIALES:
- Insumos por fase (semillas, fertilizantes, agroquímicos)
- Cantidades exactas por hectárea
- Costos detallados con proveedores
- Recomendaciones de calidad/precio

### MÉTODOS:
- Técnicas de siembra específicas para ${cropType}
- Procedimientos paso a paso
- Mejores prácticas para ${location}
- Cronograma de actividades

### MEDIO AMBIENTE:
- Condiciones climáticas ideales
- Riesgos ambientales específicos
- Recomendaciones de sostenibilidad
- Manejo integrado de plagas

## 2. CRONOGRAMA Y RUTA CRÍTICA
Genera fases detalladas con:
- Duración exacta en días
- Dependencias entre actividades
- Identificación de ruta crítica
- Cronograma con fechas específicas

## 3. ANÁLISIS DE MERCADO
- Precios actuales de ${cropType} en Colombia
- Análisis de demanda y competencia
- Mejores mercados y canales de venta
- Tendencias estacionales
- Estrategias de comercialización

## 4. ANÁLISIS DE RENTABILIDAD
- Inversión total detallada
- Costos operativos por fase
- Ingresos proyectados por escenarios
- Punto de equilibrio
- ROI y período de recuperación
- Análisis de sensibilidad

## 5. AGROINDUSTRIALIZACIÓN
- Procesos de valor agregado
- Equipos necesarios
- Inversión requerida
- Nuevos mercados potenciales
- Estándares de calidad

## 6. RECOMENDACIONES TÉCNICAS
- Puntos críticos de control de calidad
- Mitigación de riesgos
- Prácticas sostenibles
- Certificaciones recomendadas

Responde en español con terminología técnica precisa pero explicada de manera sencilla para agricultores. Incluye datos numéricos específicos y realistas para el contexto colombiano.

IMPORTANTE: Todos los costos deben estar en pesos colombianos (COP) y ser realistas para 2025.
`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 8000,
      },
    });

    // Generar imágenes en paralelo
    const generatedImages = await generateImages(cropType, area, location);

    // Procesar y estructurar la respuesta
    const currentDate = new Date().toISOString();
    
    // Aquí procesaríamos la respuesta del LLM y la estructuraríamos
    // Por simplicidad, crearemos una estructura básica que se puede expandir
    
    const workPlan: ComprehensiveWorkPlanOutput = {
      projectName: `Producción de ${cropType} - ${location}`,
      cropType,
      area,
      location,
      totalDuration: cropType.toLowerCase().includes('papa') ? 120 : 
                     cropType.toLowerCase().includes('maíz') ? 150 :
                     cropType.toLowerCase().includes('frijol') ? 90 : 180,
      totalInvestment: area * (cropType.toLowerCase().includes('papa') ? 8000000 : 
                              cropType.toLowerCase().includes('maíz') ? 6000000 : 5000000),
      
      mano_de_obra: {
        description: `Personal necesario para ${area} hectáreas de ${cropType}`,
        requirements: [
          "Operarios especializados en preparación de suelo",
          "Personal capacitado en siembra y mantenimiento", 
          "Supervisor técnico con experiencia en el cultivo",
          "Trabajadores para cosecha y postcosecha"
        ],
        costs: area * 2500000,
        recommendations: [
          "Capacitar personal en buenas prácticas agrícolas",
          "Implementar sistema de incentivos por productividad",
          "Asegurar cumplimiento de normas laborales"
        ]
      },
      
      maquinaria: {
        description: `Equipos necesarios para el ciclo productivo de ${cropType}`,
        equipment: [
          "Tractor con implementos de labranza",
          "Sembradora específica para el cultivo",
          "Sistema de riego por goteo/aspersión",
          "Fumigadora de precisión",
          "Equipos de cosecha"
        ],
        costs: area * 1800000,
        recommendations: [
          "Evaluar alquiler vs compra según frecuencia de uso",
          "Mantener calendario de mantenimiento preventivo",
          "Capacitar operadores en uso eficiente"
        ]
      },
      
      materiales: {
        description: `Insumos requeridos para ${area} hectáreas`,
        inputs: [
          `Semilla certificada de ${cropType}`,
          "Fertilizantes NPK según análisis de suelo",
          "Correctivos de acidez (cal agrícola)",
          "Fungicidas e insecticidas",
          "Materiales de riego y tutoreo"
        ],
        costs: area * 3200000,
        recommendations: [
          "Realizar análisis de suelo antes de comprar fertilizantes",
          "Comprar semillas certificadas de proveedores confiables",
          "Almacenar insumos en condiciones adecuadas"
        ]
      },
      
      metodos: {
        description: `Técnicas especializadas para ${cropType} en ${location}`,
        techniques: [
          "Preparación del terreno con labranza mínima",
          "Siembra en surcos con distanciamiento óptimo",
          "Manejo integrado de plagas y enfermedades",
          "Riego tecnificado por demanda hídrica",
          "Cosecha en momento óptimo de madurez"
        ],
        procedures: [
          "1. Análisis de suelo y diseño del lote",
          "2. Preparación con arado y rastrillado",
          "3. Marcado de surcos según diseño",
          "4. Siembra con densidad recomendada",
          "5. Aplicación de riego y fertilización",
          "6. Monitoreo fitosanitario semanal",
          "7. Cosecha y manejo postcosecha"
        ],
        recommendations: [
          "Seguir las recomendaciones técnicas del ICA",
          "Llevar registros detallados de todas las actividades",
          "Implementar rotación de cultivos"
        ]
      },
      
      medio_ambiente: {
        description: `Condiciones ambientales para ${cropType} en ${location}`,
        conditions: [
          `Temperatura óptima: 18-24°C para ${cropType}`,
          "Precipitación requerida: 800-1200mm anuales",
          "Humedad relativa: 60-80%",
          "Altitud adecuada según zona de cultivo",
          "Suelos franco-arcillosos con buen drenaje"
        ],
        risks: [
          "Heladas en épocas frías",
          "Exceso de lluvias en temporada húmeda",
          "Sequías prolongadas",
          "Plagas y enfermedades según época",
          "Vientos fuertes que afecten el cultivo"
        ],
        recommendations: [
          "Instalar estación meteorológica básica",
          "Implementar sistema de alertas climáticas",
          "Usar variedades resistentes a condiciones locales",
          "Aplicar prácticas de conservación de suelos"
        ]
      },

      // Cronograma detallado específico para el cultivo
      cronograma: {
        totalDays: cropType.toLowerCase().includes('papa') ? 120 : 
                   cropType.toLowerCase().includes('maíz') ? 150 :
                   cropType.toLowerCase().includes('café') ? 365 :
                   cropType.toLowerCase().includes('lechuga') ? 75 : 180,
        phases: [
          {
            name: "Preparación del terreno",
            description: "Análisis de suelo, limpieza y preparación del lote para siembra",
            startDay: 1,
            duration: 15,
            category: 'preparacion' as const,
            activities: [
              {
                id: "prep_001",
                name: "Análisis de suelo",
                description: "Toma de muestras y análisis físico-químico del terreno",
                day: 1,
                duration: 3,
                category: 'preparacion' as const,
                isKeyMilestone: true,
                materials: ["Kit de muestreo", "Bolsas plásticas", "Etiquetas"],
                equipment: ["Barreno", "GPS", "Cámara"],
                labor: ["Técnico agropecuario", "Asistente de campo"],
                estimatedCost: 150000,
                weatherDependency: false,
                criticalActivity: true,
              },
              {
                id: "prep_002", 
                name: "Limpieza del terreno",
                description: "Remoción de malezas, piedras y residuos vegetales",
                day: 4,
                duration: 5,
                category: 'preparacion' as const,
                isKeyMilestone: false,
                materials: ["Combustible", "Aceite hidráulico"],
                equipment: ["Tractor", "Guadañadora", "Rastrillo"],
                labor: ["Operador de tractor", "Trabajadores de campo"],
                estimatedCost: 300000 * area,
                weatherDependency: true,
                criticalActivity: true,
              },
              {
                id: "prep_003",
                name: "Arado y rastrillado",
                description: "Preparación del suelo con arado y rastrillo para siembra",
                day: 10,
                duration: 5,
                category: 'preparacion' as const,
                isKeyMilestone: true,
                materials: ["Combustible", "Lubricantes"],
                equipment: ["Tractor", "Arado", "Rastrillo"],
                labor: ["Operador especializado"],
                estimatedCost: 400000 * area,
                weatherDependency: true,
                criticalActivity: true,
              }
            ]
          },
          {
            name: "Siembra",
            description: "Proceso de siembra y establecimiento inicial del cultivo",
            startDay: 16,
            duration: 10,
            category: 'siembra' as const,
            activities: [
              {
                id: "siembra_001",
                name: "Marcado de surcos",
                description: "Trazado y marcado de surcos según diseño agronómico",
                day: 16,
                duration: 2,
                category: 'siembra' as const,
                isKeyMilestone: false,
                materials: ["Estacas", "Piola", "Cal agrícola"],
                equipment: ["Tractor", "Surcadora", "Cinta métrica"],
                labor: ["Operador", "Asistentes de campo"],
                estimatedCost: 200000 * area,
                weatherDependency: false,
                criticalActivity: true,
              },
              {
                id: "siembra_002",
                name: "Siembra del cultivo",
                description: `Siembra de semilla certificada de ${cropType} con densidad óptima`,
                day: 18,
                duration: 3,
                category: 'siembra' as const,
                isKeyMilestone: true,
                materials: [`Semilla certificada de ${cropType}`, "Fertilizante de base"],
                equipment: ["Sembradora", "Tractor", "Calibrador"],
                labor: ["Operador especializado", "Trabajadores"],
                estimatedCost: 800000 * area,
                weatherDependency: true,
                criticalActivity: true,
              },
              {
                id: "siembra_003",
                name: "Riego inicial",
                description: "Aplicación de riego para germinación y establecimiento",
                day: 21,
                duration: 5,
                category: 'siembra' as const,
                isKeyMilestone: false,
                materials: ["Agua", "Combustible para bomba"],
                equipment: ["Sistema de riego", "Bomba", "Mangueras"],
                labor: ["Operador de riego"],
                estimatedCost: 150000 * area,
                weatherDependency: true,
                criticalActivity: false,
              }
            ]
          },
          {
            name: "Mantenimiento",
            description: "Cuidados culturales, fertilización y control fitosanitario",
            startDay: 26,
            duration: cropType.toLowerCase().includes('lechuga') ? 30 : 60,
            category: 'mantenimiento' as const,
            activities: [
              {
                id: "mant_001",
                name: "Control de malezas",
                description: "Eliminación de arvenses que compiten con el cultivo",
                day: 30,
                duration: 3,
                category: 'mantenimiento' as const,
                isKeyMilestone: false,
                materials: ["Herbicida selectivo", "Combustible"],
                equipment: ["Fumigadora", "Azadón", "Machete"],
                labor: ["Aplicador certificado", "Trabajadores"],
                estimatedCost: 300000 * area,
                weatherDependency: true,
                criticalActivity: false,
              },
              {
                id: "mant_002",
                name: "Fertilización",
                description: "Aplicación de fertilizantes según análisis de suelo",
                day: 35,
                duration: 2,
                category: 'mantenimiento' as const,
                isKeyMilestone: true,
                materials: ["Fertilizante NPK", "Micronutrientes"],
                equipment: ["Esparcidora", "Tractor"],
                labor: ["Técnico", "Operador"],
                estimatedCost: 600000 * area,
                weatherDependency: false,
                criticalActivity: true,
              },
              {
                id: "mant_003",
                name: "Control fitosanitario",
                description: "Monitoreo y control de plagas y enfermedades",
                day: 45,
                duration: 1,
                category: 'mantenimiento' as const,
                isKeyMilestone: false,
                materials: ["Fungicida", "Insecticida", "Adherente"],
                equipment: ["Fumigadora", "Lupa", "Trampa cromática"],
                labor: ["Técnico fitosanitario"],
                estimatedCost: 250000 * area,
                weatherDependency: true,
                criticalActivity: false,
              }
            ]
          },
          {
            name: "Cosecha",
            description: "Recolección del producto en momento óptimo de madurez",
            startDay: cropType.toLowerCase().includes('lechuga') ? 65 : 90,
            duration: 15,
            category: 'cosecha' as const,
            activities: [
              {
                id: "cosecha_001",
                name: "Evaluación de madurez",
                description: "Determinación del momento óptimo de cosecha",
                day: cropType.toLowerCase().includes('lechuga') ? 65 : 90,
                duration: 2,
                category: 'cosecha' as const,
                isKeyMilestone: true,
                materials: ["Formato de evaluación"],
                equipment: ["Refractómetro", "Colorímetro", "Balanza"],
                labor: ["Técnico especializado"],
                estimatedCost: 100000,
                weatherDependency: false,
                criticalActivity: true,
              },
              {
                id: "cosecha_002",
                name: "Recolección",
                description: "Cosecha manual o mecanizada del producto",
                day: cropType.toLowerCase().includes('lechuga') ? 67 : 92,
                duration: 10,
                category: 'cosecha' as const,
                isKeyMilestone: true,
                materials: ["Canastas", "Empaques", "Etiquetas"],
                equipment: ["Cosechadora o herramientas manuales"],
                labor: ["Cuadrilla de cosecha", "Supervisor"],
                estimatedCost: 500000 * area,
                weatherDependency: true,
                criticalActivity: true,
              }
            ]
          },
          {
            name: "Postcosecha",
            description: "Manejo, clasificación y preparación para comercialización",
            startDay: cropType.toLowerCase().includes('lechuga') ? 77 : 105,
            duration: 10,
            category: 'postcosecha' as const,
            activities: [
              {
                id: "post_001",
                name: "Clasificación y empaque",
                description: "Selección por calidad y empaque para venta",
                day: cropType.toLowerCase().includes('lechuga') ? 77 : 105,
                duration: 5,
                category: 'postcosecha' as const,
                isKeyMilestone: false,
                materials: ["Empaques", "Etiquetas", "Material de empaque"],
                equipment: ["Mesa de selección", "Báscula", "Empacadora"],
                labor: ["Operarios especializados"],
                estimatedCost: 300000 * area,
                weatherDependency: false,
                criticalActivity: false,
              },
              {
                id: "post_002",
                name: "Almacenamiento y despacho",
                description: "Conservación y preparación para entrega",
                day: cropType.toLowerCase().includes('lechuga') ? 82 : 110,
                duration: 5,
                category: 'postcosecha' as const,
                isKeyMilestone: true,
                materials: ["Material refrigerante", "Combustible"],
                equipment: ["Cuarto frío", "Vehículo de transporte"],
                labor: ["Operario de bodega", "Conductor"],
                estimatedCost: 200000 * area,
                weatherDependency: false,
                criticalActivity: false,
              }
            ]
          }
        ],
        keyMilestones: [
          {
            name: "Análisis de suelo completado",
            day: 3,
            description: "Resultados del análisis químico del suelo disponibles",
            category: "preparacion"
          },
          {
            name: "Terreno preparado para siembra",
            day: 15,
            description: "Suelo completamente preparado y listo para siembra",
            category: "preparacion"
          },
          {
            name: "Siembra completada",
            day: 25,
            description: "Todo el lote sembrado según especificaciones técnicas",
            category: "siembra"
          },
          {
            name: "Establecimiento del cultivo",
            day: 40,
            description: "Germinación uniforme y plantas establecidas",
            category: "mantenimiento"
          },
          {
            name: "Inicio de cosecha",
            day: cropType.toLowerCase().includes('lechuga') ? 67 : 92,
            description: "Producto alcanza madurez comercial",
            category: "cosecha"
          }
        ]
      },

      // Lista de chequeo detallada por categorías
      listaChequeo: {
        categorias: {
          preparacion: {
            nombre: "Preparación del Terreno",
            descripcion: "Actividades iniciales para acondicionar el lote de siembra",
            items: [
              {
                id: "prep_check_001",
                tarea: "Toma de muestras de suelo",
                descripcion: "Recolectar muestras representativas en zigzag para análisis",
                dia: 1,
                prioridad: 'alta' as const,
                tiempo_estimado: "4 horas",
                recursos_necesarios: ["Barreno", "Bolsas", "Etiquetas", "GPS"],
                criterios_calidad: ["20-25 submuestras por hectárea", "Profundidad 0-20cm", "Muestras secas"],
                observaciones: "Evitar tomar muestras en zonas atípicas como cerca de caminos o árboles"
              },
              {
                id: "prep_check_002",
                tarea: "Interpretación análisis de suelo",
                descripcion: "Revisar resultados y plan de fertilización",
                dia: 5,
                prioridad: 'alta' as const,
                tiempo_estimado: "2 horas",
                recursos_necesarios: ["Resultados laboratorio", "Tablas interpretación"],
                criterios_calidad: ["pH entre 6.0-7.0", "Materia orgánica >3%", "Nutrientes balanceados"],
                observaciones: "Ajustar plan de fertilización según resultados específicos"
              },
              {
                id: "prep_check_003",
                tarea: "Limpieza del lote",
                descripcion: "Eliminar arvenses, piedras y residuos vegetales",
                dia: 7,
                prioridad: 'alta' as const,
                tiempo_estimado: "1 día por hectárea",
                recursos_necesarios: ["Guadañadora", "Rastrillos", "Carretilla"],
                criterios_calidad: ["Terreno libre de obstáculos", "Residuos retirados", "Superficie uniforme"],
                observaciones: "Compostar residuos orgánicos cuando sea posible"
              },
              {
                id: "prep_check_004",
                tarea: "Arado del terreno",
                descripcion: "Voltear el suelo para mejorar estructura",
                dia: 10,
                prioridad: 'alta' as const,
                tiempo_estimado: "4-6 horas por hectárea",
                recursos_necesarios: ["Tractor", "Arado", "Combustible"],
                criterios_calidad: ["Profundidad 25-30cm", "Volteo completo", "Terrones <10cm"],
                observaciones: "Realizar con humedad óptima del suelo (friable)"
              },
              {
                id: "prep_check_005",
                tarea: "Rastrillado",
                descripcion: "Nivelar y mullir el suelo preparado",
                dia: 13,
                prioridad: 'media' as const,
                tiempo_estimado: "3-4 horas por hectárea",
                recursos_necesarios: ["Tractor", "Rastrillo", "Rodillo"],
                criterios_calidad: ["Superficie nivelada", "Terrones <5cm", "Cama de siembra lista"],
                observaciones: "Evitar compactación por paso excesivo de maquinaria"
              }
            ]
          },
          siembra: {
            nombre: "Siembra y Establecimiento",
            descripcion: "Proceso de siembra y actividades para establecimiento del cultivo",
            items: [
              {
                id: "siembra_check_001",
                tarea: "Calibración de sembradora",
                descripcion: "Ajustar máquina para densidad de siembra correcta",
                dia: 16,
                prioridad: 'alta' as const,
                tiempo_estimado: "2 horas",
                recursos_necesarios: ["Sembradora", "Semillas", "Calibrador"],
                criterios_calidad: ["Distancia entre surcos correcta", "Profundidad 2-3cm", "Densidad uniforme"],
                observaciones: "Realizar prueba en 10 metros lineales antes de sembrar todo el lote"
              },
              {
                id: "siembra_check_002",
                tarea: "Verificación calidad semilla",
                descripcion: "Inspeccionar semilla antes de siembra",
                dia: 17,
                prioridad: 'alta' as const,
                tiempo_estimado: "30 minutos",
                recursos_necesarios: ["Lupa", "Muestra de semillas"],
                criterios_calidad: ["Germinación >85%", "Pureza >98%", "Libre de plagas"],
                observaciones: "Usar solo semilla certificada de proveedores confiables"
              },
              {
                id: "siembra_check_003",
                tarea: "Siembra del lote",
                descripcion: "Sembrar según especificaciones técnicas",
                dia: 18,
                prioridad: 'alta' as const,
                tiempo_estimado: "6-8 horas por hectárea",
                recursos_necesarios: ["Sembradora", "Tractor", "Semillas", "Fertilizante base"],
                criterios_calidad: ["Profundidad uniforme", "Distanciamiento correcto", "Sin doble siembra"],
                observaciones: "Evitar siembra en suelo muy húmedo o muy seco"
              },
              {
                id: "siembra_check_004",
                tarea: "Aplicación riego germinación",
                descripcion: "Riego inicial para favorecer germinación",
                dia: 19,
                prioridad: 'alta' as const,
                tiempo_estimado: "2-3 horas",
                recursos_necesarios: ["Sistema riego", "Agua"],
                criterios_calidad: ["Humedad uniforme", "Sin encharcamientos", "Cobertura completa"],
                observaciones: "Aplicar 15-20mm de agua en riego suave"
              }
            ]
          },
          mantenimiento: {
            nombre: "Mantenimiento del Cultivo",
            descripcion: "Labores culturales durante el desarrollo del cultivo",
            items: [
              {
                id: "mant_check_001",
                tarea: "Monitoreo germinación",
                descripcion: "Verificar emergencia y uniformidad de plántulas",
                dia: 25,
                prioridad: 'alta' as const,
                tiempo_estimado: "2 horas",
                recursos_necesarios: ["Libreta campo", "Cámara"],
                criterios_calidad: ["Germinación >80%", "Emergencia uniforme", "Plántulas vigorosas"],
                observaciones: "Resiembra en áreas con baja germinación"
              },
              {
                id: "mant_check_002",
                tarea: "Control malezas preemergente",
                descripcion: "Aplicación herbicida antes emergencia de arvenses",
                dia: 20,
                prioridad: 'media' as const,
                tiempo_estimado: "3-4 horas por hectárea",
                recursos_necesarios: ["Fumigadora", "Herbicida", "Adherente"],
                criterios_calidad: ["Cobertura uniforme", "Dosis correcta", "Sin deriva"],
                observaciones: "Aplicar con buen tiempo y sin viento"
              },
              {
                id: "mant_check_003",
                tarea: "Primera fertilización",
                descripcion: "Aplicar fertilizante de desarrollo según análisis",
                dia: 35,
                prioridad: 'alta' as const,
                tiempo_estimado: "4 horas por hectárea",
                recursos_necesarios: ["Fertilizante NPK", "Esparcidora"],
                criterios_calidad: ["Dosis según análisis", "Aplicación uniforme", "Incorporación al suelo"],
                observaciones: "Aplicar con humedad adecuada del suelo"
              },
              {
                id: "mant_check_004",
                tarea: "Monitoreo fitosanitario",
                descripcion: "Inspección semanal de plagas y enfermedades",
                dia: 30,
                prioridad: 'alta' as const,
                tiempo_estimado: "1-2 horas semanales",
                recursos_necesarios: ["Lupa", "Formato registro", "Trampas"],
                criterios_calidad: ["Muestreo representativo", "Identificación correcta", "Registro detallado"],
                observaciones: "Actuar según umbrales de daño económico"
              }
            ]
          },
          cosecha: {
            nombre: "Cosecha",
            descripcion: "Recolección del producto en momento óptimo",
            items: [
              {
                id: "cosecha_check_001",
                tarea: "Determinación madurez",
                descripcion: "Evaluar indicadores de madurez comercial",
                dia: cropType.toLowerCase().includes('lechuga') ? 65 : 90,
                prioridad: 'alta' as const,
                tiempo_estimado: "2 horas",
                recursos_necesarios: ["Refractómetro", "Colorímetro", "Muestras"],
                criterios_calidad: ["Grados brix adecuados", "Color uniforme", "Tamaño comercial"],
                observaciones: "Cosechar en horas frescas del día"
              },
              {
                id: "cosecha_check_002",
                tarea: "Preparación cuadrilla",
                descripcion: "Organizar personal y herramientas de cosecha",
                dia: cropType.toLowerCase().includes('lechuga') ? 66 : 91,
                prioridad: 'alta' as const,
                tiempo_estimado: "1 hora",
                recursos_necesarios: ["Canastas", "Navajas", "Empaques"],
                criterios_calidad: ["Herramientas desinfectadas", "Personal capacitado", "Materiales suficientes"],
                observaciones: "Capacitar en técnicas de corte y manejo"
              },
              {
                id: "cosecha_check_003",
                tarea: "Recolección producto",
                descripcion: "Cosechar siguiendo buenas prácticas",
                dia: cropType.toLowerCase().includes('lechuga') ? 67 : 92,
                prioridad: 'alta' as const,
                tiempo_estimado: "8-10 horas por hectárea",
                recursos_necesarios: ["Cuadrilla", "Herramientas", "Transporte"],
                criterios_calidad: ["Corte limpio", "Manejo cuidadoso", "Producto sin daños"],
                observaciones: "Proteger de sol directo durante recolección"
              }
            ]
          },
          postcosecha: {
            nombre: "Postcosecha",
            descripcion: "Manejo y preparación para comercialización",
            items: [
              {
                id: "post_check_001",
                tarea: "Lavado y limpieza",
                descripcion: "Limpiar producto de impurezas",
                dia: cropType.toLowerCase().includes('lechuga') ? 68 : 105,
                prioridad: 'alta' as const,
                tiempo_estimado: "4-6 horas",
                recursos_necesarios: ["Agua potable", "Cloro", "Mesas lavado"],
                criterios_calidad: ["Agua clorada 50ppm", "Producto limpio", "Sin residuos"],
                observaciones: "Usar agua de calidad potable únicamente"
              },
              {
                id: "post_check_002",
                tarea: "Clasificación por calidad",
                descripcion: "Separar por categorías comerciales",
                dia: cropType.toLowerCase().includes('lechuga') ? 69 : 106,
                prioridad: 'media' as const,
                tiempo_estimado: "6-8 horas",
                recursos_necesarios: ["Mesa selección", "Básculas", "Empaques"],
                criterios_calidad: ["Categorías definidas", "Peso uniforme", "Sin defectos"],
                observaciones: "Seguir estándares de calidad del comprador"
              },
              {
                id: "post_check_003",
                tarea: "Empaque y etiquetado",
                descripcion: "Embalar producto para distribución",
                dia: cropType.toLowerCase().includes('lechuga') ? 70 : 108,
                prioridad: 'media' as const,
                tiempo_estimado: "4 horas",
                recursos_necesarios: ["Empaques", "Etiquetas", "Selladora"],
                criterios_calidad: ["Empaque adecuado", "Etiquetado completo", "Trazabilidad"],
                observaciones: "Incluir información de trazabilidad en etiquetas"
              }
            ]
          }
        },
        totalItems: 20,
        itemsPorCategoria: {
          preparacion: 5,
          siembra: 4,
          mantenimiento: 4,
          cosecha: 3,
          postcosecha: 3
        }
      },

      phases: [
        {
          name: "Preparación del terreno",
          duration: 15,
          dependencies: [],
          activities: [{
            name: "Análisis de suelo",
            description: "Toma de muestras y análisis físico-químico",
            duration: 3,
            cost: 150000,
            materials: ["Kit de muestreo", "Etiquetas"],
            equipment: ["Barreno", "GPS"],
            labor: ["Técnico especialista"],
            techniques: ["Muestreo en zigzag", "Análisis completo"]
          }],
          criticalPath: true,
          estimatedCost: 800000 * area,
          resources: []
        }
      ],
      
      criticalPath: ["Preparación del terreno", "Siembra", "Mantenimiento", "Cosecha"],
      timeline: [],
      
      marketAnalysis: {
        currentPrice: cropType.toLowerCase().includes('papa') ? 2500 : 
                     cropType.toLowerCase().includes('maíz') ? 1800 : 2200,
        historicalPrices: [],
        demand: 'Alta' as const,
        competition: 'Media' as const,
        bestMarkets: ["Centrales de abastos", "Supermercados", "Procesadores"],
        seasonalTrends: "Mayor demanda en diciembre-enero y junio-julio",
        marketingRecommendations: [
          "Establecer contratos de venta anticipada",
          "Diversificar canales de comercialización",
          "Implementar certificaciones de calidad"
        ]
      },
      
      profitabilityAnalysis: {
        totalInvestment: area * 8000000,
        totalExpenses: area * 6500000,
        estimatedRevenue: area * 12000000,
        grossProfit: area * 5500000,
        netProfit: area * 4000000,
        profitMargin: 33.3,
        breakEvenPoint: area * 2600,
        roi: 50,
        paybackPeriod: 6
      },
      
      agroindustrialProcessing: {
        processes: [{
          name: "Procesamiento mínimo",
          description: "Lavado, selección y empaque",
          equipment: ["Lavadora", "Clasificadora", "Empacadora"],
          process: ["Recepción", "Lavado", "Selección", "Empaque"],
          output: "Producto fresco empacado",
          valueIncrease: 25,
          investmentRequired: 15000000
        }],
        valueAddition: 25,
        requiredInvestment: 15000000,
        newMarkets: ["Tiendas especializadas", "Restaurantes", "Exportación"],
        shelfLife: "15 días refrigerado",
        qualityStandards: ["HACCP", "BPA", "Resolución 2674"]
      },
      
      technicalRecommendations: [
        "Implementar sistema de trazabilidad desde siembra hasta venta",
        "Usar tecnología de precisión para optimizar recursos",
        "Establecer alianzas con centros de investigación"
      ],
      
      riskMitigation: [
        "Diversificar variedades para reducir riesgo climático",
        "Contratar seguro agrícola",
        "Mantener fondo de contingencia del 10% del presupuesto"
      ],
      
      qualityControlPoints: [
        "Calidad de semilla al momento de siembra",
        "Monitoreo nutricional cada 15 días", 
        "Control fitosanitario semanal",
        "Evaluación de madurez antes de cosecha"
      ],
      
      sustainabilityPractices: [
        "Uso eficiente del agua con riego tecnificado",
        "Manejo integrado de plagas para reducir agroquímicos",
        "Compostaje de residuos orgánicos",
        "Rotación de cultivos para mantener fertilidad del suelo"
      ],
      
      generatedImages,
      generatedAt: currentDate,
      confidenceLevel: 0.85
    };

    return workPlan;
  }
);

export type ComprehensiveWorkPlanOutput = z.infer<typeof ComprehensiveWorkPlanSchema>;