import { NextResponse } from "next/server";
import type { Persona } from "@/types/persona";
import { createChatSession, streamChatResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message, persona }: { 
      message: string; 
      persona: Persona;
    } = await req.json();

    if (!message || !persona?.system_prompt) {
      return NextResponse.json({ error: "Missing message or persona" }, { status: 400 });
    }

    const chat = createChatSession({
      temperature: 0.8,
      maxOutputTokens: 2048,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamGenerator = streamChatResponse(chat, message, persona.system_prompt);
          
          for await (const chunk of streamGenerator) {
            const data = JSON.stringify({ chunk, done: false });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }
          
          const doneData = JSON.stringify({ done: true });
          controller.enqueue(new TextEncoder().encode(`data: ${doneData}\n\n`));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({ 
            error: error instanceof Error ? error.message : "Streaming failed" 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API Error:", error);
    return NextResponse.json({ error: "Failed to start streaming" }, { status: 500 });
  }
} 