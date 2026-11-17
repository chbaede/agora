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
  number: number; // 1 to 8
  tier: 'Warm-Up' | 'Standard' | 'Challenge';
  points: number;
  question: string;
  questionKo: string;
  hint?: string;
  hintKo?: string;
  answer: string;
  answerKo?: string;
  solutionSteps: string[];
  solutionStepsKo: string[];
}

export interface MathDailySheet {
  id: string;
  dayIndex: number; // 1 to 7
  dayLabel: MathDayLabel;
  dayLabelKo: string;
  unitCode: string; // e.g., "MYP 3 · Unit 2: Linear Algebra"
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
  problems: MathProblem[]; // 8 problems per day (3 Warm-Up, 3 Standard, 2 Challenge = 100 pts)
}

export interface WeeklyMathPack {
  id: string; // e.g., "2026-W46"
  weekNumber: number;
  publishDate: string;
  schoolLevel: string; // "Berlin International School · Grade 8 (IB MYP 3) · Semester 1"
  themeTitle: string;
  themeTitleKo: string;
  CurriculumNote: string;
  CurriculumNoteKo: string;
  dailySheets: MathDailySheet[]; // 7 daily sheets (Mon-Sun)
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
  if (!pack.themeTitle?.trim() || !pack.themeTitleKo?.trim()) {
    errors.push('themeTitle and themeTitleKo are required.');
  }
  if (!Array.isArray(pack.dailySheets) || pack.dailySheets.length !== 7) {
    errors.push('dailySheets must contain exactly 7 daily worksheets (Mon–Sun).');
  } else {
    pack.dailySheets.forEach((sheet, sIdx) => {
      if (!sheet.topic?.trim() || !sheet.topicKo?.trim()) {
        errors.push(`dailySheets[${sIdx}] requires topic and topicKo.`);
      }
      if (!Array.isArray(sheet.formulaBox) || sheet.formulaBox.length < 2) {
        errors.push(`dailySheets[${sIdx}].formulaBox must have at least 2 key formulas/rules.`);
      }
      if (!Array.isArray(sheet.problems) || sheet.problems.length !== 8) {
        errors.push(`dailySheets[${sIdx}].problems must contain exactly 8 problems.`);
      } else {
        sheet.problems.forEach((p, pIdx) => {
          if (!p.question?.trim() || !p.questionKo?.trim() || !p.answer?.trim()) {
            errors.push(`dailySheets[${sIdx}].problems[${pIdx}] requires question, questionKo, and answer.`);
          }
          if (!Array.isArray(p.solutionSteps) || p.solutionSteps.length < 1) {
            errors.push(`dailySheets[${sIdx}].problems[${pIdx}] requires solutionSteps.`);
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
