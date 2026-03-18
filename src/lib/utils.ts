import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface MilestoneBadge {
  tier: 'Iron' | 'Gold' | 'Emerald' | 'Diamond' | 'Netherite'
  color: string
  minCrops: number
  maxCrops: number | null
}

export function calculateMilestoneBadge(totalCrops: number): MilestoneBadge | null {
  const millions = totalCrops / 1_000_000

  if (millions >= 100) {
    return {
      tier: 'Netherite',
      color: 'oklch(0.35 0.02 240)',
      minCrops: 100_000_000,
      maxCrops: null
    }
  } else if (millions >= 60) {
    return {
      tier: 'Diamond',
      color: 'oklch(0.75 0.15 200)',
      minCrops: 60_000_000,
      maxCrops: 100_000_000
    }
  } else if (millions >= 40) {
    return {
      tier: 'Emerald',
      color: 'oklch(0.65 0.18 150)',
      minCrops: 40_000_000,
      maxCrops: 60_000_000
    }
  } else if (millions >= 20) {
    return {
      tier: 'Gold',
      color: 'oklch(0.75 0.15 85)',
      minCrops: 20_000_000,
      maxCrops: 40_000_000
    }
  } else if (millions >= 10) {
    return {
      tier: 'Iron',
      color: 'oklch(0.75 0.02 240)',
      minCrops: 10_000_000,
      maxCrops: 20_000_000
    }
  }

  return null
}
