# 🚀 TTS Master - Production & Developer Guide

Welcome to the definitive guide for deploying and maintaining the **TTS Master** application. This document covers everything from Database API to Production Dockerization.

---

## 🏗️ 1. Architecture Overview
This application follows a modern **Serverless-Frontend** pattern:
- **Client**: Next.js 15 (React 19) handles routing, game logic (Backtracking algorithm), and real-time state.
- **Backend/API**: [Supabase](https://supabase.com) provides:
  - **Auth**: Email/Password and Session management.
  - **Database**: PostgreSQL for Puzzles, Words, and Leaderboards.
  - **Realtime**: Live puzzle synchronization using PostgreSQL CDC (Change Data Capture).

---

## 💾 2. Database API Documentation
The application communicates with the following PostgreSQL tables via the Supabase client.

### `puzzles`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, auto-generated. |
| `title` | `text` | The title of the puzzle masterpiece. |
| `width` | `int` | Horizontal dimension of the grid. |
| `height` | `int` | Vertical dimension of the grid. |
| `created_at` | `timestamp` | Creation date. |

### `puzzle_words`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key. |
| `puzzle_id` | `uuid` | Reference to `puzzles(id)`. |
| `word` | `text` | The secret word (uppercase). |
| `clue` | `text` | The clue clue displayed to the player. |
| `x`, `y` | `int` | Coordinates of the first letter. |
| `direction` | `text` | `'across'` or `'down'`. |

### `leaderboard`
| Column | Type | Description |
| :--- | :--- | :--- |
| `puzzle_id`| `uuid` | Target puzzle. |
| `score` | `int` | Calculated as `10,000 - (seconds * 10)`. |
| `email` | `text` | User identifier for the Hall of Fame. |

---

## 🐳 3. Docker Deployment
We use a **Multi-stage Dockerfile** to keep the production image under 200MB.

### Build and Local Run:
1. Ensure your `.env.local` is ready.
2. Run via Docker Compose:
```bash
docker-compose up --build -d
```
3. Access at [http://localhost:3000](http://localhost:3000).

---

## 🔄 4. CI/CD Pipeline (GitHub Actions)
Located in `.github/workflows/deploy.yml`, this pipeline automatically:
1. **Triggers**: On every push to the `main` branch.
2. **Build Test**: Installs dependencies and runs `npm run build` to catch syntax errors.
3. **Deployment**: Deploys the application directly to **Vercel** production environment.

### Setup GitHub Secrets:
To make this work, go to **Settings > Secrets and variables > Actions** in your GitHub Repo and add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN` (Get from Vercel Account Settings)
- `VERCEL_ORG_ID` (Get from project `.vercel/project.json` or team settings)
- `VERCEL_PROJECT_ID` (Get from project `.vercel/project.json`)

---

## 📱 5. Mobile & UX Features
- **Responsive Grid**: Automatically zooms on smaller screens.
- **Glassmorphism UI**: Uses `backdrop-blur` for a premium look on mobile safari.
- **Hall of Fame**: Visual selebration with `canvas-confetti` when solved.
- **Export System**: `html-to-image` coupled with `jsPDF` for cross-platform file saving.

---

### 🛡️ Security Reminder
Always ensure the **SQL Schema** in `supabase_schema.sql` is fully executed. If you encounter permissions errors (403), re-run the **RLS Policies** section in the Supabase SQL Editor.
