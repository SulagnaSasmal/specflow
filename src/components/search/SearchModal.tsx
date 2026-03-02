"use client";

import { useEffect, useState, useRef } from "react";
import { useSpec } from "@/lib/spec-context";
import { search } from "@/search";
import type { SearchIndexItem } from "@/types/openapi";
import { MethodBadge } from "@/components/ui/MethodBadge";
import type { HttpMethod } from "@/types/openapi";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { fuse, spec, setActiveOperation } = useSpec();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchIndexItem[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!fuse || !query.trim()) {
      setResults([]);
      return;
    }
    const r = search(fuse, query);
    setResults(r.slice(0, 10));
    setSelected(0);
  }, [query, fuse]);

  const handleSelect = (item: SearchIndexItem) => {
    if (item.type === "endpoint" && spec) {
      const op = spec.operations.find(
        (o) => (o.operationId === item.operationId) || (o.method === item.method && o.path === item.path)
      );
      if (op) setActiveOperation(op);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      handleSelect(results[selected]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search endpoints, schemas..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((item, i) => (
              <li key={item.id}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                    i === selected ? "bg-slate-50 dark:bg-slate-800/60" : ""
                  }`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelected(i)}
                >
                  {item.type === "endpoint" && item.method ? (
                    <MethodBadge method={item.method as HttpMethod} size="sm" />
                  ) : item.type === "schema" ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono font-bold">
                      schema
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-mono font-bold">
                      tag
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </div>
                    {item.path && (
                      <div className="text-xs text-slate-400 font-mono truncate">
                        {item.path}
                      </div>
                    )}
                  </div>
                  {item.tag && item.type === "endpoint" && (
                    <span className="text-xs text-slate-400 shrink-0">{item.tag}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {query && results.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}

        {!query && (
          <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
            Type to search endpoints and schemas
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px]">↑</kbd>
            <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px]">↓</kbd>
            to navigate
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px]">↵</kbd>
            to select
          </div>
        </div>
      </div>
    </div>
  );
}
