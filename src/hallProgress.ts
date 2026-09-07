export const HALL_PROGRESS_LEVELS = [
  { name: "Guest Pass", min: 0, tone: "steel" },
  { name: "Membership Activated", min: 10, tone: "blue" },
  { name: "Certified Y’s Guy", min: 30, tone: "gold" },
  { name: "League Legend", min: 60, tone: "purple" },
  { name: "Hall of Famer", min: 100, tone: "platinum" },
] as const;

export function hallProgressLevel(total: number) {
  const progress = Math.max(0, Number(total) || 0);
  return [...HALL_PROGRESS_LEVELS].reverse().find(level => progress >= level.min) ?? HALL_PROGRESS_LEVELS[0];
}
