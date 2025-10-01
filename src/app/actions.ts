'use server';

export type ChatInput = {
  modelName: string;
  prompt: string;
};

/**
 * Mock chat function - replace with actual AI integration
 */
export async function chat(input: ChatInput): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return a mock response
  return `This is a mock response to: "${input.prompt}". The AI integration has been removed. Please connect a real AI provider to enable chat functionality.`;
}
