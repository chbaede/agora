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
    publishDate: '2026-11-16',
    coveragePeriod: 'Nov 9 – Nov 15, 2026',
    themeTitle: 'Transatlantic Shifts & Clean Tech Frontiers',
    themeTitleKo: '미·유럽 정책 변화와 청정 기술의 최전선',
    editorsNote:
      'This week connects major policy decisions in Washington and Brussels with scientific breakthroughs in space and clean energy.',
    editorsNoteKo:
      '이번 주 호는 워싱턴과 브뤼셀의 주요 정책 결정부터 우주 및 청정에너지 과학의 돌파구까지 한눈에 연결해 살펴봅니다.',
    articles: REQUIRED_CATEGORIES.map((category, idx) => ({
      id: `${id}-art-${idx + 1}`,
      category,
      region: idx % 2 === 0 ? 'US' : 'Europe',
      headline: `Sample Headline for ${category}`,
      headlineKo: `${category} 분야 핵심 뉴스 제목`,
      subheadline: `How recent developments in ${category} shape the world for young citizens.`,
      subheadlineKo: `${category}의 최근 흐름이 미래 세대에게 미치는 영향.`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/United_States_Capitol_-_west_front.jpg/960px-United_States_Capitol_-_west_front.jpg',
      imageCaption: `Editorial photo for ${category}.`,
      imageCaptionKo: `${category} 기사 관련 보도 사진.`,
      imageCredit: 'Wikimedia Commons',
      readingTimeMinutes: 5,
      difficulty: idx % 2 === 0 ? 'Intermediate' : 'Challenge',
      body: [
        `In recent days, international leaders, diplomats, and senior researchers gathered to examine **tariff** policies, **inflation** trends, and long-term **resilience** across major metropolitan cities in North America and Europe. Officials emphasized that clear statistical data and public citizen awareness are essential when navigating complex economic, environmental, and scientific shifts that affect millions of households and schools every single day across both continents.`,
        `Historically, major structural transitions in energy generation, global trade rules, and digital technology require deep coordination across national borders so that critical supply chains remain stable, transparent, and predictable for manufacturers and families alike. Economists pointed out that when countries invest early in public education, power grid modernization, and foundational scientific research, their communities are much better prepared to handle unexpected global disruptions.`,
        `At the same time, policy analysts in Washington, Brussels, London, and Frankfurt debated how national governments should balance immediate household cost relief against long-term infrastructure investments. While some lawmakers favored targeted tax incentives to encourage private engineering innovation and factory upgrades, others argued for direct public funding in clean transit corridors, renewable battery storage, and high-speed digital security networks.`,
        `Looking ahead to the coming months, independent research institutes, central banks, and universities will track how these new policy measures affect everyday consumer prices, industrial manufacturing jobs, and international environmental milestones. For middle school readers and young global citizens, understanding the real-world connection between public policy, physical science, and economics provides a powerful analytical lens for evaluating daily news.`,
      ],
      bodyKo: [
        `최근 각국 지도자들과 연구자들은 북미와 유럽 주요 도시의 관세 정책과 물가상승률 추이, 장기적인 회복탄력성에 대해 심도 있게 논의했습니다.`,
        `역사적으로 에너지와 무역, 기술의 대전환기에는 공급망 안정을 위해 국경을 넘는 정책 조율이 필수적이었습니다.`,
        `동시에 정책 전문가들은 당장의 가계 부담 완화와 장기 인프라 투자 사이에서 어떻게 균형을 잡을지 토론을 이어갔습니다.`,
        `앞으로 수개월 동안 연구 기관들은 이러한 정책이 물가와 일자리, 환경 목표에 미치는 영향을 면밀히 추적할 예정입니다.`,
      ],
      whyItMatters: [
        'Directly affects how everyday technology, food, and energy are priced for families.',
        'Shows how democratic institutions balance national interests with global trade rules.',
        'Connects scientific innovation with long-term economic stability and resilience.',
      ],
      whyItMattersKo: [
        '일상적인 기술 제품과 식료품, 에너지 가격이 결정되는 방식에 직접적인 영향을 미칩니다.',
        '민주주의 제도가 국익과 글로벌 규범 사이에서 어떻게 균형을 잡는지 보여줍니다.',
        '과학기술 혁신이 장기적인 경제 안정 및 회복탄력성과 어떻게 연결되는지 설명합니다.',
      ],
      thinkAboutIt: 'How should governments balance short-term economic costs against long-term sustainability?',
      thinkAboutItKo: '정부는 단기적인 경제적 비용과 장기적인 지속가능성 사이에서 어떻게 균형을 잡아야 할까요?',
      terms: [
        {
          term: 'tariff',
          partOfSpeech: 'noun',
          definition: 'A tax placed by a government on goods imported from other countries.',
          definitionKo: '정부가 외국에서 수입되는 상품에 부과하는 세금(관세).',
          example: 'Higher tariffs can make imported electronics more expensive for families.',
        },
        {
          term: 'inflation',
          partOfSpeech: 'noun',
          definition: 'The rate at which the general level of prices for goods and services rises over time.',
          definitionKo: '시간이 지남에 따라 상품과 서비스의 전반적인 가격 수준이 오르는 현상(물가상승).',
          example: 'Central banks monitor inflation closely to protect household purchasing power.',
        },
        {
          term: 'resilience',
          partOfSpeech: 'noun',
          definition: 'The capacity of a system, community, or economy to recover quickly from difficulties.',
          definitionKo: '시스템이나 공동체, 경제가 충격이나 어려움으로부터 빠르게 회복하는 힘(회복탄력성).',
          example: 'Cities are investing in power grid resilience before winter storms arrive.',
        },
      ],
      source: {
        publisher: 'BBC News',
        title: `Coverage of ${category}`,
        url: 'https://www.bbc.com/news/world',
        publishedDate: '2026-11-14',
      },
    })),
    conceptOfTheWeek: {
      title: 'Central Bank Interest Rates & Inflation',
      titleKo: '중앙은행 기준금리와 인플레이션(물가상승)',
      category: 'Economics',
      summary: 'Central banks like the US Federal Reserve and the European Central Bank adjust interest rates to keep prices stable.',
      summaryKo: '미국 연방준비제도(Fed)와 유럽중앙은행(ECB) 같은 중앙은행은 물가를 안정시키기 위해 기준금리를 조절합니다.',
      realWorldAnalogy:
        'Think of interest rates like the brakes and accelerator on a bicycle going downhill: tapping the brakes (raising rates) keeps spending from overheating.',
      realWorldAnalogyKo:
        '기준금리는 내리막길을 달리는 자전거의 브레이크와 같습니다. 속도가 너무 빠를 때 브레이크를 살짝 잡으면(금리 인상) 경기가 과열되어 물가가 치솟는 것을 막아줍니다.',
      keyTakeaway: 'Even a 0.25% rate change ripples through mortgages, student loans, and currency exchange rates.',
      keyTakeawayKo: '단 0.25%의 금리 변화도 주택담보대출, 학자금 대출, 환율 전반에 큰 파장을 일으킵니다.',
    },
    bookOfTheWeek: {
      title: bookTitle,
      titleKo: '바람을 길들인 풍차 소년 (청소년판)',
      author: 'William Kamkwamba & Bryan Mealer',
      genre: 'Biography / Non-Fiction',
      ageRange: '12–15',
      pageCount: 304,
      coverImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Windmill_in_Malawi.jpg/640px-Windmill_in_Malawi.jpg',
      whyReadIt: 'Connects directly to clean energy innovation and youth problem-solving under resource constraints.',
      whyReadItKo: '자원이 부족한 환경에서도 과학적 호기심과 친환경 에너지 기술로 마을의 문제를 해결한 청소년의 실화입니다.',
      keyTakeaway: 'Curiosity and scientific thinking can transform an entire community even with scrap materials.',
      keyTakeawayKo: '폐자재만으로도 과학적 사고와 끈기가 있다면 공동체 전체를 바꿀 수 있음을 보여줍니다.',
      discussionPrompt: 'What local problem in your city or school could be improved with a simple engineering solution?',
      discussionPromptKo: '우리 학교나 동네에서 간단한 공학적 아이디어로 해결할 수 있는 문제는 무엇이 있을까요?',
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

  it('validates a complete 6-article full-page issue and rejects non-HTTPS or short articles', () => {
    const validIssue = createValidMockIssue('2026-W45', 1, 'The Boy Who Harnessed the Wind');
    expect(validateIssueData(validIssue).valid).toBe(true);

    const brokenUrlIssue = structuredClone(validIssue);
    brokenUrlIssue.articles[0].source.url = 'http://example.com/fake';
    const res = validateIssueData(brokenUrlIssue);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('HTTPS') || e.includes('placeholder'))).toBe(true);

    const tooShortIssue = structuredClone(validIssue);
    tooShortIssue.articles[0].body = ['Only one short paragraph.'];
    tooShortIssue.articles[0].bodyKo = ['짧은 문단 하나.'];
    expect(validateIssueData(tooShortIssue).valid).toBe(false);
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

  it('renders inline glossary highlights safely, matches phrase-wrapped terms, includes example, and preserves non-glossary bold phrases', () => {
    const html = renderBodyWithHighlights(
      'The EU debated a new **tariff** and **one light-day** milestone during **last Monday** talks.',
      [
        {
          term: 'tariff',
          partOfSpeech: 'noun',
          definition: 'A tax on imports.',
          definitionKo: '수입품에 부과하는 관세.',
          example: 'Tariffs rose.',
        },
        {
          term: 'light-day',
          partOfSpeech: 'noun',
          definition: 'Distance light travels in 24h.',
          definitionKo: '빛이 24시간 동안 이동하는 거리(1광일).',
          example: 'Voyager reached one light-day.',
        },
      ]
    );
    expect(html).toContain('class="glossary-inline-term"');
    expect(html).toContain('data-term="tariff"');
    expect(html).toContain('data-term="light-day"');
    expect(html).toContain('Example: Tariffs rose.');
    expect(html).toContain('<strong>last Monday</strong>');
  });

  it('rejects issues where a defined glossary term is not highlighted in the text', () => {
    const issueWithOrphan = createValidMockIssue('2026-W45', 1, 'The Boy Who Harnessed the Wind');
    issueWithOrphan.articles[0].terms.push({
      term: 'orphaned-word',
      partOfSpeech: 'noun',
      definition: 'A word never highlighted in the article body.',
      definitionKo: '본문에 하이라이트되지 않은 고아 단어.',
      example: 'This should fail validation.',
    });
    const res = validateIssueData(issueWithOrphan);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('orphaned-word'))).toBe(true);
  });

  it('rejects issues missing Korean parent-mode translations (ko)', () => {
    const issueWithoutKo = createValidMockIssue('2026-W45', 1, 'The Boy Who Harnessed the Wind');
    delete (issueWithoutKo as Partial<WeeklyIssue>).themeTitleKo;
    const res = validateIssueData(issueWithoutKo);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('themeTitleKo'))).toBe(true);
  });
});
