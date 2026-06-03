import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AuditConfig } from "./types.js";

const CONFIG_CANDIDATES = [
  "unslop.design.yml",
  "unslop.design.yaml",
  "unslop.design.json"
];

export function loadConfig(configPath?: string): AuditConfig {
  const path = configPath ? resolve(configPath) : findConfig();
  if (!path) {
    return {};
  }

  const raw = readFileSync(path, "utf8");
  if (path.endsWith(".json")) {
    return JSON.parse(raw) as AuditConfig;
  }

  return parseTinyYaml(raw) as AuditConfig;
}

function findConfig(): string | undefined {
  for (const candidate of CONFIG_CANDIDATES) {
    const path = resolve(candidate);
    if (existsSync(path)) {
      return path;
    }
  }
  return undefined;
}

type TinyYamlValue =
  | string
  | number
  | boolean
  | null
  | TinyYamlValue[]
  | { [key: string]: TinyYamlValue };

interface YamlLine {
  indent: number;
  text: string;
}

export function parseTinyYaml(raw: string): Record<string, TinyYamlValue> {
  const lines = normalizeYamlLines(raw);
  const root: Record<string, TinyYamlValue> = {};
  const stack: Array<{ indent: number; value: TinyYamlValue }> = [
    { indent: -1, value: root }
  ];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line) {
      continue;
    }

    while (line.indent <= stack[stack.length - 1]!.indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1]!.value;
    if (line.text.startsWith("- ")) {
      if (!Array.isArray(parent)) {
        throw new Error(`Invalid YAML list item: ${line.text}`);
      }
      const itemText = line.text.slice(2).trim();
      if (itemText.includes(":")) {
        const [key, ...rest] = itemText.split(":");
        const objectValue: Record<string, TinyYamlValue> = {};
        const valueText = rest.join(":").trim();
        objectValue[key!.trim()] = parseYamlScalar(valueText);
        parent.push(objectValue);
        stack.push({ indent: line.indent, value: objectValue });
      } else {
        parent.push(parseYamlScalar(itemText));
      }
      continue;
    }

    const [key, ...rest] = line.text.split(":");
    if (!key) {
      continue;
    }
    const valueText = rest.join(":").trim();
    if (!isYamlObject(parent)) {
      throw new Error(`Invalid YAML mapping: ${line.text}`);
    }

    if (valueText.length > 0) {
      parent[key.trim()] = parseYamlScalar(valueText);
      continue;
    }

    const next = nextIndentedLine(lines, index, line.indent);
    const child: TinyYamlValue = next?.text.startsWith("- ") ? [] : {};
    parent[key.trim()] = child;
    stack.push({ indent: line.indent, value: child });
  }

  return root;
}

function normalizeYamlLines(raw: string): YamlLine[] {
  return raw
    .split(/\r?\n/)
    .map((line) => {
      const withoutComment = stripYamlComment(line);
      return {
        indent: withoutComment.match(/^ */)?.[0].length ?? 0,
        text: withoutComment.trim()
      };
    })
    .filter((line) => line.text.length > 0);
}

function stripYamlComment(line: string): string {
  let quoted = false;
  let quote = "";
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === "\"" || char === "'") && line[index - 1] !== "\\") {
      if (!quoted) {
        quoted = true;
        quote = char;
      } else if (quote === char) {
        quoted = false;
      }
    }
    if (char === "#" && !quoted) {
      return line.slice(0, index);
    }
  }
  return line;
}

function nextIndentedLine(
  lines: YamlLine[],
  currentIndex: number,
  currentIndent: number
): YamlLine | undefined {
  for (let index = currentIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && line.indent > currentIndent) {
      return line;
    }
    if (line && line.indent <= currentIndent) {
      return undefined;
    }
  }
  return undefined;
}

function parseYamlScalar(value: string): TinyYamlValue {
  if (value.length === 0) {
    return "";
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value === "null") {
    return null;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) {
      return [];
    }
    return inner.split(",").map((item) => parseYamlScalar(item.trim()));
  }
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function isYamlObject(
  value: TinyYamlValue
): value is Record<string, TinyYamlValue> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
