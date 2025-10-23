
'use server';

import { getCropRecommendation, type CropRecommendationInput } from '@/ai/flows/ai-powered-crop-recommendations';
import { projectedHarvestEstimates, type ProjectedHarvestEstimatesInput } from '@/ai/flows/projected-harvest-estimates';

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
