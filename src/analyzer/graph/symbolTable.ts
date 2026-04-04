export function buildSymbolTable(
  importMap: Map<string, string>,
  exportMap: Map<string, string>,
) {
  const table = new Map<string, string>();

  // 🔥 imports override local exports
  for (const [name, file] of importMap.entries()) {
    table.set(name, file);
  }

  for (const [name, file] of exportMap.entries()) {
    if (!table.has(name)) {
      table.set(name, file);
    }
  }

  return table;
}
