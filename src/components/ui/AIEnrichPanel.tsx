"use client";

import { useState, useCallback } from "react";
import { useSpec } from "@/lib/spec-context";
import {
  identifyEnrichmentTargets,
  applyEnrichments,
} from "@/lib/enrichment";
import type { EnrichmentResult } from "@/lib/enrichment";

type EnrichState = "idle" | "running" | "done" | "error";

export function AIEnrichPanel() {
  const { spec, loadSpec } = useSpec();
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("specflow-openai-key") || "";
    }
    return "";
  });
  const [showKey, setShowKey] = useState(false);
  const [state, setState] = useState<EnrichState>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState<EnrichmentResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const targets = spec ? identifyEnrichmentTargets(spec) : [];
  const hasGaps = targets.length > 0;

  const handleEnrich = useCallback(async () => {
    if (!spec || !apiKey.trim()) return;

    // Persist key in sessionStorage (not localStorage — session-scoped for security)
    sessionStorage.setItem("specflow-openai-key", apiKey.trim());

    setState("running");
    setProgress({ done: 0, total: targets.length });
    setErrorMsg("");
    setResults([]);

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targets,
          apiKey: apiKey.trim(),
          apiTitle: spec.info.title,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Enrichment failed");
        setState("error");
        return;
      }

      const enrichedSpec = applyEnrichments(spec, data.results as EnrichmentResult[]);
      setResults(data.results);
      setProgress({ done: data.stats.enriched, total: data.stats.total });
      setState("done");

      // Patch the context — re-parse from the enriched JSON
      await loadSpec(enrichedSpec);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unexpected error");
      setState("error");
    }
  }, [spec, apiKey, targets, loadSpec]);

  if (!spec) return null;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="AI Enrichment — fill missing descriptions with GPT"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          hasGaps
            ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/60"
            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        {hasGaps ? `AI Enrich (${targets.length} gaps)` : "✓ Enriched"}
      </button>

      {/* Drawer / modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="AI Enrichment"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => state !== "running" && setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">AI Enrichment</span>
              </div>
              {state !== "running" && (
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Gaps summary */}
              {state === "idle" && (
                <>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    SpecFlow detected <strong className="text-slate-800 dark:text-slate-200">{targets.length}</strong> fields with
                    missing or thin content:{" "}
                    {targets.filter((t) => t.type === "operation_summary").length} summaries,{" "}
                    {targets.filter((t) => t.type === "operation_description").length} descriptions,{" "}
                    {targets.filter((t) => t.type === "tag_description").length} tag descriptions.
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    GPT-4o mini rewrites each missing field in active voice, second person, present tense — following
                    Microsoft Style Guide conventions. Your API key is used only for this request and stored in
                    sessionStorage; it is never logged.
                  </p>

                  {/* API key input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      OpenAI API key
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-indigo-500 hover:text-indigo-600 font-normal"
                      >
                        Get key →
                      </a>
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={showKey ? "Hide key" : "Show key"}
                      >
                        {showKey ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleEnrich}
                    disabled={!apiKey.trim() || targets.length === 0}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Enrich {targets.length} field{targets.length !== 1 ? "s" : ""} with GPT-4o mini
                  </button>
                </>
              )}

              {/* Running */}
              {state === "running" && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Enriching {progress.done} / {progress.total} fields…
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    This may take 20–60 seconds depending on spec size.
                  </p>
                </div>
              )}

              {/* Done */}
              {state === "done" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">
                      {results.length} field{results.length !== 1 ? "s" : ""} enriched successfully
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {results.slice(0, 10).map((r, i) => (
                      <div key={i} className="text-xs bg-slate-50 dark:bg-slate-800 rounded p-2 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 font-mono mr-1">
                          {r.type === "tag_description" ? r.tagName : `${r.method?.toUpperCase()} ${r.path}`}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{r.enrichedValue}</span>
                      </div>
                    ))}
                    {results.length > 10 && (
                      <p className="text-xs text-slate-400 pl-1">+{results.length - 10} more</p>
                    )}
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Error */}
              {state === "error" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{errorMsg}</span>
                  </div>
                  <button
                    onClick={() => setState("idle")}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
