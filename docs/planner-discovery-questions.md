# Planner Discovery Questions

이 문서는 `unslop` 실제 개발 착수 전에 기획자, 제품 책임자, 디자인 책임자에게 확인해야 할 질문 목록입니다.

목적은 “무엇을 만들까?”가 아니라 “무엇을 만들지 않을 것인가, 무엇이 통과 기준인가, 어떤 사용자가 어떤 상황에서 이 도구를 신뢰할 것인가”를 명확히 하는 것입니다.

## 답변 반영 상태

답변 원문은 [planner-discovery-answers-v0.1.md](planner-discovery-answers-v0.1.md)에 저장했습니다.

v0.1 결정 요약:

- 제품 정의: AI-generated UI를 product-ready로 만드는 CLI-first design quality gate
- 1차 사용자: AI로 웹 UI를 만드는 프론트엔드 개발자와 1인 창업자
- 핵심 입력: localhost URL, React/Tailwind/HTML/CSS 파일, `unslop.design.yml`
- 필수 명령: `design init`, `design check`, `design check --json`, `design check --ci`
- URL 검사 방식: Playwright 기반 browser render
- 기본 점수: `Design Signal Score`
- 기본 threshold: design signal 75, accessibility 85
- severity: `low`, `medium`, `high`, `blocking`
- false positive 처리: config ignore와 inline ignore
- v0.1 제외: Figma, 외부 vision API, 사용자 screenshot upload, 자동 수정, telemetry
- 원칙: local-only, no external API by default

이 질문지는 discovery 체크리스트로 유지하고, 실제 실행 기준은 답변 문서와 [roadmap.md](roadmap.md), [architecture.md](architecture.md)에 반영합니다.

## 사용 방법

- 각 질문에는 가능한 한 구체적인 답을 적습니다.
- 확정되지 않은 항목은 `미정`이 아니라 `결정 필요`, `검증 필요`, `v0.2 이후`처럼 상태를 씁니다.
- MVP 범위에 들어가는 답변은 반드시 acceptance criteria로 바꿀 수 있어야 합니다.
- 질문에 답하면서 기능이 늘어나면, 먼저 우선순위를 낮추고 MVP에는 넣지 않는 방향을 기본값으로 둡니다.

## 1. 제품 정체성

1. `unslop`의 가장 짧은 제품 정의는 무엇인가요?
2. “AI slop 제거”를 사용자가 오해하지 않도록 어떻게 설명해야 하나요?
3. `unslop`은 AI 탐지기인가요, 디자인 품질 게이트인가요, 린터인가요, 리뷰어인가요?
4. 제품 철학인 “Don’t detect AI. Restore design intent.”를 공식 메시지로 사용할까요?
5. 사용자가 이 도구를 처음 봤을 때 가장 먼저 이해해야 하는 한 가지는 무엇인가요?
6. `unslop`이 평가하지 않는 것은 무엇인가요?
7. “취향 평가 도구”처럼 보이지 않기 위해 어떤 표현을 피해야 하나요?
8. `unslop`이 틀렸을 때 사용자에게 어떤 방식으로 설명해야 하나요?
9. 경쟁 또는 인접 도구와 비교할 때, 절대 양보하지 않을 차별점은 무엇인가요?
10. 이 프로젝트는 개발자 도구로 시작하나요, 디자이너 도구로 시작하나요, 에이전트용 게이트로 시작하나요?

## 2. 타깃 사용자

1. MVP의 1차 사용자는 누구인가요?
2. 사용자의 직무는 프론트엔드 개발자, 제품 디자이너, PM, 창업자, AI 에이전트 운영자 중 어디에 가장 가깝나요?
3. 이 사용자는 어떤 도구로 UI를 만들고 있나요?
4. v0, Lovable, Bolt, Cursor, Claude Code, Figma Make 같은 생성형 UI 도구 중 우선 지원해야 할 워크플로는 무엇인가요?
5. 사용자는 개인 프로젝트에서 쓰나요, 팀 CI에서 쓰나요, 디자인 리뷰에서 쓰나요?
6. 사용자가 `unslop`을 실행하는 가장 자연스러운 순간은 언제인가요?
7. 사용자는 어떤 실패를 가장 두려워하나요?
8. 사용자는 어떤 결과를 보면 “이 도구가 유용하다”고 판단하나요?
9. 비사용자는 누구인가요?
10. 초기에 의도적으로 만족시키지 않을 사용자군은 누구인가요?

## 3. 대표 사용 시나리오

1. 가장 중요한 첫 번째 use case는 무엇인가요?
2. “AI가 만든 랜딩페이지 배포 전 검사”가 MVP 핵심 시나리오로 충분한가요?
3. “AI가 만든 대시보드 UI 검사”를 랜딩페이지와 같은 우선순위로 볼까요?
4. 사용자는 로컬 개발 서버 URL을 검사하나요, 소스 파일을 검사하나요, 스크린샷을 검사하나요?
5. 사용자는 결과를 터미널에서 볼까요, HTML 리포트로 공유할까요, JSON으로 에이전트에게 넘길까요?
6. CI에서 실패시키는 워크플로가 MVP에 반드시 필요한가요?
7. PR 코멘트나 GitHub Action 연동은 언제 필요하나요?
8. 디자인 리뷰 회의에서 사용할 수 있는 산출물은 무엇이어야 하나요?
9. 에이전트가 스스로 수정 루프를 돌게 하려면 어떤 JSON contract가 필요하나요?
10. 사용자가 첫 실행 후 3분 안에 얻어야 하는 가치는 무엇인가요?

## 4. MVP 범위

1. v0.1에서 반드시 되는 명령어는 무엇인가요?
2. `unslop design check <file>`은 MVP 필수인가요?
3. `unslop design check --url <url>`은 browser render 없이 HTML fetch로 충분한가요?
4. browser-rendered URL 분석은 v0.1에 넣어야 하나요, v0.2로 미뤄야 하나요?
5. 스크린샷 분석은 MVP인가요, 데모용 stretch goal인가요?
6. Figma adapter는 v0.1에서 제외해도 되나요?
7. `fix --write` 자동 수정은 언제 허용할 수 있나요?
8. `design plan`은 단순 텍스트 플랜이면 충분한가요?
9. `design report`는 HTML 파일이면 충분한가요?
10. `agent-check`의 pass/fail 기준은 v0.1에서 얼마나 엄격해야 하나요?
11. TypeScript/React/Tailwind 전용 검사는 MVP에 얼마나 깊게 들어가야 하나요?
12. v0.1에서 절대 넣지 않을 기능은 무엇인가요?

## 5. 입력과 어댑터

1. 우선 지원할 입력 타입의 순서는 무엇인가요?
2. 로컬 파일, 디렉터리, glob 중 어떤 입력을 공식 지원하나요?
3. URL 입력은 localhost 중심인가요, 공개 URL도 지원하나요?
4. URL 검사에서 JavaScript 실행 결과 DOM이 필요한가요?
5. Playwright 같은 브라우저 의존성을 언제 도입할까요?
6. 스크린샷 입력은 어떤 형식을 지원해야 하나요?
7. 이미지 분석은 로컬 vision model, 외부 API, 사용자 제공 LLM 중 무엇을 전제로 하나요?
8. Figma 입력은 REST API부터 시작하나요, plugin부터 시작하나요, MCP agent부터 시작하나요?
9. 디자인 토큰 입력은 JSON, YAML, Style Dictionary, Tailwind config 중 무엇을 우선하나요?
10. `unslop.design.yml`이 없을 때 기본값은 얼마나 강하게 적용되어야 하나요?

## 6. 출력과 리포트

1. 기본 터미널 출력에서 반드시 보여줘야 하는 정보는 무엇인가요?
2. 점수는 단일 점수 중심인가요, 축별 점수 중심인가요?
3. `AI Slop Risk`라는 표현을 계속 사용할까요?
4. `Product Readiness`는 어떤 기준으로 나뉘어야 하나요?
5. finding에는 어떤 필드가 반드시 있어야 하나요?
6. severity는 `high`, `medium`, `low` 세 단계로 충분한가요?
7. fix bucket은 `safe`, `suggested`, `human_review` 세 단계로 충분한가요?
8. 리포트는 사람이 읽는 문서인가요, 에이전트가 읽는 지시문인가요?
9. HTML 리포트에는 스크린샷이나 코드 하이라이트가 필요한가요?
10. JSON schema는 버전 관리가 필요한가요?
11. CI 모드에서는 어떤 조건에서 exit code 1을 반환해야 하나요?
12. false positive가 있을 때 사용자가 억제할 수 있는 메커니즘이 필요한가요?

## 7. 점수 체계

1. `Design Signal Score`는 공식 점수명으로 확정할까요?
2. 점수는 100점 만점이 적절한가요?
3. 점수는 감점식이 좋은가요, 가중 평균식이 좋은가요?
4. 각 축의 기본 가중치는 동일해야 하나요?
5. MVP에서 꼭 필요한 점수 축은 무엇인가요?
6. `Visual Intent`는 deterministic rule만으로 평가 가능한가요?
7. `Product Specificity`는 제품 설정 없이는 어떻게 평가해야 하나요?
8. `Accessibility`는 WCAG 기준을 어느 수준까지 반영해야 하나요?
9. `System Fit`은 토큰 설정이 없을 때도 평가해야 하나요?
10. `Interaction Readiness`에서 상태 누락을 어떻게 판정할까요?
11. 점수가 낮아도 blocking issue가 없으면 pass할 수 있나요?
12. 점수가 높아도 high severity finding이 있으면 fail해야 하나요?

## 8. 룰 설계

1. v0.1에서 반드시 포함할 룰 패밀리는 무엇인가요?
2. visual cliche rule은 어떤 조합일 때만 high severity가 되나요?
3. 보라/시안 그라디언트 자체를 문제로 볼까요, 맥락 없는 조합을 문제로 볼까요?
4. glassmorphism은 언제 허용되나요?
5. card soup는 어떤 기준으로 판정하나요?
6. generic CTA 목록은 어떤 언어를 우선 지원하나요?
7. 한국어 generic copy도 기본 룰에 포함하나요?
8. fake dashboard label은 어떤 단어 목록으로 시작하나요?
9. missing UI states는 어떤 문자열/구조를 근거로 판정하나요?
10. accessibility rule은 어떤 항목부터 시작하나요?
11. Tailwind arbitrary value는 무조건 문제인가요?
12. raw hex color는 언제 허용되나요?
13. false positive를 줄이기 위한 allowlist가 필요한가요?
14. 룰별 테스트 fixture는 어떤 형식으로 관리할까요?
15. 룰 설명은 사용자 문서에도 노출할까요?

## 9. 디자인 시스템과 브랜드 설정

1. `unslop.design.yml`은 필수인가요, 선택인가요?
2. 설정 파일이 없을 때는 generic anti-slop defaults로 검사하나요?
3. 제품명, 제품 유형, primary user, primary tasks는 어떤 검사에 영향을 주나요?
4. brand tone은 실제 룰에 어떻게 반영되나요?
5. `avoid_visuals`는 문자열 매칭인가요, 패턴 매칭인가요?
6. `avoid_copy`는 정확히 일치해야 하나요, 부분 일치도 허용하나요?
7. token spacing scale은 어떤 기본값을 쓸까요?
8. radius scale은 어떤 기본값을 쓸까요?
9. typography scale은 코드에서 어떻게 탐지하나요?
10. Tailwind config를 자동으로 읽어 token 기준을 만들까요?
11. 디자인 시스템 없는 프로젝트도 좋은 점수를 받을 수 있어야 하나요?
12. 브랜드별 profile 생성 기능은 언제 필요한가요?

## 10. CLI UX

1. 최상위 명령은 계속 `unslop design`으로 갈까요?
2. 텍스트/카피 검사까지 포함하려면 `unslop copy`가 별도로 필요한가요?
3. `check`, `plan`, `report`, `fix`, `agent-check`의 역할 구분은 명확한가요?
4. `fix --safe`는 기본적으로 파일을 쓰지 않는 게 맞나요?
5. 자동 수정은 `--write` 없이 절대 실행하지 않는 정책으로 갈까요?
6. `--threshold` 기본값은 설정 파일에서 오나요, CLI 기본값이 있나요?
7. `--json` 출력은 모든 명령에서 동일한 schema를 써야 하나요?
8. `--ci`는 어떤 부가 동작을 하나요?
9. `--product` 인자는 임시 제품 맥락으로만 쓰나요?
10. 오류 메시지는 짧게 할까요, 다음 액션까지 포함할까요?
11. 첫 실행 도움말에서 어떤 예제를 가장 먼저 보여줄까요?
12. 명령 이름이 길어도 명확한 쪽을 우선할까요?

## 11. 에이전트 워크플로

1. agent mode의 1차 소비자는 누구인가요?
2. AI coding agent가 읽기 좋은 JSON output에는 어떤 필드가 필요하나요?
3. `decision` 값은 `pass`, `revise`, `block`으로 충분한가요?
4. 에이전트가 자동 적용해도 되는 safe fix는 무엇인가요?
5. human review required는 어떤 경우에 반드시 true가 되어야 하나요?
6. 에이전트가 재검사 루프를 돌 때 이전 결과와 비교해야 하나요?
7. finding마다 target selector나 file location이 필수인가요?
8. screenshot/Figma에서는 node id 또는 bounding box가 필요하나요?
9. 에이전트용 출력은 자연어를 줄이고 schema를 더 엄격히 해야 하나요?
10. agent mode에서 LLM 호출을 허용할 계획이 있나요?

## 12. 오픈소스 운영

1. 라이선스는 MIT로 확정인가요?
2. 첫 공개 버전은 npm에 publish하나요, GitHub repo 공개만 하나요?
3. 패키지 이름은 `@unslop/cli`로 확정인가요?
4. npm organization을 만들 계획이 있나요?
5. contribution guideline에서 어떤 종류의 룰 PR을 받을까요?
6. 룰 추가 PR에는 fixture/test를 필수로 요구할까요?
7. false positive issue template이 필요한가요?
8. design rule discussion은 GitHub Discussions로 받을까요?
9. 로드맵은 docs에 둘까요, GitHub Projects로 관리할까요?
10. 릴리즈 노트에는 rule changes를 어떻게 기록할까요?
11. breaking change 기준은 무엇인가요?
12. 보안 정책에서 URL 검사와 외부 리소스 접근 위험을 어떻게 설명할까요?

## 13. 데이터와 개인정보

1. URL 검사는 외부 서버로 데이터를 보내나요?
2. screenshot vision 분석이 들어가면 이미지가 외부 API로 전송될 수 있나요?
3. 기본값은 local-only로 보장해야 하나요?
4. 사용자가 민감한 제품 화면을 검사할 때 어떤 경고가 필요하나요?
5. 리포트에 원본 코드/HTML 일부가 포함되어도 되나요?
6. HTML report는 secrets를 마스킹해야 하나요?
7. 에이전트 JSON output에 사용자 데이터가 포함될 수 있나요?
8. CI 로그에 너무 많은 원문 evidence를 출력하지 않도록 제한해야 하나요?
9. telemetry를 넣을 계획이 있나요?
10. telemetry를 넣는다면 opt-in인가요, opt-out인가요?

## 14. 성능과 의존성

1. CLI 실행 시간 목표는 얼마인가요?
2. 로컬 파일 검사에서 허용할 최대 파일 수나 크기는 얼마인가요?
3. URL fetch timeout 기본값은 얼마인가요?
4. browser-rendered adapter 도입 시 Playwright dependency를 optional로 둘까요?
5. screenshot vision adapter는 optional package로 분리할까요?
6. Figma adapter는 별도 package로 분리할까요?
7. core rule engine은 dependency-free를 유지해야 하나요?
8. monorepo 패키지 분리는 언제 필요한가요?
9. config parser는 자체 tiny YAML로 충분한가요, 정식 YAML parser가 필요한가요?
10. Node 지원 버전은 `>=20`으로 충분한가요?

## 15. 품질 기준

1. v0.1 완료의 acceptance criteria는 무엇인가요?
2. 모든 룰은 테스트 fixture를 가져야 하나요?
3. CLI 명령별 smoke test가 필요한가요?
4. URL fetch는 mock test가 필요한가요?
5. JSON output은 snapshot test로 고정할까요?
6. HTML report는 최소 구조만 테스트하나요?
7. TypeScript strict mode는 계속 유지하나요?
8. lint는 `tsc --noEmit`로 충분한가요, ESLint가 필요한가요?
9. GitHub Actions CI는 언제 추가하나요?
10. release 전 필수 체크는 무엇인가요?

## 16. 데모와 메시징

1. README 첫 데모는 어떤 before/after를 보여줘야 하나요?
2. TOPIK learning app 예시는 계속 사용할까요?
3. SaaS generic dashboard 예시가 더 범용적인가요?
4. `AI made it look polished. unslop makes it product-ready.` 문구를 사용할까요?
5. 데모에서 실제 CLI output은 어느 정도 길이가 적절한가요?
6. “purple/cyan gradient”를 언급할 때 특정 스타일을 과도하게 비난하는 인상을 줄 수 있나요?
7. 제품 메시지에서 한국어/영어 중 어떤 언어를 우선하나요?
8. 공식 README는 영어로 쓰고, 별도 한국어 문서를 둘까요?
9. landing page가 필요하다면 언제 만들까요?
10. 첫 공개 트윗/블로그 포스트의 핵심 문장은 무엇이어야 하나요?

## 17. 로드맵 결정

1. v0.1의 최종 scope는 무엇인가요?
2. v0.2에서 반드시 추가할 것은 fix plan인가요, HTML report 개선인가요, browser render인가요?
3. v0.3은 React/Tailwind AST 분석으로 확정인가요?
4. Figma adapter는 v0.4로 충분한가요?
5. agent mode는 v0.5까지 기다려도 되나요, 현재부터 강화해야 하나요?
6. npm publish는 어느 버전에서 하나요?
7. GitHub Action은 어느 버전에서 제공하나요?
8. VS Code extension이나 Figma plugin은 장기 로드맵에 있나요?
9. 유료/상용 확장 가능성을 고려해야 하나요?
10. 30일 안에 보여줄 수 있는 가장 강한 결과물은 무엇인가요?

## 18. 결정 로그

아래 표는 기획자가 답변 후 바로 결정 기록으로 남기기 위한 영역입니다.

| 항목 | 결정 | 근거 | 상태 | 담당 |
| --- | --- | --- | --- | --- |
| 1차 사용자 |  |  | 결정 필요 |  |
| v0.1 핵심 입력 |  |  | 결정 필요 |  |
| v0.1 필수 명령 |  |  | 결정 필요 |  |
| 기본 점수 기준 |  |  | 결정 필요 |  |
| CI 실패 기준 |  |  | 결정 필요 |  |
| URL 검사 방식 |  |  | 결정 필요 |  |
| 스크린샷 adapter 시점 |  |  | 결정 필요 |  |
| Figma adapter 시점 |  |  | 결정 필요 |  |
| 자동 수정 정책 |  |  | 결정 필요 |  |
| npm publish 시점 |  |  | 결정 필요 |  |

## 19. MVP 승인 체크리스트

- [ ] 제품 정의가 한 문장으로 합의되었다.
- [ ] 1차 사용자가 명확하다.
- [ ] v0.1에서 지원할 입력 타입이 확정되었다.
- [ ] v0.1에서 제외할 기능이 명확하다.
- [ ] CLI 명령별 기대 출력이 합의되었다.
- [ ] 점수와 severity 기준이 합의되었다.
- [ ] false positive 처리 원칙이 있다.
- [ ] config 파일의 역할이 합의되었다.
- [ ] 오픈소스 공개 범위와 라이선스가 합의되었다.
- [ ] 개인정보/외부 API 전송 정책이 합의되었다.
- [ ] v0.1 acceptance criteria가 테스트 가능한 문장으로 정리되었다.
