// src/lib/perplexity.ts
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY!; 

export type PerplexityModel =
  | "sonar"
  | "sonar-pro"
  | "sonar-reasoning"
  | "sonar-reasoning-pro"
  | "sonar-deep-research";

export async function askPerplexity({
  model,
  messages,
  temperature,
  maxTokens,
  topP,
  topK,
}: {
  model: PerplexityModel;
  messages: { role: "user" | "system" | "assistant"; content: string }[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}) {
  const res = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens, // Perplexity API uses max_tokens
      top_p: topP,
      top_k: topK,
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.statusText}`);
  }
  return res.json();
}