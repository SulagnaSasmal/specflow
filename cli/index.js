#!/usr/bin/env node
/**
 * specflow CLI
 *
 * Commands:
 *   specflow serve <spec>              Start the dev portal with your spec pre-loaded
 *   specflow build <spec> [--out dir]  Build a static export
 *   specflow score <spec>              Print spec quality score to the terminal
 */

"use strict";

const path = require("path");
const fs = require("fs");
const { execSync, spawn } = require("child_process");

// ─── Colour helpers ────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};
const paint = (col, txt) => `${col}${txt}${c.reset}`;

// ─── Parse argv ────────────────────────────────────────────────────────────────
const [, , command, ...rest] = process.argv;

function usage() {
  console.log(`
${paint(c.bold, "SpecFlow CLI")} — OpenAPI → Developer Portal

${paint(c.cyan, "Usage:")}
  specflow serve <spec-file>               Start dev server with spec pre-loaded
  specflow build <spec-file> [--out <dir>] Build static export (default: ./out)
  specflow score <spec-file>               Print spec quality score

${paint(c.cyan, "Examples:")}
  specflow serve openapi.yaml
  specflow build openapi.yaml --out ./docs
  specflow score openapi.yaml
`);
  process.exit(0);
}

if (!command || command === "--help" || command === "-h") usage();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve spec file path, exit if not found */
function resolveSpec(specArg) {
  if (!specArg) {
    console.error(paint(c.red, "Error: missing spec file argument"));
    process.exit(1);
  }
  const abs = path.resolve(process.cwd(), specArg);
  if (!fs.existsSync(abs)) {
    console.error(paint(c.red, `Error: spec file not found: ${abs}`));
    process.exit(1);
  }
  return abs;
}

/** Copy the spec into specflow's public/examples so the app can serve it */
function copySpecToPublic(specPath, pkgRoot) {
  const dest = path.join(pkgRoot, "public", "examples", "_cli_input.yaml");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(specPath, dest);
  return "_cli_input.yaml"; // relative name the app will fetch
}

/** Find the specflow package root (the directory that contains this CLI) */
function findPkgRoot() {
  return path.resolve(__dirname, "..");
}

// ─── score command ─────────────────────────────────────────────────────────────

function cmdScore(args) {
  const specPath = resolveSpec(args[0]);
  const specText = fs.readFileSync(specPath, "utf8");

  // Try to parse with js-yaml (bundled with specflow)
  let spec;
  try {
    const yaml = requireLocal("js-yaml");
    spec = yaml.load(specText);
  } catch {
    try {
      spec = JSON.parse(specText);
    } catch {
      console.error(paint(c.red, "Error: could not parse spec as YAML or JSON"));
      process.exit(1);
    }
  }

  const report = scoreSpec(spec);
  printScoreReport(report, specPath);
}

/** Require a module from the specflow package root */
function requireLocal(mod) {
  const pkgRoot = findPkgRoot();
  const modPath = path.join(pkgRoot, "node_modules", mod);
  return require(modPath);
}

// ─── Inline quality scorer (mirrors src/lib/quality-score.ts logic) ───────────

function scoreSpec(spec) {
  const categories = [];
  let totalScore = 0;
  let maxScore = 0;

  // 1. Info (15 pts)
  const infoIssues = [];
  let infoScore = 0;
  const info = spec.info || {};
  if (info.description && info.description.length >= 20) infoScore += 5; else infoIssues.push("info.description is missing or too short");
  if (info.contact?.email || info.contact?.url) infoScore += 3; else infoIssues.push("info.contact email/url missing");
  if (info.license?.name) infoScore += 3; else infoIssues.push("info.license missing");
  if (spec.servers && spec.servers.length > 0 && spec.servers[0].url !== "/") infoScore += 4; else infoIssues.push("No concrete server URL defined");
  categories.push({ name: "Info", score: infoScore, maxScore: 15, issues: infoIssues });
  totalScore += infoScore; maxScore += 15;

  // 2. Operations (30 pts)
  const ops = collectOperations(spec);
  const opIssues = [];
  let opScore = 0;
  if (ops.length === 0) {
    opIssues.push("No operations found");
  } else {
    const withSummary = ops.filter(o => o.summary && o.summary.trim().length >= 5);
    const withDesc = ops.filter(o => o.description && o.description.trim().length >= 15);
    const withId = ops.filter(o => o.operationId);
    const sumPct = withSummary.length / ops.length;
    const descPct = withDesc.length / ops.length;
    const idPct = withId.length / ops.length;
    opScore += Math.round(sumPct * 12);
    opScore += Math.round(descPct * 12);
    opScore += Math.round(idPct * 6);
    if (sumPct < 1) opIssues.push(`${ops.length - withSummary.length} operations missing summary`);
    if (descPct < 1) opIssues.push(`${ops.length - withDesc.length} operations missing description`);
    if (idPct < 1) opIssues.push(`${ops.length - withId.length} operations missing operationId`);
  }
  categories.push({ name: "Operations", score: opScore, maxScore: 30, issues: opIssues });
  totalScore += opScore; maxScore += 30;

  // 3. Parameters (20 pts)
  const paramIssues = [];
  let paramScore = 0;
  const allParams = ops.flatMap(o => o.parameters || []);
  if (allParams.length > 0) {
    const withDesc = allParams.filter(p => p.description && p.description.trim().length >= 5);
    const withSchema = allParams.filter(p => p.schema || p.content);
    const dPct = withDesc.length / allParams.length;
    const sPct = withSchema.length / allParams.length;
    paramScore += Math.round(dPct * 10);
    paramScore += Math.round(sPct * 10);
    if (dPct < 1) paramIssues.push(`${allParams.length - withDesc.length} parameters missing description`);
    if (sPct < 1) paramIssues.push(`${allParams.length - withSchema.length} parameters missing schema`);
  } else {
    paramScore = 20;
  }
  categories.push({ name: "Parameters", score: paramScore, maxScore: 20, issues: paramIssues });
  totalScore += paramScore; maxScore += 20;

  // 4. Responses (20 pts)
  const respIssues = [];
  let respScore = 0;
  const allResponses = ops.flatMap(o => Object.entries(o.responses || {}).map(([code, r]) => ({ code, ...r })));
  if (allResponses.length > 0) {
    const withDesc = allResponses.filter(r => r.description && r.description.trim().length >= 5);
    const withSchema = allResponses.filter(r => r.content && Object.keys(r.content).length > 0);
    const has4xx = ops.some(o => Object.keys(o.responses || {}).some(c => c.startsWith("4")));
    const dPct = withDesc.length / allResponses.length;
    const sPct = withSchema.length / allResponses.length;
    respScore += Math.round(dPct * 8);
    respScore += Math.round(sPct * 8);
    if (has4xx) respScore += 4; else respIssues.push("No 4xx error responses defined");
    if (dPct < 1) respIssues.push(`${allResponses.length - withDesc.length} responses missing description`);
    if (sPct < 1) respIssues.push(`${allResponses.length - withSchema.length} responses missing schema`);
  } else {
    respIssues.push("No responses found");
  }
  categories.push({ name: "Responses", score: respScore, maxScore: 20, issues: respIssues });
  totalScore += respScore; maxScore += 20;

  // 5. Examples (15 pts)
  const exIssues = [];
  let exScore = 0;
  const opsWithReqBody = ops.filter(o => o.requestBody);
  const opsWithExample = ops.filter(o => {
    const rb = o.requestBody;
    if (!rb) return false;
    return Object.values(rb.content || {}).some(mt => mt.example || mt.examples);
  });
  const respWithExample = allResponses.filter(r =>
    Object.values(r.content || {}).some(mt => mt.example || mt.examples)
  );
  if (opsWithReqBody.length > 0) {
    const pct = opsWithExample.length / opsWithReqBody.length;
    exScore += Math.round(pct * 8);
    if (pct < 1) exIssues.push(`${opsWithReqBody.length - opsWithExample.length} request bodies missing examples`);
  } else {
    exScore += 8;
  }
  if (allResponses.length > 0) {
    const pct = respWithExample.length / allResponses.length;
    exScore += Math.round(pct * 7);
    if (pct < 1) exIssues.push(`${allResponses.length - respWithExample.length} responses missing examples`);
  } else {
    exScore += 7;
  }
  categories.push({ name: "Examples", score: exScore, maxScore: 15, issues: exIssues });
  totalScore += exScore; maxScore += 15;

  const percentage = Math.round((totalScore / maxScore) * 100);
  const grade = percentage >= 90 ? "A" : percentage >= 75 ? "B" : percentage >= 60 ? "C" : percentage >= 45 ? "D" : "F";

  return { totalScore, maxScore, percentage, grade, categories };
}

function collectOperations(spec) {
  const ops = [];
  const paths = spec.paths || {};
  const methods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  for (const [, pathItem] of Object.entries(paths)) {
    for (const method of methods) {
      if (pathItem[method]) ops.push(pathItem[method]);
    }
  }
  return ops;
}

function printScoreReport(report, specPath) {
  const gradeColor = report.percentage >= 75 ? c.green : report.percentage >= 45 ? c.yellow : c.red;

  console.log();
  console.log(paint(c.bold, `  SpecFlow Quality Score — ${path.basename(specPath)}`));
  console.log(paint(c.dim, "  " + "─".repeat(50)));
  console.log();
  console.log(`  Score: ${paint(c.bold + gradeColor, `${report.percentage}/100`)}  Grade: ${paint(c.bold + gradeColor, report.grade)}`);
  console.log();

  for (const cat of report.categories) {
    const pct = Math.round((cat.score / cat.maxScore) * 100);
    const barLen = 20;
    const filled = Math.round((pct / 100) * barLen);
    const bar = "█".repeat(filled) + "░".repeat(barLen - filled);
    const catColor = pct >= 75 ? c.green : pct >= 45 ? c.yellow : c.red;
    console.log(`  ${paint(c.bold, cat.name.padEnd(12))}  ${paint(catColor, bar)}  ${cat.score}/${cat.maxScore}`);
    for (const issue of cat.issues) {
      console.log(`  ${paint(c.dim, "  ⚠")} ${paint(c.dim, issue)}`);
    }
  }

  console.log();
  if (report.percentage >= 75) {
    console.log(paint(c.green, "  ✓ Good quality spec!"));
  } else if (report.percentage >= 45) {
    console.log(paint(c.yellow, "  ⚠ Room for improvement — run 'specflow enrich' to auto-fix gaps with AI"));
  } else {
    console.log(paint(c.red, "  ✗ Low quality spec — many descriptions and examples are missing"));
  }
  console.log();
}

// ─── serve command ─────────────────────────────────────────────────────────────

function cmdServe(args) {
  const specPath = resolveSpec(args[0]);
  const pkgRoot = findPkgRoot();
  const exampleName = copySpecToPublic(specPath, pkgRoot);

  // Write a small env override so the app knows to pre-load this spec
  const envPath = path.join(pkgRoot, ".env.local");
  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const newEnv = existing
    .split("\n")
    .filter(l => !l.startsWith("NEXT_PUBLIC_CLI_SPEC="))
    .concat(`NEXT_PUBLIC_CLI_SPEC=/examples/${exampleName}`)
    .join("\n");
  fs.writeFileSync(envPath, newEnv);

  console.log(paint(c.cyan, `\n  SpecFlow — starting dev server with ${path.basename(specPath)}\n`));

  const next = spawn("npx", ["next", "dev"], {
    cwd: pkgRoot,
    stdio: "inherit",
    shell: true,
  });
  next.on("close", (code) => process.exit(code || 0));
}

// ─── build command ─────────────────────────────────────────────────────────────

function cmdBuild(args) {
  const specPath = resolveSpec(args[0]);
  const outIdx = args.indexOf("--out");
  const outDir = outIdx !== -1 ? path.resolve(process.cwd(), args[outIdx + 1] || "out") : path.resolve(process.cwd(), "out");

  const pkgRoot = findPkgRoot();
  copySpecToPublic(specPath, pkgRoot);

  console.log(paint(c.cyan, `\n  SpecFlow — building static export to ${outDir}\n`));

  try {
    execSync("npx next build", { cwd: pkgRoot, stdio: "inherit", shell: true });
    // Copy the Next.js out directory to the requested destination
    const nextOut = path.join(pkgRoot, "out");
    if (fs.existsSync(nextOut)) {
      fs.cpSync(nextOut, outDir, { recursive: true });
      console.log(paint(c.green, `\n  ✓ Portal exported to ${outDir}\n`));
    }
  } catch (err) {
    console.error(paint(c.red, "\n  Build failed. Make sure you have run 'npm install' in the specflow directory.\n"));
    process.exit(1);
  }
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

switch (command) {
  case "score":  cmdScore(rest); break;
  case "serve":  cmdServe(rest); break;
  case "build":  cmdBuild(rest); break;
  default:
    console.error(paint(c.red, `Unknown command: ${command}`));
    usage();
}
