import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

Rating guide:
- O(1), O(log n) → excellent
- O(n) → good  
- O(n log n) → fair
- O(n²) → poor
- O(2^n), O(n!) → critical

Be accurate. Analyse deeply. Count nested loops. Detect recursion. Consider all data structures used.`;

export async function POST(request) {
  try {
    const { code, language } = await request.json();

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    if (code.length > 10000) {
      return NextResponse.json(
        { error: "Code too long. Maximum 10,000 characters." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyse this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
    });

    const raw = message.content[0].text.trim();

    // Strip markdown code fences if present
    const clean = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Analysis error:", error);

    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key. Check your ANTHROPIC_API_KEY." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
