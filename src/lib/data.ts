export type ModelData = {
  name: string;
  organization: string;
  category: 'Language' | 'Vision' | 'Multimodal' | 'Audio & Speech Models' | 'Code Models' | 'Reinforcement Learning Agents' | 'Embedding Models' | 'Scientific/Domain-Specific Models';
  subCategories?: ('Text' | 'Image' | 'Audio' | 'Video')[];
  provider: 'OpenAI' | 'Google' | 'Anthropic' | 'Meta' | 'Mistral' | 'Other';
  tokens: number;
  value: string;
  change: number;
};

export const topModels: ModelData[] = [
  // Reinforcement Learning Agents
  { name: 'AlphaGo', organization: 'Google', category: 'Reinforcement Learning Agents', provider: 'Google', tokens: 20.0, value: '$1.5T', change: 5.0 },
  { name: 'Devin', organization: 'Cognition', category: 'Code Models', provider: 'Other', tokens: 19.1, value: '$2B', change: 25.0 },
  { name: 'Aether-7B', organization: 'QuantumLeap', category: 'Language', provider: 'Other', tokens: 18.5, value: '$1.2B', change: 5.2 },
  { name: 'MuZero', organization: 'Google', category: 'Reinforcement Learning Agents', provider: 'Google', tokens: 18.2, value: '$1.5T', change: 7.3 },
  { name: 'Agent57', organization: 'Google', category: 'Reinforcement Learning Agents', provider: 'Google', tokens: 17.5, value: '$1.5T', change: 6.1 },
  { name: 'GPT-4o', organization: 'OpenAI', category: 'Multimodal', subCategories: ['Text', 'Image', 'Audio', 'Video'], provider: 'OpenAI', tokens: 17.2, value: '$80B', change: 12.5 },
  { name: 'AlphaFold 3', organization: 'Google', category: 'Scientific/Domain-Specific Models', provider: 'Google', tokens: 16.3, value: '$1.5T', change: 11.8 },
  { name: 'Gemini 2.1 Pro', organization: 'Google', category: 'Multimodal', subCategories: ['Text', 'Image', 'Audio'], provider: 'Google', tokens: 15.8, value: '$1.5T', change: 8.1 },
  { name: 'Nexus-RL', organization: 'Cyberdyne', category: 'Reinforcement Learning Agents', provider: 'Other', tokens: 15.5, value: '$5.6B', change: 8.5 },
  { name: 'AlphaCode 2', organization: 'Google', category: 'Code Models', provider: 'Google', tokens: 14.8, value: '$1.5T', change: 9.9 },
  { name: 'Claude 3.5 Sonnet', organization: 'Anthropic', category: 'Language', provider: 'Anthropic', tokens: 14.1, value: '$18.4B', change: 15.3 },
  { name: 'Gemma 2', organization: 'Google', category: 'Language', provider: 'Google', tokens: 13.5, value: '$1.5T', change: 5.9 },
  { name: 'Codex', organization: 'OpenAI', category: 'Code Models', provider: 'OpenAI', tokens: 13.2, value: '$80B', change: 11.5 },
  { name: 'Llama 4', organization: 'Meta', category: 'Language', provider: 'Meta', tokens: 12.9, value: '$1.2T', change: 6.7 },
  { name: 'Galactica', organization: 'Meta', category: 'Scientific/Domain-Specific Models', provider: 'Meta', tokens: 12.4, value: '$1.2T', change: 7.7 },
  { name: 'SimPLe', organization: 'Berkeley', category: 'Reinforcement Learning Agents', provider: 'Other', tokens: 12.1, value: '$10M', change: 12.8 },
  { name: 'BioMedLM', organization: 'Stanford', category: 'Scientific/Domain-Specific Models', provider: 'Other', tokens: 11.8, value: '$25M', change: 14.5 },
  { name: 'DBRX', organization: 'Databricks', category: 'Language', provider: 'Other', tokens: 11.5, value: '$43B', change: 10.1 },
  { name: 'Segment Anything', organization: 'Meta', category: 'Vision', provider: 'Meta', tokens: 11.2, value: '$1.2T', change: 6.8 },
  { name: 'Whisper', organization: 'OpenAI', category: 'Audio & Speech Models', provider: 'OpenAI', tokens: 11.1, value: '$80B', change: 9.8 },
  
  // These models will be used to fill categories that have less than 10 models
  { name: 'CLIP', organization: 'OpenAI', category: 'Vision', provider: 'OpenAI', tokens: 10.8, value: '$80B', change: 2.5 },
  { name: 'Code Llama', organization: 'Meta', category: 'Code Models', provider: 'Meta', tokens: 10.5, value: '$1.2T', change: 8.2 },
  { name: 'Mistral Large 2', organization: 'Mistral', category: 'Language', provider: 'Mistral', tokens: 10.3, value: '$2B', change: 22.4 },
  { name: 'SciBERT', organization: 'AllenAI', category: 'Scientific/Domain-Specific Models', provider: 'Other', tokens: 10.2, value: '$150M', change: 9.2 },
  { name: 'text-embedding-3', organization: 'OpenAI', category: 'Embedding Models', provider: 'OpenAI', tokens: 9.9, value: '$80B', change: 4.2 },
  { name: 'Command R+', organization: 'Cohere', category: 'Language', provider: 'Other', tokens: 9.8, value: '$5B', change: 8.8 },
  { name: 'ClimateBERT', organization: 'ETH Zurich', category: 'Scientific/Domain-Specific Models', provider: 'Other', tokens: 9.7, value: '$12M', change: 8.1 },
  { name: 'Voyage-02', organization: 'Voyage AI', category: 'Embedding Models', provider: 'Other', tokens: 9.5, value: '$100M', change: 13.3 },
  { name: 'DINOv2', organization: 'Meta', category: 'Vision', provider: 'Meta', tokens: 9.5, value: '$1.2T', change: 5.5 },
  { name: 'AudioPaLM', organization: 'Google', category: 'Audio & Speech Models', provider: 'Google', tokens: 9.5, value: '$1.5T', change: 7.1 },
  { name: 'CogVLM 2', organization: 'THUDM', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Other', tokens: 9.3, value: '$250M', change: 7.3 },
  { name: 'StarCoder 2', organization: 'Hugging Face', category: 'Code Models', provider: 'Other', tokens: 9.2, value: '$4.5B', change: 15.1 },
  { name: 'Florence-2', organization: 'Microsoft', category: 'Vision', provider: 'Other', tokens: 9.1, value: '$3T', change: 7.6 },
  { name: 'E5', organization: 'Microsoft', category: 'Embedding Models', provider: 'Other', tokens: 9.1, value: '$3T', change: 6.6 },
  { name: 'VisionX-Pro', organization: 'DeepSight', category: 'Vision', provider: 'Other', tokens: 8.9, value: '$750M', change: -2.1 },
  { name: 'Universal Sentence Encoder', organization: 'Google', category: 'Embedding Models', provider: 'Google', tokens: 8.8, value: '$1.5T', change: 3.9 },
  { name: 'PaliGemma', organization: 'Google', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Google', tokens: 8.5, value: '$1.5T', change: 4.5 },
  { name: 'DeepSeek-VL', organization: 'DeepSeek', category: 'Vision', provider: 'Other', tokens: 8.5, value: '$300M', change: 13.4 },
  { name: 'BGE', organization: 'BAAI', category: 'Embedding Models', provider: 'Other', tokens: 8.5, value: '$50M', change: 10.1 },
  { name: 'Voicebox', organization: 'Meta', category: 'Audio & Speech Models', provider: 'Meta', tokens: 8.3, value: '$1.2T', change: 5.4 },
  { name: 'Jamba', organization: 'AI21 Labs', category: 'Language', provider: 'Other', tokens: 8.2, value: '$1.4B', change: 6.2 },
  { name: 'IDEFICS-2', organization: 'Hugging Face', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Other', tokens: 8.0, value: '$4.5B', change: 9.1 },
  { name: 'Yi-1.5', organization: '01.AI', category: 'Language', provider: 'Other', tokens: 7.9, value: '$1B', change: 19.3 },
  { name: 'Seamless', organization: 'Meta', category: 'Audio & Speech Models', provider: 'Meta', tokens: 7.9, value: '$1.2T', change: 11.2 },
  { name: 'Owl-ViT v2', organization: 'Google', category: 'Vision', provider: 'Google', tokens: 7.8, value: '$1.5T', change: 4.1 },
  { name: 'Nexus-9', organization: 'Cyberdyne', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Other', tokens: 7.5, value: '$5.6B', change: 3.8 },
  { name: 'I-JEPA', organization: 'Meta', category: 'Vision', provider: 'Meta', tokens: 7.2, value: '$1.2T', change: 3.1 },
  { name: 'LLaVA-NeXT', organization: 'Various', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Other', tokens: 7.1, value: '$120M', change: 11.5 },
  { name: 'Video-LLaVA', organization: 'PKU-YuanGroup', category: 'Multimodal', subCategories: ['Text', 'Image', 'Video'], provider: 'Other', tokens: 6.8, value: '$50M', change: 18.2 },
  { name: 'Sonix-Pro', organization: 'Echo AI', category: 'Audio & Speech Models', provider: 'Other', tokens: 6.8, value: '$300M', change: 14.3 },
  { name: 'YOLO-World', organization: 'Tencent', category: 'Vision', provider: 'Other', tokens: 6.5, value: '$400B', change: 16.7 },
  { name: 'Fuyu-8B', organization: 'Adept', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Other', tokens: 6.2, value: '$350M', change: -1.8 },
  { name: 'Oracle-Prime', organization: 'Delphi AI', category: 'Language', provider: 'Other', tokens: 6.1, value: '$980M', change: 1.5 },
  { name: 'ShareGPT4V', organization: 'S-Lab', category: 'Multimodal', subCategories: ['Text', 'Image'], provider: 'Other', tokens: 5.9, value: '$40M', change: 14.9 },
  { name: 'Synth-3', organization: 'Artisan AI', category: 'Vision', provider: 'Other', tokens: 5.4, value: '$450M', change: -4.5 },
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
