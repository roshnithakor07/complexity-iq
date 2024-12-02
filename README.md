# ⚡ ComplexityIQ — Time & Space Complexity Analyser

> AI-powered Big-O complexity analyser for algorithms. Paste your code, get instant analysis with detailed explanations, case breakdowns, and optimisation suggestions.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Claude API](https://img.shields.io/badge/Claude-API-orange?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-yellow?style=flat-square&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 📸 Preview

```
┌─────────────────────────────────────────────────┐
│  ⚡ ComplexityIQ                          [Beta] │
├──────────────────────┬──────────────────────────┤
│  JS  PY  Java  C++   │  Score     Time   Space  │
│                      │  [ 72 ]   O(n²)   O(n)  │
│  // your code here   ├──────────────────────────┤
│  for(let i=0;...)    │  Best     Average  Worst │
│    for(let j=0;...) │  O(n)     O(n²)   O(n²) │
│                      ├──────────────────────────┤
│  [  Analyse  ]       │  → Use hash map to O(n) │
└──────────────────────┴──────────────────────────┘
```

---

## ✨ Features

- **Multi-language support** — JavaScript, TypeScript, Python, Java, C++, Go, Rust
- **Full complexity report** — Time complexity, Space complexity, Best / Average / Worst case
- **Loop & recursion detection** — Counts nested loops, detects recursive calls
- **Bottleneck identification** — Pinpoints the exact performance bottleneck in your code
- **Optimisation suggestions** — AI-generated tips to improve your algorithm
- **Overall score** — 0–100 readability score with visual ring indicator
- **Big-O reference chart** — Built-in complexity cheat sheet
- **Dark terminal UI** — Minimal, distraction-free editor experience
- **Sample code snippets** — One-click examples for each language

---

## 🛠️ Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Framework | Next.js 14 (App Router) |
| Styling   | Tailwind CSS          |
| AI Engine | Anthropic Claude API  |
| Runtime   | Node.js               |
| Fonts     | JetBrains Mono, Space Grotesk |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18.17.0`
- npm or yarn
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/roshnithakor07/complexity-analyser.git
cd complexity-analyser

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### Configure API Key

Open `.env.local` and add your key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
complexity-analyser/
│
├── app/
│   ├── api/
│   │   └── analyse/
│   │       └── route.js        # Claude API endpoint
│   ├── globals.css             # Global styles + Tailwind
│   ├── layout.js               # Root layout + metadata
│   └── page.js                 # Main UI (editor + results)
│
├── lib/
│   └── constants.js            # Languages, samples, rating config
│
├── .env.example                # Environment variable template
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔌 API Reference

### `POST /api/analyse`

Analyses the provided code and returns a complexity report.

**Request Body**

```json
{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript"
}
```

**Response**

```json
{
  "success": true,
  "result": {
    "time_complexity": {
      "notation": "O(n)",
      "name": "Linear",
      "rating": "good",
      "explanation": "Single pass through the array using a hash map."
    },
    "space_complexity": {
      "notation": "O(n)",
      "name": "Linear",
      "rating": "good",
      "explanation": "Hash map stores at most n entries."
    },
    "loops_detected": 1,
    "recursive": false,
    "best_case": "O(1)",
    "worst_case": "O(n)",
    "average_case": "O(n)",
    "bottleneck": "Single for loop at lines 3-10",
    "suggestions": [
      "Optimal solution — hash map approach is already the best O(n).",
      "Consider adding input validation for edge cases."
    ],
    "overall_score": 82,
    "language_detected": "javascript"
  }
}
```

**Error Response**

```json
{
  "error": "No code provided"
}
```

**Supported languages:** `javascript`, `typescript`, `python`, `java`, `cpp`, `go`, `rust`

---

## ⚙️ Environment Variables

| Variable             | Required | Description                          |
|----------------------|----------|--------------------------------------|
| `ANTHROPIC_API_KEY`  | ✅ Yes   | Your Anthropic Claude API key        |
| `NEXT_PUBLIC_APP_URL`| ❌ No    | Public URL (for production metadata) |

---

## 🚢 Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# ANTHROPIC_API_KEY = your-key
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/roshnithakor07/complexity-analyser)

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t complexity-analyser .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your-key complexity-analyser
```

---

## 🧩 How It Works

```
User pastes code
      │
      ▼
POST /api/analyse
      │
      ▼
Claude API (claude-opus-4-5)
  - Analyses loop nesting depth
  - Detects recursion patterns
  - Counts data structure ops
  - Evaluates best/worst/average case
      │
      ▼
Structured JSON response
      │
      ▼
ResultPanel renders:
  - Score ring
  - Complexity badges
  - Case analysis table
  - Bottleneck highlight
  - Optimisation suggestions
```

---

## 🗺️ Roadmap

- [ ] **Syntax highlighting** — Prism.js integration in editor
- [ ] **History** — Save past analyses to MongoDB
- [ ] **Side-by-side compare** — Compare two code snippets
- [ ] **Share link** — Shareable URL for each analysis
- [ ] **Export PDF** — Download report as PDF
- [ ] **VS Code Extension** — Inline complexity hints in editor
- [ ] **API Rate Limiting** — Redis-based per-IP rate limits
- [ ] **Auth** — User accounts with JWT + saved snippets

---

## 🤝 Contributing

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

**Roshni Thakor** — Backend Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-roshnithakor07.github.io-purple?style=flat-square)](https://roshnithakor07.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-roshnithakor07-black?style=flat-square&logo=github)](https://github.com/roshnithakor07)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-roshnithakor07-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/roshnithakor07)

---

*Built to solve a real problem: understanding the performance cost of every line of code.*
