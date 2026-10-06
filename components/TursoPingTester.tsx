"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, Copy, Check, Zap, Server } from "lucide-react";

export default function TursoPingTester() {
  const [testing, setTesting] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleTestPing = async () => {
    setTesting(true);
    setStatus("idle");
    setErrorMessage("");
    const startTime = performance.now();

    try {
      const res = await fetch("/api/turso-status");
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      setLatency(elapsed);

      const data = await res.json();
      if (res.ok && data.connected) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to communicate with Turso endpoint");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Network error");
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Test Latency Action Bar */}
      <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-gray-900 text-xs">Edge Database Latency Test</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Send a roundtrip query to measure response times and edge database health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {latency !== null && (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
              {status === "success" ? (
                <span className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{latency} ms roundtrip</span>
                </span>
              ) : (
                <span className="text-rose-700 bg-rose-100 px-2 py-1 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Failed ({latency} ms)</span>
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleTestPing}
            disabled={testing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            <span>{testing ? "Pinging..." : "Test Latency Now"}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Copyable Quick Shell Commands */}
      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900 text-gray-100 p-3.5 rounded-xl font-mono flex items-center justify-between gap-2 border border-slate-800">
          <div className="truncate">
            <span className="text-gray-500">$ </span>
            <span className="text-purple-300">node scripts/seed.mjs</span>
          </div>
          <button
            onClick={() => copyToClipboard("node scripts/seed.mjs", "seed")}
            className="p-1.5 hover:bg-slate-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Copy command"
          >
            {copiedKey === "seed" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="bg-slate-900 text-gray-100 p-3.5 rounded-xl font-mono flex items-center justify-between gap-2 border border-slate-800">
          <div className="truncate">
            <span className="text-gray-500">$ </span>
            <span className="text-purple-300">npm run db:push</span>
          </div>
          <button
            onClick={() => copyToClipboard("npm run db:push", "push")}
            className="p-1.5 hover:bg-slate-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Copy command"
          >
            {copiedKey === "push" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
