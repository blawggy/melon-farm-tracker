const SKYBLOCK_ITEM_API_BASE = 'https://sky.shiiyu.moe/item'
const SKYBLOCK_HEAD_API_BASE = 'https://mc-heads.net/avatar'

export interface SkyblockIcon {
  url: string
  fallbackEmoji: string
}

const ITEM_ID_MAP: Record<string, string> = {
  WHEAT: 'WHEAT',
  CARROT: 'CARROT_ITEM',
  POTATO: 'POTATO_ITEM',
  PUMPKIN: 'PUMPKIN',
  MELON: 'MELON',
  SUGAR_CANE: 'SUGAR_CANE',
  CACTUS: 'CACTUS',
  COCOA: 'INK_SACK:3',
  MUSHROOM: 'RED_MUSHROOM',
  NETHER_WART: 'NETHER_STALK',
  
  ELEPHANT: 'ELEPHANT',
  MOOSHROOM_COW: 'MOOSHROOM_COW',
  BEE: 'BEE',
  RABBIT: 'RABBIT',
  
  HELMET: 'LEATHER_HELMET',
  CHESTPLATE: 'LEATHER_CHESTPLATE',
  LEGGINGS: 'LEATHER_LEGGINGS',
  BOOTS: 'LEATHER_BOOTS',
  
  HOE: 'DIAMOND_HOE',
  AXE: 'DIAMOND_AXE',
  
  TALISMAN: 'SKULL_ITEM',
  RING: 'SKULL_ITEM',
  ARTIFACT: 'SKULL_ITEM',
}

const CROP_EMOJIS: Record<string, string> = {
  WHEAT: '🌾',
  CARROT: '🥕',
  POTATO: '🥔',
  PUMPKIN: '🎃',
  MELON: '🍉',
  SUGAR_CANE: '🎋',
  CACTUS: '🌵',
  COCOA: '🍫',
  MUSHROOM: '🍄',
  NETHER_WART: '🌿',
  
  Wheat: '🌾',
  Carrot: '🥕',
  Potato: '🥔',
  Pumpkin: '🎃',
  Melon: '🍉',
  'Sugar Cane': '🎋',
  Cactus: '🌵',
  'Cocoa Beans': '🍫',
  'Red Mushroom': '🍄',
  'Brown Mushroom': '🍄',
  'Nether Wart': '🌿',
}

const PET_EMOJIS: Record<string, string> = {
  ELEPHANT: '🐘',
  MOOSHROOM_COW: '🍄',
  BEE: '🐝',
  RABBIT: '🐰',
  PIG: '🐷',
  CHICKEN: '🐔',
  SHEEP: '🐑',
  COW: '🐄',
  HORSE: '🐴',
  WOLF: '🐺',
  CAT: '🐱',
}

const EQUIPMENT_EMOJIS: Record<string, string> = {
  HELMET: '⛑️',
  CHESTPLATE: '🛡️',
  LEGGINGS: '👖',
  BOOTS: '👢',
  HOE: '⚒️',
  AXE: '🪓',
  SWORD: '⚔️',
  PICKAXE: '⛏️',
  FISHING_ROD: '🎣',
}

export function getCropIcon(cropName: string): SkyblockIcon {
  const normalizedName = cropName.toUpperCase().replace(/ /g, '_')
  const itemId = ITEM_ID_MAP[normalizedName] || normalizedName
  
  return {
    url: `${SKYBLOCK_ITEM_API_BASE}/${itemId}`,
    fallbackEmoji: CROP_EMOJIS[cropName] || CROP_EMOJIS[normalizedName] || '🌱'
  }
}

export function getPetIcon(petType: string): SkyblockIcon {
  const normalizedType = petType.toUpperCase().replace(/ /g, '_')
  
  return {
    url: `${SKYBLOCK_ITEM_API_BASE}/${normalizedType}`,
    fallbackEmoji: PET_EMOJIS[normalizedType] || '🐾'
  }
}

export function getEquipmentIcon(itemName: string): SkyblockIcon {
  const normalized = itemName.toUpperCase()
  
  let emoji = '📦'
  if (normalized.includes('HELMET') || normalized.includes('HAT') || normalized.includes('CROWN')) {
    emoji = EQUIPMENT_EMOJIS.HELMET
  } else if (normalized.includes('CHESTPLATE') || normalized.includes('TUNIC')) {
    emoji = EQUIPMENT_EMOJIS.CHESTPLATE
  } else if (normalized.includes('LEGGINGS') || normalized.includes('PANTS')) {
    emoji = EQUIPMENT_EMOJIS.LEGGINGS
  } else if (normalized.includes('BOOTS') || normalized.includes('SHOES')) {
    emoji = EQUIPMENT_EMOJIS.BOOTS
  } else if (normalized.includes('HOE')) {
    emoji = EQUIPMENT_EMOJIS.HOE
  } else if (normalized.includes('AXE')) {
    emoji = EQUIPMENT_EMOJIS.AXE
  } else if (normalized.includes('SWORD')) {
    emoji = EQUIPMENT_EMOJIS.SWORD
  } else if (normalized.includes('PICKAXE')) {
    emoji = EQUIPMENT_EMOJIS.PICKAXE
  } else if (normalized.includes('ROD')) {
    emoji = EQUIPMENT_EMOJIS.FISHING_ROD
  }
  
  return {
    url: '',
    fallbackEmoji: emoji
  }
}

export function getPlayerHeadIcon(username: string): string {
  return `${SKYBLOCK_HEAD_API_BASE}/${username}/32`
}

export function getIconEmoji(icon: SkyblockIcon): string {
  return icon.fallbackEmoji
}
