import { NextResponse } from "next/server";
import { createChatSession, streamChatResponse } from "@/lib/gemini";
import { personas } from "@/config/personas";
import { askPerplexity, PerplexityModel } from "@/lib/perplexity";
import { askOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { message, selectedPersonaId, conversationHistory: rawConversationHistory }: {
      message: string;
      selectedPersonaId: string;
      conversationHistory?: Array<{ role: string; content: string }>; // Temporarily allow string to receive, then cast
    } = await req.json();

    // Explicitly cast roles in conversation history to expected types
    const conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = 
      (rawConversationHistory || []).map(msg => ({
        role: (msg.role === "user" ? "user" : "assistant"),
        content: msg.content,
      }));

    const persona = personas.find(p => p.id === selectedPersonaId);

    if (!message || !persona) {
      return NextResponse.json({ error: "Missing message or persona" }, { status: 400 });
    }

    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      { role: "system", content: persona.system_prompt },
      ...(conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })) as Array<{ role: "user" | "assistant" | "system"; content: string }>),
      { role: "user", content: message },
    ];

    const { llm, model, temperature, maxTokens, topP, topK } = persona.modelConfig;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (llm === "gemini") {
            const geminiHistory = messages
              .filter(msg => msg.role !== "system")
              .map(msg => ({
                role: (msg.role === "assistant" ? "model" : "user") as "user" | "model",
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

            const streamGenerator = streamChatResponse(chat, userMessage, systemPrompt);

            for await (const chunk of streamGenerator) {
              const data = JSON.stringify({ chunk, done: false });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          } else if (llm === "perplexity") {
            const perplexityMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = messages.map(msg => ({
              role: msg.role === "system" ? "system" : (msg.role === "assistant" ? "assistant" : "user"),
              content: msg.content,
            }));

            const res = await askPerplexity({
              model: model as PerplexityModel,
              messages: perplexityMessages,
              temperature,
              maxTokens,
              topP,
              topK,
            });

            const reply = res.choices?.[0]?.message?.content || "";
            // For non-streaming Perplexity response, send as a single chunk
            const data = JSON.stringify({ chunk: reply, done: false });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));

          } else if (llm === "openai") {
            const openaiStream = await askOpenAI({
              model,
              messages,
              temperature,
              maxTokens,
              topP,
            });

            for await (const chunk of openaiStream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                const data = JSON.stringify({ chunk: content, done: false });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              }
            }
          }
          else {
            throw new Error(`Unsupported LLM for streaming: ${llm}`);
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