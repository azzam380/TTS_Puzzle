'use client';

import { useState, useEffect } from 'react';
import InputForm from '@/components/admin/InputForm';
import GridPreview from '@/components/admin/GridPreview';
import { CrosswordGenerator, GridResult } from '@/lib/crossword-generator';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, LayoutGrid, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const [result, setResult] = useState<GridResult | null>(null);
    const [title, setTitle] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // Gate 1: General Authentication
            if (!session) {
                router.push('/auth');
                return;
            }

            // Gate 2: Creator Studio Authorization (admin123)
            const isAdminAuthorized = localStorage.getItem('tts-admin-auth');
            if (!isAdminAuthorized) {
                router.push('/admin/login');
                return;
            }

            setIsLoaded(true);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/auth');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        localStorage.removeItem('tts-admin-auth'); // Clear the second gate
        await supabase.auth.signOut(); // Clear the first gate
        router.push('/');
    };

    if (!isLoaded) return null;

    const handleGenerate = (words: { word: string, clue: string }[]) => {
        const gen = new CrosswordGenerator(words);
        const output = gen.generate();
        setResult(output);
    };

    const handlePublish = async () => {
        if (!result || !title) return;
        setIsPublishing(true);

        try {
            const { data: puzzleData, error: puzzleError } = await supabase
                .from('puzzles')
                .insert({
                    title,
                    width: result.width,
                    height: result.height
                })
                .select()
                .single();

            if (puzzleError) throw puzzleError;

            const wordsToInsert = result.placedWords.map(w => ({
                puzzle_id: puzzleData.id,
                word: w.word,
                clue: w.clue,
                x: w.x,
                y: w.y,
                direction: w.direction
            }));

            const { error: wordsError } = await supabase
                .from('puzzle_words')
                .insert(wordsToInsert);

            if (wordsError) throw wordsError;

            router.push(`/play/${puzzleData.id}`);
        } catch (error) {
            console.error('Error publishing:', error);
            alert('Failed to publish puzzle. Please check your Supabase connecting strings.');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
            {/* Decorative background element */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 p-6 md:p-12 lg:p-16">
                <div className="max-w-[1600px] mx-auto space-y-12">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <div className="space-y-4">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Library
                            </Link>
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800 animate-float">
                                    <Sparkles className="text-indigo-600" size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Studio</span>
                                    </h1>
                                    <p className="text-slate-400 font-medium mt-1">Sculpt your crossword puzzle with precision.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-3 px-6 rounded-3xl border border-white dark:border-slate-800 shadow-sm">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Active Status</p>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Builder Mode</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-12 h-12 bg-rose-500/10 hover:bg-rose-500 rounded-2xl flex items-center justify-center text-rose-500 hover:text-white transition-all shadow-inner"
                                title="Logout from Creator Mode"
                            >
                                <LogOut size={24} />
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[800px]">
                        <div className="lg:col-span-4 h-full">
                            <InputForm onGenerate={handleGenerate} />
                        </div>
                        <div className="lg:col-span-8 h-full">
                            <GridPreview
                                result={result}
                                title={title}
                                onTitleChange={setTitle}
                                onPublish={handlePublish}
                                isPublishing={isPublishing}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
