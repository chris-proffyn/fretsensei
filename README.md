# FretSensei

Interactive guitar fretboard visualiser for learning scales, modes, note locations, interval relationships, and practice playback.

**Platforms:** Web (Netlify), iOS, Android

## Repository Structure

```
fretsensei/
├── apps/
│   ├── web/          # Vite + React web app (Netlify target)
│   └── mobile/       # Expo app (iOS / Android / web via Expo)
├── packages/
│   ├── ui/           # Shared UI components and theme
│   ├── data/         # Data-access layer (future use)
│   └── utils/        # Shared domain logic and utilities
├── supabase/         # Backend artefacts (not required for v1)
└── docs/             # Requirements and RSD governance
```

## Prerequisites

- Node.js 20+
- npm 10+
- For mobile: Expo Go app or Xcode / Android Studio for native builds

## Getting Started

```bash
# Install dependencies
npm install

# Run web app (development)
npm run web

# Run mobile app (development)
npm run mobile
```

## Development Commands

| Command | Description |
|---|---|
| `npm run web` | Start web dev server |
| `npm run mobile` | Start Expo dev server |
| `npm run typecheck` | Type-check all workspaces |
| `npm run test` | Run tests across workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run build` | Build all workspaces |

## Documentation

- [Project Status Tracker](docs/PROJECT_STATUS_TRACKER.md)
- [Functional Requirements](docs/project/product-functional-requirements.md)
- [Technical Requirements](docs/project/product-technical-requirements.md)

## License

Proprietary — Proffyn RSD project.
