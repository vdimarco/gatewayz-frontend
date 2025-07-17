"use server";

import { summarizeModelNews } from "@/ai/flows/summarize-model-news";
import type { SummarizeModelNewsInput } from "@/ai/flows/summarize-model-news";

export async function getSummary(data: SummarizeModelNewsInput) {
  try {
    const result = await summarizeModelNews(data);
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error("Error summarizing news:", error);
    let errorMessage = "An unknown error occurred while summarizing the news.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
