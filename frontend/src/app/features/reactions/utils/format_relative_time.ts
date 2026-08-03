const STEPS: [limitSeconds: number, divisor: number, label: string][] = [
  [60, 1, 's'],
  [3600, 60, 'm'],
  [86400, 3600, 'h'],
  [604800, 86400, 'd'],
  [2629800, 604800, 'w'],
  [31557600, 2629800, 'mo'],
];

export function formatRelativeTime(isoDate: string): string {
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (diffSec < 10) return 'just now';

  for (const [limit, divisor, label] of STEPS) {
    if (diffSec < limit) {
      return `${Math.floor(diffSec / divisor)}${label} ago`;
    }
  }
  return `${Math.floor(diffSec / 31557600)}y ago`;
}
