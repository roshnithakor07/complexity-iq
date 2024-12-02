import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are ComplexityIQ — an expert algorithm analyst specialising in Big-O notation and computational complexity theory.

Your job is to analyse code and return a JSON response ONLY. No markdown, no explanation outside the JSON.

Return EXACTLY this JSON structure:
{
  "time_complexity": {
    "notation": "O(n²)",
    "name": "Quadratic",
    "rating": "poor",
    "explanation": "Brief explanation of why"
  },
  "space_complexity": {
    "notation": "O(n)",
    "name": "Linear",
    "rating": "good",
    "explanation": "Brief explanation of why"
  },
  "loops_detected": 2,
  "recursive": false,
  "best_case": "O(n)",
  "worst_case": "O(n²)",
  "average_case": "O(n²)",
  "bottleneck": "Nested for loops at lines X-Y",
  "suggestions": [
    "Use a hash map to reduce to O(n)",
    "Consider early exit conditions"
  ],
  "overall_score": 55,
  "language_detected": "javascript"
}

Rating values MUST be one of: "excellent", "good", "fair", "poor", "critical"
Score is 0-100 (100 = best).
Rating guide: O(1), O(log n) -> excellent | O(n) -> good | O(n log n) -> fair | O(n^2) -> poor | O(2^n), O(n!) -> critical
Be accurate. Analyse deeply. Count nested loops. Detect recursion.`;

export async function POST(request) {
  try {
    // ── Guard: empty or malformed body ──────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { code, language } = body;

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }
    if (code.length > 10000) {
      return NextResponse.json({ error: "Code too long. Maximum 10,000 characters." }, { status: 400 });
    }

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyse this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`` },
      ],
    });

    const raw   = message.choices[0].message.content.trim();
    const clean = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

    // ── Robust JSON extraction ───────────────────────────────────────────────
    let result;
    for (const attempt of [clean, clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1)]) {
      try { result = JSON.parse(attempt); break; } catch {}
    }
    if (!result) {
      return NextResponse.json({ error: "Failed to parse AI response. Please try again." }, { status: 500 });
    }

    // ── Normalise fields so frontend never gets undefined ────────────────────
    const vr = ["excellent","good","fair","poor","critical"];
    const safe = {
      time_complexity: {
        notation:    String(result.time_complexity?.notation    || "O(?)"),
        name:        String(result.time_complexity?.name        || ""),
        rating:      vr.includes(result.time_complexity?.rating)  ? result.time_complexity.rating  : "fair",
        explanation: String(result.time_complexity?.explanation  || ""),
      },
      space_complexity: {
        notation:    String(result.space_complexity?.notation   || "O(?)"),
        name:        String(result.space_complexity?.name       || ""),
        rating:      vr.includes(result.space_complexity?.rating) ? result.space_complexity.rating : "fair",
        explanation: String(result.space_complexity?.explanation || ""),
      },
      loops_detected:    Number(result.loops_detected)  || 0,
      recursive:         Boolean(result.recursive),
      best_case:         String(result.best_case     || ""),
      worst_case:        String(result.worst_case    || ""),
      average_case:      String(result.average_case  || ""),
      bottleneck:        String(result.bottleneck    || ""),
      suggestions:       Array.isArray(result.suggestions) ? result.suggestions : [],
      overall_score:     Number(result.overall_score) || 50,
      language_detected: String(result.language_detected || language),
    };

    return NextResponse.json({ success: true, result: safe });

  } catch (error) {
    console.error("Analysis error:", error);
    if (error?.status === 429) {
      return NextResponse.json({ error: "Rate limit hit. Please wait a moment and try again." }, { status: 429 });
    }
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}