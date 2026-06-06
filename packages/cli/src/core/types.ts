export type Severity = "blocking" | "high" | "medium" | "low";

export type ScoreAxis =
  | "visual_intent"
  | "product_specificity"
  | "hierarchy"
  | "system_fit"
  | "accessibility"
  | "interaction_readiness"
  | "brand_distinctiveness"
  | "implementation_readiness"
  | "copy_signal";

export type FixKind = "safe" | "suggested" | "human_review";

export interface SourceFile {
  path: string;
  content: string;
}

export interface AuditInput {
  kind: "code" | "url" | "text" | "image";
  target: string;
  content: string;
  files: SourceFile[];
  metadata: Record<string, string | number | boolean>;
}

export interface ProductConfig {
  name?: string;
  type?: string;
  primary_user?: string;
  primary_tasks?: string[];
}

export interface BrandConfig {
  tone?: string[];
  avoid_visuals?: string[];
  avoid_copy?: string[];
}

export interface TokenConfig {
  spacing?: number[];
  radius?: Record<string, number>;
  typography?: {
    sizes?: number[];
  };
}

export interface ThresholdConfig {
  design_signal?: number;
  accessibility?: number;
  system_fit?: number;
  product_specificity?: number;
}

export interface IgnoreConfig {
  rule_id: string;
  target?: string;
  reason?: string;
}

export interface AuditConfig {
  product?: ProductConfig;
  brand?: BrandConfig;
  tokens?: TokenConfig;
  thresholds?: ThresholdConfig;
  ignore?: IgnoreConfig[];
}

export interface SourceLocation {
  path: string;
  line: number;
  column?: number;
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  axis: ScoreAxis;
  message: string;
  suggestion: string;
  evidence?: string;
  source?: SourceLocation;
  fixKind: FixKind;
}

export interface AxisScore {
  axis: ScoreAxis;
  score: number;
}

export interface AuditScores {
  designSignal: number;
  aiSlopRisk: "Very High" | "High" | "Medium" | "Low";
  productReadiness: "Blocked" | "Low" | "Needs work" | "Good" | "Ready";
  axes: AxisScore[];
}

export interface AuditResult {
  input: AuditInput;
  config: AuditConfig;
  findings: Finding[];
  scores: AuditScores;
}

export interface Rule {
  id: string;
  run(input: AuditInput, config: AuditConfig): Finding[];
}

export interface CliOptions {
  json?: boolean;
  ci?: boolean;
  stdin?: boolean;
  safe?: boolean;
  suggest?: boolean;
  write?: boolean;
  force?: boolean;
  agent?: boolean;
  failOnHigh?: boolean;
  tailwind?: boolean;
  url?: string;
  figma?: string;
  output?: string;
  threshold?: number;
  accessibilityThreshold?: number;
  config?: string;
  product?: string;
}
