# terminal-resume

A resume site that opens as a terminal. Visitors can type `help`, `cd resume` or `cat experience`, or switch to a plain rendered resume with one click. Built with **Astro** and a **React island**, test-first.

```
Alex Example: Senior Software Engineer
Type 'help' to see commands, or try: cat experience
visitor@craigrushon:~$ █
```

> **Status: work in progress.** The terminal, resume view, themes and PDF download work. Polish (accessibility audit, link previews) is next (see [Roadmap](#roadmap)). The content in this repo is a fictional person, "Alex Example".

## Features
**Working now**
- Commands: `help`, `whoami`, `ls`, `cd`, `pwd`, `cat`, `open`, `history`, `clear`, `theme`, `verbose` / `concise`, `download`, `resume`. Hidden extras exist.
- Tab completion, ↑/↓ history, Ctrl+L to clear, Ctrl+C to cancel, "did you mean…?" suggestions.
- `cat experience` works from anywhere (it falls back to `~/resume`). `-v` / `--verbose` shows more detail for one command.
- Tappable suggested commands on phones.
- A terminal-style **window** with **Terminal | Resume** tabs (keyboard: ←/→/Home/End). A **⚙ settings** popover holds the Theme; the Resume tab has a toolbar with a **Concise | Detailed** switch and a **PDF** link. Your choice is kept in the URL (shareable) and remembered. Phones open the Resume tab by default.
- Works without JavaScript: the resume is always in the HTML, and a tiny inline script picks the view **before the first paint**, so there's no flash.
- Two themes: **Modern** (dark) and **Classic** (green-on-black phosphor), switchable in ⚙ settings or with `theme classic`. A test checks that every text colour in both themes meets WCAG 4.5:1 contrast.
- **PDF resume** at `/resume.pdf`, generated at build time from the same content (concise detail, one page), plus a print stylesheet so "Print / Save as PDF" also looks right.
- Accessible: the output is a polite live region, the input is labelled, focus is visible, and the cursor stops blinking when reduced motion is requested.

**Roadmap**
1. ~~Scaffold, strict content schema~~ ✅
2. ~~Terminal core logic (pure functions)~~ ✅
3. ~~React terminal island~~ ✅
4. ~~Resume view and toggles, view chosen before first paint, works without JavaScript~~ ✅
5. ~~Two themes and a PDF generated from the same content~~ ✅
6. Accessibility audit, SEO and link previews, Lighthouse ≥ 95
7. Real content and deployment

## How it's built
- **One content file, many views.** `content/resume.json` follows a strict subset of [JSON Resume](https://jsonresume.org). A zod schema rejects unknown fields, so private data such as a phone number, address or salary can't reach the public site by accident.
- **Commands are pure functions.** `run(input, state, resume)` returns structured output blocks and effects, never HTML strings. The React island only renders blocks and applies effects. That keeps the logic easy to test exactly and safe to render.
- **Links are allow-listed.** Every href passes `safeHref()` (https, plain `mailto:`, or `/resume.pdf`), even though the schema already validates content.
- **Test-first, with locked tests.** Each milestone's pull request starts with a commit of failing tests (`test: RED …`). The implementation (`feat: GREEN …`) must pass them without editing them, and a wrong test is fixed in its own labelled commit. PRs are squash-merged, so every commit on `main` is green. (Milestones 2–3 predate that rule and show the red commits on `main`.)
- **Built with an AI agent workflow.** The red and green phases were carried out by specialised agents (worker → tester → reviewer) with human approval gates. The commit messages record who did what. See the [spec](docs/spec.md) for the design decisions.

## Use it for your own site
1. Copy `content/resume.example.json` to `content/resume.json` and fill it in. That file is gitignored, so decide yourself whether to commit it. Everything in it ends up on a public website.
2. Change the site URL in `astro.config.mjs` and the prompt in `src/components/Terminal.tsx`.
3. `pnpm build` and deploy `dist/` to any static host.

## Development
Requires Node 22+ and pnpm 9.

| Command | |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server at http://localhost:4321 |
| `pnpm test` | Unit and component tests (Vitest, Testing Library) |
| `pnpm check` | Type check (`astro check`) |
| `pnpm build` | Static build to `dist/` |

## License
[MIT](LICENSE)
