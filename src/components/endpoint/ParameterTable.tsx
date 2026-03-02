"use client";

import type { OpenAPIParameter } from "@/types/openapi";
import { SchemaTree } from "@/components/schema/SchemaTree";

interface ParameterTableProps {
  parameters: OpenAPIParameter[];
  location: "path" | "query" | "header" | "cookie";
}

export function ParameterTable({ parameters, location }: ParameterTableProps) {
  const filtered = parameters.filter((p) => p.in === location);
  if (!filtered.length) return null;

  const labels: Record<string, string> = {
    path: "Path Parameters",
    query: "Query Parameters",
    header: "Header Parameters",
    cookie: "Cookie Parameters",
  };

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        {labels[location]}
      </h4>
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Name
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Type
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
            {filtered.map((param) => {
              const type = Array.isArray(param.schema?.type)
                ? param.schema?.type.join(" | ")
                : param.schema?.type;
              return (
                <tr
                  key={`${param.in}-${param.name}`}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <code className="font-mono text-xs text-slate-800 dark:text-slate-200">
                      {param.name}
                    </code>
                    {param.required && (
                      <span className="ml-1 text-red-500 text-xs">*</span>
                    )}
                    {param.deprecated && (
                      <span className="ml-1 text-[10px] px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded">
                        deprecated
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
                      {type || "string"}
                      {param.schema?.format && (
                        <span className="text-slate-400"> · {param.schema.format}</span>
                      )}
                    </span>
                    {param.schema?.enum && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(param.schema.enum as unknown[]).map((v, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-200 dark:border-indigo-800"
                          >
                            {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                    {param.description || (
                      <span className="italic text-slate-400">No description</span>
                    )}
                    {param.schema?.default !== undefined && (
                      <div className="mt-1">
                        <span className="text-slate-400">Default: </span>
                        <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                          {String(param.schema.default)}
                        </code>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
