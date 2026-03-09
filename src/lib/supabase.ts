import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Puzzle = {
    id: string;
    title: string;
    width: number;
    height: number;
    created_at: string;
};

export type PuzzleWord = {
    id: string;
    puzzle_id: string;
    word: string;
    clue: string;
    x: number;
    y: number;
    direction: 'across' | 'down';
};
