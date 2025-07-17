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
  { name: 'Aether-7B', organization: 'QuantumLeap', category: 'Language', provider: 'Other', tokens: 18.5, value: '$1.2B', change: 5.2 },
  { name: 'GPT-4o', organization: 'OpenAI', category: 'Multimodal', provider: 'OpenAI', tokens: 17.2, value: '$80B', change: 12.5 },
  { name: 'Gemini 2.1 Pro', organization: 'Google', category: 'Multimodal', provider: 'Google', tokens: 15.8, value: '$1.5T', change: 8.1 },
  { name: 'Claude 3.5 Sonnet', organization: 'Anthropic', category: 'Language', provider: 'Anthropic', tokens: 14.1, value: '$18.4B', change: 15.3 },
  { name: 'Llama 4', organization: 'Meta', category: 'Language', provider: 'Meta', tokens: 12.9, value: '$1.2T', change: 6.7 },
  { name: 'Mistral Large 2', organization: 'Mistral', category: 'Language', provider: 'Mistral', tokens: 10.3, value: '$2B', change: 22.4 },
  { name: 'VisionX-Pro', organization: 'DeepSight', category: 'Vision', provider: 'Other', tokens: 8.9, value: '$750M', change: -2.1 },
  { name: 'Nexus-9', organization: 'Cyberdyne', category: 'Multimodal', provider: 'Other', tokens: 7.5, value: '$5.6B', change: 3.8 },
  { name: 'Oracle-Prime', organization: 'Delphi AI', category: 'Language', provider: 'Other', tokens: 6.1, value: '$980M', change: 1.5 },
  { name: 'Synth-3', organization: 'Artisan AI', category: 'Vision', provider: 'Other', tokens: 5.4, value: '$450M', change: -4.5 },
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
