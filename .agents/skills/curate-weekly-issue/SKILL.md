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
   - `id`: ISO week string `YYYY-WXX` (e.g., `2026-W46`)
   - `publishDate`: Target Monday date (`YYYY-MM-DD`, published for Monday 06:00 CET/CEST)
   - `coveragePeriod`: The 7-day Monday–Sunday window preceding `publishDate` (e.g., `"Nov 9 – Nov 15, 2026"`)
3. Review `src/data/books-ledger.json` so you **never repeat a previously recommended book**.

## Step 2: Research Real US & European News (`search_web`)
Use `search_web` to collect verified, factual news from the past 7 days across the **United States and Europe** covering:
1. **1 Model UN (MUN) Spotlight Topic**: A major international diplomacy, climate, trade, security, or governance event involving the US, Europe, and global institutions (UN, WTO, UNFCCC, NATO, EU, WHO, etc.).
2. **5 Required Category Articles** (1 per category):
   - `US Current Affairs`
   - `Europe Current Affairs`
   - `Economy & Business`
   - `Science & Technology`
   - `Environment & Global Society`

### Trusted Source Standards
- Allowed publishers include: **Reuters, Associated Press (AP), BBC News, The Economist, Financial Times, The Guardian, The New York Times, NPR, Politico Europe, European Commission / Eurostat / ECB, NASA, European Space Agency (ESA), Nature, ScienceDaily, Council on Foreign Relations (CFR), UNFCCC**.
- Every article and MUN Spotlight MUST include a real, valid `https://` URL (never `http://` or placeholder domains).

## Step 3: Write the Issue in English (Grades 7–8 / CEFR B2–C1) + Korean Parent Mode (`...Ko`)
Create `src/data/issues/YYYY-WXX.json` conforming strictly to `WeeklyIssue` in `src/data/schema.ts`:
- **Student English (`en`)**: Written in clear, engaging journalistic English for a bright 13-year-old international school student.
- **Parent Korean (`...Ko` fields)**: Every section (`themeTitleKo`, `editorsNoteKo`, `munSpotlight` Korean fields, each `article`'s `headlineKo`, `subheadlineKo`, `bodyKo`, `whyItMattersKo`, `thinkAboutItKo`, `conceptOfTheWeek` Korean fields, `bookOfTheWeek` Korean fields, and every glossary term's `definitionKo`) MUST be written in natural, accurate Korean so Korean parents can read or discuss the issue effortlessly.
- **Inline Vocabulary Highlights**:
  - In `munSpotlight.background` and each `article.body`, wrap every term defined in that section's `terms` array in `**term**` markers (e.g., `**bipartisan**`, `**fiscal stimulus**`).
  - Define every highlighted term in the corresponding `terms` array (`term`, `partOfSpeech`, `definition`, `definitionKo`, `example`).
- **Verified Editorial Photographs & Book Cover (`imageUrl`, `coverImageUrl`)**:
  - Every `munSpotlight` and every `article` MUST include a real, high-resolution `imageUrl` (from Wikimedia Commons `https://upload.wikimedia.org/wikipedia/commons/...`, NASA, or official press release media), along with `imageCaption`, `imageCaptionKo`, and `imageCredit`.
  - `bookOfTheWeek` MUST include a valid `coverImageUrl` (e.g., from `https://covers.openlibrary.org/b/id/...-L.jpg` or Wikimedia Commons).
  - Always verify each image URL returns HTTP 200 (`image/*`) via `curl -sL -o /dev/null -w "%{http_code} %{content_type}"` before committing.
- **Book of the Week**:
  - Recommend one English book (fiction or non-fiction, age range ~11–15) connected to one of the week's themes.
  - Append the book entry (`issueId`, `issueNumber`, `title`, `author`, `genre`, `publishDate`) to `src/data/books-ledger.json`.

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
   - **Subject line**: `<= 50` characters (e.g., `feat: publish issue 2026-W46 weekly digest`)
   - **Body lines**: `<= 72` characters per line
3. Verify the commit message and push:
```bash
git add src/data/issues/ src/data/books-ledger.json
git commit -m "feat: publish issue YYYY-WXX weekly digest"
npm run check-commit
git push origin main
```
Pushing to `main` automatically triggers `.github/workflows/deploy.yml` to publish the updated site and archive to `https://agora.yocto.kr`.
