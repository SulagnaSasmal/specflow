"use client";

import { useState, useMemo } from "react";
import type { ParsedSpec } from "@/types/openapi";
import { ParameterInput } from "./ParameterInput";

interface AuthPanelProps {
  spec: ParsedSpec | null;
  authToken: string | undefined;
  onAuthTokenChange: (token: string | undefined) => void;
  corsProxyUrl: string | undefined;
  onCorsProxyChange: (url: string | undefined) => void;
}

export function AuthPanel({
  spec,
  authToken,
  onAuthTokenChange,
  corsProxyUrl,
  onCorsProxyChange,
}: AuthPanelProps) {
  const [showAuth, setShowAuth] = useState(false);

  const securitySchemes = useMemo(
    () => spec?.components?.securitySchemes || {},
    [spec]
  );

  const requiresAuth = useMemo(() => {
    return spec?.operations?.some((op) => op.security && op.security.length > 0) || false;
  }, [spec]);

  if (!requiresAuth && !corsProxyUrl) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Auth Status */}
          {requiresAuth && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Authentication:
                </span>
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    authToken
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      authToken ? "bg-green-600" : "bg-amber-600"
                    }`}
                  />
                  {authToken ? "Authenticated" : "Not Authenticated"}
                </div>
              </div>

              <button
                onClick={() => setShowAuth(!showAuth)}
                className="text-xs px-2 py-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                {showAuth ? "Hide" : "Configure"}
              </button>

              {authToken && (
                <button
                  onClick={() => onAuthTokenChange(undefined)}
                  className="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* CORS Proxy */}
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-600 dark:text-slate-400">CORS Proxy:</label>
            <input
              type="text"
              value={corsProxyUrl || ""}
              onChange={(e) =>
                onCorsProxyChange(e.target.value || undefined)
              }
              placeholder="https://cors-anywhere.herokuapp.com/"
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Auth Config Panel */}
        {showAuth && Object.keys(securitySchemes).length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="max-w-md">
              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bearer Token
                </label>
                <input
                  type="password"
                  value={authToken || ""}
                  onChange={(e) => onAuthTokenChange(e.target.value || undefined)}
                  placeholder="your-api-token-here"
                  className="w-full px-2 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This token will be included in requests as: Authorization: Bearer your-token
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
