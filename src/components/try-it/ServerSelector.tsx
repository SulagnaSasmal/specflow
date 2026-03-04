"use client";

import type { OpenAPIServer } from "@/types/openapi";

interface ServerSelectorProps {
  servers: OpenAPIServer[];
  selectedServer: OpenAPIServer | null;
  onServerChange: (server: OpenAPIServer) => void;
}

export function ServerSelector({
  servers,
  selectedServer,
  onServerChange,
}: ServerSelectorProps) {
  if (!servers || servers.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Environment:
      </label>
      <select
        value={selectedServer?.url || servers[0].url}
        onChange={(e) => {
          const server = servers.find((s) => s.url === e.target.value);
          if (server) onServerChange(server);
        }}
        className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {servers.map((server) => (
          <option key={server.url} value={server.url}>
            {server.description || server.url}
          </option>
        ))}
      </select>
    </div>
  );
}
