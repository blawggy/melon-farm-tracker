const SKYBLOCK_ITEM_API_BASE = 'https://sky.shiiyu.moe/item'
const SKYBLOCK_HEAD_API_BASE = 'https://mc-heads.net/avatar'

export interface SkyblockIcon {
  url: string
  fallbackEmoji: string
 

  COCOA: 'INK_SACK:3',
  NETHER_WART: 'N
  ELEPHANT: 'ELEPHANT',
  BEE: 'BEE',
  PUMPKIN: 'PUMPKIN',
  MELON: 'MELON',
  SUGAR_CANE: 'SUGAR_CANE',
  CACTUS: 'CACTUS',
  COCOA: 'INK_SACK:3',
  MUSHROOM: 'RED_MUSHROOM',
  NETHER_WART: 'NETHER_STALK',
co
  CARROT: '🥕',
  PUMPKIN: '🎃',
  SUGAR_CANE:
  COCOA: '🍫',
  
  Wheat: '🌾',
  Potato: '🥔',
  Melon: '🍉',
  Cactus: '🌵',
  
  'Nether Wart': '🌿'

  
  BEE: '🐝',
  PIG: '🐷',
  SHEEP: '🐑',
 


  HELMET: '⛑️'
  LEGGINGS: '👖
  HOE: '⚒️',
  SWORD: '⚔️',
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































































