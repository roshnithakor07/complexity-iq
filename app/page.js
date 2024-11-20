"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SAMPLES, LANGUAGES, RATING_CONFIG } from "../lib/constants";

// ─── Validation ────────────────────────────────────────────────────────────
const MIN_CHARS    = 20;
const CODE_PATTERN = /[{}();=><\[\]]/;

function validateCode(code) {
  const t = code.trim();
  if (!t)                    return "Please paste some code first.";
  if (t.length < MIN_CHARS)  return `Code too short — minimum ${MIN_CHARS} characters.`;
  if (!CODE_PATTERN.test(t)) return "Doesn't look like valid code. Please paste a function or algorithm.";
  return null;
}

// ─── Complexity rank (lower = better, used for chart + compare winner) ─────
const COMPLEXITY_RANK = {
  "O(1)":       0,
  "O(log n)":   1,
  "O(sqrt n)":  1.5,
  "O(n)":       2,
  "O(n log n)": 3,
  "O(n log n)": 3,
  "O(n²)":      4,
  "O(n^2)":     4,
  "O(n³)":      5,
  "O(n^3)":     5,
  "O(2^n)":     5.5,
  "O(2ⁿ)":      5.5,
  "O(n!)":      6,
};

function getRank(notation) {
  if (!notation) return 3;
  const key = Object.keys(COMPLEXITY_RANK).find(k =>
    notation.toLowerCase().includes(k.toLowerCase().replace("²","2").replace("³","3"))
    || k.toLowerCase() === notation.toLowerCase()
  );
  return key !== undefined ? COMPLEXITY_RANK[key] : 3;
}

// ─── Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  Zap:         () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  Copy:        () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>),
  Trash:       () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  Check:       () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>),
  Code:        () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>),
  Clock:       () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  Box:         () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>),
  Lightbulb:   () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>),
  ChevronDown: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>),
  Flask:       () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M10 2v7.31l-5.24 9.54A2 2 0 0 0 6.5 22h11a2 2 0 0 0 1.74-2.99L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/></svg>),
  AlertCircle: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>),
  GitHub:      () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>),
  Trophy:      () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-10 0z"/><path d="M5 4H2v3a3 3 0 0 0 3 3M19 4h3v3a3 3 0 0 1-3 3"/></svg>),
  ArrowRight:  () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  GitCompare:  () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/><polyline points="15 9 18 6 21 9"/><polyline points="9 15 6 18 3 15"/></svg>),
  BarChart:    () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>),
};

// ─── Language meta ─────────────────────────────────────────────────────────
const LANG_META = {
  javascript: { icon: "JS",  bg: "#f7df1e", text: "#000", glow: "rgba(247,223,30,0.15)"  },
  typescript: { icon: "TS",  bg: "#3178c6", text: "#fff", glow: "rgba(49,120,198,0.15)"  },
  python:     { icon: "PY",  bg: "#3572A5", text: "#fff", glow: "rgba(53,114,165,0.15)"  },
  java:       { icon: "JV",  bg: "#b07219", text: "#fff", glow: "rgba(176,114,25,0.15)"  },
  cpp:        { icon: "C++", bg: "#00599c", text: "#fff", glow: "rgba(0,89,156,0.15)"    },
  go:         { icon: "GO",  bg: "#00acd7", text: "#fff", glow: "rgba(0,172,215,0.15)"   },
  rust:       { icon: "RS",  bg: "#ce4a00", text: "#fff", glow: "rgba(206,74,0,0.15)"    },
};

// ─── Language Dropdown ─────────────────────────────────────────────────────
function LanguageDropdown({ language, onChange }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const selected        = LANGUAGES.find((l) => l.value === language);
  const meta            = LANG_META[language] || LANG_META.javascript;

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ borderColor: open ? meta.bg + "60" : undefined }}
        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-gray-200 hover:border-[#2e2e3e] transition-all w-[200px] justify-between"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0" style={{ background: meta.bg, color: meta.text }}>{meta.icon}</span>
          <div className="text-left">
            <div className="text-xs font-semibold text-gray-200 leading-none mb-0.5">{selected?.label}</div>
            <div className="text-[10px] text-gray-600 font-mono leading-none">.{selected?.ext}</div>
          </div>
        </div>
        <span className={`text-gray-600 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}><Icon.ChevronDown /></span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[240px] bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl z-[999] shadow-2xl shadow-black/80 overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-[#1e1e2e]">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">Select Language</p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {LANGUAGES.map((l) => {
              const m        = LANG_META[l.value] || LANG_META.javascript;
              const isActive = l.value === language;
              return (
                <button key={l.value} onClick={() => { onChange(l.value); setOpen(false); }}
                  style={isActive ? { background: m.glow, borderColor: m.bg + "40" } : {}}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-left transition-all border ${isActive ? "border-transparent" : "border-transparent hover:bg-[#1a1a24] hover:border-[#2e2e3e]"}`}
                >
                  <span className="w-7 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[9px] shrink-0" style={{ background: m.bg, color: m.text, opacity: isActive ? 1 : 0.75 }}>{m.icon}</span>
                  <span className={`text-xs font-medium flex-1 ${isActive ? "text-white" : "text-gray-400"}`}>{l.label}</span>
                  {SAMPLES[l.value] && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono font-semibold shrink-0" style={{ background: m.bg + "25", color: m.bg === "#f7df1e" ? "#a89000" : m.bg }}>demo</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analysing Loader ──────────────────────────────────────────────────────
function AnalysingLoader() {
  const steps = ["Parsing code structure…", "Detecting loops & recursion…", "Calculating Big-O notation…"];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 gap-5">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-800/40" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm text-purple-300 font-mono mb-1">{steps[step]}</p>
        <p className="text-xs text-gray-600">AI is reading your algorithm</p>
      </div>
    </div>
  );
}

// ─── Big-O Growth Chart ────────────────────────────────────────────────────
// Pure SVG, no library — plots standard complexity curves + highlights user result
function BigOChart({ notation }) {
  const W = 340, H = 160, PAD = { t: 12, r: 12, b: 28, l: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const N  = 25; // x-axis data points

  const clamp = (v) => Math.min(v, cH);

  // Curve definitions
  const curves = [
    { label: "O(1)",       color: "#22d3ee", dash: false, fn: ()      => 4                                    },
    { label: "O(log n)",   color: "#34d399", dash: false, fn: (i)     => Math.log2(i + 1) * 8                 },
    { label: "O(n)",       color: "#a3e635", dash: false, fn: (i)     => i * (cH / N)                         },
    { label: "O(n log n)", color: "#facc15", dash: false, fn: (i)     => i * Math.log2(i + 1) * (cH / (N * Math.log2(N + 1))) },
    { label: "O(n²)",      color: "#fb923c", dash: false, fn: (i)     => (i * i) * (cH / (N * N))             },
    { label: "O(2ⁿ)",      color: "#f87171", dash: true,  fn: (i)     => Math.pow(2, i) * (cH / Math.pow(2, N)) },
  ];

  // Normalize: notation string → label key
  const normalize = (n = "") =>
    n.replace(/n\^2/gi,"n²").replace(/n\^3/gi,"n³").replace(/2\^n/gi,"2ⁿ").replace(/\s/g,"");

  const highlighted = normalize(notation || "");

  const toPoints = (fn) =>
    Array.from({ length: N + 1 }, (_, i) => {
      const x = PAD.l + (i / N) * cW;
      const y = PAD.t + cH - clamp(fn(i));
      return `${x},${y}`;
    }).join(" ");

  // Y-axis labels
  const yTicks = [0, 0.5, 1].map((pct) => ({
    y: PAD.t + cH - pct * cH,
    label: pct === 0 ? "0" : pct === 0.5 ? "mid" : "high",
  }));

  // X-axis labels
  const xTicks = [0, 0.5, 1].map((pct) => ({
    x: PAD.l + pct * cW,
    label: pct === 0 ? "0" : pct === 0.5 ? "n/2" : "n",
  }));

  return (
    <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-4">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-3">Big-O Growth Curve</p>
      <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <line key={pct}
            x1={PAD.l} y1={PAD.t + cH - pct * cH}
            x2={PAD.l + cW} y2={PAD.t + cH - pct * cH}
            stroke="#1e1e2e" strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + cH} stroke="#2e2e3e" strokeWidth="1.5"/>
        <line x1={PAD.l} y1={PAD.t + cH} x2={PAD.l + cW} y2={PAD.t + cH} stroke="#2e2e3e" strokeWidth="1.5"/>

        {/* Y-axis label */}
        <text x={10} y={PAD.t + cH / 2} fill="#4b5563" fontSize="9" textAnchor="middle"
          transform={`rotate(-90, 10, ${PAD.t + cH / 2})`} fontFamily="monospace">ops</text>

        {/* X-axis ticks */}
        {xTicks.map(({ x, label }) => (
          <text key={label} x={x} y={H - 6} fill="#4b5563" fontSize="8" textAnchor="middle" fontFamily="monospace">{label}</text>
        ))}

        {/* Curves — draw non-highlighted first (dimmed), then highlighted on top */}
        {curves.map(({ label, color, dash, fn }) => {
          const isHit = highlighted.includes(label.replace(/\s/g,"")) ||
                        label.replace(/\s/g,"") === highlighted;
          if (isHit) return null; // draw last
          return (
            <polyline key={label} points={toPoints(fn)}
              fill="none" stroke={color} strokeWidth="1.2"
              strokeDasharray={dash ? "3 3" : undefined}
              opacity="0.18"
            />
          );
        })}

        {/* Highlighted curve — drawn on top with glow */}
        {curves.map(({ label, color, dash, fn }) => {
          const isHit = highlighted.includes(label.replace(/\s/g,"")) ||
                        label.replace(/\s/g,"") === highlighted;
          if (!isHit) return null;
          return (
            <g key={label + "-hi"}>
              {/* Glow layer */}
              <polyline points={toPoints(fn)} fill="none" stroke={color} strokeWidth="6" opacity="0.15"/>
              {/* Main line */}
              <polyline points={toPoints(fn)} fill="none" stroke={color} strokeWidth="2.5"
                strokeDasharray={dash ? "4 4" : undefined}/>
            </g>
          );
        })}

        {/* Legend */}
        {curves.map(({ label, color }, idx) => {
          const isHit = highlighted.includes(label.replace(/\s/g,"")) ||
                        label.replace(/\s/g,"") === highlighted;
          const col  = idx < 3 ? 0 : 1;
          const row  = idx % 3;
          const lx   = PAD.l + col * 164;
          const ly   = PAD.t + row * 14;
          return (
            <g key={label + "-leg"} opacity={isHit ? 1 : 0.35}>
              <rect x={lx} y={ly + 2} width="14" height="2.5" rx="1" fill={color}/>
              <text x={lx + 18} y={ly + 7} fill={isHit ? color : "#6b7280"} fontSize="8.5"
                fontFamily="monospace" fontWeight={isHit ? "700" : "400"}>{label}</text>
            </g>
          );
        })}
      </svg>
      {notation && (
        <p className="text-[10px] text-gray-500 mt-2 font-mono">
          Your code → <span className="text-purple-400 font-semibold">{notation}</span> is highlighted above
        </p>
      )}
    </div>
  );
}

// ─── Rating config helper ──────────────────────────────────────────────────
const RATING = {
  excellent: { color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.25)", label: "Excellent" },
  good:      { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)", label: "Good"      },
  fair:      { color: "#facc15", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)", label: "Fair"      },
  poor:      { color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)", label: "Poor"      },
  critical:  { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", label: "Critical" },
};

function ratingStyle(r) { return RATING[r] || RATING.fair; }

// ─── Score Ring ────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 72 }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22d3ee" : score >= 60 ? "#34d399" : score >= 40 ? "#facc15" : score >= 20 ? "#fb923c" : "#f87171";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="15" fontWeight="700" fontFamily="monospace">{score}</text>
    </svg>
  );
}

// ─── Result Panel (single analysis) ───────────────────────────────────────
function ResultPanel({ result, showChart = true }) {
  const { time_complexity: tc, space_complexity: sc, overall_score,
          loops_detected, recursive, best_case, worst_case, average_case,
          bottleneck, suggestions } = result;

  const tcStyle = ratingStyle(tc?.rating);
  const scStyle = ratingStyle(sc?.rating);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Score + complexities row */}
      <div className="flex gap-3">
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 flex flex-col items-center justify-center gap-1 min-w-[88px]">
          <ScoreRing score={overall_score} />
          <p className="text-[10px] text-gray-600 font-mono mt-1">Score</p>
        </div>
        <div className="flex-1 space-y-3">
          {/* Time */}
          <div className="bg-[#111118] border rounded-xl px-4 py-3" style={{ borderColor: tcStyle.border }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400"><Icon.Clock /><span>Time</span></div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold" style={{ background: tcStyle.bg, color: tcStyle.color, border: `1px solid ${tcStyle.border}` }}>{tcStyle.label}</span>
            </div>
            <p className="font-mono font-bold text-lg" style={{ color: tcStyle.color }}>{tc?.notation}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{tc?.explanation}</p>
          </div>
          {/* Space */}
          <div className="bg-[#111118] border rounded-xl px-4 py-3" style={{ borderColor: scStyle.border }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400"><Icon.Box /><span>Space</span></div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold" style={{ background: scStyle.bg, color: scStyle.color, border: `1px solid ${scStyle.border}` }}>{scStyle.label}</span>
            </div>
            <p className="font-mono font-bold text-lg" style={{ color: scStyle.color }}>{sc?.notation}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{sc?.explanation}</p>
          </div>
        </div>
      </div>

      {/* Big-O Chart */}
      {showChart && <BigOChart notation={tc?.notation} />}

      {/* Cases */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-2.5">Case Analysis</p>
        <div className="grid grid-cols-3 gap-2">
          {[["Best", best_case, "#34d399"], ["Avg", average_case, "#facc15"], ["Worst", worst_case, "#f87171"]].map(([label, val, c]) => (
            <div key={label} className="text-center">
              <p className="text-[9px] text-gray-600 mb-1">{label}</p>
              <p className="font-mono text-xs font-semibold" style={{ color: c }}>{val || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meta stats */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3">
        <div className="flex justify-around">
          <div className="text-center"><p className="text-[9px] text-gray-600 mb-1">Loops</p><p className="font-mono text-sm font-bold text-gray-300">{loops_detected ?? "—"}</p></div>
          <div className="w-px bg-[#1e1e2e]"/>
          <div className="text-center"><p className="text-[9px] text-gray-600 mb-1">Recursive</p><p className="font-mono text-sm font-bold text-gray-300">{recursive ? "Yes" : "No"}</p></div>
          <div className="w-px bg-[#1e1e2e]"/>
          <div className="text-center"><p className="text-[9px] text-gray-600 mb-1">Score</p><p className="font-mono text-sm font-bold text-gray-300">{overall_score}/100</p></div>
        </div>
      </div>

      {/* Bottleneck */}
      {bottleneck && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-1.5">Bottleneck</p>
          <p className="text-xs text-amber-400 font-mono">{bottleneck}</p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-2.5"><Icon.Lightbulb /><span>Suggestions</span></div>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-purple-900/50 border border-purple-700/40 flex items-center justify-center text-purple-400 shrink-0 text-[9px] font-mono">{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Compare Panel ─────────────────────────────────────────────────────────
function ComparePanel({ resultA, resultB, labelA = "Version A", labelB = "Version B" }) {
  const scoreA = resultA.overall_score;
  const scoreB = resultB.overall_score;
  const diff   = Math.abs(scoreA - scoreB);

  const rankA = getRank(resultA.time_complexity?.notation);
  const rankB = getRank(resultB.time_complexity?.notation);

  let winner, winnerLabel, verdict;
  if (scoreA > scoreB)       { winner = "A"; winnerLabel = labelA; verdict = `${labelA} wins by ${diff} points`; }
  else if (scoreB > scoreA)  { winner = "B"; winnerLabel = labelB; verdict = `${labelB} wins by ${diff} points`; }
  else                       { winner = null; winnerLabel = null; verdict = "It's a tie!"; }

  const ROWS = [
    { label: "Time",  a: resultA.time_complexity?.notation,  b: resultB.time_complexity?.notation,  rankA, rankB, lowerWins: true },
    { label: "Space", a: resultA.space_complexity?.notation, b: resultB.space_complexity?.notation, rankA: getRank(resultA.space_complexity?.notation), rankB: getRank(resultB.space_complexity?.notation), lowerWins: true },
    { label: "Score", a: scoreA + "/100",                    b: scoreB + "/100",                    rankA: 100 - scoreA, rankB: 100 - scoreB, lowerWins: true },
    { label: "Loops", a: String(resultA.loops_detected ?? "?"), b: String(resultB.loops_detected ?? "?"), rankA: resultA.loops_detected ?? 0, rankB: resultB.loops_detected ?? 0, lowerWins: true },
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Verdict banner */}
      <div className={`rounded-xl px-5 py-4 border text-center ${
        winner ? "bg-purple-900/20 border-purple-700/40" : "bg-[#111118] border-[#1e1e2e]"
      }`}>
        {winner && <div className="flex items-center justify-center gap-2 text-purple-300 mb-1"><Icon.Trophy /><span className="font-bold text-sm">{winnerLabel} is faster</span></div>}
        <p className={`font-mono font-semibold ${winner ? "text-white text-lg" : "text-gray-300 text-base"}`}>{verdict}</p>
        {diff > 0 && <p className="text-xs text-gray-500 mt-1">Score difference: {diff} points</p>}
      </div>

      {/* Big-O chart — both curves */}
      <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-3">Complexity Comparison</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-purple-400 font-mono mb-2">{labelA}</p>
            <BigOChart notation={resultA.time_complexity?.notation} />
          </div>
          <div>
            <p className="text-[10px] text-cyan-400 font-mono mb-2">{labelB}</p>
            <BigOChart notation={resultB.time_complexity?.notation} />
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 text-[10px] text-gray-600 uppercase tracking-widest font-mono border-b border-[#1e1e2e]">
          <div className="px-4 py-2.5">Metric</div>
          <div className="px-4 py-2.5 text-purple-400">{labelA}</div>
          <div className="px-4 py-2.5 text-cyan-400">{labelB}</div>
        </div>
        {ROWS.map(({ label, a, b, rankA: rA, rankB: rB }) => {
          const aWins = rA < rB;
          const bWins = rB < rA;
          return (
            <div key={label} className="grid grid-cols-3 border-b border-[#1e1e2e] last:border-0">
              <div className="px-4 py-3 text-xs text-gray-500 font-mono">{label}</div>
              <div className={`px-4 py-3 font-mono text-sm font-semibold ${aWins ? "text-green-400" : bWins ? "text-red-400/70" : "text-gray-300"}`}>
                {a} {aWins && <span className="text-green-500 text-[10px]">✓</span>}
              </div>
              <div className={`px-4 py-3 font-mono text-sm font-semibold ${bWins ? "text-green-400" : aWins ? "text-red-400/70" : "text-gray-300"}`}>
                {b} {bWins && <span className="text-green-500 text-[10px]">✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-side suggestions */}
      {(resultA.suggestions?.length > 0 || resultB.suggestions?.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {[{ result: resultA, label: labelA, color: "text-purple-400" }, { result: resultB, label: labelB, color: "text-cyan-400" }].map(({ result, label, color }) => (
            result.suggestions?.length > 0 && (
              <div key={label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3">
                <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${color}`}>{label} — Tips</p>
                <ul className="space-y-1.5">
                  {result.suggestions.slice(0, 2).map((s, i) => (
                    <li key={i} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                      <span className="text-purple-500 shrink-0 mt-0.5">›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Code Editor Box ───────────────────────────────────────────────────────
function CodeEditor({ code, onChange, language, onLanguageChange, label, color = "text-purple-400" }) {
  const [copied, setCopied] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.value === language);

  const copyCode = async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono font-semibold ${color}`}>{label}</span>
        <LanguageDropdown language={language} onChange={onLanguageChange} />
        {SAMPLES[language] && (
          <button onClick={() => onChange(SAMPLES[language]?.code || SAMPLES[language])}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 border border-[#1e1e2e] rounded-xl hover:border-purple-700 hover:text-purple-400 transition-all font-mono">
            <Icon.Flask /> Demo
          </button>
        )}
      </div>
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60"/>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-60"/>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60"/>
            <span className="ml-2 text-xs text-gray-600 font-mono">{currentLang?.label}.{currentLang?.ext}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={copyCode} disabled={!code.trim()}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
              {copied ? <><Icon.Check /> Copied!</> : <><Icon.Copy /> Copy</>}
            </button>
            <button onClick={() => onChange("")} disabled={!code.trim()}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
              <Icon.Trash /> Clear
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="code-editor w-full bg-transparent p-4 text-[#e2e8f0] resize-none outline-none min-h-[240px] text-sm leading-relaxed"
          placeholder={`// Paste your ${currentLang?.label} code here…`}
          spellCheck={false} autoComplete="off" autoCapitalize="off"
        />
      </div>
      <p className="text-[10px] text-gray-600 font-mono">{code.split("\n").length} lines · {code.length} chars</p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Home() {
  // Analyse mode state
  const [code,     setCode]     = useState("");
  const [language, setLanguage] = useState("javascript");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [valErr,   setValErr]   = useState(null);
  const [copied,   setCopied]   = useState(false);

  // Compare mode state
  const [codeA,     setCodeA]     = useState("");
  const [codeB,     setCodeB]     = useState("");
  const [langA,     setLangA]     = useState("javascript");
  const [langB,     setLangB]     = useState("javascript");
  const [resultA,   setResultA]   = useState(null);
  const [resultB,   setResultB]   = useState(null);
  const [comparing, setComparing] = useState(false);
  const [compareErr,setCompareErr]= useState(null);

  // Mode: "analyse" | "compare"
  const [mode, setMode] = useState("analyse");

  const currentLang = LANGUAGES.find((l) => l.value === language);

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    setResult(null);
    setValErr(null);
  }, []);

  // ── Single analyse ─────────────────────────────────────────────────────
  const analyse = async () => {
    const err = validateCode(code);
    if (err) { setValErr(err); return; }
    setLoading(true); setError(null); setValErr(null); setResult(null);
    try {
      const res  = await fetch("/api/analyse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed");
      setResult(data.result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Compare analyse ────────────────────────────────────────────────────
  const compare = async () => {
    const errA = validateCode(codeA);
    const errB = validateCode(codeB);
    if (errA) { setCompareErr("Version A: " + errA); return; }
    if (errB) { setCompareErr("Version B: " + errB); return; }

    setComparing(true); setCompareErr(null); setResultA(null); setResultB(null);
    try {
      const [resA, resB] = await Promise.all([
        fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: codeA, language: langA }) }),
        fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: codeB, language: langB }) }),
      ]);
      const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);
      if (!resA.ok || !dataA.success) throw new Error("Version A: " + (dataA.error || "failed"));
      if (!resB.ok || !dataB.success) throw new Error("Version B: " + (dataB.error || "failed"));
      setResultA(dataA.result);
      setResultB(dataB.result);
    } catch (e) {
      setCompareErr(e.message);
    } finally {
      setComparing(false);
    }
  };

  const loadDemo = () => {
    const sample = SAMPLES[language];
    if (sample) { setCode(sample?.code || sample); setResult(null); setValErr(null); }
  };

  const copyCode = async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-900/20 border border-purple-800/30 rounded-full px-4 py-1.5 text-xs text-purple-400 font-mono mb-4">
            <Icon.Zap /> ComplexityIQ — Algorithm Analyser
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Analyse Your Algorithm
          </h1>
          <p className="text-gray-500 text-sm">
            Get instant Big-O complexity analysis with visual growth charts and side-by-side code comparison.
          </p>
        </header>

        {/* ── Mode Toggle ── */}
        <div className="flex items-center gap-1 bg-[#111118] border border-[#1e1e2e] rounded-2xl p-1 mb-8 max-w-sm mx-auto">
          {[
            { id: "analyse", label: "Analyse", icon: <Icon.BarChart /> },
            { id: "compare", label: "Compare",  icon: <Icon.GitCompare /> },
          ].map(({ id, label, icon }) => (
            <button key={id} onClick={() => setMode(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === id
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── ANALYSE MODE ── */}
        {mode === "analyse" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Editor */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <LanguageDropdown language={language} onChange={handleLanguageChange} />
                {SAMPLES[language] && (
                  <button onClick={loadDemo}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 border border-[#1e1e2e] rounded-xl hover:border-purple-700 hover:text-purple-400 transition-all font-mono">
                    <Icon.Flask /> Load demo
                  </button>
                )}
                <span className="ml-auto text-[10px] text-gray-600 font-mono">
                  {code.split("\n").length} lines · {code.length} chars
                </span>
              </div>

              <div className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e2e]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-60"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60"/>
                    <span className="ml-2 text-xs text-gray-600 font-mono">{currentLang?.label}.{currentLang?.ext}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={copyCode} disabled={!code.trim()}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
                      {copied ? <><Icon.Check /> Copied!</> : <><Icon.Copy /> Copy</>}
                    </button>
                    <button onClick={() => { setCode(""); setResult(null); setError(null); setValErr(null); }} disabled={!code.trim()}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
                      <Icon.Trash /> Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setResult(null); setValErr(null); }}
                  className="code-editor w-full bg-transparent p-4 text-[#e2e8f0] resize-none outline-none min-h-[320px] text-sm leading-relaxed"
                  placeholder={`// Paste your ${currentLang?.label} code here…`}
                  spellCheck={false} autoComplete="off" autoCapitalize="off"
                />
              </div>

              {valErr && (
                <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 text-xs text-red-400 animate-fade-in">
                  <Icon.AlertCircle /> {valErr}
                </div>
              )}

              <button onClick={analyse} disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  loading
                    ? "bg-purple-900/40 text-purple-400 cursor-not-allowed border border-purple-800/40"
                    : "bg-purple-600 hover:bg-purple-500 text-white active:scale-[0.98]"
                }`}
              >
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Analysing…</>
                  : <><Icon.Zap /> Analyse Complexity</>}
              </button>
            </div>

            {/* Right: Results */}
            <div className="flex flex-col">
              {loading && <AnalysingLoader />}
              {!loading && error && (
                <div className="flex items-start gap-2 bg-red-950/30 border border-red-800/50 rounded-xl p-4 text-sm text-red-400">
                  <Icon.AlertCircle />
                  <div><p className="font-semibold mb-0.5">Analysis failed</p><p className="text-xs opacity-80">{error}</p></div>
                </div>
              )}
              {!loading && !result && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 border border-dashed border-[#1e1e2e] rounded-xl">
                  <div className="w-16 h-16 rounded-2xl bg-[#111118] border border-[#1e1e2e] flex items-center justify-center mb-4 text-gray-600"><Icon.Code /></div>
                  <p className="text-gray-500 text-sm mb-1">No analysis yet</p>
                  <p className="text-gray-700 text-xs mb-8">Paste code and click <span className="text-purple-400">Analyse Complexity</span></p>
                  {/* Quick reference */}
                  <div className="w-full max-w-xs">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Complexity Reference</p>
                    <div className="space-y-2 text-left">
                      {[
                        { n: "O(1)",       label: "Constant",      w: "5%",   c: "bg-cyan-400"   },
                        { n: "O(log n)",   label: "Logarithmic",   w: "15%",  c: "bg-green-400"  },
                        { n: "O(n)",       label: "Linear",        w: "30%",  c: "bg-lime-400"   },
                        { n: "O(n log n)", label: "Linearithmic",  w: "45%",  c: "bg-yellow-400" },
                        { n: "O(n²)",      label: "Quadratic",     w: "65%",  c: "bg-orange-400" },
                        { n: "O(2ⁿ)",      label: "Exponential",   w: "85%",  c: "bg-red-400"    },
                        { n: "O(n!)",      label: "Factorial",     w: "100%", c: "bg-red-700"    },
                      ].map(({ n, label, w, c }) => (
                        <div key={n} className="flex items-center gap-3">
                          <code className="text-[10px] font-mono text-gray-400 w-20 shrink-0">{n}</code>
                          <div className="flex-1 bg-[#0a0a0f] rounded h-1.5"><div className={`h-full rounded ${c}`} style={{ width: w }} /></div>
                          <span className="text-[10px] text-gray-600 w-20 shrink-0">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {result && !loading && <ResultPanel result={result} />}
            </div>
          </div>
        )}

        {/* ── COMPARE MODE ── */}
        {mode === "compare" && (
          <div className="space-y-6">
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3 text-xs text-gray-500 text-center">
              Paste two versions of your code below — ComplexityIQ will analyse both simultaneously and declare a winner.
            </div>

            {/* Two editors */}
            <div className="grid lg:grid-cols-2 gap-6">
              <CodeEditor code={codeA} onChange={setCodeA} language={langA} onLanguageChange={setLangA} label="Version A" color="text-purple-400" />
              <CodeEditor code={codeB} onChange={setCodeB} language={langB} onLanguageChange={setLangB} label="Version B" color="text-cyan-400" />
            </div>

            {compareErr && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 text-xs text-red-400">
                <Icon.AlertCircle /> {compareErr}
              </div>
            )}

            {/* Compare button */}
            <button onClick={compare} disabled={comparing}
              className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                comparing
                  ? "bg-purple-900/40 text-purple-400 cursor-not-allowed border border-purple-800/40"
                  : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white active:scale-[0.98]"
              }`}
            >
              {comparing
                ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Comparing both versions…</>
                : <><Icon.GitCompare /> Compare Both Versions</>}
            </button>

            {/* Results */}
            {resultA && resultB && !comparing && (
              <ComparePanel resultA={resultA} resultB={resultB} labelA="Version A" labelB="Version B" />
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-12 pt-6 border-t border-[#1e1e2e] flex items-center justify-between text-xs text-gray-600">
          <span>ComplexityIQ — Built with Next.js + Groq AI</span>
          <a href="https://roshnithakor07.github.io" className="text-purple-500 hover:text-purple-400">by Roshni Thakor</a>
        </footer>
      </div>
    </div>
  );
}