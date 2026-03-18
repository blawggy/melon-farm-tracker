# Planning Guide

A Minecraft Hypixel Skyblock farming analyzer that fetches real player data from the Hypixel API to display farming fortune for melons, pets, armor, equipment, garden levels, and greenhouse progress.

**Experience Qualities**: 
1. **Data-driven** - Real-time fetching of player stats from Hypixel API provides accurate, up-to-date farming information
2. **Comprehensive** - Displays all farming-related stats including fortune breakdown, equipment, pets, and garden progress
3. **Game-authentic** - Visual design mirrors Minecraft's aesthetic with blocky elements and familiar Skyblock color schemes

**Complexity Level**: Complex Application (advanced functionality with API integration and multiple views)
  - The app fetches data from external APIs, parses complex nested Skyblock profile data, calculates farming fortune from multiple sources, and displays comprehensive player statistics

## Essential Features

### Player Search
- **Functionality**: Search for any Hypixel Skyblock player by username with autocomplete and recent searches
- **Purpose**: Entry point to analyze any player's farming stats
- **Trigger**: User enters username in search field on homepage
- **Progression**: Enter username → Click search → Fetch player UUID from Mojang API → Fetch Skyblock profiles from Hypixel API → Display profile selector if multiple profiles → Load profile data view
- **Success criteria**: Successful API calls, error handling for invalid usernames, loading states during fetch, recent searches persist
- **API Endpoints**:
  - Mojang UUID: `https://api.mojang.com/users/profiles/minecraft/{username}`
  - Hypixel Profiles: `https://api.hypixel.net/v2/skyblock/profiles?uuid={uuid}` (no API key required)
- **Test Cases**: 
  - Verified with username 'zptc' - app successfully fetches UUID and Skyblock profiles
  - Console logs track: UUID fetch → Profile fetch → Data parsing → Display rendering

### Farming Fortune Breakdown
- **Functionality**: Calculate and display total farming fortune for melons from all sources (armor, equipment, pets, accessories, enchantments)
- **Purpose**: Shows players exactly where their farming fortune comes from and how to optimize
- **Trigger**: Automatically loads after profile selection
- **Progression**: Profile loaded → Parse armor items → Parse equipment items → Parse pet data → Parse accessory bag → Calculate fortune from each source → Display categorized breakdown with totals
- **Success criteria**: Accurate fortune calculations, handles missing items gracefully, displays item names and fortune values, shows total farming fortune

### Equipment Display
- **Functionality**: Display player's farming armor set, equipment, and held items with stats
- **Purpose**: Visual representation of farming gear setup
- **Trigger**: Part of profile data display
- **Progression**: Profile data → Extract armor pieces → Extract equipment slots → Extract held items → Display with item names, enchantments, and fortune contributions
- **Success criteria**: Shows all 4 armor pieces, equipment slots (necklace, cloak, belt, gloves), displays enchantments, handles missing items

### Pet Analyzer
- **Functionality**: Display active farming pet with level, rarity, and fortune contribution
- **Purpose**: Shows which pet is being used for farming and its stat bonuses
- **Trigger**: Part of profile data display
- **Progression**: Profile data → Find active pet → Extract pet stats → Calculate farming fortune from pet → Display pet icon, level, rarity, and fortune bonus
- **Success criteria**: Identifies active pet correctly, shows pet progression, calculates fortune accurately

### Garden & Greenhouse Progress
- **Functionality**: Display garden level, plot unlocks, visitor milestones, and greenhouse progress
- **Purpose**: Shows overall farming progression in the garden update
- **Trigger**: Part of profile data display
- **Progression**: Profile data → Extract garden data → Parse crop milestones → Parse visitor completions → Display garden level, unlocked plots, crop progress bars → Extract greenhouse data → Display greenhouse status
- **Success criteria**: Accurate garden level calculation, shows all crops with progress, displays visitor milestones, greenhouse level and upgrades

### Farming Plot Guides
- **Functionality**: Create, edit, and manage custom farming plot guides with full markdown support
- **Purpose**: Allow users to document farming strategies, plot layouts, and optimization tips for different crops
- **Trigger**: Click "Farming Guides" button from main page or navigation
- **Progression**: Access guides view → Browse existing guides → Create new guide → Enter title and plot type → Write content using markdown editor → Preview formatted content → Save guide → Star important guides → Edit or delete guides as needed
- **Success criteria**: Guides persist between sessions, markdown renders correctly with proper styling, users can organize guides by plot type, starred guides appear at top, smooth edit/preview toggle, search and filter functionality

### Player Comparison
- **Functionality**: Compare farming stats across multiple players side-by-side
- **Purpose**: Benchmark performance against friends or top farmers
- **Trigger**: Add player to comparison from profile view, then access comparison view
- **Progression**: View player profile → Click "Add to Comparison" → Repeat for other players → Click "View Comparison" → See side-by-side stats → Sort by fortune, garden level, or visitors → Identify top performers → Remove players as needed
- **Success criteria**: Supports multiple players, visual indicators for top stats, maintains comparison list between sessions, clear ranking display, easy player removal

## Edge Case Handling
- **Invalid Username**: Display clear error message when player not found or doesn't play Skyblock
- **API Rate Limits**: Handle 429 responses gracefully with retry suggestions and cooldown messaging
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
  - Badges: Static color-coded display based on rarity tier

- **Icon Selection**: 
  - MagnifyingGlass for search
  - User/UserCircle for player profiles
  - Sword/Shield for equipment
  - PawPrint for pets
  - Plant/Leaf/FlowerLotus for garden/crops
  - Sparkles for fortune/enchantments
  - ChartBar for statistics
  - Trophy for milestones
  - Package/Backpack for inventory items
  - Lightning for farming speed stats
  - Coins for economy values
  - Book/BookOpen for guides library
  - Pencil for editing guides
  - Eye for preview mode
  - Star for favoriting guides
  - FloppyDisk for saving
  - TrendUp for comparison view
  - Plus for creating new items
  - ArrowLeft for navigation back

- **Spacing**: 
  - Container padding: p-8 on desktop, p-4 on mobile
  - Card gaps: gap-6 for main sections, gap-4 for subsections
  - Section margins: mb-12 between major sections, mb-6 for subsections
  - Grid layouts: gap-4 for equipment grids
  - Stat displays: gap-2 for tight number+label pairs

- **Mobile**: 
  - Search bar remains prominent at top
  - Equipment grid adapts from 4-column to 2-column to single column
  - Stats cards stack vertically on mobile
  - Profile selector switches to vertical list
  - Touch targets 44px minimum
  - Reduced font sizes (H1 to 28px, body to 14px)
  - Bottom padding increased for thumb-friendly scrolling
