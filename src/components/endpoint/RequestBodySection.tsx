"use client";

import { useState } from "react";
import type { ParsedOperation } from "@/types/openapi";
import { SchemaTree } from "@/components/schema/SchemaTree";

interface RequestBodySectionProps {
  requestBody: ParsedOperation["requestBody"];
}

export function RequestBodySection({ requestBody }: RequestBodySectionProps) {
  if (!requestBody) return null;

  const mediaTypes = Object.keys(requestBody.content || {});
  const [activeMediaType, setActiveMediaType] = useState(mediaTypes[0] || "application/json");

  const current = requestBody.content?.[activeMediaType];
  if (!current) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Request Body
          {requestBody.required && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded border border-red-200 dark:border-red-800">
              required
            </span>
          )}
        </h4>
        {mediaTypes.length > 1 && (
          <div className="flex gap-1">
            {mediaTypes.map((mt) => (
              <button
                key={mt}
                onClick={() => setActiveMediaType(mt)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  activeMediaType === mt
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {mt}
              </button>
            ))}
          </div>
        )}
      </div>

      {requestBody.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          {requestBody.description}
        </p>
      )}

      {current.schema && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{activeMediaType}</span>
          </div>
          <div className="p-4">
            <SchemaTree schema={current.schema} />
          </div>
        </div>
      )}

      {current.example != null && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Example
          </div>
          <pre className="text-xs font-mono bg-slate-900 dark:bg-slate-950 text-slate-300 p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(current.example, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
