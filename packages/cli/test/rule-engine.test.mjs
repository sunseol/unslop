import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTinyYaml, runAudit, defaultRules } from "../dist/index.js";

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
