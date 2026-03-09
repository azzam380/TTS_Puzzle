'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Sparkles, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    useState(() => {
        const checkAuth = async () => {
            const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
            if (!session) {
                router.push('/auth');
            } else {
                setIsLoaded(true);
            }
        };
        checkAuth();
    });

    if (!isLoaded) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simplified for now, can be replaced with Supabase Auth later
        if (password === 'admin123') {
            localStorage.setItem('tts-admin-auth', 'true');
            router.push('/admin');
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-slate-50 dark:border-slate-800 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-none animate-float">
                    <ShieldAlert size={40} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Restricted Access</h1>
                    <p className="text-slate-400 font-medium italic">Creator Studio requires authorization.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Creator Key"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 rounded-2xl outline-none transition-all font-bold dark:text-white"
                            suppressHydrationWarning
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors p-1"
                            suppressHydrationWarning
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-rose-500 text-xs font-black uppercase tracking-widest animate-bounce">Access Denied</p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
                        suppressHydrationWarning
                    >
                        Authorize <ArrowRight size={20} />
                    </button>
                </form>

                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                    Default Key: <span className="text-indigo-400">admin123</span> <br />
                    Only verified creators can publish to the library.
                </p>
            </div>
        </div>
    );
}
