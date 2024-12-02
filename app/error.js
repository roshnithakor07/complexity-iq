"use client";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-red-400 font-mono mb-4">{error?.message || "Something went wrong"}</p>
        <button onClick={reset} className="px-4 py-2 bg-purple-600 rounded-lg text-sm">Try again</button>
      </div>
    </div>
  );
}