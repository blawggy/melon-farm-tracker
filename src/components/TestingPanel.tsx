import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui
import { fetchMinecraftUUID, fetchSkyblockPro
interface TestingPanelProps {
}
interface TestResult {

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
      awai

        const mojangData = await fetchMinecraftUUID(username)
        const profiles = await fetchSkyblockProfiles(mojangData.id)

        setTestResults(prev => prev.map(result =>
          result.username === username
            ? { ...result, status: 'success' as const, message: `Found ${profiles.length} profile(s)` }
            : result
        ))
            </h2>
              onClick={runTests}
              className="gap-2"
              {isRunning ? (
            ? { ...result, status: 'error' as const, message }
                </>
          
       

          </div>
     

                {succes
   

          

            <div className="space-y-3 pr-4">
                <div className="text-center py-12">
                  <p className="text-muted-foregrou
                  </p>
              )}
              {testResults.map((result, index) => (
                  key={inde
                  s
                      ? 'oklch(0.65 0.15 150)' 
                      ? 'oklch(0.55 0.22 25)' 
                  
                  
                
                      )}
                        <CheckCircl
                
                   
              

                      {new Date(result.timestamp).to
                  </div>
                    result.status === 'success' 
                      : 
                 
                   
                </div>
            </div>
        </Card>
        <Card
            About This Test
          <ul clas
            <li>• Includes valid usernames, invalid usernames, and edge cases</li>
            <li>• Validates error 
        </Card>
    </div>
}




























































































