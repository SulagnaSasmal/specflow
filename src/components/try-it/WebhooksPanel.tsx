"use client";

import { useMemo } from "react";
import type { ParsedSpec } from "@/types/openapi";
import { SchemaTree } from "@/components/schema/SchemaTree";

interface WebhooksPanelProps {
  spec: ParsedSpec | null;
}

export function WebhooksPanel({ spec }: WebhooksPanelProps) {
  const webhooks = useMemo(() => {
    if (!spec || !spec.rawSpec) return [];
    const raw = spec.rawSpec as any;
    return Object.entries(raw.webhooks || {}).map(([name, webhook]) => ({
      name,
      webhook: webhook as any,
    }));
  }, [spec]);

  if (webhooks.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Webhooks
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Event notifications your application can receive from the API.
      </p>

      <div className="space-y-6">
        {webhooks.map(({ name, webhook }) => (
          <div
            key={name}
            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {name}
            </h3>

            {webhook.post?.summary && (
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                {webhook.post.summary}
              </p>
            )}

            {webhook.post?.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 whitespace-pre-wrap">
                {webhook.post.description}
              </p>
            )}

            {webhook.post?.requestBody?.content?.["application/json"]?.schema && (
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Payload Schema
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded p-3">
                  <SchemaTree
                    schema={
                      webhook.post.requestBody.content["application/json"].schema
                    }
                    name="Webhook Payload"
                  />
                </div>
              </div>
            )}

            {webhook.post?.requestBody?.content?.["application/json"]?.example && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Example Payload
                </h4>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-auto font-mono">
                  {JSON.stringify(
                    webhook.post.requestBody.content["application/json"].example,
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
