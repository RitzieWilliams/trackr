import { getProgress, progressLabel, groupByDay, dayLabel, computeStreak } from '../progress';

const mk = (countMode, target, n) => ({
  countMode, target, entries: Array.from({ length: n }, (_, i) => ({ id: i })),
});

const at = (daysAgo, h, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

describe('getProgress / progressLabel', () => {
  test.each([
    ['up, no goal',          mk('up', null, 7),  '7 logged', false, null],
    ['legacy list',          { entries: [{}, {}] }, '2 logged', false, null],
    ['up, below goal',       mk('up', 5, 2),     '2 / 5',    false, 40],
    ['up, at goal',          mk('up', 5, 5),     '5 / 5',    true,  100],
    ['up, past goal',        mk('up', 5, 6),     '6 / 5',    true,  100],
    ['down, untouched',      mk('down', 3, 0),   '3 left',   false, 0],
    ['down, part way',       mk('down', 4, 1),   '3 left',   false, 25],
    ['down, at zero',        mk('down', 3, 3),   '0 left',   true,  100],
    ['down, past zero',      mk('down', 3, 5),   '2 over',   true,  100],
  ])('%s', (_, list, label, reached, pct) => {
    expect(progressLabel(list)).toBe(label);
    expect(getProgress(list).reached).toBe(reached);
    expect(getProgress(list).pct).toBe(pct);
  });

  // Mirrors the "goal crossed" check in addEntry: the popup fires on exactly one entry
  test.each([
    ['up to 2',   mk('up', 2, 0),     [2]],
    ['down from 3', mk('down', 3, 0), [3]],
    ['no goal',   mk('up', null, 0),  []],
  ])('goal crossed once: %s', (_, list, expected) => {
    const hits = [];
    for (let i = 0; i < 8; i++) {
      const was = getProgress(list).reached;
      list.entries.push({});
      if (!was && getProgress(list).reached) hits.push(list.entries.length);
    }
    expect(hits).toEqual(expected);
  });
});

describe('day grouping', () => {
  test('labels today and yesterday', () => {
    expect(dayLabel(at(0, 9))).toBe('Today');
    expect(dayLabel(at(1, 23, 59))).toBe('Yesterday');
    expect(dayLabel(at(2, 0))).not.toBe('Yesterday');
  });

  test('includes year only for other years', () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 1);
    expect(dayLabel(old.toISOString())).toContain(String(old.getFullYear()));
    expect(dayLabel(at(3, 12))).not.toContain(String(new Date().getFullYear()));
  });

  test('groups consecutive entries by local day', () => {
    const entries = [at(0, 18), at(0, 8), at(1, 23, 59), at(1, 0, 1), at(5, 12)]
      .map((createdAt, id) => ({ id, createdAt }));
    expect(groupByDay(entries).map(g => g.entries.length)).toEqual([2, 2, 1]);
    expect(groupByDay([])).toEqual([]);
  });
});

describe('computeStreak', () => {
  const lists = entriesDaysAgo => [{ entries: entriesDaysAgo.map(d => ({ createdAt: at(d, 12) })) }];

  test('counts consecutive days ending today', () => {
    expect(computeStreak(lists([0, 1, 2, 4]))).toBe(3);
  });
  test('is zero when nothing logged today', () => {
    expect(computeStreak(lists([1, 2]))).toBe(0);
    expect(computeStreak([])).toBe(0);
  });
});
