import type { Rule } from "../core/types.js";
import { accessibilityRule } from "./accessibility.js";
import { designSystemRule } from "./design-system.js";
import { implementationRule } from "./implementation.js";
import { uiCopyRule } from "./ui-copy.js";
import { visualClicheRule } from "./visual-cliche.js";

export const defaultRules: Rule[] = [
  visualClicheRule,
  uiCopyRule,
  designSystemRule,
  accessibilityRule,
  implementationRule
];
