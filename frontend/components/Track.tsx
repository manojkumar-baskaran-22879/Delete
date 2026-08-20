"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import DoomFlame from "./DoomFlame";

export default function Track() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Condensed scroll distance for better responsiveness (250vh instead of 400vh)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Tuned for "Responsive Smoothness" - not too heavy, not too jittery
    const heat = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // --- Visual Transforms ---

    // 1. Scale: Subtle breathing instead of massive zoom
    const textScale = useTransform(heat, [0, 1], [1, 1.15]);

    // 2. Letter Spacing: Expands slightly as it heats up
    const tracking = useTransform(heat, [0, 1], ["-0.05em", "0.02em"]);

    // 3. Opacity Layers for Smooth Color Transition
    // Layer 1: Cold Steel (Base) - Always visible, fades slightly at max heat
    const coldOpacity = useTransform(heat, [0, 0.6], [1, 0]);

    // Layer 2: Ignition (Mid) - Fades in
    const ignitionOpacity = useTransform(heat, [0.2, 0.8], [0, 1]);

    // Layer 3: White Hot (Max) - Bloom effect
    const bloomOpacity = useTransform(heat, [0.7, 1], [0, 1]);

    // Background intensity - Increased brightness
    const flameOpacity = useTransform(heat, [0, 1], [0.4, 0.8]);

    // Label fade out
    const fadeOut = useTransform(heat, [0, 0.3], [1, 0]);


    return (
        <div id="track" ref={containerRef} className="relative h-[250vh] bg-black">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* Doom Flame Background - Controlled Intensity */}
                <motion.div
                    style={{ opacity: flameOpacity }}
                    className="absolute inset-0 z-0 pointer-events-none"
                >
                    <DoomFlame />
                </motion.div>

                {/* Vignette Overlay for focus - Reduced opacity/dulling */}
                <div className="absolute inset-0 z-10 bg-radial-gradient from-transparent via-black/20 to-black/80 pointer-events-none" />

                {/* Content Layer */}
                <div className="relative z-20 text-center w-full max-w-7xl px-4">

                    <motion.div
                        style={{ opacity: useTransform(heat, [0, 0.2], [1, 0]) }}
                        className="mb-8"
                    >
                        <p className="font-mono text-brand-primary/80 text-sm tracking-[0.2em] uppercase">
                            Status: Offline
                        </p>
                    </motion.div>

                    <div className="relative flex flex-col justify-center items-center">
                        <motion.p
                            style={{ opacity: fadeOut }}
                            className="font-mono text-white/70 text-sm sm:text-base tracking-[0.2em] uppercase mb-4"
                        >
                            THE TRACK:
                        </motion.p>

                        <motion.div
                            style={{
                                scale: textScale,
                                letterSpacing: tracking
                            }}
                            className="relative"
                        >
                            {/* Layer 1: Cold Steel (High Visibility Base) */}
                            {/* Silver/White gradient - legible on black */}
                            <motion.h1
                                style={{ opacity: coldOpacity }}
                                className="font-mono text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 drop-shadow-lg"
                            >
                                STARTUP
                                <br />
                                SPRINT
                            </motion.h1>

                            {/* Layer 2: Ignition (Lighter/Whiter Core) */}
                            {/* White to Pale Orange - much lighter than before */}
                            <motion.h1
                                style={{ opacity: ignitionOpacity }}
                                className="absolute inset-0 font-mono text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FFF5E5] to-[#FFB080]"
                            >
                                STARTUP
                                <br />
                                SPRINT
                            </motion.h1>

                            {/* Layer 3: Text Stroke / Outline (Definition) */}
                            {/* Keeps shape defined even when glowing */}
                            <h1
                                className="absolute inset-0 font-mono text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold leading-[0.9] text-transparent pointer-events-none"
                                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)" }}
                            >
                                STARTUP
                                <br />
                                SPRINT
                            </h1>
                        </motion.div>

                        {/* White Hot Bloom (Behind) */}
                        <motion.div
                            className="absolute inset-0 bg-brand-primary blur-[100px] -z-10 rounded-full"
                            style={{
                                opacity: bloomOpacity,
                                scale: useTransform(heat, [0, 1], [0.8, 1.4])
                            }}
                        />
                    </div>

                    <motion.div
                        style={{ opacity: useTransform(heat, [0.8, 1], [0, 1]) }}
                        className="mt-8"
                    >
                        <p className="font-mono text-white text-sm tracking-[0.2em] uppercase animate-pulse">
                            System Ignited
                        </p>
                    </motion.div>
                </div>

                {/* Scroll Prompt */}
                <motion.div
                    style={{ opacity: useTransform(heat, [0, 0.1], [1, 0]) }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
                >
                    <span className="font-mono text-[10px] uppercase tracking-widest">Initialise</span>
                    <div className="w-[1px] h-8 bg-white/20" />
                </motion.div>
            </div>
        </div>
    );
}
