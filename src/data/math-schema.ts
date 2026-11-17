export const REQUIRED_MATH_DAYS = [
  'Day 1 (Mon)',
  'Day 2 (Tue)',
  'Day 3 (Wed)',
  'Day 4 (Thu)',
  'Day 5 (Fri)',
  'Day 6 (Sat)',
  'Day 7 (Sun)',
] as const;

export type MathDayLabel = (typeof REQUIRED_MATH_DAYS)[number];

export interface MathProblem {
  number: number; // 1 to 16
  tier: 'Warm-Up' | 'Standard' | 'Challenge';
  tierKo: '기초 필수' | '표준 응용' | '심화 도전';
  points: number;
  question: string;
  questionKo: string;
  answer: string;
  answerKo: string;
  solutionSteps: string[];
  solutionStepsKo: string[];
}

export interface MathDailySheet {
  id: string;
  dayIndex: number; // 1 to 7
  dayLabel: MathDayLabel;
  dayLabelKo: string;
  unitCode: string;
  unitCodeKo: string;
  topic: string;
  topicKo: string;
  subtitle: string;
  subtitleKo: string;
  formulaBox: string[];
  formulaBoxKo: string[];
  workedExample: {
    problem: string;
    problemKo: string;
    steps: string;
    stepsKo: string;
  };
  problems: MathProblem[]; // 8 problems per day (Problems 1-4 on Front Page 1, Problems 5-8 on Back Page 2)
}

export interface WeeklyMathPack {
  id: string;
  weekNumber: number;
  publishDate: string;
  schoolLevel: string;
  schoolLevelKo: string;
  themeTitle: string;
  themeTitleKo: string;
  CurriculumNote: string;
  CurriculumNoteKo: string;
  dailySheets: MathDailySheet[];
}

export function validateMathPack(raw: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: ['Math pack must be an object.'] };
  }
  const pack = raw as Partial<WeeklyMathPack>;

  if (!pack.id || !/^\d{4}-W\d{2}$/.test(pack.id)) {
    errors.push(`Invalid math pack id "${String(pack.id)}": expected YYYY-WXX.`);
  }
  if (typeof pack.weekNumber !== 'number' || pack.weekNumber < 1) {
    errors.push('weekNumber must be a positive integer.');
  }
  if (!pack.publishDate || !/^\d{4}-\d{2}-\d{2}$/.test(pack.publishDate)) {
    errors.push('publishDate must be YYYY-MM-DD.');
  }
  if (!pack.themeTitle?.trim() || !pack.themeTitleKo?.trim() || !pack.schoolLevelKo?.trim()) {
    errors.push('themeTitle, themeTitleKo, and schoolLevelKo are required.');
  }
  if (!Array.isArray(pack.dailySheets) || pack.dailySheets.length !== 7) {
    errors.push('dailySheets must contain exactly 7 daily worksheets (Mon–Sun).');
  } else {
    pack.dailySheets.forEach((sheet, sIdx) => {
      if (!sheet.topic?.trim() || !sheet.topicKo?.trim() || !sheet.unitCodeKo?.trim()) {
        errors.push(`dailySheets[${sIdx}] requires topic, topicKo, and unitCodeKo.`);
      }
      if (!Array.isArray(sheet.formulaBox) || sheet.formulaBox.length < 2) {
        errors.push(`dailySheets[${sIdx}].formulaBox must have at least 2 key formulas/rules.`);
      } else {
        sheet.formulaBox.forEach((f, fIdx) => {
          if (/[가-힣]/.test(f)) {
            errors.push(`dailySheets[${sIdx}].formulaBox[${fIdx}] contains Korean characters (must be pure English).`);
          }
        });
      }
      if (!Array.isArray(sheet.problems) || sheet.problems.length !== 16) {
        errors.push(`dailySheets[${sIdx}].problems must contain exactly 16 problems (8 Front + 8 Back).`);
      } else {
        sheet.problems.forEach((p, pIdx) => {
          if (!p.question?.trim() || !p.questionKo?.trim() || !p.answer?.trim() || !p.answerKo?.trim() || !p.tierKo?.trim()) {
            errors.push(`dailySheets[${sIdx}].problems[${pIdx}] requires question, questionKo, answer, answerKo, and tierKo.`);
          }
          if (/[가-힣]/.test(p.question) || /[가-힣]/.test(p.answer)) {
            errors.push(`dailySheets[${sIdx}].problems[${pIdx}] English question/answer contains Korean characters.`);
          }
          if (!Array.isArray(p.solutionSteps) || p.solutionSteps.length < 1 || !Array.isArray(p.solutionStepsKo) || p.solutionStepsKo.length < 1) {
            errors.push(`dailySheets[${sIdx}].problems[${pIdx}] requires solutionSteps and solutionStepsKo.`);
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
