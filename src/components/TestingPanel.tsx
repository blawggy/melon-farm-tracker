import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Play, CheckCircle, XCircle, Clock } 

import { ArrowLeft, Play, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { fetchMinecraftUUID, fetchSkyblockProfiles } from '@/lib/hypixel-api'

interface TestingPanelProps {
  username: string
c

  'InvalidUser12345678
]
export function TestingPanel({ onClose }:
  const [isRunnin
  const successCoun



      username,
      message: '
    }))

      try {
 

export function TestingPanel({ onClose }: TestingPanelProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length

            : result
      }


  return (
      <div clas
          <Button variant="ghost"
            Back
        </div>
       
            API Testing Panel

          </p>

          <div className="flex items-center justi
              Test Results
            <Button
              disabl
          

                  Running Tests...
              ) : (

                </>
            </Button>

            <div cla
          
                  {successCoun
              </div>
                <p className="text-sm text-muted-
                  {errorCount}
              </div>
          )}
          
       
     

              ) : (
   

          
                          ? 'oklch(0.65 0.15 150
                          ? 'oklch(0.55 0.22 25)'
                    }}
                    <div className="flex items-center justify-between 
                        {result.sta
                
                   
              

                          {result
                      </div>
                        {new 
               
                      result.status === 'success'
                        : result.status === 'error'
              
                 

              )}
          </ScrollArea>

          <h3 className="t
          </h3>
            <li>• T
            <li>• Validates erro
        </Card>
    </div>
}






































































































