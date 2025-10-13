import { Suspense } from 'react';
import ModelsClient from './models-client';
import { getModelsForGateway } from '@/lib/models-service';

interface Model {
  id: string;
  name: string;
  description: string | null;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  } | null;
  architecture: {
    input_modalities: string[] | null;
    output_modalities: string[] | null;
  } | null;
  supported_parameters: string[] | null;
  provider_slug: string;
  source_gateway?: string;
  created?: number;
}

async function getModels(): Promise<Model[]> {
  try {
    // Fetch all models at once using gateway=all for better performance
    // This gets all 6,946 models from OpenRouter, Portkey, Featherless, and Chutes
    const allModelsData = await getModelsForGateway('all');

    const models = allModelsData.data || [];

    // Log total models before deduplication
    console.log(`Fetched ${models.length} models from API using gateway=all`);

    // Remove duplicates based on model ID
    const uniqueModels = models.reduce((acc: Model[], current: Model) => {
      // Skip models without valid IDs
      if (!current.id || current.id.trim() === '') {
        console.warn('Skipping model with invalid ID:', current);
        return acc;
      }
      
      const existingIndex = acc.findIndex(model => model.id === current.id);
      if (existingIndex === -1) {
        acc.push(current);
      } else {
        // If duplicate found, log it and keep the one with more complete data
        console.warn(`Duplicate model ID found: ${current.id}`);
        const existing = acc[existingIndex];
        const currentCompleteness = (current.description ? 1 : 0) + 
                                   (current.context_length > 0 ? 1 : 0) + 
                                   (current.pricing ? 1 : 0) + 
                                   (current.architecture ? 1 : 0);
        const existingCompleteness = (existing.description ? 1 : 0) + 
                                    (existing.context_length > 0 ? 1 : 0) + 
                                    (existing.pricing ? 1 : 0) + 
                                    (existing.architecture ? 1 : 0);
        
        if (currentCompleteness > existingCompleteness) {
          console.log(`Replacing existing model ${current.id} with more complete version`);
          acc[existingIndex] = current;
        }
      }
      return acc;
    }, []);
    
    // Log final count after deduplication
    console.log(`After deduplication: ${uniqueModels.length} unique models`);
    
    return uniqueModels;
  } catch (error) {
    console.log('Failed to fetch models:', error);
    return [];
  }
}

export default async function ModelsPage() {
  const initialModels = await getModels();

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ModelsClient initialModels={initialModels} />
    </Suspense>
  );
}
