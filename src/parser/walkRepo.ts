import fs from "fs/promises";
import path from "path";
import { parseFile } from "./parseFile.js";
import pLimit from "p-limit";
import { ignoreFiles } from "./rules.js";

const limit = pLimit(3); // only for files

export async function walkRepo(dir: string): Promise<any[]> {
  let results: any[] = [];

  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    console.error(`❌ Failed to read dir: ${dir}`);
    return results;
  }

  const tasks: Promise<any>[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // 🔹 Handle directories (NO LIMIT HERE)
    if (entry.isDirectory()) {
      if (ignoreFiles.includes(entry.name)) {
        console.log(`⏭️ Skipping folder: ${fullPath}`);
        continue;
      }

      tasks.push(walkRepo(fullPath));
      continue;
    }

    // 🔹 Handle files (LIMIT HERE ONLY)
    if (fullPath.endsWith(".ts") || fullPath.endsWith(".js")) {
      tasks.push(
        limit(async () => {
          const result = await parseFile(fullPath);

          return result;
        }),
      );
    } else {
      console.log(`⚪ Ignored file: ${fullPath}`);
    }
  }

  const resolved = await Promise.all(tasks);

  for (const r of resolved) {
    if (Array.isArray(r)) {
      results.push(...r);
    } else if (r) {
      results.push(r);
    }
  }

  return results;
}
