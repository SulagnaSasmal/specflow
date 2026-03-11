"use client";

import { useState, useCallback } from "react";
import type { SpecFlowConfig } from "@/types/config";
import { parseConfig, applyBranding } from "@/lib/config";
import { useSpec } from "@/lib/spec-context";

const EXAMPLE_CONFIG = `# specflow.config.yaml
branding:
  title: "My API Docs"       # Override nav title
  accent: "#6366f1"          # Accent colour (any CSS value)
  # logoUrl: "https://..."   # Optional logo URL
  # footerText: "© 2026 My Corp"

features:
  tryIt: true
  complianceBadges: true
  aiEnrichment: true
  qualityScore: true
  search: true

ai:
  model: "gpt-4o-mini"       # gpt-4o-mini | gpt-4o
  # systemPrompt: "Write for a financial services audience."
`;

export function ConfigPanel() {
  const { config, setConfig } = useSpec();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"upload" | "paste">("paste");
  const [pasteValue, setPasteValue] = useState("");
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  const handleApply = useCallback(async (text: string) => {
    setError("");
    const { config: merged, error: parseError } = await parseConfig(text);
    if (parseError) {
      setError(parseError);
      return;
    }
    setConfig(merged);
    applyBranding(merged);
    setApplied(true);
    setTimeout(() => setOpen(false), 800);
  }, [setConfig]);

  const handleFile = useCallback(async (file: File) => {
    const text = await file.text();
    await handleApply(text);
  }, [handleApply]);

  const handleReset = useCallback(() => {
    setConfig(null);
    // Reset CSS vars
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--accent-hover");
    setApplied(false);
  }, [setConfig]);

  const isActive = config !== null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Load a specflow.config.yaml to customise branding, features, and more"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          isActive
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {isActive ? "Config loaded" : "Config"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="SpecFlow Config"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">specflow.config</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Customise branding, toggle features, and configure AI enrichment with a YAML or JSON config file.
              </p>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 -mx-5 px-5">
                {(["paste", "upload"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`mr-4 pb-2 text-sm font-medium transition-colors ${
                      mode === m
                        ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {m === "paste" ? "Paste YAML / JSON" : "Upload file"}
                  </button>
                ))}
              </div>

              {mode === "paste" && (
                <div>
                  <textarea
                    value={pasteValue || EXAMPLE_CONFIG}
                    onChange={(e) => setPasteValue(e.target.value)}
                    className="w-full h-52 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleApply(pasteValue || EXAMPLE_CONFIG)}
                    className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {applied ? "✓ Applied" : "Apply config"}
                  </button>
                </div>
              )}

              {mode === "upload" && (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
                    <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Drop <code className="font-mono">specflow.config.yaml</code> or <code className="font-mono">.json</code> here
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".yaml,.yml,.json"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </label>
              )}

              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-2 border border-red-200 dark:border-red-800">
                  {error}
                </p>
              )}

              {isActive && (
                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium transition-colors"
                >
                  Reset to defaults
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
