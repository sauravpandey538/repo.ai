import path from "path";

export function buildImportMap(files: any[]) {
  const map = new Map<string, string>();

  for (const file of files) {
    const filePath = file.file;

    for (const imp of file.imports || []) {
      const baseDir = path.dirname(filePath);

      for (const name of imp.specifiers) {
        let resolvedPath = path.join(baseDir, imp.source);

        // 🔥 add extension if missing
        if (!resolvedPath.endsWith(".ts")) {
          resolvedPath += ".ts";
        }

        map.set(name, resolvedPath);
      }
    }
  }

  return map;
}
