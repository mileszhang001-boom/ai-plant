import type { Plant, MatchResult } from '../types';

export function matchPlant(aiSpecies: string, plants: Plant[]): MatchResult[] {
  return plants
    .filter((p) => p.species === aiSpecies)
    .map((p) => ({
      plantId: p.id,
      confidence: 0.8,
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

export function routeAfterScan(
  matches: MatchResult[],
  plantCount: number
): 'create' | 'match' {
  if (plantCount === 0) return 'create';
  if (matches.length === 0) return 'create';
  return 'match';
}
