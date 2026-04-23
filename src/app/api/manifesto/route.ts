import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, userPromptFor } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

type Manifesto = { title: string; bullets: string[]; signoff: string };

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Set OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  let body: { beliefs?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const beliefs = (body.beliefs ?? []).map((b) => (b ?? "").trim()).filter(Boolean);
  if (beliefs.length < 3) {
    return NextResponse.json({ error: "Give us 3 things you believe in" }, { status: 400 });
  }
  if (beliefs.some((b) => b.length > 100)) {
    return NextResponse.json({ error: "Keep each belief under 100 chars" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.85,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPromptFor(beliefs) },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    let parsed: Manifesto;
    try {
      parsed = JSON.parse(text) as Manifesto;
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON output", raw: text }, { status: 502 });
    }

    if (!parsed.title || !Array.isArray(parsed.bullets) || parsed.bullets.length === 0 || !parsed.signoff) {
      return NextResponse.json({ error: "Model output missing fields", raw: parsed }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
