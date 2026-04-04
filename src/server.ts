import express from "express";
import { walkRepo } from "./parser/walkRepo.js";
import { buildCallGraph } from "./analyzer/graph/callGraph.js";
import { buildImportMap } from "./analyzer/graph/importResolver.js";
import { buildExportMap } from "./analyzer/graph/exportResolver.js";
import { buildSymbolTable } from "./analyzer/graph/symbolTable.js";

import { buildReverseGraph } from "./analyzer/graph/reverseGraph.js";
import { getImpact } from "./analyzer/graph/impact.js";
const app = express();
app.use(express.json());

app.get("/api", async (req, res) => {
  res.json({
    message: "Success",
  });
});

app.post("/parse-repo", async (req, res) => {
  try {
    const { repoPath } = req.body;

    const result = await walkRepo(repoPath);
    const importMap = buildImportMap(result);
    const exportMap = buildExportMap(result);
    const symbolTable = buildSymbolTable(importMap, exportMap);
    const callGraph = buildCallGraph(result, symbolTable);

    res.json({
      success: true,
      data: result,
      callGraph: Object.fromEntries(
        [...callGraph.entries()].map(([k, v]) => [k, [...v]]),
      ),
    });
  } catch (err: any) {
    console.error("🔥 API Error:", err.message);

    res.status(500).json({ error: err.message });
  }
});
app.post("/impact", async (req, res) => {
  try {
    const { functionKey, callGraph } = req.body;

    const reverseGraph = buildReverseGraph(callGraph);

    const affected = getImpact(functionKey, reverseGraph);

    res.json({
      target: functionKey,
      affected,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
