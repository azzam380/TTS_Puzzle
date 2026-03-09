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

-- RLS Policies (Simplified for development)
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_words ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read
CREATE POLICY "Allow public read puzzles" ON puzzles FOR SELECT USING (true);
CREATE POLICY "Allow public read puzzle_words" ON puzzle_words FOR SELECT USING (true);

-- Allow anonymous insert (for demo/dev purposes)
CREATE POLICY "Allow public insert puzzles" ON puzzles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert puzzle_words" ON puzzle_words FOR INSERT WITH CHECK (true);
