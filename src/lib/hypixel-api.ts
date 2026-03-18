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
  const HYPIXEL_API_KEY = '14a7e13c-88e4-4e69-bcbb-1699bd3862f7'
  
  const apis = [
    {
      name: 'Hypixel Official API',
      url: `https://api.hypixel.net/v2/skyblock/profiles?uuid=${cleanUUID}`,
      parse: (data: any) => {
        if (!data.success) {
          throw new Error('API request unsuccessful')
        }
        
        if (!data.profiles || data.profiles.length === 0) {
          throw new Error('No profiles found')
        }
        
        return data.profiles.map((profile: any) => ({
          profile_id: profile.profile_id,
          cute_name: profile.cute_name || 'Unknown',
          selected: profile.selected || false,
          members: profile.members || {}
        }))
      },
      headers: {
        'API-Key': HYPIXEL_API_KEY
      }
    },
    {
      name: 'Slothpixel (Hypixel Proxy)',
      url: `https://api.slothpixel.me/api/skyblock/profiles/${cleanUUID}`,
      parse: (data: any) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('No profiles found')
        }
        
        return data.map((profile: any) => ({
          profile_id: profile.profile_id || profile.cute_name,
          cute_name: profile.cute_name || 'Unknown',
          selected: profile.selected || false,
          members: profile.members || {}
        }))
      }
    },
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
    }
  ]

  let lastError: Error | null = null

  for (const api of apis) {
    try {
      console.log(`🔍 Trying ${api.name} API...`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const headers: Record<string, string> = {
        'Accept': 'application/json',
      }
      
      if ('headers' in api && api.headers) {
        Object.assign(headers, api.headers)
      }

      const response = await fetch(api.url, {
        method: 'GET',
        headers,
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
          console.log(`⚠️ ${api.name} returned 404, trying next API...`)
          continue
        }
        if (response.status === 403) {
          console.log(`⚠️ ${api.name} returned 403 (forbidden/invalid key), trying next API...`)
          continue
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
          console.log(`❌ Player has no Skyblock profiles`)
          throw new Error('Player has no Skyblock profiles. Make sure they have played Hypixel Skyblock and have API access enabled.')
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

  if (!memberData) {
    return { total, sources }
  }

  const parseNBTData = (nbtData: string | any): any[] => {
    if (!nbtData) return []
    
    try {
      if (typeof nbtData === 'string') {
        const parsed = JSON.parse(nbtData)
        if (Array.isArray(parsed)) return parsed
        if (parsed && typeof parsed === 'object' && 'i' in parsed && Array.isArray(parsed.i)) {
          return parsed.i
        }
      }
      if (Array.isArray(nbtData)) return nbtData
      if (nbtData && typeof nbtData === 'object') {
        if ('i' in nbtData && Array.isArray(nbtData.i)) return nbtData.i
        return Object.values(nbtData)
      }
    } catch (e) {
      console.error('Error parsing NBT data:', e)
    }
    return []
  }

  const inventory = memberData.inventory || memberData.inv_contents

  if (inventory?.inv_armor?.data) {
    const armorItems = parseNBTData(inventory.inv_armor.data)
    armorItems.forEach((item: any) => {
      if (item?.tag?.display?.Name) {
        const fortune = extractFortuneFromItem(item)
        if (fortune > 0) {
          sources.armor.push({
            name: cleanItemName(item.tag.display.Name),
            fortune
          })
        }
      }
    })
  }

  if (inventory?.equipment_contents?.data) {
    const equipmentItems = parseNBTData(inventory.equipment_contents.data)
    equipmentItems.forEach((item: any) => {
      if (item?.tag?.display?.Name) {
        const fortune = extractFortuneFromItem(item)
        if (fortune > 0) {
          sources.equipment.push({
            name: cleanItemName(item.tag.display.Name),
            fortune
          })
        }
      }
    })
  }

  if (inventory?.bag_contents?.talisman_bag?.data) {
    const accessoryItems = parseNBTData(inventory.bag_contents.talisman_bag.data)
    accessoryItems.forEach((item: any) => {
      if (item?.tag?.display?.Name) {
        const fortune = extractFortuneFromItem(item)
        if (fortune > 0) {
          sources.accessories.push({
            name: cleanItemName(item.tag.display.Name),
            fortune
          })
        }
      }
    })
  }

  const petData = memberData.pets_data?.pets || memberData.pets
  if (petData && Array.isArray(petData) && petData.length > 0) {
    const activePet = petData.find((p: any) => p && p.active === true)
    if (activePet && activePet.type) {
      const petFortune = calculatePetFortune(activePet)
      if (petFortune > 0) {
        sources.pet = {
          name: formatPetName(activePet.type),
          fortune: petFortune
        }
      }
    }
  }

  total = [...sources.armor, ...sources.equipment, ...sources.accessories]
    .reduce((sum, item) => sum + item.fortune, 0)
  
  if (sources.pet) {
    total += sources.pet.fortune
  }

  return { total, sources }
}

function extractFortuneFromItem(item: any): number {
  let fortune = 0

  if (!item?.tag?.ExtraAttributes) {
    return fortune
  }

  const attrs = item.tag.ExtraAttributes

  if (attrs.farming_for_dummies_count) {
    fortune += attrs.farming_for_dummies_count
  }

  if (attrs.gems && typeof attrs.gems === 'object') {
    const gemValues = Object.values(attrs.gems)
    gemValues.forEach((gem: any) => {
      if (gem && typeof gem === 'object') {
        if (gem.quality && typeof gem.quality === 'string' && gem.quality.includes('FARMING')) {
          fortune += 10
        }
      }
    })
  }

  if (attrs.enchantments && typeof attrs.enchantments === 'object') {
    if (typeof attrs.enchantments.harvesting === 'number') {
      fortune += attrs.enchantments.harvesting * 12.5
    }
    if (typeof attrs.enchantments.cultivating === 'number') {
      fortune += attrs.enchantments.cultivating * 2
    }
    if (typeof attrs.enchantments.dedication === 'number') {
      fortune += attrs.enchantments.dedication * 4
    }
  }

  if (attrs.modifier && typeof attrs.modifier === 'string') {
    const reforges: Record<string, number> = {
      'blessed': 5,
      'bountiful': 5,
      'robust': 10
    }
    const reforgeName = attrs.modifier.toLowerCase()
    if (reforges[reforgeName]) {
      fortune += reforges[reforgeName]
    }
  }

  return fortune
}

function calculatePetFortune(pet: any): number {
  const farmingPets: Record<string, { formula: (level: number) => number }> = {
    'MOOSHROOM_COW': { formula: (level) => Math.floor(level * 0.5) },
    'BEE': { formula: (level) => Math.floor(level * 0.3) },
    'RABBIT': { formula: (level) => Math.floor(level * 0.2) }
  }
  
  const petConfig = farmingPets[pet.type]
  if (!petConfig) {
    return 0
  }

  const level = pet.exp ? calculatePetLevel(pet.exp, pet.tier || 'COMMON') : 1
  return petConfig.formula(level)
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

  const expPerLevel = tier === 'MYTHIC' ? 25000 : 10000
  const maxLevel = maxLevels[tier] || 100
  return Math.min(Math.floor(exp / expPerLevel) + 1, maxLevel)
}

function cleanItemName(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'Unknown'
  }
  
  return name
    .replace(/§[0-9a-fk-or]/gi, '')
    .replace(/[^\w\s]/g, '')
    .trim()
}

function formatPetName(type: string): string {
  if (!type || typeof type !== 'string') {
    return 'Unknown Pet'
  }
  
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
} {
  if (!memberData) {
    console.log('⚠️ parseGarden: No member data provided')
    return {
      level: 0,
      crops: [],
      visitors: 0,
      compost: 0
    }
  }

  console.log('🔍 parseGarden: Checking for garden data...')
  console.log('🔍 memberData keys:', Object.keys(memberData))
  
  const garden = memberData.garden || memberData.player_data?.garden

  if (!garden) {
    console.log('⚠️ parseGarden: No garden data found')
    console.log('🔍 Available data:', {
      hasGarden: !!memberData.garden,
      hasPlayerData: !!memberData.player_data,
      hasPlayerDataGarden: !!memberData.player_data?.garden
    })
    return {
      level: 0,
      crops: [],
      visitors: 0,
      compost: 0
    }
  }
  
  console.log('✅ parseGarden: Found garden data')

  const experience = garden.garden_experience || 0
  const cropData = garden.crops || {}
  const uniqueVisitors = garden.unique_visitors || []
  
  const milestones = [
    1000, 5000, 25000, 100000, 250000, 500000, 1000000, 2500000, 5000000
  ]

  const level = calculateGardenLevel(experience)
  const crops = Object.entries(cropData).map(([crop, data]: [string, any]) => {
    const harvested = typeof data === 'number' ? data : (data?.harvested || 0)
    
    let currentMilestone = milestones[0]
    for (let i = 0; i < milestones.length; i++) {
      if (harvested >= milestones[i]) {
        currentMilestone = milestones[i + 1] || milestones[i]
      } else {
        currentMilestone = milestones[i]
        break
      }
    }
    
    return {
      name: formatCropName(crop),
      harvested,
      milestone: currentMilestone
    }
  })

  let visitorCount = 0
  if (Array.isArray(uniqueVisitors)) {
    visitorCount = uniqueVisitors.length
  } else if (typeof uniqueVisitors === 'number') {
    visitorCount = uniqueVisitors
  }
  
  const compostData = garden.compost || garden.compost_upgrades
  let compostTotal = 0
  if (typeof compostData === 'number') {
    compostTotal = compostData
  } else if (compostData && typeof compostData === 'object') {
    compostTotal = compostData.total || 0
  }

  return {
    level,
    crops,
    visitors: visitorCount,
    compost: compostTotal
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
  if (!crop || typeof crop !== 'string') {
    return 'Unknown'
  }
  
  return crop
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function parseEquipment(memberData: any): {
  armor: Array<{ name: string; rarity: string }>
  equipment: Array<{ name: string; rarity: string }>
  accessories: Array<{ name: string; rarity: string }>
} {
  const result = {
    armor: [] as Array<{ name: string; rarity: string }>,
    equipment: [] as Array<{ name: string; rarity: string }>,
    accessories: [] as Array<{ name: string; rarity: string }>
  }

  if (!memberData) {
    return result
  }

  const parseNBTData = (nbtData: string | any): any[] => {
    if (!nbtData) return []
    
    try {
      if (typeof nbtData === 'string') {
        const parsed = JSON.parse(nbtData)
        if (Array.isArray(parsed)) return parsed
        if (parsed && typeof parsed === 'object' && 'i' in parsed && Array.isArray(parsed.i)) {
          return parsed.i
        }
      }
      if (Array.isArray(nbtData)) return nbtData
      if (nbtData && typeof nbtData === 'object') {
        if ('i' in nbtData && Array.isArray(nbtData.i)) return nbtData.i
        return Object.values(nbtData)
      }
    } catch (e) {
      console.error('Error parsing NBT data:', e)
    }
    return []
  }

  const parseItems = (nbtData: any): Array<{ name: string; rarity: string }> => {
    const items = parseNBTData(nbtData)
    
    return items
      .filter((item: any) => item && item.tag?.display?.Name)
      .map((item: any) => {
        const displayName = item.tag.display.Name
        const rarity = item.tag?.ExtraAttributes?.rarity || 
                      item.tag?.display?.Lore?.[item.tag.display.Lore.length - 1]?.match(/§[0-9a-f]§l([A-Z ]+)$/)?.[1] ||
                      'COMMON'
        
        return {
          name: cleanItemName(displayName),
          rarity: rarity.toString().toUpperCase()
        }
      })
  }

  const inventory = memberData.inventory || memberData.inv_contents
  
  if (inventory?.inv_armor?.data) {
    const armorItems = parseNBTData(inventory.inv_armor.data)
    result.armor = armorItems
      .filter((item: any) => item && item.tag?.display?.Name)
      .map((item: any, index: number) => {
        const slotNames = ['Boots', 'Leggings', 'Chestplate', 'Helmet']
        const displayName = item.tag.display.Name
        const rarity = item.tag?.ExtraAttributes?.rarity || 'COMMON'
        
        return {
          name: cleanItemName(displayName),
          rarity: rarity.toString().toUpperCase()
        }
      })
  }

  if (inventory?.equipment_contents?.data) {
    result.equipment = parseItems(inventory.equipment_contents.data)
  }

  if (inventory?.bag_contents?.talisman_bag?.data) {
    result.accessories = parseItems(inventory.bag_contents.talisman_bag.data)
  }

  return result
}

export function parsePet(memberData: any): {
  name: string
  level: number
  rarity: string
  type: string
} | null {
  if (!memberData) {
    return null
  }

  const pets = memberData.pets_data?.pets || memberData.pets
  
  if (!pets || !Array.isArray(pets) || pets.length === 0) {
    return null
  }

  const activePet = pets.find((p: any) => p && p.active === true)

  if (!activePet || !activePet.type) {
    return null
  }

  const tier = activePet.tier || 'COMMON'
  const exp = activePet.exp || 0

  return {
    name: formatPetName(activePet.type),
    type: activePet.type,
    level: calculatePetLevel(exp, tier),
    rarity: tier.toLowerCase()
  }
}
