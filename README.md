# CroxCom

A terminal-inspired community platform for AI developers. Share knowledge, code snippets, images, and long-form posts with a community of builders.

## Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) primitives
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Realtime, Storage)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based)
- **Build**: [Vite 8](https://vite.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Fill in your Supabase credentials in .env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes (for production) | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (for production) | Your Supabase anonymous/public key |
| `VITE_SHOW_DEMO_DATA` | No | Set to `"true"` to show demo/mock data |

> **Note:** Without Supabase credentials, the app runs in "mock mode" with local-only state. All features work for demo purposes, but nothing persists to a database.

### Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run format     # Format with Prettier
npm run test       # Run tests (Vitest)
```

## Project Structure

```
src/
├── components/    # Reusable UI components
│   ├── feed/      # Post cards, composer, comments
│   ├── layout/    # App shell, navigation
│   ├── messages/  # DM thread, conversation list
│   ├── notifications/
│   └── ui/        # Radix-based primitives (button, dialog, etc.)
├── data/          # Type definitions and mock data
├── hooks/         # Custom hooks (usePosts, useBookmarks, etc.)
├── lib/           # Context providers, Supabase client, utilities
│   ├── AuthContext.tsx
│   ├── BookmarkContext.tsx
│   ├── CommunityContext.tsx
│   ├── LibraryContext.tsx
│   └── supabase.ts
├── routes/        # File-based routes (TanStack Router)
└── styles.css     # Global styles + Tailwind config
```

## Design System

See [`README-design-system.md`](./README-design-system.md) for the full design token reference (colors, typography, spacing).

**Brand palette:** Dark backgrounds (`#0a0a0a`) with terminal-green accents (`#00ff9f`).

## License

Private repository.
