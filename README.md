# AGORA (`agora.yocto.kr`)

**AGORA** is a weekly English current affairs, science, economics, and Model UN (MUN) briefing designed for 13-year-old international middle school students (Grades 7–8).

- **Live Web & Print Edition**: [https://agora.yocto.kr](https://agora.yocto.kr)
- **Target Cadence**: Every Monday at 06:00 CET/CEST (`Europe/Berlin`)

## Key Features
- **Model UN (MUN) Agenda Spotlight**: Weekly deep dive with committee context, major bloc positions, a structured Pro/Con debate motion, and a 60-second opening speech starter.
- **5 Balanced US & European Stories**: Covering `US Current Affairs`, `Europe Current Affairs`, `Economy & Business`, `Science & Technology`, and `Environment & Global Society` from reputable sources with verified links.
- **Contextual English-to-English Glossary**: Highlighted vocabulary inside articles + interactive flashcard self-test mode + cumulative searchable dictionary (`/glossary`).
- **Concept of the Week & Book Recommendation**: Real-life middle-school analogies for economic/diplomatic concepts and a weekly age-appropriate English book pick tracked in `src/data/books-ledger.json`.
- **Instant Past-Issue Archive & Print Packet (`/archive`)**: Switch to any previous issue from the top bar or `/archive`, and print a clean A4/Letter study packet (including a handwritten MUN & Vocabulary worksheet) in one click.

## Commands
```bash
npm install           # Install dependencies
npm run dev           # Start local development server
npm run validate-data # Validate all issue JSONs & book deduplication ledger
npm test              # Run unit, schema, and static build tests
npm run build         # Build static output to dist/
npm run check-commit  # Verify latest git commit obeys 50/72 char rules
```

## Weekly Curation Workflow
See [`.agents/skills/curate-weekly-issue/SKILL.md`](.agents/skills/curate-weekly-issue/SKILL.md) and [`GEMINI.md`](GEMINI.md) for the automated weekly issue collection and publishing runbook.

