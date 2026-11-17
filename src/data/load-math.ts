import fs from 'node:fs';
import path from 'node:path';
import type { WeeklyMathPack } from './math-schema';

const MATH_DIR = path.resolve(process.cwd(), 'src/data/math');

export function getAllMathPacks(): WeeklyMathPack[] {
  if (!fs.existsSync(MATH_DIR)) {
    return [];
  }
  const files = fs.readdirSync(MATH_DIR).filter((file) => file.endsWith('.json'));
  const packs: WeeklyMathPack[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(MATH_DIR, file), 'utf-8');
    return JSON.parse(raw) as WeeklyMathPack;
  });

  return packs.sort((a, b) => b.weekNumber - a.weekNumber);
}

export function getLatestMathPack(): WeeklyMathPack {
  const packs = getAllMathPacks();
  if (packs.length === 0) {
    throw new Error('No math packs found in src/data/math/');
  }
  return packs[0];
}

export function getMathPackById(id: string): WeeklyMathPack | undefined {
  return getAllMathPacks().find((pack) => pack.id === id);
}
