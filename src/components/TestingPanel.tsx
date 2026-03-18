import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, CheckCircle, XCircle, Clock, Flask } from '@phosphor-icons/react'
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

    for (const username of TEST_USERNAMES) {
      setTestResults(prev => [...prev, {
        username,
        status: 'pending',
        message: 'Testing...',
        timestamp: Date.now()
      }])

      try {
        const mojangData = await fetchMinecraftUUID(username)

        try {
          const profiles = await fetchSkyblockProfiles(mojangData.id)
          
          setTestResults(prev => prev.map(result => 
            result.username === username
              ? { ...result, status: 'success', message: `Found ${profiles.length} profile(s)` }
              : result
          ))
        } catch (profileError) {
          setTestResults(prev => prev.map(result => 
            result.username === username
              ? { ...result, status: 'error', message: 'No Skyblock profiles found' }
              : result
          ))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setTestResults(prev => prev.map(result => 
          result.username === username
            ? { ...result, status: 'error', message }
            : result
        ))
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flask size={40} weight="fill" className="text-accent" />
            <div>
              <h1 className="text-3xl md:text-4xl text-primary tracking-tight">
                API Testing
              </h1>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Test the Hypixel Skyblock API connection
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ArrowLeft size={20} />
            Back
          </Button>
        </div>

        <Card className="p-6 border-2 bg-card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground font-body">
              Test Suite
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
                  <Flask size={20} weight="fill" />
                  Run Tests
                </>
              )}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="flex gap-2 mb-6">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle size={16} weight="fill" className="text-green-500" />
                {successCount} Passed
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <XCircle size={16} weight="fill" className="text-destructive" />
                {errorCount} Failed
              </Badge>
            </div>
          )}

          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {testResults.length === 0 && !isRunning && (
                <div className="text-center py-12">
                  <Flask size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-body">
                    Click "Run Tests" to start
                  </p>
                </div>
              )}

              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="p-4 bg-muted/50 rounded-lg border-2 transition-colors"
                  style={{
                    borderColor: result.status === 'success' 
                      ? 'oklch(0.65 0.15 150)' 
                      : result.status === 'error' 
                      ? 'oklch(0.55 0.22 25)' 
                      : 'transparent'
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {result.status === 'pending' && (
                        <Clock size={20} className="text-muted-foreground animate-pulse" />
                      )}
                      {result.status === 'success' && (
                        <CheckCircle size={20} weight="fill" className="text-green-500" />
                      )}
                      {result.status === 'error' && (
                        <XCircle size={20} weight="fill" className="text-destructive" />
                      )}
                      <span className="font-mono font-semibold text-foreground">
                        {result.username}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <p className={`text-sm font-body ${
                    result.status === 'success' 
                      ? 'text-green-500' 
                      : result.status === 'error' 
                      ? 'text-destructive' 
                      : 'text-muted-foreground'
                  }`}>
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6 border-2 bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground font-body mb-3">
            About This Test
          </h3>
          <ul className="text-sm text-muted-foreground font-body space-y-2">
            <li>• Tests the complete API flow from username lookup to profile fetching</li>
            <li>• Includes valid usernames, invalid usernames, and edge cases</li>
            <li>• Tests fallback mechanisms when primary APIs fail</li>
            <li>• Validates error handling for non-existent players</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
