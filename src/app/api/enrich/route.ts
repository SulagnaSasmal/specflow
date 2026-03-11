import { NextRequest, NextResponse } from "next/server";
import type { EnrichmentTarget, EnrichmentResult } from "@/lib/enrichment";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrichRequest {
  targets: EnrichmentTarget[];
  apiKey: string;
  model?: string;
  systemPrompt?: string;
  apiTitle?: string;
}

interface EnrichResponse {
  results: EnrichmentResult[];
  stats: { total: number; enriched: number; failed: number };
  error?: string;
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildSystemMessage(apiTitle: string, extra?: string): string {
  return [
    `You are a senior technical writer generating documentation for a REST API called "${apiTitle}".`,
    "Write in active voice, second person (\"you\"), present tense.",
    "Be concise: summaries must be ≤12 words; descriptions ≤3 sentences.",
    "Never use filler words like 'simply', 'just', or 'easy'.",
    "Do not repeat the endpoint path or HTTP method in the summary.",
    "Output only the requested text — no markdown, no code blocks, no labels, no quotes.",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildUserMessage(target: EnrichmentTarget): string {
  switch (target.type) {
    case "operation_summary":
      return (
        `Write a summary (≤12 words) for this endpoint:\n` +
        `Method: ${target.method?.toUpperCase()}\n` +
        `Path: ${target.path}\n` +
        `Existing summary (if any): "${target.currentValue}"\n\n` +
        `Output only the summary text.`
      );

    case "operation_description":
      return (
        `Write a description (1-3 sentences) for this endpoint:\n` +
        `Method: ${target.method?.toUpperCase()}\n` +
        `Path: ${target.path}\n` +
        `Existing description (if any): "${target.currentValue}"\n\n` +
        `Explain what the endpoint does, what it returns, and any important behaviour. Output only the description text.`
      );

    case "tag_description":
      return (
        `Write a description (1-2 sentences) for the API resource group called "${target.tagName}".\n` +
        `Existing description (if any): "${target.currentValue}"\n\n` +
        `Output only the description text.`
      );
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<EnrichResponse>> {
  let body: EnrichRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { results: [], stats: { total: 0, enriched: 0, failed: 0 }, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { targets, apiKey, model = "gpt-4o-mini", systemPrompt = "", apiTitle = "API" } = body;

  if (!apiKey || !apiKey.startsWith("sk-")) {
    return NextResponse.json(
      { results: [], stats: { total: 0, enriched: 0, failed: 0 }, error: "A valid OpenAI API key is required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(targets) || targets.length === 0) {
    return NextResponse.json(
      { results: [], stats: { total: 0, enriched: 0, failed: 0 }, error: "No enrichment targets provided" },
      { status: 400 }
    );
  }

  // Cap at 50 targets per request to avoid runaway costs
  const safeTargets = targets.slice(0, 50);
  const systemMessage = buildSystemMessage(apiTitle, systemPrompt);
  const results: EnrichmentResult[] = [];
  let failed = 0;

  // Process each target — sequential to respect OpenAI rate limits
  for (const target of safeTargets) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: buildUserMessage(target) },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        // Propagate auth errors immediately — no point retrying
        if (response.status === 401) {
          return NextResponse.json(
            {
              results,
              stats: { total: safeTargets.length, enriched: results.length, failed: safeTargets.length - results.length },
              error: "Invalid OpenAI API key",
            },
            { status: 401 }
          );
        }
        console.error("OpenAI error", response.status, errBody);
        failed++;
        continue;
      }

      const data = await response.json();
      const text: string = data.choices?.[0]?.message?.content?.trim() ?? "";

      if (text) {
        results.push({
          type: target.type,
          operationId: target.operationId,
          method: target.method,
          path: target.path,
          tagName: target.tagName,
          enrichedValue: text,
        });
      } else {
        failed++;
      }
    } catch (err) {
      console.error("Enrichment fetch error", err);
      failed++;
    }
  }

  return NextResponse.json({
    results,
    stats: { total: safeTargets.length, enriched: results.length, failed },
  });
}
