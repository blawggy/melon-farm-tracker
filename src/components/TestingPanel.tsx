import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/s
import { fetchMinecraftUUID, fetchSkyblockP
interface TestResult {
  status: 'pending' | 'success' | 'error'
  timestamp: number

interface TestResult {
  username: string
  status: 'pending' | 'success' | 'error'
  message: string
  timestamp: number
  uuid?: string
  profileCount?: number
}

    for (const username of TE
        username,
 

      try {

          const profiles = await fetchSkyblockProfiles(mojangD
          setTestResults(prev => prev.map(result => 
              ? {

                  uuid: mojangData.id,
                }

          setTestResults(prev =>
              ? {
                  stat

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
          
              onClick={onClose}
            >
              Bac
          </div>
          <h1 className="text-3xl md
          </h1>
            Test the Hypixel Skyblock 

            <Butt
              disabled
            
                <>
                  Running Tests...
              ) : (
                 
                </>
            </Button>
            {testResults.length > 0 && (
                <Badge variant="secon
                 
                <Badge
            
         
          </div>

          <h3 className="text-lg font-semibold mb-4 text-foreground f
          </h3>
            <div className
                <div className="
                    Click "Run Test Suite" to start testing
               
                test
          
       

                        ? 'var(--color-destructive)' 
     

                       
   

          
                        )}
                          {result.username}
                      </div>
                        <Badge variant="outline" className="font-m
                    
                    </div>
                      <p classN
                      </p>
             
                        ? 'text-destr
                  
                    <
                

        </Card>
        <Card className="p-6 
            Abo
          <ul className="text-xs text-muted-foreground fo
            <li>• Tests the complete API flow: Mojang UUID lookup → Hypixel
          </ul

  )















              )}
            </Button>

            {testResults.length > 0 && (
              <>
                <Badge variant="secondary" className="gap-2">
                  <CheckCircle size={16} weight="fill" className="text-green-500" />
                  {successCount} Passed
                </Badge>
                <Badge variant="secondary" className="gap-2">
                  <XCircle size={16} weight="fill" className="text-red-500" />
                  {errorCount} Failed
                </Badge>
              </>
            )}
          </div>
        </header>

        <Card className="p-6 border-2 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground font-body">
            Test Results
          </h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {testResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground font-body">
                    Click "Run Test Suite" to start testing
                  </p>
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg border-2"
                    style={{
                      borderColor: result.status === 'success' 
                        ? 'var(--color-secondary)' 
                        : result.status === 'error' 
                        ? 'var(--color-destructive)' 
                        : 'var(--color-muted)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.status === 'pending' && (
                          <Clock size={20} className="text-muted-foreground animate-pulse" />
                        )}
                        {result.status === 'success' && (
                          <CheckCircle size={20} weight="fill" className="text-green-500" />
                        )}
                        {result.status === 'error' && (
                          <XCircle size={20} weight="fill" className="text-red-500" />
                        )}
                        <span className="font-mono font-semibold text-foreground">
                          {result.username}
                        </span>
                      </div>
                      {result.uuid && (
                        <Badge variant="outline" className="font-mono text-xs">
                          UUID: {result.uuid.slice(0, 8)}...
                        </Badge>
                      )}
                    </div>
                    {result.status === 'success' && result.profileCount !== undefined && (
                      <p className="text-sm text-green-500 font-mono">
                        ✓ {result.profileCount} profile(s) found
                      </p>
                    )}
                    <p className={`text-sm font-mono ${
                      result.status === 'error' 
                        ? 'text-destructive' 
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

        <Card className="p-6 border-2 bg-muted/30">
          <h3 className="text-lg font-semibold mb-3 text-foreground font-body">
            About This Test
          </h3>
          <ul className="text-xs text-muted-foreground font-body space-y-1">
            <li>• Includes both valid and invalid usernames to test error handling</li>
            <li>• Tests the complete API flow: Mojang UUID lookup → Hypixel Skyblock profiles</li>
            <li>• Uses the same API calls as the main search functionality</li>
          </ul>
        </Card>
      </div>

  )

