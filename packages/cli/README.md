# @unslop/cli

CLI package for `unslop`.

```bash
unslop design init
unslop design check src/app/page.tsx
unslop design check --url http://localhost:3000 --json --agent
unslop design check --url http://localhost:3000 --threshold 75 --accessibility-threshold 85 --ci
unslop design plan src/app/page.tsx
unslop design fix src/app/page.tsx --safe
unslop design report src/app/page.tsx -o unslop-report.html
```

URL checks render through Playwright when it is available locally. Without Playwright, or when Playwright cannot launch a browser, the CLI falls back to `fetch` and records that fallback in result metadata. Page render failures are reported instead of silently downgrading to `fetch`.

JSON output uses schema version `0.1.0` with `decision`, score axes, findings, fix buckets, and `next_action`.
