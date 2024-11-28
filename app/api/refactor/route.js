import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a code optimiser. Given code with known complexity, return an optimised version with better Big-O performance.

Return ONLY a valid JSON object. No text before or after. No markdown. No code fences.

The JSON must have EXACTLY these fields:
{
  "refactored_code": "// optimised code here as a string with \\n for newlines",
  "new_time_complexity": "O(n)",
  "new_space_complexity": "O(n)",
  "improvement_summary": "Replaced O(n^2) nested loop with O(n) HashMap lookup",
  "changes": [
    "Replaced nested for-loop with HashMap for O(1) lookups",
    "Eliminated redundant inner loop"
  ],
  "score_before": 30,
  "score_after": 80,
  "can_improve": true
}

CRITICAL LANGUAGE RULES — read carefully:
- You MUST write refactored_code in the EXACT SAME programming language as the input code.
- If input is Java → output must be valid Java (use HashMap, ArrayList, int[], etc.)
- If input is Python → output must be valid Python (use dict, list, etc.)
- If input is C++ → output must be valid C++ (use unordered_map, vector, etc.)
- If input is Go → output must be valid Go
- If input is Rust → output must be valid Rust
- NEVER switch to JavaScript or any other language. The output language must match the input language exactly.
- Keep the same function/method name and signature style as the original.
- Use idiomatic patterns for the target language (e.g. Java: HashMap not Map literal, Python: dict not object).

OTHER RULES:
- refactored_code must be a complete working function/method as a JSON string (escape newlines as \\n)
- If code is already O(1) or O(log n), set can_improve to false and return original code unchanged
- changes: 2-4 specific bullet points describing what changed
- Return ONLY the raw JSON. Nothing else.`;

function extractJSON(raw) {
  try { return JSON.parse(raw); } catch {}

  let clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try { return JSON.parse(clean); } catch {}

  const start = clean.indexOf("{");
  const end   = clean.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(clean.slice(start, end + 1)); } catch {}
  }

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, language, current_time, current_score } = body;

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Optimise this ${language} code. Output language MUST be ${language} — do NOT switch to any other language.\nCurrent time complexity: ${current_time}\nCurrent score: ${current_score}/100\n\nCode:\n${code}\n\nReturn ONLY JSON with refactored_code written in ${language}.`,
        },
      ],
    });

    const raw = message.choices[0].message.content.trim();
    console.log("[Refactor] raw:", raw.slice(0, 200));

    const parsed = extractJSON(raw);
    if (!parsed) {
      console.error("[Refactor] JSON parse failed. Raw:", raw);
      return NextResponse.json(
        { error: "AI returned unexpected format. Please try again." },
        { status: 500 }
      );
    }

    // Normalise fields so frontend never gets undefined
    const result = {
      refactored_code:      typeof parsed.refactored_code === "string" ? parsed.refactored_code : code,
      new_time_complexity:  parsed.new_time_complexity  || current_time || "O(n)",
      new_space_complexity: parsed.new_space_complexity || "O(n)",
      improvement_summary:  parsed.improvement_summary  || "Code optimised.",
      changes:              Array.isArray(parsed.changes) ? parsed.changes : [],
      score_before:         typeof parsed.score_before === "number" ? parsed.score_before : (current_score || 50),
      score_after:          typeof parsed.score_after  === "number" ? parsed.score_after  : 75,
      can_improve:          typeof parsed.can_improve  === "boolean" ? parsed.can_improve : true,
    };

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error("[Refactor] Error:", error?.message || error);
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit hit. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Refactor failed. Please try again." },
      { status: 500 }
    );
  }
}