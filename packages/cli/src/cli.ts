import { readFileSync } from "node:fs";
import { loadAuditInput } from "./adapters/code.js";
import { loadConfig } from "./core/config.js";
import { runAudit } from "./core/rule-engine.js";
import { formatPlan, formatTextReport, writeHtmlReport } from "./core/report.js";
import type { AuditResult, CliOptions } from "./core/types.js";
import { defaultRules } from "./rules/index.js";

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

async function runCheck(targets: string[], options: CliOptions): Promise<number> {
  const result = await audit(targets, options);
  if (options.json) {
    console.log(JSON.stringify(toJsonResult(result), null, 2));
  } else {
    console.log(formatTextReport(result));
  }

  const threshold = options.threshold ?? result.config.thresholds?.design_signal;
  if ((options.ci || options.threshold !== undefined) && threshold !== undefined) {
    return result.scores.designSignal >= threshold ? 0 : 1;
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
  const highCount = result.findings.filter((finding) => finding.severity === "high").length;
  const status = result.scores.designSignal >= 75 && highCount === 0 ? "pass" : "fail";
  const payload = {
    status,
    decision: status === "pass" ? "show_user" : "revise_before_showing_user",
    design_signal_score: result.scores.designSignal,
    ai_slop_risk: result.scores.aiSlopRisk,
    blocking_issues: highCount,
    issues: result.findings.map((finding) => ({
      type: finding.id,
      severity: finding.severity,
      axis: finding.axis,
      reason: finding.message,
      suggested_fix: finding.suggestion,
      evidence: finding.evidence,
      source: finding.source
    })),
    recommended_action: status === "pass" ? "pass" : "revise"
  };

  console.log(JSON.stringify(payload, null, 2));
  return status === "pass" ? 0 : 1;
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
      options.threshold = Number(requireValue(args, (index += 1), arg));
      if (!Number.isFinite(options.threshold)) {
        throw new Error("--threshold must be a number.");
      }
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
      options.threshold = Number(arg.slice("--threshold=".length));
      if (!Number.isFinite(options.threshold)) {
        throw new Error("--threshold must be a number.");
      }
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

function toJsonResult(result: AuditResult): unknown {
  return {
    target: result.input.target,
    kind: result.input.kind,
    scores: result.scores,
    findings: result.findings
  };
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
  unslop design check <file-or-dir> [--json]
  unslop design check --url http://localhost:3000 [--threshold 75 --ci]
  unslop design plan <file-or-dir> [--product "TOPIK learning app"]
  unslop design fix <file-or-dir> [--safe | --suggest]
  unslop design report <file-or-dir> [-o unslop-report.html]
  unslop design agent-check --stdin --json
`);
}

export function readFixture(path: string): string {
  return readFileSync(path, "utf8");
}
