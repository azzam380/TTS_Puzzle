'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { PuzzleWord } from '@/lib/supabase';
import { CheckCircle2, ChevronRight, Keyboard, RotateCcw, Trophy, Timer, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridPlayerProps {
    puzzle: {
        id: string;
        title: string;
        width: number;
        height: number;
    };
    words: PuzzleWord[];
}

export default function GridPlayer({ puzzle, words }: GridPlayerProps) {
    const [gridValues, setGridValues] = useState<Record<string, string>>({});
    const [activeCell, setActiveCell] = useState<{ x: number, y: number } | null>(null);
    const [direction, setDirection] = useState<'across' | 'down'>('across');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [seconds, setSeconds] = useState(0);

    // Timer effect
    useEffect(() => {
        if (isSubmitted) return;
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [isSubmitted]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const gridMap = useMemo(() => {
        const map: Record<string, { char: string, wordIndices: number[] }> = {};
        words.forEach((w, wordIdx) => {
            for (let i = 0; i < w.word.length; i++) {
                const x = w.direction === 'across' ? w.x + i : w.x;
                const y = w.direction === 'across' ? w.y : w.y + i;
                const key = `${x}-${y}`;
                if (!map[key]) map[key] = { char: w.word[i].toUpperCase(), wordIndices: [] };
                map[key].wordIndices.push(wordIdx);
            }
        });
        return map;
    }, [words]);

    const handleCellClick = (x: number, y: number) => {
        if (activeCell?.x === x && activeCell?.y === y) {
            setDirection(prev => prev === 'across' ? 'down' : 'across');
        } else {
            setActiveCell({ x, y });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!activeCell || isSubmitted) return;

            const { x, y } = activeCell;

            if (e.key === 'ArrowRight') setActiveCell({ x: Math.min(x + 1, puzzle.width - 1), y });
            if (e.key === 'ArrowLeft') setActiveCell({ x: Math.max(x - 1, 0), y });
            if (e.key === 'ArrowDown') setActiveCell({ x, y: Math.min(y + 1, puzzle.height - 1) });
            if (e.key === 'ArrowUp') setActiveCell({ x, y: Math.max(y - 1, 0) });

            if (e.key === 'Backspace') {
                const key = `${x}-${y}`;
                if (gridValues[key]) {
                    setGridValues(prev => ({ ...prev, [key]: '' }));
                } else {
                    // Move back if current is empty
                    if (direction === 'across') setActiveCell({ x: Math.max(x - 1, 0), y });
                    else setActiveCell({ x, y: Math.max(y - 1, 0) });
                }
            }

            if (/^[a-zA-Z]$/.test(e.key)) {
                const char = e.key.toUpperCase();
                const key = `${x}-${y}`;
                setGridValues(prev => ({ ...prev, [key]: char }));

                if (direction === 'across') {
                    if (x + 1 < puzzle.width && gridMap[`${x + 1}-${y}`]) setActiveCell({ x: x + 1, y });
                } else {
                    if (y + 1 < puzzle.height && gridMap[`${x}-${y + 1}`]) setActiveCell({ x, y: y + 1 });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeCell, direction, puzzle, gridMap, gridValues, isSubmitted]);

    const acrossClues = words.filter(w => w.direction === 'across');
    const downClues = words.filter(w => w.direction === 'down');

    // Pre-calculate the word containing the active cell to highlight it
    const activeWordRange = useMemo(() => {
        if (!activeCell) return null;
        const cellData = gridMap[`${activeCell.x}-${activeCell.y}`];
        if (!cellData) return null;

        return words.find((w, idx) => {
            if (w.direction !== direction) return false;
            if (!cellData.wordIndices.includes(idx)) return false;
            if (direction === 'across') {
                return activeCell.y === w.y && activeCell.x >= w.x && activeCell.x < w.x + w.word.length;
            } else {
                return activeCell.x === w.x && activeCell.y >= w.y && activeCell.y < w.y + w.word.length;
            }
        });
    }, [activeCell, direction, words, gridMap]);

    // Check how many are correct
    const correctCount = useMemo(() => {
        let count = 0;
        Object.entries(gridMap).forEach(([key, data]) => {
            if (gridValues[key] === data.char) count++;
        });
        return count;
    }, [gridValues, gridMap]);

    const totalCells = Object.keys(gridMap).length;
    const progress = Math.round((correctCount / totalCells) * 100);

    return (
        <div className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Game Console */}
            <div className="flex-1 flex flex-col gap-8 w-full">
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <StatCard icon={<Timer size={18} />} label="Timer" value={formatTime(seconds)} color="indigo" />
                    <StatCard icon={<Trophy size={18} />} label="Progress" value={`${progress}%`} color="emerald" progress={progress} />
                    <StatCard icon={<Keyboard size={18} />} label="Mode" value={direction.toUpperCase()} color="blue" />
                </div>

                {/* The Grid Container */}
                <div className="relative bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[3.5rem] shadow-2xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800 flex justify-center items-center overflow-auto">
                    <div
                        className="grid gap-0.5 bg-slate-300 dark:bg-slate-700 border-4 border-slate-900 dark:border-slate-950 shadow-2xl p-0.5 rounded-xl overflow-hidden"
                        style={{
                            gridTemplateColumns: `repeat(${puzzle.width}, minmax(45px, 65px))`,
                            gridTemplateRows: `repeat(${puzzle.height}, minmax(45px, 65px))`
                        }}
                    >
                        {Array.from({ length: puzzle.height }).map((_, y) =>
                            Array.from({ length: puzzle.width }).map((_, x) => {
                                const cellData = gridMap[`${x}-${y}`];
                                const isActive = activeCell?.x === x && activeCell?.y === y;

                                // Highlight the entire word being typed
                                const isInActiveWord = activeWordRange && (
                                    activeWordRange.direction === 'across'
                                        ? (y === activeWordRange.y && x >= activeWordRange.x && x < activeWordRange.x + activeWordRange.word.length)
                                        : (x === activeWordRange.x && y >= activeWordRange.y && y < activeWordRange.y + activeWordRange.word.length)
                                );

                                const isFilled = gridValues[`${x}-${y}`];
                                const isCorrect = isFilled === cellData?.char;
                                const wordStart = words.find(w => w.x === x && w.y === y);

                                if (!cellData) return <div key={`${x}-${y}`} className="bg-slate-900 dark:bg-black aspect-square" />;

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        onClick={() => handleCellClick(x, y)}
                                        className={cn(
                                            "relative bg-white dark:bg-slate-800 aspect-square flex items-center justify-center text-xl md:text-2xl font-black cursor-pointer transition-all duration-200 select-none",
                                            isActive && "bg-indigo-500 text-white z-20 scale-110 shadow-xl ring-4 ring-indigo-500/30",
                                            !isActive && isInActiveWord && "bg-indigo-100 dark:bg-indigo-900/40",
                                            isSubmitted && isCorrect && !isActive && "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
                                            isSubmitted && !isCorrect && isFilled && !isActive && "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
                                            !isSubmitted && !isActive && !isInActiveWord && isFilled && "text-indigo-600 dark:text-indigo-400"
                                        )}
                                    >
                                        {wordStart && (
                                            <span className="absolute top-1 left-1.5 text-[9px] md:text-[11px] font-black text-slate-300 dark:text-slate-600 leading-none">
                                                {words.indexOf(wordStart) + 1}
                                            </span>
                                        )}
                                        {gridValues[`${x}-${y}`] || ''}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                    <button
                        onClick={() => setIsSubmitted(true)}
                        className="flex-1 w-full md:w-auto py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-3"
                    >
                        <CheckCircle2 size={24} /> Submit Puzzle
                    </button>
                    <button
                        onClick={() => { setGridValues({}); setIsSubmitted(false); setSeconds(0); }}
                        className="w-full md:w-auto px-8 py-5 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black text-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>
            </div>

            {/* Clue Sidebar */}
            <div className="w-full lg:w-[450px] space-y-6 lg:sticky lg:top-12">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                            <Info size={18} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Puzzle Clues</h2>
                    </div>

                    <div className="space-y-10">
                        <ClueList title="Across" clues={acrossClues} allWords={words} />
                        <ClueList title="Down" clues={downClues} allWords={words} />
                    </div>
                </div>

                <div className="p-6 bg-slate-900 dark:bg-indigo-950 rounded-[2rem] text-slate-400 text-sm font-medium flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white shrink-0">
                        <ChevronRight size={18} />
                    </div>
                    <p>Type letters to fill, use <span className="text-white font-bold">Arrow Keys</span> to navigate, and <span className="text-white font-bold">Backspace</span> to erase.</p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, progress }: { icon: any, label: string, value: string, color: string, progress?: number }) {
    const colors: Record<string, string> = {
        indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
    };

    return (
        <div className={cn("p-5 rounded-[2rem] border transition-all relative overflow-hidden", colors[color])}>
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="opacity-70">{icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</span>
                </div>
                <div className="text-xl font-black tracking-tight">{value}</div>
            </div>
            {progress !== undefined && (
                <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-1000" style={{ width: `${progress}%` }} />
            )}
        </div>
    );
}

function ClueList({ title, clues, allWords }: { title: string, clues: PuzzleWord[], allWords: PuzzleWord[] }) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-4">
                {title}
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                {clues.map((clue) => (
                    <div key={clue.id} className="group flex gap-4">
                        <span className="text-lg font-black text-slate-200 dark:text-slate-800 group-hover:text-indigo-500 transition-colors tabular-nums min-w-[1.5rem]">
                            {allWords.indexOf(clue) + 1}
                        </span>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-relaxed">
                            {clue.clue}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
