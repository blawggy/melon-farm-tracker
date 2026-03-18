export interface ProfileData {
  fortune: {
    total: number
    sources: {
      armor: Array<{ name: string; fortune: number }>
      equipment: Array<{ name: string; fortune: number }>
      accessories: Array<{ name: string; fortune: number }>
      pet: { name: string; fortune: number } | null
      reforges: Array<{ name: string; fortune: number }>
    }
  }
  garden: {
    level: number
    crops: Array<{ name: string; harvested: number; milestone: number }>
    visitors: number
    compost: number
  } | null
  equipment: {
    armor: Array<{ name: string; rarity: string }>
    equipment: Array<{ name: string; rarity: string }>
    accessories: Array<{ name: string; rarity: string }>
  }
  pet: {
    name: string
    level: number
    rarity: string
    type: string
  } | null
}
