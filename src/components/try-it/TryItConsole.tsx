"use client";

import { useState, useCallback } from "react";
import type { ParsedOperation, OpenAPIServer } from "@/types/openapi";
import type { RequestBuilderConfig, TryItRequest, TryItResponse } from "@/types/try-it";
import { executeRequest, buildRequestUrl } from "@/lib/request-executor";
import { RequestBuilder } from "./RequestBuilder";
import { CopyButton } from "@/components/ui/CopyButton";

interface TryItConsoleProps {
  operation: ParsedOperation;
  baseUrl: string;
  authToken?: string;
  corsProxyUrl?: string;
}

export function TryItConsole({
  operation,
  baseUrl,
  authToken,
  corsProxyUrl,
}: TryItConsoleProps) {
  const [response, setResponse] = useState<TryItResponse | null>(null);
  const [requestHistory, setRequestHistory] = useState<TryItRequest[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleExecute = useCallback(
    async (config: RequestBuilderConfig): Promise<TryItResponse> => {
      const result = await executeRequest(
        operation,
        config,
        authToken,
        corsProxyUrl,
        baseUrl
      );

      // Add to history
      const url = buildRequestUrl(baseUrl, operation, config.pathParams, config.queryParams);
      const historyEntry: TryItRequest = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        method: operation.method,
        path: operation.path,
        url,
        headers: config.headers,
        body: config.body,
        response: result,
      };

      // Keep last 5 requests
      setRequestHistory((prev) => [historyEntry, ...prev].slice(0, 5));
      setResponse(result);

      return result;
    },
    [operation, authToken, corsProxyUrl, baseUrl]
  );

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Try It Out
        </h3>
        {requestHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
          >
            History ({requestHistory.length})
          </button>
        )}
      </div>

      {/* Request Builder */}
      <RequestBuilder
        operation={operation}
        baseUrl={baseUrl}
        onExecute={handleExecute}
        response={response}
      />

      {/* Request History */}
      {showHistory && requestHistory.length > 0 && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Recent Requests
          </div>
          <div className="space-y-2 text-xs">
            {requestHistory.map((req) => (
              <div
                key={req.id}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {req.method.toUpperCase()}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
                      {req.path}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-white font-medium ${
                        req.response.status === 0
                          ? "bg-red-500"
                          : req.response.status < 300
                            ? "bg-green-500"
                            : req.response.status < 400
                              ? "bg-blue-500"
                              : req.response.status < 500
                                ? "bg-yellow-500"
                                : "bg-red-600"
                      }`}
                    >
                      {req.response.status}
                    </span>
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 mt-0.5">
                    {new Date(req.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <CopyButton text={JSON.stringify(req, null, 2)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
