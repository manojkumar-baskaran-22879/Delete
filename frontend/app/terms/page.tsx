"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

const rules = [
    {
        title: "Participation & Conduct",
        content: [
            "CodeVolt is a professional, offline working environment.",
            "Participants are expected to:",
            "Engage respectfully with mentors, evaluators, and fellow teams.",
            "Maintain professional conduct throughout the event.",
            "Follow instructions provided by the organizing team.",
            "Any behavior that disrupts the environment or compromises fairness may result in removal from the event."
        ]
    },
    {
        title: "Originality & Ownership",
        content: [
            "All work presented at CodeVolt must be original.",
            "Ideas must be conceived during the event.",
            "Pre-built projects, prior implementations, or copied concepts are not permitted.",
            "Submissions that closely replicate existing products without original thinking will not move forward.",
            "Ownership matters. Teams must fully understand and be able to defend what they build."
        ]
    },
    {
        title: "Use of Tools & AI",
        content: [
            "The use of tools, including AI, is permitted to:",
            "Research problems.",
            "Explore solutions.",
            "Accelerate execution.",
            "However:",
            "Ideas must not be fully auto-generated.",
            "Teams must demonstrate independent thinking and decision-making.",
            "AI may assist execution. It may not replace ownership."
        ]
    },
    {
        title: "Development & Submission",
        content: [
            "All development must occur during the CodeVolt timeline.",
            "Teams may use publicly available libraries and frameworks responsibly.",
            "Any form of plagiarism, code copying, or misrepresentation will lead to disqualification.",
            "Submissions must reflect the work completed during the event."
        ]
    },
    {
        title: "Evaluation & Decisions",
        content: [
            "Teams are evaluated based on clarity, decision-making, execution, and realism.",
            "The evaluation committee’s decisions are final.",
            "No appeals or disputes will be entertained.",
            "This ensures fairness and consistency across all teams."
        ]
    },
    {
        title: "Disqualification & Removal",
        content: [
            "Teams may be disqualified for:",
            "Violating originality requirements.",
            "Misrepresenting work or ideas.",
            "Engaging in unethical or disruptive behavior.",
            "Disqualification decisions are made to protect the integrity of the event."
        ]
    },
    {
        title: "Safety, Health & Accessibility",
        content: [
            "Participants are responsible for their own well-being.",
            "Basic facilities and support will be provided.",
            "Participants with special needs or health concerns are encouraged to inform the organizing team in advance.",
            "The team will make reasonable efforts to accommodate requests."
        ]
    },
    {
        title: "Media & Content Usage",
        content: [
            "By participating in CodeVolt, participants consent to:",
            "Photography and videography during the event.",
            "Use of event media for documentation and promotional purposes.",
            "Personal data will be handled responsibly and only for event-related purposes."
        ]
    },
    {
        title: "Amendments & Authority",
        content: [
            "The organizing team reserves the right to:",
            "Modify schedules or formats if required.",
            "Clarify or update guidelines when necessary.",
            "All decisions taken by the organizing committee are final."
        ]
    }
];

export default function TermsPage() {
    useAnalytics(); // Track page view
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                router.push("/");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    return (
        <main className="min-h-screen bg-white text-[#282828] font-sans selection:bg-brand-primary selection:text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#282828]/5">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="font-heading font-medium text-xl tracking-tight hover:text-brand-primary transition-colors">
                        Codevolt 2.0
                    </Link>
                    <button
                        onClick={() => router.push("/")}
                        className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-[#282828] transition-colors"
                    >
                        [ ESC ] Back to Home
                    </button>
                </div>
            </header>

            <div className="pt-32 pb-24 px-6">
                <div className="max-w-[1440px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 border-b border-[#282828]/10 pb-8"
                    >
                        <h1 className="font-heading text-4xl md:text-6xl font-medium tracking-tight mb-6">
                            The Blueprint & <span className="text-brand-primary">Rules of Engagement.</span>
                        </h1>
                        <p className="font-mono text-sm text-neutral-500 max-w-xl leading-relaxed">
                            These guidelines exist to protect fairness, originality, and the seriousness of the environment.
                            Participation in CodeVolt implies strict adherence to these standards.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                        {rules.map((rule, i) => (
                            <motion.article
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group"
                            >
                                <div className="font-mono text-xs text-brand-primary mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                                    SECTION 0{i + 1}
                                </div>
                                <h2 className="font-heading text-lg font-medium mb-4 group-hover:text-brand-primary transition-colors">
                                    {rule.title}
                                </h2>
                                <div className="space-y-2">
                                    {rule.content.map((line, j) => (
                                        <p key={j} className={`text-sm leading-relaxed ${j === 0 ? 'text-[#282828] font-medium' : 'text-neutral-600'}`}>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
