#!/usr/bin/env node
import { run } from "../cli.js";

try {
  const exitCode = await run(process.argv.slice(2));
  process.exitCode = exitCode;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
