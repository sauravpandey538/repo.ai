import express from "express";
import { walkRepo } from "./parser/walkRepo.js";
import { buildCallGraph } from "./analyzer/graph/callGraph.js";
import { buildImportMap } from "./analyzer/graph/importResolver.js";
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

    const callGraph = buildCallGraph(result, importMap);
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
