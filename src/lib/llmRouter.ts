// src/lib/llmRouter.ts
import { askPerplexity, PerplexityModel } from "@/lib/perplexity";
import { createChatSession, sendChatMessage } from "@/lib/gemini";
import { askOpenAI } from "@/lib/openai";
import type { ExtendedPersona } from "@/config/personas";
import type { ChatMessage } from "@/lib/gemini"; 

export async function routeLLM({
  persona,
  messages,
}: {
  persona: ExtendedPersona;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}) {
  const { llm, model, temperature, maxTokens, topP, topK } = persona.modelConfig;

  // Perplexity Configuration
  if (llm === "perplexity") {
    return askPerplexity({
      model: model as PerplexityModel,
      messages: messages.map(msg => ({
        role: msg.role === "system" ? "system" : (msg.role === "assistant" ? "assistant" : "user"),
        content: msg.content,
      })),
      temperature,
      maxTokens,
      topP,
      topK,
    });
  }

  //Gemini Configuration
  if (llm === "gemini") {
    const geminiHistory: ChatMessage[] = messages
      .filter(msg => msg.role !== "system")
      .map(msg => ({
        role: (msg.role === "assistant" ? "model" : "user") as "user" | "model", // Explicit cast here
        parts: [{ text: msg.content }],
      }));

    const userMessage = geminiHistory.pop()?.parts[0]?.text || "";
    const initialHistory = geminiHistory;
    const systemPrompt = persona.system_prompt;

    const chat = createChatSession({
      model,
      temperature,
      maxOutputTokens: maxTokens,
      topP,
      topK,
      systemPrompt,
      history: initialHistory,
    });

    return sendChatMessage(chat, userMessage, systemPrompt);
  }

  // OpenAI Configuration
  if (llm === "openai") {
    return askOpenAI({
      model,
      messages,
      temperature,
      maxTokens,
      topP,
      // topK is not supported by OpenAI, so we omit it or provide a default if necessary
    });
  }
  

  throw new Error(`Unsupported LLM: ${llm}`);
}