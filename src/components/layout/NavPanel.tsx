"use client";

import { useState } from "react";
import { useSpec } from "@/lib/spec-context";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchModal } from "@/components/search/SearchModal";
import type { ParsedOperation, ParsedTag } from "@/types/openapi";

export function NavPanel() {
  const { spec, activeOperation, setActiveOperation } = useSpec();
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsedTags, setCollapsedTags] = useState<Set<string>>(new Set());

  if (!spec) return null;

  const toggleTag = (name: string) => {
    setCollapsedTags((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <nav
        className="nav-panel bg-[var(--nav-bg)] border-r border-[var(--nav-border)] flex flex-col"
        aria-label="API navigation"
      >
        {/* Logo / Title */}
        <div className="px-4 py-4 border-b border-[var(--nav-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {spec.info.title}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                v{spec.info.version}
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Search trigger */}
        <div className="px-3 py-3 border-b border-[var(--nav-border)] shrink-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 text-left text-xs">Search...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          {spec.tags.map((tag: ParsedTag) => {
            const isCollapsed = collapsedTags.has(tag.name);
            return (
              <div key={tag.name} className="mb-1">
                <button
                  onClick={() => toggleTag(tag.name)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <svg
                    className={`w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform shrink-0 ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide truncate">
                    {tag.name}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-400 shrink-0">
                    {tag.operations.length}
                  </span>
                </button>

                {!isCollapsed && (
                  <ul className="ml-3 mr-2 mb-1">
                    {tag.operations.map((op: ParsedOperation) => {
                      const isActive =
                        activeOperation?.method === op.method &&
                        activeOperation?.path === op.path;
                      return (
                        <li key={`${op.method}-${op.path}`}>
                          <button
                            onClick={() => setActiveOperation(op)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                              isActive
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <MethodBadge method={op.method} size="sm" />
                            <span
                              className={`text-xs font-mono truncate ${
                                isActive
                                  ? "text-indigo-700 dark:text-indigo-300"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                              title={op.path}
                            >
                              {op.path}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--nav-border)] shrink-0">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span>Built with</span>
            <span className="font-semibold text-indigo-500">SpecFlow</span>
          </div>
        </div>
      </nav>
    </>
  );
}
