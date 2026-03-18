# Planning Guide

A Minecraft Hypixel Skyblock farming tracker that helps players monitor their melon farming progress, calculate profits, and track farming statistics over time.

**Experience Qualities**: 
1. **Efficient** - Quick data entry and instant calculations allow players to focus on farming rather than manual tracking
2. **Game-authentic** - Visual design mirrors Minecraft's aesthetic with blocky elements and familiar color schemes
3. **Rewarding** - Clear progress visualization and profit tracking that makes farming sessions feel productive

**Complexity Level**: Light Application (multiple features with basic state)
  - The app tracks farming sessions, calculates profits, and persists data, but remains focused on a single activity (melon farming) with straightforward interactions

## Essential Features

### Session Tracker
- **Functionality**: Record melon farming sessions with quantity harvested and time spent
- **Purpose**: Provides historical data for performance analysis and profit tracking
- **Trigger**: User clicks "New Session" button
- **Progression**: Click "New Session" → Enter melons harvested → Enter time spent (optional) → Enter melon price → Click "Save" → Session appears in history list
- **Success criteria**: Session data persists between app visits, displays in chronological order, and shows calculated profit

### Live Statistics Dashboard
- **Functionality**: Real-time display of total melons farmed, total profit, average melons per hour, and session count
- **Purpose**: Motivates continued farming by showing cumulative progress
- **Trigger**: Automatically updates when sessions are added or removed
- **Progression**: User adds session → Stats recalculate instantly → Dashboard updates with new totals and averages
- **Success criteria**: All statistics update accurately, calculations are correct, and values persist across sessions

### Profit Calculator
- **Functionality**: Calculate profit based on melons harvested and current market price
- **Purpose**: Helps players understand their earnings and optimize farming efficiency
- **Trigger**: Embedded in session entry form
- **Progression**: Enter melons → Enter price per melon → Profit calculates automatically → Display shows total coins earned
- **Success criteria**: Accurate multiplication, supports decimal prices, updates in real-time as user types

### Session History
- **Functionality**: Scrollable list of all farming sessions with delete capability
- **Purpose**: Allows players to review past performance and remove incorrect entries
- **Trigger**: Displays automatically on app load
- **Progression**: View session list → Click delete icon on session → Confirm deletion → Session removed from history and stats recalculate
- **Success criteria**: Sessions display newest first, delete removes from storage, empty state shows helpful message

### Achievements & Milestones
- **Functionality**: Track farming milestones and display achievement badges for reaching goals
- **Purpose**: Gamify the farming experience and motivate players to reach higher efficiency targets
- **Trigger**: Automatically checks achievement conditions when stats update
- **Progression**: Farm melons → Reach milestone threshold → Badge unlocks → Display in achievements section → Progress bar shows next goal
- **Success criteria**: Achievements persist across sessions, badges display earned state, progress indicators show clear path to next milestone

## Edge Case Handling
- **Zero/Negative Values**: Prevent negative numbers in melon count and price fields; treat zero as valid but show warning
- **Empty Sessions**: Display friendly empty state with guidance when no sessions exist
- **Very Large Numbers**: Format numbers with commas for readability (e.g., 1,000,000 melons)
- **Decimal Prices**: Support decimal coin values (e.g., 0.5 coins per melon)
- **Data Loss Prevention**: Auto-save all data to prevent loss on accidental closure

## Design Direction
The design should evoke the nostalgic, blocky charm of Minecraft with a farming-focused aesthetic. Players should feel like this tool is a natural extension of their Hypixel Skyblock experience, incorporating the game's signature greens, browns, and earthy tones while maintaining modern usability.

## Color Selection

- **Primary Color**: Deep Forest Green (oklch(0.45 0.12 150)) - Represents melons and farming, conveys growth and productivity
- **Secondary Colors**: 
  - Dirt Brown (oklch(0.35 0.05 60)) - Grounding earth tone that connects to farming soil
  - Warm Wheat (oklch(0.75 0.08 85)) - Represents harvest and sunshine, used for highlights
- **Accent Color**: Bright Melon Red (oklch(0.58 0.20 25)) - Eye-catching highlight for CTAs and important stats
- **Foreground/Background Pairings**: 
  - Background (Light Cream oklch(0.96 0.01 85)): Dark Forest Text (oklch(0.20 0.05 150)) - Ratio 11.2:1 ✓
  - Primary (Deep Forest Green oklch(0.45 0.12 150)): White text (oklch(1 0 0)) - Ratio 5.1:1 ✓
  - Accent (Bright Melon Red oklch(0.58 0.20 25)): White text (oklch(1 0 0)) - Ratio 4.6:1 ✓
  - Card (Soft Green oklch(0.92 0.02 140)): Dark Forest Text (oklch(0.20 0.05 150)) - Ratio 10.8:1 ✓

## Font Selection
The typefaces should feel slightly playful and blocky to match Minecraft's aesthetic while remaining highly readable for numbers and statistics.

- **Typographic Hierarchy**: 
  - H1 (App Title): Bungee/32px/tight letter spacing - Bold, blocky feel for header
  - H2 (Section Headers): Bungee/20px/normal letter spacing - Consistent with main title
  - Stats (Large Numbers): JetBrains Mono/28px/medium weight/tabular numbers - Monospace clarity for stats
  - Body Text: Inter/16px/normal weight/relaxed line height - Clean readability for descriptions
  - Session Details: JetBrains Mono/14px/normal weight - Consistent number display

## Animations
Animations should feel immediate and satisfying, reinforcing the player's actions with subtle feedback that echoes Minecraft's responsive gameplay.

- Session cards fade in with a slight slide-up when added
- Statistics counter animates with a brief spring effect when values change
- Button presses have a subtle scale-down effect (like pressing a Minecraft button)
- Delete actions have a quick fade-out before removal
- Form submission triggers a success state with a gentle pulse

## Component Selection

- **Components**: 
  - Card (for session entries and stats dashboard) - Clean separation of content areas
  - Button (for CTAs, delete actions) - Primary variant for "New Session", ghost variant for delete
  - Input (for melon count, price entry) - With number type and step attributes
  - Dialog (for new session form) - Modal overlay to focus on data entry
  - Badge (for displaying achievement status) - Highlight earned vs locked milestones
  - Separator (between sections) - Visual organization
  - ScrollArea (for session history) - Smooth scrolling on long lists
  - Progress (for milestone progress bars) - Visual indicator of progress to next achievement
  - Tabs (for switching between history and achievements) - Organize content sections

- **Customizations**: 
  - Custom stat cards with large emphasized numbers and subtle pixel-art style borders
  - Melon icon integration using Phosphor icons or custom SVG
  - Minecraft-inspired button styling with slight 3D depth effect using shadows

- **States**: 
  - Buttons: Default (solid with subtle shadow), Hover (brightens, shadow increases), Active (scales down 98%), Disabled (reduced opacity, no shadow)
  - Inputs: Default (light border), Focus (green ring matching primary color), Error (red border with shake animation), Filled (subtle green tint)
  - Cards: Default (soft shadow), Hover (shadow lifts slightly for interactive cards)

- **Icon Selection**: 
  - Plus icon for "New Session" button
  - Trash icon for delete actions
  - ChartBar for statistics
  - Clock for time tracking
  - Coins/CurrencyCircleDollar for profit display
  - Plant/Leaf for melon representation
  - Trophy/Medal for achievements
  - Target for goals and milestones
  - Sparkle/Star for unlocked badges
  - Lock for locked achievements

- **Spacing**: 
  - Container padding: p-6 on desktop, p-4 on mobile
  - Card gaps: gap-4 for stat grids, gap-3 for session lists
  - Section margins: mb-8 between major sections
  - Form field spacing: space-y-4 for vertical form layouts
  - Button padding: px-6 py-3 for primary actions, px-3 py-2 for secondary

- **Mobile**: 
  - Stats dashboard switches from 4-column grid to 2-column on tablet, single column on mobile
  - Session cards remain full-width but with reduced padding
  - Dialog forms adjust to near-fullscreen on mobile with bottom sheet style
  - Font sizes reduce slightly (H1 to 24px, body to 14px) for mobile viewports
  - Touch targets minimum 44px for all interactive elements
