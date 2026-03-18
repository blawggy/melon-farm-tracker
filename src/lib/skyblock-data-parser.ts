export interface ParsedProfileData {
  fortune: {
    total: number
    sources: {
      armor: Array<{ name: string; fortune: number }>
      equipment: Array<{ name: string; fortune: number }>
      accessories: Array<{ name: string; fortune: number }>
      pet: { name: string; fortune: number } | null
      skills: Array<{ name: string; fortune: number }>
      misc: Array<{ name: string; fortune: number }>
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

const HYPIXEL_API_KEY = '14a7e13c-88e4-4e69-bcbb-1699bd3862f7'

async function fetchWithCORS(url: string, timeout: number = 10000): Promise<Response> {
  const corsProxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
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

export async function fetchPlayerUUID(username: string): Promise<{ id: string; name: string }> {
  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_]/g, '')
  
  if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 16) {
    throw new Error('Invalid username format')
  }

  const apis = [
    {
      url: `https://api.ashcon.app/mojang/v2/user/${cleanUsername}`,
      parser: (data: any) => data.uuid && data.username ? 
        { id: data.uuid.replace(/-/g, ''), name: data.username } : null
    },
    {
      url: `https://playerdb.co/api/player/minecraft/${cleanUsername}`,
      parser: (data: any) => data.data?.player?.id && data.data?.player?.username ? 
        { id: data.data.player.id.replace(/-/g, ''), name: data.data.player.username } : null
    }
  ]

  for (const api of apis) {
    try {
      console.log(`🔍 Fetching UUID for ${cleanUsername}...`)
      const response = await fetchWithCORS(api.url, 8000)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Player not found')
        }
        continue
      }

      const data = await response.json()
      const result = api.parser(data)

      if (result) {
        console.log(`✅ Found: ${result.name} (${result.id})`)
        return result
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Player not found') {
        throw error
      }
      continue
    }
  }

  throw new Error('All APIs failed')
}

export async function fetchSkyblockProfiles(uuid: string): Promise<any[]> {
  const cleanUUID = uuid.replace(/-/g, '')
  
  try {
    console.log(`🔍 Fetching Skyblock profiles for ${cleanUUID}...`)
    
    const url = `https://api.hypixel.net/v2/skyblock/profiles?uuid=${cleanUUID}&key=${HYPIXEL_API_KEY}`
    const response = await fetchWithCORS(url, 15000)

    if (!response.ok) {
      throw new Error(`Failed to fetch profiles (Status: ${response.status})`)
    }

    const data = await response.json()
    
    if (!data.success || !data.profiles || data.profiles.length === 0) {
      throw new Error('No Skyblock profiles found')
    }

    console.log(`✅ Found ${data.profiles.length} profile(s)`)
    return data.profiles
  } catch (error) {
    console.error('Error fetching profiles:', error)
    throw error
  }
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

function calculatePetLevel(exp: number, tier: string): number {
  const petXPPerLevel: Record<string, number> = {
    'COMMON': 100000,
    'UNCOMMON': 125000,
    'RARE': 150000,
    'EPIC': 175000,
    'LEGENDARY': 200000,
    'MYTHIC': 250000
  }
  
  const xpRequired = petXPPerLevel[tier.toUpperCase()] || 100000
  const level = Math.min(100, Math.floor(exp / xpRequired) + 1)
  return level
}

function formatPetName(type: string): string {
  if (!type) return 'Unknown Pet'
  return type.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

export function parseProfileData(profile: any, uuid: string): ParsedProfileData {
  const memberData = profile.members?.[uuid]
  
  if (!memberData) {
    throw new Error('Player data not found in profile')
  }

  console.log('📦 Parsing profile data...')
  console.log('Available keys:', Object.keys(memberData))

  const fortune = parseFarmingFortune(memberData)
  const garden = parseGarden(memberData)
  const equipment = parseEquipment(memberData)
  const pet = parsePet(memberData)

  return { fortune, garden, equipment, pet }
}

function parseFarmingFortune(memberData: any) {
  console.log('🌾 Parsing farming fortune...')
  
  const sources = {
    armor: [] as Array<{ name: string; fortune: number }>,
    equipment: [] as Array<{ name: string; fortune: number }>,
    accessories: [] as Array<{ name: string; fortune: number }>,
    pet: null as { name: string; fortune: number } | null,
    skills: [] as Array<{ name: string; fortune: number }>,
    misc: [] as Array<{ name: string; fortune: number }>
  }

  let total = 0

  const farmingSkillExp = memberData.player_data?.experience?.SKILL_FARMING || 
                          memberData.experience_skill_farming || 0
  const farmingLevel = calculateSkillLevel(farmingSkillExp)
  const farmingFortune = farmingLevel * 4
  
  if (farmingFortune > 0) {
    sources.skills.push({ name: `Farming ${farmingLevel}`, fortune: farmingFortune })
    total += farmingFortune
  }

  const jacobsData = memberData.jacobs_contest || {}
  const perks = jacobsData.perks || {}
  
  if (perks.farming_level_cap) {
    const capBonus = perks.farming_level_cap * 4
    sources.misc.push({ name: 'Farming Level Cap', fortune: capBonus })
    total += capBonus
  }

  const anitaBonus = jacobsData.anita_bonus || jacobsData.anita_extra_farming_fortune || 0
  if (anitaBonus > 0) {
    sources.misc.push({ name: 'Anita Bonus', fortune: anitaBonus })
    total += anitaBonus
  }

  const gardenLevel = memberData.garden_player_data?.garden_experience || 0
  const gardenLevelNum = calculateGardenLevel(gardenLevel)
  const gardenFortune = gardenLevelNum * 5
  
  if (gardenFortune > 0) {
    sources.misc.push({ name: `Garden Level ${gardenLevelNum}`, fortune: gardenFortune })
    total += gardenFortune
  }

  const communityUpgrades = memberData.community_upgrades || {}
  const farmingUpgrade = communityUpgrades.farming_fortune || 0
  if (farmingUpgrade > 0) {
    sources.misc.push({ name: 'Community Upgrades', fortune: farmingUpgrade })
    total += farmingUpgrade
  }

  const accessoryBag = memberData.accessory_bag_storage || memberData.bag_contents?.talisman_bag || {}
  if (accessoryBag.highest_magical_power) {
    const magicalPowerBonus = Math.floor(accessoryBag.highest_magical_power / 10)
    if (magicalPowerBonus > 0) {
      sources.misc.push({ name: 'Magical Power', fortune: magicalPowerBonus })
      total += magicalPowerBonus
    }
  }

  const pets = memberData.pets_data?.pets || memberData.pets || []
  if (Array.isArray(pets) && pets.length > 0) {
    const activePet = pets.find((p: any) => p?.active === true)
    if (activePet?.type) {
      const petType = activePet.type.toUpperCase()
      const tier = activePet.tier || 'COMMON'
      const exp = activePet.exp || 0
      const level = calculatePetLevel(exp, tier)
      
      const farmingPets: Record<string, number> = {
        'MOOSHROOM_COW': level * 1.0,
        'ELEPHANT': level * 0.75,
        'BEE': level * 0.5,
        'SLUG': level * 0.5,
        'RABBIT': level * 0.3
      }
      
      if (farmingPets[petType]) {
        const petFortune = Math.floor(farmingPets[petType])
        const petName = formatPetName(petType)
        sources.pet = { name: `${petName} Lvl ${level}`, fortune: petFortune }
        total += petFortune
      }
    }
  }

  const armorFortune = memberData.player_stats?.farming_fortune?.armor || 0
  if (armorFortune > 0) {
    sources.armor.push({ name: 'Armor Set', fortune: armorFortune })
    total += armorFortune
  }

  const equipmentFortune = memberData.player_stats?.farming_fortune?.equipment || 0
  if (equipmentFortune > 0) {
    sources.equipment.push({ name: 'Equipment', fortune: equipmentFortune })
    total += equipmentFortune
  }

  const accessoryFortune = memberData.player_stats?.farming_fortune?.accessories || 0
  if (accessoryFortune > 0) {
    sources.accessories.push({ name: 'Accessories', fortune: accessoryFortune })
    total += accessoryFortune
  }

  console.log(`✅ Total farming fortune: ${total}`)

  return { total, sources }
}

function parseGarden(memberData: any) {
  console.log('🌱 Parsing garden data...')
  
  const gardenData = memberData.garden_player_data || memberData.garden
  
  if (!gardenData) {
    console.log('⚠️ No garden data found')
    return null
  }

  const experience = gardenData.garden_experience || gardenData.experience || 0
  const level = calculateGardenLevel(experience)

  let visitors = 0
  if (Array.isArray(gardenData.unique_visitors)) {
    visitors = gardenData.unique_visitors.length
  } else if (typeof gardenData.unique_visitors === 'object' && gardenData.unique_visitors !== null) {
    visitors = Object.keys(gardenData.unique_visitors).length
  } else if (typeof gardenData.unique_visitors === 'number') {
    visitors = gardenData.unique_visitors
  }

  const compostData = gardenData.compost || {}
  const compost = (compostData.organic_matter || 0) + (compostData.fuel_cap || 0)

  const cropsData = gardenData.resources_collected || {}

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

  console.log(`✅ Garden Level: ${level}, Visitors: ${visitors}, Crops: ${crops.length}`)

  return { level, crops, visitors, compost }
}

function parseEquipment(memberData: any) {
  console.log('⚔️ Parsing equipment...')
  
  const result = {
    armor: [] as Array<{ name: string; rarity: string }>,
    equipment: [] as Array<{ name: string; rarity: string }>,
    accessories: [] as Array<{ name: string; rarity: string }>
  }

  const wardrobe = memberData.wardrobe_equipped_slot
  if (typeof wardrobe === 'number') {
    result.armor.push({ name: 'Equipped Armor', rarity: 'unknown' })
  }

  const equipmentContents = memberData.equipment_contents
  if (equipmentContents) {
    result.equipment.push({ name: 'Equipped Items', rarity: 'unknown' })
  }

  console.log(`✅ Equipment parsed`)

  return result
}

function parsePet(memberData: any) {
  console.log('🐾 Parsing pet data...')
  
  const pets = memberData.pets_data?.pets || memberData.pets || []
  
  if (!Array.isArray(pets) || pets.length === 0) {
    console.log('⚠️ No pets found')
    return null
  }

  const activePet = pets.find((p: any) => p?.active === true)
  
  if (!activePet?.type) {
    console.log('⚠️ No active pet')
    return null
  }

  const tier = activePet.tier || 'COMMON'
  const exp = activePet.exp || 0
  const level = calculatePetLevel(exp, tier)
  const name = formatPetName(activePet.type)

  console.log(`✅ Active pet: ${name} Level ${level}`)

  return {
    name,
    type: activePet.type,
    level,
    rarity: tier.toLowerCase()
  }
}
