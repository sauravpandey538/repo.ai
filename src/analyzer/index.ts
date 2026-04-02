import Parser from "tree-sitter";

import { extractFunctions } from "./extract/functions.js";
import { extractImports } from "./extract/imports.js";
import { extractExports } from "./extract/exports.js";
import { extractVariables } from "./extract/variables.js";
import { extractClasses } from "./extract/classes.js";
import { extractCalls } from "./extract/calls.js";

export function analyzeFile(root: any, code: string, file: string) {
  return {
    file,
    functions: extractFunctions(root, code, file),
    imports: extractImports(root, code),
    exports: extractExports(root),
    variables: extractVariables(root),
    classes: extractClasses(root),
  };
}
