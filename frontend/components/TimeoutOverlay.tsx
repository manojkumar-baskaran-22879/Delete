import { motion } from "framer-motion";
import Link from "next/link";

interface TimeoutOverlayProps {
    onRestart: () => void;
}

export const TimeoutOverlay = ({ onRestart }: TimeoutOverlayProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
                <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            </div>

            <div className="relative text-center p-8 max-w-md w-full">
                <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="relative"
                >
                    {/* Icon */}
                    <div className="w-24 h-24 mx-auto mb-8 rounded-full border-2 border-red-500/30 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse" />
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            <line x1="2" y1="2" x2="22" y2="22" className="stroke-red-500" strokeWidth="2" />
                        </svg>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Session Expired</h2>
                    <p className="text-red-200/60 mb-8 font-mono text-sm leading-relaxed">
                        To ensure fairness for all hackers, we hold passes for only 10 minutes.
                        Please restart your registration.
                    </p>

                    <button
                        onClick={onRestart}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all hover:scale-105 active:scale-95 mb-4"
                    >
                        Restart Registration
                    </button>

                    <Link href="/" className="text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
                        Cancel & Return Home
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};
