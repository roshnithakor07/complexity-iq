# ⚡ ComplexityIQ — Time & Space Complexity Analyser

> AI-powered Big-O complexity analyser for algorithms. Paste your code, get instant analysis with visual growth charts, case breakdowns, auto-refactor suggestions, and a full comparison tool.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## ✨ Features

### Core Analysis
- **Multi-language support** — JavaScript, TypeScript, Python, Java, C++, Go, Rust, Kotlin, Swift
- **Full complexity report** — Time + Space complexity with Big-O notation
- **Case breakdown** — Best, Average, Worst case analysis
- **Loop & recursion detection** — Counts nested loops, detects recursive patterns
- **Bottleneck identification** — Pinpoints the exact performance problem
- **AI suggestions** — Specific tips to improve your algorithm
- **Overall score** — 0–100 score with animated ring indicator

### Smart Language Detection
- **Auto-detect on paste** — Detects language using 40+ signals per language
- **Mismatch warning** — Banner appears if code doesn't match selected language
- **One-click switch** — Switch to detected language instantly
- **Unknown language hint** — Prompts to verify for unsupported languages (Kotlin, Swift, etc.)
- **Works in Compare mode too** — Both Version A and B editors have detection

### Big-O Chart
- **Visual growth curve** — SVG chart with all 6 complexity classes
- **Highlighted curve** — Your complexity glowed and highlighted
- **Clean legend** — All others dimmed to background

### Auto-Refactor
- **AI optimisation** — One click to get optimised code
- **Same language always** — Java in → Java out, never switches language
- **Before/After comparison** — Complexity and score improvement shown
- **What changed** — Bullet-point breakdown of every optimisation
- **Copy & Retry** — Copy output or regenerate
- **Smart trigger** — Only shows for Fair / Poor / Critical code

### Compare Mode
- **Side-by-side editor** — Paste two versions simultaneously
- **Parallel analysis** — Both analysed at the same time
- **Winner declaration** — Verdict with score difference
- **Comparison table** — Time, Space, Score, Loops side by side

### History
- **Auto-saved** — Every analysis saved to localStorage
- **Stats dashboard** — Total, Avg Score, Best, Trend
- **Score sparkline** — Visual trend over time
- **Grouped by date** — Organised by day
- **Reload** — Send historical code back to analyser

---

## 🛠️ Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Framework  | Next.js 14 (App Router)            |
| Styling    | Tailwind CSS                       |
| AI Engine  | Groq API — LLaMA 3.3 70B Versatile |
| Charts     | Pure SVG (zero dependencies)       |
| Storage    | localStorage (client-side)         |
| Runtime    | Node.js ≥ 18                       |
| Fonts      | JetBrains Mono, Space Grotesk      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18.17.0`
- Groq API key → [console.groq.com](https://console.groq.com/) *(free tier available)*

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/roshnithakor07/complexity-iq.git
cd complexity-iq

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
```

### Configure API Key

```env
# .env.local
GROQ_API_KEY=gsk_your_key_here
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
complexity-iq/
│
├── app/
│   ├── api/
│   │   ├── analyse/
│   │   │   └── route.js        # Analysis endpoint
│   │   └── refactor/
│   │       └── route.js        # Auto-refactor endpoint
│   ├── error.js                # Error boundary
│   ├── not-found.js            # 404 page
│   ├── globals.css
│   ├── layout.js
│   └── page.js                 # All UI components
│
├── lib/
│   └── constants.js            # Language config + samples
│
├── .env.example
├── .env.local                  # (gitignored)
├── next.config.js
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🔌 API Reference

### `POST /api/analyse`

**Request**
```json
{ "code": "function twoSum(...) {...}", "language": "javascript" }
```

**Response**
```json
{
  "success": true,
  "result": {
    "time_complexity": { "notation": "O(n)", "rating": "good", "explanation": "..." },
    "space_complexity": { "notation": "O(n)", "rating": "good", "explanation": "..." },
    "loops_detected": 1,
    "recursive": false,
    "best_case": "O(1)",
    "worst_case": "O(n)",
    "average_case": "O(n)",
    "bottleneck": "for loop at lines 3–10",
    "suggestions": ["Already optimal.", "Add input validation."],
    "overall_score": 82
  }
}
```

### `POST /api/refactor`

**Request**
```json
{ "code": "...", "language": "python", "current_time": "O(n²)", "current_score": 20 }
```

**Response**
```json
{
  "success": true,
  "result": {
    "refactored_code": "def optimised(arr):\n  ...",
    "new_time_complexity": "O(n log n)",
    "improvement_summary": "Replaced bubble sort with merge sort",
    "changes": ["Replaced nested loop", "Added divide-and-conquer"],
    "score_before": 20,
    "score_after": 65
  }
}
```

---

## ⚙️ Environment Variables

| Variable       | Required | Description       |
|----------------|----------|-------------------|
| `GROQ_API_KEY` | ✅ Yes   | Your Groq API key |

---

## 🚢 Deployment

### Vercel (recommended)

```bash
npm i -g vercel && vercel
```

Add `GROQ_API_KEY` in Vercel → Settings → Environment Variables.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/roshnithakor07/complexity-iq)

---

## ✅ What's Built

- [x] 7-language analysis (JS, TS, Python, Java, C++, Go, Rust)
- [x] Big-O growth chart (pure SVG)
- [x] Side-by-side compare mode
- [x] Auto-refactor in correct language
- [x] History journal with score trend sparkline
- [x] Auto language detection on paste
- [x] Mismatch warning in Analyse + Compare modes

## 🔮 Roadmap

- [ ] Syntax highlighting (Prism.js)
- [ ] Shareable analysis URL
- [ ] Export as PDF
- [ ] VS Code Extension
- [x] Kotlin, Swift support

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

## 👩‍💻 Author

**Roshni Thakor** — Backend Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-roshnithakor07.github.io-purple?style=flat-square)](https://roshnithakor07.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-roshnithakor07-black?style=flat-square&logo=github)](https://github.com/roshnithakor07)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-roshnithakor07-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/roshnithakor07)

---

*Built to solve a real problem: knowing the performance cost of every line of code.*