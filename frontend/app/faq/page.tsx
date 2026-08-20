"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

const faqs = [
    {
        category: "The Basics",
        questions: [
            {
                q: "What is CodeVolt 2.0?",
                a: "CodeVolt 2.0 is a 3-Day offline startup sprint where builders, designers, and dreamers come together to build a startup from scratch. It's an intense, immersive experience designed to simulate the early-stage startup journey. From 0s and 1s to 0→1."
            },
            {
                q: "When and where does it happen?",
                a: <>CodeVolt 2.0 takes place on 9–11 September 2026 in <a href="https://maps.app.goo.gl/p6zoVM9hwZQLx7fX6" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline hover:text-brand-primary/80 transition-colors">VIT, Vellore</a>. The entire event is fully offline with no remote participation. You'll be building alongside hundreds of other builders in Anna Auditorium, VIT Vellore.</>
            },
            {
                q: "How long is the event?",
                a: "The event runs for 3 continuous days. This includes overnight coding sessions, mentorship hours, and the final pitch. Teams are expected to be present throughout the event duration."
            },
        ]
    },
    {
        category: "Registration & Tickets",
        questions: [
            {
                q: "How much does it cost to participate?",
                a: "Ticket prices vary based on timing. Early bird tickets are available at a discounted rate. Standard tickets are priced higher. Check our registration page for current pricing. All tickets include venue access, meals, and event materials."
            },
            {
                q: "Can I participate solo or do I need a team?",
                a: "No solo registrations. A team of 3–5 members are ideal."
            },
            {
                q: "Is there a refund policy?",
                a: "Tickets are non-refundable once purchased."
            },
        ]
    },
    {
        category: "The Experience",
        questions: [
            {
                q: "What's the track/theme for CodeVolt 2.0?",
                a: "The track is 'Startup Sprint'. You'll be building a functional MVP for a real problem. The focus is on problem selection, validation, trade-offs, and realistic execution, not just code. Some environments demand more than participation."
            },
            {
                q: "How does the 3-day structure work?",
                a: "Day 1: The Idea - Identify a real problem and decide what NOT to build. Day 2: The Product - Build a functional MVP and validate with real use cases. Day 3: The Business - Define value, map users/market, and present your working product."
            },
            {
                q: "What if I get eliminated on Day 1 or Day 2?",
                a: "If your team is eliminated on Day 1 or Day 2, your participation in CodeVolt 2.0 will conclude at that stage, and event privileges such as food and accommodation will no longer apply. Any further meal or stay arrangements will need to be made by participants."
            },
            {
                q: "Will food and accommodation be provided?",
                a: "Yes, meals and refreshments are provided throughout the 3 Days. The venue is set up for overnight work: think sleeping bags and power naps, not hotel rooms. This is a sprint, not a vacation."
            },
            {
                q: "Can I use AI tools during the event?",
                a: "Yes! AI tools are permitted for research, exploration, and accelerating execution. However, ideas must not be fully auto-generated. You must demonstrate independent thinking and decision-making. AI may assist execution, but it may not replace ownership."
            },
        ]
    },
    {
        category: "Prizes & Outcomes",
        questions: [
            {
                q: "What are the prizes?",
                a: "The winning startup idea gets the opportunity to be incubated. Standout participants may also be considered for internship opportunities based on their performance and potential."
            },
            {
                q: "How are teams evaluated?",
                a: "Teams are evaluated based on: clarity of problem definition, quality of decision-making, execution quality, and realism of the solution. Not every team reaches the final day. The evaluation committee's decisions are final."
            },
            {
                q: "What happens after the event?",
                a: "You leave with a working MVP, validated learnings, and connections with mentors and fellow builders. Many CodeVolt projects have continued development post-event. Some have even secured funding."
            },
        ]
    },
];

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: React.ReactNode; isOpen: boolean; onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-white/5 last:border-0"
        >
            <button
                onClick={onClick}
                className="w-full py-6 flex items-start justify-between gap-4 text-left group"
            >
                <span className="text-lg font-medium text-white group-hover:text-brand-primary transition-colors">
                    {question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:border-brand-primary/50 group-hover:text-brand-primary transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-white/60 leading-relaxed max-w-2xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQPage() {
    useAnalytics(); // Track page view
    const router = useRouter();
    const [openItemId, setOpenItemId] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") router.push("/");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    const toggleItem = (category: string, index: number) => {
        const key = `${category}-${index}`;
        setOpenItemId(prev => (prev === key ? null : key));
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand-primary selection:text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="relative w-24 h-6 block">
                        <Image
                            src="/brand/logo_orange.png"
                            alt="Codevolt 2.0"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                    <button onClick={() => router.push("/")} className="text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                        [ ESC ] Back to Home
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row min-h-screen pt-16">
                {/* Left Panel - Sticky Hero */}
                <div className="lg:w-[45%] lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 p-6 lg:p-16 flex flex-col justify-center border-r border-white/5 bg-[#0a0a0a] relative overflow-hidden">
                    {/* Background Ambient */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                            <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                            <span className="text-xs font-mono uppercase tracking-widest text-white/60">Got Questions?</span>
                        </div>

                        <h1 className="font-heading text-5xl lg:text-7xl font-medium tracking-tight mb-6 leading-[1.1]">
                            <span className="text-white">Frequently Asked</span>
                            <br />
                            <span className="text-gradient">Questions</span>
                        </h1>

                        <p className="text-lg text-white/50 max-w-md mb-12 leading-relaxed">
                            Everything you need to know about CodeVolt 2.0. Can't find what you're looking for?
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-white font-mono text-sm uppercase tracking-widest rounded-full hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/25"
                            >
                                Get Passes
                            </Link>
                            <a
                                href="mailto:events@rapteehv.com"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors"
                            >
                                Contact Us
                            </a>
                        </div>
                    </motion.div>

                    {/* Quick Links Footer (Mobile only visible at bottom, Desktop visible here) */}
                    <div className="hidden lg:flex gap-6 mt-20 text-xs font-mono text-white/30">
                        <Link href="/terms" className="hover:text-brand-primary transition-colors">Rules & Regulations</Link>
                        <Link href="/gallery" className="hover:text-brand-primary transition-colors">2025 Gallery</Link>
                    </div>
                </div>

                {/* Right Panel - Scrollable Content */}
                <div className="lg:w-[55%] bg-[#0a0a0a]">
                    <div className="p-6 lg:p-16 space-y-20">
                        {faqs.map((category, catIndex) => (
                            <motion.div
                                key={category.category}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: catIndex * 0.1 }}
                            >
                                <h2 className="text-sm font-mono uppercase tracking-widest text-brand-primary mb-8 flex items-center gap-3">
                                    <span className="w-8 h-px bg-brand-primary/50"></span>
                                    {category.category}
                                </h2>
                                <div>
                                    {category.questions.map((faq, i) => (
                                        <FAQItem
                                            key={`${category.category}-${i}`}
                                            question={faq.q}
                                            answer={faq.a}
                                            isOpen={openItemId === `${category.category}-${i}`}
                                            onClick={() => toggleItem(category.category, i)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))}

                        {/* Mobile Footer Links */}
                        <div className="lg:hidden pt-8 border-t border-white/5 flex flex-wrap gap-6 text-xs font-mono text-white/30 justify-center">
                            <Link href="/terms" className="hover:text-brand-primary transition-colors">Rules & Regulations</Link>
                            <Link href="/gallery" className="hover:text-brand-primary transition-colors">2025 Gallery</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
