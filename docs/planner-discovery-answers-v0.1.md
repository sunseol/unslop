좋아. 이 질문들은 “무엇을 만들까?”보다 **무엇을 만들지 않을지, 무엇을 통과 기준으로 삼을지, 사용자가 언제 신뢰할지**를 정하기 위한 discovery 질문이니까, 답변도 바로 개발 착수 가능한 **v0.1 결정안**으로 잡겠습니다. 업로드된 질문지의 목적도 MVP 범위에 들어가는 답은 acceptance criteria로 바꿀 수 있어야 한다는 점을 강조하고 있습니다. 

# unslop v0.1 기획 답변안

## 1. 제품 정체성

**unslop의 가장 짧은 제품 정의**

> `unslop`은 AI가 만든 UI, 카피, 디자인 초안을 제품 수준으로 끌어올리는 CLI-first design quality gate다.

더 짧게는:

> **AI made it look polished. unslop makes it product-ready.**

**AI slop 제거를 어떻게 설명할 것인가**

“AI가 쓴 티를 숨긴다”가 아닙니다.
공식 설명은 이렇게 가야 합니다.

> unslop은 AI 생성 여부를 판별하지 않는다. 대신 결과물이 구체적이고, 접근 가능하고, 디자인 시스템에 맞고, 실제 제품 맥락을 반영하는지 검사한다.

**unslop은 무엇인가**

우선순위는 이렇습니다.

1. **Design quality gate**
2. **CLI linter**
3. **AI agent preflight checker**
4. 리뷰어 보조 도구

AI 탐지기는 아닙니다.

**공식 철학**

사용해도 좋습니다.

> **Don’t detect AI. Restore design intent.**

다만 README에서는 한 문장을 더 붙이는 게 좋습니다.

> AI detection is unreliable. Design quality is inspectable.

**사용자가 처음 봤을 때 이해해야 하는 한 가지**

> AI가 만든 예쁜 화면이 실제 제품 화면으로 쓸 수 있는지 검사해준다.

**unslop이 평가하지 않는 것**

* “이 디자인이 예쁜가?”
* “이게 AI가 만든 것인가?”
* “이 브랜드가 맞는가?” — 설정 파일이 없으면 제한적으로만 판단
* “비즈니스 전략이 맞는가?”
* “최종 디자이너 승인 여부”

**피해야 할 표현**

* “AI detector”
* “humanizer”
* “AI 티 제거”
* “좋은 디자인/나쁜 디자인 판정”
* “취향을 객관적으로 평가”
* “자동으로 프로 디자이너 수준으로 개선”

**unslop이 틀렸을 때 설명 방식**

finding마다 반드시 이렇게 말해야 합니다.

```text
무엇을 발견했는가
왜 문제가 될 수 있는가
어떤 근거로 판단했는가
자동 확신도는 어느 정도인가
무시하려면 어떻게 suppress 하는가
```

**절대 양보하지 않을 차별점**

> AI origin이 아니라 product readiness를 본다.

기존 AI detector나 humanizer와 다르게, `unslop`은 “누가 만들었는지”가 아니라 “실제 제품으로 검토 가능한지”를 봅니다.

**시작 포지션**

개발자 도구로 시작합니다.
정확히는:

> AI로 웹 UI를 만드는 프론트엔드 개발자, 1인 창업자, PM형 빌더를 위한 CLI.

디자이너 도구와 Figma plugin은 v0.4 이후입니다.

---

## 2. 타깃 사용자

**MVP 1차 사용자**

> v0, Lovable, Bolt, Cursor, Claude Code, Replit Agent 등으로 웹 UI를 만든 뒤, 배포 전에 품질을 확인하려는 프론트엔드 개발자/1인 창업자.

**가장 가까운 직무**

1순위: 프론트엔드 개발자
2순위: 창업자/PM형 빌더
3순위: AI coding agent 운영자
4순위: 제품 디자이너

**사용자가 쓰는 도구**

우선 지원 워크플로:

1. Cursor / Claude Code / Codex로 만든 React/Tailwind UI
2. v0 / Lovable / Bolt로 생성한 랜딩페이지
3. 로컬 개발 서버
4. 나중에 Figma Make / Figma MCP

**사용 맥락**

MVP에서는 개인 또는 소규모 팀의 로컬 검사 중심입니다.

```bash
unslop design check --url http://localhost:3000
```

팀 CI는 v0.2부터 강화합니다.

**가장 자연스러운 실행 순간**

* AI가 UI를 생성한 직후
* PR 올리기 전
* 랜딩페이지 배포 전
* 디자이너에게 보여주기 전
* AI agent가 최종 결과를 사용자에게 보여주기 전

**사용자가 가장 두려워하는 실패**

* 화면은 예쁜데 너무 흔한 AI SaaS 템플릿처럼 보임
* 배포 후 접근성/반응형/카피 문제가 드러남
* 디자이너가 “이건 그냥 AI가 만든 초안이잖아요”라고 판단함
* 실제 제품 맥락이 없어서 사용자가 뭘 해야 할지 모름

**사용자가 유용하다고 판단하는 결과**

첫 실행 후 3분 안에 아래를 얻어야 합니다.

```text
이 화면이 왜 AI slop처럼 보이는지
무엇부터 고치면 되는지
자동으로 고쳐도 되는 것과 사람이 봐야 하는 것이 무엇인지
```

**초기에 만족시키지 않을 사용자**

* 전문 브랜드 디자이너의 고급 visual direction 평가
* 대형 디자인 시스템 조직
* Figma-only 디자이너
* 모바일 네이티브 앱 디자이너
* 광고 배너/포스터/영상 디자인 사용자

---

## 3. 대표 사용 시나리오

**MVP 핵심 use case**

> AI가 만든 랜딩페이지 또는 대시보드 UI를 배포 전 검사한다.

이 하나로 충분합니다.

**랜딩페이지와 대시보드 우선순위**

v0.1에서는 랜딩페이지가 1순위입니다.
대시보드는 1.5순위입니다.

이유:

* 랜딩페이지는 visual cliché, generic copy, CTA 문제를 보여주기 좋음
* 대시보드는 fake metrics, card soup, 정보 구조 문제를 보여주기 좋음
* 둘 다 같은 룰 엔진으로 상당 부분 커버 가능

**사용자 입력**

v0.1 공식 입력 우선순위:

1. `--url http://localhost:3000`
2. 로컬 HTML/CSS/TSX 파일 또는 glob
3. `unslop.design.yml`
4. Playwright가 캡처한 screenshot
5. 사용자 제공 screenshot은 v0.2
6. Figma는 v0.4

**결과 소비 방식**

v0.1:

* 터미널 출력
* JSON 출력
* CI exit code

v0.2:

* HTML report
* screenshot 포함 리포트

v0.3:

* GitHub Action / PR comment

**디자인 리뷰 회의 산출물**

v0.2부터 HTML report가 필요합니다.

```text
화면 캡처
점수
finding 목록
safe fix
suggested fix
human review required
```

**AI agent용 JSON contract**

v0.1부터 최소 지원합니다.

```json
{
  "decision": "pass | revise | block",
  "scores": {},
  "findings": [],
  "safe_fixes": [],
  "human_review_required": []
}
```

---

## 4. MVP 범위

## v0.1에서 반드시 되는 명령어

```bash
unslop design check --url http://localhost:3000
unslop design check "src/**/*.tsx"
unslop design check --url http://localhost:3000 --json
unslop design init
```

`agent-check`는 v0.1에서 별도 명령으로 만들기보다, 우선은 아래처럼 처리합니다.

```bash
unslop design check --url http://localhost:3000 --json --agent
```

v0.2에서 정식 명령으로 분리합니다.

```bash
unslop design agent-check --json
```

**`unslop design check <file>`은 MVP 필수인가**

필수입니다.
단, v0.1의 `<file>`은 이미지 파일이 아니라 HTML/TSX/CSS/MDX 중심입니다.

**URL 검사는 HTML fetch만으로 충분한가**

아닙니다.
디자인 품질을 보려면 computed style, 실제 DOM, viewport, contrast, heading order, responsive 구조가 필요합니다. 따라서 v0.1부터 browser-rendered URL 분석을 넣는 쪽이 맞습니다.

결정:

> v0.1 URL 검사는 Playwright 기반 browser render를 사용한다. 단, Playwright adapter는 optional package로 분리 가능한 구조로 설계한다.

**스크린샷 분석은 MVP인가**

사용자 제공 screenshot 분석은 v0.1에서 제외합니다.
다만 URL 검사 과정에서 브라우저가 캡처한 screenshot은 내부적으로 사용하거나 v0.2 report에 넣을 수 있습니다.

**Figma adapter**

v0.1 제외.
v0.4로 미룹니다.

**`fix --write` 자동 수정**

v0.1 제외.
자동 수정은 신뢰 리스크가 큽니다.

v0.1에서는:

```bash
check 결과에 suggested_fix만 제공
```

v0.2에서:

```bash
unslop design plan
```

v0.3 이후:

```bash
unslop design fix --safe
```

단, `--write` 없이는 절대 파일을 수정하지 않는 정책을 고정합니다.

**v0.1에서 절대 넣지 않을 기능**

* Figma adapter
* Figma plugin
* VS Code extension
* 외부 vision API
* 자동 디자인 수정
* 브랜드 profile 생성
* telemetry
* SaaS dashboard
* GitHub Action full integration
* 복잡한 AI rewrite

---

## 5. 입력과 어댑터

**입력 타입 순서**

1. URL: localhost 중심
2. React/Tailwind/HTML/CSS 파일
3. config: `unslop.design.yml`
4. Playwright screenshot
5. 사용자 screenshot
6. Figma file
7. MCP agent context

**로컬 파일 지원**

v0.1에서 공식 지원:

```bash
unslop design check src/app/page.tsx
unslop design check "src/**/*.tsx"
unslop design check index.html
```

디렉터리 입력은 glob로 변환해서 처리합니다.

**URL 입력**

v0.1은 localhost를 1급 지원합니다.

```bash
http://localhost:3000
http://127.0.0.1:5173
```

공개 URL도 지원은 하되, 기본 메시지는 “localhost-first”로 갑니다.

**JavaScript 실행 DOM 필요 여부**

필요합니다.
AI-generated UI는 CSR/Next.js/Vite 환경에서 만들어지는 경우가 많으므로 HTML fetch만으로는 실제 화면을 보기 어렵습니다.

**Playwright 도입 시점**

v0.1부터 도입합니다.
다만 core와 분리합니다.

```text
@unslop/core
@unslop/cli
@unslop/browser
```

**이미지 분석**

v0.1에서는 외부 vision model을 쓰지 않습니다.
기본값은 local-only입니다.

v0.2 이후 선택지:

```bash
unslop design check screenshot.png --vision openai
unslop design check screenshot.png --vision local
```

하지만 기본값은 계속 외부 전송 없음입니다.

**Figma 입력**

순서:

1. REST API
2. Plugin
3. MCP agent

REST API가 가장 먼저입니다. Plugin은 UI 개발 부담이 큽니다.

**디자인 토큰 입력**

우선순위:

1. `unslop.design.yml`
2. Tailwind config 자동 감지
3. Style Dictionary JSON
4. 일반 tokens JSON/YAML

**설정 파일이 없을 때**

generic anti-slop defaults를 적용합니다.
단, brand fit 점수는 강하게 평가하지 않습니다.

---

## 6. 출력과 리포트

**기본 터미널 출력 필수 정보**

```text
대상
Design Signal Score
decision
핵심 finding 5개
blocking issue
safe/suggested/human_review fix bucket
다음 액션
```

예시:

```text
Design Signal Score: 62/100
Decision: revise
AI Slop Risk: High

Top findings:
1. Generic SaaS hero pattern
2. CTA copy is not task-specific
3. 8 non-token colors detected
4. Text contrast fails on secondary card
5. No empty/error/loading state found

Next:
  unslop design check --json
  unslop design plan --url http://localhost:3000
```

**점수**

단일 점수와 축별 점수 둘 다 필요합니다.

메인:

```text
Design Signal Score
```

보조:

```text
AI Slop Risk
Product Readiness
```

**AI Slop Risk 표현**

계속 사용하되 메인 점수명으로 쓰지는 않습니다.

공식 구조:

```text
Design Signal Score: 62/100
AI Slop Risk: High
Product Readiness: Needs revision
```

**Product Readiness 기준**

```text
Ready
Needs revision
Not ready
Blocked
```

**finding 필수 필드**

```json
{
  "id": "generic-cta-001",
  "rule_id": "copy.generic_cta",
  "category": "copy_signal",
  "severity": "medium",
  "confidence": 0.82,
  "target": {
    "type": "dom",
    "selector": "main section.hero a.primary"
  },
  "message": "Primary CTA is generic.",
  "evidence": "Get Started",
  "reason": "The CTA does not explain what happens next.",
  "suggested_fix": "Replace with a task-specific CTA.",
  "fix_bucket": "suggested"
}
```

**severity**

세 단계로는 부족합니다.
v0.1부터 네 단계가 좋습니다.

```text
low
medium
high
blocking
```

**fix bucket**

세 단계면 충분합니다.

```text
safe
suggested
human_review
```

**JSON schema version**

필수입니다.

```json
{
  "schema_version": "0.1.0"
}
```

**CI exit code 1 조건**

`--ci`일 때만 엄격하게 실패시킵니다.

```text
blocking finding >= 1
또는 Design Signal Score < threshold
또는 Accessibility Score < accessibility threshold
또는 --fail-on-high 옵션에서 high finding >= 1
```

기본 threshold:

```text
design_signal: 75
accessibility: 85
```

**false positive 억제**

필수입니다.

설정 파일:

```yaml
ignore:
  - rule_id: visual.generic_gradient
    target: ".brand-hero"
    reason: "Brand campaign uses this gradient intentionally."
```

코드 주석:

```tsx
// unslop-ignore-next-line copy.generic_cta -- temporary launch CTA
```

---

## 7. 점수 체계

**공식 점수명**

확정:

```text
Design Signal Score
```

**100점 만점**

적절합니다.
이해가 쉽고 CI threshold로 쓰기 좋습니다.

**계산 방식**

감점식 + 가중 평균 혼합이 좋습니다.

기본은 축별 가중 평균:

```text
Accessibility: 25%
System Fit: 20%
Copy Signal: 20%
Product Specificity: 15%
Hierarchy: 10%
Interaction Readiness: 5%
Visual Intent: 5%
```

단, blocking issue는 전체 점수와 별개로 decision을 `block`으로 만들 수 있습니다.

**MVP 필수 점수 축**

v0.1에서는 이 5개만 공식 노출합니다.

```text
Accessibility
System Fit
Copy Signal
Product Specificity
Hierarchy
```

나머지는 내부 finding category로 둡니다.

**Visual Intent**

deterministic rule만으로 완전 평가하지 않습니다.
v0.1에서는 “visual cliché combination” 정도만 낮은 confidence로 판단합니다.

**Product Specificity**

설정 파일이 없으면 약하게 평가합니다.

설정 파일이 있을 때:

```yaml
product:
  name: "DOTORE TOPIK"
  primary_user: "TOPIK learners"
  primary_tasks:
    - solve questions
    - review wrong answers
```

이 정보가 있으면 copy와 dashboard label이 제품 맥락에 맞는지 더 강하게 봅니다.

**Accessibility**

v0.1 최소 반영:

* contrast
* heading order
* accessible name
* focusable element label
* button/link text
* color-only state warning

**System Fit**

토큰 설정이 없을 때도 평가합니다.
단, “토큰 이탈”이 아니라 “일관성 이탈”로 봅니다.

예:

```text
13px, 17px, 19px, 23px spacing이 난립함
radius 값이 7개 이상 등장함
hex color가 18개 이상 등장함
```

**pass/fail 원칙**

* 점수가 낮아도 blocking issue가 없으면 local mode에서는 `revise`
* CI mode에서는 threshold 미달 시 fail
* 점수가 높아도 blocking issue가 있으면 `block`

---

## 8. 룰 설계

**v0.1 필수 룰 패밀리**

1. Accessibility
2. Generic UI copy
3. Design system drift
4. Visual cliché combination
5. Product specificity
6. Layout hierarchy
7. Missing interaction states
8. React/Tailwind implementation slop

**visual cliché high severity 조건**

단일 스타일은 high가 아닙니다.

보라/시안 그라디언트 자체는 문제가 아닙니다.
다음 조합일 때만 high로 봅니다.

```text
purple/cyan gradient
+ glow
+ glass card
+ generic SaaS headline
+ floating dashboard/mockup
+ generic CTA
```

즉, 색상이 아니라 **맥락 없는 고빈도 조합**이 문제입니다.

**glassmorphism 허용 조건**

허용:

* 브랜드 시스템에 정의됨
* contrast 기준 통과
* 실제 레이어 구조를 설명함
* 과하지 않음
* mobile에서 읽힘

문제:

* 단순 장식
* 텍스트 가독성 저하
* 모든 카드에 반복
* 의미 없는 blur/glow 조합

**card soup 판정 기준**

v0.1 휴리스틱:

```text
첫 viewport에 유사한 card container가 5개 이상
그리고 primary action이 명확하지 않음
그리고 card 간 visual hierarchy 차이가 작음
```

**generic CTA 언어**

영어와 한국어를 v0.1부터 같이 넣습니다.

영어:

```text
Get Started
Learn More
Unlock Potential
Boost Productivity
Start Your Journey
```

한국어:

```text
시작하기
자세히 알아보기
더 알아보기
지금 시작하세요
경험해보세요
```

**fake dashboard label**

초기 목록:

```text
Total Revenue
User Growth
Engagement
Performance
Analytics
Conversion Rate
Active Users
Insights
```

한국어:

```text
사용자 증가
성과 지표
인사이트
분석 결과
참여도
전환율
```

단, 실제 SaaS analytics 제품이면 allowlist 가능해야 합니다.

**missing UI states 판정**

URL만으로는 완전히 알기 어렵습니다.
v0.1에서는 confidence를 낮게 둡니다.

근거:

* 코드에 `loading`, `error`, `empty`, `disabled`, `skeleton`, `fallback` 등이 없음
* form/input이 있는데 validation/error copy 없음
* data list/table이 있는데 empty state 없음
* async fetch가 있는데 loading state 없음

**Tailwind arbitrary value**

무조건 문제는 아닙니다.

문제:

```text
text-[17px]
p-[23px]
rounded-[19px]
bg-[#8B5CF6]
shadow-[0_0_40px...]
```

이런 값이 반복되거나 토큰 없이 난립할 때.

허용:

* one-off chart
* third-party embed
* brand token으로 등록된 값
* allowlist에 있는 값

**raw hex color 허용**

허용:

* token source
* chart palette
* imported brand color
* logo/asset 관련 값

경고:

* component 내부에 직접 박힌 hex
* 같은 색상이 여러 파일에 중복
* token 없이 임의 색상이 과도하게 많음

**룰별 fixture**

필수입니다.

```text
fixtures/rules/copy-generic-cta/pass
fixtures/rules/copy-generic-cta/fail
fixtures/rules/visual-saas-cliche/pass
fixtures/rules/visual-saas-cliche/fail
```

---

## 9. 디자인 시스템과 브랜드 설정

**`unslop.design.yml`**

선택입니다.
없어도 작동해야 합니다.

**설정 파일 없을 때**

generic defaults 적용:

```yaml
spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64]
radius: [0, 4, 8, 12, 16, 24]
typography: [12, 14, 16, 18, 20, 24, 32, 40, 48]
```

**product fields 영향**

```yaml
product.name
product.type
product.primary_user
product.primary_tasks
```

이 값들은 다음 룰에 영향을 줍니다.

* Product Specificity
* Generic dashboard label
* CTA specificity
* Empty state copy
* Fake content detection

**brand tone 반영**

v0.1에서는 copy rule에만 반영합니다.

예:

```yaml
brand:
  tone:
    - calm
    - practical
  avoid_copy:
    - "혁신적인"
    - "AI-powered insights"
```

**avoid_visuals**

v0.1에서는 문자열/패턴 매칭 중심입니다.

```yaml
avoid_visuals:
  - neon glow
  - purple cyan gradient
  - glassmorphism
```

browser adapter에서는 CSS 속성 조합으로 일부 추정합니다.

**avoid_copy**

부분 일치 허용.
단, false positive 방지를 위해 finding confidence를 표시합니다.

**Tailwind config 자동 읽기**

v0.1에서 지원하면 강력합니다.
가능하면 넣습니다.

우선순위:

```text
tailwind.config.ts
tailwind.config.js
tailwind.config.mjs
```

**디자인 시스템 없는 프로젝트도 좋은 점수 가능 여부**

가능해야 합니다.

다만 System Fit 점수는 “토큰 준수”가 아니라 “일관성”으로 평가합니다.

---

## 10. CLI UX

**최상위 명령**

유지합니다.

```bash
unslop design
```

텍스트 전용은 나중에:

```bash
unslop copy
```

하지만 v0.1에서는 UI copy가 `unslop design` 안에 포함됩니다.

**명령 역할**

```bash
unslop design init      # config 생성
unslop design check     # 검사
unslop design plan      # v0.2, 수정 계획
unslop design report    # v0.2, HTML report
unslop design fix       # v0.3+, safe fix
unslop design agent-check # v0.2+, agent 전용
```

**자동 수정 정책**

확정:

> `--write` 없이 파일 수정 금지.

v0.1에서는 아예 `fix --write` 없음.

**threshold**

우선순위:

1. CLI 인자
2. `unslop.design.yml`
3. 기본값

기본값:

```yaml
thresholds:
  design_signal: 75
  accessibility: 85
```

**`--json` schema**

모든 명령에서 같은 top-level 구조를 사용합니다.

**`--ci` 동작**

* 출력 짧게
* exit code 엄격 적용
* 원문 evidence truncate
* JSON/terminal 모두 안정적
* suppress 설정 반영

**`--product` 인자**

임시 제품 맥락입니다.

예:

```bash
unslop design check --url http://localhost:3000 --product "TOPIK learning app"
```

config 파일보다 우선순위는 낮게 둡니다.

**오류 메시지**

짧지만 다음 액션을 포함합니다.

나쁜 예:

```text
Failed to parse config.
```

좋은 예:

```text
Could not parse unslop.design.yml at line 12.
Run `unslop design init --print` to see a valid example.
```

**첫 실행 도움말**

가장 먼저 보여줄 예제:

```bash
unslop design check --url http://localhost:3000
```

---

## 11. 에이전트 워크플로

**agent mode 1차 소비자**

AI coding agent입니다.

예:

* Cursor agent
* Claude Code
* Codex
* custom MCP agent
* design/code generation agent

**JSON 필수 필드**

```json
{
  "schema_version": "0.1.0",
  "target": {},
  "decision": "pass",
  "scores": {},
  "findings": [],
  "safe_fixes": [],
  "suggested_fixes": [],
  "human_review_required": [],
  "next_action": "revise"
}
```

**decision 값**

세 개면 충분합니다.

```text
pass
revise
block
```

의미:

```text
pass: 사용자에게 보여줘도 됨
revise: 에이전트가 한 번 더 고쳐야 함
block: 사람 검토 없이는 진행 금지
```

**에이전트 자동 적용 가능한 safe fix**

v0.1에서는 적용하지 않고 제안만 합니다.

v0.3 이후 safe fix 후보:

* generic CTA 후보 교체
* spacing token suggestion
* raw hex → token suggestion
* obvious contrast suggestion
* missing alt text TODO
* layer/component naming suggestion

**human review required 조건**

필수:

* 브랜드 palette 변경
* 전체 visual direction 변경
* pricing/checkout 관련 UX
* 개인정보/법무/의료/금융 문구
* 접근성 blocking issue를 자동 색상 변경으로 해결하려는 경우
* 사용자의 의사결정이 필요한 product positioning 변경

**finding target**

필수입니다.

URL/DOM:

```json
"selector": "main section.hero a.primary"
```

코드:

```json
"file": "src/app/page.tsx",
"line": 42,
"column": 10
```

screenshot/Figma:

```json
"bbox": [120, 80, 360, 140]
"node_id": "optional"
```

**에이전트 출력 스타일**

자연어를 줄이고 schema를 엄격히 합니다.
finding message는 짧고, fix는 구체적으로.

---

## 12. 오픈소스 운영

**라이선스**

MIT 추천.
상용 확장 가능성을 남기고 도입 장벽도 낮습니다.

**첫 공개 방식**

1. GitHub repo 공개
2. npm alpha publish
3. README demo
4. rule contribution guide

npm 이름은 실제 publish 전 확인 필요입니다.

**패키지 구조**

```text
@unslop/core
@unslop/cli
@unslop/browser
```

초기에는 monorepo로 시작합니다.

**룰 PR 정책**

룰 추가 PR에는 반드시 필요합니다.

* pass fixture
* fail fixture
* false positive 예시
* docs 설명
* severity 근거
* snapshot test

**false positive issue template**

필수입니다.

템플릿 질문:

```text
어떤 rule이 틀렸나요?
대상 UI/코드 일부를 제공할 수 있나요?
왜 이 패턴이 의도된 것인가요?
suppress가 필요한가요, rule 개선이 필요한가요?
```

**rule discussion**

GitHub Discussions가 좋습니다.

**release note**

rule changes를 별도 섹션으로 기록합니다.

```md
## Rule changes
- Added copy.generic_cta. May flag common CTA labels.
- Lowered severity of visual.gradient_cliche unless paired with generic copy.
```

**breaking change 기준**

* JSON schema 변경
* rule id 변경
* severity 기본값 변경
* threshold 기본값 변경
* config key 변경

**보안 정책**

URL 검사 시 브라우저가 페이지를 렌더링한다는 점을 명확히 설명합니다.

기본 정책:

```text
unslop does not send your code, screenshots, or reports to external servers by default.
```

---

## 13. 데이터와 개인정보

**외부 서버 전송**

v0.1 기본값:

> 외부 API 전송 없음.

**URL 검사**

로컬 브라우저가 대상 URL을 엽니다.
외부 리소스 로딩은 민감할 수 있으므로 옵션을 둡니다.

기본값 제안:

```bash
--block-third-party true
```

필요시:

```bash
--allow-external
```

**screenshot vision 분석**

v0.1 없음.
v0.2 이후에도 외부 API 사용 시 명시적 opt-in 필요.

```bash
--vision openai
```

이런 옵션 없이는 이미지 전송 금지.

**민감 화면 경고**

URL 검사 시작 시 한 줄로 충분합니다.

```text
Privacy: unslop runs locally and does not upload page content. Use --allow-external only if remote assets are safe to load.
```

**리포트 원문 포함**

원본 HTML/코드는 일부만 포함합니다.
기본 truncate:

```text
max_evidence_chars: 240
```

**secret masking**

필수입니다.

마스킹 대상:

* API key
* token
* email
* phone
* bearer token
* env-like string
* JWT-looking string

**CI 로그 제한**

CI에서는 evidence를 더 짧게 출력합니다.

```text
max_evidence_chars: 80
```

**telemetry**

v0.1 없음.
나중에 넣어도 opt-in만 허용합니다.

---

## 14. 성능과 의존성

**실행 시간 목표**

```text
file/glob 검사: 2초 이내 for 100 files
URL 검사: 15초 이내
CI 전체: 30초 이내
```

**파일 제한**

기본:

```text
max files: 500
max file size: 1MB
```

초과 시 skip + warning.

**URL timeout**

기본:

```text
15초
```

CLI 옵션:

```bash
--timeout 30000
```

**Playwright dependency**

optional package로 분리하는 설계가 좋습니다.

```text
@unslop/browser
```

CLI 설치가 너무 무거워지는 것을 막습니다.

**screenshot vision adapter**

별도 package.

```text
@unslop/vision
```

**Figma adapter**

별도 package.

```text
@unslop/figma
```

**core rule engine**

dependency-light를 유지합니다.
가능하면 core는 browser, Figma, LLM 의존성이 없어야 합니다.

**Node version**

Node >=20으로 충분합니다.

**YAML parser**

정식 YAML parser 사용 추천.
설정 파일은 제품 핵심이라 애매한 자체 parser를 만들지 않는 게 좋습니다.

---

## 15. 품질 기준

**v0.1 완료 acceptance criteria**

아래를 통과하면 v0.1 완료로 봅니다.

1. `unslop design init`이 유효한 `unslop.design.yml`을 생성한다.
2. `unslop design check --url http://localhost:3000`이 browser-rendered DOM을 분석한다.
3. `unslop design check "src/**/*.tsx"`가 React/Tailwind 파일을 분석한다.
4. 터미널 출력에 Design Signal Score, decision, top findings가 표시된다.
5. `--json` 출력이 snapshot test로 고정된 schema를 따른다.
6. `--ci`에서 threshold 미달 또는 blocking finding 발생 시 exit code 1을 반환한다.
7. 최소 10개 rule이 존재하고, 각 rule은 pass/fail fixture를 가진다.
8. false positive suppress가 config 또는 inline comment로 가능하다.
9. 외부 API 전송이 기본적으로 없다.
10. README에 before/after demo가 있다.

**모든 룰 fixture**

필수입니다.

**CLI smoke test**

필수입니다.

대상:

```bash
unslop design init
unslop design check fixture.html
unslop design check --json fixture.html
unslop design check --ci fixture.html
```

**URL fetch/render mock test**

필수입니다.
Playwright 기반 fixture page를 둡니다.

**JSON snapshot test**

필수입니다.

**HTML report test**

v0.2부터 최소 구조 test.

**TypeScript strict**

유지합니다.

**lint**

초기에는:

```bash
tsc --noEmit
pnpm test
```

ESLint는 v0.2에서 도입해도 됩니다.

**GitHub Actions CI**

repo 공개 전부터 추가합니다.

---

## 16. 데모와 메시징

**README 첫 데모**

SaaS generic dashboard가 더 범용적입니다.
다만 한국어 문서에서는 TOPIK learning app 예시를 같이 쓰면 좋습니다.

영문 README 첫 데모:

```text
Before:
"Unlock your productivity with AI-powered insights"
purple/cyan glow
floating cards
fake metrics
generic CTA
```

CLI:

```bash
unslop design check --url http://localhost:3000
```

출력:

```text
Design Signal Score: 41/100
Decision: revise
AI Slop Risk: High

Blocking:
- Primary CTA is generic
- Hero uses generic AI SaaS visual pattern
- Fake dashboard metrics detected
- Text contrast fails in secondary cards
```

**TOPIK 예시 사용 여부**

사용합니다.
다만 메인 README가 아니라 docs 또는 examples에 둡니다.

```text
examples/topik-learning-app
```

**공식 문구**

사용 추천:

> **AI made it look polished. unslop makes it product-ready.**

**purple/cyan gradient 언급 주의**

특정 스타일을 비난하는 느낌을 줄 수 있으므로 이렇게 씁니다.

나쁜 표현:

```text
Purple gradients are bad.
```

좋은 표현:

```text
A gradient is not a problem by itself. unslop flags high-frequency visual combinations when they replace product-specific design intent.
```

**언어 우선순위**

공식 README는 영어.
한국어 문서는 별도 제공.

```text
README.md
docs/ko/README.ko.md
```

**첫 공개 포스트 핵심 문장**

> Stop asking whether a UI was made by AI. Ask whether it is product-ready.

---

## 17. 로드맵 결정

## v0.1 scope

```text
CLI
browser-rendered URL check
React/Tailwind/static file check
Design Signal Score
JSON output
CI mode
config file
core rule fixtures
no external API
```

## v0.2

우선순위:

1. HTML report
2. `design plan`
3. screenshot capture in report
4. better fix buckets

## v0.3

React/Tailwind AST 분석 강화.

```text
arbitrary values
component duplication
semantic HTML
token drift
state detection
```

GitHub Action도 v0.3에 넣습니다.

## v0.4

Figma adapter.

```bash
unslop design check --figma FILE_KEY
```

## v0.5

Agent mode 정식화.

```bash
unslop design agent-check --json
```

**VS Code extension / Figma plugin**

장기 로드맵입니다.
v1 이후.

**상용 확장 고려**

고려하되 v0.1에는 넣지 않습니다.

상용 후보:

* 팀별 rule dashboard
* private design quality report
* GitHub org analytics
* Figma plugin hosted sync
* brand profile management

**30일 안에 보여줄 가장 강한 결과물**

> localhost로 띄운 AI-generated landing page를 검사해서, generic SaaS hero, CTA slop, contrast 문제, raw hex/tailwind arbitrary value, missing states를 잡고 JSON/terminal report를 내는 데모.

---

# 18. 결정 로그 초안

| 항목               | 결정                                                                        | 근거                            | 상태    | 담당          |
| ---------------- | ------------------------------------------------------------------------- | ----------------------------- | ----- | ----------- |
| 1차 사용자           | AI-generated web UI를 만드는 프론트엔드 개발자/1인 창업자                                 | CLI-first와 URL/code 검사에 가장 적합 | 확정 제안 | Product     |
| v0.1 핵심 입력       | localhost URL, React/Tailwind/HTML/CSS 파일                                 | 실제 화면과 코드 품질을 동시에 확인          | 확정 제안 | Product/Eng |
| v0.1 필수 명령       | `design init`, `design check`, `design check --json`, `design check --ci` | MVP 가치 전달에 충분                 | 확정 제안 | Eng         |
| 기본 점수 기준         | Design Signal Score 75점                                                   | CI threshold로 이해 쉬움           | 확정 제안 | Product     |
| CI 실패 기준         | blocking finding 또는 score < threshold                                     | 자동화 게이트로 명확                   | 확정 제안 | Eng         |
| URL 검사 방식        | Playwright 기반 browser render                                              | HTML fetch만으로 디자인 판단 불가       | 확정 제안 | Eng         |
| 스크린샷 adapter 시점  | v0.2                                                                      | vision 없이 v0.1에 넣으면 범위 과대     | 확정 제안 | Product     |
| Figma adapter 시점 | v0.4                                                                      | 초기 개발 범위 축소                   | 확정 제안 | Product     |
| 자동 수정 정책         | v0.1 미지원, 이후에도 `--write` 필수                                               | 신뢰와 안전성 확보                    | 확정 제안 | Product/Eng |
| npm publish 시점   | v0.1 alpha 완료 후                                                           | README demo와 fixture가 있어야 함   | 결정 필요 | Maintainer  |

---

# 19. MVP 승인 체크리스트 답변

현재 기준으로 승인 조건은 이렇게 잡습니다.

* 제품 정의: **AI-generated UI를 product-ready로 만드는 CLI-first design quality gate**
* 1차 사용자: **AI로 웹 UI를 만드는 프론트엔드 개발자/1인 창업자**
* v0.1 입력: **localhost URL + React/Tailwind/HTML/CSS files**
* v0.1 제외: **Figma, vision API, screenshot upload, 자동 수정, SaaS dashboard**
* CLI 출력: **Design Signal Score + decision + findings + suggested fixes**
* JSON 출력: **agent/CI가 읽을 수 있는 stable schema**
* 점수 기준: **Design Signal Score 75, Accessibility 85**
* severity: **low / medium / high / blocking**
* false positive: **config ignore + inline ignore**
* config: **optional, 없으면 generic defaults**
* 오픈소스: **MIT 추천**
* 개인정보: **local-only, no telemetry, no external API by default**
* v0.1 acceptance criteria: **테스트 가능한 10개 기준으로 고정**

# 최종 결론

v0.1은 이렇게 좁히는 게 가장 좋습니다.

> **unslop v0.1은 AI가 만든 웹 UI를 배포 전에 검사하는 CLI다. localhost URL과 React/Tailwind 코드를 분석해 generic AI visual pattern, generic copy, accessibility issue, design-system drift, missing states를 찾아내고 Design Signal Score와 JSON report를 제공한다.**

지금 당장 개발 착수용으로는 이 scope가 가장 안전합니다.

```bash
unslop design init
unslop design check --url http://localhost:3000
unslop design check "src/**/*.tsx"
unslop design check --url http://localhost:3000 --json
unslop design check --url http://localhost:3000 --ci
```

v0.1의 핵심 메시지는 이것으로 고정하면 됩니다.

> **Don’t detect AI. Restore design intent.**
