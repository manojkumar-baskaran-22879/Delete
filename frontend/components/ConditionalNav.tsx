"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Pages where navbar should be hidden
const pagesWithoutNav = ["/gallery", "/terms", "/faq", "/agenda"];

export function ConditionalNav() {
    const pathname = usePathname();
    const shouldHide = pagesWithoutNav.some(page => pathname.startsWith(page));

    if (shouldHide) return null;
    return <Navbar />;
}

export function ConditionalFooter() {
    // Footer is always visible
    return <Footer />;
}
