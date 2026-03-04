"use client";

import { useState, useMemo } from "react";
import type { ParsedOperation } from "@/types/openapi";
import type { RequestBuilderConfig, TryItResponse } from "@/types/try-it";
import { ParameterInput } from "./ParameterInput";
import { ResponseDisplay } from "./ResponseDisplay";

interface RequestBuilderProps {
  operation: ParsedOperation;
  baseUrl: string;
  onExecute: (config: RequestBuilderConfig) => Promise<TryItResponse>;
  isLoading?: boolean;
  response?: TryItResponse | null;
}

export function RequestBuilder({
  operation,
  baseUrl,
  onExecute,
  isLoading = false,
  response,
}: RequestBuilderProps) {
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState<string>("");
  const [localResponse, setLocalResponse] = useState<TryItResponse | null>(response || null);
  const [localIsLoading, setLocalIsLoading] = useState(false);

  // Categorize parameters
  const pathParameters = useMemo(
    () => operation.parameters?.filter((p) => p.in === "path") || [],
    [operation.parameters]
  );
  const queryParameters = useMemo(
    () => operation.parameters?.filter((p) => p.in === "query") || [],
    [operation.parameters]
  );
  const headerParameters = useMemo(
    () => operation.parameters?.filter((p) => p.in === "header") || [],
    [operation.parameters]
  );

  // Handle execute
  const handleExecute = async () => {
    setLocalIsLoading(true);
    try {
      const config: RequestBuilderConfig = {
        pathParams,
        queryParams,
        headers,
        body: bodyText || undefined,
      };

      const result = await onExecute(config);
      setLocalResponse(result);
    } catch (error) {
      setLocalResponse({
        status: 0,
        statusText: "Error",
        headers: {},
        body: null,
        bodyRaw: "",
        time: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLocalIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Preview */}
      <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
          Request URL
        </div>
        <div className="font-mono text-sm text-slate-700 dark:text-slate-300 break-all">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {operation.method.toUpperCase()}
          </span>
          {" "}
          <span>{baseUrl}{operation.path}</span>
        </div>
      </div>

      {/* Path Parameters */}
      {pathParameters.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Path Parameters
          </div>
          <div className="space-y-3">
            {pathParameters.map((param) => (
              <ParameterInput
                key={param.name}
                name={param.name}
                parameter={param}
                value={pathParams[param.name] || ""}
                onChange={(val) => setPathParams({ ...pathParams, [param.name]: val })}
                required={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Query Parameters */}
      {queryParameters.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Query Parameters (Optional)
          </div>
          <div className="space-y-3">
            {queryParameters.map((param) => (
              <ParameterInput
                key={param.name}
                name={param.name}
                parameter={param}
                value={queryParams[param.name] || ""}
                onChange={(val) => setQueryParams({ ...queryParams, [param.name]: val })}
                required={param.required}
              />
            ))}
          </div>
        </div>
      )}

      {/* Headers */}
      <div>
        <div className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Request Headers {headerParameters.length > 0 && `(${headerParameters.length})`}
        </div>
        <div className="space-y-3">
          {/* Standard headers */}
          {headerParameters.map((param) => (
            <ParameterInput
              key={param.name}
              name={param.name}
              parameter={param}
              value={headers[param.name] || ""}
              onChange={(val) => setHeaders({ ...headers, [param.name]: val })}
              required={param.required}
            />
          ))}

          {/* Custom header row */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Custom Headers (key: value format)
            </label>
            <textarea
              placeholder="X-Custom-Header: value"
              value={Object.entries(headers)
                .filter(([k]) => !headerParameters.some((p) => p.name === k))
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n")}
              onChange={(e) => {
                const customHeaders: Record<string, string> = {};
                e.target.value.split("\n").forEach((line) => {
                  const [key, value] = line.split(":").map((s) => s.trim());
                  if (key && value) customHeaders[key] = value;
                });
                setHeaders({ ...headers, ...customHeaders });
              }}
              className="w-full mt-1 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Request Body */}
      {operation.requestBody && (
        <div>
          <div className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Request Body
          </div>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder={
              operation.requestBody?.content
                ? getBodyExample(operation.requestBody)
                : '{"key": "value"}'
            }
            className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
            rows={8}
          />
          <button
            onClick={() => {
              try {
                const parsed = JSON.parse(bodyText);
                setBodyText(JSON.stringify(parsed, null, 2));
              } catch {
                alert("Invalid JSON");
              }
            }}
            className="mt-2 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
          >
            Format JSON
          </button>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={localIsLoading || isLoading}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
      >
        {localIsLoading || isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          `Send ${operation.method.toUpperCase()} Request`
        )}
      </button>

      {/* Response */}
      <ResponseDisplay response={localResponse} isLoading={localIsLoading} />
    </div>
  );
}

function getBodyExample(requestBody: any): string {
  // Try to find a JSON example
  const jsonContent = requestBody.content?.["application/json"];
  if (!jsonContent) return "";

  if (jsonContent.example) {
    return JSON.stringify(jsonContent.example, null, 2);
  }

  if (jsonContent.examples && Object.keys(jsonContent.examples).length > 0) {
    const firstExample = Object.values(jsonContent.examples)[0] as any;
    return JSON.stringify(firstExample.value || firstExample, null, 2);
  }

  return "";
}
