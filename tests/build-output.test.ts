import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

describe('Astro static build & print/archive features', () => {
  it('builds static pages for index, issue permalink, archive, and glossary', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const distDir = path.resolve(process.cwd(), 'dist');
    expect(fs.existsSync(path.join(distDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'issues/2026-W45/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'archive/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'glossary/index.html'))).toBe(true);
    expect(fs.readFileSync(path.join(distDir, 'CNAME'), 'utf-8').trim()).toBe('agora.yocto.kr');

    const issueHtml = fs.readFileSync(path.join(distDir, 'issues/2026-W45/index.html'), 'utf-8');
    expect(issueHtml).toContain('Print Weekly Packet');
    expect(issueHtml).toContain('issue-quick-select');
    expect(issueHtml).toContain('MUN Delegate Prep');

    const archiveHtml = fs.readFileSync(path.join(distDir, 'archive/index.html'), 'utf-8');
    expect(archiveHtml).toContain('?print=1');
  });
});
