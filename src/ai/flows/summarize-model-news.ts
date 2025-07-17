// Summarizes news articles about a specified AI model from given URLs.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeModelNewsInputSchema = z.object({
  modelName: z.string().describe('The name of the AI model to summarize news about.'),
  urls: z.array(z.string().url()).describe('An array of URLs of news articles about the model.'),
});
export type SummarizeModelNewsInput = z.infer<typeof SummarizeModelNewsInputSchema>;

const SummarizeModelNewsOutputSchema = z.object({
  summary: z.string().describe('A summary of the news articles about the AI model.'),
});
export type SummarizeModelNewsOutput = z.infer<typeof SummarizeModelNewsOutputSchema>;

export async function summarizeModelNews(input: SummarizeModelNewsInput): Promise<SummarizeModelNewsOutput> {
  return summarizeModelNewsFlow(input);
}

const summarizeModelNewsPrompt = ai.definePrompt({
  name: 'summarizeModelNewsPrompt',
  input: {
    schema: SummarizeModelNewsInputSchema,
  },
  output: {
    schema: SummarizeModelNewsOutputSchema,
  },
  prompt: `Summarize the following news articles about the AI model {{modelName}}.\n\n{% each urls as url %}\nArticle URL: {{url}}\n{% endeach %}\n\nProvide a concise summary of the key developments and sentiment expressed in these articles.`,
});

const summarizeModelNewsFlow = ai.defineFlow(
  {
    name: 'summarizeModelNewsFlow',
    inputSchema: SummarizeModelNewsInputSchema,
    outputSchema: SummarizeModelNewsOutputSchema,
  },
  async input => {
    const {output} = await summarizeModelNewsPrompt(input);
    return output!;
  }
);
