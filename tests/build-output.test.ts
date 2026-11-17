import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

describe('Astro static build, subpath-safe CSS/links, magazine deck UX, and pure English mode', () => {
  it('inlines all CSS, renders 9-page horizontal magazine deck UX with 6 full-page daily articles, and keeps English mode free of Korean text', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const distDir = path.resolve(process.cwd(), 'dist');
    expect(fs.existsSync(path.join(distDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'issues/2026-W45/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'issues/2026-W46/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'math/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'math/weeks/2026-W46/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'archive/index.html'))).toBe(true);
    expect(fs.existsSync(path.join(distDir, 'glossary/index.html'))).toBe(true);
    expect(fs.readFileSync(path.join(distDir, 'CNAME'), 'utf-8').trim()).toBe('agora.yocto.kr');

    const mathHtml = fs.readFileSync(path.join(distDir, 'math/index.html'), 'utf-8');
    expect(mathHtml).toContain('AGORA MATH LAB');
    expect(mathHtml).toContain('Berlin International School');
    expect(mathHtml).toContain('data-print-slide="1"');
    expect(mathHtml).toContain('math-work-front');
    expect(mathHtml).toContain('math-work-back');
    expect(mathHtml).toContain('class="track-switcher"');

    // Verify that outside .lang-ko-block / .lang-ko-inline / scripts / language switcher, no Hangul leaks into English view on /math
    let strippedMathForEnCheck = mathHtml
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<div[^>]*class="lang-switcher"[\s\S]*?<\/div>/gi, '');

    // Iteratively strip any element with lang-ko-block, lang-ko-inline, or mobile-label class (handles nested spans)
    let prevLen = 0;
    while (strippedMathForEnCheck.length !== prevLen) {
      prevLen = strippedMathForEnCheck.length;
      strippedMathForEnCheck = strippedMathForEnCheck.replace(
        /<([a-z0-9]+)[^>]*class="[^"]*(?:lang-ko-(?:block|inline)|mobile-label)[^"]*"[^>]*>(?:(?!<\1\b)[\s\S])*?<\/\1>/gi,
        ''
      );
    }

    const mathHangulMatches = strippedMathForEnCheck.match(/[가-힣]+/g);
    expect(mathHangulMatches).toBeNull();

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

    // Interactive student & parent UX components (no MUN section)
    expect(indexHtml).toContain('id="reading-progress-bar"');
    expect(indexHtml).toContain('id="weekly-quiz-section"');
    expect(indexHtml).toContain('front-summary-box');
    expect(indexHtml).not.toContain('Model UN');

    // Verify that outside .lang-ko-block / .lang-ko-inline / scripts / data-def-ko attributes, no Hangul leaks into English view
    let strippedForEnCheck = indexHtml
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/data-def-ko="[^"]*"/g, '')
      .replace(/data-def-bi="[^"]*"/g, '')
      .replace(/<div[^>]*class="lang-switcher"[\s\S]*?<\/div>/gi, '');

    let prevIndexLen = 0;
    while (strippedForEnCheck.length !== prevIndexLen) {
      prevIndexLen = strippedForEnCheck.length;
      strippedForEnCheck = strippedForEnCheck.replace(
        /<([a-z0-9]+)[^>]*class="[^"]*(?:lang-ko-(?:block|inline)|mobile-label)[^"]*"[^>]*>(?:(?!<\1\b)[\s\S])*?<\/\1>/gi,
        ''
      );
    }

    const hangulMatches = strippedForEnCheck.match(/[가-힣]+/g);
    expect(hangulMatches).toBeNull();
    expect(indexHtml).toContain('class="badge badge-date"');
    expect(indexHtml).toContain('class="duplex-front-page"');
    expect(indexHtml).toContain('class="duplex-back-page"');
    expect(indexHtml).toContain('data-print-slide="1"');
    expect(indexHtml).toContain('id="btn-print-daily-top"');

    const issueHtml = fs.readFileSync(path.join(distDir, 'issues/2026-W46/index.html'), 'utf-8');
    expect(issueHtml).toContain('<style>');
    expect(issueHtml).not.toContain('href="/_astro/');
    expect(issueHtml).toContain('Print 1-Sheet (Duplex)');
    expect(issueHtml).toContain('Print All Week');
    expect(issueHtml).toContain('print-only-check-footer');
    expect(issueHtml).toContain('issue-quick-select');
    expect(issueHtml).toContain('Weekly Critical Thinking');
    expect(issueHtml).toContain('data-lang-switch="ko"');
    expect(issueHtml).toContain('data-lang-switch="bilingual"');
    expect(issueHtml).toContain('lang-ko-block');
    expect(issueHtml).toContain('class="editorial-figure"');
    expect(issueHtml).toContain('class="book-cover-img"');
  });
});
