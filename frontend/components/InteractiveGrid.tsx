"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";

const CELL_SIZE = 30; // Size of each grid cell
const FONT_SIZE = 14;
const CHARS = ["0", ".", "X"];

export default function InteractiveGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);

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
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size (DPI scaled)
        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;

        let animationFrameId: number;

        const render = () => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);

            // Grid configuration
            const cols = Math.ceil(dimensions.width / CELL_SIZE);
            const rows = Math.ceil(dimensions.height / CELL_SIZE);

            const mX = mouseX.get();
            const mY = mouseY.get();

            ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * CELL_SIZE + CELL_SIZE / 2;
                    const y = j * CELL_SIZE + CELL_SIZE / 2;

                    // Distance from mouse
                    const dist = Math.sqrt((x - mX) ** 2 + (y - mY) ** 2);

                    let char = "."; // Default
                    let color = "rgba(0, 0, 0, 0.1)"; // Default muted (grid-lineish)

                    // Interactive Logic
                    if (dist < 100) {
                        color = "#FF4500"; // brand-primary
                        char = dist < 50 ? "X" : "0";
                    } else {
                        // Random noise occasionally
                        if (Math.random() > 0.999) {
                            char = Math.random() > 0.5 ? "0" : "1";
                            color = "rgba(0, 0, 0, 0.3)";
                        }
                    }

                    ctx.fillStyle = color;
                    ctx.fillText(char, x, y);
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [dimensions, mouseX, mouseY]); // Dependencies for re-init

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
        }
    };

    const handleMouseLeave = () => {
        mouseX.set(-1000);
        mouseY.set(-1000);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] relative overflow-hidden bg-surface/50 border-l border-grid-line"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <canvas ref={canvasRef} className="absolute inset-0 block" />
        </div>
    );
}
