import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  X, 
  Sparkle, 
  Plant, 
  User, 
  Crown,
  TrendUp,
  Medal
} from '@phosphor-icons/react'
import { calculateMilestoneBadge } from '@/lib/utils'
import { getCropIcon, getPetIcon, getIconEmoji } from '@/lib/skyblock-icons'
import type { ProfileData } from '@/types'

interface ComparisonPlayer {
  username: string
  uuid: string
  profileName: string
  data: ProfileData
}

interface ComparisonViewProps {
  players: ComparisonPlayer[]
  onRemovePlayer: (uuid: string) => void
  onClose: () => void
}

export function ComparisonView({ players, onRemovePlayer, onClose }: ComparisonViewProps) {
  const [sortBy, setSortBy] = useState<'fortune' | 'garden' | 'visitors'>('fortune')

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const getRarityColor = (rarity: string) => {
    const rarityLower = rarity.toLowerCase()
    const colors: Record<string, string> = {
      common: 'text-[color:var(--color-common)]',
      uncommon: 'text-[color:var(--color-uncommon)]',
      rare: 'text-[color:var(--color-rare)]',
      epic: 'text-[color:var(--color-epic)]',
      legendary: 'text-[color:var(--color-legendary)]',
      mythic: 'text-[color:var(--color-mythic)]',
      divine: 'text-[color:var(--color-divine)]'
    }
    return colors[rarityLower] || colors.common
  }

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'fortune') {
      return b.data.fortune.total - a.data.fortune.total
    } else if (sortBy === 'garden') {
      return (b.data.garden?.level || 0) - (a.data.garden?.level || 0)
    } else if (sortBy === 'visitors') {
      return (b.data.garden?.visitors || 0) - (a.data.garden?.visitors || 0)
    }
    return 0
  })

  const getTopValue = (key: 'fortune' | 'garden' | 'visitors') => {
    if (key === 'fortune') {
      return Math.max(...players.map(p => p.data.fortune.total))
    } else if (key === 'garden') {
      return Math.max(...players.map(p => p.data.garden?.level || 0))
    } else {
      return Math.max(...players.map(p => p.data.garden?.visitors || 0))
    }
  }

  const isTopPlayer = (player: ComparisonPlayer, key: 'fortune' | 'garden' | 'visitors') => {
    const topValue = getTopValue(key)
    if (key === 'fortune') {
      return player.data.fortune.total === topValue && topValue > 0
    } else if (key === 'garden') {
      return (player.data.garden?.level || 0) === topValue && topValue > 0
    } else {
      return (player.data.garden?.visitors || 0) === topValue && topValue > 0
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendUp size={40} weight="fill" className="text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl text-primary tracking-tight">
                Player Comparison
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                Comparing {players.length} player{players.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X size={20} />
            Close
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center">Sort by:</span>
          <Button
            variant={sortBy === 'fortune' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('fortune')}
            className="gap-2"
          >
            <Sparkle size={16} weight="fill" />
            Fortune
          </Button>
          <Button
            variant={sortBy === 'garden' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('garden')}
            className="gap-2"
          >
            <Plant size={16} weight="fill" />
            Garden Level
          </Button>
          <Button
            variant={sortBy === 'visitors' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('visitors')}
            className="gap-2"
          >
            <User size={16} weight="fill" />
            Visitors
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {sortedPlayers.map((player, index) => {
            const totalCrops = player.data.garden?.crops.reduce((sum, crop) => sum + crop.harvested, 0) || 0
            const milestoneBadge = calculateMilestoneBadge(totalCrops)

            return (
              <motion.div
                key={player.uuid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 border-2 relative">
                  {index === 0 && (
                    <div className="absolute -top-3 -right-3">
                      <Crown size={32} weight="fill" className="text-primary" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-semibold text-foreground font-body">
                          {player.username}
                        </h3>
                        {index < 3 && (
                          <Medal 
                            size={20} 
                            weight="fill" 
                            className={
                              index === 0 ? 'text-primary' : 
                              index === 1 ? 'text-secondary' : 
                              'text-accent'
                            } 
                          />
                        )}
                        {milestoneBadge && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className="flex items-center gap-1.5 px-2 py-1 rounded border transition-transform hover:scale-105"
                                  style={{ 
                                    borderColor: milestoneBadge.color,
                                    backgroundColor: `color-mix(in oklch, ${milestoneBadge.color} 15%, transparent)`
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="2" width="12" height="12" rx="1" fill={milestoneBadge.color} />
                                    <rect x="3" y="3" width="10" height="10" rx="0.5" fill="currentColor" opacity="0.15" />
                                  </svg>
                                  <span className="font-bold text-xs font-mono" style={{ color: milestoneBadge.color }}>
                                    {milestoneBadge.tier}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono font-semibold text-xs">{milestoneBadge.tier} Milestone</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatNumber(totalCrops)} crops
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {player.profileName}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemovePlayer(player.uuid)}
                      className="h-8 w-8 p-0"
                    >
                      <X size={16} />
                    </Button>
                  </div>

                <Separator className="mb-4" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkle size={20} weight="fill" className="text-accent" />
                      <span className="text-sm font-medium">Farming Fortune</span>
                      {isTopPlayer(player, 'fortune') && (
                        <Badge variant="secondary" className="text-xs">Top</Badge>
                      )}
                    </div>
                    <p className="text-xl font-bold font-mono text-accent tabular-nums">
                      ☘ {formatNumber(player.data.fortune.total)}
                    </p>
                  </div>

                  {player.data.garden && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Plant size={20} weight="fill" className="text-secondary" />
                          <span className="text-sm font-medium">Garden Level</span>
                          {isTopPlayer(player, 'garden') && (
                            <Badge variant="secondary" className="text-xs">Top</Badge>
                          )}
                        </div>
                        <p className="text-xl font-bold font-mono text-secondary tabular-nums">
                          {player.data.garden.level}
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <User size={20} weight="fill" className="text-primary" />
                          <span className="text-sm font-medium">Visitors</span>
                          {isTopPlayer(player, 'visitors') && (
                            <Badge variant="secondary" className="text-xs">Top</Badge>
                          )}
                        </div>
                        <p className="text-xl font-bold font-mono text-primary tabular-nums">
                          {player.data.garden.visitors}
                        </p>
                      </div>
                    </>
                  )}

                  {player.data.pet && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getIconEmoji(getPetIcon(player.data.pet.type))}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-mono font-semibold ${getRarityColor(player.data.pet.rarity)}`}>
                            {player.data.pet.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Level {player.data.pet.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )})}
        </div>

        <Card className="p-6 border-2 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground font-body">
            <Sparkle size={24} weight="fill" className="text-accent" />
            Fortune Comparison
          </h2>

          <ScrollArea className="h-[400px]">
            <div className="space-y-6 pr-4">
              {sortedPlayers.map((player) => (
                <div key={player.uuid} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground font-body">{player.username}</h3>
                    <p className="text-lg font-mono font-bold text-accent tabular-nums">
                      ☘ {formatNumber(player.data.fortune.total)}
                    </p>
                  </div>

                  <div className="relative">
                    <Progress 
                      value={(player.data.fortune.total / getTopValue('fortune')) * 100} 
                      className="h-3"
                    />
                  </div>

                  {player.data.fortune.sources.armor.length > 0 && (
                    <details className="group">
                      <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-2">
                        <span className="group-open:rotate-90 transition-transform">▶</span>
                        Armor ({player.data.fortune.sources.armor.length} pieces)
                      </summary>
                      <div className="mt-2 ml-6 space-y-1">
                        {player.data.fortune.sources.armor.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="font-mono">+{item.fortune} ☘</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {player.data.fortune.sources.equipment.length > 0 && (
                    <details className="group">
                      <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-2">
                        <span className="group-open:rotate-90 transition-transform">▶</span>
                        Equipment ({player.data.fortune.sources.equipment.length} pieces)
                      </summary>
                      <div className="mt-2 ml-6 space-y-1">
                        {player.data.fortune.sources.equipment.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="font-mono">+{item.fortune} ☘</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  <Separator className="my-4" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {players.some(p => p.data.garden) && (
          <Card className="p-6 border-2">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground font-body">
              <Plant size={24} weight="fill" className="text-secondary" />
              Garden Progress
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPlayers
                .filter(p => p.data.garden)
                .map((player) => (
                  <div key={player.uuid} className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-sm mb-3 text-foreground">
                      {player.username}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Level</span>
                        <span className="font-mono font-semibold text-secondary">
                          {player.data.garden!.level}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Visitors</span>
                        <span className="font-mono font-semibold text-primary">
                          {player.data.garden!.visitors}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Compost</span>
                        <span className="font-mono font-semibold text-accent">
                          {formatNumber(player.data.garden!.compost)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
