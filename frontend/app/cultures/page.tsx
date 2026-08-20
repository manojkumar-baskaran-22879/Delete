"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

// === CHAOS DATA: WALL OF ATTEMPTS ===
const attemptsLog = [
    { time: "03:00 AM", action: "Deleted the database", outcome: "Oops.", sticker: "💀" },
    { time: "03:15 AM", action: "Restored database from local cache", outcome: "GOD IS REAL", sticker: "🙏" },
    { time: "04:00 AM", action: "Red Bull #4", outcome: "I can see noises", sticker: "👁️" },
    { time: "04:30 AM", action: "git push --force", outcome: "Teammate screaming", sticker: "🔥" },
    { time: "05:00 AM", action: "Defined 'TemporaryFix'", outcome: "It is now permanent", sticker: "🏗️" },
    { time: "06:00 AM", action: "Sunlight detected", outcome: "HISSING NOISES", sticker: "🧛" },
    { time: "07:00 AM", action: "Pitch Deck created", outcome: "Used Comic Sans ironically", sticker: "🤡" },
    { time: "08:00 AM", action: "Demo Time", outcome: "Hardcoded the result", sticker: "🤫" },
];

// === CHAOS DATA: SURVIVAL KIT ===
const survivalItems = [
    { icon: "☕", name: "Industrial Coffee IV", desc: "Legalize Vibrating" },
    { icon: "🍜", name: "Sodium Noodles", desc: "Taste the Hypertension" },
    { icon: "🧸", name: "Emotional Support Water Bottle", desc: "Hasn't been washed in 3 years" },
    { icon: "🔌", name: "The Dongle of Life", desc: "USB-C to HDMI to VGA to Prayer" },
    { icon: "🧥", name: "The Hoodie", desc: "Armor against social interaction" },
    { icon: "🍕", name: "Cold Pizza Crust", desc: "Breakfast of Champions" },
    { icon: "🎧", name: "Noise Blockers", desc: "I can't hear your bad ideas" },
    { icon: "💊", name: "Ibuprofen x100", desc: "My back hurts" },
];

// === CHAOS DATA: HOD GUIDE ===
const hodSteps = [
    { title: "PHASE 1: THE GASLIGHT", desc: "Convince them the Hackathon was THEIR idea. 'Sir, remember you said we needed more innovation?'" },
    { title: "PHASE 2: THE BRIBE", desc: "Coffee. Donuts. Compliments on their tie. Dignity is a resource, spend it." },
    { title: "PHASE 3: THE TECHNOBABBLE", desc: "If they ask about the budget, just say 'Blockchain AI Synergy' until they stop asking." },
    { title: "PHASE 4: THE GUILT TRIP", desc: "'Wow, I guess [Rival College] just cares more about student success...' (Use sparingly)" },
    { title: "PHASE 5: THE ESCAPE", desc: "Get the signature and RUN. Do not look back. Leave a decoy in your chair." },
];

// === CHAOS DATA: JUNKYARD (Default/Fallback) ===
const defaultGraveyard_FALLBACK = [
    { name: "Tinder for Hamsters", status: "ABORTED (Too Dumb)", cause: "Hamsters ate the servers" },
    { name: "Blockchain Toaster", status: "SEGFAULT CITY", cause: "Burned down the dorm" },
];

// Helper: Get API URL at runtime (avoids SSR/Hydration mismatch)
const getApiUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:9000/api/junkyard';
    }
    return '/api/junkyard';
};

// === COMPONENTS ===

function Sticker({ children, x, y, rot }: { children: React.ReactNode, x: string, y: string, rot: number }) {
    return (
        <motion.div
            className="absolute z-10 text-4xl cursor-pointer hover:scale-150 transition-transform pointer-events-auto"
            style={{ top: y, left: x, rotate: `${rot}deg` }}
            whileHover={{ rotate: rot + 20 }}
            drag
            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
        >
            {children}
        </motion.div>
    );
}

function ChaosModule({ title, color, children, onClick }: { title: string, color: string, children: React.ReactNode, onClick: () => void }) {
    // Deterministic "random" based on title to avoid SSR/hydration mismatch
    const titleHash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hoverRotation = (titleHash % 30 - 15) / 15; // Range: -1 to 1

    return (
        <motion.div
            className={`neo-border p-6 relative overflow-hidden group cursor-pointer bg-white`}
            style={{ borderColor: '#000' }}
            whileHover={{ scale: 1.02, rotate: hoverRotation }}
            onClick={onClick}
        >
            <div className={`absolute inset-0 opacity-10`} style={{ backgroundColor: color }} />
            <div className="relative z-10">
                <h2 className="font-heading text-3xl mb-4 uppercase neo-text-stroke text-white" style={{ textShadow: `4px 4px 0px ${color}` }}>
                    {title}
                </h2>
                {children}
                <div className="mt-4 inline-block font-mono text-xs bg-black text-white px-2 py-1 transform -rotate-1 group-hover:rotate-1 transition-transform">
                    [ CLICK TO EXPAND ]
                </div>
            </div>
        </motion.div>
    );
}

function BuzzingFly() {
    return (
        <motion.div
            className="absolute text-2xl z-20 pointer-events-none"
            animate={{
                x: [0, 100, -50, 20, 0],
                y: [0, -50, 20, 100, 0],
                rotate: [0, 90, 180, 270, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
            🪰
        </motion.div>
    );
}

function TrashItem({ project, index }: { project: any, index: number }) {
    // Deterministic chaos based on index (so it doesn't jitter on re-render)
    const randomRot = (index * 1337) % 40 - 20; // -20 to 20 deg
    const randomX = (index * 42) % 30 - 15; // -15 to 15px
    const randomY = (index * 7) % 20 - 10; // -10 to 10px
    const fonts = ["font-mono", "font-sans", "font-serif", "font-heading"];
    const randomFont = fonts[index % fonts.length];

    return (
        <motion.div
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            className={`absolute neo-border bg-white p-4 w-64 cursor-grab active:cursor-grabbing hover:z-50 shadow-lg ${randomFont}`}
            style={{
                rotate: `${randomRot}deg`,
                zIndex: index, // Newer trash on top
                // Randomish positioning relative to flow if we used absolute, but let's use relative flow with offsets
                // Actually, for a true pile, let's just stack them in a flex wrap with negative margins
            }}
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: randomRot, x: randomX, y: randomY }}
            whileDrag={{ scale: 1.1, zIndex: 100, rotate: 0 }}
        >
            <div className="absolute -top-3 -right-3 text-2xl animate-pulse">
                {[' fly ', ' 🪰 ', ' 🗑️ ', ' 💀 '][index % 4]}
            </div>

            <div className="border-b-2 border-black border-dashed mb-2 pb-1">
                <span className="text-xs font-bold bg-black text-white px-1">
                    ITEM #{index + 420}
                </span>
            </div>

            <h4 className="font-bold text-lg leading-tight mb-1">{project.name}</h4>

            <div className="bg-red-100 border border-red-500 text-red-600 text-[10px] uppercase font-bold px-1 inline-block mb-2 transform -rotate-1">
                {project.status}
            </div>

            <p className="text-sm opacity-70 leading-snug border-t border-black pt-1">
                "{project.cause}"
            </p>
        </motion.div>
    );
}

// === MAIN PAGE ===

export default function CulturesPage() {
    useAnalytics(); // Track page view
    const router = useRouter();
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [shake, setShake] = useState(false);

    // Junkyard State
    const [junkyardItems, setJunkyardItems] = useState<any[]>(defaultGraveyard_FALLBACK);
    const [formData, setFormData] = useState({ name: "", status: "", cause: "" });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Junkyard Data
    useEffect(() => {
        if (activeModule === 'junkyard') {
            fetch(getApiUrl())
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setJunkyardItems(data);
                })
                .catch(err => console.error("Trash API broken (as expected):", err));
        }
    }, [activeModule]);

    const handleDump = async () => {
        if (!formData.name || !formData.status || !formData.cause) return alert("Fill out the trash form!");

        setIsLoading(true);
        triggerDump(); // Animation

        try {
            const res = await fetch(getApiUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const result = await res.json();
                setJunkyardItems(prev => [result.entry, ...prev]);
                setFormData({ name: "", status: "", cause: "" }); // Reset
            } else {
                alert("Server refused your garbage.");
            }
        } catch (e) {
            console.error(e);
            alert("Backend is dead. Long live the backend.");
        }
        setIsLoading(false);
    };

    const triggerDump = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    return (
        <main className="min-h-screen bg-[#fff] text-black overflow-x-hidden selection:bg-[var(--color-acid-pink)]">

            {/* BACKGROUND CHAOS */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '20px 20px' }} />
            </div>

            {/* HEADER */}
            <header className="fixed top-0 w-full z-50 flex justify-between items-center p-6 mix-blend-difference text-white pointer-events-none">
                <Link href="/" className="relative w-24 h-6 block pointer-events-auto">
                    <Image
                        src="/brand/logo_white.png"
                        alt="Codevolt"
                        fill
                        className="object-contain"
                        priority
                    />
                </Link>
                <button
                    onClick={() => {
                        if (activeModule) {
                            setActiveModule(null);
                        } else {
                            // Force hard navigation to clear any React state issues
                            window.location.href = '/';
                        }
                    }}
                    className="pointer-events-auto px-6 py-2 border-2 border-white font-mono font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all cursor-pointer flex items-center gap-2 group"
                >
                    <span>{activeModule ? 'BACK TO CHAOS' : 'CANCEL & EXIT'}</span>
                    <span className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform">
                        {activeModule ? '↵' : '↗'}
                    </span>
                </button>
            </header>

            {/* MARQUEE */}
            <div className="bg-[var(--color-acid-green)] border-y-4 border-black py-2 mt-16 overflow-hidden flex">
                <div className="animate-marquee whitespace-nowrap font-mono font-bold text-lg flex gap-8 px-4">
                    <span>⚠️ WARNING: HIGH LEVELS OF CRINGE DETECTED</span>
                    <span>⚠️ DO NOT FEED THE DEVELOPERS</span>
                    <span>⚠️ SLEEP IS FOR THE WEAK</span>
                    <span>⚠️ PUSHING TO PRODUCTION ON FRIDAY</span>
                </div>
                <div className="animate-marquee whitespace-nowrap font-mono font-bold text-lg flex gap-8 px-4">
                    <span>⚠️ WARNING: HIGH LEVELS OF CRINGE DETECTED</span>
                    <span>⚠️ DO NOT FEED THE DEVELOPERS</span>
                    <span>⚠️ SLEEP IS FOR THE WEAK</span>
                    <span>⚠️ PUSHING TO PRODUCTION ON FRIDAY</span>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 py-12 relative z-10">

                {/* HERO TITLE */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-20 relative"
                >
                    <h1 className="font-heading text-[15vw] leading-none neo-text-stroke tracking-tighter hover:text-black transition-colors duration-300">
                        CULTURES
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-5deg] bg-[var(--color-acid-pink)] px-4 py-2 neo-border">
                        <span className="font-mono font-bold text-white text-xl md:text-3xl">JUST FUNK</span>
                    </div>
                </motion.div>

                {/* MODULE GRID or ACTIVE MODULE */}
                <AnimatePresence mode="wait">
                    {!activeModule ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            <ChaosModule title="Wall of Attempts" color="var(--color-acid-pink)" onClick={() => setActiveModule('wall')}>
                                <p className="font-mono text-sm leading-tight">
                                    A shrine to our collective failures.
                                    <br /><br />
                                    <strong>Latest:</strong> "Deleted Prod DB"
                                </p>
                            </ChaosModule>

                            <ChaosModule title="Survival Kit" color="var(--color-acid-cyan)" onClick={() => setActiveModule('survival')}>
                                <p className="font-mono text-sm leading-tight">
                                    Tools for the psychologically damage.
                                    <br /><br />
                                    <strong>In Stock:</strong> Anxiety
                                </p>
                            </ChaosModule>

                            <ChaosModule title="HOD Guide" color="var(--color-acid-green)" onClick={() => setActiveModule('hod')}>
                                <p className="font-mono text-sm leading-tight">
                                    The Art of Academic Manipulation.
                                    <br /><br />
                                    <strong>Status:</strong> CLASSIFIED
                                </p>
                            </ChaosModule>

                            <ChaosModule title="The Junkyard" color="#39ff14" onClick={() => setActiveModule('junkyard')}>
                                <p className="font-mono text-sm leading-tight">
                                    Where bad ideas go to die.
                                    <br /><br />
                                    <strong>Burial Count:</strong> ∞
                                </p>
                            </ChaosModule>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="module"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className={`neo-border bg-white p-8 md:p-12 relative min-h-[60vh] ${shake ? 'animate-bounce' : ''}`}
                        >
                            {/* WALL OF ATTEMPTS CONTENT */}
                            {activeModule === 'wall' && (
                                <div className="font-mono">
                                    <h2 className="text-5xl font-heading mb-8 bg-black text-white inline-block p-2 transform -rotate-1">WALL OF ATTEMPTS</h2>
                                    <div className="bg-black text-[var(--color-acid-green)] p-6 neo-border overflow-hidden relative">
                                        <Sticker x="80%" y="10%" rot={10}>🔥</Sticker>
                                        <Sticker x="10%" y="40%" rot={-5}>🐛</Sticker>
                                        <div className="space-y-4 font-bold">
                                            {attemptsLog.map((log, i) => (
                                                <div key={i} className="border-b border-[var(--color-acid-green)] pb-2 flex flex-col md:flex-row gap-4 hover:bg-[var(--color-acid-green)] hover:text-black transition-colors p-2 cursor-crosshair">
                                                    <span className="opacity-50 min-w-[100px]">{log.time}</span>
                                                    <span className="flex-1 uppercase">_ {log.action}</span>
                                                    <span>{log.sticker} {log.outcome}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SURVIVAL KIT CONTENT */}
                            {activeModule === 'survival' && (
                                <div>
                                    <h2 className="text-5xl font-heading mb-8 bg-[var(--color-acid-cyan)] text-black inline-block p-2 transform rotate-2 neo-border">SURVIVAL KIT</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {survivalItems.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                                                className="neo-border p-4 bg-white flex flex-col items-center text-center hover:shadow-[8px_8px_0px_var(--color-acid-pink)] transition-shadow"
                                            >
                                                <div className="text-6xl mb-4">{item.icon}</div>
                                                <h3 className="font-heading text-xl font-bold uppercase mb-1">{item.name}</h3>
                                                <p className="font-mono text-xs opacity-60 text-[var(--color-acid-pink)] font-bold">{item.desc}</p>
                                                <button className="mt-4 bg-black text-white px-4 py-1 font-mono text-xs hover:bg-[var(--color-acid-pink)] w-full">
                                                    NEED IT
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* HOD GUIDE CONTENT */}
                            {activeModule === 'hod' && (
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <h2 className="text-5xl font-heading bg-[var(--color-acid-yellow)] text-black inline-block p-2 transform -rotate-1 neo-border">OPERATION: HOD</h2>
                                        <div className="text-red-600 font-black border-4 border-red-600 p-2 transform rotate-12 text-2xl uppercase">TOP SECRET</div>
                                    </div>
                                    <div className="space-y-6 max-w-4xl relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-1 bg-black hidden md:block" />
                                        {hodSteps.map((step, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: -50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="relative pl-0 md:pl-12"
                                            >
                                                <div className="absolute left-2 top-6 w-5 h-5 bg-white border-4 border-black rounded-full hidden md:block z-10" />
                                                <div className="neo-border bg-[#f0f0f0] p-6 transform hover:translate-x-2 transition-transform relative">
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[rgba(255,255,200,0.8)] transform -rotate-1 shadow-sm" />
                                                    <h3 className="font-heading text-2xl font-bold mb-2">{step.title}</h3>
                                                    <p className="font-mono text-lg">{step.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* JUNKYARD CONTENT */}
                            {activeModule === 'junkyard' && (
                                <div>
                                    <BuzzingFly />
                                    <BuzzingFly />
                                    <div className="flex justify-between items-start mb-8">
                                        <h2 className="text-5xl font-heading bg-[#39ff14] text-black inline-block p-2 transform rotate-1 neo-border">PROJECT JUNKYARD</h2>
                                        <div className="font-mono text-xs bg-black text-[#39ff14] p-2 rotate-3">
                                            RADIOACTIVE WASTE
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* THE PILE */}
                                        {/* THE PILE */}
                                        <div className="relative min-h-[600px] border-4 border-black border-dashed bg-[#f0f0f0] overflow-hidden p-8" style={{ backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                                            <div className="absolute top-0 left-0 bg-yellow-300 px-4 py-1 font-bold border-b-4 border-r-4 border-black z-10">
                                                THE DUMPSTER ({junkyardItems.length} items)
                                            </div>

                                            {/* Container for the pile */}
                                            <div className="flex flex-wrap justify-center items-center h-full pt-12 relative">
                                                {junkyardItems.map((project, i) => (
                                                    <div key={project.timestamp || i} className="relative w-12 h-12 -mx-6 -my-6"> {/* Phantom container to cluster them */}
                                                        <TrashItem project={project} index={i} />
                                                    </div>
                                                ))}

                                                {junkyardItems.length === 0 && (
                                                    <div className="opacity-30 text-center font-mono font-bold">
                                                        NO TRASH YET.<br />BE THE FIRST FAILURE.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="neo-border bg-[#eee] p-6 sticky top-8">
                                            <h3 className="font-heading text-2xl uppercase mb-6 flex items-center gap-2">
                                                <span>⚰️</span> Burial Form
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block font-mono text-xs font-bold mb-1">PROJECT NAME</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border-2 border-black p-2 font-mono"
                                                        placeholder="e.g. Uber for Socks"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-mono text-xs font-bold mb-1">STATUS</label>
                                                    <select
                                                        className="w-full border-2 border-black p-2 font-mono"
                                                        value={formData.status}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    >
                                                        <option value="">Select Level of Failure...</option>
                                                        <option value="Works (God Knows How)">Works (God Knows How)</option>
                                                        <option value="Segfault City">Segfault City</option>
                                                        <option value="My Dog Ate The Repo">My Dog Ate The Repo</option>
                                                        <option value="Stack Overflow Copy-Paste">Stack Overflow Copy-Paste</option>
                                                        <option value="Sentient & Evil">Sentient & Evil</option>
                                                        <option value="404: Brain Not Found">404: Brain Not Found</option>
                                                        <option value="Funded by Grandma">Funded by Grandma</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block font-mono text-xs font-bold mb-1">CAUSE OF DEATH</label>
                                                    <textarea
                                                        className="w-full border-2 border-black p-2 font-mono"
                                                        rows={3}
                                                        placeholder="Why did it die?"
                                                        value={formData.cause}
                                                        onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleDump}
                                                    disabled={isLoading}
                                                    className="w-full bg-red-600 text-white font-heading text-xl py-3 border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all active:bg-red-700 disabled:opacity-50"
                                                >
                                                    {isLoading ? "DUMPING..." : "DUMP IT INTO THE VOID"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}
