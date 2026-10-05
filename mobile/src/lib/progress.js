// Pure list/entry logic, ported from the web app's app.js so both apps behave the same.

export const ICONS = [
  '🏃','🏋️','🧘','🚴','🏊','⚽','🎾','🏀',
  '🥗','💧','😴','📚','✍️','🎨','🎵','🧠',
  '💼','💰','🌿','🔥','⭐','🎯','🏆','💪',
  '🚶','🌅','📝','✅','😊','🤝','🌱','☕',
];

// Legacy type map for lists created before icons were chosen per list
const LEGACY_TYPES = {
  habits:'🔁', fitness:'🏋️', reading:'📚', tasks:'✅',
  nutrition:'🥗', sleep:'😴', mood:'😊', finance:'💰',
  learning:'🧠', social:'🤝', mindful:'🧘', custom:'⭐',
};

export function getListIcon(list) {
  return list.icon || LEGACY_TYPES[list.type] || '⭐';
}

export function getListActivityType(list) {
  return list.activityType || list.customLabel || list.type || 'Activity';
}

// Count-up lists track toward an optional goal; count-down lists start at
// `target` and each entry takes one away. Both are "reached" at the target.
export function getProgress(list) {
  const count  = list.entries.length;
  const mode   = list.countMode || 'up';
  const target = list.target || null;

  if (mode === 'down') {
    const remaining = target - count;
    return { mode, count, target, remaining, reached: remaining <= 0, pct: Math.min(100, (count / target) * 100) };
  }
  if (!target) return { mode, count, target: null, remaining: null, reached: false, pct: null };
  return { mode, count, target, remaining: target - count, reached: count >= target, pct: Math.min(100, (count / target) * 100) };
}

export function progressLabel(list) {
  const p = getProgress(list);
  if (p.mode === 'down') return p.remaining >= 0 ? `${p.remaining} left` : `${-p.remaining} over`;
  if (!p.target) return `${p.count} logged`;
  return `${p.count} / ${p.target}`;
}

export function progressSubLabel(list) {
  const p = getProgress(list);
  if (p.mode === 'down') return `Counting down from ${p.target}`;
  if (p.target)          return `Goal: ${p.target}`;
  return 'Counting up';
}

export function sortNewestFirst(entries) {
  return [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Splits entries (already sorted by date) into runs that share a local calendar day
export function groupByDay(entries) {
  const groups = [];
  for (const entry of entries) {
    const key = new Date(entry.createdAt).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.entries.push(entry);
    else groups.push({ key, entries: [entry] });
  }
  return groups;
}

export function dayLabel(iso) {
  const day = new Date(iso);
  day.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - day) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const opts = { weekday: 'long', month: 'short', day: 'numeric' };
  if (day.getFullYear() !== today.getFullYear()) opts.year = 'numeric';
  return day.toLocaleDateString(undefined, opts);
}

export function timeOfDay(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// Consecutive days, ending today, with at least one entry in any list
export function computeStreak(lists) {
  const allDates = lists.flatMap(l => l.entries.map(e => new Date(e.createdAt).toDateString()));
  const uniqueDays = [...new Set(allDates)].map(d => new Date(d)).sort((a, b) => b - a);

  if (uniqueDays.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === cursor.getTime()) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d.getTime() < cursor.getTime()) {
      break;
    }
  }
  return streak;
}
