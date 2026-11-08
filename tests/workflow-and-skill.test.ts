import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Workspace curation skill and GitHub Pages workflow', () => {
  it('includes a complete curate-weekly-issue SKILL.md and GEMINI.md', () => {
    const skillPath = path.resolve(process.cwd(), '.agents/skills/curate-weekly-issue/SKILL.md');
    const geminiPath = path.resolve(process.cwd(), 'GEMINI.md');
    expect(fs.existsSync(skillPath)).toBe(true);
    expect(fs.existsSync(geminiPath)).toBe(true);
    const skillContent = fs.readFileSync(skillPath, 'utf-8');
    expect(skillContent).toContain('name: curate-weekly-issue');
    expect(skillContent).toContain('npm run validate-data');
    expect(skillContent).toContain('books-ledger.json');
  });

  it('configures GitHub Actions deploy.yml for GitHub Pages', () => {
    const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');
    expect(fs.existsSync(workflowPath)).toBe(true);
    const yaml = fs.readFileSync(workflowPath, 'utf-8');
    expect(yaml).toContain('actions/deploy-pages@v4');
    expect(yaml).toContain('npm run validate-data');
  });
});

