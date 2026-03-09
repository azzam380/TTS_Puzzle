'use client';

import { useState } from 'react';
import { Plus, Trash2, Wand2, BookOpen, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordPair {
    word: string;
    clue: string;
}

interface InputFormProps {
    onGenerate: (words: WordPair[]) => void;
    isLoading?: boolean;
}

export default function InputForm({ onGenerate, isLoading }: InputFormProps) {
    const [pairs, setPairs] = useState<WordPair[]>([
        { word: '', clue: '' },
        { word: '', clue: '' },
        { word: '', clue: '' },
        { word: '', clue: '' },
        { word: '', clue: '' },
    ]);

    const addPair = () => setPairs([...pairs, { word: '', clue: '' }]);
    const removePair = (index: number) => {
        if (pairs.length > 1) {
            setPairs(pairs.filter((_, i) => i !== index));
        }
    };

    const updatePair = (index: number, field: keyof WordPair, value: string) => {
        const newPairs = [...pairs];
        newPairs[index][field] = value;
        setPairs(newPairs);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validPairs = pairs.filter(p => p.word.trim() !== '' && p.clue.trim() !== '');
        onGenerate(validPairs);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-8 pb-4 border-b border-slate-50 dark:border-slate-800/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Type size={20} />
                    </div>
                    Words & Clues
                </h2>
                <p className="text-sm text-slate-400 mt-2 font-medium">Add 5-15 words to create a dense grid.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar space-y-8">
                {pairs.map((pair, index) => (
                    <div
                        key={index}
                        className="group relative flex flex-col gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="WORD"
                                    value={pair.word}
                                    onChange={(e) => updatePair(index, 'word', e.target.value.toUpperCase())}
                                    className="w-full bg-white dark:bg-slate-900 pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400 placeholder:text-slate-300 text-sm"
                                    required
                                    suppressHydrationWarning
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removePair(index)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                                disabled={pairs.length <= 1}
                                suppressHydrationWarning
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-400 transition-colors">
                                <BookOpen size={14} />
                            </div>
                            <input
                                type="text"
                                placeholder="The clue for this word..."
                                value={pair.clue}
                                onChange={(e) => updatePair(index, 'clue', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 pl-9 pr-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-300 italic"
                                required
                                suppressHydrationWarning
                            />
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addPair}
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all text-sm font-bold"
                    suppressHydrationWarning
                >
                    <Plus size={18} /> Add Word
                </button>
            </div>

            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    suppressHydrationWarning
                >
                    <Wand2 size={24} /> Generate Masterpiece
                </button>
            </div>
        </form>
    );
}
