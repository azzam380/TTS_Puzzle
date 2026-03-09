-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Puzzles table
CREATE TABLE puzzles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Puzzle Words table
CREATE TABLE puzzle_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    clue TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('across', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard table
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    time_seconds INTEGER NOT NULL,
    score INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Puzzle sessions (for Realtime Play Bareng)
CREATE TABLE puzzle_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puzzle_id UUID REFERENCES puzzles(id) ON DELETE CASCADE,
    player_data JSONB DEFAULT '{}',
    grid_data JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read puzzles" ON puzzles FOR SELECT USING (true);
CREATE POLICY "Public read puzzle_words" ON puzzle_words FOR SELECT USING (true);
CREATE POLICY "Anyone can insert puzzles" ON puzzles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert puzzle_words" ON puzzle_words FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Auth users insert score" ON leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public sessions access" ON puzzle_sessions FOR ALL USING (true);
