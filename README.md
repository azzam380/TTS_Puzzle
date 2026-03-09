# TTS Generator & Player

A premium, full-stack crossword puzzle application built with Next.js and Supabase.

## Features
- **Smart Generator**: Automatically builds a crossword grid from a list of words using an intersection-scoring algorithm.
- **Admin Studio**: Easy interface to create puzzles, preview grids, and publish them.
- **Interactive Player**: Responsive grid with full keyboard support (arrow keys), auto-focus, and real-time validation.
- **Database Integrated**: Persists puzzles and results using Supabase.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide React.
- **Backend**: Supabase (PostgreSQL).
- **State**: TanStack Query & React State.

## Setup Instructions

### 1. Supabase Preparation
1. Create a new project on [Supabase](https://supabase.com).
2. Run the SQL schema provided in `supabase_schema.sql` (found in the root) in the Supabase SQL Editor.
3. Get your **Project URL** and **Anon Key**.

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## How to Use
1. Go to `/admin` (Creator Studio).
2. Enter at least 5-10 words and their clues.
3. Click "Generate" to see the grid. If some words don't fit, try changing them to have more common letters.
4. Give your puzzle a title and click "Publish".
5. You'll be redirected to the play page or find your puzzle in the library (Home).
