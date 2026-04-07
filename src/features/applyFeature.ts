import fs from "fs/promises";
import path from "path";

type FileWriteOptions = {
  overwrite?: boolean;
};

async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeFileSafely(
  filePath: string,
  contents: string,
  options: FileWriteOptions = {},
) {
  const shouldOverwrite = options.overwrite ?? false;
  const exists = await fileExists(filePath);

  if (exists && !shouldOverwrite) {
    return;
  }

  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, contents, "utf-8");
}

export type AddSimplePageFeature = {
  type: "addSimplePage";
  /**
   * Route path, for example:
   * - "/about"
   * - "/blog"
   * - "/blog/posts"
   */
  route: string;
  /**
   * Optional title for the page (used in the <h1>).
   * If not provided, will be derived from the route.
   */
  title?: string;
  /**
   * Optional paragraph content.
   */
  content?: string;
};

export type Feature =
  | AddSimplePageFeature;

export type ApplyFeatureInput = {
  targetPath: string;
  feature: Feature;
};

export type ApplyFeatureResult = {
  success: boolean;
  message: string;
  writtenFiles: string[];
  skippedFiles: string[];
};

function normalizeRoute(route: string): string {
  if (!route.startsWith("/")) {
    return `/${route}`;
  }
  return route;
}

function routeToSegments(route: string): string[] {
  const normalized = normalizeRoute(route);
  return normalized
    .split("/")
    .filter(Boolean);
}

function inferTitleFromRoute(route: string): string {
  const segments = routeToSegments(route);
  const last = segments[segments.length - 1] ?? "Page";
  const words = last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(" ") || "Page";
}

async function applyAddSimplePageFeature(
  targetPath: string,
  feature: AddSimplePageFeature,
): Promise<ApplyFeatureResult> {
  if (!path.isAbsolute(targetPath)) {
    throw new Error("targetPath must be an absolute path");
  }

  const segments = routeToSegments(feature.route);

  const appDir = path.join(targetPath, "app");
  await ensureDir(appDir);

  const pageDir =
    segments.length === 0
      ? appDir
      : path.join(appDir, ...segments);

  const pagePath = path.join(pageDir, "page.tsx");

  const title = feature.title ?? inferTitleFromRoute(feature.route);
  const content =
    feature.content ??
    `This page (route "${normalizeRoute(feature.route)}") was created by repo.ai.`;

  const pageComponentName = `${title.replace(/\s+/g, "")}Page`;

  const pageContents = `export default function ${pageComponentName}() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>${title}</h1>
      <p>${content}</p>
    </main>
  );
}
`;

  const exists = await fileExists(pagePath);
  const writtenFiles: string[] = [];
  const skippedFiles: string[] = [];

  if (exists) {
    skippedFiles.push(pagePath);
  } else {
    await writeFileSafely(pagePath, pageContents);
    writtenFiles.push(pagePath);
  }

  const message = exists
    ? `Page already existed at route "${normalizeRoute(feature.route)}". No file was overwritten.`
    : `Created new page for route "${normalizeRoute(feature.route)}" at ${pagePath}.`;

  return {
    success: true,
    message,
    writtenFiles,
    skippedFiles,
  };
}

export async function applyFeatureToNextProject(
  input: ApplyFeatureInput,
): Promise<ApplyFeatureResult> {
  const { targetPath, feature } = input;

  if (!targetPath || typeof targetPath !== "string") {
    throw new Error("targetPath (string) is required");
  }

  if (!path.isAbsolute(targetPath)) {
    throw new Error("targetPath must be an absolute path");
  }

  const packageJsonPath = path.join(targetPath, "package.json");
  const hasPackageJson = await fileExists(packageJsonPath);

  if (!hasPackageJson) {
    throw new Error(
      `No package.json found at targetPath. Please scaffold a Next.js app first using /scaffold-nextjs.`,
    );
  }

  switch (feature.type) {
    case "addSimplePage": {
      return applyAddSimplePageFeature(targetPath, feature);
    }
    default: {
      // Exhaustiveness check
      const _exhaustive: never = feature;
      throw new Error(`Unsupported feature type: ${(feature as any).type}`);
    }
  }
}

