좋습니다. 이제 `unslop`을 이렇게 좁히는 게 좋습니다.

> **`unslop` = AI가 만든 텍스트와 디자인을 “예쁘지만 비어 있는 산출물”에서 “제품으로 쓸 수 있는 산출물”로 바꾸는 CLI-first quality gate.**

여기서 핵심은 **AI 디자인 탐지기**가 아니라 **AI 디자인 slop 제거기**입니다.
즉, “이게 AI가 만들었나요?”가 아니라:

> “이 화면은 브랜드, 제품 의도, 디자인 시스템, 접근성, 정보 구조, 실제 사용 상황을 반영하고 있나요?”

를 검사하는 도구입니다.

Nielsen Norman Group도 2025년 기준으로 디자인용 AI 도구가 좁은 작업에서는 좋아졌지만, 전체 디자인 산출물 품질을 인간 디자이너 수준으로 대체하지는 못한다고 평가했습니다. 그래서 `unslop`도 “AI가 디자인을 대신한다”가 아니라 **AI가 만든 초안을 제품 수준으로 정리하는 보정 레이어**로 가는 게 맞습니다. ([Nielsen Norman Group][1])

---

# 1. 최종 포지션

## 제품명

```text
unslop
```

## 디자인 쪽 서브 커맨드

```bash
unslop design
```

## 한 줄 설명

> **Remove AI slop from copy, UI, and visual design.**

조금 더 제품스럽게 쓰면:

> **`unslop design` audits AI-generated UI and visual work for generic styling, weak hierarchy, design-system drift, accessibility problems, and low product specificity.**

한국어로는:

> **AI가 만든 화면에서 흔한 보라색 그라디언트, 카드 떡칠, 의미 없는 글로우, 약한 정보 구조, 디자인 시스템 이탈, 접근성 문제, 빈약한 UX 상태를 잡아내고 수정 방향을 제시하는 CLI.**

---

# 2. 이 프로젝트가 잡아야 하는 “디자인 AI slop”

디자인에서 AI slop은 단순히 못생긴 게 아닙니다.

진짜 문제는 이겁니다.

> **겉보기에는 그럴듯한데, 실제 제품 맥락·브랜드·사용자 행동·구현 제약이 빠져 있는 디자인.**

예를 들면 이런 것들입니다.

| 종류         | AI slop 패턴                                               |
| ---------- | -------------------------------------------------------- |
| 비주얼 클리셰    | 보라/시안 그라디언트, 다크모드 글로우, glassmorphism, 과한 그림자             |
| 카드 수프      | 모든 정보를 둥근 카드에 넣고 hierarchy가 없음                           |
| 의미 없는 장식   | blob, mesh gradient, floating orb, 3D shape가 제품 의미 없이 등장 |
| 타이포 slop   | 제목/본문 대비 없음, 전부 Inter/Geist 느낌, 글자 크기 스케일 불명확            |
| 디자인 시스템 이탈 | 토큰 안 쓰고 임의 색상, 임의 radius, 임의 spacing 사용                  |
| UX 상태 누락   | loading, empty, error, disabled, success 상태 없음           |
| 가짜 제품성     | 지표, 그래프, CTA가 있어 보이지만 실제 사용자 과업이 없음                      |
| 접근성 문제     | 대비 부족, 작은 텍스트, 색상만으로 상태 구분                               |
| 카피 slop    | “seamless”, “powerful”, “사용자 경험 향상” 같은 빈말                |
| 구현 slop    | 예쁜 스샷은 있는데 반응형, 컴포넌트 재사용, 상태 관리 고려 없음                    |

이미 `/impeccable` 같은 인접 도구도 AI-generated UI의 흔한 tell과 일반 디자인 품질 문제를 규칙화하려는 방향을 보여주고 있습니다. 예를 들어 glassmorphism 남용, hairline border와 wide shadow 조합, AI스러운 보라/시안 팔레트, 다크 배경 글로우 같은 패턴을 catalog로 다룹니다. `unslop`은 여기서 한 발 더 나가서 **CLI + Figma + agent + fix plan**으로 잡으면 됩니다. ([Impeccable][2])

---

# 3. 핵심 철학

이 문장을 제품 철학으로 박으면 좋습니다.

> **Don’t detect AI. Restore design intent.**

또는:

> **AI detection is unreliable. Design quality is inspectable.**

디자인에서 AI slop 제거는 “AI 티 안 나게 속이기”가 아닙니다.
좋은 방향은 이겁니다.

```text
AI 초안
→ 디자인 의도 검사
→ 브랜드/토큰/접근성/UX 상태 검사
→ slop 패턴 제거
→ 제품 수준의 화면으로 정리
```

---

# 4. `unslop design`의 4대 기능

## 4-1. Design Slop Check

AI가 만든 UI, 랜딩페이지, 앱 화면, 썸네일, 배너, 피치덱 디자인을 검사합니다.

```bash
unslop design check screenshot.png
unslop design check ./screens
unslop design check --url http://localhost:3000
unslop design check --figma FILE_KEY
```

출력 예시:

```text
Design Signal Score: 57/100
AI Slop Risk: High
Product Readiness: Low

High severity:
- Generic SaaS visual language: purple/cyan gradient + glow + rounded cards
- Weak hierarchy: 8 elements compete as primary content
- No empty/error/loading states detected
- CTA copy is generic: "Get Started", "Unlock Your Potential"
- 13 colors used, but only 4 appear to be tokenized
- Text contrast likely fails on secondary card descriptions

Suggested:
  unslop design fix --figma FILE_KEY --mode product-ui
```

이 기능은 사람이 봐도 좋고, AI 에이전트가 호출해도 좋습니다.

---

## 4-2. Design Slop Fix Plan

무작정 디자인을 고치는 게 아니라, 먼저 **수정 계획**을 냅니다.

```bash
unslop design plan screenshot.png
```

출력:

```md
# Design Fix Plan

## 1. Remove generic AI polish
- Replace purple/cyan glow background with brand-neutral surface
- Remove decorative orbs that do not explain product value
- Reduce card shadow from visual effect to actual elevation cue

## 2. Restore hierarchy
- Make primary task visible in first viewport
- Reduce competing cards from 6 to 3
- Move secondary metrics below the main action

## 3. Add product specificity
- Replace "Boost your productivity" with the concrete user outcome
- Show real object names, not generic dashboard labels
- Add empty and error states

## 4. Align with design system
- Snap spacing to 4/8px scale
- Replace ad-hoc colors with semantic tokens
- Use one radius scale: 8 / 12 / 16
```

이게 중요합니다.
`unslop`은 “더 예쁘게”가 아니라 **무엇을 왜 바꿔야 하는지**를 보여줘야 합니다.

---

## 4-3. Design System Align

이게 진짜 강한 갈래입니다.

AI가 만든 화면은 보통 디자인 시스템을 무시합니다.
색상, spacing, radius, shadow, typography가 제멋대로입니다.

`unslop`은 이런 식으로 검사합니다.

```bash
unslop design align --figma FILE_KEY --tokens tokens.json
```

또는:

```bash
unslop design align --url http://localhost:3000 --tokens tokens.json
```

검사 항목:

| 항목                  | 검사 내용                               |
| ------------------- | ----------------------------------- |
| color token         | 임의 hex 색상 사용 여부                     |
| typography token    | font-size, line-height가 스케일에 맞는지    |
| spacing token       | 4/8px grid 이탈 여부                    |
| radius token        | 임의 radius, 과한 pill/blob화            |
| shadow token        | 의미 없는 glow/shadow 사용                |
| component usage     | 버튼/카드/input이 시스템 컴포넌트인지             |
| state coverage      | hover, focus, disabled, error 상태 여부 |
| responsive behavior | 모바일에서 hierarchy가 유지되는지              |

Figma 쪽은 기술적으로도 가능성이 좋습니다. Figma REST API는 파일을 JSON node tree로 읽고 각 layer/object의 속성을 가져올 수 있고, Plugin API는 variables를 읽거나 만들고 노드에 bound variable을 적용하는 기능을 제공합니다. ([Figma 개발자 문서][3]) ([Figma 개발자 문서][4])

---

## 4-4. Agent Preflight

이건 `unslop`의 장기 핵심입니다.

AI 디자인 에이전트가 Figma나 코드에 결과물을 쓰기 전에 `unslop`을 호출합니다.

```bash
unslop design agent-check --input design.json --json
```

출력:

```json
{
  "status": "fail",
  "design_signal_score": 61,
  "decision": "revise_before_showing_user",
  "issues": [
    {
      "type": "generic_visual_language",
      "severity": "high",
      "node": "HeroSection",
      "reason": "Uses common AI SaaS pattern: dark gradient background, cyan glow, floating cards, generic CTA.",
      "suggested_fix": "Use brand surface tokens, remove decorative glow, make the primary user task visible."
    },
    {
      "type": "design_system_drift",
      "severity": "high",
      "node": "PricingCard",
      "reason": "Uses non-token colors and arbitrary 22px radius.",
      "suggested_fix": "Map background to surface.card and radius to radius.lg."
    },
    {
      "type": "missing_state",
      "severity": "medium",
      "node": "EmailInput",
      "reason": "No error, disabled, or focus state provided.",
      "suggested_fix": "Add validation and focus states before handoff."
    }
  ],
  "recommended_action": "revise"
}
```

Figma도 MCP를 통해 에이전트가 Figma의 frames, components, variables, auto layout을 만들거나 수정하는 방향으로 가고 있습니다. 그러면 `unslop`은 AI 에이전트가 디자인을 쓰기 전 품질 게이트로 붙을 수 있습니다. ([Figma Help Center][5])

---

# 5. `unslop design`의 입력 형태

처음부터 Figma만 보면 좁습니다.
디자인 slop은 여러 형태로 나옵니다.

그래서 입력을 네 가지로 잡는 게 좋습니다.

## 5-1. Screenshot / Image

```bash
unslop design check landing.png
```

좋은 점: 가장 쉽고 범용적입니다.
v0, Lovable, Cursor, Figma, Canva, Midjourney, Gamma 결과물 모두 넣을 수 있습니다.

볼 수 있는 것:

* visual cliché
* layout hierarchy
* card soup
* gradient/glow 남용
* typography contrast
* visual density
* asset mismatch
* CTA visibility

한계: 실제 token, layer, component 정보는 모릅니다.

---

## 5-2. Live URL / Localhost

```bash
unslop design check --url http://localhost:3000
```

좋은 점: 제일 실용적입니다.

볼 수 있는 것:

* 실제 CSS
* DOM 구조
* computed style
* contrast
* responsive
* focus state
* hover state
* accessibility tree
* spacing
* image alt
* button label
* heading order

초기 MVP로는 이게 가장 강합니다.
AI 코딩 도구가 만든 웹앱을 바로 검사할 수 있으니까요.

---

## 5-3. Figma File

```bash
unslop design check --figma FILE_KEY
```

좋은 점: 디자이너가 바로 씁니다.

볼 수 있는 것:

* layer tree
* components
* styles
* variables
* design tokens
* auto layout
* naming
* frame structure
* variant usage

이건 v0.3 정도에 넣는 게 좋습니다.
처음부터 Figma 플러그인까지 만들면 범위가 커집니다.

---

## 5-4. Code

```bash
unslop design check src/**/*.tsx
unslop design check app/**/*.tsx --tailwind
```

좋은 점: AI가 생성한 프론트엔드 코드에 바로 붙습니다.

볼 수 있는 것:

* Tailwind class 난사
* ad-hoc color
* arbitrary spacing
* duplicated components
* semantic HTML 부족
* `div` soup
* accessible name 누락
* 반응형 누락
* 컴포넌트화 안 된 UI

이건 개발자들이 좋아합니다.

---

# 6. 핵심 점수 체계

텍스트 쪽은 `Signal Score`였고, 디자인 쪽은 이렇게 잡으면 좋습니다.

```text
Design Signal Score: 74/100
AI Slop Risk: Medium
Product Readiness: Needs work
Brand Fit: Low
System Fit: Medium
```

축별 점수:

| 점수                       | 의미                                   |
| ------------------------ | ------------------------------------ |
| Visual Intent            | 장식이 아니라 의도가 있는가                      |
| Product Specificity      | 이 제품만의 맥락이 보이는가                      |
| Hierarchy                | 무엇을 먼저 봐야 하는지 명확한가                   |
| System Fit               | 디자인 토큰/컴포넌트를 쓰는가                     |
| Accessibility            | 대비, 크기, 상태, 포커스가 충분한가                |
| Interaction Readiness    | empty/error/loading/disabled 상태가 있는가 |
| Brand Distinctiveness    | 흔한 AI SaaS 스타일에서 벗어났는가               |
| Implementation Readiness | 개발 가능한 구조인가                          |
| Copy Signal              | UI 문구가 구체적인가                         |

접근성은 취향 문제가 아니라 기준화할 수 있습니다. 예를 들어 WCAG 2.2의 contrast minimum은 일반 텍스트 4.5:1, large text 3:1을 요구하고, 목적은 텍스트와 배경 사이 대비를 충분히 확보하는 것입니다. ([W3C][6])

---

# 7. 탐지 규칙을 이렇게 나누자

## A. Visual Cliché Rules

AI스러운 시각 클리셰 탐지.

```yaml
rules:
  - purple_cyan_gradient
  - dark_mode_glow
  - glass_card_without_layering_need
  - mesh_gradient_background
  - floating_orb_decoration
  - excessive_rounded_cards
  - shadow_plus_border_combo
  - generic_3d_icon
  - overused_saas_hero_layout
```

예시 출력:

```text
High: Generic AI SaaS hero
The hero combines gradient text, dark glow background, floating dashboard cards, and generic CTA copy. This is a high-frequency AI-generated landing pattern.
```

단, 여기서 조심해야 합니다.

보라색 그라디언트가 항상 나쁜 건 아닙니다.
문제는 **맥락 없는 조합**입니다.

```text
purple/cyan gradient
+ dark glow
+ generic SaaS headline
+ rounded card stack
+ no brand rationale
= high slop risk
```

---

## B. Product Intent Rules

제품 의도가 있는지 검사합니다.

```yaml
rules:
  - unclear_primary_task
  - no_user_role
  - fake_metrics
  - generic_dashboard_labels
  - missing_success_state
  - missing_empty_state
  - missing_error_state
  - no_real_content_examples
```

AI가 만든 대시보드는 자주 이런 식입니다.

```text
Total Revenue
User Growth
Engagement
Performance
Analytics
```

근데 실제 제품이 TOPIK 학습 앱이면 이렇게 바뀌어야 합니다.

```text
오늘 푼 문제
오답률 높은 문법
다시 풀 문제
쓰기 첨삭 대기
다음 복습 예정
```

이 차이가 바로 **slop 제거**입니다.

---

## C. Design System Rules

디자인 시스템 정합성 검사.

```yaml
rules:
  - color_not_tokenized
  - spacing_off_scale
  - arbitrary_radius
  - arbitrary_shadow
  - mixed_icon_styles
  - component_not_reused
  - inconsistent_button_heights
  - typography_scale_drift
  - unbound_figma_variables
```

출력 예시:

```text
Medium: Arbitrary spacing
Detected 11 spacing values outside the configured scale:
13px, 17px, 22px, 27px

Suggested:
- 13px → 12px
- 17px → 16px
- 22px → 24px
- 27px → 32px
```

이건 사람이 보기에도, AI가 고치기에도 좋습니다.

---

## D. Accessibility Rules

```yaml
rules:
  - contrast_too_low
  - text_too_small
  - icon_only_button_without_label
  - focus_state_missing
  - color_only_status
  - hit_area_too_small
  - heading_order_broken
```

이건 `unslop`이 취향 논쟁에서 벗어나는 데 중요합니다.
“AI 느낌 난다”는 주관적이지만, 대비·포커스·상태·heading order는 훨씬 객관적입니다.

---

## E. Copy + UI Text Rules

텍스트는 기본 기능으로 들어가야 합니다.

```yaml
rules:
  - generic_cta
  - generic_benefit_claim
  - no_user_outcome
  - buzzword_headline
  - no_error_recovery_copy
  - fake_social_proof
  - bland_empty_state
```

예시:

```text
Before:
Unlock your potential with powerful insights.

After:
오늘 틀린 TOPIK 문법 5개를 다시 풀어보세요.
```

또는 SaaS라면:

```text
Before:
Streamline your workflow with AI-powered automation.

After:
Turn every support email into a tagged Linear issue in under 10 seconds.
```

---

# 8. `unslop design fix`는 어디까지 자동화할까?

중요합니다.
디자인은 텍스트보다 자동 수정이 위험합니다.

그래서 수정 단계를 세 등급으로 나누면 좋습니다.

## Level 1. Safe Fix

자동 적용 가능.

```text
- 긴 카피 줄이기
- generic CTA 구체화 후보 생성
- contrast fail 색상 후보 제시
- spacing을 가장 가까운 token으로 스냅
- radius를 token scale로 스냅
- layer name 정리
- alt text 누락 표시
- TODO state 생성
```

CLI:

```bash
unslop design fix --safe --write
```

---

## Level 2. Suggested Fix

자동 적용하지 않고 diff/patch만 제안.

```text
- hero hierarchy 재구성
- 카드 수 줄이기
- section order 변경
- CTA 위치 변경
- 정보 구조 재배치
- 컴포넌트 교체
```

CLI:

```bash
unslop design fix --suggest
```

---

## Level 3. Human Review Required

사람 검토 필수.

```text
- 브랜드 컬러 변경
- 로고/일러스트 교체
- 전체 visual direction 변경
- pricing/checkout UX 변경
- 법무/의료/금융 화면 문구 변경
```

CLI:

```bash
unslop design fix --plan
```

이렇게 해야 신뢰가 생깁니다.

---

# 9. 추천 제품 갈래 5개

## 갈래 1. AI UI Slop Linter

가장 기본이고 오픈소스에 좋습니다.

```bash
unslop design check --url http://localhost:3000
unslop design check screenshot.png
```

타깃:

```text
v0, Lovable, Cursor, Bolt, Replit, Claude Code로 만든 UI
```

핵심 가치:

```text
AI가 만든 앱 화면을 배포 전 검사한다.
```

검사:

```text
visual cliché
accessibility
generic UI copy
card soup
hierarchy
responsive issue
state missing
```

이건 README 데모가 강합니다.

---

## 갈래 2. Figma Design System Cleaner

디자이너 타깃입니다.

```bash
unslop design check --figma FILE_KEY --tokens tokens.json
unslop design align --figma FILE_KEY --suggest
```

타깃:

```text
AI로 만든 Figma 화면
디자인 시스템에서 벗어난 화면
브랜드 정합성 검토가 필요한 화면
```

핵심 가치:

```text
Figma 파일을 디자인 시스템에 다시 붙인다.
```

검사:

```text
unbound variables
non-token color
inconsistent spacing
unreused components
random typography
naming chaos
auto layout 문제
```

이건 나중에 Figma plugin으로 확장하기 좋습니다.

---

## 갈래 3. Brand Anti-Slop

브랜드팀/마케팅팀 타깃입니다.

```bash
unslop design profile create brand.yml --from ./brand-assets
unslop design check landing.png --brand brand.yml
```

`brand.yml` 예시:

```yaml
brand:
  personality:
    - calm
    - precise
    - educational
  avoid:
    - neon glow
    - generic 3d mascot
    - purple/cyan gradient
    - startup dashboard cliché
  typography:
    heading: "Pretendard"
    body: "Pretendard"
    scale: [12, 14, 16, 20, 24, 32, 40]
  color:
    primary: "#2563EB"
    surface: "#FFFFFF"
    text: "#111827"
  radius:
    sm: 6
    md: 10
    lg: 16
  copy:
    avoid:
      - "활용할 수 있습니다"
      - "사용자 경험을 향상시킵니다"
      - "혁신적인"
```

핵심 가치:

```text
AI가 만든 흔한 느낌을 우리 브랜드 말투와 시각 언어로 되돌린다.
```

사용자님이 교육 서비스나 TOPIK 제품을 만든다면 이 갈래가 특히 잘 맞습니다.

---

## 갈래 4. Agent Design Gate

AI가 디자인을 만들 때마다 자동으로 검사하는 도구입니다.

```bash
unslop design agent-check --json
```

타깃:

```text
AI 디자인 에이전트
Figma MCP agent
vibe coding workflow
code-to-UI generator
```

핵심 가치:

```text
AI가 slop 화면을 사용자에게 보여주기 전에 스스로 고치게 한다.
```

출력은 사람이 아니라 에이전트가 읽기 좋아야 합니다.

```json
{
  "decision": "revise",
  "blocking_issues": 3,
  "safe_fixes": [
    {
      "target": "Hero.CTA.copy",
      "change": "Replace generic CTA with task-specific CTA"
    }
  ],
  "requires_human_review": [
    "Visual direction change",
    "Brand palette decision"
  ]
}
```

이 갈래가 장기적으로 가장 큽니다.

---

## 갈래 5. Design-to-Code Slop Guard

프론트엔드 개발자 타깃입니다.

```bash
unslop design check app/**/*.tsx --tailwind
unslop design check --url http://localhost:3000 --ci
```

타깃:

```text
AI가 생성한 React/Tailwind UI
랜딩페이지
대시보드
어드민 페이지
SaaS 템플릿
```

검사:

```text
arbitrary Tailwind class 남발
중복 컴포넌트
semantic HTML 부족
accessibility 누락
반응형 누락
random shadow/radius/color
```

CI에서 실패시킬 수 있습니다.

```bash
unslop design check --url http://localhost:3000 --threshold 75
```

---

# 10. 제가 추천하는 최종 좁힘

여러 갈래 중에 지금 가장 강한 포지션은 이겁니다.

> **`unslop design`은 AI가 만든 웹/UI 디자인을 검사하고, 디자인 시스템·접근성·브랜드·UX 상태 기준으로 slop을 제거하는 CLI다.**

초기 타깃은 **AI가 만든 웹 UI**로 잡는 게 좋습니다.

왜냐하면:

```text
1. screenshot, URL, code로 바로 검사 가능하다.
2. Figma보다 개발자 접근성이 높다.
3. v0/Lovable/Cursor/Bolt 같은 AI UI 생성 흐름과 잘 맞는다.
4. CLI와 CI에 붙이기 쉽다.
5. 나중에 Figma plugin으로 확장하기 좋다.
```

따라서 v0.1은 Figma가 아니라 이쪽이 좋습니다.

```bash
unslop design check --url http://localhost:3000
unslop design check screenshot.png
unslop design check src/**/*.tsx
```

v0.2부터 Figma를 붙입니다.

```bash
unslop design check --figma FILE_KEY
```

---

# 11. MVP 명령어 설계

## 기본 검사

```bash
unslop design check screenshot.png
```

```bash
unslop design check --url http://localhost:3000
```

```bash
unslop design check src/app/page.tsx
```

## 리포트 생성

```bash
unslop design report --url http://localhost:3000 -o unslop-report.html
```

## 수정 계획

```bash
unslop design plan screenshot.png
```

## 안전 수정

```bash
unslop design fix src/**/*.tsx --safe
```

## AI 에이전트용

```bash
unslop design agent-check --stdin --json
```

## CI용

```bash
unslop design check --url http://localhost:3000 --threshold 75 --ci
```

---

# 12. 결과 리포트 예시

```text
UNSLOP DESIGN REPORT

Target:
  http://localhost:3000

Design Signal Score:
  62 / 100

AI Slop Risk:
  High

Scores:
  Visual Intent:             48
  Product Specificity:       41
  Hierarchy:                 58
  Design System Fit:         52
  Accessibility:             69
  Interaction Readiness:     35
  Copy Signal:               44
  Implementation Readiness:  73

Blocking:
  1. Primary CTA is generic and not tied to the user task.
  2. No empty/error/loading states found for the main workflow.
  3. 9 non-token colors detected.
  4. Hero section uses generic AI SaaS visual pattern.

Safe fixes:
  - Snap spacing values to 4px scale
  - Replace low-contrast text color
  - Shorten generic UI copy
  - Mark missing states as TODO components

Suggested design changes:
  - Replace decorative glow background with brand surface
  - Reduce cards in hero from 5 to 2
  - Make the user’s primary action visible above the fold
```

---

# 13. “디자인 slop 제거”의 killer demo

README 첫 데모는 이렇게 가야 합니다.

## Before

```text
Hero:
"Unlock your productivity with AI-powered insights"

Visual:
dark purple gradient
cyan glow
floating dashboard cards
rounded cards everywhere
generic chart
```

## Command

```bash
unslop design check landing.png
```

## Output

```text
Design Signal Score: 39/100
AI Slop Risk: Very High

Detected:
- Generic AI SaaS hero pattern
- Buzzword headline
- Decorative dashboard with fake metrics
- No concrete user task
- CTA does not say what happens next
- Glow and gradient do not map to brand tokens
```

## Fix

```bash
unslop design plan landing.png --product "TOPIK learning app"
```

## After direction

```text
Headline:
"오늘 틀린 TOPIK 문법을 10분 안에 다시 풀어보세요"

Visual:
actual wrong-answer review screen
3 real learner states:
- 오늘 복습
- 자주 틀린 문법
- 첨삭 대기

CTA:
"오답 5개 다시 풀기"
```

이게 `unslop`의 본질입니다.

> 흔한 AI 예쁜 화면을 실제 제품 화면으로 바꾼다.

---

# 14. 기술 구조

```text
unslop
  ├─ core
  │   ├─ scoring
  │   ├─ rule-engine
  │   ├─ fix-planner
  │   └─ report-generator
  │
  ├─ adapters
  │   ├─ screenshot
  │   ├─ browser-url
  │   ├─ figma
  │   ├─ react-tailwind
  │   └─ design-tokens
  │
  ├─ rules
  │   ├─ visual-cliche
  │   ├─ accessibility
  │   ├─ design-system
  │   ├─ product-intent
  │   ├─ ui-copy
  │   └─ implementation
  │
  ├─ fixers
  │   ├─ copy-fixer
  │   ├─ token-aligner
  │   ├─ contrast-fixer
  │   ├─ spacing-snapper
  │   └─ component-suggester
  │
  └─ cli
```

## 엔진은 hybrid로

```text
1. deterministic rules
   - contrast
   - spacing
   - token usage
   - repeated colors
   - CSS patterns
   - heading order

2. vision/LLM review
   - visual cliché
   - hierarchy
   - brand fit
   - product specificity

3. verifier
   - 수정 후 다시 검사
   - 점수 개선 확인
```

완전 LLM 기반으로 가면 느리고 비싸고 일관성이 약합니다.
완전 룰 기반으로 가면 디자인 의도를 못 봅니다.
그래서 **rules + vision + structured output** 조합이 맞습니다.

---

# 15. `unslop.design.yml` 설정 파일

프로젝트 루트에 이런 파일을 둡니다.

```yaml
product:
  name: "DOTORE TOPIK"
  type: "education"
  primary_user: "TOPIK learners"
  primary_tasks:
    - solve questions
    - review wrong answers
    - get writing feedback

brand:
  tone:
    - clear
    - calm
    - practical
  avoid_visuals:
    - neon glow
    - purple cyan gradient
    - generic dashboard cards
    - glassmorphism
    - fake 3d mascot
  avoid_copy:
    - "사용자 경험을 향상"
    - "다양한 방식으로 활용"
    - "혁신적인"
    - "AI-powered insights"

tokens:
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64]
  radius:
    sm: 6
    md: 10
    lg: 16
  typography:
    sizes: [12, 14, 16, 18, 20, 24, 32, 40]

thresholds:
  design_signal: 75
  accessibility: 85
  system_fit: 80
  product_specificity: 70

fix:
  safe_auto_apply:
    - copy_trim
    - spacing_snap
    - contrast_suggestion
    - token_suggestion
  require_human_review:
    - brand_palette_change
    - layout_restructure
    - visual_direction_change
```

이 설정 파일이 있어야 `unslop`이 “취향 평가 도구”가 아니라 **프로젝트별 품질 게이트**가 됩니다.

---

# 16. Figma 쪽 최종 확장 그림

나중에는 이렇게 가면 됩니다.

## CLI

```bash
unslop design check --figma FILE_KEY
```

## Figma Plugin

Figma 안에서:

```text
Select frame
→ Run Unslop
→ Issues appear as comments or sidebar checklist
→ Apply safe fixes
```

## Figma MCP / Agent

AI 에이전트가:

```text
1. Figma에 화면 생성
2. unslop design agent-check 호출
3. 실패하면 수정
4. 통과하면 사용자에게 보여줌
```

이 방향이 좋은 이유는 Figma가 이미 API로 파일 구조를 제공하고, MCP를 통해 AI agent가 Figma의 디자인 맥락을 읽고 canvas에 쓸 수 있는 방향으로 움직이고 있기 때문입니다. ([Figma 개발자 문서][3]) ([Figma Help Center][5])

---

# 17. MVP 로드맵

## v0.1 — Web UI / Screenshot Slop Checker

가장 먼저 이것만 만듭니다.

```bash
unslop design check screenshot.png
unslop design check --url http://localhost:3000
```

기능:

```text
- AI visual cliché 탐지
- card soup 탐지
- CTA generic copy 탐지
- contrast 검사
- heading hierarchy 검사
- spacing/radius/shadow 이상치 탐지
- Design Signal Score 출력
- JSON output
```

이 버전은 빠르게 공개 가능합니다.

---

## v0.2 — Fix Plan + HTML Report

```bash
unslop design report --url http://localhost:3000 -o report.html
unslop design plan screenshot.png
```

기능:

```text
- 화면 캡처 포함 리포트
- 문제 영역 표시
- safe fix / suggested fix / human review 분리
- before/after 카피 제안
```

이때부터 데모가 강해집니다.

---

## v0.3 — React / Tailwind Slop Guard

```bash
unslop design check src/**/*.tsx --tailwind
```

기능:

```text
- arbitrary class 탐지
- non-token color 탐지
- repeated component 탐지
- semantic HTML 검사
- accessibility prop 검사
- duplicate card pattern 탐지
```

AI 코딩 도구 사용자들이 붙기 좋습니다.

---

## v0.4 — Figma Adapter

```bash
unslop design check --figma FILE_KEY
```

기능:

```text
- Figma node tree 분석
- variables 사용 여부 검사
- component instance 사용 여부 검사
- layer naming 검사
- auto layout 구조 검사
- token drift 검사
```

이때 디자이너 쪽으로 확장합니다.

---

## v0.5 — Agent Mode

```bash
unslop design agent-check --json
```

기능:

```text
- strict JSON schema
- pass/fail/revise decision
- safe patch suggestions
- human-review-required flag
- AI agent loop에 붙이기
```

---

# 18. 제일 좋은 시작점

저라면 이렇게 시작합니다.

## 프로젝트 이름

```text
unslop
```

## 첫 패키지

```text
@unslop/cli
```

## 첫 기능

```bash
unslop design check --url http://localhost:3000
```

## 첫 타깃

```text
AI로 생성한 landing page / dashboard / web app UI
```

## 첫 번째 README 문장

```md
# unslop

Remove AI slop from UI, copy, and visual design.

`unslop` is a CLI-first design quality gate for AI-generated interfaces. It checks screenshots, live URLs, code, and Figma files for generic visual patterns, weak hierarchy, design-system drift, accessibility issues, and low product specificity.
```

## 첫 번째 데모 문장

```text
AI made it look polished. unslop makes it product-ready.
```

이 문장이 꽤 좋습니다.

---

# 19. 결론: 좁힌 최종 방향

최종 방향은 이렇게 잡으면 됩니다.

> **`unslop design`은 AI가 만든 UI/디자인 초안을 제품 수준으로 끌어올리는 anti-slop CLI다. 스크린샷, URL, 코드, Figma 파일을 입력받아 generic AI visual clichés, 디자인 시스템 이탈, 접근성 문제, 약한 hierarchy, 빈약한 제품 맥락, generic UI copy를 잡고 fix plan을 제공한다.**

처음부터 “모든 디자인”을 보지 말고, 이 순서로 갑니다.

```text
1. AI-generated web UI 검사
2. screenshot + URL 기반 리포트
3. React/Tailwind code 검사
4. Figma file 검사
5. Figma plugin / MCP agent gate
```

그리고 제품의 가장 강한 정체성은 이겁니다.

> **AI slop 제거 = 장식 제거가 아니라, 디자인 의도 복원.**

[1]: https://www.nngroup.com/articles/ai-design-tools-update-2/ "AI Design Tools Are Marginally Better: Status Update - NN/G"
[2]: https://impeccable.style/slop "Slop | Impeccable"
[3]: https://developers.figma.com/docs/rest-api/ "Introduction | Developer Docs"
[4]: https://developers.figma.com/docs/plugins/working-with-variables/ "Working with Variables | Developer Docs"
[5]: https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server "Guide to the Figma MCP server – Figma Learn - Help Center"
[6]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum "Understanding Success Criterion 1.4.3: Contrast (Minimum) | WAI | W3C"
