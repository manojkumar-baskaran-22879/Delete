"use client";

import { motion } from "framer-motion";

const gates = [
    {
        day: 1,
        title: "The Idea",
        subtitle: "Clarity begins here.",
        description: "Identify a real problem, question every assumption, and, most importantly, decide what not to build.",
    },
    {
        day: 2,
        title: "The Product",
        subtitle: "Execution exposes reality.",
        description: "Turn intent into a functional MVP. Validate with real use cases and navigate difficult trade-offs.",
    },
    {
        day: 3,
        title: "The Business",
        subtitle: "Readiness matters.",
        description: "Define value, map your users/market, and present a working product.",
    },
];


export default function Gates() {
    return (
        <section id="gates" className="bg-surface relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-brand-primary/5 to-transparent pointer-events-none" />

            <div className="section-container relative z-10">
                <div className="section-grid">
                    {/* Left: Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="accent-line" />
                        <h2 className="section-title">
                            How it Works: <span className="text-brand-primary font-medium">3 Days. 3 Gates.</span>
                        </h2>
                        <p className="text-lg text-text-muted leading-relaxed max-w-lg">
                            The journey follows the full arc of early-stage startup building: problem selection, validation, trade-offs, and defense.
                        </p>
                        <p className="mt-4 text-text-main font-semibold text-lg">
                            Not every team reaches the final day.
                        </p>
                    </motion.div>

                    {/* Right: Premium Timeline */}
                    <div className="relative">
                        {/* Connecting Line with gradient */}
                        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-primary via-brand-primary/50 to-brand-primary/20 lg:left-9" />

                        <div className="space-y-10">
                            {gates.map((gate, index) => (
                                <motion.div
                                    key={gate.day}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.15 }}
                                    className="relative flex gap-6 lg:gap-8 group"
                                >
                                    {/* Gate Marker */}
                                    <motion.div
                                        className="relative z-10 flex-shrink-0 w-14 h-14 lg:w-18 lg:h-18 flex items-center justify-center bg-background border-2 border-brand-primary group-hover:bg-brand-primary transition-colors duration-300"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <span className="font-mono text-brand-primary font-black text-xl lg:text-2xl group-hover:text-white transition-colors duration-300">
                                            {gate.day}
                                        </span>
                                    </motion.div>

                                    {/* Content Card */}
                                    <div className="flex-1 pt-4 pb-4 px-4 bg-background/80 backdrop-blur-sm border border-transparent border-b-grid-line group-hover:border-brand-primary/30 transition-all duration-300 rounded-lg">
                                        <h3 className="text-xl lg:text-2xl font-medium text-text-main mb-2">
                                            Day {gate.day}: {gate.title}
                                        </h3>
                                        <p className="text-brand-primary font-mono text-sm font-semibold mb-3 tracking-wide">
                                            {gate.subtitle}
                                        </p>
                                        <p className="text-text-muted leading-relaxed">
                                            {gate.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
