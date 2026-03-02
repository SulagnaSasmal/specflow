import Fuse from "fuse.js";
import type { ParsedSpec, SearchIndexItem } from "@/types/openapi";

export function buildSearchIndex(spec: ParsedSpec): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];

  // Index all operations
  for (const op of spec.operations) {
    const id = op.operationId || `${op.method}-${op.path}`;
    items.push({
      id,
      type: "endpoint",
      title: op.summary || `${op.method.toUpperCase()} ${op.path}`,
      description: op.description || op.summary,
      method: op.method,
      path: op.path,
      tag: op.tags?.[0],
      operationId: op.operationId,
    });
  }

  // Index tags
  for (const tag of spec.tags) {
    items.push({
      id: `tag-${tag.name}`,
      type: "tag",
      title: tag.name,
      description: tag.description,
      tag: tag.name,
    });
  }

  // Index schemas
  if (spec.components.schemas) {
    for (const [name, schema] of Object.entries(spec.components.schemas)) {
      items.push({
        id: `schema-${name}`,
        type: "schema",
        title: name,
        description: schema.description || schema.title,
      });
    }
  }

  return items;
}

export function createFuseInstance(items: SearchIndexItem[]) {
  return new Fuse(items, {
    keys: [
      { name: "title", weight: 2 },
      { name: "path", weight: 1.5 },
      { name: "operationId", weight: 1.5 },
      { name: "description", weight: 1 },
      { name: "tag", weight: 0.8 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

export function search(fuse: Fuse<SearchIndexItem>, query: string): SearchIndexItem[] {
  if (!query.trim()) return [];
  return fuse.search(query).map((r) => r.item);
}
