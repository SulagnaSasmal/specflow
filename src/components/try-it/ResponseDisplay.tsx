"use client";

import { useMemo } from "react";
import type { TryItResponse } from "@/types/try-it";

interface ResponseDisplayProps {
  response: TryItResponse | null;
  isLoading?: boolean;
}

export function ResponseDisplay({ response, isLoading = false }: ResponseDisplayProps) {
  const statusColorClass = useMemo(() => {
    if (!response) return "";
    if (response.status === 0) return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
    if (response.status < 300) return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
    if (response.status < 400) return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
    if (response.status < 500) return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800";
    return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
  }, [response]);

  const statusTextColor = useMemo(() => {
    if (!response) return "";
    if (response.status === 0) return "text-red-700 dark:text-red-400";
    if (response.status < 300) return "text-green-700 dark:text-green-400";
    if (response.status < 400) return "text-blue-700 dark:text-blue-400";
    if (response.status < 500) return "text-yellow-700 dark:text-yellow-400";
    return "text-red-700 dark:text-red-400";
  }, [response]);

  if (isLoading) {
    return (
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Sending request...</span>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg text-center text-sm text-slate-500 dark:text-slate-400">
        Response will appear here
      </div>
    );
  }

  // Error response
  if (response.error) {
    return (
      <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Error</div>
        <p className="text-xs text-red-600 dark:text-red-500 font-mono break-all">
          {response.error}
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-6 border rounded-lg overflow-hidden ${statusColorClass}`}>
      {/* Status Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`text-lg font-bold ${statusTextColor}`}>
            {response.status}
          </div>
          <span className={`text-sm font-medium ${statusTextColor}`}>
            {response.statusText}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {response.time.toFixed(0)}ms
        </span>
      </div>

      {/* Headers */}
      {Object.keys(response.headers).length > 0 && (
        <details className="border-b border-slate-200 dark:border-slate-700">
          <summary className="px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
            Response Headers ({Object.keys(response.headers).length})
          </summary>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/20 space-y-1">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-400">{key}:</span>
                <span className="ml-2 text-slate-700 dark:text-slate-300 break-all">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Body */}
      <div className="px-4 py-3">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Response Body
        </div>
        <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-auto max-h-96 font-mono">
          {typeof response.body === "string"
            ? response.body
            : JSON.stringify(response.body, null, 2)}
        </pre>
      </div>
    </div>
  );
}
