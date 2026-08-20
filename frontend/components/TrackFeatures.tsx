"use client";

import { motion } from "framer-motion";
import { Users, Clock, Globe, MapPin } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const features = [
    {
        number: "01",
        title: "Format",
        getContent: () => "Teams of 3-5 builders. No solo entries.",
        icon: Users,
    },
    {
        number: "02",
        title: "Duration",
        getContent: () => "3 Days non-stop. Overnight sprint.",
        icon: Clock,
    },
    {
        number: "03",
        title: "Eligibility",
        getContent: () => "Any year, any college, any discipline.",
        icon: Globe,
    },
    {
        number: "04",
        title: "Location",
        getContent: (isActive: boolean) => (
            <>
                Offline.{" "}
                <a
                    href="https://maps.app.goo.gl/p6zoVM9hwZQLx7fX6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-bold underline underline-offset-2 transition-colors ${
                        isActive
                            ? "text-white hover:text-white/80"
                            : "text-[#FF4D00] hover:text-[#FF4D00]/80 group-hover:text-white"
                    }`}
                >
                    VIT, Vellore
                </a>
                . September 9–11.
            </>
        ),
        icon: MapPin,
    },
];

export default function TrackFeatures() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="bg-surface py-20 border-b border-grid-line relative overflow-hidden">
            <div className="section-container max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
                    {/* Left Column: Title & Description */}
                    <div className="lg:w-[45%] flex flex-col justify-center">
                        <motion.h2
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="font-heading text-[120px] md:text-[180px] lg:text-[200px] leading-[0.8] font-black text-text-main tracking-tighter mb-12 select-none"
                        >
                            OUR <br />
                            <span className="text-[#FF4D00]">RULES</span>
                        </motion.h2>

                        <div className="relative pl-8 border-l-4 border-[#FF4D00]">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl md:text-3xl font-light text-text-main mb-4 leading-tight"
                            >
                                Chaos needs a container to become creation.
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-lg text-text-muted font-mono mb-6"
                            >
                                These are the high-voltage parameters where your raw potential
                                turns into kinetic innovation. Read them. Breathe them. Break everything else.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <Link
                                    href="/terms"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF4D00] text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#FF4D00]/90 transition-all shadow-md group"
                                >
                                    <span>Rules & Regulations</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column: Compact 2x2 Grid */}
                    <div className="lg:w-[55%] flex flex-col justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={feature.number}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.4 }}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    className={`
                                        group relative p-8 flex flex-col justify-between transition-all duration-300 min-h-[220px] cursor-default
                                        ${activeIndex === i
                                            ? 'bg-[#FF4D00] text-white shadow-2xl shadow-orange-500/20 scale-[1.02]'
                                            : 'bg-surface-light border border-grid-line hover:border-[#FF4D00] hover:bg-surface-light/80'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <feature.icon
                                            size={32}
                                            strokeWidth={1.5}
                                            className={activeIndex === i ? "text-white" : "text-[#FF4D00]"}
                                        />
                                        <span className={`text-xs font-mono font-bold tracking-widest ${activeIndex === i ? "text-white/60" : "text-text-muted/60"}`}>
                                            {feature.number}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className={`text-2xl font-heading font-bold mb-2 ${activeIndex === i ? "text-white" : "text-text-main"}`}>
                                            {feature.title}
                                        </h3>
                                        <p className={`text-base font-mono leading-relaxed ${activeIndex === i ? "text-white/80" : "text-text-muted"}`}>
                                            {feature.getContent(activeIndex === i)}
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
