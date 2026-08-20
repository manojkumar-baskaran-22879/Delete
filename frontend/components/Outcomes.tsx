"use client";

import { motion } from "framer-motion";

const topTeamPerks = [
    "Incubation support for selected ideas.",
    "Internship opportunities and Pre-Placement Offers (PPOs).",
    "The Raptee.HV Experience: An exclusive factory tour and strategy session with the core team.",
];

const allBuilderPerks = [
    "Premium Swag & Participation Certificates.",
    "Full-event catering (Meals, snacks, and beverages).",
    "Test Rides: Raptee.HV T30 and T30 Sport.",
    "Technical Workshops & Music Club energy.",
];

export default function Outcomes() {
    return (
        <section id="outcomes" className="bg-surface relative overflow-hidden">
            <div className="section-container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="accent-line" />
                    <h2 className="section-title mb-10">
                        Outcomes & <span className="text-gradient">Perks</span>
                    </h2>

                    <div className="section-grid">
                        {/* Top Teams */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="card border-2 border-brand-primary hover:border-brand-primary"
                        >
                            <div className="badge mb-6">For Top Teams</div>
                            <ul className="space-y-4">
                                {topTeamPerks.map((perk, index) => (
                                    <li key={index} className="flex items-start gap-4">
                                        <span className="text-brand-primary text-xl mt-0.5">→</span>
                                        <span className="text-text-main font-medium">{perk}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* All Builders */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="card"
                        >
                            <h3 className="font-mono text-text-muted text-sm font-medium uppercase tracking-wider mb-6">
                                Included for All Builders
                            </h3>
                            <ul className="space-y-4">
                                {allBuilderPerks.map((perk, index) => (
                                    <li key={index} className="flex items-start gap-4">
                                        <span className="text-text-muted text-xl mt-0.5">•</span>
                                        <span className="text-text-muted">{perk}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
