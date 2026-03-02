"use client";

import { useSpec } from "@/lib/spec-context";
import { LanguageTabs } from "@/components/code/CodeBlock";
import { generateCodeSample, LANGUAGES } from "@/generator/code-samples";
import type { Language } from "@/generator/code-samples";

export function CodePanel() {
  const { spec, activeOperation } = useSpec();

  if (!spec || !activeOperation) {
    return (
      <aside className="code-panel-aside bg-[#0f172a] border-l border-slate-700/50 flex items-center justify-center">
        <div className="text-center text-slate-500 p-8">
          <div className="text-4xl mb-3">{"{ }"}</div>
          <div className="text-sm">Select an endpoint to see code samples</div>
        </div>
      </aside>
    );
  }

  // Generate all code samples
  const samples = LANGUAGES.reduce<Partial<Record<Language, string>>>((acc, lang) => {
    try {
      acc[lang.id] = generateCodeSample(activeOperation, lang.id, {
        servers: spec.servers,
      });
    } catch {
      // skip
    }
    return acc;
  }, {});

  return (
    <aside className="code-panel-aside bg-[#0f172a] border-l border-slate-700/50 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700/50 shrink-0">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Code Samples
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <LanguageTabs samples={samples} />
      </div>

      {/* Request URL preview */}
      <div className="border-t border-slate-700/50 px-4 py-3 shrink-0">
        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-semibold">
          Request URL
        </div>
        <div className="flex items-center gap-2 bg-slate-800/60 rounded px-3 py-1.5">
          <span className="text-[10px] font-bold uppercase font-mono text-indigo-400">
            {activeOperation.method}
          </span>
          <span className="text-xs font-mono text-slate-300 truncate">
            {spec.servers?.[0]?.url?.replace(/\/$/, "") || "https://api.example.com"}
            {activeOperation.path}
          </span>
        </div>
      </div>
    </aside>
  );
}
