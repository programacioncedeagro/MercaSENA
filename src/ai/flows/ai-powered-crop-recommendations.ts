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
  prompt: `You are an expert agricultural assistant. A farmer is growing {{cropType}} in {{location}} and has the following question: {{question}}. Answer the question to the best of your ability, providing helpful and actionable advice.`,
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
