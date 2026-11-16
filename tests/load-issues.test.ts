import { describe, it, expect } from 'vitest';
import {
  getAllIssues,
  getLatestIssue,
  getIssueById,
  getAdjacentIssues,
  getAllGlossaryTerms,
  getBooksLedger,
} from '../src/data/load-issues';
import { validateAllIssues } from '../src/data/schema';

describe('AGORA issues data integrity and loader', () => {
  it('loads valid issues and passes full schema & ledger validation', () => {
    const issues = getAllIssues();
    const ledger = getBooksLedger();
    expect(issues.length).toBeGreaterThanOrEqual(2);
    const validation = validateAllIssues(issues, ledger);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
  });

  it('retrieves latest issue, Issue #1 (2026-W45), Issue #2 (2026-W46), adjacent links, and aggregates glossary terms', () => {
    const issues = getAllIssues();
    const latest = getLatestIssue();
    expect(latest.id).toBe(issues[0].id);
    expect(getIssueById('2026-W45')?.issueNumber).toBe(1);
    expect(getIssueById('2026-W46')?.issueNumber).toBe(2);
    const adj = getAdjacentIssues('2026-W45');
    expect(adj.previous).toBeUndefined();
    expect(adj.next?.id).toBe('2026-W46');
    const terms = getAllGlossaryTerms();
    expect(terms.length).toBeGreaterThanOrEqual(30);
  });
});
