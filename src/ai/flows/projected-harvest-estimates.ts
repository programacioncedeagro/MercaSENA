'use server';
/**
 * @fileOverview Este archivo define un flow de Genkit para estimar fechas de cosecha 
 * basado en el tipo de cultivo, condiciones climáticas y análisis de mercado.
 *
 * - projectedHarvestEstimates - Función que inicia el flow de estimación de cosecha
 * - ProjectedHarvestEstimatesInput - Tipo de entrada para la función projectedHarvestEstimates
 * - ProjectedHarvestEstimatesOutput - Tipo de retorno para la función projectedHarvestEstimates
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectedHarvestEstimatesInputSchema = z.object({
  cropType: z.string().describe('El tipo de cultivo que se está cultivando.'),
  plantingDate: z.string().describe('La fecha en que se plantó el cultivo (YYYY-MM-DD).'),
  location: z.string().describe('La ubicación geográfica donde se plantó el cultivo.'),
  area: z.number().describe('Área del cultivo en hectáreas.'),
  historicalWeatherData: z
    .string()
    .optional()
    .describe('Datos meteorológicos históricos para la ubicación.'),
});

export type ProjectedHarvestEstimatesInput = z.infer<
  typeof ProjectedHarvestEstimatesInputSchema
>;

const ProjectedHarvestEstimatesOutputSchema = z.object({
  estimatedHarvestDate: z.string().describe('La fecha estimada de cosecha (YYYY-MM-DD).'),
  optimalHarvestWindow: z.object({
    startDate: z.string().describe('Fecha de inicio de la ventana óptima de cosecha.'),
    endDate: z.string().describe('Fecha de fin de la ventana óptima de cosecha.'),
  }).describe('Ventana de tiempo óptima para maximizar beneficios.'),
  marketAnalysis: z.object({
    currentPrices: z.string().describe('Análisis de precios actuales del mercado.'),
    priceProjection: z.string().describe('Proyección de precios para la fecha de cosecha.'),
    demandForecast: z.string().describe('Pronóstico de demanda del producto.'),
    competitionAnalysis: z.string().describe('Análisis de la competencia y oferta del mercado.'),
    recommendedStrategy: z.string().describe('Estrategia recomendada para maximizar beneficios.'),
  }).describe('Análisis completo del mercado y estrategia de comercialización.'),
  qualityFactors: z.object({
    optimalRipeness: z.string().describe('Indicadores de madurez óptima del producto.'),
    storageRecommendations: z.string().describe('Recomendaciones de almacenamiento post-cosecha.'),
    handlingTips: z.string().describe('Consejos para el manejo y transporte.'),
  }).describe('Factores de calidad para maximizar el valor del producto.'),
  riskFactors: z.object({
    weatherRisks: z.string().describe('Riesgos climáticos que podrían afectar la cosecha.'),
    marketRisks: z.string().describe('Riesgos de mercado y precios.'),
    mitigationStrategies: z.string().describe('Estrategias para mitigar los riesgos identificados.'),
  }).describe('Análisis de riesgos y estrategias de mitigación.'),
  confidenceLevel: z
    .string()
    .describe('Nivel de confianza en la estimación (Alto, Medio, Bajo).'),
  reasoning: z.string().describe('Razonamiento detallado detrás de la fecha estimada de cosecha.'),
  generatedImages: z.array(z.object({
    description: z.string().describe('Descripción de la imagen generada.'),
    imageUrl: z.string().describe('URL de la imagen generada o placeholder.'),
    phase: z.string().describe('Fase del cultivo que representa la imagen.'),
    aiPrompt: z.string().describe('Prompt usado para generar la imagen.'),
  })).describe('Imágenes generadas relacionadas con el proceso de cosecha.'),
});

export type ProjectedHarvestEstimatesOutput = z.infer<
  typeof ProjectedHarvestEstimatesOutputSchema
>;

// Función para generar imágenes relacionadas con la cosecha
async function generateHarvestImages(cropType: string, location: string): Promise<Array<{
  description: string;
  imageUrl: string;
  phase: string;
  aiPrompt: string;
}>> {
  const imagePrompts = [
    {
      description: 'Estado actual del cultivo',
      phase: 'Crecimiento',
      prompt: `Cultivo de ${cropType} en ${location}, Colombia. Plantas en estado de crecimiento saludable, campo verde, ambiente rural colombiano, luz natural, alta calidad.`
    },
    {
      description: 'Punto óptimo de cosecha',
      phase: 'Maduración',
      prompt: `${cropType} en punto óptimo de cosecha en ${location}. Productos maduros de alta calidad, colores vibrantes, listos para recolección, campo próspero.`
    },
    {
      description: 'Proceso de recolección',
      phase: 'Cosecha',
      prompt: `Cosecha de ${cropType} en Colombia. Trabajadores recolectando productos frescos, canastas llenas, técnicas eficientes de cosecha, productos de calidad premium.`
    },
    {
      description: 'Producto final listo para mercado',
      phase: 'Post-cosecha',
      prompt: `${cropType} cosechado y empacado para el mercado. Productos frescos, clasificados por calidad, empaque profesional, listos para distribución comercial.`
    }
  ];

  // Crear imágenes placeholder mejoradas
  return imagePrompts.map((prompt, index) => {
    // Crear un placeholder base64 (1x1 pixel transparente)
    const placeholderBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    
    return {
      description: prompt.description,
      imageUrl: `data:image/png;base64,${placeholderBase64}`,
      phase: prompt.phase,
      aiPrompt: prompt.prompt,
    };
  });
}

export async function projectedHarvestEstimates(
  input: ProjectedHarvestEstimatesInput
): Promise<ProjectedHarvestEstimatesOutput> {
  return projectedHarvestEstimatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectedHarvestEstimatesPrompt',
  input: {schema: ProjectedHarvestEstimatesInputSchema},
  output: {schema: ProjectedHarvestEstimatesOutputSchema.omit({ generatedImages: true })},
  prompt: `Eres un experto asesor agrícola y analista de mercados colombiano. Basándote en el tipo de cultivo, fecha de siembra, ubicación y datos meteorológicos disponibles, proporciona una estimación completa de cosecha que maximice los beneficios económicos.

Tipo de Cultivo: {{{cropType}}}
Fecha de Siembra: {{{plantingDate}}}
Ubicación: {{{location}}}
Área de Cultivo: {{{area}}} hectáreas
Datos Meteorológicos: {{{historicalWeatherData}}}

INSTRUCCIONES ESPECÍFICAS:

1. **Análisis de Temporada de Crecimiento**: Considera el ciclo típico de crecimiento del cultivo en la ubicación específica de Colombia.

2. **Análisis de Mercado Colombiano**: 
   - Investiga los precios históricos y actuales del producto en Colombia
   - Considera las temporadas de alta/baja demanda
   - Analiza los mercados locales, regionales y de exportación
   - Evalúa la competencia y oferta del mercado

3. **Optimización de Beneficios**:
   - Determina la ventana óptima de cosecha para maximizar precios
   - Considera factores de calidad vs. volumen
   - Evalúa estrategias de almacenamiento para aprovechar mejores precios

4. **Factores de Riesgo**:
   - Riesgos climáticos específicos de la región
   - Volatilidad de precios del mercado
   - Estrategias de mitigación práticas

5. **Recomendaciones de Calidad**:
   - Indicadores específicos de madurez óptima para {{{cropType}}}
   - Técnicas de cosecha para preservar calidad
   - Métodos de almacenamiento y conservación

Responde en español colombiano con terminología técnica precisa pero comprensible. Incluye datos numéricos específicos y realistas para el contexto colombiano. Todos los precios deben estar en pesos colombianos (COP).

IMPORTANTE: Proporciona fechas específicas y estrategias concretas que el agricultor pueda implementar inmediatamente.`,
});

const projectedHarvestEstimatesFlow = ai.defineFlow(
  {
    name: 'projectedHarvestEstimatesFlow',
    inputSchema: ProjectedHarvestEstimatesInputSchema,
    outputSchema: ProjectedHarvestEstimatesOutputSchema,
  },
  async input => {
    // Generar estimación con IA
    const promptResult = await prompt(input);
    
    // Generar imágenes relacionadas con la cosecha
    const generatedImages = await generateHarvestImages(input.cropType, input.location);

    // Combinar la respuesta de la IA con las imágenes generadas
    return {
      ...promptResult.output!,
      generatedImages
    };
  }
);
