import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, XCircle, Clock, Flask } from '@phosphor-icons/react'
import { fetchMinecraftUUID, fetchSkyblockProfiles } from '@/lib/hypixel-api'

interface TestResult {
  username: string
  status: 'pending' | 'success' | 'error'
  message: string
  uuid?: string
  profileCount?: number
  timestamp: number
}

const TEST_USERNAMES = [
  'Technoblade',
  'Notch',
  'jeb_',
  'Dream',
  'TommyInnit',
  'Philza',
  'Tubbo',
  'Ranboo',
  'InvalidUser123456789',
  'test',
]

export function TestingPanel({ onClose }: { onClose: () => void }) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

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
            result.username === username && result.status === 'pending'
              ? {
                  ...result,
                  status: 'success',
                  message: `Found ${profiles.length} profile(s)`,
                  uuid: mojangData.id,
                  profileCount: profiles.length
                }
              : result
          ))
        } catch (profileError) {
          setTestResults(prev => prev.map(result => 
            result.username === username && result.status === 'pending'
              ? {
                  ...result,
                  status: 'error',
                  message: profileError instanceof Error ? profileError.message : 'Failed to fetch profiles',
                  uuid: mojangData.id
                }
              : result
          ))
        }
      } catch (error) {
        setTestResults(prev => prev.map(result => 
          result.username === username && result.status === 'pending'
            ? {
                ...result,
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
              }
            : result
        ))
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length
  const pendingCount = testResults.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Flask size={40} weight="fill" className="text-accent" />
              <h1 className="text-3xl md:text-4xl text-primary tracking-tight">
                API Testing Panel
              </h1>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          <p className="text-muted-foreground font-body">
            Test the Hypixel API integration with various Minecraft usernames
          </p>
        </header>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
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
                  Run All Tests
                </>
              )}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="flex gap-4 mb-4">
              <Badge variant="secondary" className="gap-2">
                <CheckCircle size={16} weight="fill" className="text-green-500" />
                Success: {successCount}
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <XCircle size={16} weight="fill" className="text-red-500" />
                Failed: {errorCount}
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <Clock size={16} weight="fill" className="text-yellow-500" />
                Pending: {pendingCount}
              </Badge>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground font-body">
            Test Results
          </h3>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {testResults.length === 0 ? (
                <div className="text-center py-12">
                  <Flask size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-body">
                    Click "Run All Tests" to start
                  </p>
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg flex items-start gap-4"
                  >
                    <div className="mt-1">
                      {result.status === 'pending' && (
                        <Clock size={24} weight="fill" className="text-yellow-500 animate-pulse" />
                      )}
                      {result.status === 'success' && (
                        <CheckCircle size={24} weight="fill" className="text-green-500" />
                      )}
                      {result.status === 'error' && (
                        <XCircle size={24} weight="fill" className="text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-foreground">
                          {result.username}
                        </span>
                        {result.status === 'success' && (
                          <Badge variant="outline" className="text-xs">
                            {result.profileCount} profile(s)
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${
                        result.status === 'error' 
                          ? 'text-red-400' 
                          : result.status === 'success'
                          ? 'text-green-400'
                          : 'text-muted-foreground'
                      }`}>
                        {result.message}
                      </p>
                      {result.uuid && (
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          UUID: {result.uuid}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-4 mt-6 bg-muted/30 border-muted">
          <h3 className="text-sm font-semibold mb-2 text-foreground font-body">
            About This Test
          </h3>
          <ul className="text-xs text-muted-foreground font-body space-y-1">
            <li>• Tests {TEST_USERNAMES.length} different Minecraft usernames</li>
            <li>• Includes both valid and invalid usernames</li>
            <li>• Uses multiple fallback APIs (Mojang, Ashcon, PlayerDB)</li>
            <li>• Tests Hypixel Skyblock profile fetching</li>
            <li>• Expected: Some users may not have Skyblock profiles</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
