import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askOpenAI({
  model,
  messages,
  temperature,
  maxTokens,
  topP,
}: {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature: number;
  maxTokens: number;
  topP?: number;
}) {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: true,
    });
    return response;
  } catch (error) {
    console.error("Error communicating with OpenAI:", error);
    throw error;
  }
}

export type OpenAIChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
}; 