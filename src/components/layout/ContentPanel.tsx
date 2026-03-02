"use client";

import { useSpec } from "@/lib/spec-context";
import { EndpointDoc } from "@/components/endpoint/EndpointDoc";

export function ContentPanel() {
  const { spec, activeOperation } = useSpec();

  if (!spec) return null;

  if (!activeOperation) {
    return (
      <main className="flex-1 min-h-screen overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <WelcomeSection spec={spec} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        <EndpointDoc operation={activeOperation} spec={spec} />
      </div>
    </main>
  );
}

function WelcomeSection({ spec }: { spec: import("@/types/openapi").ParsedSpec }) {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
        {spec.info.title}
      </h1>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded font-mono">
          v{spec.info.version}
        </span>
        {spec.servers?.[0]?.url && (
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
            {spec.servers[0].url}
          </span>
        )}
      </div>

      {spec.info.description && (
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          {spec.info.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard value={spec.operations.length} label="Endpoints" color="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" />
        <StatCard value={spec.tags.length} label="Resources" color="bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400" />
        <StatCard
          value={Object.keys(spec.components?.schemas || {}).length}
          label="Schemas"
          color="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Tags overview */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Resources</h2>
        <div className="space-y-3">
          {spec.tags.map((tag) => (
            <div
              key={tag.name}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{tag.name}</div>
              {tag.description && (
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{tag.description}</div>
              )}
              <div className="text-xs text-slate-400">
                {tag.operations.length} endpoint{tag.operations.length !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {spec.info.contact && (
        <div className="mt-8 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact</div>
          {spec.info.contact.name && (
            <div className="text-sm text-slate-600 dark:text-slate-400">{spec.info.contact.name}</div>
          )}
          {spec.info.contact.email && (
            <a href={`mailto:${spec.info.contact.email}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              {spec.info.contact.email}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className={`rounded-lg p-4 ${color.split(" ").slice(0, 2).join(" ")}`}>
      <div className={`text-2xl font-bold ${color.split(" ").slice(2).join(" ")}`}>{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}
