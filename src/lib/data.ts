
export type ModelData = {
  name: string;
  organization: string;
  category: 'Language' | 'Vision' | 'Multimodal' | 'Audio & Speech Models' | 'Code Models' | 'Reinforcement Learning' | 'Embedding Models' | 'Domain-Specific';
  subCategories?: ('Text' | 'Image' | 'Audio' | 'Video')[];
  provider: 'OpenAI' | 'Google' | 'Anthropic' | 'Meta' | 'Mistral' | 'Other';
  tokens: number;
  value: string;
  change: number;
};

export const topModels: ModelData[] = [
  // Multimodal (5 models)
  { name: 'GPT-4o', organization: 'OpenAI', category: 'Multimodal', subCategories: ['Text', 'Image', 'Audio', 'Video'], provider: 'OpenAI', tokens: 20.0, value: '$86B', change: 15.2 },
  { name: 'Gemini 2.1 Pro', organization: 'Google', category: 'Multimodal', subCategories: ['Text', 'Image', 'Audio'], provider: 'Google', tokens: 19.5, value: '$2T', change: 9.8 },
  { name: 'Claude 3.5 Sonnet', organization: 'Anthropic', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Anthropic', tokens: 19.2, value: '$20B', change: 25.1 },
  { name: 'CogVLM 2', organization: 'THUDM', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Other', tokens: 10.4, value: '$300M', change: 8.8 },
  { name: 'Llava-NeXT', organization: 'Various', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Other', tokens: 9.9, value: '$50M', change: 7.3 },

  // Language (6 models)
  { name: 'Llama 3.1 405B', organization: 'Meta', category: 'Language', provider: 'Meta', tokens: 18.8, value: '$1.3T', change: 12.5 },
  { name: 'Mistral Large 2', organization: 'Mistral', category: 'Language', provider: 'Mistral', tokens: 17.5, value: '$6B', change: 30.2 },
  { name: 'Gemma 2 27B', organization: 'Google', category: 'Language', provider: 'Google', tokens: 16.8, value: '$2T', change: 8.5 },
  { name: 'Command R+', organization: 'Cohere', category: 'Language', provider: 'Other', tokens: 16.5, value: '$5B', change: 18.7 },
  { name: 'DBRX', organization: 'Databricks', category: 'Language', provider: 'Other', tokens: 16.2, value: '$43B', change: 11.3 },
  { name: 'Jamba', organization: 'AI21 Labs', category: 'Language', provider: 'Other', tokens: 12.2, value: '$1.4B', change: 7.8 },
  
  // Vision (5 models)
  { name: 'PaliGemma', organization: 'Google', category: 'Vision', provider: 'Google', tokens: 15.9, value: '$2T', change: 7.1 },
  { name: 'Florence-2', organization: 'Microsoft', category: 'Vision', provider: 'Other', tokens: 15.5, value: '$3T', change: 6.5 },
  { name: 'Segment Anything', organization: 'Meta', category: 'Vision', provider: 'Meta', tokens: 15.2, value: '$1.3T', change: 5.4 },
  { name: 'I-JEPA', organization: 'Meta', category: 'Vision', provider: 'Meta', tokens: 12.5, value: '$1.3T', change: 3.2 },
  { name: 'YOLOv10', organization: 'THUDM', category: 'Vision', provider: 'Other', tokens: 9.8, value: '$100M', change: 6.1 },

  // Code Models (5 models)
  { name: 'Devin', organization: 'Cognition', category: 'Code Models', provider: 'Other', tokens: 17.1, value: '$2B', change: 50.0 },
  { name: 'AlphaCode 2', organization: 'Google', category: 'Code Models', provider: 'Google', tokens: 14.9, value: '$2T', change: 10.1 },
  { name: 'StarCoder 2', organization: 'Hugging Face', category: 'Code Models', provider: 'Other', tokens: 14.6, value: '$4.5B', change: 14.3 },
  { name: 'Code Llama', organization: 'Meta', category: 'Code Models', provider: 'Meta', tokens: 11.9, value: '$1.3T', change: 9.5 },
  { name: 'CodeGemma', organization: 'Google', category: 'Code Models', provider: 'Google', tokens: 9.5, value: '$2T', change: 8.1 },
  
  // Domain-Specific (4 models)
  { name: 'AlphaFold 3', organization: 'Google', category: 'Domain-Specific', provider: 'Google', tokens: 14.3, value: '$2T', change: 13.8 },
  { name: 'Galactica', organization: 'Meta', category: 'Domain-Specific', provider: 'Meta', tokens: 14.0, value: '$1.3T', change: 4.9 },
  { name: 'BioMedLM', organization: 'Stanford', category: 'Domain-Specific', provider: 'Other', tokens: 11.6, value: '$30M', change: 11.1 },
  { name: 'ClimateBERT', organization: 'TU Berlin', category: 'Domain-Specific', provider: 'Other', tokens: 9.4, value: '$10M', change: 5.5 },

  // Audio & Speech Models (4 models)
  { name: 'Whisper', organization: 'OpenAI', category: 'Audio & Speech Models', provider: 'OpenAI', tokens: 13.8, value: '$86B', change: 8.2 },
  { name: 'Seamless', organization: 'Meta', category: 'Audio & Speech Models', provider: 'Meta', tokens: 13.5, value: '$1.3T', change: 9.1 },
  { name: 'AudioPaLM', organization: 'Google', category: 'Audio & Speech Models', provider: 'Google', tokens: 11.3, value: '$2T', change: 5.9 },
  { name: 'VALL-E X', organization: 'Microsoft', category: 'Audio & Speech Models', provider: 'Other', tokens: 9.3, value: '$3T', change: 7.7 },

  // Embedding Models (4 models)
  { name: 'Voyage-02', organization: 'Voyage AI', category: 'Embedding Models', provider: 'Other', tokens: 13.2, value: '$150M', change: 16.4 },
  { name: 'text-embedding-3', organization: 'OpenAI', category: 'Embedding Models', provider: 'OpenAI', tokens: 13.0, value: '$86B', change: 6.7 },
  { name: 'BGE', organization: 'BAAI', category: 'Embedding Models', provider: 'Other', tokens: 11.0, value: '$60M', change: 12.3 },
  { name: 'Nomic Embed', organization: 'Nomic', category: 'Embedding Models', provider: 'Other', tokens: 9.2, value: '$40M', change: 10.5 },
  
  // Reinforcement Learning (4 models)
  { name: 'MuZero', organization: 'Google', category: 'Reinforcement Learning', provider: 'Google', tokens: 12.8, value: '$2T', change: 4.1 },
  { name: 'Agent57', organization: 'Google', category: 'Reinforcement Learning', provider: 'Google', tokens: 10.7, value: '$2T', change: 3.5 },
  { name: 'AlphaGo', organization: 'Google', category: 'Reinforcement Learning', provider: 'Google', tokens: 10.1, value: '$2T', change: 2.1 },
  { name: 'DreamerV3', organization: 'Google', category: 'Reinforcement Learning', provider: 'Google', tokens: 9.1, value: '$2T', change: 2.9 },
].sort((a, b) => b.tokens - a.tokens);


const generateChartData = (numPoints: number, timeUnit: 'days' | 'weeks' | 'months', modelMetrics: any[]) => {
  const data = [];
  const today = new Date();

  for (let i = numPoints - 1; i >= 0; i--) {
    let date;
    if (timeUnit === 'days') {
      date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    } else if (timeUnit === 'weeks') {
      date = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    } else { // months
      date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    }
    
    const dataPoint: { [key: string]: any } = {
      date: date.toISOString().split('T')[0]
    };

    modelMetrics.forEach(metric => {
      const value = metric.base * Math.pow(metric.growth, (numPoints - i) / numPoints);
      const noise = value * (Math.random() - 0.4) * 0.3;
      dataPoint[metric.name] = Math.max(0, parseFloat((value + noise).toFixed(1)));
    });
    
    data.push(dataPoint);
  }
  return data;
};

const modelNames = topModels.map(m => m.name);
const modelMetrics = modelNames.map((name, i) => ({
  name,
  base: 10 + i * 0.5 + Math.random() * 5,
  growth: 1.05 + Math.random() * 0.1
}));

export const yearlyModelTokenData = generateChartData(52, 'weeks', modelMetrics);
export const monthlyModelTokenData = generateChartData(30, 'days', modelMetrics);
export const weeklyModelTokenData = generateChartData(7, 'days', modelMetrics);

export const adjustModelDataForTimeRange = (models: ModelData[], timeRange: 'year' | 'month' | 'week'): ModelData[] => {
  const multiplier = {
    year: 1,
    month: 1/12,
    week: 1/52,
  };

  const changeVolatility = {
    year: 1,
    month: 2.5,
    week: 4,
  }

  return models.map(model => ({
    ...model,
    tokens: parseFloat((model.tokens * multiplier[timeRange] * (1 + (Math.random() - 0.5) * 0.1)).toFixed(1)),
    change: parseFloat((model.change * (1 + (Math.random() - 0.5) * changeVolatility[timeRange])).toFixed(1)),
  })).sort((a, b) => b.tokens - a.tokens);
};
