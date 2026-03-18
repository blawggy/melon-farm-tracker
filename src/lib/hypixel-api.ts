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

const HYPIXEL_API_KEY = '14a7e13c-88e4-4e69-bcbb-1699bd3862f7'

export async function fetchMinecraftUUID(username: string): Promise<MojangProfile> {
  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_]/g, '')
  
  if (!cleanUsername) {
    throw new Error('Please enter a valid username')
  }
  
  if (cleanUsername.length < 3 || cleanUsername.length > 16) {
    throw new Error('Username must be between 3 and 16 characters')
  }

  try {
    console.log(`🔍 Fetching UUID for ${cleanUsername}...`)
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${cleanUsername}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Player not found. Please check the username.')
      }
      throw new Error(`Failed to fetch player (Status: ${response.status})`)
    }

    const data = await response.json()
    
    if (data.id && data.name) {
      console.log(`✅ Found player: ${data.name} (${data.id})`)
      return {
        id: data.id,
        name: data.name
      }
    }

    throw new Error('Invalid response from Mojang API')
  } catch (error) {
    console.error('Error fetching player:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch player. Please try again.')
  }
}

export async function fetchSkyblockProfiles(uuid: string): Promise<HypixelProfile[]> {
  const cleanUUID = uuid.replace(/-/g, '')
  
  try {
    console.log(`🔍 Fetching Skyblock profiles for UUID ${cleanUUID}...`)
    
    const url = `https://api.hypixel.net/v2/skyblock/profiles?uuid=${cleanUUID}&key=${HYPIXEL_API_KEY}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch profiles (Status: ${response.status})`)
    }

    const data: HypixelResponse = await response.json()
    console.log('📦 Hypixel API Response:', data)
    
    if (!data.success) {
      throw new Error('API request failed')
    }

    if (!data.profiles || data.profiles.length === 0) {
      throw new Error('No Skyblock profiles found. Make sure the player has played Hypixel Skyblock and has API access enabled.')
    }

    console.log(`✅ Found ${data.profiles.length} profile(s)`)
    return data.profiles
  } catch (error) {
    console.error('Error fetching Skyblock profiles:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch Skyblock profiles. Please try again later.')
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

  if (!memberData) {
    return { total, sources }
  }

  try {
    const jacobsData = memberData.jacobs_contest || {}
    const perks = jacobsData.perks || {}
    
    if (perks.farming_level_cap) {
      total += perks.farming_level_cap * 4
    }

    const farmingSkill = memberData.player_data?.experience?.SKILL_FARMING || 
                        memberData.experience_skill_farming || 0
    const farmingLevel = calculateSkillLevel(farmingSkill)
    total += farmingLevel * 4

    const anita = jacobsData.anita_bonus || 0
    total += anita * 4

    const accessories = memberData.inventory?.bag_contents?.talisman_bag?.data
    if (accessories) {
      const accessoryItems = parseInventoryData(accessories)
      accessoryItems.forEach((item: any) => {
        const fortune = extractFarmingFortune(item)
        if (fortune > 0) {
          sources.accessories.push({
            name: getItemName(item),
            fortune
          })
          total += fortune
        }
      })
    }

    const armorData = memberData.inventory?.inv_armor?.data
    if (armorData) {
      const armorItems = parseInventoryData(armorData)
      armorItems.forEach((item: any) => {
        const fortune = extractFarmingFortune(item)
        if (fortune > 0) {
          sources.armor.push({
            name: getItemName(item),
            fortune
          })
          total += fortune
        }
      })
    }

    const equipmentData = memberData.inventory?.equipment_contents?.data
    if (equipmentData) {
      const equipmentItems = parseInventoryData(equipmentData)
      equipmentItems.forEach((item: any) => {
        const fortune = extractFarmingFortune(item)
        if (fortune > 0) {
          sources.equipment.push({
            name: getItemName(item),
            fortune
          })
          total += fortune
        }
      })
    }

    const pets = memberData.pets_data?.pets || memberData.pets || []
    if (Array.isArray(pets)) {
      const activePet = pets.find((p: any) => p?.active === true)
      if (activePet) {
        const petFortune = calculatePetFortune(activePet)
        if (petFortune > 0) {
          sources.pet = {
            name: formatPetName(activePet.type),
            fortune: petFortune
          }
          total += petFortune
        }
      }
    }
  } catch (error) {
    console.error('Error parsing farming fortune:', error)
  }

  console.log('✅ Total Farming Fortune:', total)
  return { total, sources }
}

function parseInventoryData(data: any): any[] {
  if (!data) return []
  
  try {
    if (typeof data === 'string') {
      const decoded = atob(data)
      const parsed = JSON.parse(decoded)
      if (Array.isArray(parsed)) return parsed.filter(item => item && item.tag)
      if (parsed?.i && Array.isArray(parsed.i)) return parsed.i.filter((item: any) => item && item.tag)
    }
    if (Array.isArray(data)) return data.filter(item => item && item.tag)
    if (data?.i && Array.isArray(data.i)) return data.i.filter((item: any) => item && item.tag)
  } catch (error) {
    console.error('Error parsing inventory data:', error)
  }
  return []
}

function extractFarmingFortune(item: any): number {
  if (!item?.tag?.ExtraAttributes) return 0
  
  let fortune = 0
  const attrs = item.tag.ExtraAttributes

  if (attrs.farming_for_dummies_count) {
    fortune += attrs.farming_for_dummies_count
  }

  const enchants = attrs.enchantments || {}
  if (enchants.harvesting) {
    fortune += enchants.harvesting * 12.5
  }
  if (enchants.cultivating) {
    fortune += enchants.cultivating * 2
  }
  if (enchants.dedication) {
    fortune += enchants.dedication * 4
  }
  if (enchants.turbo_coco) {
    fortune += enchants.turbo_coco * 5
  }
  if (enchants.turbo_cane) {
    fortune += enchants.turbo_cane * 5
  }
  if (enchants.turbo_carrot) {
    fortune += enchants.turbo_carrot * 5
  }
  if (enchants.turbo_potato) {
    fortune += enchants.turbo_potato * 5
  }
  if (enchants.turbo_pumpkin) {
    fortune += enchants.turbo_pumpkin * 5
  }
  if (enchants.turbo_melon) {
    fortune += enchants.turbo_melon * 5
  }
  if (enchants.turbo_wheat) {
    fortune += enchants.turbo_wheat * 5
  }
  if (enchants.turbo_warts) {
    fortune += enchants.turbo_warts * 5
  }

  const reforges: Record<string, number> = {
    'blessed': 2,
    'bountiful': 4,
    'prosperous': 6,
    'blooming': 8,
    'rooted': 8,
    'fertile': 10
  }
  const reforge = attrs.modifier?.toLowerCase()
  if (reforge && reforges[reforge]) {
    fortune += reforges[reforge]
  }

  if (attrs.gems) {
    Object.values(attrs.gems).forEach((gem: any) => {
      if (gem?.quality?.toLowerCase().includes('farming') || 
          gem?.quality?.toLowerCase().includes('amber')) {
        const quality = gem.quality?.toLowerCase()
        if (quality?.includes('perfect')) fortune += 10
        else if (quality?.includes('flawless')) fortune += 8
        else if (quality?.includes('fine')) fortune += 6
        else fortune += 4
      }
    })
  }

  return fortune
}

function calculatePetFortune(pet: any): number {
  if (!pet?.type) return 0
  
  const farmingPets: Record<string, (level: number) => number> = {
    'MOOSHROOM_COW': (level) => Math.floor(level * 1),
    'ELEPHANT': (level) => Math.floor(level * 0.75),
    'BEE': (level) => Math.floor(level * 0.5),
    'SLUG': (level) => Math.floor(level * 0.5)
  }
  
  const calculator = farmingPets[pet.type]
  if (!calculator) return 0
  
  const level = pet.exp ? calculatePetLevel(pet.exp, pet.tier || 'COMMON') : 1
  return calculator(level)
}

function calculatePetLevel(exp: number, tier: string): number {
  const expPerLevel = 5000
  return Math.min(Math.floor(exp / expPerLevel), 100)
}

function calculateSkillLevel(exp: number): number {
  const levels = [
    0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425, 32425, 47425, 67425, 97425, 
    147425, 222425, 322425, 522425, 822425, 1222425, 1722425, 2322425, 3022425, 3822425, 4722425, 5722425, 
    6822425, 8022425, 9322425, 10722425, 12222425, 13822425, 15522425, 17322425, 19222425, 21222425, 23322425, 
    25522425, 27822425, 30222425, 32722425, 35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 
    55172425, 59472425, 64072425, 68972425, 74172425, 79672425, 85472425, 91572425, 97972425, 104672425
  ]
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (exp >= levels[i]) {
      return i
    }
  }
  
  return 0
}

function getItemName(item: any): string {
  if (!item?.tag?.display?.Name) return 'Unknown'
  return cleanItemName(item.tag.display.Name)
}

function cleanItemName(name: string): string {
  if (!name) return 'Unknown'
  return name.replace(/§[0-9a-fk-or]/gi, '').replace(/[^\w\s'-]/g, '').trim()
}

function formatPetName(type: string): string {
  if (!type) return 'Unknown Pet'
  return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
}

export function parseGarden(memberData: any): {
  level: number
  crops: Array<{ name: string; harvested: number; milestone: number }>
  visitors: number
  compost: number
} {
  const defaultResult = {
    level: 0,
    crops: [],
    visitors: 0,
    compost: 0
  }

  if (!memberData) {
    console.log('⚠️ No member data provided to parseGarden')
    return defaultResult
  }

  try {
    console.log('🔍 Parsing garden data...')
    console.log('🔍 Member data keys:', Object.keys(memberData))
    
    const gardenData = memberData.garden_player_data || memberData.garden

    if (!gardenData) {
      console.log('⚠️ No garden data found in member data')
      return defaultResult
    }

    console.log('✅ Found garden data:', Object.keys(gardenData))

    const experience = gardenData.garden_experience || gardenData.experience || 0
    const level = calculateGardenLevel(experience)
    console.log(`🌱 Garden Level: ${level} (${experience} XP)`)

    const cropsData = gardenData.resources_collected || gardenData.crops || {}
    console.log('🌾 Crops data keys:', Object.keys(cropsData))

    const cropNames: Record<string, string> = {
      'WHEAT': 'Wheat',
      'CARROT': 'Carrot',
      'CARROT_ITEM': 'Carrot',
      'POTATO': 'Potato',
      'POTATO_ITEM': 'Potato',
      'PUMPKIN': 'Pumpkin',
      'MELON': 'Melon',
      'MELON_SLICE': 'Melon',
      'MUSHROOM_COLLECTION': 'Mushroom',
      'COCOA': 'Cocoa Beans',
      'COCOA_BEANS': 'Cocoa Beans',
      'CACTUS': 'Cactus',
      'SUGAR_CANE': 'Sugar Cane',
      'NETHER_STALK': 'Nether Wart',
      'NETHER_WART': 'Nether Wart',
      'INK_SACK:3': 'Cocoa Beans'
    }

    const cropMilestones = [
      0, 1000, 5000, 25000, 100000, 250000, 500000, 1000000, 2500000, 5000000,
      10000000, 25000000, 50000000, 100000000, 250000000, 500000000, 1000000000
    ]

    const crops = Object.entries(cropsData)
      .filter(([cropKey]) => cropNames[cropKey])
      .map(([cropKey, amount]: [string, any]) => {
        const harvested = typeof amount === 'number' ? amount : 0
        
        let milestone = cropMilestones[0]
        for (let i = cropMilestones.length - 1; i >= 0; i--) {
          if (harvested >= cropMilestones[i]) {
            milestone = cropMilestones[i + 1] || cropMilestones[i]
            break
          }
        }
        
        return {
          name: cropNames[cropKey],
          harvested,
          milestone
        }
      })
      .filter(crop => crop.harvested > 0)
      .sort((a, b) => b.harvested - a.harvested)

    console.log(`✅ Parsed ${crops.length} crops:`, crops)

    let visitors = 0
    const visitorsData = gardenData.unique_visitors || gardenData.unique_visitors_2
    if (Array.isArray(visitorsData)) {
      visitors = visitorsData.length
    } else if (typeof visitorsData === 'number') {
      visitors = visitorsData
    } else if (visitorsData && typeof visitorsData === 'object') {
      visitors = Object.keys(visitorsData).length
    }
    console.log(`👥 Unique Visitors: ${visitors}`)

    let compost = 0
    const compostData = gardenData.compost_data || gardenData.compost
    if (typeof compostData === 'number') {
      compost = compostData
    } else if (compostData && typeof compostData === 'object') {
      const organicMatter = compostData.organic_matter || 0
      const fuelCap = compostData.fuel_cap || 0
      compost = organicMatter + fuelCap
    }
    console.log(`🗑️ Compost: ${compost}`)

    return {
      level,
      crops,
      visitors,
      compost
    }
  } catch (error) {
    console.error('Error parsing garden data:', error)
    return defaultResult
  }
}

function calculateGardenLevel(experience: number): number {
  const levels = [
    0, 1000, 2500, 5000, 10000, 20000, 35000, 55000, 80000, 110000,
    145000, 185000, 230000, 280000, 335000, 395000, 460000, 530000, 605000, 685000,
    770000, 860000, 955000, 1055000, 1160000, 1270000, 1385000, 1505000, 1630000, 1760000
  ]
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i]) {
      return i + 1
    }
  }
  
  return 0
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

  if (!memberData) return result

  try {
    const inventory = memberData.inventory

    if (inventory?.inv_armor?.data) {
      const armorItems = parseInventoryData(inventory.inv_armor.data)
      result.armor = armorItems
        .filter((item: any) => item?.tag?.display?.Name)
        .map((item: any) => ({
          name: getItemName(item),
          rarity: (item.tag?.ExtraAttributes?.rarity || 'common').toLowerCase()
        }))
    }

    if (inventory?.equipment_contents?.data) {
      const equipmentItems = parseInventoryData(inventory.equipment_contents.data)
      result.equipment = equipmentItems
        .filter((item: any) => item?.tag?.display?.Name)
        .map((item: any) => ({
          name: getItemName(item),
          rarity: (item.tag?.ExtraAttributes?.rarity || 'common').toLowerCase()
        }))
    }

    const accessories = inventory?.bag_contents?.talisman_bag?.data
    if (accessories) {
      const accessoryItems = parseInventoryData(accessories)
      result.accessories = accessoryItems
        .filter((item: any) => item?.tag?.display?.Name)
        .slice(0, 10)
        .map((item: any) => ({
          name: getItemName(item),
          rarity: (item.tag?.ExtraAttributes?.rarity || 'common').toLowerCase()
        }))
    }
  } catch (error) {
    console.error('Error parsing equipment:', error)
  }

  return result
}

export function parsePet(memberData: any): {
  name: string
  level: number
  rarity: string
  type: string
} | null {
  if (!memberData) return null

  try {
    const pets = memberData.pets_data?.pets || memberData.pets || []
    
    if (!Array.isArray(pets) || pets.length === 0) {
      return null
    }

    const activePet = pets.find((p: any) => p?.active === true)
    
    if (!activePet?.type) {
      return null
    }

    const tier = activePet.tier || 'COMMON'
    const exp = activePet.exp || 0
    const level = calculatePetLevel(exp, tier)

    return {
      name: formatPetName(activePet.type),
      type: activePet.type,
      level,
      rarity: tier.toLowerCase()
    }
  } catch (error) {
    console.error('Error parsing pet:', error)
    return null
  }
}
