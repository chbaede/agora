import fs from 'node:fs';
import path from 'node:path';
import type { WeeklyIssue, BookLedgerEntry, GlossaryTerm } from './schema';

const ISSUES_DIR = path.resolve(process.cwd(), 'src/data/issues');
const LEDGER_PATH = path.resolve(process.cwd(), 'src/data/books-ledger.json');

export function getAllIssues(): WeeklyIssue[] {
  if (!fs.existsSync(ISSUES_DIR)) {
    return [];
  }
  const files = fs.readdirSync(ISSUES_DIR).filter((file) => file.endsWith('.json'));
  const issues: WeeklyIssue[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(ISSUES_DIR, file), 'utf-8');
    return JSON.parse(raw) as WeeklyIssue;
  });

  return issues.sort((a, b) => b.issueNumber - a.issueNumber);
}

export function getLatestIssue(): WeeklyIssue {
  const issues = getAllIssues();
  if (issues.length === 0) {
    throw new Error('No weekly issues found in src/data/issues/');
  }
  return issues[0];
}

export function getIssueById(id: string): WeeklyIssue | undefined {
  return getAllIssues().find((issue) => issue.id === id);
}

export function getAdjacentIssues(id: string): { previous?: WeeklyIssue; next?: WeeklyIssue } {
  const chronological = [...getAllIssues()].sort((a, b) => a.issueNumber - b.issueNumber);
  const index = chronological.findIndex((i) => i.id === id);
  if (index === -1) return {};
  return {
    previous: index > 0 ? chronological[index - 1] : undefined,
    next: index < chronological.length - 1 ? chronological[index + 1] : undefined,
  };
}

export interface IndexedGlossaryTerm extends GlossaryTerm {
  issueId: string;
  issueNumber: number;
  publishDate: string;
  sourceSection: string;
}

export function getAllGlossaryTerms(): IndexedGlossaryTerm[] {
  const issues = getAllIssues();
  const terms: IndexedGlossaryTerm[] = [];

  for (const issue of issues) {
    for (const t of issue.munSpotlight.terms ?? []) {
      terms.push({
        ...t,
        issueId: issue.id,
        issueNumber: issue.issueNumber,
        publishDate: issue.publishDate,
        sourceSection: `MUN Spotlight: ${issue.munSpotlight.committee}`,
      });
    }
    for (const article of issue.articles) {
      for (const t of article.terms) {
        terms.push({
          ...t,
          issueId: issue.id,
          issueNumber: issue.issueNumber,
          publishDate: issue.publishDate,
          sourceSection: article.category,
        });
      }
    }
  }

  return terms;
}

export function getBooksLedger(): BookLedgerEntry[] {
  if (!fs.existsSync(LEDGER_PATH)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8')) as BookLedgerEntry[];
}
