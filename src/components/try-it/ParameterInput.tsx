"use client";

import { useMemo } from "react";
import type { OpenAPIParameter } from "@/types/openapi";
import { getParamPlaceholder } from "@/lib/request-executor";

interface ParameterInputProps {
  name: string;
  parameter: OpenAPIParameter;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Reusable input component for editing parameters, headers, query params, etc.
 */
export function ParameterInput({
  name,
  parameter,
  value,
  onChange,
  disabled = false,
  required = false,
}: ParameterInputProps) {
  const placeholder = useMemo(() => getParamPlaceholder(parameter), [parameter]);
  const description = parameter.description || "";
  const format = parameter.schema?.format ? ` · ${parameter.schema.format}` : "";
  const typeStr = parameter.schema?.type ? ` · ${parameter.schema.type}` : "";

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {name}
          {required || parameter.required ? (
            <span className="text-red-500 ml-0.5">*</span>
          ) : null}
        </label>
        {typeStr || format ? (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {typeStr}
            {format}
          </span>
        ) : null}
      </div>

      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          {description}
        </p>
      )}

      {parameter.schema?.enum && parameter.schema.enum.length > 0 ? (
        // Dropdown for enum
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Select {name} —</option>
          {parameter.schema.enum.map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {String(opt)}
            </option>
          ))}
        </select>
      ) : parameter.schema?.type === "boolean" ? (
        // Checkbox for boolean
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Select —</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        // Text input for everything else
        <input
          type={
            parameter.schema?.format === "password"
              ? "password"
              : parameter.schema?.format === "email"
                ? "email"
                : "text"
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
    </div>
  );
}
