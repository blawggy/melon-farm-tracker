export interface MojangProfile {
  id: string
  name: string
}

export interface HypixelProfile {
  profile_id: string
  cute_name: string
  selected?: boolean
  members: Record<string, any>
}

export interface HypixelResponse {
  success: boolean
  profiles: HypixelProfile[]
}

const HYPIXEL_API_KEY = import.meta.env.VITE_HYPIXEL_API_KEY || ''

export async function fetchMinecraftUUID(username: string): Promise<MojangProfile> {
  const response = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`
  )

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Player not found')
    }
    throw new Error('Failed to fetch player data from Mojang')
  }

  return response.json()
}

export async function fetchSkyblockProfiles(uuid: string): Promise<HypixelProfile[]> {
  const url = HYPIXEL_API_KEY
    ? `https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}&key=${HYPIXEL_API_KEY}`
    : `https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('API rate limit reached. Please try again in a moment.')
    }
    if (response.status === 403) {
      throw new Error('Invalid API key or access denied')
    }
    throw new Error('Failed to fetch Skyblock profiles')
  }

  const data: HypixelResponse = await response.json()

  if (!data.success) {
    throw new Error('API request failed')
  }

  if (!data.profiles || data.profiles.length === 0) {
    throw new Error('This player has no Skyblock profiles')
  }

  return data.profiles
}

export async function fetchProfile(profileId: string): Promise<HypixelProfile> {
  const url = HYPIXEL_API_KEY
    ? `https://api.hypixel.net/v2/skyblock/profile?profile=${profileId}&key=${HYPIXEL_API_KEY}`
    : `https://api.hypixel.net/v2/skyblock/profile?profile=${profileId}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('API rate limit reached. Please try again in a moment.')
    }
    throw new Error('Failed to fetch profile data')
  }

  const data = await response.json()

  if (!data.success || !data.profile) {
    throw new Error('Failed to load profile')
  }

  return data.profile
}

export function parseFarmingFortune(memberData: any): {
  total: number
  sources: {
    armor: Array<{ name: string; fortune: number }>
    equipment: Array<{ name: string; fortune: number }>
    accessories: Array<{ name: string; fortune: number }>
    pet: { name: string; fortune: number } | null
    reforges: Array<{ name: string; fortune: number }>
  }
} {
  const sources = {
    armor: [] as Array<{ name: string; fortune: number }>,
    equipment: [] as Array<{ name: string; fortune: number }>,
    accessories: [] as Array<{ name: string; fortune: number }>,
    pet: null as { name: string; fortune: number } | null,
    reforges: [] as Array<{ name: string; fortune: number }>
  }

  let total = 0

  const stats = memberData?.player_stats?.farming || {}
  const inventory = memberData?.inventory || {}

  if (stats.total_farming_fortune) {
    total = stats.total_farming_fortune
  }

  const armorItems = [
    { slot: 'helmet', data: inventory.inv_armor?.data?.[3] },
    { slot: 'chestplate', data: inventory.inv_armor?.data?.[2] },
    { slot: 'leggings', data: inventory.inv_armor?.data?.[1] },
    { slot: 'boots', data: inventory.inv_armor?.data?.[0] }
  ]

  armorItems.forEach(({ slot, data }) => {
    if (data?.tag?.display?.Name) {
      const fortune = extractFortuneFromItem(data)
      if (fortune > 0) {
        sources.armor.push({
          name: cleanItemName(data.tag.display.Name),
          fortune
        })
        total += fortune
      }
    }
  })

  const equipmentSlots = inventory.equipment_contents?.data || []
  equipmentSlots.forEach((item: any) => {
    if (item?.tag?.display?.Name) {
      const fortune = extractFortuneFromItem(item)
      if (fortune > 0) {
        sources.equipment.push({
          name: cleanItemName(item.tag.display.Name),
          fortune
        })
        total += fortune
      }
    }
  })

  const activePet = memberData?.pets_data?.pets?.find((p: any) => p.active)
  if (activePet && activePet.type) {
    const petFortune = calculatePetFortune(activePet)
    if (petFortune > 0) {
      sources.pet = {
        name: formatPetName(activePet.type),
        fortune: petFortune
      }
      total += petFortune
    }
  }

  return { total, sources }
}

function extractFortuneFromItem(item: any): number {
  let fortune = 0

  if (item?.tag?.ExtraAttributes) {
    const attrs = item.tag.ExtraAttributes

    if (attrs.farming_for_dummies_count) {
      fortune += attrs.farming_for_dummies_count
    }

    if (attrs.gems) {
      Object.values(attrs.gems).forEach((gem: any) => {
        if (gem?.quality && gem.quality.includes('FARMING')) {
          fortune += 10
        }
      })
    }

    if (attrs.enchantments) {
      if (attrs.enchantments.harvesting) {
        fortune += attrs.enchantments.harvesting * 12.5
      }
      if (attrs.enchantments.cultivating) {
        fortune += attrs.enchantments.cultivating * 2
      }
    }
  }

  return fortune
}

function calculatePetFortune(pet: any): number {
  const farmingPets = ['ELEPHANT', 'MOOSHROOM_COW', 'BEE', 'RABBIT']
  
  if (!farmingPets.includes(pet.type)) {
    return 0
  }

  const level = pet.exp ? calculatePetLevel(pet.exp, pet.tier) : 1
  
  let fortune = 0
  if (pet.type === 'ELEPHANT') {
    fortune = Math.floor(level * 0.75)
  } else if (pet.type === 'MOOSHROOM_COW') {
    fortune = Math.floor(level * 0.5)
  } else if (pet.type === 'BEE') {
    fortune = Math.floor(level * 0.3)
  }

  return fortune
}

function calculatePetLevel(exp: number, tier: string): number {
  const maxLevels: Record<string, number> = {
    COMMON: 100,
    UNCOMMON: 100,
    RARE: 100,
    EPIC: 100,
    LEGENDARY: 100,
    MYTHIC: 200
  }

  const maxLevel = maxLevels[tier] || 100
  const expPerLevel = tier === 'MYTHIC' ? 25000 : 10000

  return Math.min(Math.floor(exp / expPerLevel) + 1, maxLevel)
}

function cleanItemName(name: string): string {
  return name.replace(/§[0-9a-fk-or]/gi, '').trim()
}

function formatPetName(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export function parseGarden(memberData: any): {
  level: number
  crops: Array<{ name: string; harvested: number; milestone: number }>
  visitors: number
  compost: number
} | null {
  const garden = memberData?.garden

  if (!garden) {
    return null
  }

  const experience = garden.garden_experience || 0
  const level = calculateGardenLevel(experience)

  const cropData = garden.crops || {}
  const crops = Object.entries(cropData).map(([crop, data]: [string, any]) => ({
    name: formatCropName(crop),
    harvested: data.harvested || 0,
    milestone: data.milestone || 0
  }))

  return {
    level,
    crops,
    visitors: garden.unique_visitors?.length || 0,
    compost: garden.compost?.total || 0
  }
}

function calculateGardenLevel(experience: number): number {
  const levels = [
    0, 1000, 2500, 5000, 10000, 20000, 35000, 55000, 80000, 110000,
    145000, 185000, 230000, 280000, 335000, 395000, 460000, 530000, 605000, 685000
  ]

  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i]) {
      return i + 1
    }
  }

  return 1
}

function formatCropName(crop: string): string {
  return crop
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function parseEquipment(memberData: any): {
  armor: Array<{ name: string; rarity: string }>
  equipment: Array<{ name: string; rarity: string }>
  accessories: Array<{ name: string; rarity: string }>
} {
  const inventory = memberData?.inventory || {}

  const parseItems = (items: any[]): Array<{ name: string; rarity: string }> => {
    return items
      .filter(item => item?.tag?.display?.Name)
      .map(item => ({
        name: cleanItemName(item.tag.display.Name),
        rarity: item.tag.ExtraAttributes?.rarity || 'COMMON'
      }))
  }

  const armor = parseItems(inventory.inv_armor?.data || [])
  const equipment = parseItems(inventory.equipment_contents?.data || [])
  const accessories = parseItems(inventory.bag_contents?.talisman_bag?.data || [])

  return { armor, equipment, accessories }
}

export function parsePet(memberData: any): {
  name: string
  level: number
  rarity: string
  type: string
} | null {
  const pets = memberData?.pets_data?.pets || []
  const activePet = pets.find((p: any) => p.active)

  if (!activePet) {
    return null
  }

  return {
    name: formatPetName(activePet.type),
    level: calculatePetLevel(activePet.exp || 0, activePet.tier || 'COMMON'),
    rarity: activePet.tier?.toLowerCase() || 'common',
    type: activePet.type
  }
}
