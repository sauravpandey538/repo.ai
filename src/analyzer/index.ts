import Parser from "tree-sitter";

import { extractFunctions } from "./extract/functions.js";
import { extractImports } from "./extract/imports.js";
import { extractExports } from "./extract/exports.js";
import { extractVariables } from "./extract/variables.js";
import { extractClasses } from "./extract/classes.js";
import { extractCalls } from "./extract/calls.js";

export function analyzeFile(root: any, code: string, file: string) {
  // 🔥 Step 1: extract base data
  const functions = extractFunctions(root, code, file);
  const calls = extractCalls(root);

  // 🔥 Step 2: attach calls to functions (MVP: global calls)
  const enrichedFunctions = functions.map((fn: any) => ({
    ...fn,
    file, // ensure file exists
    calls: calls.map((c: any) => c.name), // attach calls
  }));

  return {
    file,
    functions: enrichedFunctions,
    imports: extractImports(root),
    exports: extractExports(root),
    variables: extractVariables(root),
    classes: extractClasses(root),
  };
}
