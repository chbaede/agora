import { describe, it, expect } from 'vitest';
import {
  validateIssueData,
  validateAllIssues,
  validateCommitMessage,
  renderBodyWithHighlights,
  REQUIRED_CATEGORIES,
  type WeeklyIssue,
  type BookLedgerEntry,
} from '../src/data/schema';

function createValidMockIssue(id: string, issueNumber: number, bookTitle: string): WeeklyIssue {
  return {
    id,
    issueNumber,
    publishDate: '2026-11-09',
    coveragePeriod: 'Nov 2 – Nov 8, 2026',
    themeTitle: 'Transatlantic Shifts & Clean Tech Frontiers',
    editorsNote:
      'This week connects major policy decisions in Washington and Brussels with scientific breakthroughs in space and clean energy.',
    munSpotlight: {
      topic: 'Regulating Cross-Border Carbon Tariffs and Clean-Tech Subsidies',
      committee: 'WTO / UNEP Joint Session',
      region: 'Transatlantic & Global',
      background: [
        'Governments in the United States and the European Union are racing to build green industries while protecting domestic jobs.',
        'At the same time, developing nations argue that carbon border taxes and massive industrial subsidies can create unfair trade barriers.',
      ],
      blocPositions: [
        { bloc: 'European Union', stance: 'Supports the Carbon Border Adjustment Mechanism (CBAM) to prevent carbon leakage.' },
        { bloc: 'United States', stance: 'Favors domestic tax incentives and targeted tariffs over global carbon pricing.' },
        { bloc: 'Global South / G77', stance: 'Calls for technology transfer and climate finance before strict border taxes take effect.' },
      ],
      debateMotion:
        'This House believes that carbon border taxes do more to protect wealthy economies than to reduce global emissions.',
      proArguments: [
        'Raises compliance costs for developing exporters that lack green grid funding.',
        'Can trigger retaliatory trade disputes instead of cooperative climate action.',
      ],
      conArguments: [
        'Prevents factories from simply moving to countries with weaker pollution rules.',
        'Encourages global manufacturers to decarbonize their supply chains faster.',
      ],
      speechStarter:
        'Honorable Chair and fellow delegates, climate action must never become a disguised wall against fair global trade.',
      terms: [
        {
          term: 'carbon leakage',
          partOfSpeech: 'noun',
          definition: 'When companies move production to countries with weaker climate rules to avoid emissions costs.',
          example: 'The EU designed its border levy to prevent carbon leakage in steel and cement.',
        },
      ],
      sources: [
        {
          publisher: 'Reuters',
          title: 'Global climate and trade negotiators debate carbon border measures',
          url: 'https://www.reuters.com/sustainability/',
          publishedDate: '2026-11-06',
        },
      ],
    },
    articles: REQUIRED_CATEGORIES.map((category, idx) => ({
      id: `${id}-art-${idx + 1}`,
      category,
      region: idx % 2 === 0 ? 'US' : 'Europe',
      headline: `Sample Headline for ${category}`,
      subheadline: `How recent developments in ${category} shape the world for young citizens.`,
      readingTimeMinutes: 3,
      difficulty: idx % 2 === 0 ? 'Intermediate' : 'Challenge',
      body: [
        `In recent days, leaders discussed **tariff** policies and long-term **resilience** across major cities.`,
        `Analysts noted that international cooperation remains essential for stable growth and scientific progress.`,
      ],
      whyItMatters: [
        'Directly affects how everyday technology and energy are priced.',
        'Shows how democratic institutions balance national interests with global rules.',
      ],
      thinkAboutIt: 'How should governments balance short-term economic costs against long-term sustainability?',
      terms: [
        {
          term: 'tariff',
          partOfSpeech: 'noun',
          definition: 'A tax placed by a government on goods imported from other countries.',
          example: 'Higher tariffs can make imported electronics more expensive for families.',
        },
        {
          term: 'resilience',
          partOfSpeech: 'noun',
          definition: 'The capacity of a system, community, or economy to recover quickly from difficulties.',
          example: 'Cities are investing in power grid resilience before winter storms arrive.',
        },
      ],
      source: {
        publisher: 'BBC News',
        title: `Coverage of ${category}`,
        url: 'https://www.bbc.com/news/world',
        publishedDate: '2026-11-05',
      },
    })),
    conceptOfTheWeek: {
      title: 'Central Bank Interest Rates & Inflation',
      category: 'Economics',
      summary: 'Central banks like the US Federal Reserve and the European Central Bank adjust interest rates to keep prices stable.',
      realWorldAnalogy:
        'Think of interest rates like the brakes and accelerator on a bicycle going downhill: tapping the brakes (raising rates) keeps spending from overheating.',
      keyTakeaway: 'Even a 0.25% rate change ripples through mortgages, student loans, and currency exchange rates.',
    },
    bookOfTheWeek: {
      title: bookTitle,
      author: 'William Kamkwamba & Bryan Mealer',
      genre: 'Biography / Non-Fiction',
      ageRange: '12–15',
      pageCount: 304,
      whyReadIt: 'Connects directly to clean energy innovation and youth problem-solving under resource constraints.',
      keyTakeaway: 'Curiosity and scientific thinking can transform an entire community even with scrap materials.',
      discussionPrompt: 'What local problem in your city or school could be improved with a simple engineering solution?',
      referenceUrl: 'https://openlibrary.org/works/OL15160542W',
    },
  };
}

describe('AGORA schema & commit validators', () => {
  it('enforces 50/72 character limits on commit messages', () => {
    expect(validateCommitMessage('feat: add weekly issue schema\n\nShort body line.').valid).toBe(true);
    expect(
      validateCommitMessage('feat: this commit subject line is definitely longer than fifty characters allowed').valid
    ).toBe(false);
    expect(
      validateCommitMessage(
        'feat: short title\n\nThis body line is intentionally written to exceed the strict seventy-two character per line limit.'
      ).valid
    ).toBe(false);
  });

  it('validates a complete issue and rejects non-HTTPS or placeholder source URLs', () => {
    const validIssue = createValidMockIssue('2026-W45', 1, 'The Boy Who Harnessed the Wind');
    expect(validateIssueData(validIssue).valid).toBe(true);

    const brokenUrlIssue = structuredClone(validIssue);
    brokenUrlIssue.articles[0].source.url = 'http://example.com/fake';
    const res = validateIssueData(brokenUrlIssue);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('HTTPS') || e.includes('placeholder'))).toBe(true);
  });

  it('rejects duplicate book recommendations across issues and ledger', () => {
    const mockIssue1 = createValidMockIssue('2026-W45', 1, 'The Boy Who Harnessed the Wind');
    const mockIssue2 = createValidMockIssue('2026-W46', 2, 'The Boy Who Harnessed the Wind');
    const ledger: BookLedgerEntry[] = [
      {
        issueId: '2026-W45',
        issueNumber: 1,
        title: 'The Boy Who Harnessed the Wind',
        author: 'William Kamkwamba',
        genre: 'Memoir',
        publishDate: '2026-11-09',
      },
      {
        issueId: '2026-W46',
        issueNumber: 2,
        title: 'The Boy Who Harnessed the Wind',
        author: 'William Kamkwamba',
        genre: 'Memoir',
        publishDate: '2026-11-16',
      },
    ];
    const check = validateAllIssues([mockIssue1, mockIssue2], ledger);
    expect(check.valid).toBe(false);
    expect(check.errors.some((e) => e.includes('Duplicate book'))).toBe(true);
  });

  it('renders inline glossary highlights safely and preserves non-glossary bold phrases', () => {
    const html = renderBodyWithHighlights(
      'The EU debated a new **tariff** during **last Monday** talks.',
      [{ term: 'tariff', partOfSpeech: 'noun', definition: 'A tax on imports.', example: 'Tariffs rose.' }]
    );
    expect(html).toContain('class="glossary-inline-term"');
    expect(html).toContain('data-term="tariff"');
    expect(html).toContain('<strong>last Monday</strong>');
  });
});

