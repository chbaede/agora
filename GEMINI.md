# AGORA (`agora.yocto.kr`) — Project Rules

These rules apply unconditionally to all work in this repository.

## 1. Git Identity & Commit Policy (Mandatory)
- **Author & Committer**: `Changhyeok Bae <changhyeok.bae@gmail.com>`
- **Commit Subject Line**: Must be **50 characters or fewer** (`<= 50 chars`).
- **Commit Body Lines**: Every line in the commit body must be **72 characters or fewer** (`<= 72 chars`).
- Always verify commit messages with `npm run check-commit` before pushing.

## 2. Editorial & Content Integrity (Weekly Curation)
- **Target Audience**: 13-year-old international middle school students (Grades 7–8, CEFR B2–C1 English).
- **Publish Cadence**: Every Monday at 06:00 CET/CEST (`Europe/Berlin`), covering the prior 7 days of US and European news.
- **Workflow Skill**: Whenever asked to create, collect, or publish a weekly issue, ALWAYS read and follow `.agents/skills/curate-weekly-issue/SKILL.md`.
- **Source Verification**: Every article and Model UN (MUN) Spotlight MUST cite real, reputable US or European journalism/scientific sources with valid `https://` links. Never fabricate URLs or quotes.
- **Book Deduplication**: Always check `src/data/books-ledger.json` before selecting `bookOfTheWeek` so no book is recommended twice.
- **Validation Gate**: Never commit or push an issue without passing `npm run validate-data && npm test && npm run build`.

