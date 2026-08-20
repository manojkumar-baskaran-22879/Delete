"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
    { name: "Thesis", id: "thesis" },
    { name: "The Track", id: "track" },
    { name: "Process", id: "gates" },
    { name: "Rewards", id: "outcomes" },
    { name: "Apply", id: "admissions" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isManualScroll = useRef(false);

    // Handle scroll for glass effect intensity and active section tracking
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Skip active state update if we're scrolling manually (clicked a link)
            if (isManualScroll.current) return;

            // Active section detection
            const sections = navItems.map(item => document.getElementById(item.id));
            // Offset to trigger earlier (center of screen or just below nav)
            const scrollPosition = window.scrollY + window.innerHeight / 3;

            for (const section of sections) {
                if (section) {
                    const offsetTop = section.offsetTop;
                    const offsetHeight = section.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveTab(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setIsMobileMenuOpen(false); // close mobile menu when a section is clicked
        const element = document.getElementById(id);
        if (element) {
            // Lock auto-detection
            isManualScroll.current = true;
            setActiveTab(id);

            // Account for navbar height + visual breathing room
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });

            // Unlock after animation (approximate duration)
            setTimeout(() => {
                isManualScroll.current = false;
            }, 1000);
        } else if (pathname !== "/") {
            // If the element doesn't exist and we are not on the home page, navigate to home and append hash
            router.push(`/#${id}`);
        }
    };

    if (pathname?.startsWith('/cultures') || pathname?.startsWith('/partners') || pathname?.startsWith('/gallery') || pathname?.startsWith('/admin')) return null;

    return (
        <nav
            // Removed motion.nav initial entry animation to prevent stutter on navigation back
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/90 border-b border-black/5 shadow-sm backdrop-blur-md"
                : "bg-white/50 border-b border-transparent backdrop-blur-sm"
                }`}
        >
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
                <div className="flex items-center z-20">
                    <Link 
                        href="/" 
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            if (pathname === "/") {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }} 
                        className="relative w-24 h-6 block"
                    >
                        <Image
                            src="/brand/logo_orange.png"
                            alt="Codevolt"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Center Aligned Links - Desktop Only */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <ul className="flex items-center gap-1">
                        <li>
                            <Link
                                href="/gallery"
                                prefetch={false}
                                className="relative px-4 py-2 text-sm font-mono font-medium text-brand-primary hover:text-brand-primary/80 transition-colors duration-300"
                            >
                                <span className="relative z-10">2025</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/faq"
                                prefetch={false}
                                className="relative px-4 py-2 text-sm font-mono font-medium text-text-muted hover:text-brand-primary transition-colors duration-300"
                            >
                                <span className="relative z-10">FAQ</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/agenda"
                                prefetch={false}
                                className="relative px-4 py-2 text-sm font-mono font-medium text-text-muted hover:text-brand-primary transition-colors duration-300"
                            >
                                <span className="relative z-10">AGENDA</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/partners"
                                prefetch={false}
                                className="relative px-4 py-2 text-sm font-mono font-medium text-text-muted hover:text-brand-primary transition-colors duration-300"
                            >
                                <span className="relative z-10">PARTNERS</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/terms"
                                prefetch={false}
                                className="relative px-4 py-2 text-sm font-mono font-medium text-text-muted hover:text-brand-primary transition-colors duration-300"
                            >
                                <span className="relative z-10">RULES</span>
                            </Link>
                        </li>

                        <li className="w-px h-4 bg-text-muted/20 mx-1" />
                        {navItems.filter(item => item.id !== 'admissions').map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => scrollToSection(item.id)}
                                    className={`relative px-4 py-2 text-sm font-mono font-medium transition-colors duration-300 ${activeTab === item.id
                                        ? "text-brand-primary"
                                        : "text-text-muted hover:text-text-main"
                                        }`}
                                >
                                    {activeTab === item.id && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-white rounded-full shadow-sm"
                                            style={{ borderRadius: 9999 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 mix-blend-multiply">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Aligned Apply Button & Cultures - Desktop Only */}
                <ul className="hidden lg:flex items-center gap-4 z-20">
                    <li>
                        <Link
                            href="/cultures"
                            prefetch={false}
                            className="relative px-4 py-2 text-sm font-mono cultures-link"
                        >
                            <span className="relative z-10">CULTURES</span>
                        </Link>
                    </li>

                    {navItems.filter(item => item.id === 'admissions').map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => scrollToSection(item.id)}
                                className="group flex items-center gap-2 px-6 py-2 bg-brand-primary text-white font-mono text-sm tracking-wide hover:bg-brand-primary/90 transition-all shadow-sm"
                            >
                                GET PASSES
                                <svg
                                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Mobile Menu Button - Visible Only on Smaller Screens */}
                <div className="lg:hidden flex items-center z-20">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-text-main focus:outline-none p-2"
                        aria-label="Toggle mobile menu"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-black/5 overflow-hidden"
                    >
                        <ul className="flex flex-col items-center py-6 gap-6 shadow-lg">
                            <li><Link href="/gallery" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="text-brand-primary font-mono font-medium text-base">2025</Link></li>
                            <li><Link href="/faq" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="text-text-muted hover:text-brand-primary font-mono font-medium text-base">FAQ</Link></li>
                            <li><Link href="/agenda" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="text-text-muted hover:text-brand-primary font-mono font-medium text-base">AGENDA</Link></li>
                            <li><Link href="/partners" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="text-text-muted hover:text-brand-primary font-mono font-medium text-base">PARTNERS</Link></li>
                            <li><Link href="/terms" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="text-text-muted hover:text-brand-primary font-mono font-medium text-base">RULES</Link></li>
                            <li><Link href="/cultures" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="text-text-muted hover:text-brand-primary font-mono font-medium text-base cultures-link">CULTURES</Link></li>
                            
                            <div className="w-full max-w-[200px] h-px bg-neutral-200 my-2"></div>
                            
                            {navItems.filter(item => item.id !== 'admissions').map((item) => (
                                <li key={item.id}>
                                    <button 
                                        onClick={() => scrollToSection(item.id)} 
                                        className={`font-mono font-medium text-base ${activeTab === item.id ? "text-brand-primary" : "text-text-muted hover:text-brand-primary"}`}
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ))}
                            
                            <div className="w-full max-w-[200px] h-px bg-neutral-200 my-2"></div>
                            
                            {navItems.filter(item => item.id === 'admissions').map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => scrollToSection(item.id)}
                                        className="group flex items-center gap-2 px-8 py-3 bg-brand-primary text-white font-mono text-base tracking-wide hover:bg-brand-primary/90 transition-all shadow-sm"
                                    >
                                        GET PASSES
                                        <svg
                                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
