// src/app/api/chat/route.ts

import { NextResponse } from "next/server";
import { createChatSession, sendChatMessage } from "@/lib/gemini";
import { askPerplexity } from "@/lib/perplexity";
import { personas } from "@/config/personas";
import { routeLLM } from "@/lib/llmRouter"; // Add this import

export async function POST(req: Request) {
  try {
    const { message, selectedPersonaId, conversationHistory }: {
      message: string;
      selectedPersonaId: string;
      conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
    } = await req.json();

    const persona = personas.find(p => p.id === selectedPersonaId);

    if (!message || !persona) {
      return NextResponse.json({ error: "Missing message or persona" }, { status: 400 });
    }

    // Build messages array for LLM
    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      { role: "system", content: persona.system_prompt }, // Add system prompt as a message
      ...(conversationHistory || []).map(msg => ({
        role: msg.role, // Already has type "user" | "assistant"
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await routeLLM({
      persona,
      messages,
    });

    // Adapt response shape as needed for your frontend
    return NextResponse.json({
      reply: response.text || response.choices?.[0]?.message?.content || "",
      usage: response.usage
    });
  } catch (error) {
    console.error("Chat API Error:", error);
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