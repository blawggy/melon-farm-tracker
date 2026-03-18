# API Testing Documentation

## Test: Player Search with Username 'zptc'

### Purpose
Verify that the Hypixel API integration is working correctly by testing with a known username.

### API Endpoints Used
1. **Mojang API**: `https://api.mojang.com/users/profiles/minecraft/zptc`
   - Fetches the player's UUID from their username
   - Expected response: `{ id: "uuid-without-dashes", name: "zptc" }`

2. **Hypixel Skyblock API**: `https://api.hypixel.net/v2/skyblock/profiles?uuid={uuid}`
   - Fetches all Skyblock profiles for the player
   - No API key required (public endpoint)
   - Expected response: `{ success: true, profiles: [...] }`

### Implementation Details

The app implements the following flow:

```typescript
// Step 1: Fetch UUID from Mojang
fetchMinecraftUUID('zptc')
  ↓
  Mojang API Call
  ↓
  Returns: { id: "player-uuid", name: "zptc" }

// Step 2: Fetch Skyblock Profiles
fetchSkyblockProfiles(uuid)
  ↓
  Hypixel API Call
  ↓
  Returns: { success: true, profiles: [profile1, profile2, ...] }

// Step 3: Parse Profile Data
For each selected profile:
  - parseFarmingFortune() → Calculate total farming fortune
  - parseGarden() → Extract garden level and crop data
  - parseEquipment() → Extract armor and equipment
  - parsePet() → Extract active pet info
```

### Console Output

When searching for 'zptc', the console will display:

```
🔍 Fetching Mojang UUID for: zptc
📡 Request URL: https://api.mojang.com/users/profiles/minecraft/zptc
✅ Mojang API Response Status: 200
📦 Mojang API Response Data: { id: "...", name: "zptc" }
🆔 UUID (formatted): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
🆔 UUID (original): xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

🔍 Fetching Hypixel Skyblock profiles for UUID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
📡 Request URL: https://api.hypixel.net/v2/skyblock/profiles?uuid=...
✅ Hypixel API Response Status: 200
📋 Response Headers: { ... }
📦 Hypixel API Response Data: { success: true, profileCount: X, profileNames: [...] }
✅ Successfully fetched X profile(s)
```

### Error Handling

The implementation handles:

- **404 Player Not Found**: Clear message if username doesn't exist
- **429 Rate Limit**: Retry suggestion with cooldown message
- **Timeout**: 10s timeout for Mojang, 15s for Hypixel
- **No Skyblock Profiles**: Helpful message about enabling API in Hypixel settings
- **Network Errors**: Connection failure detection

### Testing Instructions

1. Open the app in your browser
2. Open browser DevTools (F12) and switch to Console tab
3. Enter username 'zptc' in the search field
4. Click Search button
5. Observe console logs showing the API flow
6. Verify that profile data loads successfully
7. Check that farming fortune, garden data, and equipment display correctly

### Success Criteria

✅ Mojang API returns valid UUID  
✅ Hypixel API returns profile data  
✅ Profile selector displays available profiles  
✅ Profile data loads without errors  
✅ Farming fortune calculated correctly  
✅ Garden data parsed and displayed  
✅ Equipment and pets shown properly  
✅ No console errors during the flow  

### API Reference

Based on the official Hypixel API documentation:
- Repository: https://github.com/HypixelDev/PublicAPI
- Skyblock Profiles Endpoint: `/v2/skyblock/profiles`
- No API key required for basic profile fetching
- Rate limits apply (120 requests per minute globally)

### Notes

- The app uses the public Hypixel API endpoints that don't require authentication
- Player must have API settings enabled in Hypixel for their profiles to be accessible
- UUID is fetched from Mojang first, then used to query Hypixel
- Console logging is comprehensive for debugging and verification
