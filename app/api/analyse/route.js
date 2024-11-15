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

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyse this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nReturn ONLY valid JSON, no markdown.`,
        },
      ],
    });

    const raw   = message.choices[0].message.content.trim();
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

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit hit. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}