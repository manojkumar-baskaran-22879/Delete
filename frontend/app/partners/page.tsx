"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

// Partners List
const partners = [
    {
        name: "Raptee.HV",
        logo: "/brand/raptee_logo.png",
        category: "An Initiative By",
        description: "Building the future of electric motorcycles. #TimeToBeMore",
        gridClass: "md:col-span-6 md:row-span-1",
        color: "#000000",
        gradient: "from-[#000000]/20 to-[#000000]/0",
        Pattern: NetworkPattern,
        layout: "horizontal"
    },
    {
        name: "Zoho",
        logo: "/partners/zoho.png",
        category: "Strategic Partner",
        description: "The Operating System for Business. Empowering enterprises with a suite of 50+ apps.",
        gridClass: "md:col-span-3 md:row-span-1",
        color: "#0071BC", // Zoho Blue
        gradient: "from-[#0071BC]/20 to-[#0071BC]/0",
        Pattern: RangoliPattern
    },
    {
        name: "Startup TN",
        logo: "/partners/startuptn.png",
        category: "Ecosystem Partner",
        description: "Driving the startup revolution in Tamil Nadu.",
        gridClass: "md:col-span-3 md:row-span-1",
        color: "#E86F2C", // StartupTN Orange
        gradient: "from-[#E86F2C]/20 to-[#E86F2C]/0",
        Pattern: TemplePattern
    },
    {
        name: "VIT Vellore",
        logo: "/partners/vit.png",
        category: "Academic Partner",
        description: "A premier institute driving research, technology, and academic excellence.",
        gridClass: "md:col-span-2 md:row-span-1",
        color: "#005EB8", // VIT Blue
        gradient: "from-[#005EB8]/20 to-[#005EB8]/0",
        Pattern: CulturePattern
    },
    {
        name: "CIIC",
        logo: "/partners/ciic.png",
        category: "Incubation Partner",
        description: "Crescent Innovation & Incubation Centre - Nurturing deep-tech startups from 0 to 1.",
        gridClass: "md:col-span-2 md:row-span-1",
        color: "#8A2BE2", // CIIC Purple
        gradient: "from-[#8A2BE2]/20 to-[#8A2BE2]/0",
        Pattern: IncubationPattern
    },
    {
        name: "Wadhwani Foundation",
        logo: "/partners/wadhwani.png",
        category: "Knowledge Partner",
        description: "Empowering entrepreneurs and creating high-value jobs through innovation & education.",
        gridClass: "md:col-span-2 md:row-span-1",
        color: "#00A859", // Wadhwani Green
        gradient: "from-[#00A859]/20 to-[#00A859]/0",
        Pattern: KnowledgePattern
    },
    {
        name: "Red Bull",
        logo: "/partners/redbull.png",
        category: "Energy Partner",
        description: "Gives You Wings. Fueling energy, focus, and peak performance for builders.",
        gridClass: "md:col-span-6 md:row-span-1",
        color: "#CC0000", // Red Bull Red
        gradient: "from-[#CC0000]/20 to-[#CC0000]/0",
        Pattern: EnergyPattern,
        layout: "horizontal"
    },
];

// Duplicate partners for Marquee
const marqueePartners = [...partners, ...partners, ...partners];

export default function PartnersPage() {
    useAnalytics();
    const containerRef = useRef(null);

    return (
        <main ref={containerRef} className="min-h-screen bg-white text-black selection:bg-brand-primary selection:text-white font-sans overflow-hidden">

            {/* Ambient Lighting */}
            <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-brand-primary opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />

            {/* Navigation Overlay */}
            <nav className="fixed top-0 left-0 w-full px-6 py-6 md:px-10 flex justify-between items-center z-50 pointer-events-none">
                <Link href="/" className="pointer-events-auto group relative w-24 h-6">
                    <Image
                        src="/brand/logo_black.png"
                        alt="Codevolt"
                        fill
                        className="object-contain"
                        priority
                    />
                </Link>
                <Link href="/" className="pointer-events-auto px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-primary transition-colors shadow-lg">
                    Close
                </Link>
            </nav>

            {/* Header Section */}
            <section className="pt-32 pb-20 px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 bg-gray-100 rounded-full font-mono text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-200">
                            The Alliance
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-black leading-[0.9]">
                        Orchestrating <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-orange-400">The Ecosystem.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
                        We don't just build code. We build networks. Backed by industry titans defining the future.
                    </p>
                </motion.div>
            </section>

            {/* Bento Grid */}
            <section className="max-w-7xl mx-auto px-6 pb-20 md:pb-32">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-auto">
                    {partners.map((partner, index) => (
                        <PartnerCard key={partner.name} partner={partner} index={index} />
                    ))}
                </div>
            </section>

            {/* PRISM CTA FOOTER */}
            <section className="relative pt-32 pb-0 overflow-hidden">
                {/* Aurora Backgrounds */}
                <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] bg-[#FF4500] opacity-20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-[#FF8C00] opacity-20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-7xl md:text-[9rem] font-black tracking-tighter uppercase leading-[0.8] mb-8 text-black">
                            Join The <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] via-[#FF6B35] to-[#E86F2C]">Revolution.</span>
                        </h2>

                        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-16 font-medium">
                            The future isn't built in silos. It's built in networks. <br />
                            Fuel the grid. Become a Codevolt Partner.
                        </p>

                        <div className="flex justify-center mb-10 scroll-mt-20">
                            <Link href="mailto:contact@codevolt.in" className="group relative inline-flex items-center justify-center px-10 py-5 bg-black text-white text-lg font-bold uppercase tracking-widest rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-2xl shadow-[#FF4500]/30 hover:shadow-[#FF4500]/50">
                                <span className="relative z-10 mr-4 group-hover:mr-6 transition-all">Become a Partner</span>
                                <svg className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>

                                {/* Button Fill Effect */}
                                <div className="absolute inset-0 bg-[#FF4500] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Integrated Marquee */}
                <div className="border-t border-black/[0.05] bg-white/50 backdrop-blur-sm py-6">
                    <div className="overflow-hidden">
                        <motion.div
                            className="flex items-center whitespace-nowrap"
                            initial={{ x: 0 }}
                            animate={{ x: "-50%" }}
                            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                        >
                            {[...marqueePartners, ...marqueePartners].map((p, i) => {
                                const isRaptee = p.name === "Raptee.HV";
                                return (
                                    <div key={i} className={`relative ${isRaptee ? "w-40 h-20 md:w-64 md:h-32" : "w-32 h-16 md:w-48 md:h-24"} flex-shrink-0 transition-all duration-300 cursor-pointer mx-8 hover:scale-105`}>
                                        <Image
                                            src={p.logo}
                                            alt={p.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>

            </section>
        </main>
    );
}

function PartnerCard({ partner, index }: { partner: any, index: number }) {
    const Pattern = partner.Pattern;
    const isHorizontal = partner.layout === "horizontal";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`group relative bg-gray-50 rounded-[2rem] p-8 border border-black/[0.04] hover:border-transparent transition-all duration-500 overflow-hidden flex ${isHorizontal ? 'flex-col md:flex-row md:items-center md:gap-12' : 'flex-col justify-between'} hover:shadow-2xl ${partner.gridClass}`}
        >
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                <Pattern />
            </div>

            {/* Content */}
            <div className={`relative z-20 h-full w-full flex ${isHorizontal ? 'flex-col md:flex-row md:justify-between md:items-center' : 'flex-col justify-between'}`}>

                {/* Horizontal Layout - Explicit separate columns */}
                {isHorizontal ? (
                    <>
                        <div className="md:w-1/3 flex-shrink-0">
                            <div className="flex justify-between items-start mb-8 md:mb-0">
                                <div className="relative transition-all duration-500 w-48 h-24 md:w-64 md:h-32">
                                    <Image src={partner.logo} alt={partner.name} fill className="object-contain left-0" />
                                </div>
                            </div>
                        </div>

                        <div className="md:w-2/3 md:pl-8 border-l border-black/10">
                            <div className="flex flex-col h-full justify-center">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-primary mb-2 block">{partner.category}</span>
                                        <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-black">{partner.name}</h3>
                                    </div>
                                </div>
                                <p className="text-lg md:text-xl font-medium text-gray-500 leading-relaxed max-w-2xl group-hover:text-black/70 transition-colors">
                                    {partner.description}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    // Vertical Layout - Grouped Top Content to prevent spacing issues
                    <>
                        <div>
                            <div className="flex justify-between items-start mb-4 md:mb-5">
                                <div className="w-24 h-24 md:w-32 md:h-32 relative grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <Image src={partner.logo} alt={partner.name} fill className="object-contain left-0" />
                                </div>
                            </div>

                            <h3 className="text-3xl font-bold tracking-tight mb-3 text-black">{partner.name}</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-xs group-hover:text-black/70 transition-colors">
                                {partner.description}
                            </p>
                        </div>

                        <div className="mt-4 md:mt-5 pt-3 md:pt-6 border-t border-black/[0.06] flex justify-between items-end">
                            <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 group-hover:text-black/50 transition-colors">{partner.category}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Hover Gradient Background */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${partner.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-50 transition-opacity duration-500 mix-blend-overlay" />
        </motion.div>
    );
}

// ==========================================
// PATTERN COMPONENTS (SVG)
// ==========================================

function RangoliPattern() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <pattern id="rangoli" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="2" fill="currentColor" />
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M10 0 L20 10 L10 20 L0 10 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rangoli)" />
        </svg>
    );
}

function TemplePattern() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <pattern id="temple" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M5 35 L35 35 L30 25 L10 25 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M10 25 L30 25 L25 15 L15 15 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M15 15 L25 15 L20 5 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#temple)" />
        </svg>
    );
}

function NetworkPattern() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <pattern id="network" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="25" cy="15" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="25" r="1.5" fill="currentColor" />
                    <path d="M5 5 L25 15 L10 25 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#network)" />
        </svg>
    );
}

function CulturePattern() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <pattern id="culture" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M5 20 Q20 20 20 10 Q20 20 35 20" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <rect x="10" y="30" width="20" height="2" fill="currentColor" opacity="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#culture)" />
        </svg>
    );
}

function EnergyPattern() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <pattern id="energy" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M15 2 L7 16 L14 16 L12 28 L23 12 L16 12 Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#energy)" />
        </svg>
    );
}

function KnowledgePattern() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <pattern id="knowledge" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="10" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M15 5 L15 25 M5 15 L25 15" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.3" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#knowledge)" />
        </svg>
    );
}

function IncubationPattern() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <pattern id="incubation" x="0" y="0" width="34.64" height="40" patternUnits="userSpaceOnUse">
                    <path d="M17.32 0 L34.64 10 L34.64 30 L17.32 40 L0 30 L0 10 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <circle cx="17.32" cy="20" r="4" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#incubation)" />
        </svg>
    );
}
