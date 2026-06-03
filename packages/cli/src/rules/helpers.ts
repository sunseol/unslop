import type {
  AuditInput,
  Finding,
  FixKind,
  ScoreAxis,
  Severity,
  SourceLocation
} from "../core/types.js";

export interface LocatedEvidence {
  source: SourceLocation;
  evidence: string;
}

export function locate(input: AuditInput, pattern: RegExp | string): LocatedEvidence | undefined {
  for (const file of input.files) {
    const match =
      typeof pattern === "string"
        ? findString(file.content, pattern)
        : findRegex(file.content, pattern);

    if (!match) {
      continue;
    }

    return {
      source: {
        path: file.path,
        line: lineForIndex(file.content, match.index),
        column: columnForIndex(file.content, match.index)
      },
      evidence: lineAtIndex(file.content, match.index)
    };
  }

  const fallback =
    typeof pattern === "string"
      ? findString(input.content, pattern)
      : findRegex(input.content, pattern);

  if (!fallback) {
    return undefined;
  }

  return {
    source: {
      path: input.target,
      line: lineForIndex(input.content, fallback.index),
      column: columnForIndex(input.content, fallback.index)
    },
    evidence: lineAtIndex(input.content, fallback.index)
  };
}

export function countMatches(value: string, pattern: RegExp): number {
  return Array.from(value.matchAll(pattern)).length;
}

export function uniqueMatches(value: string, pattern: RegExp): string[] {
  return Array.from(new Set(Array.from(value.matchAll(pattern), (match) => match[0])));
}

export function createFinding(input: {
  id: string;
  title: string;
  severity: Severity;
  axis: ScoreAxis;
  message: string;
  suggestion: string;
  fixKind: FixKind;
  located?: LocatedEvidence | undefined;
  evidence?: string | undefined;
}): Finding {
  const finding: Finding = {
    id: input.id,
    title: input.title,
    severity: input.severity,
    axis: input.axis,
    message: input.message,
    suggestion: input.suggestion,
    fixKind: input.fixKind
  };

  if (input.located) {
    finding.source = input.located.source;
    finding.evidence = input.located.evidence;
  }

  if (input.evidence) {
    finding.evidence = input.evidence;
  }

  return finding;
}

function findString(content: string, value: string): { index: number } | undefined {
  const index = content.toLowerCase().indexOf(value.toLowerCase());
  return index >= 0 ? { index } : undefined;
}

function findRegex(content: string, pattern: RegExp): { index: number } | undefined {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const regex = new RegExp(pattern.source, flags);
  const match = regex.exec(content);
  if (!match || match.index < 0) {
    return undefined;
  }
  return { index: match.index };
}

function lineForIndex(content: string, index: number): number {
  return content.slice(0, index).split(/\r?\n/).length;
}

function columnForIndex(content: string, index: number): number {
  const lineStart = content.lastIndexOf("\n", index - 1);
  return index - lineStart;
}

function lineAtIndex(content: string, index: number): string {
  const start = content.lastIndexOf("\n", index) + 1;
  const end = content.indexOf("\n", index);
  const raw = content.slice(start, end >= 0 ? end : undefined).trim();
  return raw.length > 180 ? `${raw.slice(0, 177)}...` : raw;
}
