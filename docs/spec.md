# Terminal resume site: spec (v1)

Linear: CRA-63 (phase 1). Phase 2 (RAG "ask" command): CRA-64.
Status: **draft v2** (review answers applied 2026-11-18). No code until this is approved.

## 1. Goal
A personal resume site at `craigrushon.com`. It opens as a terminal with a blinking cursor that invites the visitor to explore (`try: help`). A toggle switches to a normal rendered resume for people who just want to read it. A second toggle switches between concise and verbose detail.

**Success criteria (v1)**
- A recruiter can get to the readable resume in **one click**, or with no JavaScript at all.
- A developer can explore the terminal: discoverable commands, tab completion, history.
- Both views render from **one content file**, so they can never disagree.
- Lighthouse scores of at least 95 for performance, accessibility, best practices and SEO, on the built site.
- Built test-first. Tests follow the testing pyramid: mostly unit tests, a few component tests.

## 2. Stack
| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro** (static output) | Content-first. Plain HTML by default, so it's fast and SEO-friendly. |
| Interactivity | **React island** for the terminal only (`client:idle`) | JavaScript is shipped only for the interactive part, and it shows React skills. |
| Language | TypeScript, `strict` | |
| Content | Astro content collection with a zod schema | Content is validated at build time. A typo breaks the build, not the page. |
| Styling | Plain CSS + CSS custom properties (design tokens) | Small, and leaves room for themes later. |
| Tests | Vitest (unit), plus React Testing Library and jsdom (component) | Same tooling as the ROI app. |
| Package manager | pnpm. Node 22 LTS target (the sandbox runs 24) | |
| Hosting (later) | Vercel or Netlify, static | Adapter available for the phase 2 API endpoint. |

## 3. Code vs content (privacy)
The site is public once it's deployed, so anything in the content file is public. The repo is designed so that the **engine can be public** and the **content stays separate**.

- `content/resume.example.json` is a fictional person ("Alex Example"), committed. It's used in dev, tests and the demo.
- `content/resume.json` is the real content, **gitignored** until you decide otherwise. At build time, `RESUME_FILE` or `content/resume.json` is used if present, otherwise the example.
- **Never in content:** phone number, street address, compensation, application notes, references. Only LinkedIn-level information.
- Contact uses links only (email via `mailto:`, LinkedIn, GitHub). Optional: obfuscate the email in the HTML.
- A test checks the content schema, so unknown fields fail validation (`.strict()`). That stops private data slipping in through an extra field.

## 4. Content model
Based on the **JSON Resume** schema (jsonresume.org) so it's familiar and portable, extended with optional `verbose` text.

```ts
Resume {
  basics: { name, label, summary, summaryVerbose?, location: { city, region, country },
            email?, url?, profiles: { network, username, url }[] }
  work: { name, position, url?, startDate, endDate?, summary, highlights: string[],
          highlightsVerbose?: string[], stack?: string[] }[]
  projects: { name, description, descriptionVerbose?, url?, repo?, highlights: string[], stack: string[] }[]
  skills: { name, keywords: string[] }[]
  education: { institution, area, studyType, startDate?, endDate? }[]
}
```
- Dates are `YYYY-MM` strings, so formatting is consistent and testable.
- In **Concise** mode, each item shows `summary` and the first 3 highlights. **Verbose** mode shows everything, including the `*Verbose` fields.

## 5. Views and toggles
**Header (both views):** name and title, plus three controls and a download link:
- **View:** `Terminal | Resume`. This is a native control (radio group styled as a segmented button).
- **Detail:** `Concise | Verbose`
- **Theme:** `Classic | Modern` (see §6a)
- **Download PDF** link (see §6b)

**Rules**
- **Default view:** **Terminal on desktop, Resume on phones** (viewport under 640px). Priority: `?view=` in the URL, then the last choice saved in `localStorage`, then the viewport default.
- The static HTML can't know the viewport, so a tiny inline script in `<head>` picks the view and sets `data-view` on `<html>` **before the first paint**. That avoids a flash of the wrong view. This script is the only code that runs before the island loads.
- Toggles update the URL (`?view=resume&detail=verbose`), so a link to a specific view can be shared, e.g. sent to a recruiter.
- **Without JavaScript**, the Resume view renders and the terminal is hidden. The resume is always in the HTML, so search engines and screen readers get the full content.
- On narrow screens (under 640px), the terminal shows **command suggestion chips** above the input so phone users can tap commands instead of typing.

## 6. Terminal behaviour
**Prompt:** `visitor@craigrushon:~$`. Location changes with `cd`, e.g. `~/resume`.

**Welcome text (on load):**
```
Craig Rushon: Senior Software Engineer
Type `help` to see commands, or switch to Resume view above.
visitor@craigrushon:~$ █
```

**Virtual filesystem (read-only, generated from the content)**
```
~
├── resume/
│   ├── experience
│   ├── projects
│   ├── skills
│   ├── education
│   └── contact
└── README
```

**Commands (v1)**
| Command | Output |
|---|---|
| `help` | List of commands with one-line descriptions |
| `whoami` | Name, title and summary (verbose summary with `-v`) |
| `ls [path]` | Directory listing |
| `cd <dir>` | Change directory (`cd`, `cd ~`, `cd ..`, `cd resume`) |
| `pwd` | Current path |
| `cat <file> [-v \| --verbose]` | Section content: `experience`, `projects`, `skills`, `education`, `contact`, `README` |
| `open <linkedin\|github\|email>` | Opens the link in a new tab (shows the URL too) |
| `resume` | Switches to the Resume view (same as the toggle) |
| `verbose` / `concise` | Sets the detail level (same as the toggle) |
| `history` | Previous commands |
| `theme [classic\|modern]` | Shows or sets the theme (same as the toggle) |
| `download` / `open resume.pdf` | Downloads the PDF resume |
| `clear` | Clears the screen (also Ctrl+L) |
| unknown | `command not found: foo. Try 'help'.` If close to a known command: `Did you mean 'whoami'?` |

The `-v`/`--verbose` flag overrides the detail toggle for that one command.

**Keyboard:** Enter runs the command. ↑/↓ moves through history. **Tab** completes commands and paths, or lists the options if ambiguous. Ctrl+L clears. Ctrl+C cancels the current line. Clicking anywhere in the terminal focuses the input.

### 6a. Themes (v1: two)
- **Classic:** green-on-black phosphor look, monospace everywhere, subtle glow (disabled with reduced motion).
- **Modern (default):** dark theme with a Dracula/Catppuccin-style palette, monospace in the terminal and a clean sans-serif in the Resume view.
- Both are sets of CSS custom properties in `styles/themes.css`, switched by `data-theme` on `<html>`. The choice is saved in `localStorage` and applied by the same pre-paint script. Both must meet 4.5:1 contrast. Adding a third theme later means adding one block of variables.
- The Resume view uses the theme's colours on screen, but **always prints in black on white**.

### 6b. PDF resume (v1)
- Generated **from the same content file** at build time, so the PDF can never disagree with the site. Output: `/resume.pdf` (built from the example content until the real `resume.json` exists). The PDF is a clean single-column layout, not themed, and uses concise detail by default.
- **Approach:** `@react-pdf/renderer` in a build script (pure Node, no headless browser). That works in this sandbox, where a headless browser may not run.
- Plus a **print stylesheet** for the Resume view, so "Print / Save as PDF" in the browser also looks right.
- A test checks that the PDF builds and contains the name and every work entry. The text is extracted from the PDF to check this.

**Easter eggs (optional, small):** `sudo` prints "Nice try.", `exit` switches to Resume view, `pi` prints a note about the agent workflow (sets up phase 2).

## 7. Architecture
```
src/
  content/config.ts            # zod schema + collection (loads resume.json or the example)
  lib/
    terminal/
      parse.ts                 # "cat experience -v" → { cmd, args, flags }   (pure)
      fs.ts                    # virtual filesystem from Resume, path resolution (pure)
      commands.ts              # run(input, state, resume) → { output: Block[], state }   (pure)
      complete.ts              # tab completion (pure)
      suggest.ts               # "did you mean" (Levenshtein, pure)
    format/                    # date ranges, concise/verbose selection (pure)
    prefs.ts                   # resolve view/theme/detail: URL > localStorage > default (pure)
  components/
    Terminal.tsx               # React island: renders Block[], input, history, keys
    Toggles.astro / ViewToggle.tsx
    ResumeView.astro           # static rendered resume (no JS)
  pages/index.astro
  pdf/ResumeDocument.tsx       # @react-pdf/renderer document from Resume
  styles/tokens.css            # spacing, fonts, sizes
  styles/themes.css            # [data-theme=classic|modern] colour variables
  styles/print.css             # black-on-white print layout
scripts/build-pdf.ts           # runs before `astro build`, writes public/resume.pdf
```
**Key design choice:** commands return **structured output blocks** (`{ type: 'text' | 'heading' | 'list' | 'link' | 'error', ... }`), never HTML strings.
- **Safe:** no `dangerouslySetInnerHTML`, so there's no injection risk even when content is user-edited.
- **Testable:** exact assertions on data, not on DOM output.
- **Reusable:** the same blocks can be read aloud, and phase 2 can return blocks too.

## 8. Accessibility
- The terminal output is `role="log"` with `aria-live="polite"`. The input has a visible label (`<label class="sr-only">Terminal command</label>`).
- Everything works by keyboard. Focus is visible. Toggles are real radio inputs.
- `prefers-reduced-motion` disables the cursor blink and any typing animation.
- Colour contrast is at least 4.5:1 in the terminal theme.
- The Resume view is semantic HTML: `h1` for the name, `h2` for each section, `<time>` for dates.

## 9. SEO and sharing
- `<title>`, meta description, canonical URL (`https://craigrushon.com/`).
- Open Graph and Twitter card with a **static OG image** (a terminal-style card), so the link preview looks good on LinkedIn.
- JSON-LD `Person` schema generated from `basics` (name, job title, profile links). Contact info is limited to what's in the content.
- `robots.txt`, `sitemap.xml` (Astro integration).

## 10. Test plan (test-first, per CRA-58 thinking)
| Layer | What | Approx. count |
|---|---|---|
| **Unit (most)** | `parse` (quotes, flags, extra spaces, empty), `fs` path resolution (`..`, `~`, unknown), each command's blocks for the example resume, `complete`, `suggest`, concise/verbose selection, date formatting, content schema rejects unknown/private fields | ~40 |
| **Unit (pre-paint logic)** | View/theme resolution: URL beats `localStorage` beats viewport default (phone → Resume, desktop → Terminal), invalid values fall back | ~8 |
| **Component (few)** | Terminal: typing `help` + Enter renders the help list. ↑ recalls history. Tab completes `cat ex` → `cat experience`. `theme classic` sets `data-theme`. Toggles switch the view and update the URL. | ~7 |
| **Build check (PDF)** | PDF builds from the example content; extracted text contains the name and every work entry | 1–2 |
| **Build check** | `astro check` (types) + `astro build` succeeds with the example content | CI |
| **E2E (later, maybe)** | One Playwright smoke test (load → `help` → toggle to Resume) once deployed. Decision deferred to CRA-58. | 0–1 |

Rules: exact assertions, no snapshots of large DOM trees, the example resume as the single fixture.

## 11. Milestones
1. **Scaffold:** Astro + React + TS strict + Vitest, plus the example content and schema. `pnpm test` and `astro check` both green.
2. **Terminal core (TDD):** parse → fs → commands → complete/suggest, all pure, all tested.
3. **Terminal island:** rendering, input, history, keys, mobile chips.
4. **Resume view + toggles:** static view, pre-paint view/theme script, URL/`localStorage` state, no-JS fallback.
5. **Themes + PDF:** classic and modern themes, print stylesheet, build-time PDF + download command.
6. **Polish:** accessibility pass (both themes), SEO/OG, Lighthouse check, README (architecture + "use it for your own site").
7. **Later:** real content, deploy to `craigrushon.com`, decide on public repo. Phase 2 = CRA-64.

## 12. Out of scope (v1)
RAG / "ask" (CRA-64), more than two themes, blog, analytics, i18n, deployment, `.dev` domain.

## 13. Decisions (2026-11-18)
1. **Default view:** Terminal on desktop, **Resume on phones**.
2. **PDF download:** **in v1**, generated from content at build time.
3. **Themes:** **both** Classic (green-on-black) and Modern dark, switchable. Modern is the default.
4. **`.dev` domain:** not now.

**Still open (defaults applied unless you object):** Modern as the default theme; PDF uses concise detail.
