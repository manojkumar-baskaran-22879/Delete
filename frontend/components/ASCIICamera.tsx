"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface ASCIICameraProps {
    isActive: boolean;
}

export default function ASCIICamera({ isActive }: ASCIICameraProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number>(0);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const dimensionsRef = useRef({ cols: 0, rows: 0, width: 0, height: 0 });

    const [isBooting, setIsBooting] = useState(false);
    const bootProgressRef = useRef(0);

    const CELL_SIZE = 10; // Size of each pixel block
    const GAP = 1; // Gap between blocks for that pixel art look

    // Get color based on luminance
    // Inverted logic for white background:
    // Dark pixels (shadows/features) -> Orange colors
    // Light pixels (background/highlights) -> Transparent (White)
    const getBlockColor = (luminance: number): string => {
        if (luminance > 0.75) return "transparent"; // Bright areas (white wall) = transparent

        // Map dark areas to orange
        // Darker = Deep Orange, Lighter = Light Peach
        const hue = 15; // Orange
        const sat = 90;
        const light = 45 + luminance * 45; // 0 lum -> 45% (Deep), 0.7 lum -> ~80% (Light)

        return `hsl(${hue}, ${sat}%, ${light}%)`;
    };

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        bootProgressRef.current = 0;
    }, []);

    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        if (!containerRef.current || !canvasRef.current) return;

        // Reset state
        setError(null);
        setIsBooting(true);
        bootProgressRef.current = 0;

        try {
            // Safety check for secure context
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API unavailable. Use HTTPS or localhost.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 320, height: 240 }
            });
            streamRef.current = stream;

            const video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            videoRef.current = video;

            offscreenCanvasRef.current = document.createElement("canvas");

            await video.play();

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) return;

            const updateDimensions = () => {
                if (!containerRef.current) return;
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;
                dimensionsRef.current = {
                    width,
                    height,
                    cols: Math.floor(width / CELL_SIZE),
                    rows: Math.floor(height / CELL_SIZE)
                };
            };
            updateDimensions();

            const render = () => {
                if (!containerRef.current || !videoRef.current || !offscreenCanvasRef.current) return;

                const { width, height, cols, rows } = dimensionsRef.current;

                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;

                const offscreen = offscreenCanvasRef.current;
                offscreen.width = cols;
                offscreen.height = rows;
                const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
                if (!offCtx) return;

                // Draw video mirrored
                offCtx.save();
                offCtx.translate(cols, 0);
                offCtx.scale(-1, 1);
                offCtx.drawImage(videoRef.current, 0, 0, cols, rows);
                offCtx.restore();

                const imageData = offCtx.getImageData(0, 0, cols, rows);
                const pixels = imageData.data;

                // White/light background
                ctx.fillStyle = "#FAFAFA";
                ctx.fillRect(0, 0, width, height);

                // Boot animation
                if (bootProgressRef.current < 1) {
                    bootProgressRef.current += 0.04;
                    if (bootProgressRef.current >= 1) {
                        setIsBooting(false);
                    }
                }
                const revealRow = Math.floor(rows * bootProgressRef.current);

                // Draw pixel blocks
                const blockSize = CELL_SIZE - GAP;

                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const x = col * CELL_SIZE;
                        const y = row * CELL_SIZE;

                        // Boot sequence
                        if (row > revealRow && bootProgressRef.current < 1) {
                            if (Math.random() > 0.85) {
                                ctx.fillStyle = "rgba(255, 69, 0, 0.1)";
                                ctx.fillRect(x, y, blockSize, blockSize);
                            }
                            continue;
                        }

                        const i = (row * cols + col) * 4;
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];

                        // Calculate luminance
                        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

                        const color = getBlockColor(lum);
                        if (color === "transparent") continue;

                        ctx.fillStyle = color;
                        ctx.fillRect(x, y, blockSize, blockSize);
                    }
                }

                // Subtle vertical scan lines (like in reference)
                ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
                ctx.lineWidth = 1;
                for (let x = 0; x < width; x += CELL_SIZE * 2) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }

                animationFrameRef.current = requestAnimationFrame(render);
            };

            render();
        } catch (error: any) {
            console.error("Camera access denied:", error);
            setError(error.message || "Camera access failed");
            setIsBooting(false);
        }
    }, []);

    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            stopCamera();
            setIsBooting(false);
        }

        return () => {
            stopCamera();
        };
    }, [isActive, startCamera, stopCamera]);

    if (!isActive) return null;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full bg-[#FAFAFA] z-10"
        >
            {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 mb-4 text-brand-primary opacity-50">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="font-mono text-xs text-brand-primary font-bold uppercase tracking-widest mb-2">
                        SIGNAL LOST
                    </p>
                    <p className="font-mono text-[10px] text-text-muted max-w-[200px] leading-relaxed">
                        {error}
                    </p>
                </div>
            ) : (
                <>
                    <canvas ref={canvasRef} className="absolute inset-0 block" />

                    {/* Boot sequence text */}
                    {isBooting && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="font-mono text-brand-primary text-sm animate-pulse tracking-widest">
                                INITIALIZING...
                            </div>
                        </div>
                    )}

                    {/* Minimal status */}
                    <div className="absolute bottom-3 right-3 font-mono text-[10px] text-brand-primary/40 tracking-widest uppercase">
                        ● LIVE
                    </div>
                </>
            )}
        </div>
    );
}
