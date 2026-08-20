"use client";

import React, { useEffect, useRef, useState } from "react";

const Donut = ({ amplitudeX = 600, amplitudeY = 50 }: { amplitudeX?: number; amplitudeY?: number }) => {
    const preRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        let animationFrameId: number;
        let A = 0;
        let B = 0;

        const render = () => {
            if (!preRef.current) return;

            const container = preRef.current.parentElement;
            if (!container) return;

            // Fixed grid size or dynamic based on container?
            // For a smooth persistent look, let's use a reasonably dense fixed grid or calculate it.
            // Let's try to calculate to fill, but keep it performant.
            const width = 80; // Columns
            const height = 40; // Rows

            // Buffers
            const z = new Float32Array(width * height);
            const b = new Array(width * height).fill(" ");

            // Rotation speeds
            A += 0.04; // Slightly faster than original for visibility
            B += 0.02;

            const cA = Math.cos(A);
            const sA = Math.sin(A);
            const cB = Math.cos(B);
            const sB = Math.sin(B);

            // Torus Logic
            // Theta (j) goes around the cross-sectional circle of a torus
            for (let j = 0; j < 6.28; j += 0.07) {
                const ct = Math.cos(j);
                const st = Math.sin(j);

                // Phi (i) goes around the center of revolution of a torus
                for (let i = 0; i < 6.28; i += 0.02) {
                    const sp = Math.sin(i);
                    const cp = Math.cos(i);

                    const h = ct + 2; // R1 + R2*cos(theta)
                    const D = 1 / (sp * h * sA + st * cA + 5); // 1/z
                    const t = sp * h * cA - st * sA;

                    // Project to 2D
                    // Scale factors need to fit the grid
                    // Increased scale: width / 3 (was width / 4) for "Bigger" look within grid
                    const x = Math.floor(width / 2 + (width / 3) * D * (cp * h * cB - t * sB));
                    const y = Math.floor(height / 2 + (height / 1.5) * D * (cp * h * sB + t * cB));

                    const o = x + width * y;
                    const N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB - 0.4 * ct * st)); // Luminance

                    if (y < height && y >= 0 && x >= 0 && x < width && D > z[o]) {
                        z[o] = D;
                        // Char set: .,-~:;=!*#$@
                        const chars = ".,-~:;=!*#$@";
                        b[o] = chars[N > 0 ? (N < chars.length ? N : chars.length - 1) : 0];
                    }
                }
            }

            // Construct string
            let output = "";
            for (let k = 0; k < width * height; k++) {
                output += k % width === width - 1 ? "\n" : b[k];
            }

            preRef.current.innerText = output;

            // --- Physics-based Floating Motion ---
            // Slower time base
            const tVal = Date.now() * 0.001

            // Composite waves for non-linear "drifting" feel
            // X: Main wide sweep + secondary drift
            const translateX = (Math.sin(tVal) + Math.sin(tVal * 1.5) * 0.3) * amplitudeX;

            // Y: Flatter, more subtle vertical float (width oriented)
            const translateY = (Math.cos(tVal * 0.8) + Math.sin(tVal * 2.3) * 0.2) * amplitudeY;

            preRef.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [amplitudeX, amplitudeY]);

    return (
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none overflow-hidden">
            <pre
                ref={preRef}
                className="font-mono text-xs sm:text-sm leading-[12px] sm:leading-[14px] text-brand-primary whitespace-pre transition-transform will-change-transform"
                style={{
                    fontFamily: "'Courier New', Courier, monospace",
                }}
            />
        </div>
    );
};

export default Donut;
