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