"use client";

import { motion } from "framer-motion";

const agendaDays = [
    {
        day: 1,
        title: "THE IDEA: Foundation",
        events: [
            { time: "07:30", label: "Walk-in & Registration" },
            { time: "09:00", label: "Keynote: The Founder Mindset" },
            { time: "10:30", label: "Gate 1 Opens: Problem & Market Fit", isGate: true },
            { time: "12:00", label: "Mentor Walkthroughs" },
            { time: "22:00", label: "Networking / Midnight Music Session" },
        ],
    },
    {
        day: 2,
        title: "THE BUILD: Execution",
        events: [
            { time: "05:30", label: "Gate 1 Closes", isGate: true },
            { time: "06:50", label: "Pan-India Wide-Angle Group Photo" },
            { time: "15:30", label: "Mentor Reality Check" },
            { time: "17:30", label: "Gate 2 Closes: MVP & Execution", isGate: true },
            { time: "22:00", label: "Night Activity" },
        ],
    },
    {
        day: 3,
        title: "THE BUSINESS: Readiness",
        events: [
            { time: "09:30", label: "Final Gate: Startup Readiness Review", isGate: true },
            { time: "11:30", label: "Veteran Speaker Session" },
            { time: "12:00", label: "Winners Announcement & The Path Forward" },
        ],
    },
];

export default function Agenda() {
    return (
        <section id="agenda" className="relative">
            <div className="section-container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="accent-line" />
                    <h2 className="section-title mb-10">
                        Agenda: <span className="text-brand-primary font-medium">The 3-Day Arc</span>
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {agendaDays.map((day, dayIndex) => (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
                                className="border border-grid-line bg-white hover:border-brand-primary/30 transition-colors duration-300"
                            >
                                {/* Day Header - Fixed Contrast */}
                                <div className="p-5 border-b border-grid-line bg-surface">
                                    <span className="font-mono text-brand-primary text-xs font-bold tracking-widest">DAY {day.day}</span>
                                    <h3 className="text-text-main font-medium text-lg mt-1">{day.title}</h3>
                                </div>

                                {/* Events */}
                                <div className="p-5 space-y-4">
                                    {day.events.map((event, eventIndex) => (
                                        <div
                                            key={eventIndex}
                                            className={`flex gap-4 ${event.isGate ? '' : ''}`}
                                        >
                                            <span className={`font-mono text-sm shrink-0 w-14 font-semibold ${event.isGate ? 'text-brand-primary' : 'text-text-muted'}`}>
                                                {event.time}
                                            </span>
                                            <span className={event.isGate ? 'text-brand-primary font-semibold' : 'text-text-muted'}>
                                                {event.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

