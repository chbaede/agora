# AGORA (`agora.yocto.kr`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy `agora.yocto.kr` (`https://github.com/chbaede/agora`), a fast-loading, mobile-responsive, and print-ready weekly English current affairs, MUN, vocabulary, and book recommendation digest for 13-year-old international middle school students, complete with Issue #1 (`2026-W45`), seamless past-issue browsing/printing, and a reusable weekly curation skill.

**Architecture:** An Astro 5 + TypeScript static site generator (SSG) backed by strictly validated JSON issue files (`src/data/issues/YYYY-WXX.json`) and a book deduplication ledger (`src/data/books-ledger.json`). Every weekly edition pre-renders to static HTML/CSS with dedicated `@media print` A4/Letter worksheet rules, a header quick-jump issue switcher, and an archive page supporting one-click direct printing (`/issues/[id]?print=1`). GitHub Actions validates data, runs tests, builds, and deploys to GitHub Pages on every push to `main`.

**Tech Stack:** Node.js 22+, TypeScript 5, Astro 5, Vitest (unit & schema testing), `tsx` (CLI validation scripts), GitHub Actions (`actions/deploy-pages@v4`).

**Spec:** `/Users/CHANBAE/.gemini/antigravity/brain/d415f68b-dff2-4354-b05d-9711ede687f5/2026-11-08-agora-weekly-digest-design.md` (committed to `docs/superpowers/specs/2026-11-08-agora-weekly-digest-design.md`)

## Global Constraints

- Repository URL: `https://github.com/chbaede/agora` (`main` branch), cloned into `/Users/CHANBAE/.gemini/antigravity/scratch/agora`
- Custom domain: `agora.yocto.kr` (configured via `public/CNAME`)
- Git author and committer: `Changhyeok Bae <changhyeok.bae@gmail.com>`
- Git commit subject line: $\le$ 50 characters
- Git commit body lines: $\le$ 72 characters per line
- Target audience & reading level: 13-year-old international middle school students (Grades 7–8, CEFR B2–C1)
- Weekly publish schedule target: Monday 06:00 CET/CEST (`Europe/Berlin`)
- Required categories per issue (5 articles): `US Current Affairs`, `Europe Current Affairs`, `Economy & Business`, `Science & Technology`, `Environment & Global Society`
- Every article and MUN Spotlight must include verified, clickable HTTPS source links from reputable US/European publishers.

## Review Focus

1. **Unhighlighted or orphaned glossary terms in article body**: When an article body wraps a vocabulary word in `**term**` markers, the inline renderer must gracefully match case-insensitively to `article.terms` and still render clean bold text if a bold phrase is not a glossary entry.
2. **Broken or non-HTTPS source URLs**: `validateIssueData()` must reject any `http://`, relative, placeholder (`example.com`), or malformed URL in `munSpotlight.sources`, `articles[].source.url`, or `bookOfTheWeek.referenceUrl`.
3. **Duplicate book recommendations across issues**: `validateAllIssues()` must cross-check every issue's `bookOfTheWeek.title` against `books-ledger.json` and fail if two different issues recommend the same book title.
4. **Archive ordering and instant print (`?print=1`)**: When multiple issues exist, `getAllIssues()` must sort newest-first by `issueNumber` descending, and navigating to `/issues/YYYY-WXX?print=1` from the Archive page must automatically trigger `window.print()` once the document finishes loading.
5. **Commit message 50/72 character boundary**: `validateCommitMessage()` must count characters accurately and reject any commit message whose first line exceeds 50 chars or any subsequent line exceeds 72 chars.

---

### Task 1: Repository Initialization, Project Rules (`GEMINI.md`), and Core Schema/Commit Validators

**Files:**
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/package.json`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/tsconfig.json`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/astro.config.mjs`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/.gitignore`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/public/CNAME`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/GEMINI.md`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/docs/superpowers/specs/2026-11-08-agora-weekly-digest-design.md`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/docs/superpowers/plans/2026-11-08-agora-implementation-plan.md`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/data/schema.ts`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/scripts/check-commit-msg.ts`
- Test: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/tests/schema.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `ArticleCategory`: `'US Current Affairs' | 'Europe Current Affairs' | 'Economy & Business' | 'Science & Technology' | 'Environment & Global Society'`
  - `GlossaryTerm`: `{ term: string; partOfSpeech: string; definition: string; example: string }`
  - `SourceReference`: `{ publisher: string; title: string; url: string; publishedDate: string }`
  - `Article`: `{ id: string; category: ArticleCategory; region: 'US' | 'Europe' | 'Transatlantic'; headline: string; subheadline: string; readingTimeMinutes: number; difficulty: 'Intermediate' | 'Challenge'; body: string[]; whyItMatters: string[]; thinkAboutIt: string; terms: GlossaryTerm[]; source: SourceReference }`
  - `MunSpotlight`: `{ topic: string; committee: string; region: string; background: string[]; blocPositions: { bloc: string; stance: string }[]; debateMotion: string; proArguments: string[]; conArguments: string[]; speechStarter: string; terms: GlossaryTerm[]; sources: SourceReference[] }`
  - `ConceptOfTheWeek`: `{ title: string; category: 'Economics' | 'Diplomacy' | 'Science & Civics'; summary: string; realWorldAnalogy: string; keyTakeaway: string }`
  - `BookRecommendation`: `{ title: string; author: string; genre: string; ageRange: string; pageCount: number; whyReadIt: string; keyTakeaway: string; discussionPrompt: string; referenceUrl: string }`
  - `WeeklyIssue`: `{ id: string; issueNumber: number; publishDate: string; coveragePeriod: string; themeTitle: string; editorsNote: string; munSpotlight: MunSpotlight; articles: Article[]; conceptOfTheWeek: ConceptOfTheWeek; bookOfTheWeek: BookRecommendation }`
  - `BookLedgerEntry`: `{ issueId: string; issueNumber: number; title: string; author: string; genre: string; publishDate: string }`
  - `validateIssueData(issue: unknown): { valid: boolean; errors: string[] }`
  - `validateAllIssues(issues: WeeklyIssue[], ledger: BookLedgerEntry[]): { valid: boolean; errors: string[] }`
  - `validateCommitMessage(message: string): { valid: boolean; errors: string[] }`
  - `renderBodyWithHighlights(paragraph: string, terms: GlossaryTerm[]): string`

- [ ] **Step 1: Clone or initialize `/Users/CHANBAE/.gemini/antigravity/scratch/agora` and configure Git identity**

Run:
```bash
git clone https://github.com/chbaede/agora /Users/CHANBAE/.gemini/antigravity/scratch/agora || mkdir -p /Users/CHANBAE/.gemini/antigravity/scratch/agora
cd /Users/CHANBAE/.gemini/antigravity/scratch/agora
git init
git config user.name "Changhyeok Bae"
git config user.email "changhyeok.bae@gmail.com"
```
Expected: Repository initialized in `/Users/CHANBAE/.gemini/antigravity/scratch/agora` with author `Changhyeok Bae <changhyeok.bae@gmail.com>`.

- [ ] **Step 2: Create `package.json`, `tsconfig.json`, `astro.config.mjs`, `.gitignore`, `public/CNAME`, `GEMINI.md`, and copy spec/plan docs**

Configure `package.json` with scripts:
- `"dev": "astro dev"`
- `"build": "astro build"`
- `"preview": "astro preview"`
- `"test": "vitest run"`
- `"typecheck": "tsc --noEmit"`
- `"validate-data": "tsx scripts/validate-data.ts"`
- `"check-commit": "tsx scripts/check-commit-msg.ts"`

Install dependencies: `astro`, `typescript`, `vitest`, `tsx`, `@types/node`.
Write `agora.yocto.kr` to `public/CNAME`.

- [ ] **Step 3: Write the failing unit tests in `tests/schema.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import {
  validateIssueData,
  validateAllIssues,
  validateCommitMessage,
  renderBodyWithHighlights,
  REQUIRED_CATEGORIES,
  type WeeklyIssue,
  type BookLedgerEntry,
} from '../src/data/schema';

describe('AGORA schema & commit validators', () => {
  it('enforces 50/72 character limits on commit messages', () => {
    expect(validateCommitMessage('feat: add weekly issue schema\n\nShort body line.').valid).toBe(true);
    expect(validateCommitMessage('feat: this commit subject line is definitely longer than fifty characters allowed').valid).toBe(false);
    expect(
      validateCommitMessage(
        'feat: short title\n\nThis body line is intentionally written to exceed the strict seventy-two character per line limit.'
      ).valid
    ).toBe(false);
  });

  it('rejects non-HTTPS or placeholder source URLs', () => {
    const res = validateIssueData({ id: 'bad' });
    expect(res.valid).toBe(false);
  });

  it('rejects duplicate book recommendations across issues and ledger', () => {
    const mockIssue = createValidMockIssue('2026-W45', 1, 'The Boy Who Harnessed the Wind');
    const mockIssue2 = createValidMockIssue('2026-W46', 2, 'The Boy Who Harnessed the Wind');
    const ledger: BookLedgerEntry[] = [
      { issueId: '2026-W45', issueNumber: 1, title: 'The Boy Who Harnessed the Wind', author: 'William Kamkwamba', genre: 'Memoir', publishDate: '2026-11-09' },
      { issueId: '2026-W46', issueNumber: 2, title: 'The Boy Who Harnessed the Wind', author: 'William Kamkwamba', genre: 'Memoir', publishDate: '2026-11-16' },
    ];
    const check = validateAllIssues([mockIssue, mockIssue2], ledger);
    expect(check.valid).toBe(false);
    expect(check.errors.some((e) => e.includes('Duplicate book'))).toBe(true);
  });

  it('renders inline glossary highlights safely and preserves non-glossary bold phrases', () => {
    const html = renderBodyWithHighlights(
      'The EU debated a new **tariff** during **last Monday** talks.',
      [{ term: 'tariff', partOfSpeech: 'noun', definition: 'A tax on imports.', example: 'Tariffs rose.' }]
    );
    expect(html).toContain('class="glossary-inline-term"');
    expect(html).toContain('data-term="tariff"');
    expect(html).toContain('<strong>last Monday</strong>');
  });
});
```

- [ ] **Step 4: Run `npm test` to verify `tests/schema.test.ts` fails**

Run: `npm test`
Expected: FAIL with module `../src/data/schema` not found.

- [ ] **Step 5: Implement `src/data/schema.ts` and `scripts/check-commit-msg.ts`**

Implement `validateIssueData`, `validateAllIssues`, `validateCommitMessage`, and `renderBodyWithHighlights` (HTML-escaping input text before converting `**term**` markers into `<mark class="glossary-inline-term" data-term="..." title="...">term</mark>` when matched in `terms`, or `<strong>...</strong>` otherwise).

- [ ] **Step 6: Run `npm test` and `npm run typecheck` to verify they pass**

Run: `npm test && npm run typecheck`
Expected: PASS (all tests green, 0 TypeScript errors).

- [ ] **Step 7: Commit Task 1**

```bash
git add .
git commit -m "chore: init Astro project and schema validators"
```

---

### Task 2: Curate Issue #1 (`2026-W45`: Nov 2 – Nov 8, 2026), Book Ledger, Data Loader, and Validation CLI

**Files:**
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/data/issues/2026-W45.json`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/data/books-ledger.json`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/data/load-issues.ts`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/scripts/validate-data.ts`
- Test: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/tests/load-issues.test.ts`

**Interfaces:**
- Consumes: `WeeklyIssue`, `BookLedgerEntry`, `validateIssueData`, `validateAllIssues` from `src/data/schema.ts`
- Produces:
  - `getAllIssues(): WeeklyIssue[]` (sorted newest-first by `issueNumber` descending)
  - `getLatestIssue(): WeeklyIssue`
  - `getIssueById(id: string): WeeklyIssue | undefined`
  - `getAdjacentIssues(id: string): { previous?: WeeklyIssue; next?: WeeklyIssue }`
  - `getAllGlossaryTerms(): Array<GlossaryTerm & { issueId: string; issueNumber: number; sourceSection: string }>`
  - `getBooksLedger(): BookLedgerEntry[]`

- [ ] **Step 1: Research and verify real US & European stories from the past week (Nov 1 – Nov 8, 2026) and write failing loader test in `tests/load-issues.test.ts`**

Write `tests/load-issues.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import {
  getAllIssues,
  getLatestIssue,
  getIssueById,
  getAllGlossaryTerms,
  getBooksLedger,
} from '../src/data/load-issues';
import { validateAllIssues } from '../src/data/schema';

describe('Issue #1 (2026-W45) data integrity and loader', () => {
  it('loads valid issues and passes full schema & ledger validation', () => {
    const issues = getAllIssues();
    const ledger = getBooksLedger();
    expect(issues.length).toBeGreaterThanOrEqual(1);
    const validation = validateAllIssues(issues, ledger);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
  });

  it('retrieves Issue #1 (2026-W45) and aggregates glossary terms', () => {
    const latest = getLatestIssue();
    expect(latest.id).toBe('2026-W45');
    expect(getIssueById('2026-W45')?.issueNumber).toBe(1);
    const terms = getAllGlossaryTerms();
    expect(terms.length).toBeGreaterThanOrEqual(12);
  });
});
```

- [ ] **Step 2: Run `npm test` to verify `tests/load-issues.test.ts` fails**

Run: `npm test`
Expected: FAIL (`../src/data/load-issues` not found).

- [ ] **Step 3: Create `src/data/issues/2026-W45.json`, `src/data/books-ledger.json`, `src/data/load-issues.ts`, and `scripts/validate-data.ts`**

Curate Issue #1 (`2026-W45`, publish date `2026-11-09`, coverage `Nov 2 – Nov 8, 2026`) using verified US & European journalism sources (Reuters, BBC, AP, The Economist, Financial Times, ESA, Nature, NPR, The Guardian) across:
- **MUN Spotlight**: Transatlantic Climate Finance, Clean Tech Trade, and Global Emissions Governance (UNEP / WTO joint perspective)
- **5 Articles**:
  1. `US Current Affairs` (US midterm & policy shifts / federal-state governance & youth civic impact)
  2. `Europe Current Affairs` (EU competitiveness, defense-industrial cooperation & European coalition politics)
  3. `Economy & Business` (Central bank interest-rate path in the US Fed & ECB, inflation, and global supply chains)
  4. `Science & Technology` (European & US space/AI scientific breakthroughs from ESA/NASA & research labs)
  5. `Environment & Global Society` (European renewable grid transition, climate resilience, and youth policies)
- **Concept of the Week**: *Tariffs, Industrial Policy, and Central Bank Interest Rates — How Governments Steer the Economy*
- **Book of the Week**: Age-appropriate English book recommendation recorded in `src/data/books-ledger.json`.

- [ ] **Step 4: Run `npm test` and `npm run validate-data`**

Run: `npm test && npm run validate-data`
Expected: PASS (`[AGORA Validation] All issues and books-ledger are valid`).

- [ ] **Step 5: Commit Task 2**

```bash
git add src/data/ scripts/validate-data.ts tests/load-issues.test.ts
git commit -m "feat: add issue 2026-W45 data and loader"
```

---

### Task 3: Editorial Web UI, Quick Past-Issue Switcher, Archive One-Click Print, and Dedicated `@media print` Packet Layout

**Files:**
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/styles/global.css`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/styles/print.css`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/layouts/BaseLayout.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/components/Masthead.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/components/IssueView.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/components/MunSpotlight.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/components/ArticleCard.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/components/ConceptExplainer.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/components/GlossarySection.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/components/BookCorner.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/components/PrintWorksheet.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/pages/index.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/pages/issues/[id].astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/pages/archive.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/src/pages/glossary.astro`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/public/favicon.svg`
- Test: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/tests/build-output.test.ts`

**Interfaces:**
- Consumes: `getAllIssues`, `getLatestIssue`, `getIssueById`, `getAdjacentIssues`, `getAllGlossaryTerms`, `getBooksLedger` from `src/data/load-issues.ts`; `renderBodyWithHighlights` from `src/data/schema.ts`
- Produces: Static HTML routes in `dist/`:
  - `dist/index.html` (Latest issue + quick-jump dropdown to all past issues + Print Packet button + Worksheet toggle)
  - `dist/issues/2026-W45/index.html` (Permalink issue page supporting `?print=1` auto-print and Previous/Next issue navigation)
  - `dist/archive/index.html` (Searchable/filterable catalog of all issues with direct **"Read Issue"** and **"Print Packet"** buttons for every past issue, plus past Book & MUN index)
  - `dist/glossary/index.html` (Cumulative searchable English-to-English vocabulary & economic dictionary with Flashcard self-test mode)

- [ ] **Step 1: Write the failing build verification test in `tests/build-output.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

describe('Astro static build & print/archive features', () => {
  it('builds static pages for index, issue permalink, archive, and glossary', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const distDir = path.resolve(process.cwd(), 'dist');
    expect(fs.existsSync(path.join(distDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'issues/2026-W45/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'archive/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'glossary/index.html'))).toBe(true);
    expect(fs.readFileSync(path.join(distDir, 'CNAME'), 'utf-8').trim()).toBe('agora.yocto.kr');

    const issueHtml = fs.readFileSync(path.join(distDir, 'issues/2026-W45/index.html'), 'utf-8');
    expect(issueHtml).toContain('Print Weekly Packet');
    expect(issueHtml).toContain('issue-quick-select');
    expect(issueHtml).toContain('MUN Delegate Prep');

    const archiveHtml = fs.readFileSync(path.join(distDir, 'archive/index.html'), 'utf-8');
    expect(archiveHtml).toContain('?print=1');
  });
});
```

- [ ] **Step 2: Run `npx vitest run tests/build-output.test.ts` to verify it fails**

Run: `npx vitest run tests/build-output.test.ts`
Expected: FAIL (`dist/index.html` does not exist yet).

- [ ] **Step 3: Implement editorial stylesheets (`global.css`, `print.css`), components, and pages**

Apply deliberate editorial design principles (`frontend-design` skill):
- **Palette**: Warm Crisp Paper (`#FAF7F2`), Deep Oxford Ink (`#111C2D`), Transatlantic Civic Cobalt (`#1E40AF`), Botanical Science Emerald (`#0F766E`), Economic Amber (`#B45309`), Soft Rule Border (`#D8D2C5`).
- **Typography**: Editorial serif (`Newsreader` / `Georgia` fallback) for long-form reading and print clarity, paired with crisp humanist sans-serif (`Plus Jakarta Sans` / system-ui) for UI controls, metadata, and vocabulary cards.
- **Past Issue Navigation & Printing UX**:
  - Top bar includes an `<select id="issue-quick-select">` dropdown listing every issue (`#1 · Nov 9, 2026 — ...`) so the user can jump to any past week in 1 click from anywhere.
  - Top bar includes **"Print Weekly Packet"** button (`window.print()`) and a checkbox **"Include Study Worksheet"** (toggles `body.hide-print-worksheet`).
  - `/archive` page displays every issue card with its date, coverage period, MUN topic, 5 article headlines, Book of the Week, and two prominent buttons: **"Read Online"** (`/issues/2026-W45`) and **"Print Packet"** (`/issues/2026-W45?print=1`).
  - When a page loads with `?print=1` (or `?worksheet=0`), a lightweight inline script sets the worksheet state and triggers `window.print()` automatically.
  - Interactive features on each issue page:
    - Clicking/tapping any highlighted term (`mark.glossary-inline-term`) opens a floating tooltip/popover with its English definition + example sentence, and scrolls to it in the Glossary if desired.
    - Category filter pills (`All`, `US`, `Europe`, `Economy`, `Science`, `Environment`) on web view (while `@media print` always prints all articles in full).
    - **Vocabulary Quiz Mode** toggle ("Hide Definitions to Test Yourself").

- [ ] **Step 4: Run `npm test` and `npm run build` to verify all pages and tests pass**

Run: `npm test`
Expected: PASS (including `tests/build-output.test.ts`).

- [ ] **Step 5: Commit Task 3**

```bash
git add src/ public/ tests/build-output.test.ts
git commit -m "feat: build web UI, archive, and print layout"
```

---

### Task 4: Reusable Weekly Curation Skill (`.agents/skills/curate-weekly-issue/SKILL.md`), CI/CD Workflow (`.github/workflows/deploy.yml`), and Push to GitHub

**Files:**
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/.agents/skills/curate-weekly-issue/SKILL.md`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/.github/workflows/deploy.yml`
- Create: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/README.md`
- Test: `/Users/CHANBAE/.gemini/antigravity/scratch/agora/tests/workflow-and-skill.test.ts`

**Interfaces:**
- Consumes: `npm run validate-data`, `npm run typecheck`, `npm test`, `npm run build`
- Produces:
  - `.agents/skills/curate-weekly-issue/SKILL.md` (auto-discovered workspace skill for weekly issue creation)
  - `.github/workflows/deploy.yml` (GitHub Actions workflow deploying `dist/` to GitHub Pages on push to `main`)

- [ ] **Step 1: Write the failing test in `tests/workflow-and-skill.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Workspace curation skill and GitHub Pages workflow', () => {
  it('includes a complete curate-weekly-issue SKILL.md and GEMINI.md', () => {
    const skillPath = path.resolve(process.cwd(), '.agents/skills/curate-weekly-issue/SKILL.md');
    const geminiPath = path.resolve(process.cwd(), 'GEMINI.md');
    expect(fs.existsSync(skillPath)).toBe(true);
    expect(fs.existsSync(geminiPath)).toBe(true);
    const skillContent = fs.readFileSync(skillPath, 'utf-8');
    expect(skillContent).toContain('name: curate-weekly-issue');
    expect(skillContent).toContain('npm run validate-data');
    expect(skillContent).toContain('books-ledger.json');
  });

  it('configures GitHub Actions deploy.yml for GitHub Pages', () => {
    const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');
    expect(fs.existsSync(workflowPath)).toBe(true);
    const yaml = fs.readFileSync(workflowPath, 'utf-8');
    expect(yaml).toContain('actions/deploy-pages@v4');
    expect(yaml).toContain('npm run validate-data');
  });
});
```

- [ ] **Step 2: Run `npx vitest run tests/workflow-and-skill.test.ts` to verify it fails**

Run: `npx vitest run tests/workflow-and-skill.test.ts`
Expected: FAIL (`.agents/skills/curate-weekly-issue/SKILL.md` not found).

- [ ] **Step 3: Write `.agents/skills/curate-weekly-issue/SKILL.md`, `.github/workflows/deploy.yml`, and `README.md`**

In `.agents/skills/curate-weekly-issue/SKILL.md`, document the exact 6-step weekly runbook:
1. Determine target ISO week (`YYYY-WXX`), next `issueNumber`, and Monday 06:00 CET/CEST `publishDate`.
2. Inspect `src/data/books-ledger.json` and existing `src/data/issues/*.json` to avoid duplicate books or repetitive MUN topics.
3. Search verified US & European news from the past 7 days across the 5 required categories (`US Current Affairs`, `Europe Current Affairs`, `Economy & Business`, `Science & Technology`, `Environment & Global Society`).
4. Author `src/data/issues/YYYY-WXX.json` at CEFR B2–C1 (Grade 7–8 International School) reading level and append the new book to `src/data/books-ledger.json`.
5. Run `npm run validate-data && npm test && npm run build`.
6. Commit as `Changhyeok Bae <changhyeok.bae@gmail.com>` (subject $\le$ 50 chars, body lines $\le$ 72 chars) and `git push origin main`.

- [ ] **Step 4: Run full verification suite (`npm run validate-data && npm run typecheck && npm test && npm run build`)**

Run: `npm run validate-data && npm run typecheck && npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Verify commit log against 50/72 rule, push to `https://github.com/chbaede/agora`, and verify GitHub Pages deployment**

```bash
git add .
git commit -m "ci: add Pages workflow and weekly curation skill"
npm run check-commit
git branch -M main
git push -u origin main
```
