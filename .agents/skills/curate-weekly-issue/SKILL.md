---
name: curate-weekly-issue
description: Standard runbook for collecting, writing, validating, and publishing a new weekly edition of AGORA (agora.yocto.kr) for 13-year-old international middle school students. Use whenever the user asks to generate, update, or publish this week's or last week's AGORA issue.
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

## Step 3: Write the Issue at an International Middle School Level (Grades 7–8 / CEFR B2–C1)
Create `src/data/issues/YYYY-WXX.json` conforming strictly to `WeeklyIssue` in `src/data/schema.ts`:
- **Tone & Level**: Written in clear, engaging journalistic English for a bright 13-year-old international school student. Explain institutional or economic mechanics clearly rather than assuming adult jargon.
- **Inline Vocabulary Highlights**:
  - In `munSpotlight.background` and each `article.body`, wrap 2–3 advanced vocabulary or economic terms in `**term**` markers (e.g., `**bipartisan**`, `**fiscal stimulus**`).
  - Define every highlighted term in the corresponding `terms` array (`term`, `partOfSpeech`, `definition`, `example`) using clear English-to-English explanations.
- **MUN Spotlight**:
  - Include 2–3 background paragraphs, 3–4 `blocPositions`, a debate `debateMotion`, 2–3 `proArguments`, 2–3 `conArguments`, and a 2-sentence `speechStarter` for a 60-second MUN opening speech.
- **Concept of the Week**:
  - Unpack one economic, diplomatic, or scientific concept from the week's news with a concrete `realWorldAnalogy` a 13-year-old can immediately picture.
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
