'use server';
/**
 * @fileOverview An AI-powered crop recommendation agent.
 *
 * - getCropRecommendation - A function that answers farmer's questions about their crops.
 * - CropRecommendationInput - The input type for the getCropRecommendation function.
 * - CropRecommendationOutput - The return type for the getCropRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropRecommendationInputSchema = z.object({
  question: z.string().describe('The question from the farmer about their crops.'),
  cropType: z.string().describe('The type of crop the farmer is growing.'),
  location: z.string().describe('The location where the crop is being grown.'),
});
export type CropRecommendationInput = z.infer<typeof CropRecommendationInputSchema>;

const CropRecommendationOutputSchema = z.object({
  answer: z.string().describe('The answer to the farmer question.'),
});
export type CropRecommendationOutput = z.infer<typeof CropRecommendationOutputSchema>;

export async function getCropRecommendation(input: CropRecommendationInput): Promise<CropRecommendationOutput> {
  return cropRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: {schema: CropRecommendationInputSchema},
  output: {schema: CropRecommendationOutputSchema},
  prompt: `Eres un agrónomo experto especializado en el trópico andino colombiano. Un productor está cultivando {{cropType}} en {{location}} y tiene la siguiente consulta: {{question}}

INSTRUCCIONES IMPORTANTES:
- Responde SIEMPRE en español colombiano
- Estructura tu respuesta usando metodologías claras (5M: Mano de obra, Maquinaria, Materiales, Métodos, Medio ambiente)
- Usa formato Markdown para mejor legibilidad
- Proporciona información específica para el contexto de {{location}} y Colombia
- Incluye costos aproximados en pesos colombianos cuando sea relevante
- Sé detallado pero fácil de entender para población rural

ESTRUCTURA DE RESPUESTA:
1. **RESUMEN EJECUTIVO** (2-3 líneas)
2. **ANÁLISIS DETALLADO** usando metodología 5M:
   - 🤝 **MANO DE OBRA**: Personal necesario y jornales
   - 🚜 **MAQUINARIA**: Equipos y herramientas requeridas  
   - 📦 **MATERIALES**: Insumos, semillas, fertilizantes, pesticidas
   - 📋 **MÉTODOS**: Procedimientos y técnicas paso a paso
   - 🌱 **MEDIO AMBIENTE**: Condiciones climáticas y de suelo
3. **CRONOGRAMA** (si aplica)
4. **COSTOS ESTIMADOS** (en COP)
5. **RECOMENDACIONES ADICIONALES**
6. **CONTACTOS ÚTILES** (UMATA, ICA, etc.)

Responde de manera completa y estructurada.`,
});

const cropRecommendationFlow = ai.defineFlow(
  {
    name: 'cropRecommendationFlow',
    inputSchema: CropRecommendationInputSchema,
    outputSchema: CropRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
