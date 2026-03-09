'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import GridPlayer from '@/components/player/GridPlayer';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Sparkles, Loader2 } from 'lucide-react';
import * as React from 'react';

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [puzzle, setPuzzle] = useState<any>(null);
    const [words, setWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth');
                return;
            }
            setSession(session);
            fetchData();
        };

        const fetchData = async () => {
            try {
                // Fetch puzzle data
                const { data: puzzleData, error: puzzleError } = await supabase
                    .from('puzzles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (puzzleError || !puzzleData) {
                    setError(true);
                    setLoading(false);
                    return;
                }

                // Fetch puzzle words (clues & positions)
                const { data: wordsData, error: wordsError } = await supabase
                    .from('puzzle_words')
                    .select('*')
                    .eq('puzzle_id', id);

                if (wordsError || !wordsData) {
                    setError(true);
                    setLoading(false);
                    return;
                }

                setPuzzle(puzzleData);
                setWords(wordsData);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [id, router]);

    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error || !puzzle) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
                <div className="text-center space-y-4">
                    <p className="text-xl font-black text-slate-800 dark:text-white">Failed to load the masterpiece.</p>
                    <Link href="/" className="text-indigo-600 font-bold hover:underline">Return to Library</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] py-12 px-6 md:px-12 selection:bg-indigo-500 selection:text-white">
            {/* Decorative background element */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto space-y-16">
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            className="group p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all text-slate-400 hover:text-indigo-600 border border-slate-100 dark:border-slate-800 hover:-translate-x-1"
                        >
                            <ArrowLeft size={28} />
                        </Link>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">
                                <Sparkles size={12} /> Puzzle Experience
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {puzzle.title}
                            </h1>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                            <Gamepad2 size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mb-1">Grid Size</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{puzzle.width} × {puzzle.height}</p>
                        </div>
                    </div>
                </header>

                <GridPlayer puzzle={puzzle} words={words} />
            </div>
        </main>
    );
}
