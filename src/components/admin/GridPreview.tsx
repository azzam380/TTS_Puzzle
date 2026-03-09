'use client';

import { GridResult } from '@/lib/crossword-generator';
import { Share2, LayoutGrid, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridPreviewProps {
    result: GridResult | null;
    title: string;
    onTitleChange: (title: string) => void;
    onPublish: () => void;
    isPublishing?: boolean;
}

export default function GridPreview({ result, title, onTitleChange, onPublish, isPublishing }: GridPreviewProps) {
    if (!result) {
        return (
            <div className="h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center group cursor-default">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mb-6 text-slate-200 group-hover:text-indigo-500 transition-colors duration-500 group-hover:scale-110">
                    <LayoutGrid size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Awaiting Creativity</h3>
                <p className="text-slate-400 max-w-[280px] leading-relaxed">Fill in the words on the left and click generate to visualize your masterpiece.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between border-b border-slate-50 dark:border-slate-800/50 pb-8">
                <div className="flex-1 max-w-lg">
                    <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Puzzle Identity</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="text-3xl md:text-4xl font-black w-full bg-transparent outline-none focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors placeholder:text-slate-200 dark:placeholder:text-slate-800"
                        placeholder="Type a title..."
                    />
                </div>
                <button
                    onClick={onPublish}
                    disabled={isPublishing || !title}
                    className="group flex items-center gap-3 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100"
                >
                    {isPublishing ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Share2 size={24} className="group-hover:rotate-12 transition-transform" />
                            Publish Puzzle
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Grid Display */}
                <div className="xl:col-span-8 flex justify-center items-center overflow-auto p-12 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] min-h-[500px] border border-slate-100 dark:border-slate-900 shadow-inner">
                    <div
                        className="grid gap-px bg-slate-200 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 shadow-2xl scale-100 transition-transform duration-500"
                        style={{
                            gridTemplateColumns: `repeat(${result.width}, minmax(30px, 45px))`,
                            gridTemplateRows: `repeat(${result.height}, minmax(30px, 45px))`
                        }}
                    >
                        {result.grid.map((row, y) =>
                            row.map((char, x) => (
                                <div
                                    key={`${x}-${y}`}
                                    className={cn(
                                        "flex items-center justify-center text-lg font-black aspect-square transition-all duration-300",
                                        char ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' : 'bg-slate-800 dark:bg-slate-950'
                                    )}
                                >
                                    {char}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Stats & Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-3xl border border-indigo-100/50 dark:border-indigo-500/10">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Placed</p>
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{result.placedWords.length}</div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dimensions</p>
                            <div className="text-xl font-black text-slate-600 dark:text-slate-300">{result.width} <span className="text-slate-300">×</span> {result.height}</div>
                        </div>
                    </div>

                    {result.failedWords.length > 0 && (
                        <div className="p-6 bg-rose-50 dark:bg-rose-500/5 rounded-3xl border border-rose-100 dark:border-rose-500/10 animate-pulse">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-wider mb-4">
                                <AlertCircle size={14} /> Unconnected Words
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.failedWords.map((w, i) => (
                                    <span key={i} className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold text-rose-400 line-through decoration-2">
                                        {w.word}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-rose-400/80 mt-4 leading-relaxed font-medium">Try adding words with more common letters (E, A, R, I, O) to improve connectivity.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <CheckCircle2 size={12} /> Successfully Connected
                        </h3>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {result.placedWords.map((w, i) => (
                                <div key={i} className="group p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-black text-sm text-slate-700 dark:text-slate-200 tracking-wider font-mono">{w.word}</span>
                                        <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase">{w.direction}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium italic line-clamp-2 leading-relaxed">"{w.clue}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
