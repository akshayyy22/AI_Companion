import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Type definitions for better type safety
export interface ChatMessage {
  role: "user" | "model";
  parts: string[];
}

export interface ChatResponse {
  text: string;
  usage?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface ChatOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  systemPrompt?: string;
}

/**
 * Create a new chat session with the Gemini model
 */
export function createChatSession(options: ChatOptions = {}) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp", 
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topK: options.topK ?? 40,
      topP: options.topP ?? 0.95,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  return model.startChat({
    history: [],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topK: options.topK ?? 40,
      topP: options.topP ?? 0.95,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  });
}

/**
 * Send a message to the chat and get a response
 */
export async function sendChatMessage(
  chat: ChatSession,
  message: string,
  systemPrompt?: string
): Promise<ChatResponse> {
  try {
    // Prepare the message with optional system prompt
    const fullMessage = systemPrompt 
      ? `${systemPrompt}\n\nUser: ${message}`
      : message;

    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    
    // Get usage statistics if available
    const usage = result.response.usageMetadata ? {
      promptTokenCount: result.response.usageMetadata.promptTokenCount,
      candidatesTokenCount: result.response.usageMetadata.candidatesTokenCount,
      totalTokenCount: result.response.usageMetadata.totalTokenCount,
    } : undefined;

    return {
      text: response.text(),
      usage,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function getGeminiChatResponse(userMessage: string, systemPrompt: string): Promise<string> {
  const chat = createChatSession();
  const response = await sendChatMessage(chat, userMessage, systemPrompt);
  return response.text;
}

/**
 * Stream chat response for real-time updates
 */
export async function* streamChatResponse(
  chat: ChatSession,
  message: string,
  systemPrompt?: string
): AsyncGenerator<string> {
  try {
    const fullMessage = systemPrompt 
      ? `${systemPrompt}\n\nUser: ${message}`
      : message;

    const result = await chat.sendMessageStream(fullMessage);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    throw new Error(`Failed to stream response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
