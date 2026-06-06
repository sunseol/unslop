import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { test } from "node:test";
import {
  defaultRules,
  loadUrlAuditInput,
  parseTinyYaml,
  run,
  runAudit
} from "../dist/index.js";

test("detects common AI UI slop patterns", () => {
  const content = `
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-cyan-400 to-blue-900">
      <div className="absolute rounded-full blur-3xl opacity-50"></div>
      <h1>Unlock your potential with AI-powered insights</h1>
      <button><svg viewBox="0 0 24 24"></svg></button>
      <img src="/hero.png">
      <section>
        ${Array.from(
          { length: 6 },
          (_, index) =>
            `<div className="rounded-[22px] border shadow-[0_0_80px_#9333ea] p-[13px]">Total Revenue ${index}</div>`
        ).join("\n")}
      </section>
    </main>
  `;

  const result = runAudit(
    {
      kind: "code",
      target: "fixture.tsx",
      content,
      files: [{ path: "fixture.tsx", content }],
      metadata: {}
    },
    {},
    defaultRules
  );

  const ids = new Set(result.findings.map((finding) => finding.id));
  assert.equal(ids.has("generic-ai-saas-hero"), true);
  assert.equal(ids.has("buzzword-unlock-potential"), true);
  assert.equal(ids.has("tailwind-arbitrary-values"), true);
  assert.equal(ids.has("image-missing-alt"), true);
  assert.equal(ids.has("icon-button-missing-label"), true);
  assert.equal(result.scores.designSignal < 90, true);
});

test("parses the supported YAML config subset", () => {
  const parsed = parseTinyYaml(`
product:
  name: "DOTORE TOPIK"
brand:
  avoid_copy:
    - "AI-powered insights"
tokens:
  spacing: [0, 4, 8, 12]
thresholds:
  design_signal: 75
`);

  assert.deepEqual(parsed.product, { name: "DOTORE TOPIK" });
  assert.deepEqual(parsed.brand, { avoid_copy: ["AI-powered insights"] });
  assert.deepEqual(parsed.tokens, { spacing: [0, 4, 8, 12] });
  assert.deepEqual(parsed.thresholds, { design_signal: 75 });
});

test("covers core rule ids with pass and fail fixtures", () => {
  const fixtures = [
    {
      id: "generic-cta-get-started",
      fail: "<main><button>Get Started</button><span>loading</span></main>",
      pass: "<main><button>Start TOPIK mock exam</button><span>loading</span></main>"
    },
    {
      id: "image-missing-alt",
      fail: "<main><img src=\"/hero.png\"><span>loading</span></main>",
      pass: "<main><img src=\"/hero.png\" alt=\"TOPIK study dashboard\"><span>loading</span></main>"
    },
    {
      id: "icon-button-missing-label",
      fail: "<main><button><svg></svg></button><span>loading</span></main>",
      pass: "<main><button aria-label=\"Close\"><svg></svg></button><span>loading</span></main>"
    },
    {
      id: "input-missing-label-hook",
      fail: "<main><input type=\"email\"><span>loading</span></main>",
      pass: "<main><input id=\"email\" type=\"email\"><span>loading</span></main>"
    },
    {
      id: "tailwind-arbitrary-values",
      fail: "<main className=\"w-[37px]\"><span>loading</span></main>",
      pass: "<main className=\"w-10\"><span>loading</span></main>"
    },
    {
      id: "ad-hoc-hex-colors",
      fail: "<main style={{ color: \"#ff00aa\" }}><span>loading</span></main>",
      pass: "<main className=\"text-primary\"><span>loading</span></main>"
    },
    {
      id: "generic-ai-saas-hero",
      fail: [
        "<main className=\"bg-gradient-to-br from-purple-600 to-cyan-400\">",
        "<div className=\"absolute rounded-full blur-3xl opacity-50\"></div>",
        "<span>loading</span>",
        "</main>"
      ].join(""),
      pass: "<main className=\"bg-surface text-foreground\"><span>loading</span></main>"
    },
    {
      id: "glass-card",
      fail: "<main className=\"backdrop-blur bg-white/10\"><span>loading</span></main>",
      pass: "<main className=\"bg-card border\"><span>loading</span></main>"
    },
    {
      id: "card-soup",
      fail: `<main>${Array.from(
        { length: 6 },
        (_, index) => `<div className="rounded border shadow">Item ${index}</div>`
      ).join("\n")}<span>loading</span></main>`,
      pass: "<main><section>Primary workflow</section><span>loading</span></main>"
    },
    {
      id: "fake-dashboard-labels",
      fail: "<main>Total Revenue<span>loading</span></main>",
      pass: "<main>Wrong answer review queue<span>loading</span></main>"
    }
  ];

  assert.equal(fixtures.length, 10);

  for (const fixture of fixtures) {
    assert.equal(hasFinding(fixture.fail, fixture.id), true, `${fixture.id} fail fixture`);
    assert.equal(hasFinding(fixture.pass, fixture.id), false, `${fixture.id} pass fixture`);
  }
});

test("initializes a default design config", async () => {
  const originalCwd = process.cwd();
  const directory = mkdtempSync(join(tmpdir(), "unslop-init-"));

  try {
    process.chdir(directory);
    const result = await captureStdout(() => run(["design", "init", "--json"]));
    const configPath = join(directory, "unslop.design.yml");
    const raw = readFileSync(configPath, "utf8");

    assert.equal(result.exitCode, 0);
    assert.equal(JSON.parse(result.output).path, "unslop.design.yml");
    assert.match(raw, /product:/);
    assert.match(raw, /thresholds:/);
  } finally {
    process.chdir(originalCwd);
    rmSync(directory, { recursive: true, force: true });
  }
});

test("emits the stable v0.1 JSON contract", async () => {
  const directory = mkdtempSync(join(tmpdir(), "unslop-json-"));
  const path = join(directory, "fixture.html");

  try {
    writeFixture(
      path,
      [
        "<main>",
        "<h1>Unlock your potential with AI-powered insights</h1>",
        "<button>Get Started</button>",
        "</main>"
      ].join("\n")
    );

    const result = await captureStdout(() =>
      run(["design", "check", path, "--json", "--agent"])
    );
    const payload = JSON.parse(result.output);

    assert.equal(result.exitCode, 1);
    assert.equal(payload.schema_version, "0.1.0");
    assert.equal(payload.mode, "agent");
    assert.equal(payload.target.kind, "code");
    assert.equal(payload.decision, "revise");
    assert.equal(payload.next_action, "revise");
    assert.equal(typeof payload.scores.design_signal, "number");
    assert.equal(Array.isArray(payload.findings), true);
    assert.equal(Array.isArray(payload.safe_fixes), true);
    assert.equal(Array.isArray(payload.suggested_fixes), true);
    assert.equal(Array.isArray(payload.human_review_required), true);

    const finding = payload.findings.find((item) => item.id === "generic-cta-get-started");
    assert.equal(finding.rule_id, "generic-cta-get-started");
    assert.equal(finding.category, "copy_signal");
    assert.equal(finding.fix_bucket, "safe");
    assert.equal(finding.suggested_fix, "Replace the CTA with a concrete next action, such as \"Review 5 wrong answers\".");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("checks globbed React and Tailwind source files", async () => {
  const directory = mkdtempSync(join(tmpdir(), "unslop-glob-"));
  const sourceDirectory = join(directory, "src/app");
  const pagePath = join(sourceDirectory, "page.tsx");

  try {
    mkdirSync(sourceDirectory, { recursive: true });
    writeFixture(
      pagePath,
      [
        "export default function Page() {",
        "  return <main><button>Get Started</button><span>loading</span></main>;",
        "}"
      ].join("\n")
    );

    const result = await captureStdout(() =>
      run(["design", "check", join(directory, "src/**/*.tsx"), "--json"])
    );
    const payload = JSON.parse(result.output);

    assert.equal(result.exitCode, 0);
    assert.equal(payload.target.kind, "code");
    assert.equal(
      payload.findings.some((finding) => finding.id === "generic-cta-get-started"),
      true
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("prints decision and top findings in text reports", async () => {
  const directory = mkdtempSync(join(tmpdir(), "unslop-text-"));
  const path = join(directory, "fixture.html");

  try {
    writeFixture(path, "<main><button>Get Started</button><span>loading</span></main>");
    const result = await captureStdout(() => run(["design", "check", path]));

    assert.equal(result.exitCode, 0);
    assert.match(result.output, /Design Signal Score:/);
    assert.match(result.output, /Decision:/);
    assert.match(result.output, /Top Findings:/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("applies CI threshold, accessibility, fail-on-high, and blocking failures", async () => {
  const directory = mkdtempSync(join(tmpdir(), "unslop-ci-"));
  const missingAltPath = join(directory, "missing-alt.html");
  const highPath = join(directory, "icon-button.html");
  const imagePath = join(directory, "screen.png");

  try {
    writeFixture(missingAltPath, "<main><h1>Ready</h1><img src=\"/hero.png\"></main>");
    writeFixture(highPath, "<main><h1>Ready</h1><button><svg></svg></button></main>");
    writeFixture(imagePath, "");

    assert.equal(
      (await captureStdout(() =>
        run(["design", "check", missingAltPath, "--ci", "--threshold", "101"])
      )).exitCode,
      1
    );
    assert.equal(
      (await captureStdout(() =>
        run([
          "design",
          "check",
          missingAltPath,
          "--ci",
          "--accessibility-threshold",
          "95"
        ])
      )).exitCode,
      1
    );
    assert.equal(
      (await captureStdout(() =>
        run(["design", "check", highPath, "--ci", "--fail-on-high"])
      )).exitCode,
      1
    );
    assert.equal(
      (await captureStdout(() => run(["design", "check", imagePath, "--ci"]))).exitCode,
      1
    );
    assert.equal(
      (await captureStdout(() =>
        run([
          "design",
          "check",
          missingAltPath,
          "--ci",
          "--accessibility-threshold",
          "80"
        ])
      )).exitCode,
      0
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("suppresses false positives from config and inline comments", async () => {
  const directory = mkdtempSync(join(tmpdir(), "unslop-ignore-"));
  const configPath = join(directory, "unslop.design.yml");
  const configFixturePath = join(directory, "config-fixture.html");
  const inlineFixturePath = join(directory, "inline-fixture.html");

  try {
    writeFixture(
      configPath,
      [
        "ignore:",
        "  - rule_id: generic-cta-get-started",
        "    reason: \"Launch copy is intentionally temporary.\""
      ].join("\n")
    );
    writeFixture(configFixturePath, "<main><button>Get Started</button></main>");
    writeFixture(
      inlineFixturePath,
      [
        "<!-- unslop-ignore-next-line image-missing-alt -- decorative launch image -->",
        "<img src=\"/hero.png\">"
      ].join("\n")
    );

    const configResult = await captureStdout(() =>
      run(["design", "check", configFixturePath, "--config", configPath, "--json"])
    );
    const inlineResult = await captureStdout(() =>
      run(["design", "check", inlineFixturePath, "--json"])
    );

    assert.equal(
      JSON.parse(configResult.output).findings.some(
        (finding) => finding.id === "generic-cta-get-started"
      ),
      false
    );
    assert.equal(
      JSON.parse(inlineResult.output).findings.some(
        (finding) => finding.id === "image-missing-alt"
      ),
      false
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("scopes config suppressions to matching source paths only", async () => {
  const directory = mkdtempSync(join(tmpdir(), "unslop-ignore-target-"));
  const configPath = join(directory, "unslop.design.yml");
  const ignoredPath = join(directory, "ignored.html");
  const reportedPath = join(directory, "not-ignored.html");

  try {
    writeFixture(
      configPath,
      [
        "ignore:",
        "  - rule_id: generic-cta-get-started",
        "    target: \"ignored.html\""
      ].join("\n")
    );
    writeFixture(ignoredPath, "<main><span>loading</span></main>");
    writeFixture(reportedPath, "<main><button>Get Started</button><span>loading</span></main>");

    const result = await captureStdout(() =>
      run(["design", "check", ignoredPath, reportedPath, "--config", configPath, "--json"])
    );
    const findings = JSON.parse(result.output).findings.filter(
      (finding) => finding.id === "generic-cta-get-started"
    );

    assert.equal(findings.length, 1);
    assert.match(findings[0].source.path, /not-ignored\.html$/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("does not suppress by evidence text, axis, or wildcard rule ids", async () => {
  const directory = mkdtempSync(join(tmpdir(), "unslop-ignore-safe-"));
  const evidenceConfigPath = join(directory, "evidence.yml");
  const axisConfigPath = join(directory, "axis.yml");
  const wildcardConfigPath = join(directory, "wildcard.yml");
  const ctaPath = join(directory, "cta.html");
  const imagePath = join(directory, "image.html");
  const inlineAxisPath = join(directory, "inline-axis.html");

  try {
    writeFixture(
      evidenceConfigPath,
      [
        "ignore:",
        "  - rule_id: generic-cta-get-started",
        "    target: \"Get Started\""
      ].join("\n")
    );
    writeFixture(
      axisConfigPath,
      [
        "ignore:",
        "  - rule_id: accessibility"
      ].join("\n")
    );
    writeFixture(
      wildcardConfigPath,
      [
        "ignore:",
        "  - rule_id: \"*\""
      ].join("\n")
    );
    writeFixture(ctaPath, "<main><button>Get Started</button><span>loading</span></main>");
    writeFixture(imagePath, "<main><img src=\"/hero.png\"><span>loading</span></main>");
    writeFixture(
      inlineAxisPath,
      [
        "<!-- unslop-ignore-next-line accessibility -- too broad -->",
        "<img src=\"/hero.png\">",
        "<span>loading</span>"
      ].join("\n")
    );

    const evidenceResult = await captureStdout(() =>
      run(["design", "check", ctaPath, "--config", evidenceConfigPath, "--json"])
    );
    const axisResult = await captureStdout(() =>
      run(["design", "check", imagePath, "--config", axisConfigPath, "--json"])
    );
    const wildcardResult = await captureStdout(() =>
      run(["design", "check", imagePath, "--config", wildcardConfigPath, "--json"])
    );
    const inlineAxisResult = await captureStdout(() =>
      run(["design", "check", inlineAxisPath, "--json"])
    );

    assert.equal(hasJsonFinding(evidenceResult.output, "generic-cta-get-started"), true);
    assert.equal(hasJsonFinding(axisResult.output, "image-missing-alt"), true);
    assert.equal(hasJsonFinding(wildcardResult.output, "image-missing-alt"), true);
    assert.equal(hasJsonFinding(inlineAxisResult.output, "image-missing-alt"), true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("uses Playwright URL rendering when the browser adapter is available", async () => {
  let closed = false;
  const playwright = {
    chromium: {
      async launch() {
        return {
          async newPage() {
            return {
              async goto() {
                return {
                  status: () => 200,
                  headers: () => ({ "content-type": "text/html" })
                };
              },
              async content() {
                return [
                  "<main>",
                  "<h1>Unlock your potential</h1>",
                  "<button><svg></svg></button>",
                  "</main>"
                ].join("");
              },
              async evaluate() {
                return {
                  title: "Rendered fixture",
                  finalUrl: "http://localhost:3000/",
                  computed: [
                    [
                      "main text=\"Unlock your potential\"",
                      "background=linear-gradient(rgb(124,58,237), rgb(6,182,212))",
                      "color=rgb(17,24,39)"
                    ].join(" ")
                  ]
                };
              }
            };
          },
          async close() {
            closed = true;
          }
        };
      }
    }
  };

  const input = await loadUrlAuditInput("http://localhost:3000", {
    loadPlaywright: async () => playwright
  });

  assert.equal(input.kind, "url");
  assert.equal(input.metadata.adapter, "playwright");
  assert.equal(input.metadata.rendered, true);
  assert.equal(input.metadata.status, 200);
  assert.match(input.content, /Unlock your potential/);
  assert.match(input.content, /linear-gradient/);
  assert.equal(closed, true);
});

test("does not fall back to fetch when Playwright rendering fails", async () => {
  let fetched = false;
  const playwright = {
    chromium: {
      async launch() {
        return {
          async newPage() {
            return {
              async goto() {
                return {
                  status: () => 500,
                  headers: () => ({ "content-type": "text/html" })
                };
              },
              async content() {
                return "<main>Server error</main>";
              },
              async evaluate() {
                return {
                  title: "Server error",
                  finalUrl: "http://localhost:3000/",
                  computed: []
                };
              }
            };
          },
          async close() {}
        };
      }
    }
  };

  await assert.rejects(
    () =>
      loadUrlAuditInput("http://localhost:3000", {
        loadPlaywright: async () => playwright,
        fetchImpl: async () => {
          fetched = true;
          throw new Error("fetch should not be called");
        }
      }),
    /HTTP 500/
  );
  assert.equal(fetched, false);
});

test("falls back to fetch when Playwright launch fails", async () => {
  const input = await loadUrlAuditInput("http://localhost:3000", {
    loadPlaywright: async () => ({
      chromium: {
        async launch() {
          throw new Error("Browser executable is missing");
        }
      }
    }),
    fetchImpl: async () =>
      new Response("<main><h1>Launch fallback</h1></main>", {
        status: 200,
        headers: { "content-type": "text/html" }
      })
  });

  assert.equal(input.metadata.adapter, "fetch");
  assert.equal(input.metadata.rendered, false);
  assert.match(String(input.metadata.browserFallbackReason), /Browser executable is missing/);
});

test("falls back to fetch URL loading when Playwright is unavailable", async () => {
  const server = createServer((_request, response) => {
    response.setHeader("content-type", "text/html");
    response.end("<main><h1>Static fixture</h1></main>");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const address = server.address();
    assert.equal(typeof address, "object");
    assert.notEqual(address, null);

    const input = await loadUrlAuditInput(`http://127.0.0.1:${address.port}`, {
      loadPlaywright: async () => undefined
    });

    assert.equal(input.kind, "url");
    assert.equal(input.metadata.adapter, "fetch");
    assert.equal(input.metadata.rendered, false);
    assert.equal(input.metadata.status, 200);
    assert.match(input.content, /Static fixture/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function captureStdout(callback) {
  const originalLog = console.log;
  const output = [];
  console.log = (...args) => output.push(args.join(" "));
  try {
    const exitCode = await callback();
    return {
      exitCode,
      output: output.join("\n")
    };
  } finally {
    console.log = originalLog;
  }
}

function writeFixture(path, content) {
  writeFileSync(path, content, "utf8");
}

function hasFinding(content, id) {
  const result = runAudit(
    {
      kind: "code",
      target: "fixture.html",
      content,
      files: [{ path: "fixture.html", content }],
      metadata: {}
    },
    {},
    defaultRules
  );
  return result.findings.some((finding) => finding.id === id);
}

function hasJsonFinding(output, id) {
  return JSON.parse(output).findings.some((finding) => finding.id === id);
}
