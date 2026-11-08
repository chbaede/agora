export const REQUIRED_CATEGORIES = [
  'US Current Affairs',
  'Europe Current Affairs',
  'Economy & Business',
  'Science & Technology',
  'Environment & Global Society',
] as const;

export type ArticleCategory = (typeof REQUIRED_CATEGORIES)[number];

export interface GlossaryTerm {
  term: string;
  partOfSpeech: string;
  definition: string;
  definitionKo: string;
  example: string;
}

export interface SourceReference {
  publisher: string;
  title: string;
  url: string;
  publishedDate: string;
}

export interface Article {
  id: string;
  category: ArticleCategory;
  region: 'US' | 'Europe' | 'Transatlantic';
  headline: string;
  headlineKo: string;
  subheadline: string;
  subheadlineKo: string;
  imageUrl: string;
  imageCaption: string;
  imageCaptionKo: string;
  imageCredit: string;
  readingTimeMinutes: number;
  difficulty: 'Intermediate' | 'Challenge';
  body: string[];
  bodyKo: string[];
  whyItMatters: string[];
  whyItMattersKo: string[];
  thinkAboutIt: string;
  thinkAboutItKo: string;
  terms: GlossaryTerm[];
  source: SourceReference;
}

export interface MunBlocPosition {
  bloc: string;
  stance: string;
  stanceKo: string;
}

export interface MunSpotlight {
  topic: string;
  topicKo: string;
  committee: string;
  region: string;
  imageUrl: string;
  imageCaption: string;
  imageCaptionKo: string;
  imageCredit: string;
  background: string[];
  backgroundKo: string[];
  blocPositions: MunBlocPosition[];
  debateMotion: string;
  debateMotionKo: string;
  proArguments: string[];
  proArgumentsKo: string[];
  conArguments: string[];
  conArgumentsKo: string[];
  speechStarter: string;
  speechStarterKo: string;
  terms: GlossaryTerm[];
  sources: SourceReference[];
}

export interface ConceptOfTheWeek {
  title: string;
  titleKo: string;
  category: 'Economics' | 'Diplomacy' | 'Science & Civics';
  summary: string;
  summaryKo: string;
  realWorldAnalogy: string;
  realWorldAnalogyKo: string;
  keyTakeaway: string;
  keyTakeawayKo: string;
}

export interface BookRecommendation {
  title: string;
  titleKo: string;
  author: string;
  genre: string;
  ageRange: string;
  pageCount: number;
  coverImageUrl: string;
  whyReadIt: string;
  whyReadItKo: string;
  keyTakeaway: string;
  keyTakeawayKo: string;
  discussionPrompt: string;
  discussionPromptKo: string;
  referenceUrl: string;
}

export interface WeeklyIssue {
  id: string;
  issueNumber: number;
  publishDate: string;
  coveragePeriod: string;
  themeTitle: string;
  themeTitleKo: string;
  editorsNote: string;
  editorsNoteKo: string;
  munSpotlight: MunSpotlight;
  articles: Article[];
  conceptOfTheWeek: ConceptOfTheWeek;
  bookOfTheWeek: BookRecommendation;
}

export interface BookLedgerEntry {
  issueId: string;
  issueNumber: number;
  title: string;
  author: string;
  genre: string;
  publishDate: string;
}

const PLACEHOLDER_DOMAINS = ['example.com', 'example.org', 'localhost', 'placeholder.com', 'test.com'];

export function isValidHttpsUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (PLACEHOLDER_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
      return false;
    }
    return host.includes('.');
  } catch {
    return false;
  }
}

export function validateIssueData(raw: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: ['Issue data must be an object.'] };
  }
  const issue = raw as Partial<WeeklyIssue>;

  if (!issue.id || !/^\d{4}-W\d{2}$/.test(issue.id)) {
    errors.push(`Invalid issue id "${String(issue.id)}": expected YYYY-WXX format.`);
  }
  if (typeof issue.issueNumber !== 'number' || issue.issueNumber < 1) {
    errors.push('issueNumber must be a positive integer.');
  }
  if (!issue.publishDate || !/^\d{4}-\d{2}-\d{2}$/.test(issue.publishDate)) {
    errors.push('publishDate must be in YYYY-MM-DD format.');
  }
  if (!issue.coveragePeriod?.trim()) {
    errors.push('coveragePeriod is required.');
  }
  if (!issue.themeTitle?.trim()) {
    errors.push('themeTitle is required.');
  }
  if (!issue.themeTitleKo?.trim()) {
    errors.push('themeTitleKo (Korean theme title) is required.');
  }
  if (!issue.editorsNote?.trim()) {
    errors.push('editorsNote is required.');
  }
  if (!issue.editorsNoteKo?.trim()) {
    errors.push('editorsNoteKo (Korean editors note) is required.');
  }

  // Validate MUN Spotlight
  const mun = issue.munSpotlight;
  if (!mun) {
    errors.push('munSpotlight is required.');
  } else {
    if (!mun.topic?.trim()) errors.push('munSpotlight.topic is required.');
    if (!mun.topicKo?.trim()) errors.push('munSpotlight.topicKo is required.');
    if (!mun.committee?.trim()) errors.push('munSpotlight.committee is required.');
    if (!isValidHttpsUrl(mun.imageUrl ?? '') || !mun.imageCaption?.trim() || !mun.imageCaptionKo?.trim()) {
      errors.push('munSpotlight requires a valid HTTPS imageUrl, imageCaption, and imageCaptionKo.');
    }
    if (!Array.isArray(mun.background) || mun.background.length < 2) {
      errors.push('munSpotlight.background must have at least 2 paragraphs.');
    }
    if (!Array.isArray(mun.backgroundKo) || mun.backgroundKo.length !== (mun.background?.length ?? 0)) {
      errors.push('munSpotlight.backgroundKo must match munSpotlight.background paragraph count.');
    }
    if (!Array.isArray(mun.blocPositions) || mun.blocPositions.length < 3) {
      errors.push('munSpotlight.blocPositions must have at least 3 blocs.');
    } else {
      mun.blocPositions.forEach((b, i) => {
        if (!b.bloc?.trim() || !b.stance?.trim() || !b.stanceKo?.trim()) {
          errors.push(`munSpotlight.blocPositions[${i}] requires bloc, stance, and stanceKo.`);
        }
      });
    }
    if (!mun.debateMotion?.trim() || !mun.debateMotionKo?.trim()) {
      errors.push('munSpotlight.debateMotion and debateMotionKo are required.');
    }
    if (!Array.isArray(mun.proArguments) || mun.proArguments.length < 2) {
      errors.push('munSpotlight.proArguments must have at least 2 items.');
    }
    if (!Array.isArray(mun.proArgumentsKo) || mun.proArgumentsKo.length !== (mun.proArguments?.length ?? 0)) {
      errors.push('munSpotlight.proArgumentsKo must match proArguments length.');
    }
    if (!Array.isArray(mun.conArguments) || mun.conArguments.length < 2) {
      errors.push('munSpotlight.conArguments must have at least 2 items.');
    }
    if (!Array.isArray(mun.conArgumentsKo) || mun.conArgumentsKo.length !== (mun.conArguments?.length ?? 0)) {
      errors.push('munSpotlight.conArgumentsKo must match conArguments length.');
    }
    if (!mun.speechStarter?.trim() || !mun.speechStarterKo?.trim()) {
      errors.push('munSpotlight.speechStarter and speechStarterKo are required.');
    }
    if (!Array.isArray(mun.sources) || mun.sources.length < 1) {
      errors.push('munSpotlight.sources must contain at least 1 source.');
    } else {
      mun.sources.forEach((src, i) => {
        if (!src.publisher?.trim() || !src.title?.trim() || !isValidHttpsUrl(src.url)) {
          errors.push(`munSpotlight.sources[${i}] must have a valid HTTPS non-placeholder URL and publisher.`);
        }
      });
    }
    if (Array.isArray(mun.terms)) {
      mun.terms.forEach((t, tIdx) => {
        if (!t.term?.trim() || !t.definition?.trim() || !t.definitionKo?.trim() || !t.example?.trim()) {
          errors.push(`munSpotlight.terms[${tIdx}] requires term, definition, definitionKo, and example.`);
        }
      });
    }
    if (Array.isArray(mun.terms) && Array.isArray(mun.background)) {
      const renderedMun = mun.background.map((p) => renderBodyWithHighlights(p, mun.terms)).join(' ');
      for (const t of mun.terms) {
        const attr = `data-term="${escapeHtml(t.term.trim().toLowerCase())}"`;
        if (!renderedMun.includes(attr)) {
          errors.push(`munSpotlight term "${t.term}" is not highlighted with **...** in munSpotlight.background.`);
        }
      }
    }
  }

  // Validate Articles
  if (!Array.isArray(issue.articles) || issue.articles.length !== REQUIRED_CATEGORIES.length) {
    errors.push(`articles must contain exactly ${REQUIRED_CATEGORIES.length} items.`);
  } else {
    const presentCategories = new Set<string>();
    issue.articles.forEach((art, idx) => {
      presentCategories.add(art.category);
      if (!art.headline?.trim() || !art.headlineKo?.trim()) {
        errors.push(`articles[${idx}] requires headline and headlineKo.`);
      }
      if (!art.subheadline?.trim() || !art.subheadlineKo?.trim()) {
        errors.push(`articles[${idx}] requires subheadline and subheadlineKo.`);
      }
      if (!isValidHttpsUrl(art.imageUrl ?? '') || !art.imageCaption?.trim() || !art.imageCaptionKo?.trim()) {
        errors.push(`articles[${idx}] requires a valid HTTPS imageUrl, imageCaption, and imageCaptionKo.`);
      }
      if (!Array.isArray(art.body) || art.body.length < 2) {
        errors.push(`articles[${idx}].body must contain at least 2 paragraphs.`);
      }
      if (!Array.isArray(art.bodyKo) || art.bodyKo.length !== (art.body?.length ?? 0)) {
        errors.push(`articles[${idx}].bodyKo must match body paragraph count.`);
      }
      if (!Array.isArray(art.whyItMatters) || art.whyItMatters.length < 2) {
        errors.push(`articles[${idx}].whyItMatters must contain at least 2 points.`);
      }
      if (!Array.isArray(art.whyItMattersKo) || art.whyItMattersKo.length !== (art.whyItMatters?.length ?? 0)) {
        errors.push(`articles[${idx}].whyItMattersKo must match whyItMatters count.`);
      }
      if (!art.thinkAboutIt?.trim() || !art.thinkAboutItKo?.trim()) {
        errors.push(`articles[${idx}] requires thinkAboutIt and thinkAboutItKo.`);
      }
      if (!Array.isArray(art.terms) || art.terms.length < 2) {
        errors.push(`articles[${idx}].terms must contain at least 2 glossary terms.`);
      } else {
        art.terms.forEach((t, tIdx) => {
          if (!t.term?.trim() || !t.definition?.trim() || !t.definitionKo?.trim() || !t.example?.trim()) {
            errors.push(`articles[${idx}].terms[${tIdx}] is missing term, definition, definitionKo, or example.`);
          }
        });
        if (Array.isArray(art.body)) {
          const renderedBody = art.body.map((p) => renderBodyWithHighlights(p, art.terms)).join(' ');
          for (const t of art.terms) {
            const attr = `data-term="${escapeHtml(t.term.trim().toLowerCase())}"`;
            if (!renderedBody.includes(attr)) {
              errors.push(`articles[${idx}] term "${t.term}" is not highlighted with **...** in articles[${idx}].body.`);
            }
          }
        }
      }
      if (!art.source || !art.source.publisher?.trim() || !isValidHttpsUrl(art.source.url)) {
        errors.push(`articles[${idx}].source must have a valid HTTPS non-placeholder URL.`);
      }
    });

    for (const reqCat of REQUIRED_CATEGORIES) {
      if (!presentCategories.has(reqCat)) {
        errors.push(`Missing required article category: "${reqCat}".`);
      }
    }
  }

  // Validate Concept of the Week
  const concept = issue.conceptOfTheWeek;
  if (
    !concept ||
    !concept.title?.trim() ||
    !concept.titleKo?.trim() ||
    !concept.summary?.trim() ||
    !concept.summaryKo?.trim() ||
    !concept.realWorldAnalogy?.trim() ||
    !concept.realWorldAnalogyKo?.trim() ||
    !concept.keyTakeaway?.trim() ||
    !concept.keyTakeawayKo?.trim()
  ) {
    errors.push('conceptOfTheWeek must include all English and Korean (Ko) fields.');
  }

  // Validate Book of the Week
  const book = issue.bookOfTheWeek;
  if (!book) {
    errors.push('bookOfTheWeek is required.');
  } else {
    if (!book.title?.trim() || !book.titleKo?.trim() || !book.author?.trim()) {
      errors.push('bookOfTheWeek must include title, titleKo, and author.');
    }
    if (
      !book.whyReadIt?.trim() ||
      !book.whyReadItKo?.trim() ||
      !book.keyTakeaway?.trim() ||
      !book.keyTakeawayKo?.trim() ||
      !book.discussionPrompt?.trim() ||
      !book.discussionPromptKo?.trim()
    ) {
      errors.push('bookOfTheWeek must include all English and Korean (Ko) summary and discussion fields.');
    }
    if (!isValidHttpsUrl(book.referenceUrl)) {
      errors.push('bookOfTheWeek.referenceUrl must be a valid HTTPS non-placeholder URL.');
    }
    if (!isValidHttpsUrl(book.coverImageUrl ?? '')) {
      errors.push('bookOfTheWeek.coverImageUrl must be a valid HTTPS non-placeholder URL.');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAllIssues(
  issues: WeeklyIssue[],
  ledger: BookLedgerEntry[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenIssueNumbers = new Set<number>();
  const seenBooksInIssues = new Map<string, string>();

  for (const issue of issues) {
    const single = validateIssueData(issue);
    if (!single.valid) {
      errors.push(...single.errors.map((e) => `[${issue.id || 'unknown'}] ${e}`));
    }
    if (seenIds.has(issue.id)) {
      errors.push(`Duplicate issue id: ${issue.id}`);
    }
    seenIds.add(issue.id);

    if (seenIssueNumbers.has(issue.issueNumber)) {
      errors.push(`Duplicate issueNumber: ${issue.issueNumber}`);
    }
    seenIssueNumbers.add(issue.issueNumber);

    const normalizedTitle = issue.bookOfTheWeek?.title?.trim().toLowerCase();
    if (normalizedTitle) {
      if (seenBooksInIssues.has(normalizedTitle)) {
        errors.push(
          `Duplicate book recommendation "${issue.bookOfTheWeek.title}" in ${issue.id} and ${seenBooksInIssues.get(normalizedTitle)}`
        );
      }
      seenBooksInIssues.set(normalizedTitle, issue.id);
    }

    const ledgerMatch = ledger.find((entry) => entry.issueId === issue.id);
    if (!ledgerMatch) {
      errors.push(`Issue ${issue.id} book "${issue.bookOfTheWeek?.title}" is missing from books-ledger.json.`);
    } else if (ledgerMatch.title.trim().toLowerCase() !== normalizedTitle) {
      errors.push(`Book title mismatch between issue ${issue.id} and books-ledger.json.`);
    }
  }

  const seenLedgerBooks = new Set<string>();
  for (const entry of ledger) {
    const norm = entry.title.trim().toLowerCase();
    if (seenLedgerBooks.has(norm)) {
      errors.push(`Duplicate book in books-ledger.json: "${entry.title}".`);
    }
    seenLedgerBooks.add(norm);
  }

  return { valid: errors.length === 0, errors };
}

export function validateCommitMessage(message: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = message.replace(/\r\n/g, '\n').trimEnd().split('\n');
  const subject = lines[0] ?? '';

  if (!subject.trim()) {
    errors.push('Commit subject line cannot be empty.');
  }
  if (subject.length > 50) {
    errors.push(`Commit subject line is ${subject.length} chars (must be <= 50): "${subject}"`);
  }
  if (lines.length > 1 && lines[1].trim() !== '') {
    errors.push('Second line of commit message must be blank.');
  }
  for (let i = 2; i < lines.length; i++) {
    if (lines[i].length > 72) {
      errors.push(`Commit body line ${i + 1} is ${lines[i].length} chars (must be <= 72): "${lines[i]}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderBodyWithHighlights(paragraph: string, terms: GlossaryTerm[]): string {
  const escaped = escapeHtml(paragraph);
  const termMap = new Map<string, GlossaryTerm>();
  for (const t of terms) {
    termMap.set(t.term.trim().toLowerCase(), t);
  }

  return escaped.replace(/\*\*([^*]+)\*\*/g, (_match, innerText: string) => {
    const normalized = innerText.trim().toLowerCase();
    const matched =
      termMap.get(normalized) ??
      Array.from(termMap.values()).find((t) => {
        const target = t.term.trim().toLowerCase();
        return (
          normalized.startsWith(target) ||
          target.startsWith(normalized) ||
          normalized.includes(target)
        );
      });

    if (matched) {
      const koSuffix = matched.definitionKo ? ` | [뜻] ${matched.definitionKo}` : '';
      const defAttr = escapeHtml(
        `${matched.term} (${matched.partOfSpeech}): ${matched.definition}${koSuffix} — Example: ${matched.example}`
      );
      const termAttr = escapeHtml(matched.term.trim().toLowerCase());
      return `<mark class="glossary-inline-term" data-term="${termAttr}" title="${defAttr}" tabindex="0">${innerText}</mark>`;
    }
    return `<strong>${innerText}</strong>`;
  });
}
