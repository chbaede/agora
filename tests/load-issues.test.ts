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

describe('Issue #1 (2026-W45) data integrity and loader', () => {
  it('loads valid issues and passes full schema & ledger validation', () => {
    const issues = getAllIssues();
    const ledger = getBooksLedger();
    expect(issues.length).toBeGreaterThanOrEqual(1);
    const validation = validateAllIssues(issues, ledger);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
  });

  it('retrieves Issue #1 (2026-W45), adjacent links, and aggregates glossary terms', () => {
    const latest = getLatestIssue();
    expect(latest.id).toBe('2026-W45');
    expect(getIssueById('2026-W45')?.issueNumber).toBe(1);
    const adj = getAdjacentIssues('2026-W45');
    expect(adj.previous).toBeUndefined();
    const terms = getAllGlossaryTerms();
    expect(terms.length).toBeGreaterThanOrEqual(12);
  });
});

