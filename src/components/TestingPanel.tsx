import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { fetchMinecraftUUID, fetchSkyblockProfiles } from '@/lib/hypixel-api'

interface TestingPanelProps {
  onClose: () => void
}

interface TestResult {
  username: string
  status: 'pending' | 'success' | 'error'
  message: string
  timestamp: number
}

const TEST_USERNAMES = [
  'Technoblade',
  'NotchIsReal',
  'Dream',
  'InvalidUser123456789',
  'GeorgeNotFound'
]

export function TestingPanel({ onClose }: TestingPanelProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const initialResults: TestResult[] = TEST_USERNAMES.map(username => ({
      username,
      status: 'pending' as const,
      message: 'Waiting...',
      timestamp: Date.now()
    }))
    setTestResults(initialResults)

    for (const username of TEST_USERNAMES) {
      try {
        setTestResults(prev => prev.map(result =>
          result.username === username
            ? { ...result, status: 'pending' as const, message: 'Testing...' }
            : result
        ))

        const mojangData = await fetchMinecraftUUID(username)
        const profiles = await fetchSkyblockProfiles(mojangData.id)

        setTestResults(prev => prev.map(result =>
          result.username === username
            ? { ...result, status: 'success' as const, message: `Found ${profiles.length} profile(s)` }
            : result
        ))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setTestResults(prev => prev.map(result =>
          result.username === username
            ? { ...result, status: 'error' as const, message }
            : result
        ))
      }
    }

    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ArrowLeft size={20} />
            Back
          </Button>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl text-primary tracking-tight mb-2">
            API Testing Panel
          </h1>
          <p className="text-muted-foreground font-body">
            Test the Hypixel API with multiple usernames
          </p>
        </header>

        <Card className="p-6 border-2 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground font-body">
              Test Results
            </h2>
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
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
              <div className="px-4 py-2 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Success</p>
                <p className="text-2xl font-bold font-mono text-[color:oklch(0.65_0.15_150)]">
                  {successCount}
                </p>
              </div>
              <div className="px-4 py-2 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold font-mono text-[color:oklch(0.55_0.22_25)]">
                  {errorCount}
                </p>
              </div>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {testResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground font-body">
                    Click "Run Tests" to start testing the API
                  </p>
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg border-2"
                    style={{
                      borderColor:
                        result.status === 'success'
                          ? 'oklch(0.65 0.15 150)'
                          : result.status === 'error'
                          ? 'oklch(0.55 0.22 25)'
                          : 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {result.status === 'pending' && (
                          <Clock size={20} className="text-muted-foreground animate-pulse" />
                        )}
                        {result.status === 'success' && (
                          <CheckCircle size={20} weight="fill" className="text-[color:oklch(0.65_0.15_150)]" />
                        )}
                        {result.status === 'error' && (
                          <XCircle size={20} weight="fill" className="text-[color:oklch(0.55_0.22_25)]" />
                        )}
                        <p className="font-mono font-medium text-foreground">
                          {result.username}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className={`text-sm ${
                      result.status === 'success'
                        ? 'text-[color:oklch(0.65_0.15_150)]'
                        : result.status === 'error'
                        ? 'text-[color:oklch(0.55_0.22_25)]'
                        : 'text-muted-foreground'
                    }`}>
                      {result.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6 border-2 bg-muted/20">
          <h3 className="text-lg font-semibold mb-3 text-foreground font-body">
            About This Test
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2 font-body">
            <li>• Tests multiple API endpoints for player data retrieval</li>
            <li>• Includes valid usernames, invalid usernames, and edge cases</li>
            <li>• Validates error handling and fallback mechanisms</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
