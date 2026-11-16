---
name: curate-weekly-issue
description: Standard runbook for collecting, writing, validating, and publishing a new weekly edition of AGORA (agora.yocto.kr) for 13-year-old international middle school students and their Korean-speaking parents. Use whenever the user asks to generate, update, or publish this week's or last week's AGORA issue.
---

# Curate Weekly AGORA Issue (`agora.yocto.kr`)

Follow this exact 6-step procedure whenever creating or updating a weekly edition of AGORA.

## Step 1: Determine Issue Metadata & Check Past Ledger
1. Inspect existing files in `src/data/issues/` and read `src/data/books-ledger.json`.
2. Determine:
   - `issueNumber`: `max(existing issueNumber) + 1`
   - `id`: ISO week string `YYYY-WXX` (e.g., `2026-W47`)
   - `publishDate`: Target Monday date (`YYYY-MM-DD`, published on Monday at 04:00 CET/CEST)
   - `coveragePeriod`: The 7-day Monday–Sunday window preceding `publishDate` (e.g., `"Nov 16 – Nov 22, 2026"`)
3. Review `src/data/books-ledger.json` so you **never repeat a previously recommended book**.

## Step 2: Research Real US, European & Global News (`search_web`)
Use `search_web` to collect verified, factual news from the past 7 days across the **United States, Europe, and the World** covering **6 Required Daily Reading Categories** (1 full-page article per day, Monday through Saturday):
1. **Day 1 (Mon) · `Global Affairs & Diplomacy`**
2. **Day 2 (Tue) · `US Current Affairs`**
3. **Day 3 (Wed) · `Europe Current Affairs`**
4. **Day 4 (Thu) · `Economy & Business`**
5. **Day 5 (Fri) · `Science & Space`**
6. **Day 6 (Sat) · `Environment & Future Tech`**

### Trusted Source Standards
- Allowed publishers include: **Reuters, Associated Press (AP), BBC News, PBS NewsHour, The Economist, Financial Times, The Guardian, The New York Times, NPR, Politico Europe, European Commission / Eurostat / ECB, NASA, European Space Agency (ESA), Nature, ScienceDaily, UNFCCC, UNEP**.
- Every article MUST include a real, valid `https://` URL (never `http://` or placeholder domains) and the exact publication date (`publishedDate: "YYYY-MM-DD"`).

## Step 3: Write 6 Full-Page Daily Articles in English (Grades 7–8 / CEFR B2–C1) + Korean Parent Mode (`...Ko`)
Create `src/data/issues/YYYY-WXX.json` conforming strictly to `WeeklyIssue` in `src/data/schema.ts`:
- **Full-Page Daily Reading Length (4+ Paragraphs per Article)**:
  - Each of the 6 articles is read one per day and printed as a 1-Sheet Duplex handout (Front: Full-Page Article & Executive Summary / Back: Key Vocabulary, Critical Thinking Prompt & Handwritten Summary/Vocab Lines).
  - Every article MUST have **at least 4 substantial paragraphs (`body.length >= 4`, `340–450 words` in English)** and matching Korean translation paragraphs (`bodyKo.length === body.length`), plus **at least 3 executive summary points in `whyItMatters` / `whyItMattersKo`** so that Page 1 (Front Side) fills a complete printed A4 page.
- **Inline Vocabulary Highlights (3+ Terms per Article)**:
  - In each `article.body`, wrap every term defined in that article's `terms` array (`terms.length >= 3`) in `**term**` markers (e.g., `**inflation**`, `**gravitational lensing**`).
  - Define every highlighted term in the corresponding `terms` array (`term`, `partOfSpeech`, `definition`, `definitionKo`, `example`).
- **Verified Editorial Photographs & Book Cover (`imageUrl`, `coverImageUrl`)**:
  - Every `article` MUST include a real, high-resolution `imageUrl` (from Wikimedia Commons `https://upload.wikimedia.org/wikipedia/commons/...`, NASA, or ESA), along with `imageCaption`, `imageCaptionKo`, and `imageCredit`.
  - `bookOfTheWeek` MUST include a valid `coverImageUrl` (e.g., from `https://covers.openlibrary.org/b/id/...-L.jpg` or Wikimedia Commons).
  - Always verify each image URL returns HTTP 200 (`image/*`) via `curl -sL -o /dev/null -w "%{http_code} %{content_type}"` before committing.
- **Day 7 (Sun) · Concept of the Week & Book of the Week**:
  - Write `conceptOfTheWeek` (`Economics`, `Global Civics`, or `Science & Tech`) with a vivid `realWorldAnalogy`.
  - Recommend one English book (fiction or non-fiction, age range ~11–15) connected to one of the week's themes, and append the book entry to `src/data/books-ledger.json`.

## Step 4: Validate Data, Run Tests, and Build Static Pages
Run the full verification suite:
```bash
npm run validate-data
npm run typecheck
npm test
npm run build
```
If `npm run validate-data` or any test fails, fix the JSON or schema error before proceeding.

## Step 5: Commit with Strict Git Policy & Push to GitHub
1. Ensure Git author and committer are set to:
   - `Changhyeok Bae <changhyeok.bae@gmail.com>`
2. Format the commit message:
   - **Subject line**: `<= 50` characters (e.g., `feat: publish issue 2026-W47 weekly digest`)
   - **Body lines**: `<= 72` characters per line
3. Verify the commit message and push:
```bash
git add src/data/issues/ src/data/books-ledger.json
git commit -m "feat: publish issue YYYY-WXX weekly digest"
npm run check-commit
git push origin main
```
Pushing to `main` automatically triggers `.github/workflows/deploy.yml` to publish the updated site and archive to `https://agora.yocto.kr`.
