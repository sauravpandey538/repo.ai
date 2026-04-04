export function getImpact(
  target: string,
  reverseGraph: Record<string, string[]>,
) {
  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(node: string) {
    if (visited.has(node)) return;
    visited.add(node);

    const parents = reverseGraph[node] || [];

    for (const p of parents) {
      result.push(p);
      dfs(p);
    }
  }

  dfs(target);

  return result;
}
