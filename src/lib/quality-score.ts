import type { ParsedSpec, ParsedOperation } from "@/types/openapi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QualityIssue {
  severity: "error" | "warning" | "info";
  message: string;
  path?: string;
}

export interface QualityCategory {
  name: string;
  description: string;
  score: number;
  maxScore: number;
  percentage: number;
  issues: QualityIssue[];
}

export type QualityGrade = "A" | "B" | "C" | "D" | "F";

export interface QualityReport {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: QualityGrade;
  gradeColor: string;
  categories: QualityCategory[];
  /** Top-priority actionable items across all categories */
  topIssues: QualityIssue[];
  /** Counts for quick summary */
  counts: {
    operations: number;
    describedOperations: number;
    parameters: number;
    describedParameters: number;
    responses: number;
    describedResponses: number;
  };
}

// ─── Scoring weights ─────────────────────────────────────────────────────────

const WEIGHTS = {
  info: 15,
  operations: 30,
  parameters: 20,
  responses: 20,
  examples: 15,
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasMeaningfulDescription(text?: string): boolean {
  if (!text) return false;
  const t = text.trim();
  return t.length >= 10;
}

function pct(score: number, max: number): number {
  if (max === 0) return 100;
  return Math.round((score / max) * 100);
}

function grade(percentage: number): QualityGrade {
  if (percentage >= 90) return "A";
  if (percentage >= 75) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 45) return "D";
  return "F";
}

function gradeColor(g: QualityGrade): string {
  switch (g) {
    case "A": return "text-emerald-600 dark:text-emerald-400";
    case "B": return "text-green-600 dark:text-green-400";
    case "C": return "text-yellow-600 dark:text-yellow-400";
    case "D": return "text-orange-600 dark:text-orange-400";
    case "F": return "text-red-600 dark:text-red-400";
  }
}

function ringColor(percentage: number): string {
  if (percentage >= 90) return "#10b981"; // emerald
  if (percentage >= 75) return "#22c55e"; // green
  if (percentage >= 60) return "#eab308"; // yellow
  if (percentage >= 45) return "#f97316"; // orange
  return "#ef4444"; // red
}

export { ringColor };

// ─── Category scorers ────────────────────────────────────────────────────────

function scoreInfo(spec: ParsedSpec): QualityCategory {
  const issues: QualityIssue[] = [];
  let score = WEIGHTS.info;

  if (!hasMeaningfulDescription(spec.info.description)) {
    issues.push({
      severity: "warning",
      message: "API info.description is missing or too short",
      path: "info.description",
    });
    score -= 5;
  }

  if (!spec.info.contact?.email && !spec.info.contact?.url) {
    issues.push({
      severity: "info",
      message: "No contact email or URL in info.contact",
      path: "info.contact",
    });
    score -= 3;
  }

  if (!spec.info.license?.name) {
    issues.push({
      severity: "info",
      message: "No license specified in info.license",
      path: "info.license",
    });
    score -= 2;
  }

  if (!spec.servers || spec.servers.length === 0) {
    issues.push({
      severity: "error",
      message: "No servers defined",
      path: "servers",
    });
    score -= 5;
  }

  return {
    name: "API Info",
    description: "Title, description, contact, license, and server coverage",
    score: Math.max(0, score),
    maxScore: WEIGHTS.info,
    percentage: pct(Math.max(0, score), WEIGHTS.info),
    issues,
  };
}

function scoreOperations(spec: ParsedSpec): {
  category: QualityCategory;
  counts: { operations: number; described: number };
} {
  const issues: QualityIssue[] = [];
  const ops = spec.operations;
  const total = ops.length;
  let described = 0;
  let operationIdCount = 0;
  const seenIds = new Set<string>();

  for (const op of ops) {
    const label = `${op.method.toUpperCase()} ${op.path}`;

    if (!hasMeaningfulDescription(op.summary)) {
      issues.push({
        severity: "warning",
        message: `Missing summary: ${label}`,
        path: `paths.${op.path}.${op.method}.summary`,
      });
    } else {
      described++;
    }

    if (!op.operationId) {
      issues.push({
        severity: "info",
        message: `Missing operationId: ${label}`,
        path: `paths.${op.path}.${op.method}.operationId`,
      });
    } else {
      operationIdCount++;
      if (seenIds.has(op.operationId)) {
        issues.push({
          severity: "error",
          message: `Duplicate operationId: "${op.operationId}"`,
          path: `paths.${op.path}.${op.method}.operationId`,
        });
      }
      seenIds.add(op.operationId);
    }

    if (op.deprecated) {
      const hasNote =
        hasMeaningfulDescription(op.description) &&
        op.description!.toLowerCase().includes("deprecat");
      if (!hasNote) {
        issues.push({
          severity: "info",
          message: `Deprecated endpoint lacks migration note: ${label}`,
          path: `paths.${op.path}.${op.method}.description`,
        });
      }
    }
  }

  const descriptionRate = total > 0 ? described / total : 1;
  const idRate = total > 0 ? operationIdCount / total : 1;
  const score = Math.round(
    WEIGHTS.operations * (descriptionRate * 0.6 + idRate * 0.4)
  );

  return {
    category: {
      name: "Operations",
      description: "Summary, description, and operationId coverage for all endpoints",
      score,
      maxScore: WEIGHTS.operations,
      percentage: pct(score, WEIGHTS.operations),
      issues,
    },
    counts: { operations: total, described },
  };
}

function scoreParameters(spec: ParsedSpec): {
  category: QualityCategory;
  counts: { parameters: number; described: number };
} {
  const issues: QualityIssue[] = [];
  let total = 0;
  let described = 0;

  for (const op of spec.operations) {
    const label = `${op.method.toUpperCase()} ${op.path}`;
    for (const param of op.parameters || []) {
      total++;
      if (hasMeaningfulDescription(param.description)) {
        described++;
      } else {
        issues.push({
          severity: "warning",
          message: `Parameter "${param.name}" (${param.in}) missing description: ${label}`,
          path: `paths.${op.path}.${op.method}.parameters[${param.name}].description`,
        });
      }

      if (!param.schema) {
        issues.push({
          severity: "warning",
          message: `Parameter "${param.name}" has no schema: ${label}`,
          path: `paths.${op.path}.${op.method}.parameters[${param.name}].schema`,
        });
      }
    }
  }

  const rate = total > 0 ? described / total : 1;
  const score = Math.round(WEIGHTS.parameters * rate);

  return {
    category: {
      name: "Parameters",
      description: "Description and schema coverage for all path, query, and header parameters",
      score,
      maxScore: WEIGHTS.parameters,
      percentage: pct(score, WEIGHTS.parameters),
      issues,
    },
    counts: { parameters: total, described },
  };
}

function scoreResponses(spec: ParsedSpec): {
  category: QualityCategory;
  counts: { responses: number; described: number };
} {
  const issues: QualityIssue[] = [];
  let total = 0;
  let described = 0;

  for (const op of spec.operations) {
    const label = `${op.method.toUpperCase()} ${op.path}`;
    let has4xx = false;
    let has5xx = false;

    for (const [code, resp] of Object.entries(op.responses || {})) {
      total++;
      if (hasMeaningfulDescription(resp.description)) {
        described++;
      } else {
        issues.push({
          severity: "warning",
          message: `Response ${code} missing description: ${label}`,
          path: `paths.${op.path}.${op.method}.responses.${code}.description`,
        });
      }

      if (code.startsWith("4")) has4xx = true;
      if (code.startsWith("5")) has5xx = true;
    }

    // Deduct for missing error responses
    if (!has4xx) {
      issues.push({
        severity: "info",
        message: `No 4xx error response defined: ${label}`,
        path: `paths.${op.path}.${op.method}.responses`,
      });
    }
    if (!has5xx) {
      issues.push({
        severity: "info",
        message: `No 5xx error response defined: ${label}`,
        path: `paths.${op.path}.${op.method}.responses`,
      });
    }
  }

  const rate = total > 0 ? described / total : 1;
  const score = Math.round(WEIGHTS.responses * rate);

  return {
    category: {
      name: "Responses",
      description: "Description, schema, and error coverage for all response codes",
      score,
      maxScore: WEIGHTS.responses,
      percentage: pct(score, WEIGHTS.responses),
      issues,
    },
    counts: { responses: total, described },
  };
}

function scoreExamples(spec: ParsedSpec): QualityCategory {
  const issues: QualityIssue[] = [];
  let opsWithExamples = 0;
  const ops = spec.operations;

  for (const op of ops) {
    const label = `${op.method.toUpperCase()} ${op.path}`;
    const hasExample =
      // Request body example
      Object.values(op.requestBody?.content || {}).some(
        (c) => c.example !== undefined || (c.examples && Object.keys(c.examples).length > 0)
      ) ||
      // Any response example
      Object.values(op.responses || {}).some(
        (r) =>
          r.content &&
          Object.values(r.content).some(
            (c) => c.example !== undefined || (c.examples && Object.keys(c.examples).length > 0)
          )
      ) ||
      // Parameter examples
      (op.parameters || []).some(
        (p) => p.example !== undefined || (p.examples && Object.keys(p.examples).length > 0)
      );

    if (hasExample) {
      opsWithExamples++;
    } else {
      issues.push({
        severity: "info",
        message: `No request or response examples: ${label}`,
        path: `paths.${op.path}.${op.method}`,
      });
    }
  }

  const rate = ops.length > 0 ? opsWithExamples / ops.length : 1;
  const score = Math.round(WEIGHTS.examples * rate);

  return {
    name: "Examples",
    description: "Request body, response, and parameter example coverage",
    score,
    maxScore: WEIGHTS.examples,
    percentage: pct(score, WEIGHTS.examples),
    issues,
  };
}

// ─── Main function ────────────────────────────────────────────────────────────

export function computeQualityScore(spec: ParsedSpec): QualityReport {
  const infoCategory = scoreInfo(spec);
  const { category: opsCategory, counts: opsCounts } = scoreOperations(spec);
  const { category: paramsCategory, counts: paramsCounts } = scoreParameters(spec);
  const { category: responsesCategory, counts: responsesCounts } = scoreResponses(spec);
  const examplesCategory = scoreExamples(spec);

  const categories = [
    infoCategory,
    opsCategory,
    paramsCategory,
    responsesCategory,
    examplesCategory,
  ];

  const maxScore = categories.reduce((s, c) => s + c.maxScore, 0);
  const totalScore = categories.reduce((s, c) => s + c.score, 0);
  const percentage = pct(totalScore, maxScore);
  const g = grade(percentage);

  // Top issues: sort by severity (error > warning > info), limit to 5
  const severityOrd = { error: 0, warning: 1, info: 2 };
  const allIssues = categories
    .flatMap((c) => c.issues)
    .sort((a, b) => severityOrd[a.severity] - severityOrd[b.severity])
    .slice(0, 5);

  return {
    totalScore,
    maxScore,
    percentage,
    grade: g,
    gradeColor: gradeColor(g),
    categories,
    topIssues: allIssues,
    counts: {
      operations: opsCounts.operations,
      describedOperations: opsCounts.described,
      parameters: paramsCounts.parameters,
      describedParameters: paramsCounts.described,
      responses: responsesCounts.responses,
      describedResponses: responsesCounts.described,
    },
  };
}

/** Returns a computed report or null if spec has no operations (empty spec). */
export function safeComputeQuality(spec: ParsedSpec): QualityReport | null {
  if (!spec || spec.operations.length === 0) return null;
  return computeQualityScore(spec);
}
