import { useState } from 'react'
import { Button } from '@/components/ui/but
import { ScrollArea } from '@/components/ui/scr
import { fetchMinecraftUUID, fetchSkyblockPro
interface TestResult {
  status: 'pending' | 'success' | 'error'
  uuid?: string

interface TestResult {
  username: string
  status: 'pending' | 'success' | 'error'
  message: string
  uuid?: string
  profileCount?: number
  timestamp: number
}

  'InvalidUser123456789'
]
export fun
  const [
  const ru
    setTestResu
    for (co
        us
        mes
      }])
      try
 

          setTestResults(prev => prev.map(result => 
              ? {
                  status: 'success',

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
  const errorCount = testResults.f

    <div className="min-h-screen bg-b
        <header c
            <div class
            
         
            <Button var
            </Button>
          <p className="text-muted-foreground font-body">
          </p>

          <div className="flex i
              Test Suite
            <Bu
              disabl
          
       

              ) : (
     

            </Button>


                <CheckCircle size={16} weight="fill" className="text-green-50
              </Badge>
                <XCircle size={16} weight="fill" className="text-red-500" />

          
              </Badge>
          )}

          <h3 className="text-lg font-semibold mb-4 text-foregroun
          </h3>
            <div className="space-y-3 pr-4">
                <div className="text-center py-12">
                  <p className="t
                  <
              ) : 
                  <div
                   
                    <
                
                      {result.status === 'success' && (
                      )}
              
                 

                          {result.u
                        {result.status === 'success' && (
                            {result.profileCount} profile(s)
                        
                 
                    
                          ? 'text
                      }`}>
                      </p>
             
                        </p>
                  
                ))
            </div>
        </Card>
        <Card class
            About 
          <ul className="text-xs text-muted-foreground fon
            <li>• Includes both
            <li>• T
          </ul>
      </div>
  )


































































































