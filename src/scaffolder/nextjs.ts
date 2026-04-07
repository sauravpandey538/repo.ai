import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

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

async function runNpmInstall(cwd: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npm", ["install"], {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install failed with exit code ${code}`));
      }
    });
  });
}

export async function scaffoldNextJsProject(targetPath: string) {
  if (!path.isAbsolute(targetPath)) {
    throw new Error("targetPath must be an absolute path");
  }

  await ensureDir(targetPath);

  const packageJsonPath = path.join(targetPath, "package.json");
  const hasPackageJson = await fileExists(packageJsonPath);

  if (!hasPackageJson) {
    const packageJson = {
      name: path.basename(targetPath) || "nextjs-app",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        next: "latest",
        react: "latest",
        "react-dom": "latest",
      },
      devDependencies: {
        typescript: "latest",
        "@types/react": "latest",
        "@types/node": "latest",
        eslint: "latest",
        "eslint-config-next": "latest",
      },
    };

    await writeFileSafely(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n",
      { overwrite: false },
    );
  }

  const tsconfigPath = path.join(targetPath, "tsconfig.json");
  await writeFileSafely(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        exclude: ["node_modules"],
      },
      null,
      2,
    ) + "\n",
  );

  const nextEnvPath = path.join(targetPath, "next-env.d.ts");
  await writeFileSafely(
    nextEnvPath,
    '/// <reference types="next" />\n/// <reference types="next/types/global" />\n',
  );

  const appDir = path.join(targetPath, "app");
  await ensureDir(appDir);

  const rootPagePath = path.join(appDir, "page.tsx");
  const rootPageContents = `export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Welcome to your repo.ai-created Next.js app</h1>
      <p>
        This project was scaffolded by repo.ai. You can now ask repo.ai to add
        new pages and features here.
      </p>
    </main>
  );
}
`;

  await writeFileSafely(rootPagePath, rootPageContents);

  const appGlobalsPath = path.join(appDir, "globals.css");
  const appGlobalsContents = `:root {
  --background: #ffffff;
  --foreground: #111827;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background-color: var(--background);
  color: var(--foreground);
}

a {
  color: inherit;
  text-decoration: none;
}
`;

  await writeFileSafely(appGlobalsPath, appGlobalsContents);

  const layoutPath = path.join(appDir, "layout.tsx");
  const layoutContents = `import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "repo.ai Next.js app",
  description: "Scaffolded by repo.ai",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  await writeFileSafely(layoutPath, layoutContents);

  const nodeModulesPath = path.join(targetPath, "node_modules");
  const hasNodeModules = await fileExists(nodeModulesPath);

  if (!hasNodeModules) {
    await runNpmInstall(targetPath);
  }
}

