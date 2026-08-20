"use client";

import { useEffect, useRef, useCallback } from "react";

// --- Vector 2D Math Helpers ---
const v2 = {
    vec2: (x: number, y: number) => ({ x, y }),
    add: (a: Vec2, b: Vec2) => ({ x: a.x + b.x, y: a.y + b.y }),
    addN: (a: Vec2, n: number) => ({ x: a.x + n, y: a.y + n }),
    mulN: (a: Vec2, n: number) => ({ x: a.x * n, y: a.y * n }),
    rot: (v: Vec2, a: number) => {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
    },
    floor: (v: Vec2) => ({ x: Math.floor(v.x), y: Math.floor(v.y) }),
};

type Vec2 = { x: number; y: number };

// --- Configuration ---
const WIDTH = 400;
const HEIGHT = 400;
const NUM_AGENTS = 1500;
const DECAY = 0.9;
const MIN_CHEM = 0.0001;

const SENS_ANGLE = 45 * Math.PI / 180;
const SENS_DIST = 9;
const AGT_SPEED = 1;
const AGT_ANGLE = 45 * Math.PI / 180;
const DEPOSIT = 1;

// ASCII Texture Map (Original)
const TEXTURE = [
    "  0110",
    "  10010",
];
const OOB = ' ';

// --- Agent Class ---
class Agent {
    pos: Vec2;
    dir: Vec2;
    scatter: boolean;

    constructor(pos: Vec2, dir: Vec2) {
        this.pos = pos;
        this.dir = dir;
        this.scatter = false;
    }

    sense(angleOffset: number, chem: Float32Array) {
        const senseVec = v2.mulN(v2.rot(this.dir, angleOffset * SENS_ANGLE), SENS_DIST);
        const pos = v2.floor(v2.add(this.pos, senseVec));
        if (!bounded(pos)) return -1;
        const sensed = chem[pos.y * WIDTH + pos.x];
        return this.scatter ? 1 - sensed : sensed;
    }

    react(chem: Float32Array) {
        const forwardChem = this.sense(0, chem);
        const leftChem = this.sense(-1, chem);
        const rightChem = this.sense(1, chem);

        let rotate = 0;
        if (forwardChem > leftChem && forwardChem > rightChem) {
            rotate = 0;
        } else if (forwardChem < leftChem && forwardChem < rightChem) {
            rotate = Math.random() < 0.5 ? -AGT_ANGLE : AGT_ANGLE;
        } else if (leftChem < rightChem) {
            rotate = AGT_ANGLE;
        } else if (rightChem < leftChem) {
            rotate = -AGT_ANGLE;
        } else if (forwardChem < 0) {
            rotate = Math.PI / 2;
        }

        this.dir = v2.rot(this.dir, rotate);
        this.pos = v2.add(this.pos, v2.mulN(this.dir, AGT_SPEED));
    }

    deposit(chem: Float32Array) {
        const p = v2.floor(this.pos);
        if (bounded(p)) {
            const i = p.y * WIDTH + p.x;
            chem[i] = Math.min(1, chem[i] + DEPOSIT);
        }
    }
}

// --- Helpers ---
const R = Math.min(WIDTH, HEIGHT) / 2;
function bounded(vec: Vec2) {
    return ((vec.x - R) ** 2 + (vec.y - R) ** 2 <= R ** 2);
}

function randCircle(): Vec2 {
    const r = Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
}

// --- Component ---
export default function SlimeDish() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef(0);
    const dataRef = useRef<{ chem: Float32Array; wip: Float32Array; agents: Agent[] } | null>(null);
    const viewRef = useRef({ scale: { x: 1, y: 1 }, focus: { x: 0.5, y: 0.5 }, targetScale: { x: 1, y: 1 }, targetFocus: { x: 0.5, y: 0.5 } });
    const cursorRef = useRef({ x: 0, y: 0, pressed: false });

    // Event Handlers
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            cursorRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, pressed: true };
        }
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            cursorRef.current.x = e.clientX - rect.left;
            cursorRef.current.y = e.clientY - rect.top;
        }
    }, []);

    const handlePointerUp = useCallback(() => {
        cursorRef.current.pressed = false;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Initialize Data (once)
        if (!dataRef.current) {
            const chem = new Float32Array(HEIGHT * WIDTH);
            const wip = new Float32Array(HEIGHT * WIDTH);
            const agents: Agent[] = [];
            for (let i = 0; i < NUM_AGENTS; i++) {
                const rc = randCircle();
                const pos = v2.mulN(v2.addN(v2.mulN(rc, 0.5), 1), 0.5 * WIDTH);
                const dir = v2.rot({ x: 1, y: 0 }, Math.random() * 2 * Math.PI);
                agents.push(new Agent(pos, dir));
            }
            dataRef.current = { chem, wip, agents };
        }

        let animationId: number;

        const loop = () => {
            const data = dataRef.current;
            if (!data) return;

            const { chem, wip, agents } = data;
            const cursor = cursorRef.current;
            const view = viewRef.current;
            frameRef.current++;

            // 1. Diffuse & Decay
            for (let i = 0; i < HEIGHT * WIDTH; i++) {
                const r = Math.floor(i / WIDTH);
                const c = i % WIDTH;
                let sum = 0;
                let count = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const y = r + dy;
                        const x = c + dx;
                        if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
                            sum += chem[y * WIDTH + x];
                            count++;
                        }
                    }
                }
                const val = (sum / count) * DECAY;
                wip[i] = val < MIN_CHEM ? 0 : val;
            }
            chem.set(wip);

            // 2. Agent Logic
            const isScattering = Math.sin(frameRef.current / 150) > 0.8;
            for (const agent of agents) {
                agent.scatter = isScattering;
                agent.react(chem);
            }
            for (const agent of agents) {
                agent.deposit(chem);
            }

            // 3. Update View (Zoom IN on Press, Zoomed OUT by default)
            const displayRows = container.clientHeight / 12; // Approximate char rows
            const displayCols = container.clientWidth / 7;   // Approximate char cols
            const aspect = 0.5;

            if (cursor.pressed) {
                // ZOOMED IN on touch - 1:1 pixel mapping
                view.targetScale = { y: 1 / aspect, x: 1 };
                view.targetFocus = { y: cursor.y / container.clientHeight, x: cursor.x / container.clientWidth };
            } else {
                // ZOOMED OUT by default - fit entire simulation
                view.targetScale = { y: WIDTH / displayRows, x: WIDTH / displayCols };
                view.targetFocus = { x: 0.5, y: 0.5 };
            }

            view.scale.x += 0.1 * (view.targetScale.x - view.scale.x);
            view.scale.y += 0.1 * (view.targetScale.y - view.scale.y);
            view.focus.x += 0.1 * (view.targetFocus.x - view.focus.x);
            view.focus.y += 0.1 * (view.targetFocus.y - view.focus.y);

            // 4. Render (ASCII Characters)
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = container.clientWidth;
            const h = container.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;

            // Reset transform and apply DPR scaling
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // White background
            ctx.fillStyle = "#FAFAFA";
            ctx.fillRect(0, 0, w, h);

            const fontSize = 12;
            ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const charW = fontSize * 0.6;
            const charH = fontSize;
            const numCols = Math.ceil(w / charW);
            const numRows = Math.ceil(h / charH);

            for (let row = 0; row < numRows; row++) {
                for (let col = 0; col < numCols; col++) {
                    const offset = {
                        y: Math.floor(view.focus.y * (HEIGHT - view.scale.y * numRows)),
                        x: Math.floor(view.focus.x * (WIDTH - view.scale.x * numCols)),
                    };
                    const sampleFrom = {
                        y: offset.y + Math.floor(row * view.scale.y),
                        x: offset.x + Math.floor(col * view.scale.x),
                    };
                    const sampleTo = {
                        y: offset.y + Math.floor((row + 1) * view.scale.y),
                        x: offset.x + Math.floor((col + 1) * view.scale.x),
                    };

                    if (!bounded(sampleFrom) || !bounded(sampleTo)) {
                        continue;
                    }

                    const sampleH = Math.max(1, sampleTo.y - sampleFrom.y);
                    const sampleW = Math.max(1, sampleTo.x - sampleFrom.x);

                    let max = 0;
                    let sum = 0;
                    for (let x = sampleFrom.x; x < sampleFrom.x + sampleW; x++) {
                        for (let y = sampleFrom.y; y < sampleFrom.y + sampleH; y++) {
                            if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
                                const v = chem[y * WIDTH + x];
                                max = Math.max(max, v);
                                sum += v;
                            }
                        }
                    }
                    let val = sum / (sampleW * sampleH);
                    val = (val + max) / 2;
                    val = Math.pow(val, 1 / 3); // Weight for better texture distribution

                    // Map to character
                    const texRow = (col + row) % TEXTURE.length;
                    const texCol = Math.ceil(val * (TEXTURE[0].length - 1));
                    const char = TEXTURE[texRow]?.[texCol] ?? OOB;

                    if (char === ' ') continue;

                    // Brand Orange color based on intensity
                    const intensity = Math.min(1, val * 1.5);
                    const hue = 15 + intensity * 10; // Orange
                    const sat = 85 + intensity * 10;
                    const light = 55 - intensity * 20; // Darker orange for high intensity
                    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;

                    const x = col * charW + charW / 2;
                    const y = row * charH + charH / 2;
                    ctx.fillText(char, x, y);
                }
            }

            animationId = requestAnimationFrame(loop);
        };

        animationId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative bg-white overflow-hidden cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <canvas ref={canvasRef} className="absolute inset-0 block" />
            {/* Overlay for visual integration */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60 pointer-events-none" />
        </div>
    );
}
