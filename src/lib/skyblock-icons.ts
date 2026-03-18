const SKYBLOCK_ITEM_API_BASE = 'https://sky.shiiyu.moe/item'
const SKYBLOCK_HEAD_API_BASE = 'https://mc-heads.net/avatar'

export interface SkyblockIcon {
  url: string
  fallbackEmoji: string
 

const ITEM_ID_MAP: Record<string, string> = {
  WHEAT: 'WHEAT',
  CARROT: 'CARROT_ITEM',
  POTATO: 'POTATO_ITEM',
  MELON: 'MELON',
  PUMPKIN: 'PUMPKIN',
  SUGAR_CANE: 'SUGAR_CANE',
  CACTUS: 'CACTUS',
  CARROT: '🥕',
  MUSHROOM: 'RED_MUSHROOM',
  NETHER_WART: 'NETHER_STALK',
}

const CROP_EMOJIS: Record<string, string> = {
  'Sugar Cane'
  Wheat: '🌾',
  BEE: '🐝',
  PIG: '🐷',
  SHEEP: '🐑',
  HORSE: '🐴',
  CAT: '🐱',

  HELMET: '⛑️',
  LEGGINGS: '👖'
  HOE: '⚒️',
  SWORD: '⚔️',
  FISHING_ROD: 

  const normal
  
    url: `${SKYBL
  }

  const normalizedTy
  return {
 

export function getEquipmentIcon(itemName: s
  
  if (upperName.includ
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



























