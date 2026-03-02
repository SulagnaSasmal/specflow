"use client";

import { useState } from "react";
import type { OpenAPISchema } from "@/types/openapi";

interface SchemaTreeProps {
  schema: OpenAPISchema;
  name?: string;
  required?: boolean;
  depth?: number;
}

export function SchemaTree({ schema, name, required, depth = 0 }: SchemaTreeProps) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (!schema) return null;

  // Handle composition types
  if (schema.oneOf) {
    return (
      <div className="mt-1">
        {name && <SchemaField name={name} required={required} type="oneOf" schema={schema} />}
        <CompositionBlock label="oneOf" schemas={schema.oneOf} depth={depth} />
      </div>
    );
  }
  if (schema.anyOf) {
    return (
      <div className="mt-1">
        {name && <SchemaField name={name} required={required} type="anyOf" schema={schema} />}
        <CompositionBlock label="anyOf" schemas={schema.anyOf} depth={depth} />
      </div>
    );
  }
  if (schema.allOf) {
    return (
      <div className="mt-1">
        {name && <SchemaField name={name} required={required} type="allOf" schema={schema} />}
        <CompositionBlock label="allOf" schemas={schema.allOf} depth={depth} />
      </div>
    );
  }

  const type = Array.isArray(schema.type) ? schema.type.join(" | ") : schema.type;
  const isObject = type === "object" || !!schema.properties;
  const isArray = type === "array";
  const hasChildren = isObject && schema.properties && Object.keys(schema.properties).length > 0;
  const requiredFields = schema.required || [];

  if (isArray && schema.items) {
    return (
      <div>
        {name && (
          <SchemaField
            name={name}
            required={required}
            type={`array[${getTypeLabel(schema.items)}]`}
            schema={schema}
            expandable={isObjectLike(schema.items)}
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}
          />
        )}
        {expanded && isObjectLike(schema.items) && (
          <div className="ml-4 mt-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
            <SchemaTree schema={schema.items} depth={depth + 1} />
          </div>
        )}
      </div>
    );
  }

  if (hasChildren) {
    return (
      <div>
        {name && (
          <SchemaField
            name={name}
            required={required}
            type={type || "object"}
            schema={schema}
            expandable
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}
          />
        )}
        {!name && depth === 0 && (
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            object
          </div>
        )}
        {(expanded || !name) && (
          <div className={name ? "ml-4 mt-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3" : ""}>
            {Object.entries(schema.properties!).map(([fieldName, fieldSchema]) => (
              <SchemaTree
                key={fieldName}
                schema={fieldSchema}
                name={fieldName}
                required={requiredFields.includes(fieldName)}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Leaf node
  return (
    <SchemaField
      name={name}
      required={required}
      type={type || "any"}
      schema={schema}
    />
  );
}

function isObjectLike(schema: OpenAPISchema): boolean {
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  return type === "object" || !!schema.properties || !!schema.allOf;
}

function getTypeLabel(schema: OpenAPISchema): string {
  const type = Array.isArray(schema.type) ? schema.type.join(" | ") : schema.type;
  if (schema.format) return `${type} · ${schema.format}`;
  return type || "object";
}

interface SchemaFieldProps {
  name?: string;
  required?: boolean;
  type: string;
  schema: OpenAPISchema;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

function SchemaField({ name, required, type, schema, expandable, expanded, onToggle }: SchemaFieldProps) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-sm group">
      {expandable ? (
        <button
          onClick={onToggle}
          className="mt-0.5 w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
        >
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <span className="w-4 shrink-0" />
      )}
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        {name && (
          <span className="font-mono text-slate-800 dark:text-slate-200 font-medium text-xs">
            {name}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </span>
        )}
        <TypeBadge type={type} format={schema.format} nullable={schema.nullable} />
        {schema.deprecated && (
          <span className="text-[10px] px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
            deprecated
          </span>
        )}
        {schema.readOnly && (
          <span className="text-[10px] px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
            read-only
          </span>
        )}
        {schema.writeOnly && (
          <span className="text-[10px] px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
            write-only
          </span>
        )}
        {schema.enum && (
          <span className="flex gap-1 flex-wrap">
            {(schema.enum as unknown[]).map((v, i) => (
              <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-200 dark:border-indigo-800">
                {String(v)}
              </span>
            ))}
          </span>
        )}
      </div>
      {schema.description && (
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto max-w-xs truncate hidden group-hover:block" title={schema.description}>
          {schema.description}
        </span>
      )}
    </div>
  );
}

function TypeBadge({ type, format, nullable }: { type: string; format?: string; nullable?: boolean }) {
  const displayType = nullable ? `${type} | null` : type;
  const typeColors: Record<string, string> = {
    string: "text-green-600 dark:text-green-400",
    integer: "text-blue-600 dark:text-blue-400",
    number: "text-blue-600 dark:text-blue-400",
    boolean: "text-yellow-600 dark:text-yellow-400",
    array: "text-purple-600 dark:text-purple-400",
    object: "text-orange-600 dark:text-orange-400",
  };
  const baseType = type.split(" | ")[0].replace("array[", "").replace("]", "");
  const color = typeColors[baseType] || "text-slate-500 dark:text-slate-400";

  return (
    <span className={`font-mono text-xs ${color}`}>
      {displayType}
      {format && <span className="text-slate-400 dark:text-slate-500"> · {format}</span>}
    </span>
  );
}

function CompositionBlock({
  label,
  schemas,
  depth,
}: {
  label: string;
  schemas: OpenAPISchema[];
  depth: number;
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 px-3 py-1.5 border-r border-slate-200 dark:border-slate-700">
          {label}
        </span>
        {schemas.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`text-xs px-3 py-1.5 transition-colors ${
              activeTab === i
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-b-2 border-indigo-500"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Option {i + 1}
          </button>
        ))}
      </div>
      <div className="p-3">
        <SchemaTree schema={schemas[activeTab]} depth={depth + 1} />
      </div>
    </div>
  );
}
