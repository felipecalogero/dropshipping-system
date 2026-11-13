const NEUTRALS = [
  "gray",
  "grey",
  "beige",
  "cream",
  "brown",
  "black",
  "white",
  "khaki",
  "coffee",
  "camel",
  "tan",
  "ivory",
  "charcoal",
  "taupe",
  "sand",
];

const SIZE_RANK: Record<string, number> = {
  xxxs: 0,
  xxs: 1,
  xs: 2,
  s: 3,
  small: 3,
  m: 4,
  medium: 4,
  l: 5,
  large: 5,
  xl: 6,
  xxl: 7,
  xxxl: 8,
};

export type OptionRow = { vid: string; cjProductId: string; option: string };

function neutral(option: string): boolean {
  const text = option.toLowerCase();
  return NEUTRALS.some((word) => new RegExp(`\\b${word}\\b`).test(text));
}

function sizeRank(option: string): number | null {
  const text = option.toLowerCase();
  const inches = text.match(/(\d+(?:\.\d+)?)\s*(?:inches|inch|in)\b/);
  if (inches) return Math.round(Number(inches[1]) * 10);
  const word = text.match(/\b(xxxs|xxs|xs|small|medium|large|xxxl|xxl|xl|[sml])\b/);
  if (!word) return null;
  return SIZE_RANK[word[1]] ?? null;
}

function choose(group: OptionRow[]): string | null {
  const parsed = group.map((item) => ({
    vid: item.vid,
    neutral: neutral(item.option),
    rank: sizeRank(item.option),
  }));
  const sized = parsed.filter((item) => item.rank != null);
  const middle = new Set<string>();
  if (sized.length >= 2) {
    const target = sized.reduce((sum, item) => sum + (item.rank as number), 0) / sized.length;
    let best = Infinity;
    for (const item of sized) best = Math.min(best, Math.abs((item.rank as number) - target));
    for (const item of sized) {
      if (Math.abs((item.rank as number) - target) === best) middle.add(item.vid);
    }
  }
  const ranked = parsed.map((item) => ({
    vid: item.vid,
    score: (item.neutral ? 2 : 0) + (middle.has(item.vid) ? 2 : 0),
    middle: middle.has(item.vid),
  }));
  const top = Math.max(...ranked.map((item) => item.score));
  if (top <= 0) return null;
  const winners = ranked.filter((item) => item.score === top);
  if (winners.length === 1) return winners[0].vid;
  const sizedWinners = winners.filter((item) => item.middle);
  return sizedWinners.length === 1 ? sizedWinners[0].vid : null;
}

export function middleOptionVids(items: OptionRow[]): Set<string> {
  const groups = new Map<string, OptionRow[]>();
  for (const item of items) {
    const key = item.cjProductId || item.vid;
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  const picked = new Set<string>();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const vid = choose(group);
    if (vid) picked.add(vid);
  }
  return picked;
}
