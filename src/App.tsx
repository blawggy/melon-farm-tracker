import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, ChartBar, Clock, Coins, Plant } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface FarmingSession {
  id: string
  melons: number
  timeSpent: number
  pricePerMelon: number
  profit: number
  timestamp: number
}

function App() {
  const [sessions, setSessions] = useKV<FarmingSession[]>('farming-sessions', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [melonCount, setMelonCount] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [melonPrice, setMelonPrice] = useState('1')

  const totalMelons = sessions?.reduce((sum, s) => sum + s.melons, 0) || 0
  const totalProfit = sessions?.reduce((sum, s) => sum + s.profit, 0) || 0
  const totalTime = sessions?.reduce((sum, s) => sum + s.timeSpent, 0) || 0
  const averageMelonsPerHour = totalTime > 0 ? (totalMelons / totalTime) * 60 : 0

  const currentProfit = (parseFloat(melonCount) || 0) * (parseFloat(melonPrice) || 0)

  const handleAddSession = () => {
    const melons = parseFloat(melonCount)
    const time = parseFloat(timeSpent) || 0
    const price = parseFloat(melonPrice)

    if (!melons || melons <= 0) {
      toast.error('Please enter a valid melon count')
      return
    }

    if (!price || price < 0) {
      toast.error('Please enter a valid price')
      return
    }

    const newSession: FarmingSession = {
      id: Date.now().toString(),
      melons,
      timeSpent: time,
      pricePerMelon: price,
      profit: melons * price,
      timestamp: Date.now()
    }

    setSessions(current => [newSession, ...(current || [])])
    setMelonCount('')
    setTimeSpent('')
    setMelonPrice('1')
    setDialogOpen(false)
    toast.success('Session added successfully!')
  }

  const handleDeleteSession = (id: string) => {
    setSessions(current => (current || []).filter(s => s.id !== id))
    toast.success('Session deleted')
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Plant size={40} weight="fill" className="text-primary" />
            <h1 className="text-3xl md:text-4xl text-primary tracking-tight">
              Melon Farm Tracker
            </h1>
          </div>
          <p className="text-muted-foreground font-body">
            Track your Hypixel Skyblock melon farming progress
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 shadow-md border-2 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Plant size={24} weight="fill" className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground font-body">
                  Total Melons
                </span>
              </div>
              <p className="text-3xl font-semibold font-mono text-foreground tabular-nums">
                {formatNumber(totalMelons)}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 shadow-md border-2 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Coins size={24} weight="fill" className="text-accent" />
                <span className="text-sm font-medium text-muted-foreground font-body">
                  Total Profit
                </span>
              </div>
              <p className="text-3xl font-semibold font-mono text-foreground tabular-nums">
                {formatNumber(totalProfit)}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 shadow-md border-2 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <ChartBar size={24} weight="fill" className="text-secondary" />
                <span className="text-sm font-medium text-muted-foreground font-body">
                  Avg/Hour
                </span>
              </div>
              <p className="text-3xl font-semibold font-mono text-foreground tabular-nums">
                {formatNumber(averageMelonsPerHour)}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 shadow-md border-2 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={24} weight="fill" className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground font-body">
                  Sessions
                </span>
              </div>
              <p className="text-3xl font-semibold font-mono text-foreground tabular-nums">
                {sessions?.length || 0}
              </p>
            </Card>
          </motion.div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl text-foreground">
            Farming History
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md">
                <Plus size={20} weight="bold" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-body text-2xl">Add Farming Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="melons" className="font-body">
                    Melons Harvested *
                  </Label>
                  <Input
                    id="melons"
                    type="number"
                    min="0"
                    step="1"
                    value={melonCount}
                    onChange={(e) => setMelonCount(e.target.value)}
                    placeholder="Enter melon count"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="font-body">
                    Time Spent (minutes)
                  </Label>
                  <Input
                    id="time"
                    type="number"
                    min="0"
                    step="1"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    placeholder="Optional"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-body">
                    Price per Melon *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={melonPrice}
                    onChange={(e) => setMelonPrice(e.target.value)}
                    placeholder="Enter price"
                    className="font-mono"
                  />
                </div>
                <Separator />
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground font-body">
                      Estimated Profit:
                    </span>
                    <span className="text-2xl font-semibold font-mono text-accent tabular-nums">
                      {formatNumber(currentProfit)}
                    </span>
                  </div>
                </div>
                <Button onClick={handleAddSession} className="w-full">
                  Add Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 shadow-md border-2">
          {!sessions || sessions.length === 0 ? (
            <div className="text-center py-12">
              <Plant size={64} weight="light" className="text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground font-body mb-2">
                No farming sessions yet
              </p>
              <p className="text-sm text-muted-foreground font-body">
                Click "New Session" to start tracking your melon farm!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                <AnimatePresence>
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 bg-card border hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Plant size={20} weight="fill" className="text-primary" />
                                <span className="font-mono text-lg font-semibold tabular-nums">
                                  {formatNumber(session.melons)}
                                </span>
                                <span className="text-sm text-muted-foreground font-body">
                                  melons
                                </span>
                              </div>
                              {session.timeSpent > 0 && (
                                <>
                                  <Separator orientation="vertical" className="h-5" />
                                  <div className="flex items-center gap-2">
                                    <Clock size={18} weight="fill" className="text-muted-foreground" />
                                    <span className="font-mono text-sm tabular-nums">
                                      {formatTime(session.timeSpent)}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Coins size={18} weight="fill" className="text-accent" />
                                <span className="font-mono font-semibold text-accent tabular-nums">
                                  {formatNumber(session.profit)} coins
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground font-body">
                                @ {session.pricePerMelon} per melon
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-body">
                              {new Date(session.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash size={20} weight="fill" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </div>
  )
}

export default App