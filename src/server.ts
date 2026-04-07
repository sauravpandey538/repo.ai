import express, { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { walkRepo } from "./parser/walkRepo.js";
import { buildCallGraph } from "./analyzer/graph/callGraph.js";
import { buildImportMap } from "./analyzer/graph/importResolver.js";
import { buildExportMap } from "./analyzer/graph/exportResolver.js";
import { buildSymbolTable } from "./analyzer/graph/symbolTable.js";
import { buildReverseGraph } from "./analyzer/graph/reverseGraph.js";
import { getImpact } from "./analyzer/graph/impact.js";
import { scaffoldNextJsProject } from "./scaffolder/nextjs.js";
import { applyFeatureToNextProject, Feature } from "./features/applyFeature.js";
import { applyPromptWithLlm } from "./features/llmPromptApply.js";

type ParseRepoRequestBody = {
  repoPath: string;
};

type ScaffoldNextJsRequestBody = {
  targetPath: string;
};

type ImpactRequestBody = {
  functionKey: string;
  callGraph: Record<string, string[]>;
};

type ApplyFeatureRequestBody = {
  targetPath: string;
  feature: Feature;
};

type ApplyPromptRequestBody = {
  targetPath: string;
  prompt: string;
};

const app = express();
app.use(express.json());

app.get("/api", async (_req: Request, res: Response) => {
  res.json({
    message: "Success",
  });
});

app.post(
  "/parse-repo",
  async (
    req: Request<unknown, unknown, ParseRepoRequestBody>,
    res: Response,
  ) => {
    try {
      const { repoPath } = req.body;

      if (!repoPath || typeof repoPath !== "string") {
        return res.status(400).json({ error: "repoPath (string) is required" });
      }

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
  },
);

app.post(
  "/scaffold-nextjs",
  async (
    req: Request<unknown, unknown, ScaffoldNextJsRequestBody>,
    res: Response,
  ) => {
    try {
      const { targetPath } = req.body;

      if (!targetPath || typeof targetPath !== "string") {
        return res
          .status(400)
          .json({ error: "targetPath (string) is required" });
      }

      await scaffoldNextJsProject(targetPath);

      const entryPagePath = path.join(targetPath, "app", "page.tsx");
      let entryPageContent: string | null = null;

      try {
        entryPageContent = await fs.readFile(entryPagePath, "utf-8");
      } catch {
        entryPageContent = null;
      }

      return res.json({
        success: true,
        targetPath,
        message:
          "Next.js project scaffolded (or validated) at targetPath. You can preview the main page.tsx content from this response and then run `npm run dev` in that folder to see it in the browser.",
        entryPage: {
          path: entryPagePath,
          content: entryPageContent,
        },
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("🔥 Scaffold API Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/impact",
  async (req: Request<unknown, unknown, ImpactRequestBody>, res: Response) => {
    try {
      const { functionKey, callGraph } = req.body;

      if (!functionKey || typeof functionKey !== "string") {
        return res
          .status(400)
          .json({ error: "functionKey (string) is required" });
      }

      if (!callGraph || typeof callGraph !== "object") {
        return res
          .status(400)
          .json({ error: "callGraph (record of arrays) is required" });
      }

      const reverseGraph = buildReverseGraph(callGraph);

      const affected = getImpact(functionKey, reverseGraph);

      res.json({
        target: functionKey,
        affected,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/apply-feature",
  async (
    req: Request<unknown, unknown, ApplyFeatureRequestBody>,
    res: Response,
  ) => {
    try {
      const { targetPath, feature } = req.body;

      if (!targetPath || typeof targetPath !== "string") {
        return res
          .status(400)
          .json({ error: "targetPath (string) is required" });
      }

      if (!feature || typeof feature !== "object") {
        return res.status(400).json({ error: "feature (object) is required" });
      }

      const result = await applyFeatureToNextProject({
        targetPath,
        feature,
      });

      return res.json(result);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("🔥 Apply Feature API Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/apply-prompt",
  async (
    req: Request<unknown, unknown, ApplyPromptRequestBody>,
    res: Response,
  ) => {
    try {
      const { targetPath, prompt } = req.body;

      if (!targetPath || typeof targetPath !== "string") {
        return res
          .status(400)
          .json({ error: "targetPath (string) is required" });
      }

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "prompt (string) is required" });
      }

      const result = await applyPromptWithLlm({
        targetPath,
        prompt,
      });

      return res.json(result);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("🔥 Apply Prompt API Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
