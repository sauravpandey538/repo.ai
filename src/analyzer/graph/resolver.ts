const IGNORED = new Set([
  // AST internals
  "child",
  "childForFieldName",

  // JS built-ins
  "push",
  "pop",
  "slice",
  "map",
  "filter",
  "reduce",
  "forEach",
  "find",
  "includes",
  "replace",

  // Node/path
  "dirname",
  "join",
  "endsWith",

  // misc
  "log",
  "error",
  "warn",
]);

export function resolveCall(
  callName: string,
  currentFile: string,
  symbolTable: Map<string, string>,
) {
  // 🚨 IGNORE NOISE COMPLETELY
  if (IGNORED.has(callName)) {
    return null;
  }

  // ✅ resolve known symbols
  if (symbolTable.has(callName)) {
    const targetFile = symbolTable.get(callName);
    return `${callName}@${targetFile}`;
  }

  // ❌ unknown → skip (better than polluting graph)
  return null;
}
