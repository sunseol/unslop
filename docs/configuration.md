# Configuration

`unslop` looks for a config file in the current working directory:

- `unslop.design.yml`
- `unslop.design.yaml`
- `unslop.design.json`

The YAML loader in the current scaffold intentionally supports only a small, predictable subset: nested objects, lists, quoted strings, numbers, booleans, and inline arrays.

```yaml
product:
  name: "DOTORE TOPIK"
  type: "education"
  primary_user: "TOPIK learners"
  primary_tasks:
    - solve questions
    - review wrong answers

brand:
  avoid_visuals:
    - neon glow
    - purple cyan gradient
  avoid_copy:
    - "사용자 경험을 향상"
    - "AI-powered insights"

tokens:
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64]
  radius:
    sm: 6
    md: 10
    lg: 16

thresholds:
  design_signal: 75
  accessibility: 85

ignore:
  - rule_id: generic-cta-get-started
    target: "app/page.tsx"
    reason: "Temporary launch CTA approved by product."
```

Inline suppression is available for a single following source line:

```tsx
// unslop-ignore-next-line image-missing-alt -- decorative image handled by CSS
<img src="/hero.png">
```

`ignore.target` matches the finding source path exactly or as a path suffix. It does not match finding evidence text or arbitrary substrings inside sibling filenames.
