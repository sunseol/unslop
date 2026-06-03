import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve, sep } from "node:path";
import type { AuditInput, SourceFile } from "../core/types.js";

const TEXT_EXTENSIONS = new Set([
  ".astro",
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".md",
  ".mdx",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue"
]);

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export async function loadAuditInput(input: {
  targets: string[];
  url?: string | undefined;
  stdinContent?: string | undefined;
}): Promise<AuditInput> {
  if (input.url) {
    const response = await fetch(input.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${input.url}: ${response.status} ${response.statusText}`);
    }
    const content = await response.text();
    return {
      kind: "url",
      target: input.url,
      content,
      files: [{ path: input.url, content }],
      metadata: {
        status: response.status,
        contentType: response.headers.get("content-type") ?? ""
      }
    };
  }

  if (input.stdinContent !== undefined) {
    return {
      kind: "text",
      target: "stdin",
      content: input.stdinContent,
      files: [{ path: "stdin", content: input.stdinContent }],
      metadata: {}
    };
  }

  if (input.targets.length === 0) {
    throw new Error("Expected a file, directory, glob pattern, --url, or --stdin.");
  }

  const files = await collectSourceFiles(input.targets);
  if (files.length === 0 && input.targets.length === 1 && isImagePath(input.targets[0]!)) {
    return {
      kind: "image",
      target: input.targets[0]!,
      content: "",
      files: [],
      metadata: {
        adapter: "pending"
      }
    };
  }

  if (files.length === 0) {
    throw new Error(`No supported source files found for: ${input.targets.join(", ")}`);
  }

  return {
    kind: "code",
    target: input.targets.join(", "),
    content: files.map((file) => `/* ${file.path} */\n${file.content}`).join("\n\n"),
    files,
    metadata: {
      fileCount: files.length
    }
  };
}

async function collectSourceFiles(targets: string[]): Promise<SourceFile[]> {
  const files: SourceFile[] = [];

  for (const target of targets) {
    if (hasWildcard(target)) {
      files.push(...(await expandPattern(target)));
      continue;
    }

    const path = resolve(target);
    const info = await stat(path);
    if (info.isDirectory()) {
      files.push(...(await readDirectory(path)));
      continue;
    }

    if (info.isFile() && isTextPath(path)) {
      files.push(await readSourceFile(path));
    }
  }

  return files;
}

async function readDirectory(path: string): Promise<SourceFile[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const files: SourceFile[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
      continue;
    }
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readDirectory(child)));
    } else if (entry.isFile() && isTextPath(child)) {
      files.push(await readSourceFile(child));
    }
  }

  return files;
}

async function readSourceFile(path: string): Promise<SourceFile> {
  return {
    path: normalizePath(relative(process.cwd(), path) || basename(path)),
    content: await readFile(path, "utf8")
  };
}

async function expandPattern(pattern: string): Promise<SourceFile[]> {
  const absolutePattern = normalizePath(resolve(pattern));
  const root = globRoot(absolutePattern);
  const regex = globToRegex(absolutePattern);
  const candidates = await readDirectory(root);
  return candidates.filter((file) => regex.test(normalizePath(resolve(file.path))));
}

function globRoot(pattern: string): string {
  const wildcardIndex = pattern.search(/[*?]/);
  if (wildcardIndex < 0) {
    return dirname(pattern);
  }
  const prefix = pattern.slice(0, wildcardIndex);
  const slashIndex = prefix.lastIndexOf("/");
  return slashIndex >= 0 ? prefix.slice(0, slashIndex) : process.cwd();
}

function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

function hasWildcard(path: string): boolean {
  return /[*?]/.test(path);
}

function isTextPath(path: string): boolean {
  return TEXT_EXTENSIONS.has(extname(path).toLowerCase());
}

function isImagePath(path: string): boolean {
  return IMAGE_EXTENSIONS.has(extname(path).toLowerCase());
}

function normalizePath(path: string): string {
  return path.split(sep).join("/");
}
