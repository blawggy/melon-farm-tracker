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

async function fetchWithCORS(url: string, timeout: number = 10000): Promise<Response> {
  const corsProxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://cors-anywhere.herokuapp.com/${url}`
  ]
  
  for (const proxyUrl of corsProxies) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(proxyUrl, { signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (response.ok || response.status === 404) {
        return response
      }
    } catch (error) {
      console.log(`CORS proxy failed, trying next...`)
      continue
    }
  }
  
  return fetch(url)
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
      url: `https://api.ashcon.app/mojang/v2/user/${cleanUsername}`,
      parser: (data: any) => data.uuid && data.username ? { id: data.uuid.replace(/-/g, ''), name: data.username } : null
    },
    {
      url: `https://playerdb.co/api/player/minecraft/${cleanUsername}`,
      parser: (data: any) => data.data?.player?.id && data.data?.player?.username ? { id: data.data.player.id.replace(/-/g, ''), name: data.data.player.username } : null
    },
    {
      url: `https://api.mojang.com/users/profiles/minecraft/${cleanUsername}`,
      parser: (data: any) => data.id && data.name ? { id: data.id, name: data.name } : null
    }
  ]

  let lastError: Error | null = null

  for (let i = 0; i < apis.length; i++) {
    try {
      console.log(`🔍 Fetching UUID for ${cleanUsername} from API ${i + 1}/${apis.length}...`)
      
      const response = await fetchWithCORS(apis[i].url, 8000)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Player not found. Please check the username.')
        }
        console.log(`⚠️ API ${i + 1} returned status ${response.status}, trying next...`)
        continue
      }

      const data = await response.json()
      const result = apis[i].parser(data)

      if (result) {
        console.log(`✅ Found player: ${result.name} (${result.id})`)
        return result
      }

      console.log(`⚠️ API ${i + 1} returned invalid data format, trying next...`)
    } catch (error) {
      console.error(`❌ API ${i + 1} error:`, error)
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (error instanceof Error && error.message.includes('Player not found')) {
        throw error
      }
      
      continue
    }
  }

  throw lastError || new Error('All APIs failed. Please try again later.')
}

export async function fetchSkyblockProfiles(uuid: string): Promise<HypixelProfile[]> {
  const cleanUUID = uuid.replace(/-/g, '')
  
  try {
    console.log(`🔍 Fetching Skyblock profiles for UUID ${cleanUUID}...`)
    
    const url = `https://api.hypixel.net/v2/skyblock/profiles?uuid=${cleanUUID}&key=${HYPIXEL_API_KEY}`
    const response = await fetchWithCORS(url, 15000)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`API Error Response:`, errorText)
      throw new Error(`Failed to fetch profiles (Status: ${response.status})`)
    }

    const data: HypixelResponse = await response.json()
    console.log('📦 Hypixel API Response success:', data.success, 'profiles:', data.profiles?.length)
    
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

function parseNBTData(data: any): any[] {
  if (!data) return []
  
  try {
    if (typeof data === 'string') {
      const decoded = atob(data)
      const bytes = new Uint8Array(decoded.length)
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i)
      }
      
      const parsed = parseNBT(bytes)
      if (Array.isArray(parsed)) return parsed.filter(item => item && item.tag)
      if (parsed?.i && Array.isArray(parsed.i)) return parsed.i.filter((item: any) => item && item.tag)
    }
    if (Array.isArray(data)) return data.filter(item => item && item.tag)
    if (data?.i && Array.isArray(data.i)) return data.i.filter((item: any) => item && item.tag)
  } catch (error) {
    console.error('Error parsing NBT data:', error)
  }
  return []
}

function parseNBT(data: Uint8Array): any {
  try {
    let pos = 0
    
    function readByte(): number {
      return data[pos++]
    }
    
    function readShort(): number {
      const value = (data[pos] << 8) | data[pos + 1]
      pos += 2
      return value
    }
    
    function readInt(): number {
      const value = (data[pos] << 24) | (data[pos + 1] << 16) | (data[pos + 2] << 8) | data[pos + 3]
      pos += 4
      return value
    }
    
    function readString(): string {
      const length = readShort()
      let str = ''
      for (let i = 0; i < length; i++) {
        str += String.fromCharCode(readByte())
      }
      return str
    }
    
    function readTag(): any {
      const type = readByte()
      if (type === 0) return null
      
      const name = readString()
      const value = readPayload(type)
      
      return { name, value, type }
    }
    
    function readPayload(type: number): any {
      switch (type) {
        case 1: return readByte()
        case 2: return readShort()
        case 3: return readInt()
        case 8: return readString()
        case 9: {
          const listType = readByte()
          const length = readInt()
          const list = []
          for (let i = 0; i < length; i++) {
            list.push(readPayload(listType))
          }
          return list
        }
        case 10: {
          const compound: any = {}
          while (true) {
            const tag = readTag()
            if (!tag) break
            compound[tag.name] = tag.value
          }
          return compound
        }
        default:
          return null
      }
    }
    
    const root = readTag()
    return root?.value || {}
  } catch (error) {
    console.error('NBT parsing error:', error)
    return {}
  }
}

function cleanItemName(name: string): string {
  if (!name) return 'Unknown'
  return name.replace(/§[0-9a-fk-or]/gi, '').replace(/[^\w\s'-]/g, '').trim()
}

function getItemName(item: any): string {
  if (!item?.tag?.display?.Name) return 'Unknown'
  return cleanItemName(item.tag.display.Name)
}

function extractFarmingFortune(item: any): number {
  if (!item?.tag?.ExtraAttributes) return 0
  
  let fortune = 0
  const attrs = item.tag.ExtraAttributes

  if (attrs.farming_for_dummies_count) {
    fortune += attrs.farming_for_dummies_count
  }

  const enchants = attrs.enchantments || {}
  
  if (enchants.harvesting) fortune += enchants.harvesting * 12.5
  if (enchants.cultivating) fortune += enchants.cultivating * 2
  if (enchants.turbo_coco) fortune += enchants.turbo_coco * 5
  if (enchants.turbo_cane) fortune += enchants.turbo_cane * 5
  if (enchants.turbo_carrot) fortune += enchants.turbo_carrot * 5
  if (enchants.turbo_potato) fortune += enchants.turbo_potato * 5
  if (enchants.turbo_pumpkin) fortune += enchants.turbo_pumpkin * 5
  if (enchants.turbo_melon) fortune += enchants.turbo_melon * 5
  if (enchants.turbo_wheat) fortune += enchants.turbo_wheat * 5
  if (enchants.turbo_warts) fortune += enchants.turbo_warts * 5
  if (enchants.dedication) fortune += enchants.dedication * 4

  const reforges: Record<string, number> = {
    'blessed': 2,
    'bountiful': 4,
    'prosperous': 6,
    'blooming': 8,
    'rooted': 8,
    'fertile': 10,
    'refined': 5
  }
  
  const reforge = attrs.modifier?.toLowerCase()
  if (reforge && reforges[reforge]) {
    fortune += reforges[reforge]
  }

  if (attrs.ability_scroll) {
    const scrolls = Array.isArray(attrs.ability_scroll) ? attrs.ability_scroll : [attrs.ability_scroll]
    scrolls.forEach((scroll: string) => {
      if (scroll?.toLowerCase().includes('turbo')) fortune += 25
    })
  }

  if (attrs.gems) {
    Object.values(attrs.gems).forEach((gem: any) => {
      const quality = gem?.quality?.toLowerCase() || ''
      if (quality.includes('amber') || quality.includes('perfect')) {
        fortune += 10
      } else if (quality.includes('flawless')) {
        fortune += 8
      } else if (quality.includes('fine')) {
        fortune += 6
      } else if (quality) {
        fortune += 4
      }
    })
  }

  if (attrs.stats_book) {
    fortune += attrs.stats_book * 0.1
  }

  return Math.floor(fortune)
}

function calculateSkillLevel(exp: number): number {
  const skillXP = [
    0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925, 14925, 22425, 32425, 47425, 67425,
    97425, 147425, 222425, 322425, 522425, 822425, 1222425, 1722425, 2322425, 3022425, 3822425,
    4722425, 5722425, 6822425, 8022425, 9322425, 10722425, 12222425, 13822425, 15522425, 17322425,
    19222425, 21222425, 23322425, 25522425, 27822425, 30222425, 32722425, 35322425, 38072425,
    40972425, 44072425, 47472425, 51172425, 55172425, 59472425, 64072425, 68972425, 74172425,
    79672425, 85472425, 91572425, 97972425, 104672425, 111672425
  ]
  
  for (let i = skillXP.length - 1; i >= 0; i--) {
    if (exp >= skillXP[i]) return i
  }
  return 0
}

function calculatePetLevel(exp: number, tier: string): number {
  const petLevels: Record<string, number[]> = {
    'COMMON': Array.from({ length: 100 }, (_, i) => i * 5000),
    'UNCOMMON': Array.from({ length: 100 }, (_, i) => i * 6000),
    'RARE': Array.from({ length: 100 }, (_, i) => i * 7500),
    'EPIC': Array.from({ length: 100 }, (_, i) => i * 10000),
    'LEGENDARY': Array.from({ length: 100 }, (_, i) => i * 12500),
    'MYTHIC': Array.from({ length: 100 }, (_, i) => i * 15000)
  }
  
  const levels = petLevels[tier] || petLevels['COMMON']
  for (let i = levels.length - 1; i >= 0; i--) {
    if (exp >= levels[i]) return i + 1
  }
  return 1
}

function calculatePetFortune(pet: any): number {
  if (!pet?.type) return 0
  
  const petType = pet.type.toUpperCase()
  const level = pet.exp ? calculatePetLevel(pet.exp, pet.tier || 'COMMON') : 1
  
  const farmingPets: Record<string, (level: number) => number> = {
    'MOOSHROOM_COW': (lvl) => Math.floor(lvl * 1.0),
    'ELEPHANT': (lvl) => Math.floor(lvl * 0.75),
    'BEE': (lvl) => Math.floor(lvl * 0.5),
    'SLUG': (lvl) => Math.floor(lvl * 0.5),
    'RABBIT': (lvl) => Math.floor(lvl * 0.3)
  }
  
  const calculator = farmingPets[petType]
  return calculator ? calculator(level) : 0
}

function formatPetName(type: string): string {
  if (!type) return 'Unknown Pet'
  return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
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
  console.log('🔍 Starting parseFarmingFortune...')
  
  const sources = {
    armor: [] as Array<{ name: string; fortune: number }>,
    equipment: [] as Array<{ name: string; fortune: number }>,
    accessories: [] as Array<{ name: string; fortune: number }>,
    pet: null as { name: string; fortune: number } | null,
    reforges: [] as Array<{ name: string; fortune: number }>
  }

  let total = 0

  if (!memberData) {
    console.log('⚠️ No member data provided')
    return { total, sources }
  }

  try {
    const farmingSkillExp = memberData.player_data?.experience?.SKILL_FARMING || 
                           memberData.experience_skill_farming || 0
    const farmingLevel = calculateSkillLevel(farmingSkillExp)
    const farmingFortune = farmingLevel * 4
    console.log(`🌾 Farming Level ${farmingLevel}: +${farmingFortune} fortune`)
    total += farmingFortune

    const jacobsData = memberData.jacobs_contest || {}
    const perks = jacobsData.perks || {}
    if (perks.farming_level_cap) {
      const capBonus = perks.farming_level_cap * 4
      console.log(`📊 Farming Level Cap: +${capBonus} fortune`)
      total += capBonus
    }

    const anitaBonus = jacobsData.anita_bonus || jacobsData.anita_extra_farming_fortune || 0
    if (anitaBonus > 0) {
      console.log(`👩‍🌾 Anita Bonus: +${anitaBonus} fortune`)
      total += anitaBonus
    }

    const communityUpgrades = memberData.community_upgrades || {}
    const farmingUpgrade = communityUpgrades.farming_fortune || 0
    if (farmingUpgrade > 0) {
      console.log(`🏘️ Community Upgrades: +${farmingUpgrade} fortune`)
      total += farmingUpgrade
    }

    const inventory = memberData.inventory || {}

    if (inventory.inv_armor?.data) {
      console.log('🛡️ Parsing armor...')
      const armorItems = parseNBTData(inventory.inv_armor.data)
      armorItems.forEach((item: any) => {
        const fortune = extractFarmingFortune(item)
        if (fortune > 0) {
          const name = getItemName(item)
          console.log(`  ✓ ${name}: +${fortune} fortune`)
          sources.armor.push({ name, fortune })
          total += fortune
        }
      })
    }

    if (inventory.equipment_contents?.data) {
      console.log('⚔️ Parsing equipment...')
      const equipmentItems = parseNBTData(inventory.equipment_contents.data)
      equipmentItems.forEach((item: any) => {
        const fortune = extractFarmingFortune(item)
        if (fortune > 0) {
          const name = getItemName(item)
          console.log(`  ✓ ${name}: +${fortune} fortune`)
          sources.equipment.push({ name, fortune })
          total += fortune
        }
      })
    }

    if (inventory.bag_contents?.talisman_bag?.data) {
      console.log('💎 Parsing accessories...')
      const accessoryItems = parseNBTData(inventory.bag_contents.talisman_bag.data)
      accessoryItems.forEach((item: any) => {
        const fortune = extractFarmingFortune(item)
        if (fortune > 0) {
          const name = getItemName(item)
          console.log(`  ✓ ${name}: +${fortune} fortune`)
          sources.accessories.push({ name, fortune })
          total += fortune
        }
      })
    }

    const pets = memberData.pets_data?.pets || memberData.pets || []
    if (Array.isArray(pets) && pets.length > 0) {
      console.log('🐾 Parsing pets...')
      const activePet = pets.find((p: any) => p?.active === true)
      if (activePet) {
        const petFortune = calculatePetFortune(activePet)
        if (petFortune > 0) {
          const petName = formatPetName(activePet.type)
          console.log(`  ✓ ${petName}: +${petFortune} fortune`)
          sources.pet = { name: petName, fortune: petFortune }
          total += petFortune
        }
      }
    }

    console.log(`✅ Total Farming Fortune: ${total}`)
  } catch (error) {
    console.error('❌ Error parsing farming fortune:', error)
  }

  return { total, sources }
}

function calculateGardenLevel(experience: number): number {
  const gardenLevels = [
    0, 1000, 2500, 5000, 10000, 20000, 35000, 55000, 80000, 110000,
    145000, 185000, 230000, 280000, 335000, 395000, 460000, 530000, 605000, 685000,
    770000, 860000, 955000, 1055000, 1160000, 1270000, 1385000, 1505000, 1630000, 1760000
  ]
  
  for (let i = gardenLevels.length - 1; i >= 0; i--) {
    if (experience >= gardenLevels[i]) return i + 1
  }
  return 0
}

export function parseGarden(memberData: any): {
  level: number
  crops: Array<{ name: string; harvested: number; milestone: number }>
  visitors: number
  compost: number
} | null {
  console.log('🔍 Starting parseGarden...')
  
  if (!memberData) {
    console.log('⚠️ No member data provided')
    return null
  }

  try {
    const gardenData = memberData.garden_player_data || memberData.garden
    
    if (!gardenData) {
      console.log('⚠️ No garden data found')
      return null
    }

    console.log('📦 Garden data keys:', Object.keys(gardenData))

    const experience = gardenData.garden_experience || gardenData.experience || 0
    const level = calculateGardenLevel(experience)
    console.log(`🌱 Garden Level: ${level} (${experience} XP)`)

    let visitors = 0
    if (Array.isArray(gardenData.unique_visitors)) {
      visitors = gardenData.unique_visitors.length
    } else if (Array.isArray(gardenData.unique_visitors_2)) {
      visitors = gardenData.unique_visitors_2.length
    } else if (typeof gardenData.unique_visitors === 'number') {
      visitors = gardenData.unique_visitors
    } else if (gardenData.unique_visitors && typeof gardenData.unique_visitors === 'object') {
      visitors = Object.keys(gardenData.unique_visitors).length
    }
    console.log(`👥 Unique Visitors: ${visitors}`)

    let compost = 0
    const compostData = gardenData.compost || {}
    compost = (compostData.organic_matter || 0) + (compostData.fuel_cap || 0)
    console.log(`🗑️ Compost: ${compost}`)

    const cropsData = gardenData.resources_collected || {}
    console.log('🌾 Crops data keys:', Object.keys(cropsData))

    const cropNames: Record<string, string> = {
      'WHEAT': 'Wheat',
      'CARROT_ITEM': 'Carrot',
      'POTATO_ITEM': 'Potato',
      'PUMPKIN': 'Pumpkin',
      'MELON': 'Melon',
      'MUSHROOM_COLLECTION': 'Mushroom',
      'INK_SACK:3': 'Cocoa Beans',
      'CACTUS': 'Cactus',
      'SUGAR_CANE': 'Sugar Cane',
      'NETHER_STALK': 'Nether Wart'
    }

    const cropMilestones = [
      0, 1000, 5000, 25000, 100000, 250000, 500000, 1000000, 2500000, 5000000,
      10000000, 25000000, 50000000, 100000000, 250000000, 500000000, 1000000000
    ]

    const crops = Object.entries(cropsData)
      .filter(([cropKey]) => cropNames[cropKey])
      .map(([cropKey, amount]: [string, any]) => {
        const harvested = typeof amount === 'number' ? amount : 0
        
        let milestone = cropMilestones[cropMilestones.length - 1]
        for (let i = 0; i < cropMilestones.length; i++) {
          if (harvested < cropMilestones[i]) {
            milestone = cropMilestones[i]
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

    console.log(`✅ Parsed ${crops.length} crops`)

    return {
      level,
      crops,
      visitors,
      compost
    }
  } catch (error) {
    console.error('❌ Error parsing garden data:', error)
    return null
  }
}

export function parseEquipment(memberData: any): {
  armor: Array<{ name: string; rarity: string }>
  equipment: Array<{ name: string; rarity: string }>
  accessories: Array<{ name: string; rarity: string }>
} {
  console.log('🔍 Starting parseEquipment...')
  
  const result = {
    armor: [] as Array<{ name: string; rarity: string }>,
    equipment: [] as Array<{ name: string; rarity: string }>,
    accessories: [] as Array<{ name: string; rarity: string }>
  }

  if (!memberData) {
    console.log('⚠️ No member data provided')
    return result
  }

  try {
    const inventory = memberData.inventory || {}

    if (inventory.inv_armor?.data) {
      console.log('🛡️ Parsing armor...')
      const armorItems = parseNBTData(inventory.inv_armor.data)
      result.armor = armorItems
        .filter((item: any) => item?.tag?.display?.Name)
        .map((item: any) => {
          const name = getItemName(item)
          const rarity = (item.tag?.ExtraAttributes?.rarity || 'common').toLowerCase()
          console.log(`  ✓ ${name} (${rarity})`)
          return { name, rarity }
        })
    }

    if (inventory.equipment_contents?.data) {
      console.log('⚔️ Parsing equipment...')
      const equipmentItems = parseNBTData(inventory.equipment_contents.data)
      result.equipment = equipmentItems
        .filter((item: any) => item?.tag?.display?.Name)
        .map((item: any) => {
          const name = getItemName(item)
          const rarity = (item.tag?.ExtraAttributes?.rarity || 'common').toLowerCase()
          console.log(`  ✓ ${name} (${rarity})`)
          return { name, rarity }
        })
    }

    if (inventory.bag_contents?.talisman_bag?.data) {
      console.log('💎 Parsing accessories (top 10)...')
      const accessoryItems = parseNBTData(inventory.bag_contents.talisman_bag.data)
      result.accessories = accessoryItems
        .filter((item: any) => item?.tag?.display?.Name)
        .slice(0, 10)
        .map((item: any) => {
          const name = getItemName(item)
          const rarity = (item.tag?.ExtraAttributes?.rarity || 'common').toLowerCase()
          console.log(`  ✓ ${name} (${rarity})`)
          return { name, rarity }
        })
    }

    console.log(`✅ Equipment parsed: ${result.armor.length} armor, ${result.equipment.length} equipment, ${result.accessories.length} accessories`)
  } catch (error) {
    console.error('❌ Error parsing equipment:', error)
  }

  return result
}

export function parsePet(memberData: any): {
  name: string
  level: number
  rarity: string
  type: string
} | null {
  console.log('🔍 Starting parsePet...')
  
  if (!memberData) {
    console.log('⚠️ No member data provided')
    return null
  }

  try {
    const pets = memberData.pets_data?.pets || memberData.pets || []
    
    if (!Array.isArray(pets) || pets.length === 0) {
      console.log('⚠️ No pets found')
      return null
    }

    const activePet = pets.find((p: any) => p?.active === true)
    
    if (!activePet?.type) {
      console.log('⚠️ No active pet found')
      return null
    }

    const tier = activePet.tier || 'COMMON'
    const exp = activePet.exp || 0
    const level = calculatePetLevel(exp, tier)
    const name = formatPetName(activePet.type)

    console.log(`✅ Active Pet: ${name} Level ${level} (${tier})`)

    return {
      name,
      type: activePet.type,
      level,
      rarity: tier.toLowerCase()
    }
  } catch (error) {
    console.error('❌ Error parsing pet:', error)
    return null
  }
}
