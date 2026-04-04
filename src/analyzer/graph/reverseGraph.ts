export function buildReverseGraph(graph: Record<string, string[]>) {
  const reverse: Record<string, Set<string>> = {};

  for (const from in graph) {
    for (const to of graph[from]) {
      if (!reverse[to]) {
        reverse[to] = new Set();
      }

      reverse[to].add(from);
    }
  }

  // convert Set → array
  const result: Record<string, string[]> = {};
  for (const key in reverse) {
    result[key] = Array.from(reverse[key]);
  }

  return result;
}
