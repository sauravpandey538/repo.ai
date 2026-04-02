export function buildCallGraph(files: any[], importMap: Map<string, string>) {
  const graph = new Map<string, Set<string>>();

  for (const file of files) {
    for (const fn of file.functions || []) {
      if (!fn.name) continue;

      const fromKey = `${fn.name}@${file.file}`;

      if (!graph.has(fromKey)) {
        graph.set(fromKey, new Set());
      }

      for (const call of fn.calls || []) {
        let toKey = call;

        // 🔥 resolve cross-file
        if (importMap.has(call)) {
          const targetFile = importMap.get(call);
          toKey = `${call}@${targetFile}`;
        }

        graph.get(fromKey)!.add(toKey);
      }
    }
  }

  return graph;
}
