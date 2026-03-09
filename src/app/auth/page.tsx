'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight, Github, Chrome, Eye, EyeOff, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.push('/');
        });
    }, [router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'register') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Verification link sent! Please check your email.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
            {/* Decorative background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-xl">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-50 dark:border-slate-800 overflow-hidden transition-all duration-500">

                    {/* Header */}
                    <div className="p-12 text-center space-y-4">
                        <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 dark:shadow-none mb-6 animate-float">
                            <Sparkles size={32} />
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {mode === 'login' ? 'Welcome Back' : 'Create Masterpiece Account'}
                        </h1>
                        <p className="text-slate-400 font-medium italic">
                            {mode === 'login' ? 'Your puzzles are waiting for you.' : 'The first step to building the impossible.'}
                        </p>
                    </div>

                    <div className="px-12 pb-12 space-y-8">
                        {/* Social Auth */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={signInWithGoogle}
                                className="flex items-center justify-center gap-3 py-3 px-6 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all font-bold text-sm text-slate-600 dark:text-slate-300 group"
                                suppressHydrationWarning
                            >
                                <Chrome size={18} className="group-hover:scale-110 transition-transform" /> Google
                            </button>
                            <button
                                className="flex items-center justify-center gap-3 py-3 px-6 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all font-bold text-sm text-slate-600 dark:text-slate-300 group"
                                suppressHydrationWarning
                            >
                                <Github size={18} className="group-hover:scale-110 transition-transform" /> Github
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100 dark:border-slate-800"></span></div>
                            <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] font-black text-slate-300 dark:text-slate-600">
                                <span className="bg-white dark:bg-slate-900 px-4">OR USE EMAIL</span>
                            </div>
                        </div>

                        {/* Email Auth Form */}
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-950 rounded-2xl outline-none transition-all font-bold dark:text-white"
                                    required
                                    suppressHydrationWarning
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Security Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-950 rounded-2xl outline-none transition-all font-bold dark:text-white"
                                    required
                                    suppressHydrationWarning
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                                    suppressHydrationWarning
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                suppressHydrationWarning
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>{mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />} {mode === 'login' ? 'Authorize' : 'Join Studio'}</>
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-slate-400 font-bold hover:text-indigo-500 transition-colors group text-sm"
                                suppressHydrationWarning
                            >
                                {mode === 'login' ? "Don't have an account? " : "Already a member? "}
                                <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/30 underline-offset-4 font-black">
                                    {mode === 'login' ? 'Create one' : 'Sign in'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
