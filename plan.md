# repoai → product roadmap

A plan to evolve this repository into a Lovable-style product: read a repo, reason about it, retrieve precise context, and ship an MVP where the system can work on code (including this repo) under guardrails.

---

## Current state (what exists in the codebase)

- **Parsing**: Tree-sitter (`tree-sitter-javascript`) for `.ts` / `.js`; `walkRepo` with ignore rules.
- **Analysis**: Functions, imports/exports, variables, classes, calls; per-file analysis in `src/analyzer/`.
- **Graphs**: Import/export resolution, symbol table, **call graph**, **reverse graph**, **impact** (`POST /impact`).
- **API**: Express — `POST /parse-repo` (path in body), `POST /impact`, basic health.
- **Stubs** (README placeholders only): `indexer/`, `retriever/`, `agent/` — names align with a full product but are not implemented.

**Differentiator**: Pair semantic retrieval with **structure** (call graph + impact). Many tools only embed text; you can expand context by callers/callees and blast radius.

---

## North-star MVP (Lovable-like)

1. User connects a repo (local path, zip, or GitHub).
2. System **indexes** code (chunks + metadata + optional embeddings).
3. User chats; system **retrieves** small, relevant context (hybrid: semantic + graph).
4. **Agent** plans, reads files, proposes patches, optionally runs tests/lint.
5. UI shows **diff preview** and apply / PR — with explicit approval before writes.

**Dogfooding**: Run the same pipeline with this repo as `repoPath` (already supported by `/parse-repo`).

---

## Phase 0 — Product spine (1–2 weeks)

| Track | Outcome |
|--------|---------|
| App shell | Add a web frontend (e.g. Next.js). Consider monorepo or `packages/core` for shared analysis code. |
| API stability | Version JSON contracts for parse results, call graph, and impact so UI and agent do not break on refactors. |
| Dev UX | Single dev command: API + UI; document env vars for later LLM keys. |

**UI stack (project convention)**: Use shadcn components for chat, file tree, and diff viewer; keep types strict end-to-end.

---

## Phase 1 — Indexer + retriever (2–4 weeks)

1. **Chunking**: Prefer function/class-level chunks using existing extractions (path, symbol, body range, imports/exports).
2. **Metadata per chunk**: Attach graph hints (e.g. resolved symbol keys, optional neighbor expansion IDs).
3. **Embeddings**: Embed chunk text plus a short header (path + signature). Store in **SQLite + vector extension** or **Postgres (pgvector)** for MVP.
4. **Hybrid retrieval**:
   - Semantic: top-k by embedding similarity.
   - Structural: expand via call graph (callers/callees) and **impact** when the task is “change X” or “what breaks”.
   - Fallback: path/symbol/keyword search.

Implement the ideas behind `indexer/README.md` and `retriever/README.md` as real modules.

---

## Phase 2 — Agent (“execute task with LLM”) (3–6 weeks)

Implement `agent/` as a **tool-calling** loop (not one-shot completion).

**Minimum tools**

- List/read files (with line ranges).
- Search symbols (symbol table / ripgrep-style).
- Graph: callers, callees, impact (wrap existing graph code).
- Semantic search (retriever from Phase 1).
- Propose or apply unified diff (start with preview-only; gated apply).

**Loop**: plan → retrieve → draft → optional `tsc` / `npm test` via subprocess → return explanation + diff.

**Safety**: Repo root allowlist, caps on files/tokens/edits, human approval before any write.

---

## Phase 3 — Dogfood + quality bar (parallel with Phase 2)

- Index **this** repo; maintain a small **eval set** of tasks (e.g. add endpoint, refactor helper).
- Measure: retrieval precision (did the right files/symbols surface?), patch applies cleanly, tests pass.
- Use impact analysis in refactor-style tasks.
- Treat “self-improvement” as **user-approved** changes only — no silent autonomous merges.

---

## Phase 4 — MVP polish (pick one wedge)

Narrow scope beats “build all of Lovable at once.”

- **Wedge A — Refactor assistant**: Impact + call graph + safe edits (strong fit for current code).
- **Wedge B — Feature from issue**: Issue → plan → patch + PR (needs stronger agent + CI integration).

**Product features to add**

- GitHub OAuth + clone (or zip upload).
- Project settings: branch, test command, Node version.
- Chat + file tree + diff preview + Apply / Open PR.
- Background re-index on push (queue can wait until post-MVP).

---

## Phase 5 — Post-MVP

- **Incremental indexing**: Re-parse only changed files; reuse per-file pipeline.
- **More languages**: Additional Tree-sitter grammars (today: JS grammar for `.ts`/`.js`).
- **Teams**: Auth, orgs, billing, audit logs.

---

## Risks (validate early)

1. **Patch quality** on real repos without drowning the model in context.
2. **Context budget**: Graph-aware retrieval must beat “paste whole files.”
3. **Write path**: Preview-first until tests and allowlists are proven.

---

## Suggested order of execution

```text
Phase 0 → UI + stable APIs + local dev
Phase 1 → Embeddings + hybrid retriever (graph + semantic)
Phase 2 → Agent with tools (read / search / graph / patch)
Phase 3 → Dogfood + eval tasks (continuous)
Phase 4 → One wedge + GitHub + diff/PR flow
Phase 5 → Incremental index, scale, languages
```

---

## Open decision

**Storage**: Local-first **SQLite** (simplest for solo dev and demos) vs **Postgres** (better if you ship multi-tenant SaaS early). The plan works with either; pick before locking Phase 1 schema.
