import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, CheckCircle, XCircle, Clock, FlaskConical } from '@phosphor-icons/react'
import { fetchMinecraftUUID, fetchSkyblockProfiles } from '@/lib/hypixel-api'


  onClose: () => v

  'Technoblade',
  'Dream',
  'GeorgeNotFou

 

interface TestingPanelProps {
  onClose: () => void
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
              : r
        status: 'pending',
        message: 'Testing...',
        timestamp: Date.now()
         

      try {
        const mojangData = await fetchMinecraftUUID(username)

        try {
          const profiles = await fetchSkyblockProfiles(mojangData.id)
          
          setTestResults(prev => prev.map(result => 
            result.username === username
              API
          </div>
            Test the Hypixel Skybloc

            <Button
              disabled={isRunning}
            >
                <>
            
              ) : (
                  <Flask size={20} weight="fill" />
                </>
            </But
            {testResults.len
                <Badge variant="se
                  {successCount} Passed
                <Badge variant="secon
                 
              </>
          </

          <h3 className="text
          </h3>
            <div className="space-y-3 
               
                    Click 
                </div>
                testResults.map((result, index) => (
               
                    
          
       

                    <div className="flex items-start justify
     

                       
   

          
                      </div>
                        <Badge variant="outline" className="f
                        </Badge>
                    </div>
                    
                      </p>
                    <p classNam
                        ? 'text
             
                    </p>
                ))
            </div>
        </Card>
        <Card className="p-6 border-2 bg-muted/30">
            About This Test
          <ul className="text-xs text-muted-foreground font-body space-y-1">
            <li>• Tests the com
          </ul>
      </div>
  )




















































































































