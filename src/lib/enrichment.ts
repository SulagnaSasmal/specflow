import type { ParsedSpec, ParsedOperation, ParsedTag } from "@/types/openapi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnrichmentTarget {
  type: "operation_summary" | "operation_description" | "tag_description";
  operationId?: string;
  method?: string;
  path?: string;
  tagName?: string;
  /** Existing value — empty or very short */
  currentValue: string;
}

export interface EnrichmentResult {
  type: EnrichmentTarget["type"];
  operationId?: string;
  method?: string;
  path?: string;
  tagName?: string;
  enrichedValue: string;
}

export interface EnrichmentStats {
  targets: number;
  enriched: number;
  failed: number;
}

// ─── Identify gaps ────────────────────────────────────────────────────────────

const MIN_DESCRIPTION_LENGTH = 15;

function isMissing(text?: string): boolean {
  return !text || text.trim().length < MIN_DESCRIPTION_LENGTH;
}

/**
 * Scans a parsed spec and returns all fields that need AI enrichment.
 */
export function identifyEnrichmentTargets(spec: ParsedSpec): EnrichmentTarget[] {
  const targets: EnrichmentTarget[] = [];

  // Tag descriptions
  for (const tag of spec.tags) {
    if (isMissing(tag.description)) {
      targets.push({
        type: "tag_description",
        tagName: tag.name,
        currentValue: tag.description || "",
      });
    }
  }

  // Operation summaries + descriptions
  for (const op of spec.operations) {
    if (isMissing(op.summary)) {
      targets.push({
        type: "operation_summary",
        operationId: op.operationId,
        method: op.method,
        path: op.path,
        currentValue: op.summary || "",
      });
    }
    if (isMissing(op.description)) {
      targets.push({
        type: "operation_description",
        operationId: op.operationId,
        method: op.method,
        path: op.path,
        currentValue: op.description || "",
      });
    }
  }

  return targets;
}

/**
 * Apply enrichment results back onto a cloned spec, returning the enriched copy.
 */
export function applyEnrichments(
  spec: ParsedSpec,
  results: EnrichmentResult[]
): ParsedSpec {
  // Deep-clone through JSON (safe for our plain-object spec)
  const enriched: ParsedSpec = JSON.parse(JSON.stringify(spec));

  for (const r of results) {
    if (r.type === "tag_description" && r.tagName) {
      const tag = enriched.tags.find((t: ParsedTag) => t.name === r.tagName);
      if (tag) tag.description = r.enrichedValue;
    }

    if (
      (r.type === "operation_summary" || r.type === "operation_description") &&
      r.method &&
      r.path
    ) {
      const op = enriched.operations.find(
        (o: ParsedOperation) => o.method === r.method && o.path === r.path
      );
      if (op) {
        if (r.type === "operation_summary") op.summary = r.enrichedValue;
        else op.description = r.enrichedValue;
      }

      // Also patch inside tags
      for (const tag of enriched.tags) {
        const tagOp = tag.operations.find(
          (o: ParsedOperation) => o.method === r.method && o.path === r.path
        );
        if (tagOp) {
          if (r.type === "operation_summary") tagOp.summary = r.enrichedValue;
          else tagOp.description = r.enrichedValue;
        }
      }
    }
  }

  return enriched;
}
