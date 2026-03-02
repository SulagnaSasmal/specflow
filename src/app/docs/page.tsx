"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSpec } from "@/lib/spec-context";
import { NavPanel } from "@/components/layout/NavPanel";
import { ContentPanel } from "@/components/layout/ContentPanel";
import { CodePanel } from "@/components/layout/CodePanel";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchModal } from "@/components/search/SearchModal";
import { useState } from "react";

export default function DocsPage() {
  const { spec, isLoading, error, loadSpec, clearSpec } = useSpec();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  // Attempt to restore spec from sessionStorage on page load
  useEffect(() => {
    if (!spec && typeof window !== "undefined") {
      const saved = sessionStorage.getItem("specflow-spec");
      if (saved) {
        loadSpec(saved);
      } else {
        router.push("/");
      }
    }
  }, [spec, loadSpec, router]);

  // Keyboard shortcut: Cmd/Ctrl+K for search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm text-slate-500 dark:text-slate-400">Parsing OpenAPI spec...</div>
        </div>
      </div>
    );
  }

  if (error && !spec) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Failed to parse spec
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!spec) return null;

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Top bar (mobile + breadcrumb) */}
      <div className="sticky top-0 z-30 bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--panel-border)] px-4 py-2 flex items-center gap-3 xl:hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            SF
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {spec.info.title}
          </span>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button
          onClick={() => { clearSpec(); router.push("/"); }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Back to home"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <ThemeToggle />
      </div>

      {/* Three-panel layout */}
      <div className="three-panel">
        <NavPanel />
        <ContentPanel />
        <CodePanel />
      </div>
    </>
  );
}
