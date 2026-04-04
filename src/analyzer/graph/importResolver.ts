import path from "path";

export function buildImportMap(files: any[]) {
  const map = new Map<string, string>();

  for (const file of files) {
    const filePath = file.file;

    for (const imp of file.imports || []) {
      const baseDir = path.dirname(filePath);

      let resolvedBase = path.join(baseDir, imp.source);

      // 🔥 handle folder imports → index.ts
      if (!resolvedBase.endsWith(".ts")) {
        resolvedBase += ".ts";
      }

      for (const name of imp.specifiers) {
        map.set(name, resolvedBase);
      }
    }
  }

  return map;
}
