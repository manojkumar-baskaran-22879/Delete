"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
// --- ASCII Logic ---
const chars = " .:-=+*#%@".split("");

function getChar(
    x: number,
    y: number,
    time: number,
    cols: number,
    rows: number
) {
    const t = time * 0.002;

    // Normalized coordinates
    const uvX = x / cols;

    // Rotate 90 degrees: Now 'y' position is driven by 'x'.
    // Horizontal waves.

    // Amplitudes and Centers
    const amp = rows * 0.25;
    const centerY = rows * 0.5;

    // Wave Functions
    // x drives the phase
    const wave1 = Math.sin(uvX * 10 + t) * amp;
    const wave2 = Math.sin(uvX * 15 - t * 1.2) * (amp * 0.8);
    const wave3 = Math.cos(uvX * 8 + t * 0.5) * (amp * 0.5);

    // Calculate Wave Centers at this X
    const w1Y = centerY + wave1;
    const w2Y = centerY + wave2 + wave3;

    // Distance from current Y to the wave line
    const d1 = Math.abs(y - w1Y);
    const d2 = Math.abs(y - w2Y);

    // Combine waves
    const dist = Math.min(d1, d2);

    // Thickness and Contrast
    const thickness = rows * 0.15;

    // Use a sharper falloff for better contrast
    const rawIntensity = Math.max(0, 1 - dist / thickness);
    const intensity = Math.pow(rawIntensity, 2); // Contrast boost

    // Add some texture/noise to the filled area
    const noise = Math.random() * 0.15;

    const charIndex = Math.floor((intensity + noise) * (chars.length - 1));
    return chars[Math.min(chars.length - 1, Math.max(0, charIndex))];
}

const AsciiArt = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [text, setText] = useState("");

    useEffect(() => {
        let animationFrameId: number;
        let time = 0;

        // Overestimate characters to ensure we completely fill the width
        // Font size is 10px, typically 6px wide. We use 5px to be safe > 100% width.
        const charWidth = 5;
        const charHeight = 12;

        const render = () => {
            if (!containerRef.current) return;

            const { offsetWidth, offsetHeight } = containerRef.current;
            if (offsetWidth === 0 || offsetHeight === 0) return;

            // Add extra columns to be absolutely sure we cover the right edge
            const cols = Math.ceil(offsetWidth / charWidth) + 5;
            const rows = Math.ceil(offsetHeight / charHeight);

            let frame = "";

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    frame += getChar(x, y, time, cols, rows);
                }
                frame += "\n";
            }

            setText(frame);
            time += 20;
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden font-mono text-[10px] leading-[18px] whitespace-pre select-none pointer-events-none text-white/40"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
            {text}
        </div>
    );
};

export default function Footer() {
    return (
        <footer
            className="relative w-full overflow-hidden bg-black text-white flex flex-col justify-between items-center pt-4 pb-0 border-t border-neutral-800 min-h-[25vh]"
            style={{ backgroundColor: "#000000" }}
        >
            {/* Height controlled by content + padding, or explicit min-height if needed.
                User requested "Minimum padding", "Full width". 
                We give it some height for the animation to exist, but minimize 'padding' perception using structure.
            */}
            <div className="absolute inset-0 z-0">
                <AsciiArt />
            </div>

            {/* Footer Meta - Links at Top */}
            <div className="relative z-20 w-full px-6 pointer-events-none">
                <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-neutral-400 font-mono uppercase tracking-widest pointer-events-auto">
                    {/* Left: Rules */}
                    <Link href="/terms" className="hover:text-white transition-colors">
                        Rules & Regulations
                    </Link>

                    {/* Right: Socials */}
                    <div className="flex gap-6">
                        <a href="https://x.com/RapteeEnergy?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">X</a>
                        <a href="https://in.linkedin.com/company/rapteeenergy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href="https://www.instagram.com/raptee.hv" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                        <a href="https://www.youtube.com/@rapteeenergy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a>
                    </div>
                </div>
            </div>

            {/* Main Content Overlay - Moved to Bottom */}
            <div className="relative z-10 w-full text-center px-0 mt-auto">
                <h1
                    className="font-sans font-medium tracking-tighter w-full leading-none flex justify-center items-center gap-[0.2em]"
                    style={{
                        // Clamp larger to fill width
                        fontSize: "calc(18vw)",
                    }}
                >
                    <span className="text-white">Codevolt</span>
                    <span className="text-brand-primary">2.0</span>
                </h1>
                <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-[0.2em] mt-2 mb-0">© 2026 Codevolt 2.0 · Raptee Energy Pvt Ltd</p>
            </div>
        </footer>
    );
}
