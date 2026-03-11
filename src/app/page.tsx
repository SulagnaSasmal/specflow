"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSpec } from "@/lib/spec-context";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ConfigPanel } from "@/components/ui/ConfigPanel";

export default function HomePage() {
  const { loadSpec, isLoading, error } = useSpec();
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "paste" | "url">("upload");
  const [pasteValue, setPasteValue] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const text = await file.text();
    await loadSpec(text);
    router.push("/docs");
  }, [loadSpec, router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback(async () => {
    if (!pasteValue.trim()) return;
    await loadSpec(pasteValue);
    router.push("/docs");
  }, [pasteValue, loadSpec, router]);

  const handleUrl = useCallback(async () => {
    if (!urlValue.trim()) return;
    try {
      const res = await fetch(urlValue);
      const text = await res.text();
      await loadSpec(text);
      router.push("/docs");
    } catch (err) {
      // Error handled by context
      void err;
    }
  }, [urlValue, loadSpec, router]);

  const loadVaultPayExample = useCallback(async () => {
    try {
      const res = await fetch("/examples/vaultpay.yaml");
      const text = await res.text();
      await loadSpec(text);
      router.push("/docs");
    } catch (err) {
      void err;
    }
  }, [loadSpec, router]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--panel-border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            SF
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">SpecFlow</span>
            <span className="ml-2 text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              OpenAPI → Developer Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/sulagnasasmal/specflow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors hidden sm:block"
          >
            GitHub
          </a>
          <ConfigPanel />
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-6 border border-indigo-200 dark:border-indigo-800">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Open Source — Free Forever
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              Drop an OpenAPI spec.
              <br />
              <span className="text-indigo-600 dark:text-indigo-400">Get a developer portal.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
              Stripe-quality three-panel docs with AI enrichment, spec quality scoring, live code samples, and compliance annotations.
            </p>
          </div>

          {/* Input card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            {/* Mode tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {(["upload", "paste", "url"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    inputMode === mode
                      ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 -mb-px"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {mode === "upload" ? "Upload File" : mode === "paste" ? "Paste Spec" : "From URL"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Upload */}
              {inputMode === "upload" && (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                    dragging
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".yaml,.yml,.json"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Drop your OpenAPI spec here
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    YAML or JSON · OpenAPI 3.0 / 3.1
                  </div>
                  {isLoading && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                      <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Parsing...
                    </div>
                  )}
                </div>
              )}

              {/* Paste */}
              {inputMode === "paste" && (
                <div>
                  <textarea
                    value={pasteValue}
                    onChange={(e) => setPasteValue(e.target.value)}
                    placeholder={`openapi: "3.1.0"\ninfo:\n  title: My API\n  version: "1.0.0"\npaths:\n  /hello:\n    get:\n      summary: Hello World\n      responses:\n        "200":\n          description: Success`}
                    className="w-full h-48 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={handlePaste}
                    disabled={!pasteValue.trim() || isLoading}
                    className="mt-3 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {isLoading ? "Parsing..." : "Generate Portal"}
                  </button>
                </div>
              )}

              {/* URL */}
              {inputMode === "url" && (
                <div>
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="https://petstore3.swagger.io/api/v3/openapi.json"
                    className="w-full font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === "Enter" && handleUrl()}
                  />
                  <button
                    onClick={handleUrl}
                    disabled={!urlValue.trim() || isLoading}
                    className="mt-3 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    {isLoading ? "Fetching & Parsing..." : "Generate Portal"}
                  </button>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
                    The URL must allow CORS requests from the browser
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-sm text-red-700 dark:text-red-400 font-medium">Parse Error</div>
                  <div className="text-xs text-red-600 dark:text-red-500 mt-0.5">{error}</div>
                </div>
              )}
            </div>
          </div>

          {/* Example specs */}
          <div className="mt-8">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide text-center mb-4">
              Try an example
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={loadVaultPayExample}
                disabled={isLoading}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all text-left disabled:opacity-50 min-w-[240px]"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  VP
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">VaultPay API</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">FinTech payments with PCI-DSS, PSD2 compliance</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Features strip */}
      <section className="border-t border-[var(--panel-border)] bg-slate-50 dark:bg-slate-900/50 px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: "⚡", title: "Instant", desc: "Parse any OpenAPI 3.x spec in seconds" },
            { icon: "✨", title: "AI Enrichment", desc: "Auto-complete summaries & descriptions with GPT-4o" },
            { icon: "📊", title: "Quality Score", desc: "100-point rubric across 5 coverage categories" },
            { icon: "🔒", title: "Compliance", desc: "PCI-DSS, PSD2, GDPR annotations" },
          ].map((f) => (
            <div key={f.title}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{f.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
