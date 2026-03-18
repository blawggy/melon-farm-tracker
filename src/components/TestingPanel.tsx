import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Play, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { fetchMinecraftUUID, fetchSkyblockProfiles } from '@/lib/hypixel-api'

interface TestingPanelProps {
  onClose: () => void
}

interface TestResult {
  username: string
  message: string
  status: 'pending' | 'success' | 'error'
  timestamp: number
  details?: string
}

export function TestingPanel({ onClose }: TestingPanelProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length

  const testUsernames = [
    'Technoblade',
    'Refraction',
    'ThirtyVirus',
    'InvalidUser12345678',
    'a',
  ]

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])

    for (const username of testUsernames) {
      setTestResults(prev => [...prev, {
        username,
        message: 'Testing...',
        status: 'pending',
        timestamp: Date.now()
      }])

      try {
        const mojangData = await fetchMinecraftUUID(username)
        const profiles = await fetchSkyblockProfiles(mojangData.id)

        setTestResults(prev => prev.map(result =>
          result.username === username && result.status === 'pending'
            ? {
                ...result,
                status: 'success',
                message: `✓ Found ${mojangData.name} with ${profiles.length} profile(s)`,
                details: `UUID: ${mojangData.id}`
              }
            : result
        ))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setTestResults(prev => prev.map(result =>
          result.username === username && result.status === 'pending'
            ? {
                ...result,
                status: 'error',
                message: `✗ Failed: ${message}`,
                details: error instanceof Error ? error.stack : undefined
              }
            : result
        ))
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ArrowLeft size={20} />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">API Testing Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Test the Minecraft & Hypixel API fallback system
            </p>
          </div>
        </div>

        <Card className="p-6 border-2 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Test Results</h2>
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Clock size={20} className="animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play size={20} weight="fill" />
                  Run Tests
                </>
              )}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} weight="fill" className="text-[color:var(--color-uncommon)]" />
                <p className="text-sm text-muted-foreground">
                  Success: <span className="font-bold text-foreground">{successCount}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XCircle size={20} weight="fill" className="text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Failed: <span className="font-bold text-foreground">{errorCount}</span>
                </p>
              </div>
            </div>
          )}

          <Separator className="mb-4" />

          <ScrollArea className="h-[500px]">
            {testResults.length === 0 ? (
              <div className="text-center py-12">
                <Play size={48} weight="light" className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Click "Run Tests" to start testing the API</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border-2 transition-all"
                    style={{
                      borderColor:
                        result.status === 'success'
                          ? 'oklch(0.65 0.15 150)'
                          : result.status === 'error'
                          ? 'oklch(0.55 0.22 25)'
                          : 'oklch(0.30 0.02 240)',
                      backgroundColor:
                        result.status === 'success'
                          ? 'color-mix(in oklch, oklch(0.65 0.15 150) 10%, transparent)'
                          : result.status === 'error'
                          ? 'color-mix(in oklch, oklch(0.55 0.22 25) 10%, transparent)'
                          : 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.status === 'pending' && (
                          <Clock size={20} className="text-muted-foreground animate-spin" />
                        )}
                        {result.status === 'success' && (
                          <CheckCircle size={20} weight="fill" className="text-[color:var(--color-uncommon)]" />
                        )}
                        {result.status === 'error' && (
                          <XCircle size={20} weight="fill" className="text-destructive" />
                        )}
                        <span className="font-mono font-semibold text-foreground">
                          {result.username}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p
                      className="text-sm font-mono"
                      style={{
                        color:
                          result.status === 'success'
                            ? 'oklch(0.65 0.15 150)'
                            : result.status === 'error'
                            ? 'oklch(0.55 0.22 25)'
                            : 'var(--muted-foreground)'
                      }}
                    >
                      {result.message}
                    </p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {result.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="p-6 border-2 bg-muted/30">
          <h3 className="text-lg font-semibold mb-3 text-foreground">About This Test</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Tests multiple Minecraft username lookup APIs with fallback</li>
            <li>• Validates error handling for invalid usernames</li>
            <li>• Tests Hypixel Skyblock profile fetching</li>
            <li>• Includes timeout handling (8s for UUID, 15s for profiles)</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
