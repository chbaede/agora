import { getAllIssues, getBooksLedger, getAllGlossaryTerms } from '../src/data/load-issues';
import { validateAllIssues } from '../src/data/schema';

function main() {
  const issues = getAllIssues();
  const ledger = getBooksLedger();

  if (issues.length === 0) {
    console.error('[AGORA Validation Failed] No issues found in src/data/issues/.');
    process.exit(1);
  }

  const result = validateAllIssues(issues, ledger);
  if (!result.valid) {
    console.error('[AGORA Validation Failed]');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const totalTerms = getAllGlossaryTerms().length;
  console.log(
    `[AGORA Validation] All ${issues.length} issue(s), ${ledger.length} book ledger entry(s), and ${totalTerms} glossary terms are valid.`
  );
}

main();

