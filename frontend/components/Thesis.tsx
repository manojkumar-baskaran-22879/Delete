"use client";

import { motion } from "framer-motion";

export default function Thesis() {
    return (
        <section id="thesis" className="relative overflow-hidden">
            {/* Subtle diagonal lines background */}
            <div className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)`
                }}
            />

            <div className="section-container">
                <div className="section-grid">
                    {/* Left: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="accent-line" />
                        <h2 className="section-title">
                            The Thesis: From 0s and 1s to <br />
                            <span className="text-brand-primary font-medium">0 → 1</span>
                        </h2>

                        <div className="space-y-6 text-lg text-text-muted leading-relaxed">
                            <p>
                                Everyone has ideas. The difference is who has the courage to build them and the judgment to know which ones are worth pursuing.
                            </p>

                            <p>
                                That's what CodeVolt 2.0 is about. For three days, you'll be surrounded by hundreds of builders chasing the same goal, each taking a completely different path. You'll question assumptions, scrap ideas, pivot, rebuild, and maybe even start over. That's part of the process.
                            </p>

                            <p>
                                By the end, what you have won't just be another MVP. It could be the beginning of a product with the potential to become something bigger. And even if it isn't, you'll leave knowing that your next breakthrough could be just three days away.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Creative Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="hidden lg:flex items-center justify-center relative"
                    >
                        {/* Outer glow ring */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-80 h-80 rounded-full border border-brand-primary/20" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 rounded-full border border-brand-primary/10" />
                        </div>

                        {/* Main visual */}
                        <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="relative"
                                >
                                    <span className="text-[8rem] sm:text-[10rem] font-black text-brand-primary/10 select-none leading-none">0</span>
                                    <motion.span
                                        className="absolute top-1/2 left-full -translate-y-1/2 text-6xl text-brand-primary font-bold ml-2"
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.4 }}
                                    >→</motion.span>
                                    <motion.span
                                        className="absolute top-1/2 left-full -translate-y-1/2 text-[8rem] sm:text-[10rem] font-black text-brand-primary/20 select-none leading-none ml-16"
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.5 }}
                                    >1</motion.span>
                                </motion.div>
                                <p className="font-mono text-sm text-text-muted tracking-widest mt-4">THE BUILDER'S JOURNEY</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
