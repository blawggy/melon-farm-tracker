const SKYBLOCK_ITEM_API_BASE = 'https://sky.shiiyu.moe/item'
const SKYBLOCK_HEAD_API_BASE = 'https://mc-heads.net/avatar'

export interface SkyblockIcon {
  type: 'item' | 'head' | 'emoji'
  url?: string
  fallbackEmoji: string
}

const ITEM_ID_MAP: Record<string, string> = {
  WHEAT: 'WHEAT',
  CARROT: 'CARROT_ITEM',
  POTATO: 'POTATO_ITEM',
  MELON: 'MELON',
  PUMPKIN: 'PUMPKIN',
  SUGAR_CANE: 'SUGAR_CANE',
  CACTUS: 'CACTUS',
  MUSHROOM: 'RED_MUSHROOM',
  NETHER_WART: 'NETHER_STALK',
  COCOA: 'COCOA_BEANS',
}

const CROP_EMOJIS: Record<string, string> = {
  'Sugar Cane': '🎋',
  'SUGAR_CANE': '🎋',
  'Nether Wart': '🍄',
  'NETHER_WART': '🍄',
  'Wheat': '🌾',
  'WHEAT': '🌾',
  'Carrot': '🥕',
  'CARROT': '🥕',
  'Potato': '🥔',
  'POTATO': '🥔',
  'Melon': '🍉',
  'MELON': '🍉',
  'Pumpkin': '🎃',
  'PUMPKIN': '🎃',
  'Cactus': '🌵',
  'CACTUS': '🌵',
  'Mushroom': '🍄',
  'MUSHROOM': '🍄',
  'Cocoa': '🍫',
  'COCOA': '🍫',
}

const PET_EMOJIS: Record<string, string> = {
  BEE: '🐝',
  RABBIT: '🐰',
  PIG: '🐷',
  CAT: '🐱',
  ELEPHANT: '🐘',
  MOOSHROOM: '🍄',
  DEFAULT: '🐾',
}

const EQUIPMENT_EMOJIS: Record<string, string> = {
  HELMET: '🪖',
  CHESTPLATE: '👕',
  LEGGINGS: '👖',
  BOOTS: '👢',
  AXE: '🪓',
  PICKAXE: '⛏️',
  HOE: '🔨',
  SWORD: '⚔️',
  NECKLACE: '📿',
  CLOAK: '🧥',
  DEFAULT: '⚙️',
}

export function getCropIcon(cropName: string): SkyblockIcon {
  const itemId = ITEM_ID_MAP[cropName.toUpperCase().replace(/ /g, '_')] || cropName.toUpperCase()
  return {
    type: 'item',
    url: `${SKYBLOCK_ITEM_API_BASE}/${itemId}`,
    fallbackEmoji: CROP_EMOJIS[cropName] || CROP_EMOJIS[cropName.toUpperCase().replace(/ /g, '_')] || '🌱'
  }
}

export function getPetIcon(petType: string): SkyblockIcon {
  return {
    type: 'emoji',
    fallbackEmoji: PET_EMOJIS[petType.toUpperCase()] || PET_EMOJIS.DEFAULT
  }
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
    equipmentType = 'HOE'
  } else if (upperName.includes('AXE')) {
    equipmentType = 'AXE'
  } else if (upperName.includes('SWORD')) {
    equipmentType = 'SWORD'
  } else if (upperName.includes('PICKAXE')) {
    equipmentType = 'PICKAXE'
  } else if (upperName.includes('NECKLACE')) {
    equipmentType = 'NECKLACE'
  } else if (upperName.includes('CLOAK')) {
    equipmentType = 'CLOAK'
  }

  return {
    type: 'item',
    url: `${SKYBLOCK_ITEM_API_BASE}/${itemName.replace(/ /g, '_').toUpperCase()}`,
    fallbackEmoji: EQUIPMENT_EMOJIS[equipmentType] || EQUIPMENT_EMOJIS.DEFAULT
  }
}

export function getIconEmoji(icon: SkyblockIcon): string {
  return icon.fallbackEmoji
}
