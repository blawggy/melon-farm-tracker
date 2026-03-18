# Planning Guide

A Hypixel Skyblock farming analyzer that provides detailed stats tracking for farming fortune, equipment, pets, and garden progression using the official Hypixel API.

**Experience Qualities**: 
1. **Data-driven** - Real-time fetching of player stats from official Hypixel and Mojang APIs provides accurate, up-to-date farming information
2. **Comprehensive** - Displays all farming-related stats including fortune breakdown, equipment, pets, and garden progress with emoji icons
3. **Game-authentic** - Visual design mirrors Minecraft's aesthetic with blocky elements and familiar Skyblock color schemes

## Essential Features

### Player Search
- **Functionality**: Search for Minecraft players by username
- **Purpose**: Find and analyze any player's Skyblock farming statistics
- **Trigger**: Enter username and click search button
- **Progression**: Enter username → Click search → Fetch player UUID from Mojang API (with fallbacks) → Fetch Skyblock profiles from third-party APIs → Display profile selection
- **Success criteria**: Successfully fetches real player data, handles errors gracefully, uses fallback APIs for reliability
- **API Strategy**: Multiple fallback APIs to ensure reliability:
  - **Mojang UUID APIs** (tried in order):
    - Mojang Official: `https://api.mojang.com/users/profiles/minecraft/{username}`
    - Ashcon: `https://api.ashcon.app/mojang/v2/user/{username}`
    - PlayerDB: `https://playerdb.co/api/player/minecraft/{username}`
  - **Skyblock Profile APIs** (tried in order):
    - Sky.shiiyu.moe: `https://sky.shiiyu.moe/api/v2/profile/{uuid}`
    - SkyCrypt: `https://sky.lea.moe/api/v2/profile/{uuid}`
    - Hypixel API Proxy: `https://hypixel-api-proxy.herokuapp.com/api/v2/skyblock/profiles?uuid={uuid}`
  - Note: Direct Hypixel API access requires authentication keys, so we use community-maintained APIs and proxies

### Fortune Breakdown
- **Functionality**: Calculate and display total farming fortune from all sources
- **Purpose**: Help players understand where their fortune comes from and what to optimize
- **Trigger**: Automatically loads after profile selection
- **Progression**: Profile data → Parse armor items → Parse equipment → Parse accessories → Parse pet → Calculate total fortune → Display breakdown
- **Success criteria**: Accurate fortune calculations from real Hypixel data

### Equipment Display
- **Functionality**: Display active farming pet with level, rarity, and fortune contribution
- **Purpose**: Visual representation of farming gear setup
- **Trigger**: Part of profile data display
- **Progression**: Profile data → Extract armor pieces → Extract equipment slots → Extract held items → Display with item names, enchantments, and rarities
- **Success criteria**: Correctly parses item data from Hypixel API

### Garden & Greenhouse Progress
- **Functionality**: Show garden level, crop milestones, visitors, and compost
- **Purpose**: Track overall farming progression in the garden
- **Trigger**: Automatically loads after profile selection (if player has garden data)
- **Progression**: Profile data → Parse garden experience → Calculate garden level → Extract crop data → Display progress bars
- **Success criteria**: Accurate garden statistics from real API data

### Player Comparison
- **Functionality**: Compare multiple players' farming stats side-by-side
- **Purpose**: Benchmark performance against friends or top farmers
- **Trigger**: Click "Add to Comparison" button on any loaded profile
- **Progression**: Load profiles → Add to comparison → View comparison table → Sort by different metrics
- **Success criteria**: Persistent comparison data, easy to add/remove players

### Farming Guides
- **Functionality**: Create, edit, and manage custom farming plot guides with full markdown support
- **Purpose**: Help players document their farming setups and strategies
- **Trigger**: Click "Farming Guides" button from main page or navigation
- **Progression**: View guides → Create new guide → Edit content in markdown → Save → Preview rendered markdown
- **Success criteria**: Guides persist between sessions, markdown renders correctly

## Edge Case Handling
- **Invalid Username**: Display clear error message when player not found via Mojang API fallback chain
- **No Skyblock Profiles**: Show helpful message when player has no Skyblock profiles across all API sources
- **Multiple Profiles**: Allow user to select which profile to analyze
- **Missing Data**: Handle incomplete profile data (no garden, no pets, missing equipment) with fallback displays
- **API Timeout**: Automatic timeout per API (8-15s) with fallback to next API in chain
- **API Rate Limiting**: Automatically try next API when rate limited, show user-friendly message only if all APIs fail
- **All APIs Down**: Show clear message when all fallback APIs are unavailable
- **Empty Guides**: Show helpful empty state when no guides exist with prompt to create first guide
- **Markdown Errors**: Render markdown safely, sanitize potentially dangerous HTML
- **Guide Deletion**: Require confirmation before deleting guides to prevent accidental loss
## Color Selection
- **Primary Color**: Skyblock Gold (oklch(0.65 0.15 85)) - Represents wealth 
  - Deep Forest Green (oklch(0.45 0.12 150)
- **Accent Color**: Bright Aqua (oklch(0.70 0.15 200)) - Eye-catching highlight for farming fortune numbers and CTAs
  - Background (Dark Slate oklch(0.18 0.02 240)): Light Text (oklch(0.95 0.01 240)) - Ratio 12.5:1 ✓

### Garden & Greenhouse Progress
The typefaces should feel professional yet playful to match Minecraft's aesthetic while remaining hi
- **Purpose**: Shows overall farming progression in the garden update
  - H2 (Section Headers): Inter Semibold/24
  - Stats (Large Numbers): JetBrains Mono Bold/32px/tabular numbers - Fortune values stand out
  - Item Names: JetBrains Mono/14px/medium weight - Consistent with game's item display

Animations should feel 
- **Functionality**: Create, edit, and manage custom farming plot guides with full markdown support
- Fortune breakdown animates in with progressive reveal of each source
- **Trigger**: Click "Farming Guides" button from main page or navigation
- Loading spinners use Minecraft-inspired rotation
## Component Selection

### Player Comparison
  - Badge (for rarity tiers, levels) - Color-coded for Common/Uncommon/Rare/Epi
- **Purpose**: Benchmark performance against friends or top farmers
  - Tabs (for switching between equipment/pets/garden) - Organize profile sections
  - Alert (for errors and API issues) - Clear error messaging


  - Fortune breakdown
  - Profile card selector with cute profile name display
- **States**: 
- **No Skyblock Profiles**: Show helpful message when player has no Skyblock profiles
- **Multiple Profiles**: Allow user to select which profile to analyze
- **Missing Data**: Handle incomplete profile data (no garden, no pets, missing equipment) with fallback displays
- **API Timeout**: Show loading state with timeout fallback after 10 seconds
- **Offline API**: Display cached data if available, otherwise show service unavailable message
- **Empty Guides**: Show helpful empty state when no guides exist with prompt to create first guide
- **Markdown Errors**: Render markdown safely, sanitize potentially dangerous HTML
- **Guide Deletion**: Require confirmation before deleting guides to prevent accidental loss

## Design Direction
The design should evoke the nostalgic, blocky charm of Minecraft with a farming and data-analysis focus. Players should feel like this is a premium stat-tracking tool that could exist within Hypixel Skyblock, incorporating the game's signature greens, golds, and Skyblock menu aesthetics while presenting complex data in an easily digestible format.

## Color Selection

- **Primary Color**: Skyblock Gold (oklch(0.65 0.15 85)) - Represents wealth and progression in Skyblock, used for headers and key stats
- **Secondary Colors**: 
  - Deep Forest Green (oklch(0.45 0.12 150)) - Represents farming and garden content
  - Rich Purple (oklch(0.50 0.18 300)) - Epic/legendary rarity color for special items
- **Accent Color**: Bright Aqua (oklch(0.70 0.15 200)) - Eye-catching highlight for farming fortune numbers and CTAs
- **Foreground/Background Pairings**: 
  - Background (Dark Slate oklch(0.18 0.02 240)): Light Text (oklch(0.95 0.01 240)) - Ratio 12.5:1 ✓
  - Primary (Skyblock Gold oklch(0.65 0.15 85)): Dark Text (oklch(0.15 0.02 85)) - Ratio 8.2:1 ✓
  - Accent (Bright Aqua oklch(0.70 0.15 200)): Dark Text (oklch(0.15 0.02 200)) - Ratio 9.8:1 ✓
  - Card (Darker Slate oklch(0.22 0.02 240)): Light Text (oklch(0.95 0.01 240)) - Ratio 11.1:1 ✓

## Font Selection
The typefaces should feel professional yet playful to match Minecraft's aesthetic while remaining highly readable for complex stat displays and data tables.

- **Typographic Hierarchy**: 
  - H1 (App Title): Bungee Bold/36px/tight letter spacing - Bold presence for main header
  - H2 (Section Headers): Inter Semibold/24px/normal letter spacing - Clear section delineation
  - H3 (Subsections): Inter Medium/18px/normal letter spacing - Equipment and stat categories
  - Stats (Large Numbers): JetBrains Mono Bold/32px/tabular numbers - Fortune values stand out
  - Body Text: Inter/16px/normal weight/relaxed line height - Descriptions and labels
  - Item Names: JetBrains Mono/14px/medium weight - Consistent with game's item display
  - Small Labels: Inter/12px/medium weight - Secondary information

## Animations
Animations should feel smooth and purposeful, guiding the user through data loading and highlighting important stats without being distracting.

- Profile data fades in with staggered children for each stat section
- Search box has subtle pulse animation while loading
- Fortune breakdown animates in with progressive reveal of each source
- Hover states on equipment items show tooltip with smooth fade-in
- Profile selection cards scale slightly on hover
- Error messages shake gently to draw attention
- Loading spinners use Minecraft-inspired rotation

## Component Selection

- **Components**: 
  - Card (for equipment display, stats panels, profile sections) - Organized content areas with dark theme
  - Button (for search, profile selection) - Primary for main actions, ghost for secondary
  - Input (for username search) - With loading state and validation
  - Badge (for rarity tiers, levels) - Color-coded for Common/Uncommon/Rare/Epic/Legendary/Mythic
  - Separator (between stat sections) - Visual organization
  - ScrollArea (for long lists like accessories) - Smooth scrolling
  - Progress (for garden crop progress) - Visual crop milestone indicators
  - Tabs (for switching between equipment/pets/garden) - Organize profile sections
  - Skeleton (for loading states) - Shimmer effect while fetching data
  - Alert (for errors and API issues) - Clear error messaging
  - Tooltip (for item details on hover) - Shows enchantments and detailed stats

- **Customizations**: 
  - Custom rarity badge colors matching Skyblock (gray/green/blue/purple/gold/red/magenta)
  - Equipment slot grid display with item icons
  - Fortune breakdown with source categorization
  - Garden level progress with crop-specific icons
  - Profile card selector with cute profile name display

- **States**: 
  - Buttons: Default (solid with glow), Hover (brighten + scale 102%), Active (scale 98%), Loading (spinner), Disabled (dimmed)
  - Inputs: Default (border), Focus (glow ring in primary color), Error (red border + shake), Success (green checkmark)
  - Cards: Default (subtle shadow), Hover (lift + glow for interactive), Loading (skeleton overlay)



  - MagnifyingGlass for search

  - Sword/Shield for equipment

  - Plant/Leaf/FlowerLotus for garden/crops

  - ChartBar for statistics

  - Package/Backpack for inventory items

  - Coins for economy values
  - Book/BookOpen for guides library
  - Pencil for editing guides
  - Eye for preview mode
  - Star for favoriting guides

  - TrendUp for comparison view
  - Plus for creating new items
  - ArrowLeft for navigation back

- **Spacing**: 
  - Container padding: p-8 on desktop, p-4 on mobile
  - Card gaps: gap-6 for main sections, gap-4 for subsections

  - Grid layouts: gap-4 for equipment grids
  - Stat displays: gap-2 for tight number+label pairs


  - Search bar remains prominent at top

  - Stats cards stack vertically on mobile

  - Touch targets 44px minimum
  - Reduced font sizes (H1 to 28px, body to 14px)
  - Bottom padding increased for thumb-friendly scrolling
