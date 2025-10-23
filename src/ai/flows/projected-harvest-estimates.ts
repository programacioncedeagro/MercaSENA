'use server';
/**
 * @fileOverview This file defines a Genkit flow for estimating harvest dates based on crop type and weather conditions.
 *
 * - projectedHarvestEstimates - A function that initiates the harvest date estimation flow.
 * - ProjectedHarvestEstimatesInput - The input type for the projectedHarvestEstimates function.
 * - ProjectedHarvestEstimatesOutput - The return type for the projectedHarvestEstimates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectedHarvestEstimatesInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  plantingDate: z.string().describe('The date the crop was planted (YYYY-MM-DD).'),
  location: z.string().describe('The geographical location where the crop is planted.'),
  historicalWeatherData: z
    .string()
    .optional()
    .describe('Historical weather data for the location.'),
});
export type ProjectedHarvestEstimatesInput = z.infer<
  typeof ProjectedHarvestEstimatesInputSchema
>;

const ProjectedHarvestEstimatesOutputSchema = z.object({
  estimatedHarvestDate: z.string().describe('The estimated date of harvest (YYYY-MM-DD).'),
  confidenceLevel: z
    .string()
    .describe('A qualitative measure of the confidence in the estimate (e.g., High, Medium, Low).'),
  reasoning: z.string().describe('The AI reasoning behind the estimated harvest date.'),
});
export type ProjectedHarvestEstimatesOutput = z.infer<
  typeof ProjectedHarvestEstimatesOutputSchema
>;

export async function projectedHarvestEstimates(
  input: ProjectedHarvestEstimatesInput
): Promise<ProjectedHarvestEstimatesOutput> {
  return projectedHarvestEstimatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectedHarvestEstimatesPrompt',
  input: {schema: ProjectedHarvestEstimatesInputSchema},
  output: {schema: ProjectedHarvestEstimatesOutputSchema},
  prompt: `You are an expert agricultural advisor. Based on the crop type, planting date, location, and any available historical weather data, estimate the harvest date.

Crop Type: {{{cropType}}}
Planting Date: {{{plantingDate}}}
Location: {{{location}}}
Historical Weather Data: {{{historicalWeatherData}}}

Consider the typical growing season for the crop in the given location. If historical weather data is provided, use it to refine your estimate. Provide a confidence level for your estimate, and explain your reasoning.

Output the estimated harvest date in YYYY-MM-DD format, the confidence level, and the reasoning behind the estimation.

Ensure that your estimation considers factors like average growing days, climate patterns of the specific location, and any potential impact of weather on crop development. The estimatedHarvestDate should be realistic and consider the data provided.

Use the current date as a reference point if needed.`,
});

const projectedHarvestEstimatesFlow = ai.defineFlow(
  {
    name: 'projectedHarvestEstimatesFlow',
    inputSchema: ProjectedHarvestEstimatesInputSchema,
    outputSchema: ProjectedHarvestEstimatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
