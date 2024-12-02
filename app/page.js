"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SAMPLES, LANGUAGES, RATING_CONFIG } from "../lib/constants";

const MIN_CHARS    = 20;
const CODE_PATTERN = /[{}();=><\[\]]/;
const HISTORY_KEY  = "complexityiq_history";
const MAX_HISTORY  = 50;

function validateCode(code) {
  const t = code.trim();
  if (!t)                    return "Please paste some code first.";
  if (t.length < MIN_CHARS)  return `Code too short — minimum ${MIN_CHARS} characters.`;
  if (!CODE_PATTERN.test(t)) return "Doesn't look like valid code. Please paste a function or algorithm.";
  return null;
}

const COMPLEXITY_RANK = {
  "O(1)":0,"O(log n)":1,"O(sqrt n)":1.5,"O(n)":2,"O(n log n)":3,
  "O(n²)":4,"O(n^2)":4,"O(n³)":5,"O(n^3)":5,"O(2^n)":5.5,"O(2ⁿ)":5.5,"O(n!)":6,
};
function getRank(notation) {
  if (!notation) return 3;
  const key = Object.keys(COMPLEXITY_RANK).find(k =>
    notation.toLowerCase().includes(k.toLowerCase().replace("²","2").replace("³","3"))
    || k.toLowerCase() === notation.toLowerCase()
  );
  return key !== undefined ? COMPLEXITY_RANK[key] : 3;
}

function loadHistory()    { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]"); } catch { return []; } }
function saveHistory(arr) { try { localStorage.setItem(HISTORY_KEY,JSON.stringify(arr.slice(0,MAX_HISTORY))); } catch {} }
function addToHistory(entry) {
  const updated = [{ id:Date.now(), ...entry }, ...loadHistory()].slice(0,MAX_HISTORY);
  saveHistory(updated); return updated;
}

// ─── Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  Zap:         ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Copy:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Trash:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Check:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Code:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Clock:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Box:         ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  Lightbulb:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
  ChevronDown: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>,
  Flask:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M10 2v7.31l-5.24 9.54A2 2 0 0 0 6.5 22h11a2 2 0 0 0 1.74-2.99L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/></svg>,
  AlertCircle: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Trophy:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-10 0z"/><path d="M5 4H2v3a3 3 0 0 0 3 3M19 4h3v3a3 3 0 0 1-3 3"/></svg>,
  GitCompare:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/><polyline points="15 9 18 6 21 9"/><polyline points="9 15 6 18 3 15"/></svg>,
  BarChart:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  History:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  TrendUp:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Reload:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Delete:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
  Star:        ()=><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className="w-3 h-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Wand:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"/></svg>,
  Spin:        ()=><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

const LANG_META = {
  javascript:{ icon:"JS",  bg:"#f7df1e", text:"#000", glow:"rgba(247,223,30,0.15)"  },
  typescript:{ icon:"TS",  bg:"#3178c6", text:"#fff", glow:"rgba(49,120,198,0.15)"  },
  python:    { icon:"PY",  bg:"#3572A5", text:"#fff", glow:"rgba(53,114,165,0.15)"  },
  java:      { icon:"JV",  bg:"#b07219", text:"#fff", glow:"rgba(176,114,25,0.15)"  },
  cpp:       { icon:"C++", bg:"#00599c", text:"#fff", glow:"rgba(0,89,156,0.15)"    },
  go:        { icon:"GO",  bg:"#00acd7", text:"#fff", glow:"rgba(0,172,215,0.15)"   },
  rust:      { icon:"RS",  bg:"#ce4a00", text:"#fff", glow:"rgba(206,74,0,0.15)"    },
};

const RATING = {
  excellent:{ color:"#22d3ee", bg:"rgba(34,211,238,0.08)",  border:"rgba(34,211,238,0.25)", label:"Excellent" },
  good:     { color:"#34d399", bg:"rgba(52,211,153,0.08)",  border:"rgba(52,211,153,0.25)", label:"Good"      },
  fair:     { color:"#facc15", bg:"rgba(250,204,21,0.08)",  border:"rgba(250,204,21,0.25)", label:"Fair"      },
  poor:     { color:"#fb923c", bg:"rgba(251,146,60,0.08)",  border:"rgba(251,146,60,0.25)", label:"Poor"      },
  critical: { color:"#f87171", bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.25)",label:"Critical"  },
};
function ratingStyle(r) { return RATING[r] || RATING.fair; }
const scoreColor = (s) => s>=80?"#22d3ee":s>=60?"#34d399":s>=40?"#facc15":s>=20?"#fb923c":"#f87171";

// ─── Language Dropdown ─────────────────────────────────────────────────────
function LanguageDropdown({ language, onChange }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const sel  = LANGUAGES.find(l=>l.value===language);
  const meta = LANG_META[language]||LANG_META.javascript;
  useEffect(()=>{
    const fn=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",fn); return()=>document.removeEventListener("mousedown",fn);
  },[]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{borderColor:open?meta.bg+"60":undefined}}
        className="flex items-center gap-2.5 pl-2 pr-3 py-2 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-gray-200 hover:border-[#2e2e3e] transition-all w-[210px] justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0" style={{background:meta.bg,color:meta.text}}>{meta.icon}</span>
          <div className="text-left">
            <div className="text-xs font-semibold text-gray-200 leading-none mb-0.5">{sel?.label}</div>
            <div className="text-[10px] text-gray-600 font-mono leading-none">.{sel?.ext}</div>
          </div>
        </div>
        <span className={`text-gray-600 transition-transform duration-200 shrink-0 ${open?"rotate-180":""}`}><Icon.ChevronDown/></span>
      </button>
      {open&&(
        <div className="absolute top-full left-0 mt-2 w-[240px] bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl z-[999] shadow-2xl shadow-black/80 overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-[#1e1e2e]">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">Select Language</p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {LANGUAGES.map(l=>{
              const m=LANG_META[l.value]||LANG_META.javascript;
              const active=l.value===language;
              return(
                <button key={l.value} onClick={()=>{onChange(l.value);setOpen(false);}}
                  style={active?{background:m.glow,borderColor:m.bg+"40"}:{}}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-left transition-all border ${active?"border-transparent":"border-transparent hover:bg-[#1a1a24] hover:border-[#2e2e3e]"}`}>
                  <span className="w-7 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[9px] shrink-0" style={{background:m.bg,color:m.text,opacity:active?1:0.75}}>{m.icon}</span>
                  <span className={`text-xs font-medium flex-1 ${active?"text-white":"text-gray-400"}`}>{l.label}</span>
                  {SAMPLES[l.value]&&<span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono font-semibold shrink-0" style={{background:m.bg+"25",color:m.bg==="#f7df1e"?"#a89000":m.bg}}>demo</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loader ────────────────────────────────────────────────────────────────
function AnalysingLoader() {
  const steps=["Parsing code structure…","Detecting loops & recursion…","Calculating Big-O notation…"];
  const [step,setStep]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setStep(s=>(s+1)%steps.length),900);return()=>clearInterval(t);},[]);
  return(
    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-purple-800/40"/>
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin"/>
      </div>
      <div className="text-center">
        <p className="text-sm text-purple-300 font-mono mb-1.5">{steps[step]}</p>
        <p className="text-xs text-gray-600">AI is reading your algorithm</p>
      </div>
    </div>
  );
}

// ─── Big-O Chart — LARGE ───────────────────────────────────────────────────
function BigOChart({ notation, compact=false }) {
  const W=560, H=compact?130:190;
  const PAD={t:16,r:16,b:32,l:42};
  const cW=W-PAD.l-PAD.r, cH=H-PAD.t-PAD.b, N=25;
  const clamp=v=>Math.min(v,cH);
  const curves=[
    {label:"O(1)",       color:"#22d3ee", fn:()=>4},
    {label:"O(log n)",   color:"#34d399", fn:i=>Math.log2(i+1)*10},
    {label:"O(n)",       color:"#a3e635", fn:i=>i*(cH/N)},
    {label:"O(n log n)", color:"#facc15", fn:i=>i*Math.log2(i+1)*(cH/(N*Math.log2(N+1)))},
    {label:"O(n²)",      color:"#fb923c", fn:i=>(i*i)*(cH/(N*N))},
    {label:"O(2ⁿ)",      color:"#f87171", dash:true, fn:i=>Math.pow(2,i)*(cH/Math.pow(2,N))},
  ];
  const norm=(n="")=>n.replace(/n\^2/gi,"n²").replace(/2\^n/gi,"2ⁿ").replace(/\s/g,"");
  const hl=norm(notation||"");
  const isHit=label=>hl.includes(label.replace(/\s/g,""))||label.replace(/\s/g,"")=== hl;
  const pts=fn=>Array.from({length:N+1},(_,i)=>{
    const x=PAD.l+(i/N)*cW, y=PAD.t+cH-clamp(fn(i));
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-5">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-4">Big-O Growth Curve</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {[0.25,0.5,0.75,1].map(p=><line key={p} x1={PAD.l} y1={PAD.t+cH-p*cH} x2={PAD.l+cW} y2={PAD.t+cH-p*cH} stroke="#1a1a2e" strokeWidth="1"/>)}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t+cH} stroke="#2e2e3e" strokeWidth="1.5"/>
        <line x1={PAD.l} y1={PAD.t+cH} x2={PAD.l+cW} y2={PAD.t+cH} stroke="#2e2e3e" strokeWidth="1.5"/>
        <text x={13} y={PAD.t+cH/2} fill="#4b5563" fontSize="10" textAnchor="middle" transform={`rotate(-90,13,${PAD.t+cH/2})`} fontFamily="monospace">ops</text>
        {[{p:0,l:"0"},{p:0.5,l:"n/2"},{p:1,l:"n"}].map(({p,l})=>(
          <text key={l} x={PAD.l+p*cW} y={H-8} fill="#4b5563" fontSize="10" textAnchor="middle" fontFamily="monospace">{l}</text>
        ))}
        {curves.map(({label,color,dash,fn})=>!isHit(label)&&(
          <polyline key={label} points={pts(fn)} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray={dash?"3 3":undefined} opacity="0.15"/>
        ))}
        {curves.map(({label,color,dash,fn})=>isHit(label)&&(
          <g key={label+"-hi"}>
            <polyline points={pts(fn)} fill="none" stroke={color} strokeWidth="10" opacity="0.1"/>
            <polyline points={pts(fn)} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={dash?"4 4":undefined}/>
          </g>
        ))}
        {/* Legend — 2 cols */}
        {curves.map(({label,color},i)=>{
          const hit=isHit(label), col=i<3?0:1, row=i%3;
          const lx=PAD.l+col*268, ly=PAD.t+row*17;
          return(
            <g key={label+"-l"} opacity={hit?1:0.3}>
              <rect x={lx} y={ly+4} width="16" height="3" rx="1.5" fill={color}/>
              <text x={lx+22} y={ly+10} fill={hit?color:"#6b7280"} fontSize="10" fontFamily="monospace" fontWeight={hit?"700":"400"}>{label}</text>
            </g>
          );
        })}
      </svg>
      {notation&&<p className="text-[10px] text-gray-500 mt-3 font-mono">Your code → <span className="font-semibold" style={{color:curves.find(c=>isHit(c.label))?.color||"#a78bfa"}}>{notation}</span> highlighted</p>}
    </div>
  );
}

// ─── Score Ring ────────────────────────────────────────────────────────────
function ScoreRing({ score, size=88 }) {
  const r=(size-8)/2, circ=2*Math.PI*r;
  const dash=(score/100)*circ, c=scoreColor(score);
  return(
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle" fill={c} fontSize="18" fontWeight="700" fontFamily="monospace">{score}</text>
    </svg>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────────
function ResultPanel({ result, code="", language="javascript", showChart=true, showRefactor=false }) {
  const { time_complexity:tc, space_complexity:sc, overall_score,
          loops_detected, recursive, best_case, worst_case, average_case,
          bottleneck, suggestions } = result;
  const tcS=ratingStyle(tc?.rating), scS=ratingStyle(sc?.rating);
  return (
    <div className="space-y-3">
      <div className="grid gap-3" style={{gridTemplateColumns:"80px 1fr 1fr"}}>
        <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl flex flex-col items-center justify-center gap-1 py-4">
          <ScoreRing score={overall_score||0} size={68}/>
          <p className="text-[10px] text-gray-600 font-mono">Score</p>
        </div>
        <div className="bg-[#0a0a0f] border rounded-xl px-3 py-3" style={{borderColor:tcS.border}}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-[11px] text-gray-400"><Icon.Clock/><span>Time</span></div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono" style={{background:tcS.bg,color:tcS.color}}>{tcS.label}</span>
          </div>
          <p className="font-mono font-bold text-xl leading-none mb-1" style={{color:tcS.color}}>{tc?.notation||"—"}</p>
          <p className="text-[11px] text-gray-500 line-clamp-2">{tc?.explanation}</p>
        </div>
        <div className="bg-[#0a0a0f] border rounded-xl px-3 py-3" style={{borderColor:scS.border}}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-[11px] text-gray-400"><Icon.Box/><span>Space</span></div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono" style={{background:scS.bg,color:scS.color}}>{scS.label}</span>
          </div>
          <p className="font-mono font-bold text-xl leading-none mb-1" style={{color:scS.color}}>{sc?.notation||"—"}</p>
          <p className="text-[11px] text-gray-500 line-clamp-2">{sc?.explanation}</p>
        </div>
      </div>
      {showChart&&<BigOChart notation={tc?.notation} compact/>}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-2">Cases</p>
          {[["Best",best_case,"#34d399"],["Avg",average_case,"#facc15"],["Worst",worst_case,"#f87171"]].map(([l,v,c])=>(
            <div key={l} className="flex justify-between py-1 border-b border-[#1e1e2e] last:border-0">
              <span className="text-xs text-gray-500">{l}</span>
              <span className="font-mono text-xs font-semibold" style={{color:c}}>{v||"—"}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-2">Stats</p>
          {[["Loops",loops_detected??0,"text-gray-300"],["Recursive",recursive?"Yes":"No",recursive?"text-orange-400":"text-gray-300"]].map(([l,v,c])=>(
            <div key={l} className="flex justify-between py-1 border-b border-[#1e1e2e] last:border-0">
              <span className="text-xs text-gray-500">{l}</span>
              <span className={`font-mono text-xs font-bold ${c}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      {bottleneck&&<div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-3"><p className="text-[10px] text-gray-600 font-mono mb-1">Bottleneck</p><p className="text-xs text-amber-400 font-mono">{bottleneck}</p></div>}
      {suggestions?.length>0&&(
        <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-3">
          <p className="text-[10px] text-gray-600 font-mono mb-2">Suggestions</p>
          <ul className="space-y-1.5">{suggestions.map((s,i)=><li key={i} className="flex gap-2 text-xs text-gray-400"><span className="text-purple-500 shrink-0">›</span>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

// ─── Refactor Panel ────────────────────────────────────────────────────────
function RefactorPanel({ code, language, result }) {
  const [busy,   setBusy]   = useState(false);
  const [data,   setData]   = useState(null);
  const [err,    setErr]    = useState(null);
  const [copied, setCopied] = useState(false);

  const canRefactor = ["fair","poor","critical"].includes(result?.time_complexity?.rating);
  if (!canRefactor) return null;

  const run = async () => {
    setBusy(true); setErr(null); setData(null);
    try {
      const res  = await fetch("/api/refactor", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ code, language,
          current_time:  result.time_complexity?.notation,
          current_score: result.overall_score }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Refactor failed");
      setData(json.result);
    } catch(e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(data.refactored_code);
    setCopied(true); setTimeout(()=>setCopied(false), 1500);
  };

  const ext = language==="python"?"py":language==="typescript"?"ts":"js";

  return (
    <div className="space-y-3 pt-1">

      {/* ── Divider ── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-emerald-900/30"/>
        <span className="text-[10px] text-emerald-700 font-mono uppercase tracking-widest">Auto-Refactor</span>
        <div className="h-px flex-1 bg-emerald-900/30"/>
      </div>

      {/* ── CTA ── */}
      {!data && (
        <button onClick={run} disabled={busy}
          className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
            busy
              ? "bg-emerald-900/10 text-emerald-600 border-emerald-800/20 cursor-not-allowed"
              : "bg-emerald-900/10 border-emerald-800/30 text-emerald-400 hover:bg-emerald-900/25 hover:border-emerald-600/50 active:scale-[0.99]"
          }`}>
          {busy
            ? <><Icon.Spin/>Generating optimised code…</>
            : <><Icon.Wand/>Auto-Refactor — Optimise my {result.time_complexity?.notation} code</>}
        </button>
      )}

      {err && (
        <div className="flex items-center gap-2 bg-red-950/30 border border-red-800/40 rounded-xl px-4 py-3 text-xs text-red-400">
          <Icon.AlertCircle/>{err}
        </div>
      )}

      {data && (
        <div className="space-y-3">

          {/* ── Before / After + Summary ── */}
          <div className="bg-emerald-950/15 border border-emerald-800/25 rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1.5 text-sm">
              <Icon.Wand/> Optimisation Complete
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">{data.improvement_summary}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0a0a0f] rounded-xl p-3.5 text-center border border-[#1e1e2e]">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Before</p>
                <p className="font-mono font-bold text-lg" style={{color:scoreColor(result.overall_score)}}>{result.time_complexity?.notation}</p>
                <p className="text-xs text-gray-600 mt-1">{result.overall_score}/100</p>
              </div>
              <div className="bg-[#0a0a0f] rounded-xl p-3.5 text-center border border-emerald-800/30">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">After</p>
                <p className="font-mono font-bold text-lg" style={{color:scoreColor(data.score_after)}}>{data.new_time_complexity}</p>
                <p className="text-xs text-emerald-500 mt-1">
                  {data.score_after}/100
                  {data.score_after > result.overall_score && <span className="ml-1 font-semibold">(+{data.score_after - result.overall_score})</span>}
                </p>
              </div>
            </div>
          </div>

          {/* ── What Changed + Code — side by side ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left: what changed */}
            {data.changes?.length > 0 && (
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-4">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-3">What Changed</p>
                <ul className="space-y-2.5">
                  {data.changes.map((c,i)=>(
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Right: optimised code */}
            <div className="bg-[#0d0d14] border border-emerald-800/20 rounded-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e2e]">
                <span className="text-xs text-emerald-700 font-mono">optimised.{ext}</span>
                <div className="flex items-center gap-1">
                  <button onClick={copy}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
                    {copied?<><Icon.Check/>Copied!</>:<><Icon.Copy/>Copy</>}
                  </button>
                  <button onClick={run} disabled={busy}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e] disabled:opacity-40">
                    <Icon.Reload/>Retry
                  </button>
                </div>
              </div>
              <pre className="px-4 py-4 text-xs text-[#e2e8f0] font-mono overflow-auto max-h-72 whitespace-pre leading-relaxed flex-1">{data.refactored_code}</pre>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Compare Panel ─────────────────────────────────────────────────────────
function ComparePanel({ resultA, resultB, labelA="Version A", labelB="Version B" }) {
  const sA=resultA.overall_score, sB=resultB.overall_score;
  const diff=Math.abs(sA-sB);
  const rankA=getRank(resultA.time_complexity?.notation), rankB=getRank(resultB.time_complexity?.notation);
  let winner,winnerLabel,verdict;
  if(sA>sB){winner="A";winnerLabel=labelA;verdict=`${labelA} wins by ${diff} points`;}
  else if(sB>sA){winner="B";winnerLabel=labelB;verdict=`${labelB} wins by ${diff} points`;}
  else{winner=null;winnerLabel=null;verdict="It's a tie!";}
  const ROWS=[
    {label:"Time",a:resultA.time_complexity?.notation,b:resultB.time_complexity?.notation,rankA,rankB},
    {label:"Space",a:resultA.space_complexity?.notation,b:resultB.space_complexity?.notation,rankA:getRank(resultA.space_complexity?.notation),rankB:getRank(resultB.space_complexity?.notation)},
    {label:"Score",a:sA+"/100",b:sB+"/100",rankA:100-sA,rankB:100-sB},
    {label:"Loops",a:String(resultA.loops_detected??"?"),b:String(resultB.loops_detected??"?"),rankA:resultA.loops_detected??0,rankB:resultB.loops_detected??0},
  ];
  return(
    <div className="space-y-6">
      <div className={`rounded-xl px-6 py-5 border text-center ${winner?"bg-purple-900/20 border-purple-700/40":"bg-[#111118] border-[#1e1e2e]"}`}>
        {winner&&<div className="flex items-center justify-center gap-2 text-purple-300 mb-1.5"><Icon.Trophy/><span className="font-bold">{winnerLabel} is faster</span></div>}
        <p className={`font-mono font-semibold ${winner?"text-white text-xl":"text-gray-300 text-base"}`}>{verdict}</p>
        {diff>0&&<p className="text-xs text-gray-500 mt-1">Score difference: {diff} points</p>}
      </div>
      {/* Side-by-side charts */}
      <div className="grid grid-cols-2 gap-5">
        <div><p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest mb-2">{labelA}</p><BigOChart notation={resultA.time_complexity?.notation} compact/></div>
        <div><p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-2">{labelB}</p><BigOChart notation={resultB.time_complexity?.notation} compact/></div>
      </div>
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 text-[10px] text-gray-600 uppercase tracking-widest font-mono border-b border-[#1e1e2e]">
          <div className="px-5 py-3">Metric</div>
          <div className="px-5 py-3 text-purple-400">{labelA}</div>
          <div className="px-5 py-3 text-cyan-400">{labelB}</div>
        </div>
        {ROWS.map(({label,a,b,rankA:rA,rankB:rB})=>{
          const aW=rA<rB,bW=rB<rA;
          return(
            <div key={label} className="grid grid-cols-3 border-b border-[#1e1e2e] last:border-0">
              <div className="px-5 py-3.5 text-xs text-gray-500 font-mono">{label}</div>
              <div className={`px-5 py-3.5 font-mono text-sm font-semibold ${aW?"text-green-400":bW?"text-red-400/70":"text-gray-300"}`}>{a}{aW&&<span className="text-green-500 text-[10px] ml-1">✓</span>}</div>
              <div className={`px-5 py-3.5 font-mono text-sm font-semibold ${bW?"text-green-400":aW?"text-red-400/70":"text-gray-300"}`}>{b}{bW&&<span className="text-green-500 text-[10px] ml-1">✓</span>}</div>
            </div>
          );
        })}
      </div>
      {(resultA.suggestions?.length>0||resultB.suggestions?.length>0)&&(
        <div className="grid grid-cols-2 gap-5">
          {[{result:resultA,label:labelA,color:"text-purple-400"},{result:resultB,label:labelB,color:"text-cyan-400"}].map(({result,label,color})=>
            result.suggestions?.length>0&&(
              <div key={label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-5 py-4">
                <p className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${color}`}>{label} — Tips</p>
                <ul className="space-y-2">
                  {result.suggestions.slice(0,2).map((s,i)=>(
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2 leading-relaxed"><span className="text-purple-500 shrink-0 mt-0.5">›</span>{s}</li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Code Editor Box ───────────────────────────────────────────────────────
function CodeEditor({ code, onChange, language, onLanguageChange, label, color="text-purple-400" }) {
  const [copied,setCopied]=useState(false);
  const lang=LANGUAGES.find(l=>l.value===language);
  const copy=async()=>{if(!code.trim())return;await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1500);};
  return(
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-mono font-bold ${color}`}>{label}</span>
        <LanguageDropdown language={language} onChange={onLanguageChange}/>
        {SAMPLES[language]&&(
          <button onClick={()=>onChange(SAMPLES[language]?.code||SAMPLES[language])}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 border border-[#1e1e2e] rounded-xl hover:border-purple-700 hover:text-purple-400 transition-all font-mono">
            <Icon.Flask/>Demo
          </button>
        )}
      </div>
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 opacity-60"/>
            <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-60"/>
            <span className="w-3 h-3 rounded-full bg-green-500 opacity-60"/>
            <span className="ml-2 text-xs text-gray-600 font-mono">{lang?.label}.{lang?.ext}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={copy} disabled={!code.trim()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
              {copied?<><Icon.Check/>Copied!</>:<><Icon.Copy/>Copy</>}
            </button>
            <button onClick={()=>onChange("")} disabled={!code.trim()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
              <Icon.Trash/>Clear
            </button>
          </div>
        </div>
        <textarea value={code} onChange={e=>onChange(e.target.value)}
          className="code-editor w-full bg-transparent px-5 py-5 text-[#e2e8f0] resize-none outline-none min-h-[280px] text-sm leading-relaxed font-mono"
          placeholder={`// Paste your ${lang?.label} code here…`}
          spellCheck={false} autoComplete="off" autoCapitalize="off"/>
      </div>
      <p className="text-[10px] text-gray-600 font-mono px-1">{code.split("\n").length} lines · {code.length} chars</p>
    </div>
  );
}

// ─── History Panel ─────────────────────────────────────────────────────────
function HistoryPanel({ history, onReload, onDelete, onClearAll }) {
  const [expandedId,setExpandedId]=useState(null);
  if(history.length===0) return(
    <div className="flex flex-col items-center justify-center py-28 border border-dashed border-[#1e1e2e] rounded-xl text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#111118] border border-[#1e1e2e] flex items-center justify-center mb-4 text-gray-600"><Icon.History/></div>
      <p className="text-gray-500 text-sm mb-1">No analyses yet</p>
      <p className="text-gray-700 text-xs">Run your first analysis — it will appear here automatically.</p>
    </div>
  );
  const scores=[...history].reverse().map(e=>e.overall_score);
  const avg=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  const best=Math.max(...scores);
  const trending=scores.length>=2?scores[scores.length-1]-scores[0]:0;
  const groups={};
  history.forEach(e=>{
    const k=new Date(e.id).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    if(!groups[k])groups[k]=[];groups[k].push(e);
  });
  return(
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          {label:"Total",value:history.length,color:"text-gray-300"},
          {label:"Avg Score",value:avg,color:avg>=70?"text-green-400":avg>=45?"text-yellow-400":"text-red-400"},
          {label:"Best",value:best,color:"text-cyan-400"},
          {label:"Trend",value:trending>0?`+${trending}`:String(trending),color:trending>0?"text-green-400":trending<0?"text-red-400":"text-gray-400"},
        ].map(({label,value,color})=>(
          <div key={label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-5 text-center">
            <p className={`font-mono font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-[10px] text-gray-600 mt-1">{label}</p>
          </div>
        ))}
      </div>
      {scores.length>=2&&(
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Score Progress</p>
            <p className="text-xs">
              {trending>0?<span className="text-green-400 flex items-center gap-1"><Icon.TrendUp/>Improving +{trending} pts overall</span>
               :trending<0?<span className="text-red-400 flex items-center gap-1"><Icon.TrendDown/>Declining {trending} pts overall</span>
               :<span className="text-gray-400">Stable</span>}
            </p>
          </div>
          {(()=>{
            const W=200,H=40,P=6;
            const mn=Math.min(...scores),mx=Math.max(...scores),rng=mx-mn||1;
            const pts=scores.map((s,i)=>{
              const x=P+(i/(scores.length-1))*(W-P*2), y=H-P-((s-mn)/rng)*(H-P*2);
              return `${x},${y}`;
            }).join(" ");
            const last=scores[scores.length-1],first=scores[0];
            const c=last>=first?"#34d399":"#f87171";
            const lx=P+((scores.length-1)/(scores.length-1))*(W-P*2);
            const ly=H-P-((last-mn)/rng)*(H-P*2);
            return(
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                <polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                <circle cx={lx} cy={ly} r="3" fill={c}/>
              </svg>
            );
          })()}
        </div>
      )}
      <div className="flex justify-end">
        <button onClick={onClearAll} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-950/20 border border-transparent hover:border-red-900/30">
          <Icon.Delete/>Clear all history
        </button>
      </div>
      {Object.entries(groups).map(([date,entries])=>(
        <div key={date} className="space-y-2">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono px-1">{date} · {entries.length} {entries.length===1?"analysis":"analyses"}</p>
          {entries.map(entry=>{
            const meta=LANG_META[entry.language]||LANG_META.javascript;
            const rStyle=ratingStyle(entry.time_rating);
            const isOpen=expandedId===entry.id;
            const time=new Date(entry.id).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
            const sc=entry.overall_score;
            const sCol=scoreColor(sc);
            return(
              <div key={entry.id} className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden hover:border-[#2e2e3e] transition-all">
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer" onClick={()=>setExpandedId(isOpen?null:entry.id)}>
                  <span className="w-9 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0" style={{background:meta.bg,color:meta.text}}>{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 font-mono truncate">{entry.codeSnippet}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-600">{time}</span>
                      <span className="text-[10px]" style={{color:rStyle.color}}>{entry.time_notation}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-lg" style={{color:sCol}}>{sc}</p>
                    <p className="text-[9px] text-gray-600">/100</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={e=>{e.stopPropagation();onReload(entry);}} className="p-2 rounded-lg text-gray-600 hover:text-purple-400 hover:bg-purple-900/20 transition-all"><Icon.Reload/></button>
                    <button onClick={e=>{e.stopPropagation();onDelete(entry.id);}} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-all"><Icon.Delete/></button>
                    <span className={`text-gray-600 transition-transform duration-200 ${isOpen?"rotate-180":""}`}><Icon.ChevronDown/></span>
                  </div>
                </div>
                {isOpen&&(
                  <div className="border-t border-[#1e1e2e] px-5 py-5">
                    <div className="bg-[#0a0a0f] rounded-xl p-4 mb-5 font-mono text-xs text-gray-400 overflow-x-auto max-h-40 whitespace-pre leading-relaxed">{entry.code}</div>
                    {entry.result&&<ResultPanel result={entry.result} showChart/>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Home() {
  const [code,setCode]         = useState("");
  const [language,setLanguage] = useState("javascript");
  const [result,setResult]     = useState(null);
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState(null);
  const [valErr,setValErr]     = useState(null);
  const [copied,setCopied]     = useState(false);

  const [codeA,setCodeA]           = useState("");
  const [codeB,setCodeB]           = useState("");
  const [langA,setLangA]           = useState("javascript");
  const [langB,setLangB]           = useState("javascript");
  const [resultA,setResultA]       = useState(null);
  const [resultB,setResultB]       = useState(null);
  const [comparing,setComparing]   = useState(false);
  const [compareErr,setCompareErr] = useState(null);

  const [mode,setMode]     = useState("analyse");
  const [history,setHistory] = useState([]);

  const currentLang=LANGUAGES.find(l=>l.value===language);

  useEffect(()=>{setHistory(loadHistory());},[]);

  const handleLanguageChange=useCallback(lang=>{setLanguage(lang);setResult(null);setValErr(null);},[]);

  const analyse=async()=>{
    const err=validateCode(code); if(err){setValErr(err);return;}
    setLoading(true);setError(null);setValErr(null);setResult(null);
    try{
      const res=await fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,language})});
      const data=await res.json();
      if(!res.ok||!data.success) throw new Error(data.error||"Analysis failed");
      setResult(data.result);
      const entry={code,language,codeSnippet:code.trim().split("\n")[0].slice(0,60),
        overall_score:data.result.overall_score,time_notation:data.result.time_complexity?.notation,
        time_rating:data.result.time_complexity?.rating,result:data.result};
      setHistory(addToHistory(entry));
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  const compare=async()=>{
    const eA=validateCode(codeA),eB=validateCode(codeB);
    if(eA){setCompareErr("Version A: "+eA);return;}
    if(eB){setCompareErr("Version B: "+eB);return;}
    setComparing(true);setCompareErr(null);setResultA(null);setResultB(null);
    try{
      const [resA,resB]=await Promise.all([
        fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:codeA,language:langA})}),
        fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:codeB,language:langB})}),
      ]);
      const [dA,dB]=await Promise.all([resA.json(),resB.json()]);
      if(!resA.ok||!dA.success) throw new Error("Version A: "+(dA.error||"failed"));
      if(!resB.ok||!dB.success) throw new Error("Version B: "+(dB.error||"failed"));
      setResultA(dA.result);setResultB(dB.result);
    }catch(e){setCompareErr(e.message);}
    finally{setComparing(false);}
  };

  const handleReload  =entry=>{setCode(entry.code);setLanguage(entry.language);setResult(entry.result||null);setMode("analyse");};
  const handleDelete  =id=>{const u=history.filter(e=>e.id!==id);saveHistory(u);setHistory(u);};
  const handleClearAll=()=>{saveHistory([]);setHistory([]);};
  const loadDemo      =()=>{const s=SAMPLES[language];if(s){setCode(s?.code||s);setResult(null);setValErr(null);}};
  const copyCode      =async()=>{if(!code.trim())return;await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1500);};

  return(
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Full width wrapper, generous padding ── */}
      <div className="max-w-[1400px] mx-auto px-16 py-12">

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-900/20 border border-purple-800/30 rounded-full px-5 py-2 text-xs text-purple-400 font-mono mb-5">
            <Icon.Zap/>ComplexityIQ — Algorithm Analyser
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent tracking-tight">
            Analyse Your Algorithm
          </h1>
          <p className="text-gray-500">Instant Big-O analysis · Visual growth charts · Side-by-side comparison · History tracking</p>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#111118] border border-[#1e1e2e] rounded-2xl p-1.5 mb-10 max-w-sm mx-auto">
          {[
            {id:"analyse",label:"Analyse",icon:<Icon.BarChart/>},
            {id:"compare",label:"Compare",icon:<Icon.GitCompare/>},
            {id:"history",label:"History",icon:<Icon.History/>,badge:history.length||null},
          ].map(({id,label,icon,badge})=>(
            <button key={id} onClick={()=>setMode(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all relative ${mode===id?"bg-purple-600 text-white shadow-lg shadow-purple-900/40":"text-gray-500 hover:text-gray-300"}`}>
              {icon}{label}
              {badge&&<span className="absolute top-1.5 right-2 min-w-[16px] h-4 rounded-full bg-purple-500 text-white text-[9px] font-mono flex items-center justify-center px-1">{badge>99?"99+":badge}</span>}
            </button>
          ))}
        </div>

        {/* ── ANALYSE ── */}
        {mode==="analyse"&&(
          <div className="space-y-6">

            {/* ── TOP ROW: Editor + Quick Stats ── */}
            <div className="grid gap-6" style={{gridTemplateColumns:"1fr 1fr"}}>

              {/* LEFT — editor */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <LanguageDropdown language={language} onChange={handleLanguageChange}/>
                  {SAMPLES[language]&&(
                    <button onClick={loadDemo} className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 border border-[#1e1e2e] rounded-xl hover:border-purple-700 hover:text-purple-400 transition-all font-mono">
                      <Icon.Flask/>Load demo
                    </button>
                  )}
                  <span className="ml-auto text-[10px] text-gray-600 font-mono">{code.split("\n").length}L · {code.length}ch</span>
                </div>
                <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden flex-1">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e2e]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 opacity-60"/>
                      <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-60"/>
                      <span className="w-3 h-3 rounded-full bg-green-500 opacity-60"/>
                      <span className="ml-2 text-xs text-gray-600 font-mono">{currentLang?.label}.{currentLang?.ext}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={copyCode} disabled={!code.trim()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white disabled:opacity-30 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
                        {copied?<><Icon.Check/>Copied!</>:<><Icon.Copy/>Copy</>}
                      </button>
                      <button onClick={()=>{setCode("");setResult(null);setError(null);setValErr(null);}} disabled={!code.trim()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors px-2 py-1 rounded hover:bg-[#1e1e2e]">
                        <Icon.Trash/>Clear
                      </button>
                    </div>
                  </div>
                  <textarea value={code} onChange={e=>{setCode(e.target.value);setResult(null);setValErr(null);}}
                    className="code-editor w-full bg-transparent px-5 py-4 text-[#e2e8f0] resize-none outline-none min-h-[340px] text-sm leading-relaxed font-mono"
                    placeholder={`// Paste your ${currentLang?.label} code here…`}
                    spellCheck={false} autoComplete="off" autoCapitalize="off"/>
                </div>
                {valErr&&(
                  <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 text-xs text-red-400">
                    <Icon.AlertCircle/>{valErr}
                  </div>
                )}
                <button onClick={analyse} disabled={loading}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm ${loading?"bg-purple-900/40 text-purple-400 cursor-not-allowed border border-purple-800/40":"bg-purple-600 hover:bg-purple-500 text-white active:scale-[0.99] shadow-lg shadow-purple-900/30"}`}>
                  {loading?<><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Analysing…</>:<><Icon.Zap/>Analyse Complexity</>}
                </button>
              </div>

              {/* RIGHT — score + time + space, or empty state */}
              <div className="flex flex-col gap-3">
                {loading&&<AnalysingLoader/>}
                {!loading&&error&&(
                  <div className="flex items-start gap-3 bg-red-950/30 border border-red-800/50 rounded-xl p-5 text-sm text-red-400 h-full">
                    <Icon.AlertCircle/>
                    <div><p className="font-semibold mb-1">Analysis failed</p><p className="text-xs opacity-80">{error}</p></div>
                  </div>
                )}
                {!loading&&!result&&!error&&(
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10 border border-dashed border-[#1e1e2e] rounded-xl">
                    <div className="w-16 h-16 rounded-2xl bg-[#111118] border border-[#1e1e2e] flex items-center justify-center mb-4 text-gray-600"><Icon.Code/></div>
                    <p className="text-gray-500 text-sm mb-1">No analysis yet</p>
                    <p className="text-gray-700 text-xs mb-8">Paste code and click <span className="text-purple-400">Analyse</span></p>
                    <div className="w-full max-w-xs px-4">
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Complexity Reference</p>
                      <div className="space-y-2 text-left">
                        {[
                          {n:"O(1)",       label:"Constant",     w:"5%",   c:"bg-cyan-400"  },
                          {n:"O(log n)",   label:"Logarithmic",  w:"15%",  c:"bg-green-400" },
                          {n:"O(n)",       label:"Linear",       w:"30%",  c:"bg-lime-400"  },
                          {n:"O(n log n)", label:"Linearithmic", w:"45%",  c:"bg-yellow-400"},
                          {n:"O(n²)",      label:"Quadratic",    w:"65%",  c:"bg-orange-400"},
                          {n:"O(2ⁿ)",      label:"Exponential",  w:"85%",  c:"bg-red-400"   },
                          {n:"O(n!)",      label:"Factorial",    w:"100%", c:"bg-red-700"   },
                        ].map(({n,label,w,c})=>(
                          <div key={n} className="flex items-center gap-3">
                            <code className="text-[11px] font-mono text-gray-400 w-20 shrink-0">{n}</code>
                            <div className="flex-1 bg-[#0a0a0f] rounded h-1.5"><div className={`h-full rounded ${c}`} style={{width:w}}/></div>
                            <span className="text-[11px] text-gray-600 w-20 text-right shrink-0">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Score + Time + Space top cards — shown when result exists */}
                {result&&!loading&&(()=>{
                  const tc=result.time_complexity, sc=result.space_complexity;
                  const tcS=ratingStyle(tc?.rating), scS=ratingStyle(sc?.rating);
                  return(
                    <div className="flex flex-col gap-3 h-full">
                      {/* Score ring + quick badges */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl flex flex-col items-center justify-center gap-1.5 py-5">
                          <ScoreRing score={result.overall_score||0}/>
                          <p className="text-[10px] text-gray-600 font-mono">Score</p>
                        </div>
                        <div className="bg-[#111118] border rounded-xl px-4 py-4" style={{borderColor:tcS.border}}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400"><Icon.Clock/><span>Time</span></div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold" style={{background:tcS.bg,color:tcS.color,border:`1px solid ${tcS.border}`}}>{tcS.label}</span>
                          </div>
                          <p className="font-mono font-bold text-2xl leading-none mb-1.5" style={{color:tcS.color}}>{tc?.notation||"—"}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{tc?.explanation}</p>
                        </div>
                        <div className="bg-[#111118] border rounded-xl px-4 py-4" style={{borderColor:scS.border}}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400"><Icon.Box/><span>Space</span></div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold" style={{background:scS.bg,color:scS.color,border:`1px solid ${scS.border}`}}>{scS.label}</span>
                          </div>
                          <p className="font-mono font-bold text-2xl leading-none mb-1.5" style={{color:scS.color}}>{sc?.notation||"—"}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{sc?.explanation}</p>
                        </div>
                      </div>
                      {/* Cases + Stats side by side */}
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-4">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-3">Case Analysis</p>
                          <div className="space-y-2.5">
                            {[["Best",result.best_case,"#34d399"],["Average",result.average_case,"#facc15"],["Worst",result.worst_case,"#f87171"]].map(([l,v,c])=>(
                              <div key={l} className="flex items-center justify-between py-1 border-b border-[#1e1e2e] last:border-0">
                                <span className="text-xs text-gray-500">{l}</span>
                                <span className="font-mono text-sm font-semibold" style={{color:c}}>{v||"—"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-4">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-3">Stats</p>
                          <div className="space-y-2.5">
                            {[
                              ["Loops",     result.loops_detected??0,           "text-gray-300"],
                              ["Recursive", result.recursive?"Yes":"No",        result.recursive?"text-orange-400":"text-gray-300"],
                              ["Score",     `${result.overall_score||0}/100`,   ""],
                            ].map(([l,v,cls])=>(
                              <div key={l} className="flex items-center justify-between py-1 border-b border-[#1e1e2e] last:border-0">
                                <span className="text-xs text-gray-500">{l}</span>
                                <span className={`font-mono text-sm font-bold ${cls}`} style={l==="Score"?{color:scoreColor(result.overall_score||0)}:{}}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── RESULTS FULL WIDTH (only when result exists) ── */}
            {result&&!loading&&(
              <div className="space-y-4">

                {/* Big-O Chart — full width */}
                <BigOChart notation={result.time_complexity?.notation}/>

                {/* Bottleneck + Suggestions side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-5 py-4">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-2.5">Bottleneck</p>
                    {result.bottleneck
                      ? <p className="text-xs text-amber-400 font-mono leading-relaxed">{result.bottleneck}</p>
                      : <p className="text-xs text-gray-700 italic">No bottleneck detected</p>}
                  </div>
                  <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-5 py-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-2.5"><Icon.Lightbulb/><span>Suggestions</span></div>
                    {result.suggestions?.length>0
                      ?<ul className="space-y-2">
                        {result.suggestions.map((s,i)=>(
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
                            <span className="w-4 h-4 rounded-full bg-purple-900/50 border border-purple-700/40 flex items-center justify-center text-purple-400 shrink-0 text-[9px] font-mono mt-0.5">{i+1}</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                      :<p className="text-xs text-gray-700 italic">No suggestions</p>}
                  </div>
                </div>

                {/* Refactor — full width */}
                <RefactorPanel code={code} language={language} result={result}/>
              </div>
            )}
          </div>
        )}

        {/* ── COMPARE ── */}
        {mode==="compare"&&(
          <div className="space-y-8">
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl px-5 py-3.5 text-sm text-gray-500 text-center">
              Paste two versions of your code — ComplexityIQ analyses both simultaneously and declares a winner.
            </div>
            <div className="grid grid-cols-2 gap-8">
              <CodeEditor code={codeA} onChange={setCodeA} language={langA} onLanguageChange={setLangA} label="Version A" color="text-purple-400"/>
              <CodeEditor code={codeB} onChange={setCodeB} language={langB} onLanguageChange={setLangB} label="Version B" color="text-cyan-400"/>
            </div>
            {compareErr&&(
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 text-xs text-red-400">
                <Icon.AlertCircle/>{compareErr}
              </div>
            )}
            <button onClick={compare} disabled={comparing}
              className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${comparing?"bg-purple-900/40 text-purple-400 cursor-not-allowed border border-purple-800/40":"bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white active:scale-[0.99]"}`}>
              {comparing?<><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Comparing both versions…</>:<><Icon.GitCompare/>Compare Both Versions</>}
            </button>
            {resultA&&resultB&&!comparing&&<ComparePanel resultA={resultA} resultB={resultB}/>}
          </div>
        )}

        {/* ── HISTORY ── */}
        {mode==="history"&&(
          <HistoryPanel history={history} onReload={handleReload} onDelete={handleDelete} onClearAll={handleClearAll}/>
        )}

        <footer className="mt-16 pt-6 border-t border-[#1e1e2e] flex items-center justify-between text-xs text-gray-600">
          <span>ComplexityIQ — Built with Next.js + Groq AI</span>
          <a href="https://roshnithakor07.github.io" className="text-purple-500 hover:text-purple-400">by Roshni Thakor</a>
        </footer>
      </div>
    </div>
  );
}