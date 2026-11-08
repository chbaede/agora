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
    themeTitleKo: '미·유럽 정책 변화와 청정 기술의 최전선',
    editorsNote:
      'This week connects major policy decisions in Washington and Brussels with scientific breakthroughs in space and clean energy.',
    editorsNoteKo:
      '이번 주 호는 워싱턴과 브뤼셀의 주요 정책 결정부터 우주 및 청정에너지 과학의 돌파구까지 한눈에 연결해 살펴봅니다.',
    munSpotlight: {
      topic: 'Regulating Cross-Border Carbon Tariffs and Clean-Tech Subsidies',
      topicKo: '국경 간 탄소 관세 및 청정기술 보조금 규율 방안',
      committee: 'WTO / UNEP Joint Session',
      region: 'Transatlantic & Global',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bonn_climate_change_conference_may_2012_01.jpg/960px-Bonn_climate_change_conference_may_2012_01.jpg',
      imageCaption: 'Delegates gather at the UN Climate Change Conference plenary hall.',
      imageCaptionKo: '유엔기후변화총회 본회의장에 모인 각국 대표단.',
      imageCredit: 'UNclimatechange / Wikimedia Commons (CC BY 2.0)',
      background: [
        'Governments in the United States and the European Union are racing to build green industries while protecting domestic jobs.',
        'At the same time, developing nations argue that **carbon leakage** rules and massive industrial subsidies can create unfair trade barriers.',
      ],
      backgroundKo: [
        '미국과 유럽연합(EU) 정부는 자국 일자리를 보호하면서 친환경 산업을 육성하기 위해 치열하게 경쟁하고 있습니다.',
        '동시에 개발도상국들은 탄소 누출 방지 규정과 대규모 산업 보조금이 불공정한 무역 장벽이 될 수 있다고 주장합니다.',
      ],
      blocPositions: [
        {
          bloc: 'European Union',
          stance: 'Supports the Carbon Border Adjustment Mechanism (CBAM) to prevent carbon leakage.',
          stanceKo: '탄소 누출을 막기 위해 탄소국경조정제도(CBAM) 도입을 지지합니다.',
        },
        {
          bloc: 'United States',
          stance: 'Favors domestic tax incentives and targeted tariffs over global carbon pricing.',
          stanceKo: '글로벌 탄소 가격제보다는 자국 내 세제 혜택과 표적 관세를 선호합니다.',
        },
        {
          bloc: 'Global South / G77',
          stance: 'Calls for technology transfer and climate finance before strict border taxes take effect.',
          stanceKo: '엄격한 국경세 시행에 앞서 기술 이전과 기후 금융 지원을 요구합니다.',
        },
      ],
      debateMotion:
        'This House believes that carbon border taxes do more to protect wealthy economies than to reduce global emissions.',
      debateMotionKo:
        '본 의회는 탄소국경세가 전 지구적 배출량 감축보다 부유한 경제권을 보호하는 데 더 크게 작용한다고 본다.',
      proArguments: [
        'Raises compliance costs for developing exporters that lack green grid funding.',
        'Can trigger retaliatory trade disputes instead of cooperative climate action.',
      ],
      proArgumentsKo: [
        '친환경 전력망 자금이 부족한 개발도상국 수출 기업에 높은 규제 비용을 부과합니다.',
        '협력적인 기후 행동 대신 보복성 무역 분쟁을 촉발할 수 있습니다.',
      ],
      conArguments: [
        'Prevents factories from simply moving to countries with weaker pollution rules.',
        'Encourages global manufacturers to decarbonize their supply chains faster.',
      ],
      conArgumentsKo: [
        '공장들이 단순히 환경 규제가 약한 국가로 이전하는 현상을 방지합니다.',
        '글로벌 제조사들이 공급망 탈탄소화를 더 앞당기도록 유도합니다.',
      ],
      speechStarter:
        'Honorable Chair and fellow delegates, climate action must never become a disguised wall against fair global trade.',
      speechStarterKo:
        '존경하는 의장님 그리고 각국 대표단 여러분, 기후 행동이 공정한 글로벌 무역을 가로막는 위장된 장벽이 되어서는 안 됩니다.',
      terms: [
        {
          term: 'carbon leakage',
          partOfSpeech: 'noun',
          definition: 'When companies move production to countries with weaker climate rules to avoid emissions costs.',
          definitionKo: '기업이 탄소 배출 비용을 피하기 위해 기후 규제가 느슨한 국가로 생산 시설을 옮기는 현상.',
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
      headlineKo: `${category} 분야 핵심 뉴스 제목`,
      subheadline: `How recent developments in ${category} shape the world for young citizens.`,
      subheadlineKo: `${category}의 최근 흐름이 미래 세대에게 미치는 영향.`,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/United_States_Capitol_-_west_front.jpg/960px-United_States_Capitol_-_west_front.jpg',
      imageCaption: `Editorial photo for ${category}.`,
      imageCaptionKo: `${category} 기사 관련 보도 사진.`,
      imageCredit: 'Wikimedia Commons',
      readingTimeMinutes: 3,
      difficulty: idx % 2 === 0 ? 'Intermediate' : 'Challenge',
      body: [
        `In recent days, leaders discussed **tariff** policies and long-term **resilience** across major cities.`,
        `Analysts noted that international cooperation remains essential for stable growth and scientific progress.`,
      ],
      bodyKo: [
        `최근 각국 지도자들은 주요 도시의 관세 정책과 장기적인 회복탄력성에 대해 논의했습니다.`,
        `전문가들은 안정적인 성장과 과학 발전을 위해 국제 협력이 여전히 필수적이라고 분석했습니다.`,
      ],
      whyItMatters: [
        'Directly affects how everyday technology and energy are priced.',
        'Shows how democratic institutions balance national interests with global rules.',
      ],
      whyItMattersKo: [
        '일상적인 기술 제품과 에너지 가격이 결정되는 방식에 직접적인 영향을 미칩니다.',
        '민주주의 제도가 국익과 글로벌 규범 사이에서 어떻게 균형을 잡는지 보여줍니다.',
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
        publishedDate: '2026-11-05',
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
