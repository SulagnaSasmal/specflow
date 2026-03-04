"use client";

import type { ParsedOperation, ParsedSpec } from "@/types/openapi";
import { useSpec } from "@/lib/spec-context";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { ParameterTable } from "./ParameterTable";
import { ResponseSection } from "./ResponseSection";
import { RequestBodySection } from "./RequestBodySection";
import { TryItConsole } from "@/components/try-it/TryItConsole";

interface EndpointDocProps {
  operation: ParsedOperation;
  spec: ParsedSpec;
}

const COMPLIANCE_LABEL: Record<string, { label: string; color: string }> = {
  "PCI-DSS-4.0":  { label: "PCI DSS 4.0",  color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800" },
  "PSD2-SCA":     { label: "PSD2 SCA",      color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
  "BSA-AML":      { label: "BSA/AML",       color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" },
  "GDPR":         { label: "GDPR",          color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  "HIPAA":        { label: "HIPAA",         color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  "SOX":          { label: "SOX",           color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
};

export function EndpointDoc({ operation, spec: _spec }: EndpointDocProps) {
  const { authToken, selectedServer, corsProxyUrl } = useSpec();
  const params = operation.parameters || [];
  const compliance = operation["x-compliance"];
  const baseUrl = selectedServer?.url || _spec.servers?.[0]?.url || "https://api.example.com";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <MethodBadge method={operation.method} />
          <code className="text-lg font-mono text-slate-700 dark:text-slate-300 break-all">
            {operation.path}
          </code>
          {operation.deprecated && (
            <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-800 font-medium">
              Deprecated
            </span>
          )}
        </div>

        {operation.summary && (
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {operation.summary}
          </h2>
        )}

        {operation.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            {operation.description}
          </p>
        )}

        {/* Compliance badges */}
        {compliance?.regulations && compliance.regulations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {compliance.regulations.map((reg) => {
              const info = COMPLIANCE_LABEL[reg];
              return (
                <span
                  key={reg}
                  title={reg}
                  className={`text-xs px-2 py-0.5 rounded border font-medium ${
                    info?.color || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {info?.label || reg}
                </span>
              );
            })}
            {compliance["data-classification"] && (
              <span className="text-xs px-2 py-0.5 rounded border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                {compliance["data-classification"]}
              </span>
            )}
            {compliance["audit-required"] && (
              <span className="text-xs px-2 py-0.5 rounded border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                audit required
              </span>
            )}
          </div>
        )}

        {/* Operation ID */}
        {operation.operationId && (
          <div className="mt-3 text-xs text-slate-400 dark:text-slate-500 font-mono">
            operationId: {operation.operationId}
          </div>
        )}
      </div>

      {/* Parameters */}
      {params.length > 0 && (
        <div>
          <ParameterTable parameters={params} location="path" />
          <ParameterTable parameters={params} location="query" />
          <ParameterTable parameters={params} location="header" />
          <ParameterTable parameters={params} location="cookie" />
        </div>
      )}

      {/* Request Body */}
      {operation.requestBody && (
        <RequestBodySection requestBody={operation.requestBody} />
      )}

      {/* Responses */}
      <ResponseSection responses={operation.responses} />

      {/* Try-It Console */}
      <TryItConsole
        operation={operation}
        baseUrl={baseUrl}
        authToken={authToken}
        corsProxyUrl={corsProxyUrl}
      />
    </div>
  );
}
