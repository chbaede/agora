import { getAllIssues, getBooksLedger, getAllGlossaryTerms } from '../src/data/load-issues';
import { validateAllIssues } from '../src/data/schema';
import { getAllMathPacks } from '../src/data/load-math';
import { validateMathPack } from '../src/data/math-schema';

function main() {
  const issues = getAllIssues();
  const ledger = getBooksLedger();
  const mathPacks = getAllMathPacks();

  if (issues.length === 0) {
    console.error('[AGORA Validation Failed] No issues found in src/data/issues/.');
    process.exit(1);
  }

  const result = validateAllIssues(issues, ledger);
  if (!result.valid) {
    console.error('[AGORA Validation Failed - News Issues]');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  if (mathPacks.length === 0) {
    console.error('[AGORA Validation Failed] No math packs found in src/data/math/.');
    process.exit(1);
  }

  for (const pack of mathPacks) {
    const mathRes = validateMathPack(pack);
    if (!mathRes.valid) {
      console.error(`[AGORA Validation Failed - Math Pack ${pack.id}]`);
      for (const err of mathRes.errors) {
        console.error(`  - ${err}`);
      }
      process.exit(1);
    }
  }

  const totalTerms = getAllGlossaryTerms().length;
  console.log(
    `[AGORA Validation] All ${issues.length} news issue(s), ${mathPacks.length} math pack(s), ${ledger.length} book ledger entry(s), and ${totalTerms} glossary terms are valid.`
  );
}

main();
