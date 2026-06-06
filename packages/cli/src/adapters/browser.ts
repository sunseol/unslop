import type { AuditInput } from "../core/types.js";

export interface BrowserAdapterOptions {
  loadPlaywright?: (() => Promise<PlaywrightModule | undefined>) | undefined;
  fetchImpl?: typeof fetch | undefined;
}

interface PlaywrightModule {
  chromium: {
    launch(options: { headless: boolean }): Promise<Browser>;
  };
}

interface Browser {
  newPage(options: { viewport: { width: number; height: number } }): Promise<Page>;
  close(): Promise<void>;
}

interface Page {
  goto(
    url: string,
    options: { waitUntil: "networkidle"; timeout: number }
  ): Promise<PageResponse | null>;
  content(): Promise<string>;
  evaluate<T>(callback: () => T): Promise<T>;
}

interface PageResponse {
  status(): number;
  headers(): Record<string, string>;
}

interface RenderedSnapshot {
  html: string;
  computed: string[];
  title: string;
  finalUrl: string;
  status?: number;
  contentType?: string;
}

export async function loadUrlAuditInput(
  url: string,
  options: BrowserAdapterOptions = {}
): Promise<AuditInput> {
  let browserFallbackReason: string | undefined;
  const loadPlaywright = options.loadPlaywright ?? loadOptionalPlaywright;
  const playwright = await loadPlaywright().catch((error: unknown) => {
    browserFallbackReason = errorMessage(error);
    return undefined;
  });

  if (!playwright) {
    browserFallbackReason ??= "Playwright is not available.";
    return loadFetchedUrlAuditInput(url, options.fetchImpl, browserFallbackReason);
  }

  const browser = await launchBrowser(playwright).catch((error: unknown) => {
    browserFallbackReason = errorMessage(error);
    return undefined;
  });

  if (!browser) {
    return loadFetchedUrlAuditInput(url, options.fetchImpl, browserFallbackReason);
  }

  const snapshot = await renderWithBrowser(url, browser);
  return toRenderedAuditInput(url, snapshot);
}

async function launchBrowser(playwright: PlaywrightModule): Promise<Browser> {
  return playwright.chromium.launch({ headless: true });
}

async function renderWithBrowser(url: string, browser: Browser): Promise<RenderedSnapshot> {
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 }
    });
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 15_000
    });
    const status = response?.status();
    if (typeof status === "number" && status >= 400) {
      throw new Error(`Failed to render ${url}: HTTP ${status}`);
    }

    const html = await page.content();
    const evaluated = await page.evaluate(() => {
      const compactText = (value: string): string =>
        value.replace(/\s+/g, " ").trim().slice(0, 120);
      const quoteForSnapshot = (value: string): string =>
        JSON.stringify(value.replace(/\s+/g, " ").trim());
      const selectors = [
        "body",
        "main",
        "header",
        "nav",
        "section",
        "article",
        "aside",
        "footer",
        "h1",
        "h2",
        "h3",
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "img",
        "[role]"
      ].join(", ");
      const elements = Array.from(
        document.querySelectorAll(selectors)
      ).slice(0, 200);

      return {
        title: document.title,
        finalUrl: window.location.href,
        computed: elements.map((element) => {
          const style = window.getComputedStyle(element);
          const text = compactText(element.textContent ?? "");
          const tag = element.tagName.toLowerCase();
          const role = element.getAttribute("role") ?? "";
          const label =
            element.getAttribute("aria-label") ??
            element.getAttribute("alt") ??
            "";

          return [
            tag,
            role ? `role=${quoteForSnapshot(role)}` : "",
            label ? `label=${quoteForSnapshot(label)}` : "",
            text ? `text=${quoteForSnapshot(text)}` : "",
            style.backgroundImage && style.backgroundImage !== "none"
              ? `background=${quoteForSnapshot(style.backgroundImage)}`
              : "",
            style.boxShadow && style.boxShadow !== "none"
              ? `shadow=${quoteForSnapshot(style.boxShadow)}`
              : "",
            style.borderRadius && style.borderRadius !== "0px"
              ? `radius=${quoteForSnapshot(style.borderRadius)}`
              : "",
            style.color ? `color=${quoteForSnapshot(style.color)}` : "",
            style.fontSize ? `fontSize=${quoteForSnapshot(style.fontSize)}` : ""
          ]
            .filter(Boolean)
            .join(" ");
        })
      };
    });

    const contentType = response?.headers()["content-type"];

    return {
      html,
      computed: evaluated.computed,
      title: evaluated.title,
      finalUrl: evaluated.finalUrl,
      ...(typeof status === "number" ? { status } : {}),
      ...(contentType ? { contentType } : {})
    };
  } finally {
    await browser.close();
  }
}

function toRenderedAuditInput(url: string, snapshot: RenderedSnapshot): AuditInput {
  const content = [
    snapshot.html,
    "",
    "<!-- UNSLOP_RENDERED_SNAPSHOT",
    `title=${snapshot.title}`,
    `finalUrl=${snapshot.finalUrl}`,
    ...snapshot.computed,
    "UNSLOP_RENDERED_SNAPSHOT -->"
  ].join("\n");

  return {
    kind: "url",
    target: url,
    content,
    files: [{ path: url, content }],
    metadata: {
      adapter: "playwright",
      rendered: true,
      finalUrl: snapshot.finalUrl,
      title: snapshot.title,
      ...(typeof snapshot.status === "number" ? { status: snapshot.status } : {}),
      ...(snapshot.contentType ? { contentType: snapshot.contentType } : {})
    }
  };
}

async function loadFetchedUrlAuditInput(
  url: string,
  fetchImpl: typeof fetch | undefined,
  browserFallbackReason: string | undefined
): Promise<AuditInput> {
  const response = await (fetchImpl ?? fetch)(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const content = await response.text();
  return {
    kind: "url",
    target: url,
    content,
    files: [{ path: url, content }],
    metadata: {
      adapter: "fetch",
      rendered: false,
      status: response.status,
      contentType: response.headers.get("content-type") ?? "",
      ...(browserFallbackReason ? { browserFallbackReason } : {})
    }
  };
}

async function loadOptionalPlaywright(): Promise<PlaywrightModule | undefined> {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string
    ) => Promise<unknown>;
    const module = await dynamicImport("playwright");
    return isPlaywrightModule(module) ? module : undefined;
  } catch {
    return undefined;
  }
}

function isPlaywrightModule(value: unknown): value is PlaywrightModule {
  return (
    value !== null &&
    typeof value === "object" &&
    "chromium" in value &&
    Boolean((value as { chromium?: unknown }).chromium)
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
