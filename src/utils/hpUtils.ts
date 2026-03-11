import { E } from '../theme';

export function hpColor(v: number): string {
  return v >= 75 ? '#2E7D32' : v >= 50 ? '#F9A825' : v >= 25 ? '#E65100' : '#C62828';
}

export function hpFace(v: number): string {
  return v >= 85 ? '(^o^)' : v >= 65 ? '(^-^)' : v >= 45 ? '(-v-)' : v >= 25 ? '(;_;)' : '(x_x)';
}

export function hpMood(v: number): string {
  if (v >= 85) return E.trophy + ' 元气满满!';
  if (v >= 65) return E.heart + ' 健康成长中';
  if (v >= 45) return E.seedling + ' 还行，需要关爱';
  if (v >= 25) return E.fire + ' 警告！需要救援';
  return E.skull + ' 危险! 紧急抢救!';
}

export function calculateHp(metrics: { water: number; light: number; nutrition: number; pest: number }): number {
  return Math.round(
    metrics.water * 0.3 +
    metrics.light * 0.25 +
    metrics.nutrition * 0.2 +
    metrics.pest * 0.25
  );
}

export function isStale(lastScannedAt: number): boolean {
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - lastScannedAt > THREE_DAYS;
}

export function formatTimeSince(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return `${weeks} 周前`;
}
