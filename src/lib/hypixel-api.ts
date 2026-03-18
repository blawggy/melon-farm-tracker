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
  try {
    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_]/g, '')
    
    if (!cleanUsername) {
      throw new Error('Please enter a valid username')
    }
    
    if (cleanUsername.length < 3 || cleanUsername.length > 16) {
      throw new Error('Username must be between 3 and 16 characters')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(cleanUsername)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Player "${cleanUsername}" not found. Check the spelling and try again.`)
      }
      if (response.status === 429) {
        throw new Error('Too many requests to Mojang API. Please wait a moment and try again.')
      }
      throw new Error(`Failed to fetch player data (Status: ${response.status})`)
    }

    const data = await response.json()
    
    if (!data || !data.id || !data.name) {
      throw new Error('Invalid response from Mojang API')
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Mojang API took too long to respond')
      }
      throw error
    }
    throw new Error('Network error while fetching player data. Please check your connection.')
  }
}

export async function fetchSkyblockProfiles(uuid: string): Promise<HypixelProfile[]> {
  try {
    const url = `https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit reached. Please try again in a moment.')
      }
      if (response.status === 403) {
        throw new Error('Invalid API key or access denied. Make sure the profile API is enabled.')
      }
      if (response.status === 400) {
        throw new Error('Invalid player UUID format')
      }
      if (response.status === 404) {
        throw new Error('Player data not found')
      }
      throw new Error(`Failed to fetch Skyblock profiles (Status: ${response.status})`)
    }

    const data: HypixelResponse = await response.json()

    if (!data.success) {
      throw new Error('API request failed - the player may not have Skyblock API enabled')
    }

    if (!data.profiles || data.profiles.length === 0) {
      throw new Error('This player has no Skyblock profiles. They may have never played Skyblock.')
    }

    return data.profiles
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Hypixel API took too long to respond')
      }
      throw error
    }
    throw new Error('Network error while fetching Skyblock profiles. Please check your connection.')
  }
}

export async function fetchProfile(profileId: string): Promise<HypixelProfile> {
  try {
    const url = `https://api.hypixel.net/v2/skyblock/profile?profile=${profileId}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit reached. Please try again in a moment.')
      }
      if (response.status === 404) {
        throw new Error('Profile not found')
      }
      throw new Error(`Failed to fetch profile data (Status: ${response.status})`)
    }

    const data = await response.json()

    if (!data.success || !data.profile) {
      throw new Error('Failed to load profile - invalid response data')
    }

    return data.profile
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the API took too long to respond')
      }
      throw error
    }
    throw new Error('Network error while fetching profile data')
  }
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
