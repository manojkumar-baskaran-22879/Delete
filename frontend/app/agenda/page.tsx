"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

// --- Data ---
type Event = {
    time: string;
    title: string;
    description?: string;
    type?: "keynote" | "gate" | "food" | "activity";
};

type DaySchedule = {
    id: string;
    title: string; // e.g., "DAY 1"
    subtitle: string; // e.g., "CONTEXT & DECISIONS"
    events: Event[];
};

const schedule: DaySchedule[] = [
    {
        id: "day1",
        title: "DAY 1",
        subtitle: "THE IDEA: Foundation",
        events: [
            { time: "07:30", title: "Walk-in & Registration" },
            { time: "08:30", title: "CodeVolt 2.0 Opening", type: "keynote" },
            { time: "09:00", title: "Keynote Sessions", description: "Speakers to be revealed soon" },
            { time: "09:30", title: "Partner Product / Platform Briefings" },
            { time: "10:00", title: "Rules of Reality Briefing", type: "keynote" },
            { time: "10:30", title: "Gate 1 Opens", description: "Problem & Market Fit", type: "gate" },
            { time: "12:00", title: "Mentor Walkthroughs" },
            { time: "13:30", title: "Lunch", type: "food" },
            { time: "16:00", title: "Partner Tech Workshops" },
            { time: "17:30", title: "Snacks", type: "food" },
            { time: "20:30", title: "Dinner", type: "food" },
            { time: "22:00", title: "Networking / Music Night", type: "activity" },
        ]
    },
    {
        id: "day2",
        title: "DAY 2",
        subtitle: "THE BUILD: Execution",
        events: [
            { time: "05:30", title: "Gate 1 Closes", type: "gate" },
            { time: "06:45", title: "Gate 1 Results" },
            { time: "06:50", title: "Pan-India Wide Angle Photo", type: "activity" },
            { time: "08:30", title: "Breakfast", type: "food" },
            { time: "13:30", title: "Lunch", type: "food" },
            { time: "15:30", title: "Mentor Reality Check" },
            { time: "17:30", title: "Gate 2 Closes", description: "MVP & Execution", type: "gate" },
            { time: "17:30", title: "Snacks", type: "food" },
            { time: "18:30", title: "Gate 2 Results" },
            { time: "20:30", title: "Dinner", type: "food" },
            { time: "22:00", title: "Activity", type: "activity" }, // Placeholder as requested
        ]
    },
    {
        id: "day3",
        title: "DAY 3",
        subtitle: "THE BUSINESS: Readiness",
        events: [
            { time: "08:30", title: "Breakfast", type: "food" },
            { time: "09:30", title: "Final Gate", description: "Startup Readiness Review", type: "gate" },
            { time: "11:30", title: "Veteran Speaker Session" },
            { time: "12:00", title: "Winners Announcement", type: "keynote" },
            { time: "12:15", title: "What Happens After CodeVolt" },
            { time: "12:30", title: "CodeVolt 2.0 Wind-up" },
        ]
    }
];

// --- Components ---
const TimelineItem = ({ event, index }: { event: Event; index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="relative pl-8 pb-10 last:pb-0 border-l-2 border-white/20 group"
        >
            {/* Timeline Node */}
            <div className={`absolute left-0 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0a] transition-all duration-300 ${event.type === 'gate' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-125' : event.type === 'keynote' ? 'bg-brand-primary shadow-[0_0_12px_rgba(255,69,0,0.8)] scale-110' : 'bg-white/40 group-hover:bg-white group-hover:scale-125'}`} />

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                <div className="flex-shrink-0 w-20 text-base font-mono font-bold text-brand-primary tracking-wider">
                    {event.time}
                </div>
                <div className="flex-1">
                    <h3 className={`text-xl font-bold tracking-tight mb-1 transition-colors ${event.type === 'gate' ? 'text-red-400' : event.type === 'keynote' ? 'text-[#FF6B35]' : 'text-white group-hover:text-brand-primary'}`}>
                        {event.title}
                    </h3>
                    {event.description && <p className="text-sm font-medium text-white/80 mt-0.5">{event.description}</p>}
                </div>
            </div>
        </motion.div>
    );
};

export default function AgendaPage() {
    useAnalytics(); // Track page view
    const router = useRouter();
    const [activeDay, setActiveDay] = useState<string>("day1");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") router.push("/");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    const activeSchedule = schedule.find(s => s.id === activeDay) || schedule[0];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand-primary selection:text-white flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="relative w-24 h-6 block">
                        <Image
                            src="/brand/logo_orange.png"
                            alt="Codevolt 2.0"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                    <button onClick={() => router.push("/")} className="text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                        [ ESC ] Back to Home
                    </button>
                </div>
            </header>

            <div className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Text */}
                    <div className="text-center mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-mono uppercase tracking-widest text-white/80 font-semibold">Live Schedule</span>
                            </div>
                            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-6">
                                <span className="text-white">The 3-Day</span>
                                <br />
                                <span className="text-gradient">Protocol</span>
                            </h1>
                            <p className="text-lg text-white/70 max-w-xl mx-auto font-medium">
                                From 0s and 1s to 0→1. A timeline of chaos, creation, and clarity.
                            </p>
                        </motion.div>
                    </div>

                    {/* Day Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16 sticky top-20 z-40 py-4 bg-[#0a0a0a]/95 backdrop-blur-md -mx-6 px-6">
                        {schedule.map((day) => (
                            <button
                                key={day.id}
                                onClick={() => setActiveDay(day.id)}
                                className={`px-6 py-3 rounded-full text-sm font-mono uppercase tracking-widest font-bold transition-all duration-300 border ${activeDay === day.id
                                    ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_25px_rgba(255,69,0,0.4)]"
                                    : "bg-white/10 text-white/80 border-white/20 hover:border-white/50 hover:text-white"
                                    }`}
                            >
                                {day.title}
                            </button>
                        ))}
                    </div>

                    {/* Timeline Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDay}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="bg-[#121218] border border-white/15 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl"
                        >
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                            {/* Header for Day */}
                            <div className="relative mb-12 pb-8 border-b border-white/15">
                                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-2 tracking-tight">{activeSchedule.title}</h2>
                                <p className="text-brand-primary font-mono text-base font-bold tracking-widest uppercase">{activeSchedule.subtitle}</p>
                            </div>

                            {/* Timeline Items */}
                            <div className="relative ml-2 md:ml-4">
                                {activeSchedule.events.map((event, i) => (
                                    <TimelineItem key={`${activeDay}-${i}`} event={event} index={i} />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Quick Footer */}
            <div className="py-8 text-center border-t border-white/5 mx-6">
                <div className="flex justify-center gap-6 text-xs font-mono text-white/30">
                    <Link href="/faq" className="hover:text-brand-primary transition-colors">FAQ</Link>
                    <Link href="/gallery" className="hover:text-brand-primary transition-colors">2025 Gallery</Link>
                </div>
            </div>
        </main>
    );
}
