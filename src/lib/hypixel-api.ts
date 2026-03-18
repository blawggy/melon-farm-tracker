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

export async function fetchMinecraftUUID(username: string): Promise<MojangProfile> {
  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_]/g, '')
  
  if (!cleanUsername) {
    throw new Error('Please enter a valid username')
  }
  
  if (cleanUsername.length < 3 || cleanUsername.length > 16) {
    throw new Error('Username must be between 3 and 16 characters')
  }

  const apis = [
    {
      name: 'Mojang Official',
      url: `https://api.mojang.com/users/profiles/minecraft/${cleanUsername}`,
      parse: (data: any) => ({
        id: data.id,
        name: data.name
      })
    },
    {
      name: 'Ashcon',
      url: `https://api.ashcon.app/mojang/v2/user/${cleanUsername}`,
      parse: (data: any) => ({
        id: data.uuid.replace(/-/g, ''),
        name: data.username
      })
    },
    {
      name: 'PlayerDB',
      url: `https://playerdb.co/api/player/minecraft/${cleanUsername}`,
      parse: (data: any) => ({
        id: data.data.player.id,
        name: data.data.player.username
      })
    }
  ]

  let lastError: Error | null = null

  for (const api of apis) {
    try {
      console.log(`🔍 Trying ${api.name} API...`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Player not found. Please check the username.')
        }
        if (response.status === 429) {
          console.log(`⚠️ ${api.name} rate limited, trying next API...`)
          continue
        }
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      const parsed = api.parse(data)

      if (!parsed.id || !parsed.name) {
        throw new Error('Invalid response from API')
      }

      console.log(`✅ Found player via ${api.name}:`, parsed.name, 'UUID:', parsed.id)

      return parsed
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log(`⏱️ ${api.name} timeout, trying next API...`)
          lastError = new Error('Request timeout')
          continue
        }
        if (error.message.includes('Failed to fetch')) {
          console.log(`🚫 ${api.name} CORS or network error, trying next API...`)
          lastError = new Error('Network or CORS error - trying alternative APIs')
          continue
        }
        if (error.message.includes('Player not found')) {
          throw error
        }
        console.log(`❌ ${api.name} failed:`, error.message)
        lastError = error
        continue
      }
      lastError = new Error('Unknown error')
    }
  }

  throw lastError || new Error('All APIs failed to fetch player data. Please try again later.')
}

export async function fetchSkyblockProfiles(uuid: string): Promise<HypixelProfile[]> {
  const cleanUUID = uuid.replace(/-/g, '')
  
  const apis = [
    {
      name: 'Sky.shiiyu.moe',
      url: `https://sky.shiiyu.moe/api/v2/profile/${cleanUUID}`,
      parse: (data: any) => {
        if (!data.profiles || Object.keys(data.profiles).length === 0) {
          throw new Error('No profiles found')
        }
        
        return Object.entries(data.profiles).map(([profileId, profile]: [string, any]) => ({
          profile_id: profileId,
          cute_name: profile.cute_name || profileId,
          selected: profile.current || false,
          members: profile.members || {}
        }))
      }
    },
    {
      name: 'SkyCrypt',
      url: `https://sky.lea.moe/api/v2/profile/${cleanUUID}`,
      parse: (data: any) => {
        if (!data.profiles || Object.keys(data.profiles).length === 0) {
          throw new Error('No profiles found')
        }
        
        return Object.entries(data.profiles).map(([profileId, profile]: [string, any]) => ({
          profile_id: profileId,
          cute_name: profile.cute_name || profileId,
          selected: profile.selected || false,
          members: profile.members || {}
        }))
      }
    },
    {
      name: 'Hypixel-API-Reborn Proxy',
      url: `https://hypixel-api-proxy.herokuapp.com/api/v2/skyblock/profiles?uuid=${cleanUUID}`,
      parse: (data: any) => {
        if (!data.profiles || data.profiles.length === 0) {
          throw new Error('No profiles found')
        }
        
        return data.profiles.map((profile: any) => ({
          profile_id: profile.profile_id,
          cute_name: profile.cute_name,
          selected: profile.selected || false,
          members: profile.members
        }))
      }
    }
  ]

  let lastError: Error | null = null

  for (const api of apis) {
    try {
      console.log(`🔍 Trying ${api.name} API...`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          console.log(`⚠️ ${api.name} rate limited, trying next API...`)
          continue
        }
        if (response.status === 404) {
          throw new Error('Player has no Skyblock profiles.')
        }
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      const profiles = api.parse(data)

      if (!profiles || profiles.length === 0) {
        throw new Error('No Skyblock profiles found')
      }

      console.log(`✅ Found ${profiles.length} Skyblock profile(s) via ${api.name}`)

      return profiles
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log(`⏱️ ${api.name} timeout, trying next API...`)
          lastError = new Error('Request timeout')
          continue
        }
        if (error.message.includes('Failed to fetch')) {
          console.log(`🚫 ${api.name} CORS or network error, trying next API...`)
          lastError = new Error('Network or CORS error - trying alternative APIs')
          continue
        }
        if (error.message.includes('No Skyblock profiles') || error.message.includes('no Skyblock profiles')) {
          throw error
        }
        console.log(`❌ ${api.name} failed:`, error.message)
        lastError = error
        continue
      }
      lastError = new Error('Unknown error')
    }
  }

  throw lastError || new Error('All APIs failed to fetch Skyblock profiles. The player may not have any Skyblock profiles or all services are currently unavailable.')
}

export async function fetchProfile(profileId: string): Promise<HypixelProfile> {
  const apis = [
    {
      name: 'Sky.shiiyu.moe',
      url: `https://sky.shiiyu.moe/api/v2/profile/${profileId}`,
      parse: (data: any) => {
        if (!data.profile) {
          throw new Error('Profile not found')
        }
        return {
          profile_id: profileId,
          cute_name: data.profile.cute_name || profileId,
          selected: data.profile.current || false,
          members: data.profile.members || {}
        }
      }
    }
  ]

  let lastError: Error | null = null

  for (const api of apis) {
    try {
      console.log(`🔍 Trying ${api.name} API for profile...`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          console.log(`⚠️ ${api.name} rate limited, trying next API...`)
          continue
        }
        if (response.status === 404) {
          throw new Error('Profile not found')
        }
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      const profile = api.parse(data)

      console.log(`✅ Loaded profile via ${api.name}`)

      return profile
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log(`⏱️ ${api.name} timeout, trying next API...`)
          lastError = new Error('Request timeout')
          continue
        }
        if (error.message.includes('Profile not found')) {
          throw error
        }
        console.log(`❌ ${api.name} failed:`, error.message)
        lastError = error
        continue
      }
      lastError = new Error('Unknown error')
    }
  }

  throw lastError || new Error('Failed to load profile - all services are currently unavailable.')
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
