
'use server';

import { getCropRecommendation, type CropRecommendationInput } from '@/ai/flows/ai-powered-crop-recommendations';
import { projectedHarvestEstimates, type ProjectedHarvestEstimatesInput } from '@/ai/flows/projected-harvest-estimates';
import { comprehensiveWorkPlanFlow, type ComprehensiveWorkPlanOutput } from '@/ai/flows/comprehensive-work-plan';

export async function getRecommendationAction(input: CropRecommendationInput) {
  try {
    // In a real app, you'd add user authentication/authorization checks here.
    const result = await getCropRecommendation(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to get recommendation.' };
  }
}

export async function getHarvestEstimateAction(input: ProjectedHarvestEstimatesInput) {
  try {
    // In a real app, you'd add user authentication/authorization checks here.
    const result = await projectedHarvestEstimates(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to estimate harvest date.' };
  }
}

export async function generateComprehensiveWorkPlanAction(input: {
  cropType: string;
  area: number;
  location: string;
  plantingDate: string;
  budget?: number;
  experience?: 'Principiante' | 'Intermedio' | 'Avanzado';
}) {
  try {
    const result = await comprehensiveWorkPlanFlow(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Failed to generate comprehensive work plan.' };
  }
}
