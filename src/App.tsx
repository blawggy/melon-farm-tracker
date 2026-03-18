import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MagnifyingGlass, User, Sparkle, Plant, PawPrint, Backpack, Warning, ArrowLeft, TrendUp, Plus, Book, Medal } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { getCropIcon, getPetIcon, getEquipmentIcon, getIconEmoji } from '@/lib/skyblock-icons'
import {
  fetchPlayerUUID,
  fetchSkyblockProfiles,
  parseProfileData
} from '@/lib/skyblock-data-parser'
import { calculateMilestoneBadge } from '@/lib/utils'
import { ComparisonView } from '@/components/ComparisonView'
import { GuidesView } from '@/components/GuidesView'
import { TestingPanel } from '@/components/TestingPanel'
import type { ProfileData } from '@/types'

interface SkyblockProfile {
  profile_id: string
  cute_name: string
  selected?: boolean
  members: Record<string, any>
}

interface PlayerData {
  uuid: string
  username: string
  profiles: SkyblockProfile[]
}

interface ComparisonPlayer {
  username: string
  uuid: string
  profileName: string
  data: ProfileData
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<SkyblockProfile | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [recentSearches, setRecentSearches] = useKV<string[]>('recent-searches', [])
  const [comparisonPlayers, setComparisonPlayers] = useKV<ComparisonPlayer[]>('comparison-players', [])
  const [showComparison, setShowComparison] = useState(false)
  const [showGuides, setShowGuides] = useState(false)
  const [showTesting, setShowTesting] = useState(false)

  const searchPlayer = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a username')
      return
    }

    setLoading(true)
    setLoadingMessage('Looking up player...')
    setError(null)
    setPlayerData(null)
    setSelectedProfile(null)
    setProfileData(null)

    try {
      const mojangData = await fetchPlayerUUID(searchQuery.trim())
      setLoadingMessage('Fetching Skyblock profiles...')
      const profiles = await fetchSkyblockProfiles(mojangData.id)

      setPlayerData({
        uuid: mojangData.id,
        username: mojangData.name,
        profiles
      })

      setRecentSearches((current) => {
        const updated = [mojangData.name, ...(current || []).filter(s => s !== mojangData.name)]
        return updated.slice(0, 5)
      })

      if (profiles.length === 1) {
        loadProfile(mojangData.id, profiles[0])
      }

      toast.success(`Found ${mojangData.name}!`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch player data'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  const loadProfile = async (uuid: string, profile: SkyblockProfile) => {
    setLoading(true)
    setError(null)
    setSelectedProfile(profile)

    try {
      const data = parseProfileData(profile, uuid)
      setProfileData(data)
      toast.success('Profile loaded!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load profile'
      setError(message)
      toast.error(message)
      setSelectedProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setSelectedProfile(null)
    setProfileData(null)
    setError(null)
  }

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPlayer()
    }
  }

  const addToComparison = () => {
    if (!playerData || !selectedProfile || !profileData) {
      toast.error('No profile loaded to add')
      return
    }

    const existingPlayer = (comparisonPlayers || []).find(p => p.uuid === playerData.uuid)
    if (existingPlayer) {
      toast.error('Player already in comparison')
      return
    }

    const newPlayer: ComparisonPlayer = {
      username: playerData.username,
      uuid: playerData.uuid,
      profileName: selectedProfile.cute_name,
      data: profileData
    }

    setComparisonPlayers((current) => [...(current || []), newPlayer])
    toast.success(`Added ${playerData.username} to comparison!`)
  }

  const removeFromComparison = (uuid: string) => {
    setComparisonPlayers((current) => (current || []).filter(p => p.uuid !== uuid))
    toast.success('Removed from comparison')
  }

  const clearComparison = () => {
    setComparisonPlayers([])
    setShowComparison(false)
    toast.success('Comparison cleared')
  }

  if (showTesting) {
    return <TestingPanel onClose={() => setShowTesting(false)} />
  }

  if (showGuides) {
    return <GuidesView onClose={() => setShowGuides(false)} />
  }

  if (showComparison && comparisonPlayers && comparisonPlayers.length > 0) {
    return (
      <ComparisonView
        players={comparisonPlayers}
        onRemovePlayer={removeFromComparison}
        onClose={() => setShowComparison(false)}
      />
    )
  }

  if (profileData && selectedProfile) {
    const totalCropsHarvested = profileData.garden?.crops.reduce((sum, crop) => sum + crop.harvested, 0) || 0
    const milestoneBadge = calculateMilestoneBadge(totalCropsHarvested)

    return (
      <div className="min-h-screen bg-background">
        <Toaster />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={goBack}
              className="gap-2"
            >
              <ArrowLeft size={20} />
              Back to Profiles
            </Button>

            <div className="flex gap-2">
              {comparisonPlayers && comparisonPlayers.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(true)}
                  className="gap-2"
                >
                  <TrendUp size={20} weight="fill" />
                  View Comparison ({comparisonPlayers.length})
                </Button>
              )}
              <Button
                onClick={addToComparison}
                className="gap-2"
                disabled={(comparisonPlayers || []).some(p => p.uuid === playerData?.uuid)}
              >
                <Plus size={20} weight="bold" />
                Add to Comparison
              </Button>
            </div>
          </div>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Plant size={40} weight="fill" className="text-secondary" />
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl text-primary tracking-tight">
                    {playerData?.username}
                  </h1>
                  {milestoneBadge && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-transform hover:scale-105"
                            style={{ 
                              borderColor: milestoneBadge.color,
                              backgroundColor: `color-mix(in oklch, ${milestoneBadge.color} 15%, transparent)`
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="2" y="2" width="12" height="12" rx="1" fill={milestoneBadge.color} />
                              <rect x="3" y="3" width="10" height="10" rx="0.5" fill="currentColor" opacity="0.15" />
                            </svg>
                            <span className="font-bold text-sm font-mono" style={{ color: milestoneBadge.color }}>
                              {milestoneBadge.tier}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono font-semibold">{milestoneBadge.tier} Milestone</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(totalCropsHarvested)} crops harvested
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatNumber(milestoneBadge.minCrops)} - {milestoneBadge.maxCrops ? formatNumber(milestoneBadge.maxCrops) : '∞'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-muted-foreground font-body text-sm mt-1">
                  Profile: {selectedProfile.cute_name}
                </p>
              </div>
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {profileData.garden && totalCropsHarvested > 0 && (
              <Card className="p-6 border-2 bg-gradient-to-br from-card to-muted/30">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground font-body">
                  <Medal size={24} weight="fill" className="text-primary" />
                  Crop Milestone Progress
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { tier: 'Iron', color: 'oklch(0.75 0.02 240)', min: 10_000_000, max: 20_000_000 },
                    { tier: 'Gold', color: 'oklch(0.75 0.15 85)', min: 20_000_000, max: 40_000_000 },
                    { tier: 'Emerald', color: 'oklch(0.65 0.18 150)', min: 40_000_000, max: 60_000_000 },
                    { tier: 'Diamond', color: 'oklch(0.75 0.15 200)', min: 60_000_000, max: 100_000_000 },
                    { tier: 'Netherite', color: 'oklch(0.35 0.02 240)', min: 100_000_000, max: null }
                  ].map((milestone) => {
                    const isAchieved = totalCropsHarvested >= milestone.min
                    const isCurrent = milestoneBadge?.tier === milestone.tier
                    
                    return (
                      <TooltipProvider key={milestone.tier}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`p-3 rounded-lg border-2 transition-all ${
                                isCurrent ? 'scale-105' : ''
                              } ${isAchieved ? '' : 'opacity-40'}`}
                              style={{ 
                                borderColor: milestone.color,
                                backgroundColor: `color-mix(in oklch, ${milestone.color} ${isAchieved ? '20' : '10'}%, transparent)`,
                                ...(isCurrent ? { boxShadow: `0 0 0 2px ${milestone.color}` } : {})
                              }}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="2" y="2" width="12" height="12" rx="1" fill={milestone.color} opacity={isAchieved ? 1 : 0.5} />
                                  <rect x="3" y="3" width="10" height="10" rx="0.5" fill="currentColor" opacity="0.15" />
                                </svg>
                                <span className="font-bold text-xs font-mono text-center" style={{ color: milestone.color }}>
                                  {milestone.tier}
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-mono font-semibold">{milestone.tier} Milestone</p>
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(milestone.min)} - {milestone.max ? formatNumber(milestone.max) : '∞'} crops
                            </p>
                            {isAchieved && (
                              <p className="text-xs text-green-500 mt-1">✓ Achieved</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-2 border-primary/20 bg-card/50 backdrop-blur">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkle size={28} weight="fill" className="text-accent" />
                  <span className="text-sm font-medium text-muted-foreground font-body">
                    Total Farming Fortune
                  </span>
                </div>
                <p className="text-4xl font-bold font-mono text-accent tabular-nums">
                  ☘ {formatNumber(profileData.fortune.total)}
                </p>
              </Card>

              {profileData.garden && (
                <>
                  <Card className="p-6 border-2 border-secondary/20 bg-card/50 backdrop-blur">
                    <div className="flex items-center gap-3 mb-3">
                      <Plant size={28} weight="fill" className="text-secondary" />
                      <span className="text-sm font-medium text-muted-foreground font-body">
                        Garden Level
                      </span>
                    </div>
                    <p className="text-4xl font-bold font-mono text-secondary tabular-nums">
                      {profileData.garden.level}
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20 bg-card/50 backdrop-blur">
                    <div className="flex items-center gap-3 mb-3">
                      <User size={28} weight="fill" className="text-primary" />
                      <span className="text-sm font-medium text-muted-foreground font-body">
                        Unique Visitors
                      </span>
                    </div>
                    <p className="text-4xl font-bold font-mono text-primary tabular-nums">
                      {profileData.garden.visitors}
                    </p>
                  </Card>
                </>
              )}
            </div>

            <Tabs defaultValue="fortune" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="fortune" className="gap-2 font-body">
                  <Sparkle size={18} weight="fill" />
                  Fortune
                </TabsTrigger>
                <TabsTrigger value="equipment" className="gap-2 font-body">
                  <Backpack size={18} weight="fill" />
                  Equipment
                </TabsTrigger>
                {profileData.garden && (
                  <TabsTrigger value="garden" className="gap-2 font-body">
                    <Plant size={18} weight="fill" />
                    Garden
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="fortune">
                <Card className="p-6 border-2 bg-card">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground font-body">
                    <Sparkle size={24} weight="fill" className="text-accent" />
                    Fortune Breakdown
                  </h2>

                  <div className="space-y-6">
                    {profileData.fortune.sources.skills.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Skills</h3>
                        <div className="space-y-2">
                          {profileData.fortune.sources.skills.map((source, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="text-sm font-mono text-foreground">{source.name}</span>
                              <Badge variant="secondary" className="font-mono">
                                +{source.fortune} ☘
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileData.fortune.sources.misc.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Miscellaneous</h3>
                        <div className="space-y-2">
                          {profileData.fortune.sources.misc.map((source, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="text-sm font-mono text-foreground">{source.name}</span>
                              <Badge variant="secondary" className="font-mono">
                                +{source.fortune} ☘
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileData.fortune.sources.armor.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Armor</h3>
                        <div className="space-y-2">
                          {profileData.fortune.sources.armor.map((source, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="text-sm font-mono text-foreground">{source.name}</span>
                              <Badge variant="secondary" className="font-mono">
                                +{source.fortune} ☘
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileData.fortune.sources.equipment.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Equipment</h3>
                        <div className="space-y-2">
                          {profileData.fortune.sources.equipment.map((source, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="text-sm font-mono text-foreground">{source.name}</span>
                              <Badge variant="secondary" className="font-mono">
                                +{source.fortune} ☘
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileData.fortune.sources.accessories.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Accessories</h3>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2 pr-4">
                            {profileData.fortune.sources.accessories.map((source, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-mono text-foreground">{source.name}</span>
                                <Badge variant="secondary" className="font-mono">
                                  +{source.fortune} ☘
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {profileData.fortune.sources.pet && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Pet</h3>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-mono text-foreground">{profileData.fortune.sources.pet.name}</span>
                          <Badge variant="secondary" className="font-mono">
                            +{profileData.fortune.sources.pet.fortune} ☘
                          </Badge>
                        </div>
                      </div>
                    )}

                    {profileData.fortune.total === 0 && (
                      <div className="text-center py-12">
                        <Warning size={48} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground font-body">No farming fortune data available</p>
                        <p className="text-sm text-muted-foreground font-body mt-2">
                          This player may not have any farming equipment equipped
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="equipment">
                <Card className="p-6 border-2 bg-card">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground font-body">
                    <Backpack size={24} weight="fill" className="text-primary" />
                    Equipment
                  </h2>

                  <div className="space-y-6">
                    {profileData.equipment.armor.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Armor</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {profileData.equipment.armor.map((item, i) => {
                            const itemIcon = getEquipmentIcon(item.name)
                            return (
                              <div key={i} className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                                <span className="text-2xl">{getIconEmoji(itemIcon)}</span>
                                <div className="flex-1">
                                  <p className={`text-sm font-mono font-medium ${getRarityColor(item.rarity)}`}>
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                                    {item.rarity}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {profileData.equipment.equipment.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Equipment Slots</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {profileData.equipment.equipment.map((item, i) => {
                            const itemIcon = getEquipmentIcon(item.name)
                            return (
                              <div key={i} className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                                <span className="text-2xl">{getIconEmoji(itemIcon)}</span>
                                <div className="flex-1">
                                  <p className={`text-sm font-mono font-medium ${getRarityColor(item.rarity)}`}>
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                                    {item.rarity}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {profileData.pet && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Active Pet</h3>
                        <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-4">
                          <span className="text-5xl">{getIconEmoji(getPetIcon(profileData.pet.type))}</span>
                          <div className="flex-1">
                            <p className={`font-mono font-semibold text-lg ${getRarityColor(profileData.pet.rarity)}`}>
                              {profileData.pet.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Level {profileData.pet.level} • {profileData.pet.rarity.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {profileData.equipment.armor.length === 0 && 
                     profileData.equipment.equipment.length === 0 && 
                     !profileData.pet && (
                      <div className="text-center py-12">
                        <Backpack size={48} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground font-body">No equipment data available</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {profileData.garden && (
                <TabsContent value="garden">
                  <Card className="p-6 border-2 bg-card">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground font-body">
                      <Plant size={24} weight="fill" className="text-secondary" />
                      Garden Progress
                    </h2>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Garden Level</p>
                          <p className="text-2xl font-bold font-mono text-secondary">
                            {profileData.garden.level}
                          </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Visitors</p>
                          <p className="text-2xl font-bold font-mono text-primary">
                            {profileData.garden.visitors}
                          </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Compost</p>
                          <p className="text-2xl font-bold font-mono text-accent">
                            {formatNumber(profileData.garden.compost)}
                          </p>
                        </div>
                      </div>

                      {profileData.garden.crops.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Crop Milestones</h3>
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-4 pr-4">
                              {profileData.garden.crops.map((crop, i) => {
                                const progress = (crop.harvested / crop.milestone) * 100
                                const cropIcon = getCropIcon(crop.name)
                                return (
                                  <div key={i} className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getIconEmoji(cropIcon)}</span>
                                        <p className="font-mono font-medium text-foreground">{crop.name}</p>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-mono">
                                        {formatNumber(crop.harvested)} / {formatNumber(crop.milestone)}
                                      </p>
                                    </div>
                                    <Progress value={Math.min(progress, 100)} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Milestone {crop.milestone}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.header 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Plant size={56} weight="fill" className="text-secondary" />
            <h1 className="text-4xl md:text-5xl text-primary tracking-tight">
              Skyblock Farming Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground font-body text-lg">
            Analyze farming fortune, equipment, pets, and garden progress
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            {comparisonPlayers && comparisonPlayers.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(true)}
                  className="gap-2"
                >
                  <TrendUp size={20} weight="fill" />
                  View Comparison ({comparisonPlayers.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearComparison}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setShowGuides(true)}
              className="gap-2"
            >
              <Book size={20} weight="fill" />
              Farming Guides
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTesting(true)}
              className="gap-2"
            >
              <Sparkle size={20} weight="fill" />
              API Testing
            </Button>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 border-2 border-primary/20 bg-card/50 backdrop-blur mb-8">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    id="username"
                    placeholder="Enter Minecraft username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="h-12 text-lg font-mono bg-background border-2"
                  />
                </div>
                <Button 
                  onClick={searchPlayer}
                  disabled={loading}
                  size="lg"
                  className="gap-2 px-8"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                      {loadingMessage || 'Searching...'}
                    </>
                  ) : (
                    <>
                      <MagnifyingGlass size={24} weight="bold" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {recentSearches && recentSearches.length > 0 && !playerData && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Recent searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((username) => (
                      <Button
                        key={username}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(username)
                        }}
                        className="font-mono"
                      >
                        {username}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Alert variant="destructive" className="mb-6">
                <Warning size={20} weight="fill" />
                <AlertDescription className="ml-2 font-body">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {loading && !playerData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-8 border-2">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </Card>
            </motion.div>
          )}

          {playerData && !selectedProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 border-2">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <User size={32} weight="fill" className="text-primary" />
                    <h2 className="text-2xl font-semibold text-foreground font-body">
                      {playerData.username}
                    </h2>
                  </div>
                  <p className="text-muted-foreground font-body">
                    Select a profile to analyze
                  </p>
                </div>

                <Separator className="mb-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playerData.profiles.map((profile) => (
                    <motion.div
                      key={profile.profile_id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="p-6 border-2 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30"
                        onClick={() => loadProfile(playerData.uuid, profile)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground font-body mb-1">
                              {profile.cute_name}
                            </h3>
                            {profile.selected && (
                              <Badge variant="secondary" className="gap-1">
                                <Sparkle size={12} weight="fill" />
                                Currently Selected
                              </Badge>
                            )}
                          </div>
                          <Plant size={32} weight="fill" className="text-secondary" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!playerData && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Plant size={80} weight="light" className="text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground font-body mb-2">
              Enter a username to get started
            </p>
            <p className="text-sm text-muted-foreground font-body mb-6">
              Analyze farming fortune, equipment, pets, and garden progress
            </p>
            <Card className="max-w-md mx-auto p-4 bg-muted/30 border-muted">
              <p className="text-xs text-muted-foreground font-body text-left">
                <strong className="text-foreground">Tips:</strong><br />
                • Enter a valid Minecraft Java Edition username<br />
                • Player must have logged into Hypixel Skyblock<br />
                • The app tries multiple APIs for reliability<br />
                • If one fails, it automatically tries another
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App
