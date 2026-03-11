"use client";

import { useState, useMemo } from "react";
import type { QualityReport, QualityCategory, QualityIssue } from "@/lib/quality-score";
import { ringColor } from "@/lib/quality-score";

interface QualityScorePanelProps {
  report: QualityReport;
}

// ─── SVG ring gauge ───────────────────────────────────────────────────────────

function RingGauge({ percentage, grade, gradeColor }: { percentage: number; grade: string; gradeColor: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = ringColor(percentage);

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        {/* Track */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${gradeColor}`}>{grade}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{percentage}%</span>
      </div>
    </div>
  );
}

// ─── Issue row ────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<QualityIssue["severity"], string> = {
  error:   "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  info:    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
};

const SEVERITY_DOT: Record<QualityIssue["severity"], string> = {
  error:   "bg-red-500",
  warning: "bg-yellow-500",
  info:    "bg-blue-400",
};

function IssueRow({ issue }: { issue: QualityIssue }) {
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded text-xs border ${SEVERITY_STYLES[issue.severity]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${SEVERITY_DOT[issue.severity]}`} />
      <span className="leading-relaxed">{issue.message}</span>
    </div>
  );
}

// ─── Category bar ─────────────────────────────────────────────────────────────

function CategoryBar({ category, open, onToggle }: {
  category: QualityCategory;
  open: boolean;
  onToggle: () => void;
}) {
  const barColor = ringColor(category.percentage);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        onClick={onToggle}
      >
        {/* Score fraction */}
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0 w-12 text-right">
          {category.score}/{category.maxScore}
        </span>
        {/* Bar */}
        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${category.percentage}%`, background: barColor }}
          />
        </div>
        {/* Name */}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 shrink-0">
          {category.name}
        </span>
        {/* Chevron */}
        {category.issues.length > 0 && (
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && category.issues.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-slate-100 dark:border-slate-700 pt-3">
          {category.issues.slice(0, 8).map((issue, i) => (
            <IssueRow key={i} issue={issue} />
          ))}
          {category.issues.length > 8 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 pl-2">
              +{category.issues.length - 8} more issues
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function QualityScorePanel({ report }: QualityScorePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const errorCount = useMemo(
    () => report.categories.flatMap((c) => c.issues).filter((i) => i.severity === "error").length,
    [report]
  );
  const warningCount = useMemo(
    () => report.categories.flatMap((c) => c.issues).filter((i) => i.severity === "warning").length,
    [report]
  );

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-8">
      {/* Header row */}
      <button
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <RingGauge
          percentage={report.percentage}
          grade={report.grade}
          gradeColor={report.gradeColor}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Spec Quality Score
            </span>
            <span className={`text-sm font-bold ${report.gradeColor}`}>
              {report.totalScore}/{report.maxScore}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {report.percentage >= 90
              ? "Excellent spec — well-documented and ready for publishing."
              : report.percentage >= 75
              ? "Good spec with minor documentation gaps."
              : report.percentage >= 60
              ? "Acceptable spec — several documentation improvements needed."
              : "Significant documentation gaps — consider AI enrichment."}
          </p>
          <div className="flex items-center gap-3 text-xs">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {errorCount} error{errorCount !== 1 ? "s" : ""}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                {warningCount} warning{warningCount !== 1 ? "s" : ""}
              </span>
            )}
            {errorCount === 0 && warningCount === 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">✓ No errors or warnings</span>
            )}
          </div>
        </div>

        <svg
          className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-5 py-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/20">
          {/* Coverage summary */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {report.counts.describedOperations}/{report.counts.operations}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Endpoints described</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {report.counts.describedParameters}/{report.counts.parameters}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Params described</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {report.counts.describedResponses}/{report.counts.responses}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Responses described</div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="space-y-2">
            {report.categories.map((cat) => (
              <CategoryBar
                key={cat.name}
                category={cat}
                open={openCategory === cat.name}
                onToggle={() =>
                  setOpenCategory((prev) => (prev === cat.name ? null : cat.name))
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
