// src/app/api/chat/route.ts

import { NextResponse } from "next/server";
import type { Persona } from "@/types/persona";
import { createChatSession, sendChatMessage } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message, persona, conversationHistory }: { 
      message: string; 
      persona: Persona;
      conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
    } = await req.json();

    if (!message || !persona?.system_prompt) {
      return NextResponse.json({ error: "Missing message or persona" }, { status: 400 });
    }

    // Create a new chat session with persona-specific configuration
    const chat = createChatSession({
      temperature: 0.8,
      maxOutputTokens: 2048,
      systemPrompt: persona.system_prompt,
    });

    // Send the message and get response
    const response = await sendChatMessage(chat, message, persona.system_prompt);

    return NextResponse.json({ 
      reply: response.text,
      usage: response.usage 
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }
      if (error.message.includes("quota")) {
        return NextResponse.json({ error: "API quota exceeded" }, { status: 429 });
      }
    }
    
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
