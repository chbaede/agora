import { execSync } from 'node:child_process';
import { validateCommitMessage } from '../src/data/schema';

function main() {
  const rawMessage = process.argv[2] || execSync('git log -1 --pretty=%B', { encoding: 'utf-8' });
  const result = validateCommitMessage(rawMessage);
  if (!result.valid) {
    console.error('[AGORA Commit Check Failed]');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
  console.log('[AGORA Commit Check] Latest commit message conforms to 50/72 character rules.');
}

main();
