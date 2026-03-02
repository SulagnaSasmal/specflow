"use client";

import { useState, useEffect } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { LANGUAGES, type Language } from "@/generator/code-samples";

interface CodeBlockProps {
  code: string;
  language?: string;
}

// Simple syntax highlighter using regex (no heavy library needed for this)
function highlight(code: string, language: string): string {
  // Return escaped HTML with basic coloring via CSS classes
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped;
}

export function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  return (
    <div className="relative group rounded-lg overflow-hidden bg-[#0f172a] border border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/60">
        <span className="text-xs font-mono text-slate-400">{language}</span>
        <CopyButton text={code} />
      </div>
      <div className="overflow-x-auto">
        <pre className="text-sm p-4 text-slate-300 font-mono leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface LanguageTabsProps {
  samples: Partial<Record<Language, string>>;
  defaultLanguage?: Language;
}

export function LanguageTabs({ samples, defaultLanguage = "curl" }: LanguageTabsProps) {
  const available = LANGUAGES.filter((l) => samples[l.id]);
  const [active, setActive] = useState<Language>(
    available.find((l) => l.id === defaultLanguage)?.id || available[0]?.id || "curl"
  );

  if (!available.length) return null;

  const code = samples[active] || "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-700/50 bg-slate-800/40 overflow-x-auto shrink-0">
        {available.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setActive(lang.id)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              active === lang.id
                ? "text-indigo-400 border-b-2 border-indigo-400 bg-slate-900/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="relative group">
          <div className="absolute right-3 top-3 z-10">
            <CopyButton text={code} />
          </div>
          <pre className="text-sm p-4 text-slate-300 font-mono leading-relaxed whitespace-pre overflow-x-auto min-h-[200px]">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
