import type { Metrics, SimpleMetrics } from '../types';

export function smoothHp(
  newHp: number,
  lastHp: number | null,
  aiConfidence: number
): number {
  if (lastHp === null) return newHp;

  const maxDelta = aiConfidence > 0.85 ? 30 : 20;
  const delta = newHp - lastHp;
  const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, delta));

  return Math.max(0, Math.min(100, lastHp + clampedDelta));
}

export function validateMetrics(metrics: Metrics): SimpleMetrics {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  return {
    water: clamp(metrics.water.value),
    light: clamp(metrics.light.value),
    nutrition: clamp(metrics.nutrition.value),
    pest: clamp(metrics.pest.value),
  };
}
