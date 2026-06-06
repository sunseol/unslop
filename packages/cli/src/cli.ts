import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { loadAuditInput } from "./adapters/code.js";
import { CONFIG_CANDIDATES, loadConfig } from "./core/config.js";
import {
  evaluateQualityGate,
  SCHEMA_VERSION,
  type QualityGate
} from "./core/decision.js";
import { runAudit } from "./core/rule-engine.js";
import { formatPlan, formatTextReport, writeHtmlReport } from "./core/report.js";
import type { AuditResult, CliOptions, Finding, FixKind } from "./core/types.js";
import { defaultRules } from "./rules/index.js";

const DEFAULT_CONFIG_PATH = "unslop.design.yml";

export async function run(argv: string[]): Promise<number> {
  const [scope, command, ...rest] = argv;

  if (!scope || scope === "--help" || scope === "-h") {
    printHelp();
    return 0;
  }

  if (scope !== "design") {
    throw new Error(`Unknown command scope: ${scope}`);
  }

  if (!command || command === "--help" || command === "-h") {
    printDesignHelp();
    return 0;
  }

  const parsed = parseArgs(rest);

  switch (command) {
    case "init":
      return runInit(parsed.positionals, parsed.options);
    case "check":
      return runCheck(parsed.positionals, parsed.options);
    case "plan":
      return runPlan(parsed.positionals, parsed.options);
    case "fix":
      return runFix(parsed.positionals, parsed.options);
    case "report":
      return runReport(parsed.positionals, parsed.options);
    case "agent-check":
      return runAgentCheck(parsed.positionals, parsed.options);
    default:
      throw new Error(`Unknown design command: ${command}`);
  }
}

async function runInit(targets: string[], options: CliOptions): Promise<number> {
  if (targets.length > 0) {
    throw new Error("design init does not accept file targets.");
  }

  const existing = CONFIG_CANDIDATES.find((path) => existsSync(path));
  const overwritesDefaultConfig = existsSync(DEFAULT_CONFIG_PATH);
  if (existing && !options.force) {
    throw new Error(
      `${existing} already exists. Re-run with --force to overwrite ${DEFAULT_CONFIG_PATH}.`
    );
  }

  writeFileSync(DEFAULT_CONFIG_PATH, defaultConfigTemplate(), "utf8");

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          path: DEFAULT_CONFIG_PATH,
          overwritten: overwritesDefaultConfig,
          ...(existing && existing !== DEFAULT_CONFIG_PATH ? { existing_config: existing } : {})
        },
        null,
        2
      )
    );
  } else {
    console.log(`Wrote ${DEFAULT_CONFIG_PATH}`);
  }

  return 0;
}

async function runCheck(targets: string[], options: CliOptions): Promise<number> {
  const result = await audit(targets, options);
  const gate = gateForOptions(result, options);
  if (options.json) {
    const mode = options.agent ? "agent" : "check";
    console.log(JSON.stringify(toJsonResult(result, gate, mode), null, 2));
  } else {
    console.log(formatTextReport(result, gate));
  }

  if (options.agent && gate.decision !== "pass") {
    return 1;
  }

  if (
    (options.ci ||
      options.threshold !== undefined ||
      options.accessibilityThreshold !== undefined) &&
    gate.failures.length > 0
  ) {
    return 1;
  }
  return 0;
}

async function runPlan(targets: string[], options: CliOptions): Promise<number> {
  const result = await audit(targets, options);
  console.log(formatPlan(result, options.product));
  return 0;
}

async function runFix(targets: string[], options: CliOptions): Promise<number> {
  const result = await audit(targets, options);
  const safeFindings = result.findings.filter((finding) => finding.fixKind === "safe");
  const suggestedFindings = result.findings.filter((finding) => finding.fixKind === "suggested");
  const selected = options.suggest ? suggestedFindings : safeFindings;

  if (options.write) {
    console.error(
      "Automatic writes are not implemented in this scaffold. Re-run without --write to review fix candidates."
    );
    return 1;
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          target: result.input.target,
          mode: options.suggest ? "suggest" : "safe",
          writes_applied: false,
          fixes: selected.map((finding) => ({
            type: finding.id,
            severity: finding.severity,
            suggestion: finding.suggestion,
            evidence: finding.evidence,
            source: finding.source
          }))
        },
        null,
        2
      )
    );
    return 0;
  }

  console.log(options.suggest ? "UNSLOP SUGGESTED FIXES" : "UNSLOP SAFE FIX CANDIDATES");
  console.log("");
  console.log(`Target: ${result.input.target}`);
  console.log("");

  if (selected.length === 0) {
    console.log("No fix candidates in this bucket.");
    return 0;
  }

  for (const finding of selected) {
    const location = finding.source ? ` (${finding.source.path}:${finding.source.line})` : "";
    console.log(`- ${finding.suggestion}${location}`);
  }

  return 0;
}

async function runReport(targets: string[], options: CliOptions): Promise<number> {
  const result = await audit(targets, options);
  const output = options.output ?? "unslop-report.html";
  writeHtmlReport(result, output);
  console.log(`Wrote ${output}`);
  return 0;
}

async function runAgentCheck(targets: string[], options: CliOptions): Promise<number> {
  const result = await audit(targets, { ...options, stdin: options.stdin || targets.length === 0 });
  const gate = gateForOptions(result, options);

  console.log(JSON.stringify(toJsonResult(result, gate, "agent"), null, 2));
  return gate.decision === "pass" ? 0 : 1;
}

async function audit(targets: string[], options: CliOptions): Promise<AuditResult> {
  if (options.figma) {
    throw new Error("Figma adapter is planned for v0.4 and is not implemented in this scaffold.");
  }
  const config = loadConfig(options.config);
  const stdinContent = options.stdin ? await readStdin() : undefined;
  const input = await loadAuditInput({
    targets,
    url: options.url,
    stdinContent
  });
  return runAudit(input, config, defaultRules);
}

function parseArgs(args: string[]): { positionals: string[]; options: CliOptions } {
  const positionals: string[] = [];
  const options: CliOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg) {
      continue;
    }
    if (!arg.startsWith("-")) {
      positionals.push(arg);
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--ci") {
      options.ci = true;
      continue;
    }
    if (arg === "--stdin") {
      options.stdin = true;
      continue;
    }
    if (arg === "--safe") {
      options.safe = true;
      continue;
    }
    if (arg === "--suggest") {
      options.suggest = true;
      continue;
    }
    if (arg === "--write") {
      options.write = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--agent") {
      options.agent = true;
      continue;
    }
    if (arg === "--fail-on-high") {
      options.failOnHigh = true;
      continue;
    }
    if (arg === "--tailwind") {
      options.tailwind = true;
      continue;
    }
    if (arg === "-o" || arg === "--output") {
      options.output = requireValue(args, (index += 1), arg);
      continue;
    }
    if (arg === "--url") {
      options.url = requireValue(args, (index += 1), arg);
      continue;
    }
    if (arg === "--figma") {
      options.figma = requireValue(args, (index += 1), arg);
      continue;
    }
    if (arg === "--config") {
      options.config = requireValue(args, (index += 1), arg);
      continue;
    }
    if (arg === "--product") {
      options.product = requireValue(args, (index += 1), arg);
      continue;
    }
    if (arg === "--threshold") {
      options.threshold = parseNumberOption(requireValue(args, (index += 1), arg), arg);
      continue;
    }
    if (arg === "--accessibility-threshold") {
      options.accessibilityThreshold = parseNumberOption(
        requireValue(args, (index += 1), arg),
        arg
      );
      continue;
    }

    if (arg.startsWith("--url=")) {
      options.url = arg.slice("--url=".length);
      continue;
    }
    if (arg.startsWith("--figma=")) {
      options.figma = arg.slice("--figma=".length);
      continue;
    }
    if (arg.startsWith("--config=")) {
      options.config = arg.slice("--config=".length);
      continue;
    }
    if (arg.startsWith("--product=")) {
      options.product = arg.slice("--product=".length);
      continue;
    }
    if (arg.startsWith("--threshold=")) {
      options.threshold = parseNumberOption(arg.slice("--threshold=".length), "--threshold");
      continue;
    }
    if (arg.startsWith("--accessibility-threshold=")) {
      options.accessibilityThreshold = parseNumberOption(
        arg.slice("--accessibility-threshold=".length),
        "--accessibility-threshold"
      );
      continue;
    }
    if (arg.startsWith("--output=")) {
      options.output = arg.slice("--output=".length);
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return { positionals, options };
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function parseNumberOption(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${flag} must be a number.`);
  }
  return parsed;
}

function gateForOptions(result: AuditResult, options: CliOptions): QualityGate {
  return evaluateQualityGate(result, {
    designSignalThreshold: options.threshold,
    accessibilityThreshold: options.accessibilityThreshold,
    failOnHigh: options.failOnHigh
  });
}

function toJsonResult(
  result: AuditResult,
  gate: QualityGate,
  mode: "check" | "agent"
): unknown {
  return {
    schema_version: SCHEMA_VERSION,
    mode,
    target: {
      kind: result.input.kind,
      value: result.input.target,
      metadata: result.input.metadata
    },
    decision: gate.decision,
    scores: {
      design_signal: result.scores.designSignal,
      ai_slop_risk: result.scores.aiSlopRisk,
      product_readiness: result.scores.productReadiness,
      axes: result.scores.axes,
      thresholds: gate.thresholds
    },
    findings: result.findings.map(toJsonFinding),
    safe_fixes: fixesFor(result.findings, "safe"),
    suggested_fixes: fixesFor(result.findings, "suggested"),
    human_review_required: fixesFor(result.findings, "human_review"),
    next_action: nextAction(gate)
  };
}

function toJsonFinding(finding: Finding): unknown {
  return {
    id: finding.id,
    rule_id: finding.id,
    category: finding.axis,
    severity: finding.severity,
    confidence: confidenceForSeverity(finding.severity),
    message: finding.title,
    reason: finding.message,
    evidence: finding.evidence,
    source: finding.source,
    suggested_fix: finding.suggestion,
    fix_bucket: finding.fixKind
  };
}

function fixesFor(findings: Finding[], fixKind: FixKind): unknown[] {
  return findings
    .filter((finding) => finding.fixKind === fixKind)
    .map((finding) => ({
      finding_id: finding.id,
      severity: finding.severity,
      suggestion: finding.suggestion,
      evidence: finding.evidence,
      source: finding.source
    }));
}

function nextAction(gate: QualityGate): "pass" | "revise" | "human_review" {
  if (gate.decision === "pass") {
    return "pass";
  }
  if (gate.decision === "block") {
    return "human_review";
  }
  return "revise";
}

function confidenceForSeverity(severity: Finding["severity"]): number {
  if (severity === "blocking") {
    return 0.95;
  }
  if (severity === "high") {
    return 0.9;
  }
  if (severity === "medium") {
    return 0.82;
  }
  return 0.7;
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    return "";
  }

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function printHelp(): void {
  console.log(`unslop

Usage:
  unslop design <command> [target] [options]

Commands:
  design init         Create unslop.design.yml
  design check        Audit a file, directory, URL, or stdin
  design plan         Print a design fix plan
  design fix          Print safe or suggested fix candidates
  design report       Write an HTML report
  design agent-check  Return a JSON pass/fail decision for agents
`);
}

function printDesignHelp(): void {
  console.log(`unslop design

Usage:
  unslop design init [--force]
  unslop design check <file-or-dir> [--json --agent]
  unslop design check --url http://localhost:3000 [--threshold 75 --ci --fail-on-high]
  unslop design plan <file-or-dir> [--product "TOPIK learning app"]
  unslop design fix <file-or-dir> [--safe | --suggest]
  unslop design report <file-or-dir> [-o unslop-report.html]
  unslop design agent-check --stdin --json
`);
}

function defaultConfigTemplate(): string {
  return `product:
  name: "Your product"
  type: "web app"
  primary_user: "Your primary user"
  primary_tasks:
    - "complete the main workflow"

brand:
  avoid_visuals:
    - "neon glow"
    - "purple cyan gradient"
  avoid_copy:
    - "Unlock your potential"
    - "AI-powered insights"

tokens:
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64]
  radius:
    sm: 6
    md: 10
    lg: 16

thresholds:
  design_signal: 75
  accessibility: 85

ignore: []
`;
}

export function readFixture(path: string): string {
  return readFileSync(path, "utf8");
}
