import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

describe('Astro static build, subpath-safe CSS/links, and interactive student UX', () => {
  it('inlines all CSS (no /_astro/*.css 404s on /agora/ subpath) and renders interactive UX components', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const distDir = path.resolve(process.cwd(), 'dist');
    expect(fs.existsSync(path.join(distDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'issues/2026-W45/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'archive/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'glossary/index.html'))).toBe(true);
    expect(fs.readFileSync(path.join(distDir, 'CNAME'), 'utf-8').trim()).toBe('agora.yocto.kr');

    const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    // Must inline styles so both https://chbaede.github.io/agora/ and https://agora.yocto.kr/ render full CSS
    expect(indexHtml).toContain('<style>');
    expect(indexHtml).not.toContain('href="/_astro/');

    // Interactive student & parent UX components
    expect(indexHtml).toContain('id="reading-progress-bar"');
    expect(indexHtml).toContain('id="mun-vote-studio"');
    expect(indexHtml).toContain('id="weekly-quiz-section"');

    const issueHtml = fs.readFileSync(path.join(distDir, 'issues/2026-W45/index.html'), 'utf-8');
    expect(issueHtml).toContain('<style>');
    expect(issueHtml).not.toContain('href="/_astro/');
    expect(issueHtml).toContain('Print Weekly Packet');
    expect(issueHtml).toContain('issue-quick-select');
    expect(issueHtml).toContain('MUN Delegate Prep');
    expect(issueHtml).toContain('data-lang-switch="ko"');
    expect(issueHtml).toContain('data-lang-switch="bilingual"');
    expect(issueHtml).toContain('lang-ko-block');
    expect(issueHtml).toContain('class="editorial-figure"');
    expect(issueHtml).toContain('class="book-cover-img"');

    const archiveHtml = fs.readFileSync(path.join(distDir, 'archive/index.html'), 'utf-8');
    expect(archiveHtml).toContain('<style>');
    expect(archiveHtml).toContain('print=1');
  });
});
