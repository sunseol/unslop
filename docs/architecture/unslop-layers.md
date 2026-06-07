---
title: UNSLOP Runtime Layers
description: Architecture layer plan for UNSLOP's product-readiness inspection workflow.
status: draft
target_path: docs/architecture/unslop-layers.md
---

# UNSLOP Runtime Layers

## 핵심 관점

UNSLOP은 AI가 만든 UI를 “AI처럼 안 보이게” 바꾸는 도구가 아니다.

UNSLOP은 다음 질문에 답하는 **product readiness gate**다.

> 이 화면은 실제 제품으로 검토 가능한가?

따라서 레이어는 다음 순서로 설계한다.

```txt
Input
  -> Render / Parse
  -> Product Context Enrichment
  -> Signal Extraction
  -> Rule + Signature Evaluation
  -> Score + Quality Gate
  -> Fix Plan / Agent Dispatch
  -> Persistent Artifacts
  -> Re-run / Human Review / CI Decision
```

---

## 1. 참조 이미지 스타일 전체 도식

```mermaid
flowchart LR
  %% =========================
  %% LEFT: Persistent Artifacts
  %% =========================
  subgraph ART["Context Artifacts · Disk Persistent"]
    A0["unslop.design.yml<br/>Product Intent Contract"]
    A1[".unslop/profile.json<br/>Generated Product Profile"]
    A2[".unslop/snapshots/dom.html<br/>Rendered DOM Snapshot"]
    A3[".unslop/snapshots/styles.json<br/>Computed Style Snapshot"]
    A4[".unslop/runs/{run_id}.audit.json<br/>Full Audit Result"]
    A5[".unslop/findings.md<br/>Human Review Findings"]
    A6[".unslop/fix-plan.md<br/>Grouped Fix Plan"]
    A7[".unslop/report.html<br/>HTML Review Report"]
    A8[".unslop/context/agent-recovery.json<br/>Agent Recovery Packet"]
    A9["examples/fixtures/*<br/>Rule Regression Fixtures"]
  end

  %% =========================
  %% CENTER: Orchestrator
  %% =========================
  subgraph CORE["UNSLOP Orchestrator · 8 Phase Workflow"]
    P0["P0 · Init / Contract Load<br/>read config + thresholds + ignore rules"]
    P1["P1 · Target Intake<br/>URL / file / glob / directory / stdin"]
    P2["P2 · Render & Parse<br/>browser render + source parse + fallback"]
    P3["P3 · Context Enrichment<br/>product user + task + domain object + token map"]
    P4["P4 · Parallel Signal Extraction"]
    P5["P5 · Rule & Signature Engine<br/>deterministic rules + slop clusters"]
    P6["P6 · Score & Quality Gate<br/>Design Signal Score + pass/revise/block"]
    P7["P7 · Fix Plan / Dispatch<br/>safe / suggested / human-review buckets"]
    P8["P8 · Persist / Report / Exit<br/>JSON + Markdown + HTML + CI code"]

    P0 --> P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> P8
  end

  %% =========================
  %% P4 Parallel Extractors
  %% =========================
  subgraph SIG["P4 · Parallel Signal Extractors"]
    S1["Copy Signal<br/>generic CTA, buzzword, taskless copy"]
    S2["Visual Cliche<br/>gradient, glow, orb, glass card"]
    S3["Product Specificity<br/>domain object, workflow, fake metric"]
    S4["Hierarchy<br/>heading depth, card soup, CTA priority"]
    S5["Design System<br/>token drift, raw hex, arbitrary Tailwind"]
    S6["Accessibility<br/>alt, label, heading jump, form name"]
    S7["Interaction Readiness<br/>loading, empty, error, disabled, success"]
    S8["Implementation<br/>semantic HTML, div soup, state wiring"]
  end

  P4 --> S1
  P4 --> S2
  P4 --> S3
  P4 --> S4
  P4 --> S5
  P4 --> S6
  P4 --> S7
  P4 --> S8

  S1 --> P5
  S2 --> P5
  S3 --> P5
  S4 --> P5
  S5 --> P5
  S6 --> P5
  S7 --> P5
  S8 --> P5

  %% =========================
  %% RIGHT: Consumers
  %% =========================
  subgraph OUT["Consumers / Decisions"]
    O1["Terminal Report<br/>human-readable"]
    O2["Strict JSON<br/>CI + agent-readable"]
    O3["Fix Plan<br/>Markdown grouped plan"]
    O4["HTML Report<br/>review handoff"]
    O5["CI Gate<br/>exit 0 / non-zero"]
    O6["Agent Check<br/>revise loop contract"]
    O7["Human Review<br/>brand / product decision"]
  end

  P8 --> O1
  P8 --> O2
  P8 --> O3
  P8 --> O4
  P8 --> O5
  P8 --> O6
  P8 --> O7

  %% =========================
  %% RIGHT SIDE: Recovery
  %% =========================
  subgraph REC["Context Compaction & Recovery"]
    R1["Compaction Risk<br/>long agent loop loses UI context"]
    R2["Recovery Packet<br/>target + scores + top findings + rerun command"]
    R3["Re-inject Context<br/>agent reads .unslop/context/agent-recovery.json"]
    R4["Re-run Check<br/>same target, same contract, new run_id"]
  end

  O6 --> R1 --> R2 --> R3 --> R4 --> P1

  %% =========================
  %% Artifact links
  %% =========================
  A0 -. "R" .-> P0
  A1 -. "R/W" .-> P3
  A2 -. "W" .-> P2
  A3 -. "W" .-> P2
  A4 -. "W" .-> P8
  A5 -. "W" .-> P8
  A6 -. "W" .-> P7
  A7 -. "W" .-> P8
  A8 -. "W" .-> R2
  A9 -. "R" .-> P5

  %% =========================
  %% Styles
  %% =========================
  classDef artifact fill:#21170b,stroke:#d98b2b,color:#fff5dd;
  classDef core fill:#0e3a5a,stroke:#4aa3df,color:#eaf7ff;
  classDef signal fill:#123b1c,stroke:#32c267,color:#effff3;
  classDef output fill:#31204d,stroke:#9b6cff,color:#f7f0ff;
  classDef recovery fill:#33151c,stroke:#ff6f91,color:#fff0f3;

  class A0,A1,A2,A3,A4,A5,A6,A7,A8,A9 artifact;
  class P0,P1,P2,P3,P4,P5,P6,P7,P8 core;
  class S1,S2,S3,S4,S5,S6,S7,S8 signal;
  class O1,O2,O3,O4,O5,O6,O7 output;
  class R1,R2,R3,R4 recovery;
```

---

## 2. 레이어 스택 도식

```mermaid
flowchart TD
  L0["L0 · Product Intent Contract<br/>unslop.design.yml<br/>제품명, 사용자, 과업, 도메인 객체, 토큰, 회피 패턴, threshold"]
  L1["L1 · Input Adapters<br/>URL, file, glob, directory, stdin<br/>future: Figma, screenshot"]
  L2["L2 · Render / Parse Layer<br/>Playwright render, fetch fallback, DOM parse, source parse, style snapshot"]
  L3["L3 · Evidence Index<br/>text inventory, CTA map, heading tree, token usage, domain object coverage"]
  L4["L4 · Signal Extractors<br/>copy, visual, hierarchy, product specificity, design system, a11y, states"]
  L5["L5 · Rule + Signature Engine<br/>single rules + cluster rules + suppression + dedupe"]
  L6["L6 · Scoring + Gate<br/>Design Signal Score, axis score, pass/revise/block, CI exit code"]
  L7["L7 · Fix Planning<br/>safe, suggested, human_review buckets"]
  L8["L8 · Output Contracts<br/>terminal, JSON, Markdown plan, HTML report, agent recovery packet"]
  L9["L9 · Feedback Loop<br/>agent revise, human review, suppression approval, fixture regression"]

  L0 --> L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8 --> L9
  L9 -. "rerun with same contract" .-> L1
```

---

## 3. 8 Phase Workflow

| Phase | 이름                   | 핵심 질문                       | 입력                          | 출력                          |
| ----- | -------------------- | --------------------------- | --------------------------- | --------------------------- |
| P0    | Init / Contract Load | 이 프로젝트의 제품 의도는 무엇인가?        | `unslop.design.yml`         | `AuditConfig`               |
| P1    | Target Intake        | 무엇을 검사할 것인가?                | URL, file, glob, dir, stdin | `TargetEnvelope`            |
| P2    | Render / Parse       | 실제 화면과 소스에서 무엇을 볼 수 있는가?    | target                      | DOM, source, computed style |
| P3    | Context Enrichment   | 제품 과업과 화면 증거를 어떻게 연결할 것인가?  | config + snapshots          | `EvidenceIndex`             |
| P4    | Signal Extraction    | 어떤 slop 신호가 있는가?            | evidence                    | `Signal[]`                  |
| P5    | Rule / Signature     | 단일 문제가 아니라 slop cluster인가?  | signals + rules             | `Finding[]`                 |
| P6    | Score / Gate         | pass, revise, block 중 무엇인가? | findings + thresholds       | `AuditResult`               |
| P7    | Fix Plan / Dispatch  | 무엇부터 고쳐야 하는가?               | findings                    | safe/suggested/human_review |
| P8    | Persist / Report     | 사람, CI, agent가 무엇을 읽어야 하는가? | result                      | JSON, MD, HTML, exit code   |

---

## 4. Phase별 상세 설계

### P0 · Init / Product Intent Contract

UNSLOP의 핵심 설정 파일은 단순 config가 아니라 **제품 의도 계약서**다.

```yaml
# unslop.design.yml
product:
  name: "DOTORE TOPIK"
  type: "education"
  primary_user: "TOPIK learners"
  primary_tasks:
    - solve TOPIK questions
    - review wrong answers
    - track vocabulary mistakes

domain:
  objects:
    - question
    - wrong answer
    - vocabulary
    - grammar pattern
    - mock test
    - score report

brand:
  avoid_visuals:
    - neon glow
    - purple cyan gradient
    - decorative orb without product meaning
  avoid_copy:
    - "Get Started"
    - "Learn More"
    - "Unlock your potential"
    - "AI-powered insights"

tokens:
  colors:
    surface: "#ffffff"
    foreground: "#111111"
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64]
  radius:
    sm: 6
    md: 10
    lg: 16

thresholds:
  design_signal: 75
  accessibility: 85

gates:
  fail_on_blocking: true
  fail_on_high: false

ignore:
  - rule_id: generic-cta-get-started
    target: "src/app/page.tsx"
    reason: "Temporary launch CTA approved by product."
```

핵심은 이 파일이 “취향”이 아니라 다음 판단 기준을 제공한다는 점이다.

```txt
제품 사용자
제품 과업
도메인 객체
브랜드 회피 패턴
디자인 토큰
품질 threshold
승인된 예외
```

---

### P1 · Target Intake

```mermaid
flowchart LR
  C["CLI Command"] --> T{"Target Type"}

  T --> U["URL<br/>--url http://localhost:3000"]
  T --> F["File<br/>src/app/page.tsx"]
  T --> G["Glob<br/>src/**/*.tsx"]
  T --> D["Directory<br/>src/"]
  T --> I["stdin<br/>--stdin"]
  T --> X["Future<br/>--figma / screenshot"]

  U --> E["TargetEnvelope"]
  F --> E
  G --> E
  D --> E
  I --> E
  X --> E

  E --> V["Validation Hooks<br/>exists, extension, localhost preference, privacy guard"]
```

TargetEnvelope 예시:

```ts
type TargetEnvelope =
  | {
      kind: "url";
      target: string;
      preferBrowserRender: true;
      fallback: "fetch";
    }
  | {
      kind: "files";
      files: Array<{
        path: string;
        extension: string;
        content: string;
      }>;
    }
  | {
      kind: "stdin";
      content: string;
      declaredType?: "html" | "tsx" | "text";
    };
```

---

### P2 · Render / Parse

```mermaid
flowchart TD
  P2["P2 Render / Parse"] --> B{"URL target?"}

  B -->|yes| PW["Try Playwright<br/>headless browser render"]
  PW --> DOM["DOM Snapshot"]
  PW --> CSS["Computed Style Snapshot"]
  PW --> AX["Basic Accessibility Tree"]
  PW --> VP["Viewport Metadata"]

  PW -->|failed or unavailable| FF["Fetch Fallback"]
  FF --> HTML["Fetched HTML"]

  B -->|no| SRC["Source Parser<br/>TSX / JSX / HTML / CSS / MDX / Vue / Svelte / Astro"]

  SRC --> AST["Source AST / Text Blocks"]
  SRC --> TW["Tailwind Class Inventory"]
  SRC --> MAP["Source Location Map"]

  DOM --> AI["AuditInput"]
  CSS --> AI
  AX --> AI
  VP --> AI
  HTML --> AI
  AST --> AI
  TW --> AI
  MAP --> AI
```

AuditInput의 목표는 “화면을 본 것처럼” 검사할 수 있는 중립 표현을 만드는 것이다.

```ts
type AuditInput = {
  target: {
    kind: "url" | "files" | "stdin";
    label: string;
  };

  rendered?: {
    html: string;
    text: string[];
    viewport: {
      width: number;
      height: number;
    };
    computedElements: ComputedElementSnapshot[];
    accessibilityHints: AccessibilityHint[];
  };

  source?: {
    files: SourceFile[];
    classNames: TailwindClassUsage[];
    literals: TextLiteral[];
    sourceMap: SourceLocationMap;
  };

  metadata: {
    createdAt: string;
    adapter: "playwright" | "fetch" | "source" | "stdin";
    warnings: string[];
  };
};
```

---

### P3 · Context Enrichment

P3는 UNSLOP의 핵심이다. 여기서 단순 lint가 아니라 **제품 증거 검사**로 바뀐다.

```mermaid
flowchart LR
  C["AuditConfig<br/>product, tasks, domain, tokens"] --> E["Evidence Index Builder"]
  A["AuditInput<br/>DOM, source, style, text"] --> E

  E --> T["Task Evidence<br/>CTA ↔ primary_tasks"]
  E --> D["Domain Evidence<br/>domain object present/missing"]
  E --> H["Hierarchy Evidence<br/>heading tree + card groups"]
  E --> K["Token Evidence<br/>known token vs arbitrary values"]
  E --> S["State Evidence<br/>loading/empty/error/disabled/success"]
  E --> V["Visual Evidence<br/>gradient/glow/orb/glass/card patterns"]

  T --> IDX["EvidenceIndex"]
  D --> IDX
  H --> IDX
  K --> IDX
  S --> IDX
  V --> IDX
```

EvidenceIndex 예시:

```ts
type EvidenceIndex = {
  product: {
    name?: string;
    primaryUser?: string;
    primaryTasks: string[];
    domainObjects: string[];
  };

  text: {
    headings: TextNodeEvidence[];
    ctas: TextNodeEvidence[];
    labels: TextNodeEvidence[];
    genericPhrases: TextNodeEvidence[];
  };

  visual: {
    gradients: VisualEvidence[];
    glows: VisualEvidence[];
    glassCards: VisualEvidence[];
    decorativeOrbs: VisualEvidence[];
  };

  hierarchy: {
    headingOrder: HeadingNode[];
    repeatedCardGroups: CardGroupEvidence[];
    primaryActionCount: number;
  };

  system: {
    tokenMatches: TokenEvidence[];
    tokenDrift: TokenDriftEvidence[];
    arbitraryValues: SourceEvidence[];
    rawHexColors: SourceEvidence[];
  };

  states: {
    loading: boolean;
    empty: boolean;
    error: boolean;
    disabled: boolean;
    success: boolean;
  };

  accessibility: {
    missingAlt: SourceEvidence[];
    iconButtonsWithoutLabel: SourceEvidence[];
    unlabeledInputs: SourceEvidence[];
    headingJumps: SourceEvidence[];
  };
};
```

---

### P4 · Parallel Signal Extraction

```mermaid
flowchart TB
  IDX["EvidenceIndex"] --> P4["P4 Parallel Extraction"]

  P4 --> C1["copy_signal.extract()"]
  P4 --> V1["visual_cliche.extract()"]
  P4 --> P1["product_specificity.extract()"]
  P4 --> H1["hierarchy.extract()"]
  P4 --> DS["design_system.extract()"]
  P4 --> A11Y["accessibility.extract()"]
  P4 --> ST["interaction_states.extract()"]
  P4 --> IMP["implementation.extract()"]

  C1 --> BUS["Signal[]"]
  V1 --> BUS
  P1 --> BUS
  H1 --> BUS
  DS --> BUS
  A11Y --> BUS
  ST --> BUS
  IMP --> BUS

  BUS --> P5["P5 Rule + Signature Engine"]
```

Signal은 아직 최종 finding이 아니다.
Signal은 “관찰된 증거”이고, Rule은 “그 증거가 제품 readiness를 얼마나 해치는지”를 판단한다.

```ts
type Signal = {
  id: string;
  family:
    | "copy_signal"
    | "visual_cliche"
    | "product_specificity"
    | "hierarchy"
    | "system_fit"
    | "accessibility"
    | "interaction_readiness"
    | "implementation";

  confidence: number;
  evidence: Evidence[];
  source?: SourceLocation;
};
```

---

### P5 · Rule & Signature Engine

UNSLOP의 rule engine은 단일 룰보다 **cluster signature**를 중요하게 봐야 한다.

```mermaid
flowchart TD
  SIG["Signal[]"] --> R1["Atomic Rules<br/>single issue detection"]
  SIG --> R2["Signature Rules<br/>multi-signal slop cluster"]
  SIG --> R3["Project Rules<br/>config-aware checks"]

  R1 --> F["Finding Candidates"]
  R2 --> F
  R3 --> F

  F --> SUP["Suppression Filter<br/>config ignore + inline ignore"]
  SUP --> DEDUPE["Dedupe + Merge Evidence"]
  DEDUPE --> SEV["Severity Calibration"]
  SEV --> OUT["Finding[]"]
```

Atomic rule 예시:

```ts
const genericCtaRule = {
  id: "generic-cta-get-started",
  family: "copy_signal",
  detect(ctx: RuleContext): Finding[] {
    return ctx.evidence.text.ctas
      .filter((cta) => /^(get started|learn more|start now)$/i.test(cta.text))
      .map((cta) => ({
        rule_id: "generic-cta-get-started",
        category: "copy_signal",
        severity: "medium",
        confidence: 0.82,
        message: "Generic CTA copy",
        reason:
          "The CTA does not describe what happens next or tie to a configured user task.",
        evidence: cta.text,
        source: cta.source,
        suggested_fix:
          "Replace the CTA with a concrete next action from product.primary_tasks.",
        fix_bucket: "safe",
      }));
  },
};
```

Signature rule 예시:

```ts
const genericAiSaasHeroCluster = {
  id: "generic-ai-saas-hero-cluster",
  family: "slop_signature",
  detect(ctx: RuleContext): Finding[] {
    const hasPurpleCyanGradient = ctx.hasSignal("visual.gradient.purple_cyan");
    const hasGlowOrOrb = ctx.hasAnySignal([
      "visual.decorative_orb",
      "visual.blur_glow",
    ]);
    const hasGlassCard = ctx.hasSignal("visual.glass_card");
    const hasGenericAiCopy = ctx.hasAnySignal([
      "copy.ai_powered_insights",
      "copy.unlock_potential",
    ]);
    const hasGenericCta = ctx.hasSignal("copy.generic_cta");
    const lacksDomainObject = ctx.hasSignal("product.domain_object_absence");

    const score = [
      hasPurpleCyanGradient,
      hasGlowOrOrb,
      hasGlassCard,
      hasGenericAiCopy,
      hasGenericCta,
      lacksDomainObject,
    ].filter(Boolean).length;

    if (score < 4) return [];

    return [
      {
        rule_id: "generic-ai-saas-hero-cluster",
        category: "product_specificity",
        severity: score >= 5 ? "high" : "medium",
        confidence: Math.min(0.95, 0.55 + score * 0.08),
        message: "Generic AI SaaS hero cluster",
        reason:
          "The hero combines common AI SaaS visual patterns with generic copy, but does not expose a product-specific user task.",
        evidence: ctx.collectEvidence([
          "visual.gradient.purple_cyan",
          "visual.decorative_orb",
          "visual.glass_card",
          "copy.ai_powered_insights",
          "copy.generic_cta",
          "product.domain_object_absence",
        ]),
        suggested_fix:
          "Replace the generic hero claim and CTA with a task-specific product action, then remove decorative visuals that do not support that action.",
        fix_bucket: "suggested",
      },
    ];
  },
};
```

---

### P6 · Score & Quality Gate

UNSLOP의 decision은 단순 점수가 아니라 **release decision**이어야 한다.

```mermaid
flowchart TD
  F["Finding[]"] --> AX["Axis Score Calculator"]
  AX --> DSS["Design Signal Score"]
  F --> BLOCK{"Blocking finding?"}
  DSS --> TH{"Score >= threshold?"}
  AX --> ATH{"Accessibility >= threshold?"}

  BLOCK -->|yes| B["Decision: block"]
  BLOCK -->|no| TH

  TH -->|no| R["Decision: revise"]
  TH -->|yes| ATH

  ATH -->|no| R
  ATH -->|yes| P["Decision: pass"]

  B --> OUT["AuditResult"]
  R --> OUT
  P --> OUT
```

Score axis:

```ts
type ScoreAxis =
  | "accessibility"
  | "system_fit"
  | "copy_signal"
  | "product_specificity"
  | "hierarchy"
  | "interaction_readiness"
  | "visual_intent";

type DesignSignalScore = {
  total: number;
  decision: "pass" | "revise" | "block";
  axes: Record<ScoreAxis, number>;
  thresholds: {
    design_signal: number;
    accessibility: number;
  };
};
```

권장 기본 가중치:

```yaml
score_weights:
  accessibility: 25
  system_fit: 20
  copy_signal: 20
  product_specificity: 15
  hierarchy: 10
  interaction_readiness: 5
  visual_intent: 5
```

---

### P7 · Fix Plan / Dispatch

```mermaid
flowchart LR
  F["Finding[]"] --> B{"Fix Bucket"}

  B --> SAFE["safe<br/>low-risk text/attribute fix"]
  B --> SUG["suggested<br/>layout/copy/system refactor plan"]
  B --> HR["human_review<br/>brand/product judgment required"]

  SAFE --> A1["Agent may patch<br/>with explicit --write later"]
  SUG --> A2["Agent may propose diff<br/>human confirms"]
  HR --> A3["Human reviewer decides<br/>approve, reject, suppress, revise"]

  A1 --> PLAN["fix-plan.md"]
  A2 --> PLAN
  A3 --> PLAN
```

Fix plan markdown 형식:

```md
# UNSLOP Fix Plan

## Decision

revise

## Priority 1 — Product Intent Recovery

- [HIGH] generic-ai-saas-hero-cluster
  - Evidence: `Unlock your potential with AI-powered insights`
  - Why: Hero does not expose a product-specific user task.
  - Fix: Replace headline with a configured task.
  - Bucket: suggested

## Priority 2 — Task-Specific CTA

- [MEDIUM] generic-cta-get-started
  - Evidence: `Get Started`
  - Fix: Use `Review 5 wrong answers`.
  - Bucket: safe

## Priority 3 — State Coverage

- [MEDIUM] missing-empty-error-state
  - Evidence: list/table exists, but no empty/error state found.
  - Fix: Add empty and error components.
  - Bucket: suggested

## Human Review

- Decorative visual direction
- Brand-level illustration style
```

---

### P8 · Persist / Report / Exit

```mermaid
flowchart TD
  AR["AuditResult"] --> J[".unslop/runs/{run_id}.audit.json"]
  AR --> M[".unslop/findings.md"]
  AR --> H[".unslop/report.html"]
  AR --> FP[".unslop/fix-plan.md"]
  AR --> RC[".unslop/context/agent-recovery.json"]

  AR --> T["Terminal Output"]
  AR --> CI{"CI Mode?"}
  AR --> AG{"Agent Mode?"}

  CI -->|pass| E0["exit 0"]
  CI -->|revise/block| E1["exit non-zero"]

  AG --> AJ["Strict JSON Decision"]
  AJ --> LOOP{"decision == pass?"}
  LOOP -->|yes| DONE["show / ship"]
  LOOP -->|no| RERUN["agent revises then reruns unslop"]
```

AuditResult schema 초안:

```ts
type AuditResult = {
  schema_version: "0.1.0";
  run_id: string;

  mode: "check" | "agent-check" | "plan" | "report";

  target: {
    kind: "url" | "files" | "stdin";
    label: string;
    adapter: "playwright" | "fetch" | "source" | "stdin";
  };

  decision: "pass" | "revise" | "block";

  scores: {
    design_signal: number;
    axes: Record<string, number>;
  };

  findings: Finding[];

  safe_fixes: FixCandidate[];
  suggested_fixes: FixCandidate[];
  human_review_required: Finding[];

  artifacts: {
    audit_json?: string;
    findings_md?: string;
    fix_plan_md?: string;
    html_report?: string;
    dom_snapshot?: string;
    style_snapshot?: string;
    agent_recovery?: string;
  };

  next_action:
    | "ship"
    | "revise"
    | "human_review"
    | "rerun_with_playwright"
    | "add_product_contract";
};
```

---

## 5. Agent Feedback Loop

UNSLOP은 AI agent가 만든 UI를 사용자가 보기 전에 막는 preflight layer가 되어야 한다.

```mermaid
sequenceDiagram
  autonumber

  participant Agent as AI Coding Agent
  participant App as Local App
  participant CLI as UNSLOP CLI
  participant Engine as Rule Engine
  participant Disk as .unslop Artifacts
  participant Human as Human Reviewer
  participant CI as CI Gate

  Agent->>App: generate or modify UI
  Agent->>CLI: unslop design check --url localhost --json --agent
  CLI->>App: render page / fetch source
  CLI->>Engine: build AuditInput + EvidenceIndex
  Engine->>Engine: extract signals
  Engine->>Engine: evaluate rules + clusters
  Engine->>CLI: AuditResult
  CLI->>Disk: write audit.json + recovery packet
  CLI-->>Agent: decision: pass / revise / block

  alt pass
    Agent->>CI: continue build or PR
    CI->>CLI: unslop design check --ci
    CLI-->>CI: exit 0
  else revise
    Agent->>Disk: read fix-plan.md + agent-recovery.json
    Agent->>App: apply safe/suggested fixes
    Agent->>CLI: rerun same check
  else block
    CLI-->>Human: human_review_required
    Human->>Disk: approve fix or add suppression with reason
    Agent->>CLI: rerun after human decision
  end
```

---

## 6. Context Compaction & Recovery

참조 이미지의 오른쪽 “Context Compaction & Recovery”는 UNSLOP에서도 중요하다. Agent가 여러 번 UI를 수정하면 대화 컨텍스트는 압축되거나 유실된다. 그래서 UNSLOP은 매번 **복구 가능한 최소 문맥**을 파일로 남겨야 한다.

```mermaid
flowchart TD
  LONG["Long Agent Loop<br/>UI generated, checked, revised repeatedly"]
  RISK["Risk<br/>agent forgets product intent, target route, prior findings"]
  PACKET["agent-recovery.json<br/>compact source of truth"]
  READ["Agent reads packet after compaction"]
  REHYDRATE["Rehydrate Prompt<br/>target + product contract + unresolved findings"]
  CHECK["Rerun unslop<br/>same contract, new output"]

  LONG --> RISK --> PACKET --> READ --> REHYDRATE --> CHECK
```

`agent-recovery.json` 예시:

```json
{
  "schema_version": "0.1.0",
  "run_id": "2026-06-07T04-23-45Z",
  "target": {
    "kind": "url",
    "label": "http://localhost:3000"
  },
  "decision": "revise",
  "scores": {
    "design_signal": 62,
    "axes": {
      "copy_signal": 45,
      "product_specificity": 40,
      "accessibility": 88,
      "system_fit": 70,
      "hierarchy": 58,
      "interaction_readiness": 50,
      "visual_intent": 42
    }
  },
  "product_contract": {
    "name": "DOTORE TOPIK",
    "primary_user": "TOPIK learners",
    "primary_tasks": [
      "solve TOPIK questions",
      "review wrong answers",
      "track vocabulary mistakes"
    ],
    "domain_objects": [
      "question",
      "wrong answer",
      "vocabulary",
      "mock test",
      "score report"
    ]
  },
  "unresolved_findings": [
    {
      "rule_id": "generic-ai-saas-hero-cluster",
      "severity": "high",
      "fix_bucket": "suggested",
      "message": "Generic AI SaaS hero cluster",
      "required_change": "Replace generic hero copy with a product-specific task."
    },
    {
      "rule_id": "generic-cta-get-started",
      "severity": "medium",
      "fix_bucket": "safe",
      "message": "Generic CTA copy",
      "required_change": "Replace CTA with a concrete next action."
    }
  ],
  "safe_fixes": [
    {
      "target": "src/app/page.tsx",
      "before": "Get Started",
      "after_suggestion": "Review 5 wrong answers"
    }
  ],
  "human_review_required": [],
  "rerun_command": "unslop design check --url http://localhost:3000 --json --agent"
}
```

---

## 7. Rule Families

README의 MVP rule 방향과 맞춰, rule family는 다음처럼 유지한다. 현재 README도 MVP rules로 generic AI SaaS visual language, card soup, generic copy, design-system drift, accessibility basics, missing interaction states를 명시하고 있습니다. ([GitHub][1])

```mermaid
mindmap
  root((UNSLOP Rules))
    Visual Cliche
      generic-ai-saas-hero
      decorative-orb
      purple-cyan-gradient
      glass-card
      glow-overuse
    Copy Signal
      generic-cta-get-started
      buzzword-unlock-potential
      ai-powered-insights
      taskless-headline
    Product Specificity
      domain-object-absence
      fake-dashboard-labels
      taskless-metric-card
    Hierarchy
      card-soup
      weak-primary-action
      heading-order-drift
      equal-weight-sections
    Design System
      arbitrary-tailwind-values
      raw-hex-colors
      radius-drift
      shadow-drift
      spacing-off-scale
    Accessibility
      image-missing-alt
      icon-button-missing-label
      unlabeled-input
      heading-jump
    Interaction Readiness
      missing-loading-state
      missing-empty-state
      missing-error-state
      missing-disabled-state
      missing-success-state
    Implementation
      div-soup
      semantic-region-missing
      repeated-component-duplication
```

---

## 8. Finding Object

Finding은 “경고 문장”이 아니라 사람과 agent가 함께 읽는 작업 단위다.

```ts
type Finding = {
  id: string;
  rule_id: string;

  category:
    | "visual_intent"
    | "copy_signal"
    | "product_specificity"
    | "hierarchy"
    | "system_fit"
    | "accessibility"
    | "interaction_readiness"
    | "implementation";

  severity: "low" | "medium" | "high" | "blocking";
  confidence: number;

  message: string;
  reason: string;

  evidence: Evidence[];

  source?: {
    file?: string;
    line?: number;
    column?: number;
    selector?: string;
    text?: string;
  };

  suggested_fix: string;

  fix_bucket: "safe" | "suggested" | "human_review";

  suppression?: {
    suppressible: boolean;
    inline_hint?: string;
    config_hint?: string;
  };
};
```

좋은 finding 예시:

```json
{
  "id": "finding_001",
  "rule_id": "generic-ai-saas-hero-cluster",
  "category": "product_specificity",
  "severity": "high",
  "confidence": 0.91,
  "message": "Generic AI SaaS hero cluster",
  "reason": "The hero combines a purple/cyan gradient, decorative glow, generic AI claim, and taskless CTA, but does not expose a configured product task.",
  "evidence": [
    {
      "kind": "class",
      "value": "bg-gradient-to-br from-purple-600 to-cyan-400"
    },
    {
      "kind": "text",
      "value": "Unlock your potential with AI-powered insights"
    },
    {
      "kind": "cta",
      "value": "Get Started"
    }
  ],
  "source": {
    "file": "src/app/page.tsx",
    "line": 12
  },
  "suggested_fix": "Replace the hero with a product-specific task such as 'Review the TOPIK questions you missed this week' and use a concrete CTA such as 'Review 5 wrong answers'.",
  "fix_bucket": "suggested"
}
```

---

## 9. Decision State Machine

```mermaid
stateDiagram-v2
  [*] --> Intake
  Intake --> RenderParse
  RenderParse --> EnrichContext
  EnrichContext --> ExtractSignals
  ExtractSignals --> EvaluateRules
  EvaluateRules --> ScoreGate

  ScoreGate --> Pass: no blockers<br/>score >= threshold
  ScoreGate --> Revise: score below threshold<br/>or high/medium findings
  ScoreGate --> Block: blocking finding<br/>or human review required

  Revise --> AgentFix: safe/suggested fixes exist
  AgentFix --> Intake: rerun

  Block --> HumanReview
  HumanReview --> SuppressWithReason: approved exception
  HumanReview --> ManualFix: product/brand decision
  SuppressWithReason --> Intake
  ManualFix --> Intake

  Pass --> ShipOrPR
  ShipOrPR --> [*]
```

---

## 10. 파일 시스템 레이아웃

참조 이미지의 왼쪽 “Disk Persistent Artifacts”를 UNSLOP에서는 이렇게 잡는다.

```txt
project-root/
  unslop.design.yml

  .unslop/
    profile.json
    context/
      agent-recovery.json
      last-check.md
    runs/
      2026-06-07T04-23-45Z.audit.json
      2026-06-07T04-23-45Z.agent.json
    snapshots/
      2026-06-07T04-23-45Z.dom.html
      2026-06-07T04-23-45Z.styles.json
      2026-06-07T04-23-45Z.a11y.json
    reports/
      2026-06-07T04-23-45Z.report.html
    plans/
      2026-06-07T04-23-45Z.fix-plan.md
    findings/
      2026-06-07T04-23-45Z.findings.md

  examples/
    fixtures/
      slop/
        generic-ai-saas-hero.tsx
        card-soup-dashboard.tsx
      pass/
        product-specific-topik-dashboard.tsx
```

---

## 11. CLI Surface와 레이어 매핑

현재 README에는 `design check`, `design plan`, `design fix`, `design report`, `design agent-check` 흐름이 제시되어 있고, CI mode와 agent mode도 명시되어 있습니다. ([GitHub][1])

```mermaid
flowchart LR
  INIT["unslop design init"] --> L0["L0 Contract"]
  CHECK["unslop design check"] --> L1["L1 Intake"] --> L8["L8 Output"]
  PLAN["unslop design plan"] --> P7["P7 Fix Plan"]
  FIX["unslop design fix --safe"] --> P7
  REPORT["unslop design report"] --> P8["P8 Report"]
  AGENT["unslop design agent-check --json"] --> LOOP["Agent Revise Loop"]
  CI["unslop design check --ci"] --> GATE["Quality Gate Exit Code"]
```

권장 명령:

```bash
# local URL
unslop design check --url http://localhost:3000

# source files
unslop design check "src/**/*.tsx"

# strict JSON for agents
unslop design check --url http://localhost:3000 --json --agent

# CI gate
unslop design check --url http://localhost:3000 --threshold 75 --accessibility-threshold 85 --ci

# review handoff
unslop design report --url http://localhost:3000 -o .unslop/reports/latest.html

# grouped fix plan
unslop design plan --url http://localhost:3000 --product "TOPIK learning app"
```

---

## 12. MVP에서 반드시 보여줘야 하는 흐름

```mermaid
flowchart TD
  BEFORE["AI-generated UI<br/>polished but generic"] --> CHECK["unslop design check"]
  CHECK --> FIND["Findings<br/>generic hero, taskless CTA, token drift, missing states"]
  FIND --> SCORE["Design Signal Score<br/>62 / 100"]
  SCORE --> DECISION["Decision: revise"]
  DECISION --> PLAN["Fix Plan<br/>recover product intent first"]
  PLAN --> AFTER["Product-ready direction<br/>task-specific headline + CTA + states"]
  AFTER --> RERUN["rerun unslop"]
  RERUN --> PASS{"pass?"}
  PASS -->|yes| SHIP["show user / PR / deploy"]
  PASS -->|no| PLAN
```

Before:

```tsx
<main className="bg-gradient-to-br from-purple-600 to-cyan-400">
  <div className="absolute rounded-full blur-3xl" />
  <h1>Unlock your potential with AI-powered insights</h1>
  <button>Get Started</button>
</main>
```

After direction:

```tsx
<main className="bg-surface text-foreground">
  <h1>Review the TOPIK questions you missed this week</h1>
  <button>Review 5 wrong answers</button>
</main>
```

이 데모의 메시지는 “예쁜 효과를 제거했다”가 아니다.

```txt
generic polish를 제거했다.
taskless copy를 사용자 과업으로 바꿨다.
장식 중심 화면을 제품 플로우로 되돌렸다.
```

---

## 13. 참조 이미지와 1:1 대응되는 구조

| 참조 이미지 요소               | UNSLOP 대응                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Context Artifacts       | `unslop.design.yml`, `.unslop/runs`, `.unslop/snapshots`, `.unslop/reports`, fixtures |
| Manager-Orchestrator    | `unslop design check` runtime orchestrator                                            |
| Hooks                   | config validation, adapter fallback, suppression, threshold gate, CI exit             |
| Skills                  | browser adapter, source parser, extractors, rules, scorers, reporters                 |
| Specialist Agent        | frontend agent, copy agent, design-system agent, human reviewer                       |
| P1~P8 Phases            | Init, Intake, Render/Parse, Enrich, Extract, Evaluate, Gate, Report                   |
| Parallel Implementation | parallel signal extractors                                                            |
| QA Feedback Loop        | agent revise loop + human review + rerun                                              |
| Context Compaction      | `agent-recovery.json`                                                                 |
| Dispatch back to P4     | revise 후 같은 target으로 재검사                                                              |

---

## 최종 방향

UNSLOP의 레이어는 이렇게 정의하면 명확합니다.

```txt
UNSLOP = Product Intent Contract
       + Rendered/Source Evidence
       + Parallel Design Signals
       + Deterministic Rule Clusters
       + Product Readiness Score
       + Agent/Human Fix Loop
       + Persistent Recovery Artifacts
```

이 구조로 가면 “AI SLOP 느낌을 없앤다”가 아니라,

> AI가 만든 그럴듯한 화면에서
> 제품 의도, 사용자 과업, 도메인 객체, 상태, 접근성, 디자인 시스템 근거가 비어 있는 지점을 찾아
> 사람과 agent가 반복 수정할 수 있는 품질 게이트로 만든다.

가 된다.

이 문서는 `docs/architecture/unslop-layers.md` 기준 문서로 사용한다. README에는 첫 번째 Mermaid를 축약한 compact diagram을 두고, docs에는 full diagram과 phase별 상세 설계를 유지한다.

[1]: https://github.com/sunseol/unslop "GitHub - sunseol/unslop: CLI-first design quality gate for AI-generated interfaces. · GitHub"
