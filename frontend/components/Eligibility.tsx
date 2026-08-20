"use client";

import { motion } from "framer-motion";

const eligibilityItems = [
    { label: "Who", value: "Students from any year, college, or discipline." },
    { label: "Teams", value: "3–5 members (No individual entries)." },
    { label: "Expectation", value: "Full offline, overnight participation is required for the duration of the sprint." },
];

const restrictions = [
    "No hardware-based startups.",
    "No pre-built ideas.",
    "No replicas of existing products.",
];

export default function Eligibility() {
    return (
        <section className="border-b border-grid-line">
            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h2 className="text-3xl lg:text-4xl font-medium mb-4">
                        Eligibility & <span className="text-brand-primary">Expectations</span>
                    </h2>
                    <p className="text-lg text-text-muted mb-8">
                        <strong className="text-text-main">Open to all.</strong>
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
                        {/* Requirements */}
                        <div className="space-y-4">
                            {eligibilityItems.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 border border-grid-line bg-background">
                                    <span className="font-mono text-brand-primary text-sm shrink-0 w-24">{item.label}:</span>
                                    <span className="text-text-main">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Restrictions */}
                        <div className="p-6 border border-brand-primary/30 bg-brand-primary/5">
                            <h3 className="font-mono text-brand-primary text-sm uppercase tracking-wider mb-4">
                                Restrictions
                            </h3>
                            <ul className="space-y-2">
                                {restrictions.map((restriction, index) => (
                                    <li key={index} className="flex items-center gap-3 text-text-main">
                                        <span className="text-brand-primary">✕</span>
                                        <span>{restriction}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
