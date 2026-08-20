import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
    duration: number; // in seconds
    onTimeout: () => void;
    label?: string; // Kept for compatibility but ignored in UI
    isPaused?: boolean;
}

export const Timer = ({ duration, onTimeout, isPaused = false }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (isPaused) return;

        if (timeLeft <= 0) {
            onTimeout();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onTimeout, isPaused]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Color logic
    const isWarning = timeLeft < 60; // Last 1 min
    const isCritical = timeLeft < 10; // Last 10 secs

    // Colors: Default White, Warning Orange, Critical Red
    const color = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#ffffff";

    return (
        <div className="flex items-center justify-center font-mono" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            <motion.div
                key={timeLeft}
                initial={{ opacity: 0.8, y: 1 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold tracking-tight px-3 py-1 bg-white/5 rounded-md border border-white/5 shadow-sm"
                style={{ color }}
            >
                {minutes}:{seconds.toString().padStart(2, '0')}
            </motion.div>
        </div>
    );
};
