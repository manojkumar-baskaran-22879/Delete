"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { API_BASE_URL } from "@/lib/config";

export default function Admissions() {
    const { trackEvent } = useAnalytics();
    const [price, setPrice] = useState<string | null>(null);
    const [status, setStatus] = useState<"ACCEPTING" | "OPENING SOON">("OPENING SOON");

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/settings`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const isEarlyBird = data.earlyBird;
                    const isStandard = data.standardEnabled ?? true; // Default to true if missing
                    const isRegistrationOpen = data.registrationOpen ?? true;

                    if (!isRegistrationOpen || (!isEarlyBird && !isStandard)) {
                        setPrice(null);
                        setStatus("OPENING SOON");
                    } else {
                        setStatus("ACCEPTING");

                        // Priority: Early Bird > Standard for price display
                        if (isEarlyBird) {
                            setPrice(data.prices.earlyBird.toString());
                        } else {
                            setPrice(data.prices.standard.toString());
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to fetch price", e);
            }
        };
        fetchPrice();
    }, []);

    return (
        <section id="admissions" className="bg-[#0a0a0f] relative overflow-hidden py-32">

            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />

            <div className="section-container relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">

                        {/* Left: Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-px w-12 bg-brand-primary" />
                                <span className="font-mono text-brand-primary uppercase tracking-widest text-sm font-bold">Registration Open</span>
                            </div>

                            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[0.9] tracking-tight">
                                Claim My <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-white">Pass.</span>
                            </h2>

                            <p className="text-xl text-white/60 mb-10 leading-relaxed max-w-md">
                                Limited availability for the 2026 cohort. Join the builders, designers, and dreamers defining the future.
                            </p>

                            <div className={`${status === "OPENING SOON" ? "opacity-50 pointer-events-none grayscale" : ""}`}>
                                <Link href="/register" className={status === "OPENING SOON" ? "pointer-events-none" : ""}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => trackEvent("Admissions - GET PASSES")}
                                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-black font-bold text-lg rounded-none hover:bg-white transition-colors"
                                        disabled={status === "OPENING SOON"}
                                    >
                                        <span className="inline-block">{status === "OPENING SOON" ? "OPENING SOON" : "GET PASSES"}</span>
                                        <svg
                                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M5 12h14" />
                                            <path d="m12 5 7 7-7 7" />
                                        </svg>
                                    </motion.button>
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center gap-8 text-sm font-mono text-white/40">
                                <div>// 3 DAYS</div>
                            </div>
                        </motion.div>

                        {/* Right: Visual Abstract */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Card Stack Effect */}
                            <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                                <div className="flex justify-between items-start mb-12">
                                    <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono text-white/40 mb-1">BATCH</div>
                                        <div className="text-xl font-bold text-white">2026</div>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                                    <div className="h-2 w-full bg-white/10 rounded-full" />
                                    <div className="h-2 w-5/6 bg-white/10 rounded-full" />
                                </div>
                                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <div className="text-xs font-mono text-white/40 mb-1">STATUS</div>
                                        <div className={`${status === "ACCEPTING" ? "text-green-500" : "text-amber-500"} font-bold flex items-center gap-2`}>
                                            <span className={`w-2 h-2 rounded-full ${status === "ACCEPTING" ? "bg-green-500" : "bg-amber-500"} animate-pulse`} />
                                            {status}
                                        </div>
                                    </div>
                                    {price && (
                                        <div className="text-3xl font-bold text-white">
                                            ₹{price}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-4 -right-4 w-full h-full border border-white/5 rounded-2xl z-0" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-primary/10 blur-2xl rounded-full" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
