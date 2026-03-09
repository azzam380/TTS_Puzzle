'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { PuzzleWord } from '@/lib/supabase';
import { CheckCircle2, ChevronRight, Keyboard, RotateCcw, Trophy, Timer, Info, Download, Users, Share2, Loader2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
// Dynamic imports removed from top level to fix SSR issues
import { supabase } from '@/lib/supabase';

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
    const [isMultiplayer, setIsMultiplayer] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<any>(null);

    // Auth & Leaderboard effect
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
        fetchLeaderboard();
    }, [puzzle.id]);

    const fetchLeaderboard = async () => {
        const { data } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('puzzle_id', puzzle.id)
            .order('score', { ascending: false })
            .limit(5);
        setLeaderboard(data || []);
    };

    // Timer effect
    useEffect(() => {
        if (isSubmitted) return;
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [isSubmitted]);

    // REALTIME: Main Bareng Logic
    useEffect(() => {
        if (!isMultiplayer) return;

        const channel = supabase.channel(`puzzle-${puzzle.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'puzzle_sessions',
                filter: `puzzle_id=eq.${puzzle.id}`
            }, (payload) => {
                if (payload.new.grid_data) {
                    setGridValues(payload.new.grid_data);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isMultiplayer, puzzle.id]);

    const syncGrid = async (newValues: any) => {
        if (!isMultiplayer) return;
        await supabase
            .from('puzzle_sessions')
            .upsert({ puzzle_id: puzzle.id, grid_data: newValues }, { onConflict: 'puzzle_id' });
    };

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
                const newValues = { ...gridValues, [key]: char };
                setGridValues(newValues);
                syncGrid(newValues);

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

    const handleSubmit = async () => {
        setIsSubmitted(true);
        if (progress === 100) {
            const confetti = (await import('canvas-confetti')).default;
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

            // Calculate Score: Base 10,000 - (seconds * 10)
            const score = Math.max(0, 10000 - (seconds * 10));

            if (user) {
                await supabase.from('leaderboard').insert({
                    puzzle_id: puzzle.id,
                    user_id: user.id,
                    email: user.email,
                    time_seconds: seconds,
                    score: score
                });
                fetchLeaderboard();
            }
            setShowLeaderboard(true);
        }
    };

    const exportAsImage = async () => {
        if (!gridRef.current) return;
        setIsExporting(true);
        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(gridRef.current, { backgroundColor: '#ffffff', cacheBust: true });
            const link = document.createElement('a');
            link.download = `${puzzle.title.replace(/\s+/g, '_')}_TTS.png`;
            link.href = dataUrl;
            link.click();
        } finally {
            setIsExporting(false);
        }
    };

    const exportAsPDF = async () => {
        if (!gridRef.current) return;
        setIsExporting(true);
        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(gridRef.current, { backgroundColor: '#ffffff' });
            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF({
                orientation: puzzle.width > puzzle.height ? 'landscape' : 'portrait',
            });
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${puzzle.title.replace(/\s+/g, '_')}_TTS.pdf`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Game Console */}
            <div className="flex-1 flex flex-col gap-8 w-full">
                {/* Stats Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <StatCard icon={<Timer size={18} />} label="Timer" value={formatTime(seconds)} color="indigo" />
                    <StatCard icon={<Trophy size={18} />} label="Progress" value={`${progress}%`} color="emerald" progress={progress} />
                    <StatCard icon={<Keyboard size={18} />} label="Mode" value={direction.toUpperCase()} color="blue" onClick={() => setDirection(prev => prev === 'across' ? 'down' : 'across')} clickable />
                    <StatCard
                        icon={<Users size={18} />}
                        label="Co-Op"
                        value={isMultiplayer ? "LIVE" : "OFF"}
                        color={isMultiplayer ? "rose" : "slate"}
                        onClick={() => setIsMultiplayer(!isMultiplayer)}
                        clickable
                    />
                </div>

                {/* The Grid Container */}
                <div ref={gridRef} className="relative bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex justify-center items-center overflow-auto scrollbar-none touch-pan-x touch-pan-y">
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
                                        suppressHydrationWarning
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
                        onClick={handleSubmit}
                        disabled={isSubmitted && progress === 100}
                        className="flex-1 w-full md:w-auto py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-[1.5rem] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-3 disabled:opacity-50"
                        suppressHydrationWarning
                    >
                        <CheckCircle2 size={24} /> {isSubmitted && progress === 100 ? "Masterpiece Solved!" : "Submit Puzzle"}
                    </button>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={exportAsImage}
                            disabled={isExporting}
                            title="Export as PNG"
                            className="p-5 bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all flex items-center justify-center shadow-lg"
                            suppressHydrationWarning
                        >
                            {isExporting ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                        </button>
                        <button
                            onClick={exportAsPDF}
                            disabled={isExporting}
                            title="Export as PDF"
                            className="p-5 bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all flex items-center justify-center shadow-lg"
                            suppressHydrationWarning
                        >
                            {isExporting ? <Loader2 size={24} className="animate-spin" /> : <Share2 size={24} />}
                        </button>
                        <button
                            onClick={() => { setGridValues({}); setIsSubmitted(false); setSeconds(0); setShowLeaderboard(false); }}
                            className="p-5 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all flex items-center justify-center shadow-lg"
                            suppressHydrationWarning
                        >
                            <RotateCcw size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Clue Sidebar */}
            <div className="w-full lg:w-[450px] space-y-6 lg:sticky lg:top-12">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
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

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md p-10 rounded-[3rem] shadow-2xl border border-white/20 space-y-8">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-20 h-20 bg-amber-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-200 animate-bounce">
                                <Award size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">Hall of Fame</h2>
                            <p className="text-slate-400 font-medium">Top architects for this grid.</p>
                        </div>

                        <div className="space-y-4">
                            {leaderboard.map((item, idx) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-500">#{idx + 1}</span>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{item.email?.split('@')[0]}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatTime(item.time_seconds)}</p>
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-indigo-500 tabular-nums">
                                        {item.score.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowLeaderboard(false)}
                            className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black hover:bg-slate-800 transition-all"
                            suppressHydrationWarning
                        >
                            Close Hall of Fame
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color, progress, onClick, clickable }: { icon: any, label: string, value: string, color: string, progress?: number, onClick?: () => void, clickable?: boolean }) {
    const colors: Record<string, string> = {
        indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20",
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
        rose: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20",
        slate: "text-slate-400 bg-slate-50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-700/20",
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-5 rounded-[2rem] border transition-all relative overflow-hidden",
                colors[color],
                clickable && "hover:scale-105 active:scale-95 cursor-pointer hover:shadow-lg"
            )}
        >
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
