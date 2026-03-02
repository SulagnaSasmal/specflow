"use client";

import type { HttpMethod } from "@/types/openapi";

const METHOD_STYLES: Record<HttpMethod, string> = {
  get:     "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  post:    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  put:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  patch:   "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  delete:  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  head:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  options: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  trace:   "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

interface MethodBadgeProps {
  method: HttpMethod;
  size?: "sm" | "md";
}

export function MethodBadge({ method, size = "md" }: MethodBadgeProps) {
  const style = METHOD_STYLES[method] || METHOD_STYLES.get;
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <span
      className={`inline-block font-mono font-bold uppercase rounded ${sizeClass} ${style}`}
    >
      {method}
    </span>
  );
}
