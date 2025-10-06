import { Suspense } from 'react';
import ModelsClient from './models-client';
import { API_BASE_URL } from '@/lib/config';

interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture: {
    input_modalities: string[];
  };
  supported_parameters: string[];
  provider_slug: string;
}

async function getModels(): Promise<Model[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/models?gateway=all`, {
      next: { revalidate: 0 } // Always fetch fresh data
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
}

export default async function ModelsPage() {
  const initialModels = await getModels();

  return <ModelsClient initialModels={initialModels} />;
}
