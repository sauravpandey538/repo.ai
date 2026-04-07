import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

type ApplyPromptInput = {
  targetPath: string;
  prompt: string;
};

type ApplyPromptResult = {
  success: boolean;
  message: string;
  targetPath: string;
  updatedFile: {
    path: string;
    content: string;
  };
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function applyPromptWithLlm(
  input: ApplyPromptInput,
): Promise<ApplyPromptResult> {
  const { targetPath, prompt } = input;

  if (!path.isAbsolute(targetPath)) {
    throw new Error("targetPath must be an absolute path");
  }

  const appDir = path.join(targetPath, "app");
  const pagePath = path.join(appDir, "page.tsx");

  const hasPage = await fileExists(pagePath);
  if (!hasPage) {
    throw new Error(
      `Could not find app/page.tsx at targetPath. Please scaffold a Next.js app first using /scaffold-nextjs.`,
    );
  }

  const existingContent = await fs.readFile(pagePath, "utf-8");

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Please set it before calling this endpoint.",
    );
  }

  const client = new OpenAI({
    apiKey,
  });

  const systemPrompt =
    "You are an assistant that edits a Next.js App Router root page component at app/page.tsx. " +
    "Given the existing file content and a user request, you return a FULL, UPDATED file. " +
    "Respond with ONLY valid TypeScript/TSX code for app/page.tsx. Do not include comments, explanations, or markdown fences.";

  const userPrompt = [
    "Existing app/page.tsx:",
    "```tsx",
    existingContent,
    "```",
    "",
    "User request (describe how to change the page):",
    prompt,
    "",
    "Now output the complete new contents of app/page.tsx.",
  ].join("\n");

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  let newContent =
    completion.choices[0]?.message?.content?.toString().trim() ?? "";

  if (newContent.startsWith("```")) {
    newContent = newContent.replace(/^```[a-zA-Z]*\n?/, "");
    if (newContent.endsWith("```")) {
      newContent = newContent.slice(0, -3);
    }
    newContent = newContent.trim();
  }

  if (!newContent) {
    throw new Error("Model returned empty content for app/page.tsx");
  }

  await fs.writeFile(pagePath, newContent, "utf-8");

  return {
    success: true,
    message:
      "app/page.tsx was updated based on your prompt. You can now refresh your Next.js app to see the changes.",
    targetPath,
    updatedFile: {
      path: pagePath,
      content: newContent,
    },
  };
}
