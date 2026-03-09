'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { Play, Calendar, LayoutGrid, Search, Sparkles, User, Settings, LogOut, ArrowRight, Gamepad2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchPuzzles();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchPuzzles();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPuzzles = async () => {
    const { data } = await supabase
      .from('puzzles')
      .select('*')
      .order('created_at', { ascending: false });
    setPuzzles(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // LANDING PAGE (Unauthenticated)
  if (!session) {
    return (
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] overflow-hidden selection:bg-indigo-500 selection:text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-3xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                <Sparkles size={28} />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">TTS Master</span>
            </div>
            <Link
              href="/auth"
              className="px-8 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-100 dark:border-slate-800 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Enter Studio
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative pt-48 pb-32 px-8">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] animate-in fade-in slide-in-from-top-4 duration-700">
              <Layers size={14} /> Redefining Crosswords
            </div>

            <h1 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700">
              Build. Play. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Conquer.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
              The world's most advanced TTS generator. Created for masters, played by the curious. Join our community of puzzle architects.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <Link
                href="/auth"
                className="w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Get Started <ArrowRight size={24} />
              </Link>
              <div className="flex items-center -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-[#020617] bg-slate-200 dark:bg-slate-800" />
                ))}
                <p className="pl-8 text-sm font-black text-slate-400 uppercase tracking-widest">Join 1,000+ Creators</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="max-w-7xl mx-auto px-8 pb-48 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: "Intelligent Grid", desc: "Our backtracking algorithm ensures maximum word density.", icon: <LayoutGrid className="text-indigo-500" /> },
            { title: "Creator Studio", desc: "Design complex puzzles with a beautiful dashboard.", icon: <Settings className="text-blue-500" /> },
            { title: "Instant Play", desc: "Share your masterpiece and play with built-in validation.", icon: <Gamepad2 className="text-emerald-500" /> }
          ].map((f, i) => (
            <div key={i} className="p-10 bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-50 dark:border-slate-800 hover:border-indigo-500/30 transition-all duration-500">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                {f.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{f.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    );
  }

  // PLAYER PORTAL (Authenticated)
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] selection:bg-indigo-500 selection:text-white">
      {/* Auth-Aware Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">TTS Master</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-xs font-black uppercase tracking-widest"
            >
              <Settings size={16} /> Creator Studio
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
              suppressHydrationWarning
            >
              <LogOut size={16} /> Logout
            </button>
            <div className="w-10 h-10 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden">
              <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xs">
                {session.user.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Authenticated Dashboard */}
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Welcome, Architect
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Discovery <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Hub</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium mb-12">
            Explore community masterpieces. Filter by the most challenging grids.
          </p>

          <div className="relative max-w-xl mx-auto mb-16 px-4 group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search puzzles by title..."
              className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl shadow-slate-200/50 dark:shadow-none font-bold dark:text-white"
              suppressHydrationWarning
            />
          </div>
        </div>
      </section>

      {/* Library Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex items-center gap-4 mb-10 text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">
          <span>Latest Creations</span>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        </div>

        {puzzles.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-50 dark:border-slate-800">
            <p className="text-slate-400 font-bold">The library is empty. Go and create the first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {puzzles.map((p) => (
              <Link
                key={p.id}
                href={`/play/${p.id}`}
                className="group relative flex flex-col bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-50 dark:border-slate-800 hover:border-indigo-600 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    {p.width}x{p.height}
                  </div>
                  <div className="text-slate-300 dark:text-slate-800">
                    <Calendar size={14} />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                  {p.title}
                </h3>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">{new Date(p.created_at).toLocaleDateString()}</span>
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all group-hover:rotate-[360deg] duration-500">
                    <Play size={16} className="fill-current" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
