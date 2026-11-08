import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

describe('Astro static build, subpath-safe CSS/links, magazine deck UX, and pure English mode', () => {
  it('inlines all CSS, renders 9-page horizontal magazine deck UX, and keeps English mode free of Korean text', () => {
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

    // Magazine deck 1-page-per-story horizontal flip UX
    expect(indexHtml).toContain('class="deck-viewport"');
    expect(indexHtml).toContain('class="toc-cards-grid"');
    expect(indexHtml).toContain('id="btn-next-top"');
    expect(indexHtml).toContain('id="btn-side-next"');
    expect(indexHtml).toContain('data-slide-index="8"');

    // Interactive student & parent UX components
    expect(indexHtml).toContain('id="reading-progress-bar"');
    expect(indexHtml).toContain('id="mun-vote-studio"');
    expect(indexHtml).toContain('id="weekly-quiz-section"');

    // Verify that outside .lang-ko-block / .lang-ko-inline / scripts / data-def-ko attributes, no Hangul leaks into English view
    const strippedForEnCheck = indexHtml
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/data-def-ko="[^"]*"/g, '')
      .replace(/data-def-bi="[^"]*"/g, '')
      .replace(/<([a-z0-9]+)[^>]*class="[^"]*lang-ko-(?:block|inline)[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/🇰🇷 한국어/g, '')
      .replace(/🇺🇸\+🇰🇷 한영 병기/g, '');

    const hangulMatches = strippedForEnCheck.match(/[가-힣]+/g);
    expect(hangulMatches).toBeNull();

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
  });
});
