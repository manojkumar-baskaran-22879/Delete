"use client";

import { motion } from "framer-motion";

const evaluationData = [
    {
        focus: "Problem Clarity",
        matters: "Clear thinking > Complex features",
        doesnt: "Animated slides",
    },
    {
        focus: "User Understanding",
        matters: "Honest validation > Assumptions",
        doesnt: "Buzzwords & Trending Tech",
    },
    {
        focus: "Product Thinking",
        matters: "Direction > Speed",
        doesnt: "Overbuilding",
    },
    {
        focus: "Business Sense",
        matters: "Decision Ownership",
        doesnt: "AI-generated \"decisions\"",
    },
];

export default function Evaluation() {
    return (
        <section className="bg-surface relative overflow-hidden">
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
                            The Builder’s <span className="text-gradient">Evaluation</span>
                        </h2>
                        <p className="text-lg text-text-muted max-w-lg">
                            We don't use scorecards or predefined checklists. Teams are evaluated the way early-stage startups are: through <strong className="text-text-main font-semibold">decisions, clarity, and execution.</strong>
                        </p>

                        {/* Note on AI */}
                        <div className="mt-8 p-5 border-accent bg-background">
                            <p className="text-text-muted">
                                <strong className="text-brand-primary font-semibold">A Note on AI:</strong> AI can help you move faster, but it cannot decide for you. Teams relying on AI-generated ideas or copied concepts will be disqualified.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-x-auto"
                    >
                        <table className="w-full border-collapse bg-background/80 backdrop-blur-sm rounded-lg overflow-hidden relative z-20">
                            <thead>
                                <tr className="border-b-2 border-brand-primary">
                                    <th className="text-left py-4 px-4 font-mono text-sm font-medium text-brand-primary uppercase tracking-wider">Focus On</th>
                                    <th className="text-left py-4 px-4 font-mono text-sm font-medium text-text-main uppercase tracking-wider">What Matters</th>
                                    <th className="text-left py-4 px-4 font-mono text-sm font-medium text-text-muted uppercase tracking-wider">What Doesn't</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evaluationData.map((row, index) => (
                                    <tr key={index} className="border-b border-grid-line hover:bg-surface/50 transition-colors">
                                        <td className="py-5 px-4 font-semibold text-text-main">{row.focus}</td>
                                        <td className="py-5 px-4 text-text-main font-medium">{row.matters}</td>
                                        <td className="py-5 px-4 text-text-muted line-through opacity-50">{row.doesnt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
