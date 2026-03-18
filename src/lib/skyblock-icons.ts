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
  MELON: 'MELON',
  PUMPKIN: 'PUMPKIN',
  SUGAR_CANE: 'SUGAR_CANE',
  CACTUS: 'CACTUS',
  COCOA: 'INK_SACK:3',
  MUSHROOM: 'RED_MUSHROOM',
  NETHER_WART: 'NETHER_STALK',
}

const CROP_EMOJIS: Record<string, string> = {
  WHEAT: '🌾',
  Wheat: '🌾',
  CARROT: '🥕',
  Carrot: '🥕',
  POTATO: '🥔',
  Potato: '🥔',
  MELON: '🍉',
  Melon: '🍉',
  PUMPKIN: '🎃',
  Pumpkin: '🎃',
  SUGAR_CANE: '🎋',
  'Sugar Cane': '🎋',
  CACTUS: '🌵',
  Cactus: '🌵',
  COCOA: '🍫',
  'Cocoa Beans': '🍫',
  MUSHROOM: '🍄',
  'Red Mushroom': '🍄',
  'Brown Mushroom': '🍄',
  NETHER_WART: '🌿',
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
  const normalizedType = petType.toUpperCase()
  
  return {
    url: `${SKYBLOCK_ITEM_API_BASE}/${normalizedType}`,
    fallbackEmoji: PET_EMOJIS[normalizedType] || '🐾'
  }
}

export function getEquipmentIcon(itemName: string): SkyblockIcon {
  const upperName = itemName.toUpperCase()
  
  let equipmentType = 'ITEM'
  if (upperName.includes('HELMET') || upperName.includes('HAT') || upperName.includes('HEAD')) {
    equipmentType = 'HELMET'
  } else if (upperName.includes('CHESTPLATE') || upperName.includes('TUNIC') || upperName.includes('SHIRT')) {
    equipmentType = 'CHESTPLATE'
  } else if (upperName.includes('LEGGINGS') || upperName.includes('PANTS')) {
    equipmentType = 'LEGGINGS'
  } else if (upperName.includes('BOOTS') || upperName.includes('SHOES')) {
    equipmentType = 'BOOTS'
  } else if (upperName.includes('HOE')) {
    equipmentType = 'HOE'
  } else if (upperName.includes('AXE')) {
    equipmentType = 'AXE'
  } else if (upperName.includes('SWORD')) {
    equipmentType = 'SWORD'
  } else if (upperName.includes('PICKAXE') || upperName.includes('PICK')) {
    equipmentType = 'PICKAXE'
  } else if (upperName.includes('FISHING') || upperName.includes('ROD')) {
    equipmentType = 'FISHING_ROD'
  }
  
  return {
    url: `${SKYBLOCK_ITEM_API_BASE}/${itemName.replace(/ /g, '_')}`,
    fallbackEmoji: EQUIPMENT_EMOJIS[equipmentType] || '⚒️'
  }
}

export function getIconEmoji(icon: SkyblockIcon): string {
  return icon.fallbackEmoji
}
