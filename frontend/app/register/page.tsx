"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import html2canvas from "html2canvas";
import Barcode from "react-barcode";
import axios, { AxiosError } from "axios";
import { loadZohoScript } from "@/utils/zohoUtils";
import { API_BASE_URL } from "@/lib/config";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Timer } from "@/components/Timer";
import { TimeoutOverlay } from "@/components/TimeoutOverlay";

// --- Types ---
type TicketType = "early-bird" | "standard";

interface Participant {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    university: string;
    isSameUniv?: boolean; // Only for members > 1
    semester: string;
    tshirt: string;
    gender: string;
    isLeader?: boolean;
}

interface TeamDetails {
    teamName: string;
    excitement: string;
    updates: boolean;
    disability: boolean;
    source: string;
}

const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SOURCES = ["LinkedIn", "Instagram", "Friend/Colleague", "Community", "Other"];

// --- Components ---

const StepIndicator = ({ currentStep, totalSteps, onBack, sessionExpiry, onTimeout, isPaused = false }: { currentStep: number; totalSteps: number, onBack?: () => void, sessionExpiry?: number, onTimeout?: () => void, isPaused?: boolean }) => {
    return (
        <div className="flex items-center gap-4 mb-8">
            {/* Back Button Integration */}
            <div className={`transition-all duration-300 ${onBack ? "opacity-100 max-w-[40px]" : "opacity-0 max-w-0 overflow-hidden"}`}>
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-none bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all text-white hover:scale-105 active:scale-95"
                    aria-label="Go Back"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                </button>
            </div>

            <div className="flex-1 flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className="flex-1 h-1 bg-white/10 rounded-none overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: i < currentStep ? "100%" : i === currentStep ? "50%" : "0%" }}
                            className={`h-full ${i < currentStep ? "bg-green-500" : "bg-brand-primary"}`}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                ))}
            </div>

            {/* Timer Integration */}
            {sessionExpiry && onTimeout && (
                <div className="ml-2">
                    <Timer duration={sessionExpiry} onTimeout={onTimeout} label="Session" isPaused={isPaused} />
                </div>
            )}
        </div>
    );
};

// --- Validation Helpers ---
const isValidName = (name: string) => /^[A-Za-z\s]+$/.test(name);
const isValidTeamName = (name: string) => /^[A-Za-z0-9\s]+$/.test(name);
const isValidUniversity = (name: string) => /^[^0-9]+$/.test(name); // Allow all except numbers
const isValidSemester = (sem: string) => /^\d$/.test(sem);
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);

// --- Hackathon Pass Component ---
const HackathonPass = ({ participant, teamName, ticketType, index, candidateId }: { participant: Participant; teamName: string; ticketType: string; index: number, candidateId?: string }) => {
    const handleDownload = async () => {
        try {
            const element = document.getElementById(`ticket-${index}`);
            if (element) {
                const canvas = await html2canvas(element, {
                    backgroundColor: "#000000",
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    // allowTaint: false, // Explicitly false or omitted to allow toDataURL
                });
                const link = document.createElement("a");
                link.download = `CodeVolt26-Pass-${participant.firstName}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        } catch (err: any) {
            console.error("Hackathon Pass Download Error:", err);
            alert("Failed to download pass. Error: " + (err.message || "Unknown error"));
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                id={`ticket-${index}`}
                className="relative w-[340px] h-[520px] rounded-none overflow-hidden shadow-2xl flex flex-col select-none"
                style={{
                    backgroundColor: "#050505",
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                }}
            >
                {/* Background Orb - subtle orange glow */}
                <div
                    className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full blur-[100px]"
                    style={{ backgroundColor: "rgba(255, 69, 0, 0.08)" }}
                />

                {/* Header Section */}
                <div className="relative z-10 p-7 flex justify-between items-start">
                    <div>
                        <div className="font-mono text-xl font-bold tracking-tight mb-0.5 uppercase" style={{ color: "#FF4500" }}>CODEVOLT 2.0</div>
                        <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-left opacity-40 text-white">TIME TO BE MORE</div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 mt-1">
                        <div className="relative w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[#FF4500] opacity-20 blur-sm" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FF4500] shadow-[0_0_10px_rgba(255,69,0,0.8)]" />
                        </div>
                    </div>
                </div>

                {/* Attendee Info Section */}
                <div className="relative z-10 flex-1 px-8 flex flex-col justify-center -mt-4">
                    <div className="mb-10">
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] mb-4 text-white/30">Attendee</div>
                        <div className="font-bold leading-[0.9] tracking-tighter" style={{ fontSize: "3.5rem" }}>
                            <div className="text-white uppercase">{participant.firstName}</div>
                            <div className="text-white/30 uppercase">{participant.lastName}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-2 text-white/30 font-bold">Team</div>
                            <div className="font-bold text-lg text-white tracking-tight leading-none uppercase">{teamName || "Solo"}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-2 text-white/30 font-bold">Role</div>
                            <div className="font-bold text-lg text-white tracking-tight leading-none uppercase">{index === 0 ? "Leader" : "Hacker"}</div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <span className="text-sm font-mono font-bold uppercase tracking-[0.2em]" style={{ color: "#FF4500" }}>The Startup Sprint</span>
                    </div>
                </div>

                {/* Bottom Section: Barcode & Date */}
                <div
                    className="relative z-10 p-8 pt-10 border-t border-white/5"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                >
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-3">
                            {/* Blended Barcode */}
                            <div className="opacity-60 -ml-1">
                                <Barcode
                                    value={candidateId || `CV26-${index}`}
                                    width={1.1}
                                    height={40}
                                    displayValue={false}
                                    margin={0}
                                    background="transparent"
                                    lineColor="#ffffff"
                                />
                            </div>
                            <div className="text-[11px] font-mono text-white/20 tracking-widest uppercase font-bold">
                                ID: CV26-{candidateId?.split('-').pop() || participant.firstName.substring(0, 3).toUpperCase() + participant.lastName.substring(0, 3).toUpperCase()}
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            <div className="text-[28px] font-black leading-none" style={{ color: "#FF4500" }}>SEPTEMBER 9–11</div>
                            <div className="text-xs font-mono text-white/20 mt-1 font-bold">2026</div>
                        </div>
                    </div>
                </div>

                {/* Grainy Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                {/* Holographic Edge Effect */}
                <div
                    className="absolute inset-0 rounded-none pointer-events-none"
                    style={{
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        background: "linear-gradient(125deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.05) 100%)"
                    }}
                />
            </div>

            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-none text-sm font-medium transition-colors text-white/80 hover:text-white"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download Pass
            </button>
        </div>
    );
};

export default function RegisterPage() {
    useAnalytics(); // Track page view
    // Steps: 1: Select, 2: Leader/Team, 3: Members (if qty > 1), 4: Review, 5: Success
    const [step, setStep] = useState(1);
    const [ticketType, setTicketType] = useState<TicketType>("standard");
    const [quantity, setQuantity] = useState(3);
    const [migratedCandidates, setMigratedCandidates] = useState<any[]>([]);
    const [draftTeamId, setDraftTeamId] = useState<string | null>(null);

    // Timer State
    const SESSION_DURATION = 600; // 10 minutes in seconds
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);

    // Team Lead is always participants[0]
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [teamDetails, setTeamDetails] = useState<TeamDetails>({
        teamName: "",
        excitement: "",
        updates: false,
        disability: false,
        source: ""
    });

    const [prices, setPrices] = useState<{ "early-bird": number; "standard": number } | null>(null);
    const [isEarlyBirdEnabled, setIsEarlyBirdEnabled] = useState(true);

    // --- Effects ---

    const [isStandardEnabled, setIsStandardEnabled] = useState(true);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
    const [isTimerPaused, setIsTimerPaused] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Use 127.0.0.1 and no-store to avoid caching/localhost issues
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/settings`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.prices) {
                        setPrices({
                            "early-bird": data.prices.earlyBird,
                            "standard": data.prices.standard,
                        });
                    }
                    if (data.earlyBird !== undefined) setIsEarlyBirdEnabled(data.earlyBird);
                    if (data.standardEnabled !== undefined) setIsStandardEnabled(data.standardEnabled);
                    if (data.registrationOpen !== undefined) setIsRegistrationOpen(data.registrationOpen);

                    // If Early Bird disabled, default to standard
                    if (data.earlyBird === false) {
                        if (data.standardEnabled !== false) {
                            setTicketType("standard");
                        }
                    }
                } else {
                    setPrices({ "early-bird": 499, "standard": 799 });
                }
            } catch (err) {
                console.error("Failed to load settings", err);
                setPrices({ "early-bird": 499, "standard": 799 });
            }
        };
        fetchSettings();
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}); // New state for field-specific errors
    const [missingFields, setMissingFields] = useState<string[]>([]); // Keeping for backward compat with styles, but fieldErrors is preferred

    // Initialize participants array when quantity changes
    useEffect(() => {
        setParticipants((prev) => {
            // Logic: Preserve existing data if increasing. 
            // If decreasing, just slice.
            // When increasing, new slots are empty.

            const newParticipants = [...prev];
            if (quantity > prev.length) {
                for (let i = prev.length; i < quantity; i++) {
                    newParticipants.push({
                        id: i + 1,
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        university: "",
                        semester: "",
                        tshirt: "",
                        gender: ""
                    });
                }
            } else if (quantity < prev.length) {
                newParticipants.splice(quantity);
            }
            return newParticipants;
        });
    }, [quantity]);

    // Timer Logic
    useEffect(() => {
        if (step > 1 && !isSessionActive && !isTimeout) {
            setIsSessionActive(true);
        }
    }, [step, isSessionActive, isTimeout]);

    const handleTimeout = () => {
        setIsSessionActive(false);
        setIsTimeout(true);
    };

    const handleRestart = () => {
        setIsTimeout(false);
        setStep(1);
        setIsSessionActive(false);
        setQuantity(2); // Reset to default? Or keep preference? Let's reset for fresh start.
        window.scrollTo(0, 0);
    };

    const validateField = (name: string, value: string): string | null => {
        if (!value) return null; // Don't validate empty on change (wait for submit or blur?) or do we? strict valid
        // Actually for strict real-time, if they type a number in name, we want error.

        switch (name) {
            case 'firstName':
            case 'lastName':
                return isValidName(value) ? null : "Alphabets only";
            case 'email':
                // return isValidEmail(value) ? null : "Invalid email format"; // Too aggressive on change
                return null;
            case 'phone':
                // Check if only digits ? 
                if (!/^\d*$/.test(value)) return "Numbers only";
                if (value.length > 10) return "Max 10 digits";
                return null;
            case 'teamName':
                return isValidTeamName(value) ? null : "Alphanumeric only";
            case 'university':
                return isValidUniversity(value) ? null : "No numbers allowed";
            case 'semester':
                return isValidSemester(value) ? null : "Single digit only";
            default:
                return null;
        }
    };


    // Handle Participant Field Updates
    const updateParticipant = (index: number, field: keyof Participant, value: any) => {
        const newParticipants = [...participants];
        // Handle "Same University" logic
        if (field === "isSameUniv" && value === true && index > 0) {
            const leadUniv = newParticipants[0].university;
            newParticipants[index] = { ...newParticipants[index], isSameUniv: true, university: leadUniv };
        } else if (field === "isSameUniv" && value === false) {
            newParticipants[index] = { ...newParticipants[index], isSameUniv: false, university: "" };
        } else {
            newParticipants[index] = { ...newParticipants[index], [field]: value };
        }
        setParticipants(newParticipants);

        // Real-time validation
        const errorKey = `${index}-${field}`;
        const errorMsg = validateField(field as string, value);

        if (errorMsg) {
            setFieldErrors(prev => ({ ...prev, [errorKey]: errorMsg }));
        } else {
            // Clear error if valid
            if (fieldErrors[errorKey]) {
                const newErrors = { ...fieldErrors };
                delete newErrors[errorKey];
                setFieldErrors(newErrors);
            }
        }

        if (missingFields.includes(errorKey)) {
            setMissingFields(prev => prev.filter(f => f !== errorKey));
        }
    };

    const handleNext = () => {
        setError("");
        setFieldErrors({});
        setMissingFields([]);

        const validateParticipant = (p: Participant, index: number): Record<string, string> => {
            const errors: Record<string, string> = {};

            if (!isValidName(p.firstName)) errors[`${index}-firstName`] = "Alphabets only";
            if (!isValidName(p.lastName)) errors[`${index}-lastName`] = "Alphabets only";
            if (!isValidEmail(p.email)) errors[`${index}-email`] = "Invalid email format";
            if (!isValidPhone(p.phone)) errors[`${index}-phone`] = "Must be 10 digits";
            if (p.university && !isValidUniversity(p.university)) errors[`${index}-university`] = "No numbers allowed";
            if (p.semester && !isValidSemester(p.semester)) errors[`${index}-semester`] = "Single digit only";

            // Required Check
            const requiredFields: (keyof Participant)[] = ["firstName", "lastName", "email", "phone", "university", "semester", "tshirt", "gender"];
            requiredFields.forEach(field => {
                if (!p[field]) errors[`${index}-${field}`] = "Required";
            });

            return errors;
        };

        // Validation Step 2: Leader & Team Details
        if (step === 2) {
            let newFieldErrors: Record<string, string> = {};
            const lead = participants[0];

            // Validate Leader
            newFieldErrors = { ...validateParticipant(lead, 0) };

            // Validate Team Details
            if (!isValidTeamName(teamDetails.teamName)) newFieldErrors['teamName'] = "Alphanumeric only";
            if (!teamDetails.teamName) newFieldErrors['teamName'] = "Required";
            if (!teamDetails.excitement) newFieldErrors['excitement'] = "Required";
            if (!teamDetails.source) newFieldErrors['source'] = "Required";

            const missing: string[] = Object.keys(newFieldErrors);

            if (missing.length > 0) {
                setFieldErrors(newFieldErrors);
                setMissingFields(missing);
                setError("Please correct the highlighted errors.");
                return;
            }
        }

        // Validation Step 3: Members (Only if QTY > 1)
        if (step === 3) {
            let newFieldErrors: Record<string, string> = {};
            participants.slice(1).forEach((p, idx) => {
                const realIdx = idx + 1;
                const memberErrors = validateParticipant(p, realIdx);
                newFieldErrors = { ...newFieldErrors, ...memberErrors };
            });

            const missing: string[] = Object.keys(newFieldErrors);

            if (missing.length > 0) {
                setFieldErrors(newFieldErrors);
                setMissingFields(missing);
                setError("Please correct the highlighted errors.");
                return;
            }
        }

        const saveTeamDraft = async () => {
            const formattedParticipants = participants.map((p, idx) => ({
                phone: p.phone,
                firstName: p.firstName,
                lastName: p.lastName,
                email: p.email,
                college: p.university,
                department: p.semester,
                year: p.semester,
                tshirt: p.tshirt,
                gender: p.gender,
                isLeader: p.isLeader !== undefined ? p.isLeader : (idx === 0)
            }));

            const response = await axios.post(`${API_BASE_URL}/api/teams/draft`, {
                teamName: teamDetails.teamName || "Solo",
                ticketType,
                quantity,
                amount: prices ? prices[ticketType] * quantity : 0,
                excitement: teamDetails.excitement || "",
                source: teamDetails.source || "",
                disability: Boolean(teamDetails.disability),
                updates: Boolean(teamDetails.updates),
                participants: formattedParticipants
            });
            return response.data.data.draftTeamId;
        };

        const proceed = async () => {
            try {
                if (step === 2 && quantity === 1) {
                    const id = await saveTeamDraft();
                    setDraftTeamId(id);
                    setStep(4);
                } else if (step === 3) {
                    const id = await saveTeamDraft();
                    setDraftTeamId(id);
                    setStep(4);
                } else {
                    setStep(step + 1);
                }
                window.scrollTo(0, 0);
            } catch (err: any) {
                if (err.response && err.response.status === 409) {
                    setError(err.response.data.error || "One or more participants are already registered.");
                } else {
                    console.error("Draft save error:", err);
                    setError("Failed to save draft. Please try again.");
                }
            }
        };

        proceed();
    };

    const handleBack = () => {
        if (step === 4 && quantity === 1) {
            setStep(2);
        } else {
            setStep(step - 1);
        }
    };

    const initPayment = async () => {
        if (!prices) {
            setError("Prices are still loading. Please wait.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const loaded = await loadZohoScript();
            if (!loaded) throw new Error("Payment gateway failed to load");

            // 1. Create Payment Session
            if (!draftTeamId) {
                throw new Error("Draft team not found. Please review order again.");
            }
            const sessionUrl = `${API_BASE_URL}/api/payments/session`;
            const totalAmount = prices[ticketType] * quantity;
            const sessionData = {
                draftTeamId,
                currency: "INR"
            };

            const sessionResponse = await axios.post(sessionUrl, sessionData);
            const sessionId = sessionResponse.data.payments_session.payments_session_id;
            console.log("DEBUG: Created Payment Session:", { sessionId, totalAmount });

            // 2. Initialize Zoho Payments
            const accountId = process.env.NEXT_PUBLIC_ZOHO_PAYMENTS_ACC_ID;
            const apiKey = process.env.NEXT_PUBLIC_ZOHO_PAYMENTS_API_KEY;

            console.log("DEBUG: Zoho Credentials Setup:", {
                accountId: accountId ? "PRESENT" : "MISSING",
                apiKey: apiKey ? "PRESENT" : "MISSING",
                totalAmount
            });

            if (!accountId || accountId.includes("your_account_id") || !apiKey || apiKey.includes("your_api_key")) {
                throw new Error("Zoho Payment credentials are not configured.");
            }

            const config = {
                "account_id": accountId,
                "domain": "IN",
                "otherOptions": {
                    "api_key": apiKey
                }
            };



            const instance = new window.ZPayments(config);
            setIsTimerPaused(true);

            const options = {
                "amount": totalAmount.toString(),
                "currency_code": "INR",
                "payments_session_id": sessionId,
                "currency_symbol": "₹",
                "business": "CodeVolt 2026",
                "description": `${ticketType.toUpperCase()} Pass - ${quantity} Attendees`,
                "logo": 'https://www.rapteehv.com/favicon/raptee-favicon.svg',
                "address": {
                    "name": `${participants[0].firstName} ${participants[0].lastName}`,
                    "email": participants[0].email
                },
                "meta_data": [
                    {
                        "key": "team_data",
                        "value": JSON.stringify({ teamDetails, participants }).substring(0, 500)
                    }
                ],
            };

            try {
                const data = await instance.requestPaymentMethod(options);

                if (data.message === "success" || data.payment_id || data.message) {
                    await instance.close();

                    // 3. Finalize Registration on Backend
                    try {
                        const finalizeRes = await axios.post(`${API_BASE_URL}/api/payments/finalize`, {
                            draftTeamId,
                            paymentSessionId: sessionId,
                            paymentId: data.payment_id || sessionId
                        });

                        if (finalizeRes.data.candidates) {
                            setMigratedCandidates(finalizeRes.data.candidates);
                        }

                        setStep(5);
                    } catch (finalizeErr: any) {
                        console.error("Failed to finalize team registration:", finalizeErr);
                        setError(`Registration finalization failed: ${finalizeErr.response?.data?.error || finalizeErr.message}`);
                    }
                } else {
                    throw new Error("Payment was not completed successfully.");
                }
            } catch (err: any) {
                // Graceful handling for widget closed by user
                if (err.message === "Checkout widget closed by user" || err.response?.data?.error === "Checkout widget closed by user" || err.code === "widget_closed") {
                    console.log("Payment widget closed by user.");
                    // Do not set error, just let loading state clear in finally
                } else {
                    console.error("Zoho Payment Error:", err);
                    const errorMessage = err.response?.data?.error || err.message || "Unknown error occurred";
                    setError(`Payment failed: ${errorMessage}`);
                }
            } finally {
                await instance.close();
                setLoading(false);
                setIsTimerPaused(false);
            }
        } catch (outerErr: any) {
            console.error("Outer Payment Error:", outerErr);
            setError(`Payment initialization failed: ${outerErr.message}`);
            setLoading(false);
            setIsTimerPaused(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative overflow-hidden">
            {/* Timeout Overlay */}
            <AnimatePresence>
                {isTimeout && <TimeoutOverlay onRestart={handleRestart} />}
            </AnimatePresence>

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="p-6 md:p-10 flex justify-between items-center relative z-10">
                <Link href="/" className="text-xl font-mono font-bold tracking-tighter hover:text-brand-primary transition-colors text-white">
                    CODEVOLT_2.0
                </Link>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Cancel & Exit
                </Link>
            </header>

            <div className="flex-1 w-full max-w-3xl mx-auto p-6 md:p-10 relative z-10">
                {step < 5 && (
                    <div className="mb-0">
                        <StepIndicator
                            currentStep={step - 1}
                            totalSteps={4}
                            onBack={step > 1 ? handleBack : undefined}
                            sessionExpiry={isSessionActive ? SESSION_DURATION : undefined}
                            onTimeout={handleTimeout}
                            isPaused={isTimerPaused}
                        />
                    </div>
                )}

                <AnimatePresence mode="wait">

                    {/* STEP 1: SELECT */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {!isRegistrationOpen ? (
                                <div className="text-center py-20">
                                    <h2 className="text-3xl font-bold text-white mb-4">Registration Closed</h2>
                                    <p className="text-white/60">Tickets are not currently available. Please check back later.</p>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white" style={{ color: "#FFFFFF" }}>Select your access.</h1>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Early Bird - PREMIUM CARD (Brand Aligned) */}
                                        {isEarlyBirdEnabled && (
                                            <div
                                                onClick={() => setTicketType("early-bird")}
                                                className={`relative group overflow-hidden rounded-none cursor-pointer transition-all duration-300 ${ticketType === "early-bird" ? "ring-2 ring-brand-primary bg-white/5 scale-[1.02] shadow-[0_0_50px_rgba(255,69,0,0.15)]" : "border border-white/10 bg-white/5 hover:border-brand-primary/50 hover:bg-white/10"}`}
                                            >
                                                {/* Dynamic Background with Livelier Organic Mesh Effect */}
                                                <div className="absolute inset-0 bg-[#0a0a0f] z-0" />

                                                {/* Floating Soft Orbs for "Life" */}
                                                <motion.div
                                                    animate={{
                                                        x: [0, 50, -50, 0],
                                                        y: [0, -30, 30, 0],
                                                        scale: [1, 1.2, 0.9, 1]
                                                    }}
                                                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                                    className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-primary/20 blur-[100px] rounded-full mix-blend-plus-lighter opacity-60"
                                                />
                                                <motion.div
                                                    animate={{
                                                        x: [0, -30, 30, 0],
                                                        y: [0, 50, -50, 0],
                                                        scale: [0.9, 1.1, 0.9]
                                                    }}
                                                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                                    className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-500/10 blur-[80px] rounded-full mix-blend-plus-lighter opacity-50"
                                                />

                                                {/* Rotating Energy Field */}
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-20 z-0 pointer-events-none"
                                                    style={{
                                                        background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, #FF4500 120deg, transparent 240deg)",
                                                        filter: "blur(70px)"
                                                    }}
                                                />

                                                {/* Animated Border Gradient */}
                                                <div className="absolute inset-0 p-[1px] bg-gradient-to-br from-brand-primary via-white/10 to-transparent rounded-none z-10 pointer-events-none opacity-50" />

                                                {/* Highlight Badge */}
                                                <div className="absolute top-0 right-0 p-4 z-20">
                                                    <div className="bg-brand-primary text-black text-[10px] font-bold px-3 py-1 rounded-none uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-brand-primary/20">
                                                        Best Value
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="relative z-10 p-8 flex flex-col h-full">
                                                    <div className="mb-6">
                                                        <div className={`text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4 ${ticketType === "early-bird" ? "text-white" : "text-white/50"}`}>
                                                            Early Bird
                                                        </div>
                                                        <div className="flex items-baseline gap-3">
                                                            <span className="text-5xl font-black text-brand-primary tracking-tighter">
                                                                {prices ? `₹${prices["early-bird"]}` : "Loading..."}
                                                            </span>
                                                            {prices && (
                                                                <span className="text-lg text-white/30 line-through font-mono decoration-white/30">₹{Number(prices["early-bird"]) * 1.5}</span>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 text-white text-sm font-medium">Save 33% today</div>
                                                    </div>

                                                    <div className="mb-8 flex-1">
                                                        <p className="text-base text-gray-400 leading-relaxed font-light">
                                                            For the visionaries who move fast. Includes <span className="text-white font-medium">priority access</span>, exclusive swag kit, and all-inclusive hacking days.
                                                        </p>
                                                    </div>

                                                    <div className={`w-full py-4 rounded-none text-center font-bold text-sm tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 ${ticketType === "early-bird" ? "bg-brand-primary text-black" : "bg-white/10 text-white hover:bg-white/20"}`}>
                                                        {ticketType === "early-bird" ? (
                                                            <>
                                                                Selected <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                                                            </>
                                                        ) : "Select Pass"}
                                                    </div>
                                                </div>

                                                {/* Subtle Gradient Glow (Orange only) */}
                                                {ticketType === "early-bird" && (
                                                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full pointer-events-none" />
                                                )}
                                            </div>
                                        )}



                                        {/* Standard - MINIMAL CARD */}
                                        {isStandardEnabled && (
                                            <div
                                                onClick={() => setTicketType("standard")}
                                                className={`relative group overflow-hidden rounded-none cursor-pointer transition-all duration-300 ${ticketType === "standard" ? "ring-2 ring-white bg-white/5" : "border border-white/10 input-bg hover:border-white/30"}`}
                                            >
                                                <div className="relative z-10 p-8 flex flex-col h-full">
                                                    <div className="mb-6">
                                                        <div className="text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4 text-white/40">
                                                            Standard
                                                        </div>
                                                        <div className="flex items-baseline gap-3">
                                                            <span className="text-5xl font-black text-white tracking-tighter">
                                                                {prices ? `₹${prices["standard"]}` : "Loading..."}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 text-white/40 text-sm font-medium">Standard Entry</div>
                                                    </div>

                                                    <div className="mb-8 flex-1">
                                                        <p className="text-base text-gray-400 leading-relaxed font-light">
                                                            Standard entry pass. Grants access to workspace, mentorship sessions, and the final demo day.
                                                        </p>
                                                    </div>

                                                    <div className={`w-full py-4 rounded-none text-center font-bold text-sm tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 ${ticketType === "standard" ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white/20"}`}>
                                                        {ticketType === "standard" ? (
                                                            <>
                                                                Selected <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                                                            </>
                                                        ) : "Select Pass"}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="pt-8 border-t border-white/20">
                                <label className="block text-sm font-medium text-gray-300 mb-3">Number of Passes (3-5)</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(3, quantity - 1))}
                                        className="w-12 h-12 rounded-none bg-white/5 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-xl text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={quantity <= 3}
                                    >-</button>
                                    <span className="text-3xl font-mono font-bold w-12 text-center text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(5, quantity + 1))}
                                        className="w-12 h-12 rounded-none bg-white/5 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-xl text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={quantity >= 5}
                                    >+</button>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-brand-primary text-white font-bold text-lg py-4 rounded-none hover:bg-brand-primary/90 transition-all flex justify-center items-center gap-2 group"
                            >
                                Continue to Details
                                <svg className="group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: LEADER & TEAM (PURCHASE DETAILS) */}
                    {step === 2 && participants.length > 0 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white" style={{ color: "#FFFFFF" }}>Purchase Details</h1>
                                    <p className="text-gray-300 mt-2">Please enter details for the Team Lead / Purchaser.</p>
                                </div>

                                {/* EDIT PARTICIPANTS ON THE FLY */}
                                <div className="flex flex-col items-end">
                                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Passes</label>
                                    <div className="flex items-center gap-2 bg-white/5 rounded-none p-1 border border-white/10">
                                        <button
                                            onClick={() => setQuantity(Math.max(3, quantity - 1))}
                                            className="w-6 h-6 flex items-center justify-center rounded-none bg-white/5 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                                            disabled={quantity <= 3}
                                        >-</button>
                                        <span className="text-sm font-mono font-bold w-4 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(5, quantity + 1))}
                                            className="w-6 h-6 flex items-center justify-center rounded-none bg-white/5 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                                            disabled={quantity >= 5}
                                        >+</button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Team Info */}
                            <div className="grid gap-6">
                                {/* Team Name */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Team Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Team Name"
                                        value={teamDetails.teamName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setTeamDetails({ ...teamDetails, teamName: val });
                                            if (val) setMissingFields(prev => prev.filter(f => f !== 'teamName'));

                                            const err = validateField('teamName', val);
                                            if (err) {
                                                setFieldErrors(prev => ({ ...prev, 'teamName': err }));
                                            } else {
                                                const newErrors = { ...fieldErrors };
                                                delete newErrors['teamName'];
                                                setFieldErrors(newErrors);
                                            }
                                        }}
                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors['teamName'] || missingFields.includes('teamName') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                    />
                                    {fieldErrors['teamName'] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors['teamName']}</p>}
                                </div>

                                {/* Lead Personal Info */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Leader First Name</label>
                                        <input
                                            type="text"
                                            value={participants[0].firstName}
                                            onChange={(e) => updateParticipant(0, "firstName", e.target.value)}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors['0-firstName'] || missingFields.includes('0-firstName') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        />
                                        {fieldErrors['0-firstName'] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors['0-firstName']}</p>}
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Leader Last Name</label>
                                        <input
                                            type="text"
                                            value={participants[0].lastName}
                                            onChange={(e) => updateParticipant(0, "lastName", e.target.value)}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors['0-lastName'] || missingFields.includes('0-lastName') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        />
                                        {fieldErrors['0-lastName'] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors['0-lastName']}</p>}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email"
                                            value={participants[0].email}
                                            onChange={(e) => updateParticipant(0, "email", e.target.value)}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors['0-email'] || missingFields.includes('0-email') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        />
                                        {fieldErrors['0-email'] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors['0-email']}</p>}
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Phone</label>
                                        <input
                                            type="tel"
                                            value={participants[0].phone}
                                            onChange={(e) => updateParticipant(0, "phone", e.target.value)}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors['0-phone'] || missingFields.includes('0-phone') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        />
                                        {fieldErrors['0-phone'] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors['0-phone']}</p>}
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Gender</label>
                                        <select
                                            value={participants[0].gender}
                                            onChange={(e) => updateParticipant(0, "gender", e.target.value)}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors appearance-none ${missingFields.includes('0-gender') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        >
                                            <option value="" className="bg-[#0a0a0f] text-gray-400">Select Gender</option>
                                            <option value="Male" className="bg-[#0a0a0f] text-white">Male</option>
                                            <option value="Female" className="bg-[#0a0a0f] text-white">Female</option>
                                            <option value="Other" className="bg-[#0a0a0f] text-white">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">T-Shirt Size</label>
                                        <select
                                            value={participants[0].tshirt}
                                            onChange={(e) => updateParticipant(0, "tshirt", e.target.value)}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors appearance-none ${missingFields.includes('0-tshirt') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        >
                                            <option value="" className="bg-[#0a0a0f] text-gray-400">Select Size</option>
                                            {TSHIRT_SIZES.map(s => <option key={s} value={s} className="bg-[#0a0a0f] text-white">{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">University</label>
                                        <input
                                            type="text"
                                            value={participants[0].university}
                                            onChange={(e) => updateParticipant(0, "university", e.target.value)}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors['0-university'] || missingFields.includes('0-university') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        />
                                        {fieldErrors['0-university'] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors['0-university']}</p>}
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Current Semester</label>
                                        <input
                                            type="text"
                                            value={participants[0].semester}
                                            onChange={(e) => updateParticipant(0, "semester", e.target.value)}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors['0-semester'] || missingFields.includes('0-semester') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        />
                                        {fieldErrors['0-semester'] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors['0-semester']}</p>}
                                    </div>
                                </div>

                                {/* Additional Purchase Questions */}
                                <div className="space-y-4 pt-4 border-t border-white/20">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">What excites you about this hackathon?</label>
                                        <textarea
                                            value={teamDetails.excitement}
                                            onChange={(e) => {
                                                setTeamDetails({ ...teamDetails, excitement: e.target.value });
                                                if (e.target.value) setMissingFields(prev => prev.filter(f => f !== 'excitement'));
                                            }}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors h-24 resize-none ${missingFields.includes('excitement') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">How did you hear about this event?</label>
                                        <select
                                            value={teamDetails.source}
                                            onChange={(e) => {
                                                setTeamDetails({ ...teamDetails, source: e.target.value });
                                                if (e.target.value) setMissingFields(prev => prev.filter(f => f !== 'source'));
                                            }}
                                            className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors appearance-none ${missingFields.includes('source') ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                        >
                                            <option value="" className="bg-[#0a0a0f] text-gray-400">Select Option</option>
                                            {SOURCES.map(s => <option key={s} value={s} className="bg-[#0a0a0f] text-white">{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={teamDetails.disability}
                                            onChange={(e) => setTeamDetails({ ...teamDetails, disability: e.target.checked })}
                                            className="w-5 h-5 accent-brand-primary rounded-none"
                                        />
                                        <label className="text-sm text-gray-300">I need assistance for a disability.</label>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={teamDetails.updates}
                                            onChange={(e) => setTeamDetails({ ...teamDetails, updates: e.target.checked })}
                                            className="w-5 h-5 accent-brand-primary rounded-none"
                                        />
                                        <label className="text-sm text-gray-300">Get future tech updates from RapteeHV.</label>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-white text-black font-bold text-lg py-4 rounded-none hover:bg-white/90 transition-all"
                            >
                                {quantity > 1 ? "Next: Teammate Details" : "Review Order"}
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 3: MEMBERS (Only if Quantity > 1) */}
                    {step === 3 && quantity > 1 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white" style={{ color: "#FFFFFF" }}>Team Members</h1>
                                    <p className="text-gray-300 mt-2">Fill in details for your team members.</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Passes</label>
                                    <div className="flex items-center gap-2 bg-white/5 rounded-none p-1 border border-white/10">
                                        <button
                                            onClick={() => setQuantity(Math.max(3, quantity - 1))}
                                            className="w-6 h-6 flex items-center justify-center rounded-none bg-white/5 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                                            disabled={quantity <= 3}
                                        >-</button>
                                        <span className="text-sm font-mono font-bold w-4 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(5, quantity + 1))}
                                            className="w-6 h-6 flex items-center justify-center rounded-none bg-white/5 hover:bg-white/20 text-white disabled:opacity-30 transition-colors"
                                            disabled={quantity >= 5}
                                        >+</button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-8">
                                {participants.map((participant, idx) => {
                                    if (idx === 0) return null; // Skip Leader
                                    return (
                                        <div key={participant.id} className="p-6 bg-white/[0.03] border border-white/20 rounded-none relative">
                                            <div className="absolute -top-3 left-6 px-3 py-1 bg-[#0a0a0f] border border-white/20 rounded-none text-xs font-mono text-brand-primary">
                                                MEMBER {idx + 1}
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 mt-2">
                                                <div className="col-span-2 md:col-span-1">
                                                    <input
                                                        type="text"
                                                        placeholder="First Name *"
                                                        value={participant.firstName}
                                                        onChange={(e) => updateParticipant(idx, "firstName", e.target.value)}
                                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors[`${idx}-firstName`] || missingFields.includes(`${idx}-firstName`) ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                                    />
                                                    {fieldErrors[`${idx}-firstName`] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors[`${idx}-firstName`]}</p>}
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Last Name *"
                                                        value={participant.lastName}
                                                        onChange={(e) => updateParticipant(idx, "lastName", e.target.value)}
                                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors[`${idx}-lastName`] || missingFields.includes(`${idx}-lastName`) ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                                    />
                                                    {fieldErrors[`${idx}-lastName`] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors[`${idx}-lastName`]}</p>}
                                                </div>

                                                <div className="col-span-2">
                                                    <input
                                                        type="email"
                                                        placeholder="Email *"
                                                        value={participant.email}
                                                        onChange={(e) => updateParticipant(idx, "email", e.target.value)}
                                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors[`${idx}-email`] || missingFields.includes(`${idx}-email`) ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                                    />
                                                    {fieldErrors[`${idx}-email`] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors[`${idx}-email`]}</p>}
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <input
                                                        type="tel"
                                                        placeholder="Phone *"
                                                        value={participant.phone}
                                                        onChange={(e) => updateParticipant(idx, "phone", e.target.value)}
                                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors[`${idx}-phone`] || missingFields.includes(`${idx}-phone`) ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                                    />
                                                    {fieldErrors[`${idx}-phone`] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors[`${idx}-phone`]}</p>}
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <select
                                                        value={participant.gender}
                                                        onChange={(e) => updateParticipant(idx, "gender", e.target.value)}
                                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors appearance-none ${missingFields.includes(`${idx}-gender`) ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                                    >
                                                        <option value="" className="bg-[#0a0a0f] text-gray-400">Select Gender *</option>
                                                        <option value="Male" className="bg-[#0a0a0f] text-white">Male</option>
                                                        <option value="Female" className="bg-[#0a0a0f] text-white">Female</option>
                                                        <option value="Other" className="bg-[#0a0a0f] text-white">Other</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <select
                                                        value={participant.tshirt}
                                                        onChange={(e) => updateParticipant(idx, "tshirt", e.target.value)}
                                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors appearance-none ${missingFields.includes(`${idx}-tshirt`) ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                                    >
                                                        <option value="" className="bg-[#0a0a0f] text-gray-400">T-Shirt Size</option>
                                                        {TSHIRT_SIZES.map(s => <option key={s} value={s} className="bg-[#0a0a0f] text-white">{s}</option>)}
                                                    </select>
                                                </div>

                                                <div className="col-span-2 md:col-span-1">
                                                    <input
                                                        type="text"
                                                        placeholder="University *"
                                                        value={participant.university}
                                                        readOnly={participant.isSameUniv}
                                                        onChange={(e) => updateParticipant(idx, "university", e.target.value)}
                                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors[`${idx}-university`] || missingFields.includes(`${idx}-university`) ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'} ${participant.isSameUniv ? "opacity-50 cursor-not-allowed bg-black/40" : ""}`}
                                                    />
                                                    {fieldErrors[`${idx}-university`] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors[`${idx}-university`]}</p>}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={participant.isSameUniv || false}
                                                            onChange={(e) => updateParticipant(idx, "isSameUniv", e.target.checked)}
                                                            className="w-4 h-4 accent-brand-primary"
                                                        />
                                                        <span className="text-xs text-gray-300">Same as Team Lead</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Semester *"
                                                        value={participant.semester}
                                                        onChange={(e) => updateParticipant(idx, "semester", e.target.value)}
                                                        className={`w-full bg-white/5 border rounded-none px-4 py-3 text-white placeholder:text-white/50 focus:outline-none transition-colors ${fieldErrors[`${idx}-semester`] || missingFields.includes(`${idx}-semester`) ? 'border-red-500 bg-red-500/5' : 'border-white/20 focus:border-brand-primary'}`}
                                                    />
                                                    {fieldErrors[`${idx}-semester`] && <p className="text-red-400 text-xs mt-1 font-mono">{fieldErrors[`${idx}-semester`]}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-white text-black font-bold text-lg py-4 rounded-none hover:bg-white/90 transition-all"
                            >
                                Review Order
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white" style={{ color: "#FFFFFF" }}>Order Summary</h1>
                            </div>

                            <div className="bg-white/[0.03] border border-white/20 rounded-2xl p-6 md:p-8">
                                <div className="flex justify-between items-center pb-6 border-b border-white/10">
                                    <div>
                                        <div className="text-xl font-bold text-white capitalize">{ticketType.replace("-", " ")} Pass</div>
                                        <div className="text-gray-400 text-sm">{quantity} Attendees • Team {teamDetails.teamName}</div>
                                    </div>
                                    <div className="text-2xl font-bold text-brand-primary">
                                        {prices ? `₹${(prices[ticketType] * quantity).toLocaleString()}` : "Loading..."}
                                    </div>
                                </div>
                                <div className="pt-6 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-mono font-bold text-gray-500 uppercase mb-2">Primary Contact</h4>
                                        <p className="text-white font-medium">{participants[0].firstName} {participants[0].lastName}</p>
                                        <p className="text-gray-400 text-sm">{participants[0].email} • {participants[0].phone}</p>
                                    </div>

                                    {quantity > 1 && (
                                        <div>
                                            <h4 className="text-xs font-mono font-bold text-gray-500 uppercase mb-2">Team Members</h4>
                                            <div className="space-y-2">
                                                {participants.slice(1).map((p, i) => (
                                                    <div key={p.id} className="text-sm flex justify-between">
                                                        <span className="text-gray-300">{p.firstName} {p.lastName}</span>
                                                        <span className="text-gray-500">{p.email}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={initPayment}
                                disabled={loading || !prices}
                                className="w-full bg-brand-primary text-white font-bold text-lg py-4 rounded-none hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : !prices ? (
                                    "Loading prices..."
                                ) : (
                                    <>
                                        Pay ₹{(prices[ticketType] * quantity).toLocaleString()}
                                        {/* SVG removed as requested */}
                                    </>
                                )}
                            </button>
                            {error && <p className="text-center text-red-400 text-sm">{error}</p>}
                        </motion.div>
                    )}

                    {/* STEP 5: SUCCESS */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="mb-10">
                                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white tracking-tight">YOU&apos;RE IN.</h1>
                                <p className="text-xl text-white/60">Welcome to the future, Team {teamDetails.teamName}.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center mb-16 max-w-4xl mx-auto">
                                {participants.map((p, i) => {
                                    // Match participant with migrated data by phone
                                    const migrated = migratedCandidates.find(c => String(c.phone) === String(p.phone));
                                    return (
                                        <HackathonPass
                                            key={p.id}
                                            participant={p}
                                            teamName={teamDetails.teamName}
                                            ticketType={ticketType}
                                            index={i}
                                            candidateId={migrated?.ROWID}
                                        />
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                                <Link href="/" className="w-full bg-brand-primary text-black font-bold py-4 rounded-none hover:bg-white transition-all">
                                    Return to Homepage
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main >
    );
}
