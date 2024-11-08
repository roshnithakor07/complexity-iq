"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SAMPLES, LANGUAGES, RATING_CONFIG } from "../lib/constants";

// ─── Validation ────────────────────────────────────────────────────────
const MIN_CHARS    = 20;
const CODE_PATTERN = /[{}();=><\[\]]/;

function validateCode(code) {
  const t = code.trim();
  if (!t)                      return "Please paste some code first.";
  if (t.length < MIN_CHARS)    return `Code too short — minimum ${MIN_CHARS} characters.`;
  if (!CODE_PATTERN.test(t))   return "This doesn't look like valid code. Please paste a function or algorithm.";
  return null;
}

// ─── Icons ─────────────────────────────────────────────────────────────
const Icon = {
  Zap: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
  Copy: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>),
  Trash: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>),
  Code: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  Box: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>),
  Lightbulb: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>),
  ChevronDown: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>),
  Flask: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M10 2v7.31l-5.24 9.54A2 2 0 0 0 6.5 22h11a2 2 0 0 0 1.74-2.99L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/></svg>),
  AlertCircle: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>),
  GitHub: () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>),
};

// ─── Language meta (icon + color per language) ─────────────────────────
const LANG_META = {
  javascript: { icon: "JS",  bg: "#f7df1e", text: "#000",     glow: "rgba(247,223,30,0.15)"  },
  typescript: { icon: "TS",  bg: "#3178c6", text: "#fff",     glow: "rgba(49,120,198,0.15)"  },
  python:     { icon: "PY",  bg: "#3572A5", text: "#fff",     glow: "rgba(53,114,165,0.15)"  },
  java:       { icon: "JV",  bg: "#b07219", text: "#fff",     glow: "rgba(176,114,25,0.15)"  },
  cpp:        { icon: "C++", bg: "#00599c", text: "#fff",     glow: "rgba(0,89,156,0.15)"    },
  go:         { icon: "GO",  bg: "#00acd7", text: "#fff",     glow: "rgba(0,172,215,0.15)"   },
  rust:       { icon: "RS",  bg: "#ce4a00", text: "#fff",     glow: "rgba(206,74,0,0.15)"    },
};

// ─── Language Dropdown ─────────────────────────────────────────────────
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
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ borderColor: open ? meta.bg + "60" : undefined }}
        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-gray-200 hover:border-[#2e2e3e] transition-all w-[200px] justify-between"
      >
        <div className="flex items-center gap-2.5">
          {/* Language badge */}
          <span
            className="w-8 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0"
            style={{ background: meta.bg, color: meta.text }}
          >
            {meta.icon}
          </span>
          <div className="text-left">
            <div className="text-xs font-semibold text-gray-200 leading-none mb-0.5">{selected?.label}</div>
            <div className="text-[10px] text-gray-600 font-mono leading-none">.{selected?.ext}</div>
          </div>
        </div>
        <span className={`text-gray-600 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}>
          <Icon.ChevronDown />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-[240px] bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl z-[999] shadow-2xl shadow-black/80 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="px-3 pt-3 pb-2 border-b border-[#1e1e2e]">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">Select Language</p>
          </div>

          {/* Options */}
          <div className="p-1.5 space-y-0.5">
            {LANGUAGES.map((l) => {
              const m         = LANG_META[l.value] || LANG_META.javascript;
              const isActive  = l.value === language;
              const hasSample = Boolean(SAMPLES[l.value]);
              return (
                <button
                  key={l.value}
                  onClick={() => { onChange(l.value); setOpen(false); }}
                  style={isActive ? { background: m.glow, borderColor: m.bg + "40" } : {}}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-left transition-all border ${
                    isActive
                      ? "border-transparent"
                      : "border-transparent hover:bg-[#1a1a24] hover:border-[#2e2e3e]"
                  }`}
                >
                  {/* Icon badge */}
                  <span
                    className="w-7 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[9px] shrink-0"
                    style={{ background: m.bg, color: m.text, opacity: isActive ? 1 : 0.75 }}
                  >
                    {m.icon}
                  </span>

                  {/* Name + ext */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium ${isActive ? "text-white" : "text-gray-400"}`}>
                      {l.label}
                    </span>
                  </div>

                  {/* Right side: demo badge or ext */}
                  {hasSample ? (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-md font-mono font-semibold shrink-0"
                      style={{ background: m.bg + "25", color: m.bg === "#f7df1e" ? "#a89000" : m.bg }}
                    >
                      demo
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-700 font-mono shrink-0">.{l.ext}</span>
                  )}

                  {isActive && (
                    <span className="text-white/60 shrink-0"><Icon.Check /></span>
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

// ─── Analysing Loader ──────────────────────────────────────────────────
function AnalysingLoader() {
  const steps = [
    { text: "Reading your code...",   delay: "0s"   },
    { text: "Counting loop depth...", delay: "0.7s" },
    { text: "Calculating Big-O...",   delay: "1.4s" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* Spinning ring */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-[#1e1e2e]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{ animationDuration: "0.8s" }} />
        <div className="absolute inset-0 flex items-center justify-center text-purple-400">
          <Icon.Code />
        </div>
      </div>

      <p className="text-sm text-gray-400 font-medium mb-4">Analysing complexity...</p>

      <div className="space-y-2 text-center">
        {steps.map(({ text, delay }) => (
          <p key={text} className="text-xs text-gray-600 font-mono" style={{ animation: `fadeIn 0.4s ease-out ${delay} both` }}>
            <span className="text-purple-500 mr-1.5">›</span>{text}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Complexity Badge ──────────────────────────────────────────────────
function ComplexityBadge({ notation, rating }) {
  const cfg = RATING_CONFIG[rating] || RATING_CONFIG.fair;
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-mono font-semibold ${cfg.color}`}>
      {notation}
    </span>
  );
}

// ─── Score Ring ────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;
  const color = score >= 70 ? "#22d3ee" : score >= 40 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e1e2e" strokeWidth="6" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.34,1.56,.64,1)" }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-xl font-bold font-mono" style={{ color }}>{score}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">score</div>
      </div>
    </div>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────
function ResultPanel({ result }) {
  const { time_complexity: time, space_complexity: space } = result;
  return (
    <div className="animate-slide-up space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 flex flex-col items-center justify-center">
          <ScoreRing score={result.overall_score} />
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Overall</p>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider"><Icon.Clock /> Time</div>
          <ComplexityBadge notation={time.notation} rating={time.rating} />
          <p className="text-xs text-gray-400 font-mono">{time.name}</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">{time.explanation}</p>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider"><Icon.Box /> Space</div>
          <ComplexityBadge notation={space.notation} rating={space.rating} />
          <p className="text-xs text-gray-400 font-mono">{space.name}</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">{space.explanation}</p>
        </div>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Case Analysis</p>
        <div className="grid grid-cols-3 gap-3">
          {[["Best", result.best_case], ["Average", result.average_case], ["Worst", result.worst_case]].map(([label, val]) => (
            <div key={label} className="text-center">
              <div className="text-[10px] text-gray-600 uppercase mb-1">{label}</div>
              <code className="text-sm font-mono text-cyan-400 bg-[#0a0a0f] px-2 py-1 rounded">{val}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-[10px] text-gray-600 uppercase mb-1">Loops</div>
          <div className="text-lg font-mono font-bold text-white">{result.loops_detected}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-600 uppercase mb-1">Recursive</div>
          <div className={`text-sm font-mono font-semibold ${result.recursive ? "text-yellow-400" : "text-cyan-400"}`}>
            {result.recursive ? "Yes" : "No"}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-600 uppercase mb-1">Language</div>
          <div className="text-sm font-mono text-purple-400 capitalize">{result.language_detected}</div>
        </div>
      </div>

      {result.bottleneck && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Bottleneck
          </div>
          <code className="text-xs font-mono text-red-300">{result.bottleneck}</code>
        </div>
      )}

      {result.suggestions?.length > 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-3">
            <Icon.Lightbulb /> Optimisation Suggestions
          </div>
          <ul className="space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-purple-400 mt-0.5 shrink-0">→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function Home() {
  const [language,    setLanguage]    = useState("javascript");
  const [code,        setCode]        = useState(SAMPLES.javascript.code);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [valErr,      setValErr]      = useState(null);
  const [copied,      setCopied]      = useState(false);

  // Language switch → auto-load demo if available
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const sample = SAMPLES[lang];
    if (sample) { setCode(sample.code); }
    setResult(null); setError(null); setValErr(null);
  };

  const loadDemo = () => {
    const s = SAMPLES[language];
    if (s) { setCode(s.code); setResult(null); setError(null); setValErr(null); }
  };

  const analyse = useCallback(async () => {
    const vErr = validateCode(code);
    if (vErr) { setValErr(vErr); return; }
    if (loading) return;

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
  }, [code, language, loading]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLang = LANGUAGES.find((l) => l.value === language);

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-lines noise-bg text-[#e2e8f0]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center glow-accent">
                <Icon.Zap />
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ComplexityIQ
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-800 text-purple-400 uppercase tracking-widest">Beta</span>
            </div>
            <p className="text-sm text-gray-500">AI-powered Big-O analyser for time &amp; space complexity</p>
          </div>
          <a href="https://github.com/roshnithakor07/complexity-iq" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors border border-[#1e1e2e] rounded-lg px-3 py-2 hover:border-purple-800">
            <Icon.GitHub /> GitHub
          </a>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: Editor */}
          <div className="flex flex-col gap-3">

            {/* Toolbar */}
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

            {/* Editor box */}
            <div className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e2e]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60" />
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

            {/* Validation error */}
            {valErr && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 text-xs text-red-400 animate-fade-in">
                <Icon.AlertCircle /> {valErr}
              </div>
            )}

            {/* Analyse button */}
            <button
              onClick={analyse}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                loading
                  ? "bg-purple-900/40 text-purple-400 cursor-not-allowed border border-purple-800/40"
                  : "bg-purple-600 hover:bg-purple-500 text-white glow-accent active:scale-[0.98]"
              }`}
            >
              {loading
                ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Analysing…</>
                : <><Icon.Zap /> Analyse Complexity</>
              }
            </button>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col">
            {loading && <AnalysingLoader />}

            {!loading && error && (
              <div className="flex items-start gap-2 bg-red-950/30 border border-red-800/50 rounded-xl p-4 text-sm text-red-400 animate-fade-in">
                <Icon.AlertCircle />
                <div><p className="font-semibold mb-0.5">Analysis failed</p><p className="text-xs opacity-80">{error}</p></div>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 border border-dashed border-[#1e1e2e] rounded-xl">
                <div className="w-16 h-16 rounded-2xl bg-[#111118] border border-[#1e1e2e] flex items-center justify-center mb-4 mx-auto text-gray-600">
                  <Icon.Code />
                </div>
                <p className="text-gray-500 text-sm mb-1">No analysis yet</p>
                <p className="text-gray-700 text-xs mb-8">
                  Select a language, paste code, click <span className="text-purple-400">Analyse Complexity</span>
                </p>

                <div className="w-full max-w-xs">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Complexity Reference</p>
                  <div className="space-y-2 text-left">
                    {[
                      { n: "O(1)",       label: "Constant",     w: "5%",  c: "bg-cyan-400"  },
                      { n: "O(log n)",   label: "Logarithmic",  w: "15%", c: "bg-cyan-400"  },
                      { n: "O(n)",       label: "Linear",       w: "30%", c: "bg-cyan-400"  },
                      { n: "O(n log n)", label: "Linearithmic", w: "45%", c: "bg-yellow-400"},
                      { n: "O(n²)",      label: "Quadratic",    w: "65%", c: "bg-red-400"   },
                      { n: "O(2ⁿ)",      label: "Exponential",  w: "85%", c: "bg-red-600"   },
                      { n: "O(n!)",      label: "Factorial",    w: "100%",c: "bg-red-800"   },
                    ].map(({ n, label, w, c }) => (
                      <div key={n} className="flex items-center gap-3">
                        <code className="text-[10px] font-mono text-gray-400 w-20 shrink-0">{n}</code>
                        <div className="flex-1 bg-[#0a0a0f] rounded h-1.5"><div className={`h-full rounded bar-fill ${c}`} style={{ width: w }} /></div>
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

        <footer className="mt-12 pt-6 border-t border-[#1e1e2e] flex items-center justify-between text-xs text-gray-600">
          <span>ComplexityIQ — Built with Next.js + Claude API</span>
          <span>by <a href="https://roshnithakor07.github.io" className="text-purple-500 hover:text-purple-400">Roshni Thakor</a></span>
        </footer>
      </div>
    </div>
  );
}