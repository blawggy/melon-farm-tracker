const SKYBLOCK_ITEM_API_BASE = 'https://sky.shiiyu.moe/item'
const SKYBLOCK_HEAD_API_BASE = 'https://mc-heads.net/avatar'

  url?: string
}
const ITEM_ID_
  fallbackEmoji: string
}

const ITEM_ID_MAP: Record<string, string> = {
  SUGAR_CANE: 'SU
  MUSHROOM: 'RED_MUSHROO
  COCOA: 'COCOA_BEANS',

  'Sugar Cane': '🎋',
  'Nether Wart': '🍄',
  'Wheat': '🌾',
  'Carrot': '🥕',
  'Potato': '🥔',
  'Melon': '🍉',
 

  'Mushroom': '🍄',
  'Cocoa': '🍫',
}
const PET_EMOJIS: Reco
  RABBIT: '🐰',
  CAT: '🐱',
  MOOSHROOM: '🍄
}
const EQUIPMENT_E
  CHESTPLATE: '👕
  BOOTS: '👢',
  PICKAXE: '⛏️',
  SWORD: '⚔️',
  CLOAK: '🧥',
}
export function g
  return {
    url: `${SKYBLOC
  }

  return {
 

export function getEquipmentIcon(itemName: s
  let equipm
  if (upperName
  } else if 
  } else if 
  ELEPHANT: '🐘',
  MOOSHROOM: '🍄',
  DEFAULT: '🐾',
 

const EQUIPMENT_EMOJIS: Record<string, string> = {
  HELMET: '🪖',
  CHESTPLATE: '👕',
  LEGGINGS: '👖',
  BOOTS: '👢',

    type: 'item'
  HOE: '🔨',
  SWORD: '⚔️',
  NECKLACE: '📿',
  CLOAK: '🧥',
  DEFAULT: '⚙️',
}

export function getCropIcon(cropName: string): SkyblockIcon {
  const itemId = ITEM_ID_MAP[cropName.toUpperCase().replace(/ /g, '_')] || cropName.toUpperCase()

    type: 'item',
    url: `${SKYBLOCK_ITEM_API_BASE}/${itemId}`,
    fallbackEmoji: CROP_EMOJIS[cropName] || CROP_EMOJIS[cropName.toUpperCase().replace(/ /g, '_')] || '🌱'
  }


export function getPetIcon(petType: string): SkyblockIcon {
  return {
    type: 'emoji',
    fallbackEmoji: PET_EMOJIS[petType.toUpperCase()] || PET_EMOJIS.DEFAULT

}

export function getEquipmentIcon(itemName: string): SkyblockIcon {
  const upperName = itemName.toUpperCase()
  let equipmentType = 'DEFAULT'

  if (upperName.includes('HELMET')) {
    equipmentType = 'HELMET'
  } else if (upperName.includes('CHESTPLATE') || upperName.includes('TUNIC')) {
    equipmentType = 'CHESTPLATE'
  } else if (upperName.includes('LEGGINGS') || upperName.includes('PANTS')) {
    equipmentType = 'LEGGINGS'
  } else if (upperName.includes('BOOTS')) {
    equipmentType = 'BOOTS'
  } else if (upperName.includes('HOE')) {

  } else if (upperName.includes('AXE')) {

  } else if (upperName.includes('SWORD')) {

  } else if (upperName.includes('PICKAXE')) {
    equipmentType = 'PICKAXE'
  } else if (upperName.includes('NECKLACE')) {

  } else if (upperName.includes('CLOAK')) {



  return {
    type: 'item',
    url: `${SKYBLOCK_ITEM_API_BASE}/${itemName.replace(/ /g, '_').toUpperCase()}`,
    fallbackEmoji: EQUIPMENT_EMOJIS[equipmentType] || EQUIPMENT_EMOJIS.DEFAULT
  }
}

export function getIconEmoji(icon: SkyblockIcon): string {
  return icon.fallbackEmoji
}
