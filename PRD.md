# Planning Guide

**Experience Qualities**: 



- **Functionality**: Search for Minecraft players by username
- **Trigger**: Enter username and click search button

  - **Mojang UUID API

  - **Skyblock Pr
    - SkyCrypt: `https://sky.lea.moe/api/v2/profile/{uuid}`
  - Note: Direct Hypixel API access requires authentication keys, so we 
### Fortune Breakdown
- **Purpose**: Help players understand where their fortune comes from and what to optimize
- **Progression**: Profile data → Parse armor items → Parse equipment → Parse accessories → Parse pet → Calculate total fort

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
- **Functionality**: Create, edit, and mana
- **Progression**: Profile data → Extract armor pieces → Extract equipment slots → Extract held items → Display with item names, enchantments, and rarities
- **Success criteria**: Correctly parses item data from Hypixel API

## Edge Case Handling
- **Functionality**: Show garden level, crop milestones, visitors, and compost
- **Purpose**: Track overall farming progression in the garden
- **Trigger**: Automatically loads after profile selection (if player has garden data)
- **Progression**: Profile data → Parse garden experience → Calculate garden level → Extract crop data → Display progress bars
- **Success criteria**: Accurate garden statistics from real API data

### Player Comparison
- **Primary Color**: Skyblock Gold (oklch(0.65 0.15 85)) - Represents wea
- **Purpose**: Benchmark performance against friends or top farmers
  - Background (Dark Slate oklch(0.18 0.02 240)): Light Text (oklch(0
- **Progression**: Load profiles → Add to comparison → View comparison table → Sort by different metrics
- **Success criteria**: Persistent comparison data, easy to add/remove players

  - Stats (Large N
- **Functionality**: Create, edit, and manage custom farming plot guides with full markdown support
Animations should feel 
- **Trigger**: Click "Farming Guides" button from main page or navigation
- **Progression**: View guides → Create new guide → Edit content in markdown → Save → Preview rendered markdown
- **Success criteria**: Guides persist between sessions, markdown renders correctly

## Edge Case Handling
- **Purpose**: Benchmark performance against friends or top farmers
- **No Skyblock Profiles**: Show helpful message when player has no Skyblock profiles

- **Missing Data**: Handle incomplete profile data (no garden, no pets, missing equipment) with fallback displays
- **API Timeout**: Show loading state with timeout fallback after 10 seconds
- **API Rate Limiting**: Show user-friendly message when Hypixel API rate limit is hit
- **Empty Guides**: Show helpful empty state when no guides exist with prompt to create first guide
- **Markdown Errors**: Render markdown safely, sanitize potentially dangerous HTML
- **Guide Deletion**: Require confirmation before deleting guides to prevent accidental loss
## Color Selection: Handle incomplete profile data (no garden, no pets, missing equipment) with fallback displays
- **Primary Color**: Skyblock Gold (oklch(0.65 0.15 85)) - Represents wealth 
  - Deep Forest Green (oklch(0.45 0.12 150)
- **Accent Color**: Bright Aqua (oklch(0.70 0.15 200)) - Eye-catching highlight for farming fortune numbers and CTAs
  - Background (Dark Slate oklch(0.18 0.02 240)): Light Text (oklch(0.95 0.01 240)) - Ratio 12.5:1 ✓
- **Guide Deletion**: Require confirmation before deleting guides to prevent accidental loss
### Garden & Greenhouse Progress
The typefaces should feel professional yet playful to match Minecraft's aesthetic while remaining hi
- **Purpose**: Shows overall farming progression in the garden update a farming and data-analysis focus. Players should feel like this is a premium stat-tracking tool that could exist within Hypixel Skyblock, incorporating the game's signature greens, golds, and Skyblock menu aesthetics while presenting complex data in an easily digestible format.
  - H2 (Section Headers): Inter Semibold/24
  - Stats (Large Numbers): JetBrains Mono Bold/32px/tabular numbers - Fortune values stand out
  - Item Names: JetBrains Mono/14px/medium weight - Consistent with game's item display
- **Primary Color**: Skyblock Gold (oklch(0.65 0.15 85)) - Represents wealth and progression in Skyblock, used for headers and key stats
Animations should feel  
- **Functionality**: Create, edit, and manage custom farming plot guides with full markdown support
- Fortune breakdown animates in with progressive reveal of each source
- **Trigger**: Click "Farming Guides" button from main page or navigation
- Loading spinners use Minecraft-inspired rotation
## Component Selection 12.5:1 ✓

### Player Comparison
  - Badge (for rarity tiers, levels) - Color-coded for Common/Uncommon/Rare/Epi - Ratio 11.1:1 ✓
- **Purpose**: Benchmark performance against friends or top farmers
  - Tabs (for switching between equipment/pets/garden) - Organize profile sections
  - Alert (for errors and API issues) - Clear error messagingsplays and data tables.


  - Fortune breakdown
  - Profile card selector with cute profile name displayter spacing - Clear section delineation
- **States**: 18px/normal letter spacing - Equipment and stat categories
  - Body Text: Inter/16px/normal weight/relaxed line height - Descriptions and labels
  - Item Names: JetBrains Mono/14px/medium weight - Consistent with game's item display
  - Small Labels: Inter/12px/medium weight - Secondary information

- **Offline API**: Display cached data if available, otherwise show service unavailable message
Animations should feel smooth and purposeful, guiding the user through data loading and highlighting important stats without being distracting.

- **Guide Deletion**: Require confirmation before deleting guides to prevent accidental loss

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
