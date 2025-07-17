export type ModelData = {
  name: string;
  organization: string;
  category: 'Language' | 'Vision' | 'Multimodal';
  provider: 'OpenAI' | 'Google' | 'Anthropic' | 'Meta' | 'Mistral' | 'Other';
  tokens: number;
  value: string;
  change: number;
};

export const topModels: ModelData[] = [
  // Multimodal
  { name: 'GPT-4o', organization: 'OpenAI', category: 'Multimodal', provider: 'OpenAI', tokens: 17.2, value: '$80B', change: 12.5 },
  { name: 'Gemini 2.1 Pro', organization: 'Google', category: 'Multimodal', provider: 'Google', tokens: 15.8, value: '$1.5T', change: 8.1 },
  { name: 'Nexus-9', organization: 'Cyberdyne', category: 'Multimodal', provider: 'Other', tokens: 7.5, value: '$5.6B', change: 3.8 },
  { name: 'IDEFICS-2', organization: 'Hugging Face', category: 'Multimodal', provider: 'Other', tokens: 8.0, value: '$4.5B', change: 9.1 },
  { name: 'Video-LLaVA', organization: 'PKU-YuanGroup', category: 'Multimodal', provider: 'Other', tokens: 6.8, value: '$50M', change: 18.2 },
  { name: 'LLaVA-NeXT', organization: 'Various', category: 'Multimodal', provider: 'Other', tokens: 7.1, value: '$120M', change: 11.5 },
  { name: 'CogVLM 2', organization: 'THUDM', category: 'Multimodal', provider: 'Other', tokens: 9.3, value: '$250M', change: 7.3 },
  { name: 'ShareGPT4V', organization: 'S-Lab', category: 'Multimodal', provider: 'Other', tokens: 5.9, value: '$40M', change: 14.9 },
  { name: 'PaliGemma', organization: 'Google', category: 'Multimodal', provider: 'Google', tokens: 8.5, value: '$1.5T', change: 4.5 },
  { name: 'Fuyu-8B', organization: 'Adept', category: 'Multimodal', provider: 'Other', tokens: 6.2, value: '$350M', change: -1.8 },
  
  // Language
  { name: 'Claude 3.5 Sonnet', organization: 'Anthropic', category: 'Language', provider: 'Anthropic', tokens: 14.1, value: '$18.4B', change: 15.3 },
  { name: 'Llama 4', organization: 'Meta', category: 'Language', provider: 'Meta', tokens: 12.9, value: '$1.2T', change: 6.7 },
  { name: 'Mistral Large 2', organization: 'Mistral', category: 'Language', provider: 'Mistral', tokens: 10.3, value: '$2B', change: 22.4 },
  { name: 'Aether-7B', organization: 'QuantumLeap', category: 'Language', provider: 'Other', tokens: 18.5, value: '$1.2B', change: 5.2 },
  { name: 'Oracle-Prime', organization: 'Delphi AI', category: 'Language', provider: 'Other', tokens: 6.1, value: '$980M', change: 1.5 },
  { name: 'DBRX', organization: 'Databricks', category: 'Language', provider: 'Other', tokens: 11.5, value: '$43B', change: 10.1 },
  { name: 'Command R+', organization: 'Cohere', category: 'Language', provider: 'Other', tokens: 9.8, value: '$5B', change: 8.8 },
  { name: 'Jamba', organization: 'AI21 Labs', category: 'Language', provider: 'Other', tokens: 8.2, value: '$1.4B', change: 6.2 },
  { name: 'Gemma 2', organization: 'Google', category: 'Language', provider: 'Google', tokens: 13.5, value: '$1.5T', change: 5.9 },
  { name: 'Yi-1.5', organization: '01.AI', category: 'Language', provider: 'Other', tokens: 7.9, value: '$1B', change: 19.3 },

  // Vision
  { name: 'VisionX-Pro', organization: 'DeepSight', category: 'Vision', provider: 'Other', tokens: 8.9, value: '$750M', change: -2.1 },
  { name: 'Synth-3', organization: 'Artisan AI', category: 'Vision', provider: 'Other', tokens: 5.4, value: '$450M', change: -4.5 },
  { name: 'I-JEPA', organization: 'Meta', category: 'Vision', provider: 'Meta', tokens: 7.2, value: '$1.2T', change: 3.1 },
  { name: 'Florence-2', organization: 'Microsoft', category: 'Vision', provider: 'Other', tokens: 9.1, value: '$3T', change: 7.6 },
  { name: 'DeepSeek-VL', organization: 'DeepSeek', category: 'Vision', provider: 'Other', tokens: 8.5, value: '$300M', change: 13.4 },
  { name: 'CLIP', organization: 'OpenAI', category: 'Vision', provider: 'OpenAI', tokens: 10.8, value: '$80B', change: 2.5 },
  { name: 'Owl-ViT v2', organization: 'Google', category: 'Vision', provider: 'Google', tokens: 7.8, value: '$1.5T', change: 4.1 },
  { name: 'DINOv2', organization: 'Meta', category: 'Vision', provider: 'Meta', tokens: 9.5, value: '$1.2T', change: 5.5 },
  { name: 'Segment Anything', organization: 'Meta', category: 'Vision', provider: 'Meta', tokens: 11.2, value: '$1.2T', change: 6.8 },
  { name: 'YOLO-World', organization: 'Tencent', category: 'Vision', provider: 'Other', tokens: 6.5, value: '$400B', change: 16.7 },
];

export const chartData = topModels.map(model => ({
  name: model.name,
  tokens: model.tokens,
}));

// Function to get short month name and year
const getMonthYear = (date: Date) => {
  return date.toLocaleString('default', { month: 'short', year: '2-digit' }).replace(' ', ' \'');
};

const generateMonthlyData = () => {
  const data = [];
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthYear = getMonthYear(date);

    // Some plausible random data with upward trend
    const baseLanguage = 20 + i * 1.5;
    const baseVision = 5 + i * 0.8;
    const baseMultimodal = 8 + i * 1.2;

    data.push({
      month: monthYear,
      Language: parseFloat((baseLanguage + Math.random() * 5).toFixed(1)),
      Vision: parseFloat((baseVision + Math.random() * 3).toFixed(1)),
      Multimodal: parseFloat((baseMultimodal + Math.random() * 4).toFixed(1)),
    });
  }
  return data;
};

export const monthlyTokenData = generateMonthlyData();


const generateModelDataForChart = () => {
  const data = [];
  const today = new Date();
  const modelNames = topModels.map(m => m.name);
  
  // Base values and growth factors for each model to create some variation
  const modelMetrics = modelNames.map((name, i) => ({
    name,
    base: 10 + i * 2 + Math.random() * 5,
    growth: 1.05 + Math.random() * 0.15
  }));

  for (let i = 52; i >= 0; i--) { // 52 weeks in a year
    const date = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekData: { [key: string]: any } = {
      date: date.toISOString().split('T')[0]
    };

    modelMetrics.forEach(metric => {
      // Calculate value based on some growth formula
      const value = metric.base * Math.pow(metric.growth, (52 - i) / 52 * 4);
      const noise = value * (Math.random() - 0.4) * 0.3;
      weekData[metric.name] = Math.max(0, parseFloat((value + noise).toFixed(1)));
    });
    
    data.push(weekData);
  }
  return data;
};


export const monthlyModelTokenData = generateModelDataForChart();
