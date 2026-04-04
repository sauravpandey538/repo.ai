import { resolveCall } from "./resolver.js";

export function buildCallGraph(files: any[], symbolTable: Map<string, string>) {
  const graph = new Map<string, Set<string>>();

  for (const file of files) {
    for (const fn of file.functions || []) {
      if (!fn.name) continue;

      const fromKey = `${fn.name}@${file.file}`;

      if (!graph.has(fromKey)) {
        graph.set(fromKey, new Set());
      }

      for (const call of fn.calls || []) {
        const resolved = resolveCall(call, file.file, symbolTable);
        if (!resolved) continue; // 🚨 skip junk
        if (fromKey === resolved) continue;

        graph.get(fromKey)!.add(resolved);
      }
    }
  }

  return graph;
}
