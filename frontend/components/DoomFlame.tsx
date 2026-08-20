"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Palette matching brand identity (oranges/reds)
const palette = [
    "#000000", // 0 - black (top/coolest)
    "#1A0A00", // 1 - very dark brown
    "#3D1508", // 2 - deep ember
    "#7F1D1D", // 3 - dark red
    "#B91C1C", // 4 - red
    "#FF4500", // 5 - brand primary (orange-red)
    "#FF6B35", // 6 - brand accent (bright orange)
    "#FFD700", // 7 - gold (hottest)
];

// Flame intensity gradient (maps data values to palette indices)
//             top                       bottom
const flame = "011222233334444444455566667".split("").map(Number);

// Smoothstep function for noise interpolation
function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

// Linear interpolation
function mix(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

// Map value from one range to another
function map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

// Clamp value between min and max
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

// Random int between a and b, inclusive
function rndi(a: number, b: number = 0): number {
    if (a > b) [a, b] = [b, a];
    return Math.floor(a + Math.random() * (b - a + 1));
}

// Value noise generator
function createValueNoise() {
    const tableSize = 256;
    const r = new Array(tableSize);
    const permutationTable = new Array(tableSize * 2);

    // Create an array of random values and initialize permutation table
    for (let k = 0; k < tableSize; k++) {
        r[k] = Math.random();
        permutationTable[k] = k;
    }

    // Shuffle values of the permutation table
    for (let k = 0; k < tableSize; k++) {
        const i = Math.floor(Math.random() * tableSize);
        [permutationTable[k], permutationTable[i]] = [
            permutationTable[i],
            permutationTable[k],
        ];
        permutationTable[k + tableSize] = permutationTable[k];
    }

    return function (px: number, py: number): number {
        const xi = Math.floor(px);
        const yi = Math.floor(py);

        const tx = px - xi;
        const ty = py - yi;

        const rx0 = xi % tableSize;
        const rx1 = (rx0 + 1) % tableSize;
        const ry0 = yi % tableSize;
        const ry1 = (ry0 + 1) % tableSize;

        // Random values at the corners of the cell using permutation table
        const c00 = r[permutationTable[permutationTable[rx0] + ry0]];
        const c10 = r[permutationTable[permutationTable[rx1] + ry0]];
        const c01 = r[permutationTable[permutationTable[rx0] + ry1]];
        const c11 = r[permutationTable[permutationTable[rx1] + ry1]];

        // Remapping of tx and ty using the Smoothstep function
        const sx = smoothstep(0, 1, tx);
        const sy = smoothstep(0, 1, ty);

        // Linearly interpolate values along the x axis
        const nx0 = mix(c00, c10, sx);
        const nx1 = mix(c01, c11, sx);

        // Linearly interpolate the nx0/nx1 along the y axis
        return mix(nx0, nx1, sy);
    };
}

const CELL_SIZE = 16; // Size of each character cell
const FONT_SIZE = 14;

export default function DoomFlame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const dataRef = useRef<number[]>([]);
    const noiseRef = useRef<((px: number, py: number) => number) | null>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, pressed: false });
    const startTimeRef = useRef<number>(Date.now());

    // Initialize noise function once
    useEffect(() => {
        noiseRef.current = createValueNoise();
    }, []);

    // Resize observer
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !noiseRef.current) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size (DPI scaled)
        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;

        const cols = Math.ceil(dimensions.width / CELL_SIZE);
        const rows = Math.ceil(dimensions.height / CELL_SIZE);

        // Initialize or resize data buffer
        const dataSize = cols * rows;
        if (dataRef.current.length !== dataSize) {
            dataRef.current = new Array(dataSize).fill(0);
        }

        let animationFrameId: number;
        const noise = noiseRef.current;
        const data = dataRef.current;

        const render = () => {
            const time = (Date.now() - startTimeRef.current) * 0.0015;

            // Fill the floor with some noise (or mouse interaction)
            const mouse = mouseRef.current;
            if (!mouse.pressed) {
                const last = cols * (rows - 1);
                for (let i = 0; i < cols; i++) {
                    const val = Math.floor(map(noise(i * 0.05, time), 0, 1, 5, 50));
                    data[last + i] = Math.min(val, data[last + i] + 2);
                }
            } else {
                const cx = Math.floor(mouse.x / CELL_SIZE);
                const cy = Math.floor(mouse.y / CELL_SIZE);
                if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
                    data[cx + cy * cols] = rndi(5, 50);
                }
            }

            // Propagate towards the ceiling with some randomness
            for (let i = 0; i < data.length; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const dest = row * cols + clamp(col + rndi(-1, 1), 0, cols - 1);
                const src = Math.min(rows - 1, row + 1) * cols + col;
                data[dest] = Math.max(0, data[src] - rndi(0, 2));
            }

            // Render the flame
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, dimensions.width, dimensions.height);

            ctx.font = `bold ${FONT_SIZE}px "JetBrains Mono", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const index = row * cols + col;
                    const u = data[index];
                    const v = flame[clamp(u, 0, flame.length - 1)];

                    const x = col * CELL_SIZE + CELL_SIZE / 2;
                    const y = row * CELL_SIZE + CELL_SIZE / 2;

                    if (v === 0) continue; // Skip black cells

                    // Background color
                    const bgColor = palette[v];
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                    // Foreground character
                    const fgColor = palette[Math.min(palette.length - 1, v + 1)];
                    ctx.fillStyle = fgColor;
                    ctx.fillText((u % 10).toString(), x, y);
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [dimensions]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        }
    }, []);

    const handleMouseDown = useCallback(() => {
        mouseRef.current.pressed = true;
    }, []);

    const handleMouseUp = useCallback(() => {
        mouseRef.current.pressed = false;
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current.pressed = false;
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] relative overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <canvas ref={canvasRef} className="absolute inset-0 block" />
        </div>
    );
}
