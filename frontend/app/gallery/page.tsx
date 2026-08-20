"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

// Gallery data with meaningful descriptions
const galleryItems = [
    {
        src: "/images/IMG_8427.JPG",
        title: "The Gathering",
        description: "300+ innovators assembled for 3 Days of pure creation",
        category: "The Beginning",
        span: "col-span-2 row-span-2",
    },
    {
        src: "/images/IMG_1444.JPG",
        title: "The Vision",
        description: "Setting the stage for breakthrough ideas",
        category: "The Beginning",
        span: "col-span-1 row-span-1",
    },
    {
        src: "/images/IMG_8709.JPG",
        title: "The Voice",
        description: "Sharing insights that spark innovation",
        category: "Deep Work",
        span: "col-span-1 row-span-1",
    },
    {
        src: "/images/IMG_1549.JPG",
        title: "The Focus",
        description: "Deep in code, building the impossible",
        category: "Deep Work",
        span: "col-span-1 row-span-2",
    },
    {
        src: "/images/IMG_8244.JPG",
        title: "The Exchange",
        description: "Where mentorship meets ambition",
        category: "Mentorship",
        span: "col-span-1 row-span-1",
    },
    {
        src: "/images/IMG_8365.JPG",
        title: "The Wisdom",
        description: "Industry veterans guiding the next generation",
        category: "Mentorship",
        span: "col-span-1 row-span-1",
    },
    // {
    //     src: "/images/IMG_8495.JPG",
    //     title: "The Team",
    //     description: "Winners standing with their breakthrough",
    //     category: "Winners Circle",
    //     span: "col-span-2 row-span-1",
    // },
    {
        src: "/images/IMG_8732.JPG",
        title: "The Pitch",
        description: "Defending ideas under pressure",
        category: "Deep Work",
        span: "col-span-1 row-span-1",
    },
    {
        src: "/images/IMG_8911.JPG",
        title: "The Makers",
        description: "Cross-team synergy in action",
        category: "Deep Work",
        span: "col-span-1 row-span-1",
    },
    {
        src: "/images/IMG_8878.JPG",
        title: "The Champions",
        description: "₹40,000 Grand Prize: Ideas that move industries",
        category: "Winners Circle",
        span: "col-span-2 row-span-1",
    },
    {
        src: "/images/IMG_9067.JPG",
        title: "The Recognition",
        description: "Top 3 teams rewarded for excellence",
        category: "Winners Circle",
        span: "col-span-2 row-span-1",
    },
];

const stats = [
    { value: "48", label: "Hours Event", suffix: "" },
    { value: "36", label: "Hours Coding", suffix: "" },
    { value: "50", label: "Teams", suffix: "+" },
    { value: "70", label: "Prize Pool", suffix: "K" },
];

// Animated counter component
function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
    const [count, setCount] = useState(0);
    const numericValue = parseInt(value);

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const stepValue = numericValue / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += stepValue;
            if (current >= numericValue) {
                setCount(numericValue);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [numericValue]);

    return (
        <span>
            {count}
            {suffix}
        </span>
    );
}

export default function GalleryPage() {
    useAnalytics(); // Track page view
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (selectedImage !== null) {
                    setSelectedImage(null);
                } else {
                    router.push("/");
                }
            }
            if (selectedImage !== null) {
                if (e.key === "ArrowRight") {
                    setSelectedImage((prev) =>
                        prev !== null ? (prev + 1) % galleryItems.length : 0
                    );
                }
                if (e.key === "ArrowLeft") {
                    setSelectedImage((prev) =>
                        prev !== null
                            ? (prev - 1 + galleryItems.length) % galleryItems.length
                            : galleryItems.length - 1
                    );
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router, selectedImage]);

    const categories = ["all", ...new Set(galleryItems.map((item) => item.category))];
    const filteredItems =
        filter === "all"
            ? galleryItems
            : galleryItems.filter((item) => item.category === filter);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-brand-primary selection:text-white overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="relative w-24 h-6 block"
                    >
                        <Image
                            src="/brand/logo_white.png"
                            alt="Codevolt 2.0"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                    <button
                        onClick={() => router.push("/")}
                        className="text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                        [ ESC ] Back to Home
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center pt-12 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/20 via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-primary/30 blur-[150px] rounded-full" />

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-10 mt-8">
                            <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                            <span className="text-xs font-mono uppercase tracking-widest text-white/60">
                                CodeVolt 2025 Recap
                            </span>
                        </div>

                        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6">
                            <span className="text-white">The story of </span>
                            <br />
                            <span className="text-gradient">Codevolt 2025</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Where dreamers became builders. Where ideas became startups.
                            A defining moment in Chennai's tech history.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
                    >
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className="relative group p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 hover:border-brand-primary/30 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="relative">
                                    <div className="font-heading text-4xl md:text-5xl font-medium text-white mb-1">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-xs font-mono uppercase tracking-widest text-white/40">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1 h-2 bg-brand-primary rounded-full"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Category Filter */}
            <section className="py-8 px-6 border-b border-white/5">
                <div className="max-w-[1440px] mx-auto flex flex-wrap gap-3 justify-center">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-5 py-2.5 text-xs font-mono uppercase tracking-widest rounded-full border transition-all duration-300 ${filter === category
                                ? "bg-brand-primary text-white border-brand-primary"
                                : "bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-16 px-6">
                <div className="max-w-[1440px] mx-auto">
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[280px]">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item, i) => (
                                <motion.div
                                    key={item.src}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    className={`relative group cursor-pointer rounded-xl overflow-hidden ${item.span}`}
                                    onClick={() =>
                                        setSelectedImage(galleryItems.findIndex((g) => g.src === item.src))
                                    }
                                >
                                    <Image
                                        src={item.src}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Content */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 relative z-10">
                                            <span className="inline-block text-xs font-mono uppercase tracking-widest text-brand-primary mb-2">
                                                {item.category}
                                            </span>
                                            <h3 className="font-heading text-xl md:text-2xl font-medium !text-white mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm !text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hover border glow */}
                                    <div className="absolute inset-0 border-2 border-brand-primary/0 group-hover:border-brand-primary/50 rounded-xl transition-colors duration-300" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
                <div className="max-w-[1440px] mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-heading text-4xl md:text-6xl font-medium tracking-tight mb-6 text-white">
                            The <span className="text-brand-primary">Impact</span>
                        </h2>
                        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-16">
                            From midnight code sessions to breakthrough moments.
                            <br />
                            This is what innovation looks like.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Grand Prize",
                                value: "₹40,000",
                                description: "Awarded to the team that redefined what's possible",
                            },
                            {
                                title: "Runner Up",
                                value: "₹20,000",
                                description: "Excellence in execution and vision",
                            },
                            {
                                title: "Second Runner Up",
                                value: "₹10,000",
                                description: "Innovation that deserves recognition",
                            },
                        ].map((prize, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                className="relative group p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-primary/30 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <div className="relative">
                                    <div className="text-xs font-mono uppercase tracking-widest text-brand-primary mb-4">
                                        {prize.title}
                                    </div>
                                    <div className="font-heading text-4xl md:text-5xl font-medium text-white mb-4">
                                        {prize.value}
                                    </div>
                                    <p className="text-sm text-white/50">{prize.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 via-[#0a0a0a] to-brand-primary/20" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative max-w-3xl mx-auto text-center"
                >
                    <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white">
                        Ready for <span className="text-brand-primary">2.0</span>?
                    </h2>
                    <p className="text-lg text-white/50 mb-8">
                        The next chapter begins. Will you be part of it?
                    </p>
                    <Link
                        href="/register"
                        prefetch={true}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white font-mono text-sm uppercase tracking-widest rounded-full hover:bg-brand-primary/90 transition-colors"
                    >
                        <span>Join CodeVolt 2.0</span>
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </Link>
                </motion.div>
            </section>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        {/* Close button */}
                        <button
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation */}
                        <button
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(
                                    (prev) =>
                                        prev !== null
                                            ? (prev - 1 + galleryItems.length) % galleryItems.length
                                            : galleryItems.length - 1
                                );
                            }}
                        >
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(
                                    (prev) => (prev !== null ? (prev + 1) % galleryItems.length : 0)
                                );
                            }}
                        >
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Image */}
                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-5xl aspect-video"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={galleryItems[selectedImage].src}
                                alt={galleryItems[selectedImage].title}
                                fill
                                className="object-contain rounded-lg"
                                sizes="(max-width: 1200px) 100vw, 1200px"
                                priority
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-xs font-mono uppercase tracking-widest text-brand-primary">
                                    {galleryItems[selectedImage].category}
                                </span>
                                <h3 className="font-heading text-2xl font-medium text-white mt-1">
                                    {galleryItems[selectedImage].title}
                                </h3>
                                <p className="text-white/60 mt-1">
                                    {galleryItems[selectedImage].description}
                                </p>
                            </div>
                        </motion.div>

                        {/* Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-white/40">
                            {selectedImage + 1} / {galleryItems.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main >
    );
}
