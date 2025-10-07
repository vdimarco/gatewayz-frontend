import { Suspense } from 'react';
import ModelsClient from './models-client';
import { API_BASE_URL } from '@/lib/config';

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
}

async function getModels(): Promise<Model[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/models?gateway=all`, {
      next: { revalidate: 0 } // Always fetch fresh data
    });
    const data = await response.json();
    const models = data.data || [];
    
    // Log total models before deduplication
    console.log(`Fetched ${models.length} models from API`);
    
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
