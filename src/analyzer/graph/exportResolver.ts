export function buildExportMap(files: any[]) {
  const exportMap = new Map<string, string>();

  for (const file of files) {
    const filePath = file.file;

    // 🔥 functions are exports (MVP assumption)
    for (const fn of file.functions || []) {
      if (fn.name) {
        exportMap.set(fn.name, filePath);
      }
    }

    // 🔥 also include explicit exports (optional)
    for (const exp of file.exports || []) {
      if (exp.name) {
        exportMap.set(exp.name, filePath);
      }
    }
  }

  return exportMap;
}
