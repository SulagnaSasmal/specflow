"use client";

import { useState } from "react";
import type { OpenAPIResponse } from "@/types/openapi";
import { SchemaTree } from "@/components/schema/SchemaTree";

const STATUS_STYLES: Record<string, string> = {
  "2": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  "3": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "4": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  "5": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};

function getStatusStyle(code: string): string {
  const prefix = code[0];
  return STATUS_STYLES[prefix] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
}

function getStatusText(code: string): string {
  const STATUS_TEXTS: Record<string, string> = {
    "200": "OK", "201": "Created", "204": "No Content",
    "400": "Bad Request", "401": "Unauthorized", "403": "Forbidden",
    "404": "Not Found", "409": "Conflict", "422": "Unprocessable Entity",
    "429": "Too Many Requests", "500": "Internal Server Error",
    "502": "Bad Gateway", "503": "Service Unavailable",
  };
  return STATUS_TEXTS[code] || "";
}

interface ResponseSectionProps {
  responses: Record<string, OpenAPIResponse>;
}

export function ResponseSection({ responses }: ResponseSectionProps) {
  const codes = Object.keys(responses).sort((a, b) => {
    if (a === "default") return 1;
    if (b === "default") return -1;
    return parseInt(a) - parseInt(b);
  });

  const [expanded, setExpanded] = useState<string | null>(codes[0] || null);

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Responses
      </h4>
      <div className="space-y-2">
        {codes.map((code) => {
          const resp = responses[code];
          const isOpen = expanded === code;
          const schema = resp.content?.["application/json"]?.schema
            || (resp.content && Object.values(resp.content)[0]?.schema);
          const example = resp.content?.["application/json"]?.example
            || (resp.content && Object.values(resp.content)[0]?.example);

          return (
            <div
              key={code}
              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : code)}
              >
                <span
                  className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded border ${getStatusStyle(code)}`}
                >
                  {code}
                  {getStatusText(code) && (
                    <span className="font-normal opacity-75">{getStatusText(code)}</span>
                  )}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                  {resp.description}
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (schema || example != null) && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/20">
                  {schema && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                        Response Schema
                      </div>
                      <SchemaTree schema={schema} />
                    </div>
                  )}
                  {example != null && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                        Example
                      </div>
                      <pre className="text-xs font-mono bg-slate-900 dark:bg-slate-950 text-slate-300 p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(example, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
