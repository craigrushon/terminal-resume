# Terminal resume site

A personal resume site that opens as a terminal (`try: help`), with a toggle to a normal rendered resume, concise/verbose detail, two themes and a PDF download. Spec: [`docs/spec.md`](docs/spec.md). Linear: CRA-63.

**Stack:** Astro (static) + a React island for the terminal, TypeScript strict, zod, Vitest.

## Content
- `content/resume.example.json`: fictional "Alex Example", committed, used for dev and tests.
- `content/resume.json`: your real content, **gitignored**. Used automatically when present.
- The schema is strict: unknown fields (phone, address, salary…) fail the build. Only put LinkedIn-level information here; the deployed site is public.

## Commands
| | |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm test` | Unit + component tests (Vitest) |
| `pnpm check` | Type check (`astro check`) |
| `pnpm build` | Static build to `dist/` |

Requires Node 22+ and pnpm.
