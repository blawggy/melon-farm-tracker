# Skyblock Farming Analyzer

A comprehensive tool for analyzing Hypixel Skyblock farming statistics, equipment, and garden progress.

## Features

- **Player Search**: Look up any Minecraft username to view their Skyblock profiles
- **Farming Fortune Analysis**: Detailed breakdown of farming fortune from armor, equipment, accessories, and pets
- **Garden Progress**: Track garden level, crop milestones, visitors, and compost
- **Equipment Overview**: View equipped armor, equipment slots, and active pets with rarity colors
- **Profile Comparison**: Compare farming stats across multiple players
- **Farming Guides**: Built-in guides for maximizing farming fortune and efficiency

## Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Docker Deployment

#### Using Docker Compose (Recommended)

1. Build and run with a single command:
```bash
docker-compose up -d
```

2. Access the application at `http://localhost:3000`

3. Stop the application:
```bash
docker-compose down
```

#### Using Docker CLI

1. Build the Docker image:
```bash
docker build -t skyblock-analyzer .
```

2. Run the container:
```bash
docker run -d -p 3000:3000 --name skyblock-analyzer skyblock-analyzer
```

3. Stop the container:
```bash
docker stop skyblock-analyzer
docker rm skyblock-analyzer
```

### Production Build

Build the application for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Usage

1. Enter a Minecraft username in the search bar
2. Select a Skyblock profile to analyze
3. View detailed farming statistics across multiple tabs
4. Add players to comparison to see side-by-side stats

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Hypixel API
- Docker

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
