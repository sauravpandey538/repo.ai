# repo.ai

repo.ai is a **local API tool** that you can call (for example from **Postman**) with a **folder path on your machine**, and it will:

1. **Create a simple Next.js project** in that folder (if it does not exist yet).
2. **Add or modify features** in that Next.js project when you describe what you want in natural language.

Think of it as: “Give me a path on my laptop, and repo.ai will be the assistant that builds and grows a Next.js app in that folder.”

---

## High-level idea (in beginner-friendly words)

- You run repo.ai locally (Node.js server).
- You send an **HTTP request** (from Postman) with:
  - The **folder path** where you want your Next.js project to live.
  - Optionally a **feature description** (for example: “add a login page with email and password”).
- repo.ai is responsible for:
  - Creating the base **Next.js** project structure when needed.
  - Editing or adding files in that project to implement the requested feature.

Right now, the repo already has a **code analyzer** that can read TypeScript/JavaScript projects and build a **call graph** (who calls what). We will reuse this power later to make smarter edits, but the **first output** of this project is:

> An API-only backend that can scaffold a Next.js app in a local folder and then grow it by adding features on demand.

---

## Planned API shape (subject to change while building)

These endpoints describe the direction we are heading. Names and bodies can be refined as we implement them.

### 1. Create or initialize a Next.js project

`POST /scaffold-nextjs`

Body (JSON):

```json
{
  "targetPath": "/absolute/path/on/your/machine"
}
```

What it should do:

- If there is no project at `targetPath`, create a **new Next.js app** there.
- If there is already a project, validate it (basic checks) and return project info.

### 2. Add or modify a feature

`POST /apply-feature`

Body (JSON):

```json
{
  "targetPath": "/absolute/path/on/your/machine",
  "featureDescription": "add a simple home page with a button that links to /about"
}
```

What it should do (goal):

- Read the existing project at `targetPath`.
- Decide which files need to be created or updated.
- Write or update those files so the feature is implemented.
- Return a summary of what changed (for example: files touched, short explanation).

---

## Current state vs. goal

**Today (current codebase):**

- Parser + analyzer to read repositories and build:
  - Lists of functions, imports/exports, variables, calls.
  - A **call graph** and an **impact** API (`/impact`) that shows what depends on a function.
- Express server with basic endpoints for parsing and impact analysis.

**Goal:**

- Extend this backend so it can:
  - Create a Next.js project at a given path.
  - Apply structured edits to that project based on a feature description.
  - Eventually use the analyzer to make those edits safer and more intelligent.

There is **no frontend UI** planned right now. The main way you interact with repo.ai is **via API calls** (e.g. Postman, cURL, or another tool).

---

## How this repo will evolve

Short version of the development plan:

1. **Solidify the APIs**: implement `/scaffold-nextjs` and `/apply-feature` with clear request/response types.
2. **Basic scaffolding**: wire up project creation using standard Next.js tooling.
3. **Simple feature additions**: support a few basic patterns (pages, routes, simple components).
4. **Smarter edits**: use the existing analyzer + call graph to understand and safely modify code.
5. **Optional extras later**: Git integration, tests, and richer feature patterns.

The `plan.md` file in this repo contains a more detailed roadmap that will be kept in sync with this high-level README as the project grows.
