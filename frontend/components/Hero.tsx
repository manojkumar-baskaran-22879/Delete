"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlimeDish from "./SlimeDish";
import ASCIICamera from "./ASCIICamera";

import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

export default function Hero() {
    const [cameraActive, setCameraActive] = useState(false);
    const [status, setStatus] = useState<"ACCEPTING" | "OPENING SOON">("OPENING SOON");

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/settings`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const isEarlyBird = data.earlyBird;
                    const isStandard = data.standardEnabled ?? true;
                    const isRegistrationOpen = data.registrationOpen ?? true;

                    if (!isRegistrationOpen || (!isEarlyBird && !isStandard)) {
                        setStatus("OPENING SOON");
                    } else {
                        setStatus("ACCEPTING");
                    }
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        };
        fetchStatus();
    }, []);

    return (
        <section className="relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
            {/* Left Interface: Value Prop */}
            <div className="relative flex flex-col justify-center px-[24px] pt-32 pb-12 sm:px-[48px] lg:px-[48px] xl:px-[96px] bg-background z-10 overflow-hidden">
                {/* Terminal Tag */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-0 w-fit"
                >
                    <div className="relative w-48 h-12">
                        <Image
                            src="/brand/raptee_logo.png"
                            alt="Raptee.HV"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-heading text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] mb-6"
                >
                    <span className="text-foreground">Codevolt</span>
                    <br />
                    <span className="text-brand-primary">2.0</span>
                </motion.h1>

                {/* Meta Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-4 font-mono text-sm text-foreground/60 mb-8"
                >
                    <div className="flex items-center gap-2 text-brand-primary">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>9–11 SEPTEMBER 2026</span>
                    </div>
                    <span className="text-foreground/30">|</span>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span><a href="https://maps.app.goo.gl/p6zoVM9hwZQLx7fX6" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors hover:underline">VIT, Vellore</a></span>
                    </div>
                </motion.div>

                {/* Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="w-16 h-[2px] bg-brand-primary mb-8 origin-left"
                />

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg font-heading text-foreground mb-2"
                    style={{ fontWeight: 700 }} // Bold
                >
                    3 Days. Fully Offline. Overnight Sprint.
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-base text-foreground/60 max-w-md mb-10"
                >
                    Teams of 3–5 turn a raw idea into a real startup, then pitch it to people who had built one.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap gap-4"
                >
                    <Link
                        href={status === "OPENING SOON" ? "#" : "/register"}
                        prefetch={true}
                        className={`group flex items-center gap-2 px-6 py-3 font-mono text-sm tracking-wide transition-all ${status === "OPENING SOON"
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none"
                                : "bg-brand-primary text-white hover:bg-brand-primary/90"
                            }`}
                        aria-disabled={status === "OPENING SOON"}
                    >
                        {status === "OPENING SOON" ? "OPENING SOON" : "GET PASSES"}
                        {status !== "OPENING SOON" && (
                            <svg
                                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        )}
                    </Link>
                    <Link
                        href="#agenda"
                        className="px-6 py-3 border border-[#DCDCDC] text-[#282828] font-mono text-sm tracking-wide hover:border-brand-primary hover:text-brand-primary transition-all"
                    >
                        Know More
                    </Link>
                </motion.div>
            </div>

            {/* Right Interface: Slime Dish / Camera Animation */}
            <div className="relative h-[40vh] sm:h-[50vh] lg:h-auto overflow-hidden bg-white border-l border-brand-primary/20">
                {/* Toggle Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={() => setCameraActive(!cameraActive)}
                    className="absolute top-24 right-4 z-30 group"
                >
                    <div className={`relative p-3 transition-colors duration-300 ${cameraActive ? 'text-brand-primary' : 'text-brand-primary/50'}`}>
                        {/* Corner lines (Viewfinder) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 40 40" fill="none">
                            {/* Top Left */}
                            <path d="M2 10V2H10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                            {/* Top Right */}
                            <path d="M38 10V2H30" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                            {/* Bottom Left */}
                            <path d="M2 30V38H10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                            {/* Bottom Right */}
                            <path d="M38 30V38H30" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                        </svg>

                        {/* Center Icon */}
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>

                        {/* Active Dot */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-current transition-opacity duration-300 ${cameraActive ? 'opacity-100 animate-ping' : 'opacity-0'}`} />
                    </div>
                </motion.button>

                {/* Slime Dish Simulation (Background) */}
                <SlimeDish />

                {/* ASCII Camera Overlay */}
                <ASCIICamera isActive={cameraActive} />

                {/* Gradient overlay for mobile */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white via-transparent to-transparent opacity-50 lg:hidden" />
            </div>
        </section>
    );
}
