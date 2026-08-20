"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import versionInfo from "../../version.json";

// --- Types ---
interface AnalyticsData {
    views: { timestamp: string; path: string; userAgent?: string }[];
    clicks: { timestamp: string; target: string; path: string }[];
}

interface SettingsData {
    earlyBird: boolean;
    standardEnabled: boolean;
    registrationOpen: boolean;
    prices: { earlyBird: number; standard: number };
}

interface Registration {
    id: string;
    status: "DRAFT" | "PENDING" | "PAID" | "FAILED";
    createdAt: string;
    updatedAt?: string;
    paymentSessionId: string | null;
    paymentId?: string;
    paidAt?: string;
    ticketType: string;
    quantity: number;
    amount: number;
    teamName: string;
    excitement?: string;
    source?: string;
    updates?: boolean | string;
    disability?: boolean | string;
    participants: {
        firstName: string;
        lastName?: string;
        email: string;
        phone: string;
        college?: string;
        year?: string;
        tshirt?: string;
        gender?: string;
        isConverted?: boolean;
    }[];
    currency?: string;
}

// --- Utility Functions ---
const parseUserAgent = (ua?: string) => {
    if (!ua) return { device: "Unknown", browser: "Unknown" };
    const isMobile = /Mobile|Android|iPhone/i.test(ua);
    const isTablet = /iPad|Tablet/i.test(ua);
    const device = isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop";
    let browser = "Other";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    return { device, browser };
};

const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const formatDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

// --- Animated Counter Hook ---
const useCounter = (target: number, duration = 1500) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === 0) { setCount(0); return; }
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(current));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
};

// --- Components ---
const StatCard = ({ title, value, icon, trend, color = "orange" }: { title: string; value: number; icon: React.ReactNode; trend?: string; color?: string }) => {
    const animatedValue = useCounter(value);
    const colors: Record<string, string> = { orange: "from-orange-500/20 to-orange-600/5", green: "from-green-500/20 to-green-600/5", blue: "from-blue-500/20 to-blue-600/5", purple: "from-purple-500/20 to-purple-600/5" };
    const accents: Record<string, string> = { orange: "text-orange-500", green: "text-green-500", blue: "text-blue-500", purple: "text-purple-500" };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`relative overflow-hidden bg-gradient-to-br ${colors[color]} border border-white/10 rounded-2xl p-6 group hover:border-white/20 transition-all`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${accents[color]}`}>{icon}</div>
                {trend && <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div className="text-4xl font-bold text-white mb-1 tracking-tight">{animatedValue.toLocaleString()}</div>
            <div className="text-sm text-white/50 font-medium">{title}</div>
        </motion.div>
    );
};

const ActivityItem = ({ event, type }: { event: any; type: "view" | "click" }) => (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-transparent hover:border-white/10 transition-all group">
        <div className={`w-2 h-2 rounded-full ${type === "view" ? "bg-blue-500" : "bg-orange-500"} animate-pulse`} />
        <div className="flex-1 min-w-0">
            <div className="text-sm text-white/80 font-medium truncate">{type === "view" ? event.path : event.target}</div>
            <div className="text-xs text-white/40">{type === "click" && <span className="text-orange-400/60">{event.path}</span>}</div>
        </div>
        <div className="text-xs text-white/30 font-mono">{formatTime(new Date(event.timestamp))}</div>
    </motion.div>
);

const TopPagesChart = ({ data }: { data: Record<string, number> }) => {
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 6);
    const max = sorted[0]?.[1] || 1;
    return (
        <div className="space-y-3">
            {sorted.map(([path, count], i) => (
                <motion.div key={path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="group">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70 font-mono truncate max-w-[200px]">{path}</span>
                        <span className="text-sm font-bold text-white">{count}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const DeviceBreakdown = ({ data }: { data: { device: string; count: number }[] }) => {
    const total = data.reduce((acc, d) => acc + d.count, 0) || 1;
    const icons: Record<string, string> = { Desktop: "💻", Mobile: "📱", Tablet: "📱", Unknown: "❓" };
    return (
        <div className="grid grid-cols-2 gap-4">
            {data.map((d, i) => (
                <motion.div key={d.device} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.05] transition-all">
                    <div className="text-2xl mb-2">{icons[d.device] || "🖥️"}</div>
                    <div className="text-2xl font-bold text-white">{Math.round((d.count / total) * 100)}%</div>
                    <div className="text-xs text-white/50">{d.device}</div>
                </motion.div>
            ))}
        </div>
    );
};

// --- Main Component ---
export default function AdminPage() {
    const [token, setToken] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [activeTab, setActiveTab] = useState<"overview" | "settings" | "analytics" | "registrations" | "drafts" | "logs">("overview");
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [registrations, setRegistrations] = useState<Registration[] | null>(null);
    const [drafts, setDrafts] = useState<any[] | null>(null);
    const [systemLogs, setSystemLogs] = useState<any[] | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("admin_token");
        if (stored) { setToken(stored); fetchData(stored); }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Refetch settings specifically when switching to the settings tab to ensure fresh data
    useEffect(() => {
        if (activeTab === "settings" && token) {
            refreshSettings();
        }
    }, [activeTab]);

    const refreshSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings`);
            if (res.ok) setSettings(await res.json());
        } catch (err) {
            console.error("Failed to refresh settings:", err);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setLoginError("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
            const data = await res.json();
            if (data.success) { setToken(data.token); localStorage.setItem("admin_token", data.token); fetchData(data.token); }
            else setLoginError(data.error || "Login failed");
        } catch { setLoginError("Connection error"); }
        finally { setAuthLoading(false); }
    };

    const handleLogout = () => { setToken(null); localStorage.removeItem("admin_token"); setAnalytics(null); setSettings(null); setRegistrations(null); };

    const fetchData = async (authToken: string) => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const [settingsRes, analyticsRes, regsRes, draftsRes, logsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/settings`),
                fetch(`${API_BASE_URL}/api/analytics`, { headers: { Authorization: `Bearer ${authToken}` } }),
                fetch(`${API_BASE_URL}/api/admin/registrations`, { headers: { Authorization: `Bearer ${authToken}` } }),
                fetch(`${API_BASE_URL}/api/admin/drafts`, { headers: { Authorization: `Bearer ${authToken}` } }),
                fetch(`${API_BASE_URL}/api/admin/logs`, { headers: { Authorization: `Bearer ${authToken}` } })
            ]);

            if (!settingsRes.ok) console.error("Settings fetch failed:", settingsRes.status);
            if (!analyticsRes.ok) console.error("Analytics fetch failed:", analyticsRes.status);
            if (!regsRes.ok) console.error("Registrations fetch failed:", regsRes.status);
            if (!draftsRes.ok) console.error("Drafts fetch failed:", draftsRes.status);
            if (!logsRes.ok) console.error("Logs fetch failed:", logsRes.status);

            if (settingsRes.ok) setSettings(await settingsRes.json());
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            else setAnalytics({ views: [], clicks: [] });
            if (regsRes.ok) setRegistrations(await regsRes.json());
            if (draftsRes.ok) setDrafts(await draftsRes.json());
            if (logsRes.ok) setSystemLogs(await logsRes.json());
            else setSystemLogs([]); // Fix infinite loading on error

            if (!regsRes.ok || !draftsRes.ok) {
                setFetchError(`Failed to fetch some data. Regs: ${regsRes.status}, Drafts: ${draftsRes.status}`);
            }
        } catch (err: any) {
            console.error("Failed to fetch", err);
            setFetchError(err.message || "Network error occurred");
            setSystemLogs(prev => prev || []); // Ensure logs UI stops loading
            setAnalytics(prev => prev || { views: [], clicks: [] });
        }
        finally { setIsLoading(false); }
    };

    const saveSettings = async () => {
        if (!settings || !token) return;
        setSaveStatus("saving");
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(settings) });
            setSaveStatus(res.ok ? "success" : "error");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch { setSaveStatus("error"); }
    };

    // Computed analytics
    const computedAnalytics = useMemo(() => {
        const safeAnalytics = analytics || { views: [], clicks: [] };
        const pageViews = (safeAnalytics.views || []).reduce((acc, v) => { acc[v.path] = (acc[v.path] || 0) + 1; return acc; }, {} as Record<string, number>);
        const deviceCounts: Record<string, number> = {};
        (safeAnalytics.views || []).forEach(v => { const { device } = parseUserAgent(v.userAgent); deviceCounts[device] = (deviceCounts[device] || 0) + 1; });
        const devices = Object.entries(deviceCounts).map(([device, count]) => ({ device, count }));
        const today = new Date().toDateString();
        const todayViews = (safeAnalytics.views || []).filter(v => new Date(v.timestamp).toDateString() === today).length;
        const todayClicks = (safeAnalytics.clicks || []).filter(c => new Date(c.timestamp).toDateString() === today).length;
        return { pageViews, devices, todayViews, todayClicks };
    }, [analytics]);

    const filteredClicks = useMemo(() => {
        const safeAnalytics = analytics || { views: [], clicks: [] };
        return (safeAnalytics.clicks || []).filter(c => c.target.toLowerCase().includes(searchQuery.toLowerCase()) || c.path.toLowerCase().includes(searchQuery.toLowerCase())).slice().reverse().slice(0, 100);
    }, [analytics, searchQuery]);

    // --- Login Screen ---
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
                </div>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md relative z-10 p-8">
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="text-center mb-10">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 mb-6">
                                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                            </motion.div>
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Command Center</h1>
                            <p className="text-white/40 text-sm font-medium font-mono">// CODEVOLT ADMIN v{versionInfo.version}</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-mono font-semibold text-orange-500/80 uppercase tracking-widest mb-2">&gt; Identity</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-mono font-semibold text-orange-500/80 uppercase tracking-widest mb-2">&gt; Credential</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-mono" />
                            </div>
                            <AnimatePresence>{loginError && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs font-mono text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3">⚠ {loginError.toUpperCase()}</motion.div>}</AnimatePresence>
                            <button type="submit" disabled={authLoading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 shadow-lg shadow-orange-500/25">
                                {authLoading ? <span className="font-mono animate-pulse">AUTHENTICATING...</span> : <><span>ENTER DASHBOARD</span><svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
                            </button>
                        </form>
                    </div>
                    <p className="text-center mt-6 text-xs text-white/20 font-mono">🔒 ENCRYPTED • 256-BIT TLS</p>
                </motion.div>
            </div>
        );
    }

    // --- Dashboard ---
    const tabs = [
        { id: "overview" as const, label: "Overview", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
        { id: "analytics" as const, label: "Analytics", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
        { id: "registrations" as const, label: "Registrations", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
        { id: "drafts" as const, label: "Drafts", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> },
        { id: "settings" as const, label: "Settings", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { id: "logs" as const, label: "System Logs", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
    ];

    return (
        <div className="min-h-screen bg-[#050508] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#050508]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="relative w-24 h-6">
                                <Image
                                    src="/brand/logo_orange.png"
                                    alt="Codevolt Admin"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="text-sm font-mono font-bold text-orange-500/50 tracking-widest mt-1">ADMIN v{versionInfo.version}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"}`}>
                                    {tab.icon}<span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-mono text-white/80">{formatTime(currentTime)}</div>
                            <div className="text-xs text-white/40">{formatDate(currentTime)}</div>
                        </div>
                        <button onClick={() => fetchData(token)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white" title="Refresh">
                            <svg className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                        </button>
                        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">Logout</button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-6 py-8">
                {fetchError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="text-sm font-mono">{fetchError}</span>
                        </div>
                        <button onClick={() => fetchData(token!)} className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">RETRY</button>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <StatCard title="Total Registrations" value={registrations?.length || 0} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>} color="orange" trend="Paid Teams" />
                                <StatCard title="In-Progress Drafts" value={drafts?.length || 0} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>} color="blue" trend="Potential" />
                                <StatCard title="Total Page Views" value={analytics?.views?.length || 0} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} color="green" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg> Top Pages</h3>
                                    <TopPagesChart data={computedAnalytics?.pageViews || {}} />
                                </div>
                                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg> Device Breakdown</h3>
                                    <DeviceBreakdown data={computedAnalytics?.devices || []} />
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg> Live Activity Feed</h3>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {(analytics?.views || []).slice(-10).reverse().map((v, i) => <ActivityItem key={`v-${i}`} event={v} type="view" />)}
                                    {(analytics?.clicks || []).slice(-5).reverse().map((c, i) => <ActivityItem key={`c-${i}`} event={c} type="click" />)}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Click Events</h2>
                                <input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 outline-none w-64" />
                            </div>
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5"><tr><th className="p-4 text-xs font-semibold text-white/50 uppercase">Time</th><th className="p-4 text-xs font-semibold text-white/50 uppercase">Target</th><th className="p-4 text-xs font-semibold text-white/50 uppercase">Page</th></tr></thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredClicks.slice(0, 50).map((click, i) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors"><td className="p-4 font-mono text-xs text-white/60">{new Date(click.timestamp).toLocaleString()}</td><td className="p-4 font-semibold text-orange-400">{click.target}</td><td className="p-4 text-white/50">{click.path}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredClicks.length === 0 && <div className="p-8 text-center text-white/30">No click events found</div>}
                            </div>
                        </motion.div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === "settings" && settings && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl space-y-8">
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                                    <div><h3 className="text-xl font-bold">Registration Status</h3><p className="text-white/50 text-sm mt-1">Open or close all registrations</p></div>
                                    <button onClick={() => setSettings({ ...settings, registrationOpen: !settings.registrationOpen })} className={`relative w-14 h-8 rounded-full transition-colors ${settings.registrationOpen ? "bg-orange-500" : "bg-white/10"}`}>
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${settings.registrationOpen ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pb-6 pt-6 border-b border-white/10">
                                    <div><h3 className="text-xl font-bold">Early Bird Mode</h3><p className="text-white/50 text-sm mt-1">Enable discounted pricing tier</p></div>
                                    <button onClick={() => setSettings({ ...settings, earlyBird: !settings.earlyBird })} className={`relative w-14 h-8 rounded-full transition-colors ${settings.earlyBird ? "bg-orange-500" : "bg-white/10"}`}>
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${settings.earlyBird ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pb-6 pt-6 border-b border-white/10">
                                    <div><h3 className="text-xl font-bold">Standard Tickets</h3><p className="text-white/50 text-sm mt-1">Enable standard pricing tier</p></div>
                                    <button onClick={() => setSettings({ ...settings, standardEnabled: !settings.standardEnabled })} className={`relative w-14 h-8 rounded-full transition-colors ${settings.standardEnabled ? "bg-orange-500" : "bg-white/10"}`}>
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${settings.standardEnabled ? "left-7" : "left-1"}`} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-6">
                                    <div><label className="block text-xs font-semibold text-white/40 uppercase mb-2">Early Bird Price (₹)</label><input type="number" value={settings.prices.earlyBird} onChange={e => setSettings({ ...settings, prices: { ...settings.prices, earlyBird: parseInt(e.target.value) || 0 } })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500/50 outline-none" /></div>
                                    <div><label className="block text-xs font-semibold text-white/40 uppercase mb-2">Standard Price (₹)</label><input type="number" value={settings.prices.standard} onChange={e => setSettings({ ...settings, prices: { ...settings.prices, standard: parseInt(e.target.value) || 0 } })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500/50 outline-none" /></div>
                                </div>
                                <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                                    <span className={`text-sm font-medium ${saveStatus === "success" ? "text-green-400" : saveStatus === "error" ? "text-red-400" : "text-white/30"}`}>{saveStatus === "success" ? "✓ Saved successfully" : saveStatus === "error" ? "✗ Save failed" : ""}</span>
                                    <button onClick={saveSettings} disabled={saveStatus === "saving"} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25">{saveStatus === "saving" ? "Saving..." : "Save Changes"}</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Registrations Tab */}
                    {activeTab === "registrations" && registrations && (
                        <motion.div key="registrations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Orders ({registrations.length})</h2>
                            </div>

                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/5 text-xs font-semibold text-white/50 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-5 border-b border-white/10">Purchased By</th>
                                            <th className="p-5 border-b border-white/10">Date & Time</th>
                                            <th className="p-5 border-b border-white/10">Amount</th>
                                            <th className="p-5 border-b border-white/10">Orders</th>
                                            <th className="p-5 border-b border-white/10">Payment ID</th>
                                            <th className="p-5 border-b border-white/10">Status</th>
                                            <th className="p-5 border-b border-white/10">Source</th>
                                            <th className="p-5 border-b border-white/10">Excitement</th>
                                            <th className="p-5 border-b border-white/10">Disability</th>
                                            <th className="p-5 border-b border-white/10">Updates</th>
                                            <th className="p-5 border-b border-white/10">Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {registrations.length === 0 ? (
                                            <tr><td colSpan={9} className="p-8 text-center text-white/30">No registrations found</td></tr>
                                        ) : (
                                            registrations.slice().reverse().map((reg, i) => (
                                                <tr
                                                    key={reg.id || i}
                                                    onClick={() => setSelectedRegistration(reg)}
                                                    className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                                                >
                                                    <td className="p-5">
                                                        <div className="font-bold text-white">{reg.teamName || "Solo Hacker"}</div>
                                                        <div className="text-white/40 text-xs mt-0.5">{reg.participants?.[0]?.email}</div>
                                                    </td>
                                                    <td className="p-5">
                                                        {(() => {
                                                            const dateStr = reg.paidAt || reg.createdAt || (reg as any).CREATEDTIME;
                                                            if (!dateStr) return <span className="text-white/20">-</span>;
                                                            // Normalize "YYYY-MM-DD HH:mm:ss:SSS" to ISO
                                                            let normalized = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
                                                            if (typeof normalized === 'string' && normalized.match(/:\d{3}$/)) {
                                                                normalized = normalized.replace(/:(\d{3})$/, '.$1');
                                                            }
                                                            const d = new Date(normalized);
                                                            return isNaN(d.getTime()) ? (
                                                                <span className="text-white/20" title={dateStr}>Invalid Date</span>
                                                            ) : (
                                                                <>
                                                                    <div className="font-medium text-white/90">
                                                                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </div>
                                                                    <div className="text-white/40 text-xs mt-0.5">
                                                                        {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="p-5 font-mono font-medium text-white/90">
                                                        {reg.currency === 'USD' ? '$' : '₹'}{reg.amount.toLocaleString()}
                                                    </td>
                                                    <td className="p-5">
                                                        <span className="text-brand-primary group-hover:underline decoration-brand-primary/50 underline-offset-4 font-medium">
                                                            {reg.quantity} Ticket{reg.quantity > 1 ? 's' : ''}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 font-mono text-xs text-white/50 truncate max-w-[120px]" title={reg.paymentId || "N/A"}>
                                                        {reg.paymentId || "-"}
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${reg.status === 'PAID' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                            reg.status === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                                'bg-white/5 border-white/10 text-white/40'
                                                            }`}>
                                                            {reg.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-white/60 text-xs">
                                                        {reg.source || "-"}
                                                    </td>
                                                    <td className="p-5 text-white/60 text-xs">
                                                        {reg.excitement || "-"}
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-2 py-1 rounded text-xs ${(reg.disability === true || reg.disability === 'true') ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                                                            {(reg.disability === true || reg.disability === 'true') ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-2 py-1 rounded text-xs ${(reg.updates === true || reg.updates === 'true') ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                                                            {(reg.updates === true || reg.updates === 'true') ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-white/60 font-mono text-xs">
                                                        {reg.participants?.[0]?.phone}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* Drafts Tab */}
                    {activeTab === "drafts" && drafts && (
                        <motion.div key="drafts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">In-Progress Drafts ({drafts.length})</h2>
                            </div>

                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/5 text-xs font-semibold text-white/50 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-5 border-b border-white/10">Team Name</th>
                                            <th className="p-5 border-b border-white/10">Date & Time</th>
                                            <th className="p-5 border-b border-white/10">Amount</th>
                                            <th className="p-5 border-b border-white/10">Orders</th>
                                            <th className="p-5 border-b border-white/10">Status</th>
                                            <th className="p-5 border-b border-white/10">Source</th>
                                            <th className="p-5 border-b border-white/10">Excitement</th>
                                            <th className="p-5 border-b border-white/10">Disability</th>
                                            <th className="p-5 border-b border-white/10">Updates</th>
                                            <th className="p-5 border-b border-white/10">Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {drafts.length === 0 ? (
                                            <tr><td colSpan={10} className="p-8 text-center text-white/30">No drafts found</td></tr>
                                        ) : (
                                            drafts.slice().reverse().map((draft, i) => (
                                                <tr key={draft.id || draft.ROWID || i} onClick={() => setSelectedRegistration(draft)} className="hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                                    <td className="p-5">
                                                        <div className="font-bold text-white">{draft.teamName || "Solo Hacker"}</div>
                                                        <div className="text-white/40 text-xs mt-0.5">{draft.participants?.[0]?.email}</div>
                                                    </td>
                                                    <td className="p-5">
                                                        {(() => {
                                                            const dateStr = draft.createdAt || (draft as any).CREATEDTIME;
                                                            if (!dateStr) return <span className="text-white/20">-</span>;
                                                            let normalized = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
                                                            if (typeof normalized === 'string' && normalized.match(/:\d{3}$/)) {
                                                                normalized = normalized.replace(/:(\d{3})$/, '.$1');
                                                            }
                                                            const d = new Date(normalized);
                                                            return isNaN(d.getTime()) ? (
                                                                <span className="text-white/20" title={dateStr}>Invalid Date</span>
                                                            ) : (
                                                                <>
                                                                    <div className="font-medium text-white/90">
                                                                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </div>
                                                                    <div className="text-white/40 text-xs mt-0.5">
                                                                        {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="p-5 font-mono font-medium text-white/90">
                                                        {draft.currency === 'USD' ? '$' : '₹'}{(draft.amount || 0).toLocaleString()}
                                                    </td>
                                                    <td className="p-5">
                                                        <span className="text-brand-primary group-hover:underline decoration-brand-primary/50 underline-offset-4 font-medium">
                                                            {draft.quantity} Ticket{draft.quantity > 1 ? 's' : ''}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                                            {draft.status || 'DRAFT'}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-white/60 text-xs">
                                                        {draft.source || "-"}
                                                    </td>
                                                    <td className="p-5 text-white/60 text-xs">
                                                        {draft.excitement || "-"}
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-2 py-1 rounded text-xs ${draft.disability === true || draft.disability === 'true' ? 'bg-red-500/20 text-red-400' : 'text-white/20'}`}>
                                                            {(draft.disability === true || draft.disability === 'true') ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-2 py-1 rounded text-xs ${draft.updates === true || draft.updates === 'true' ? 'bg-blue-500/20 text-blue-400' : 'text-white/20'}`}>
                                                            {(draft.updates === true || draft.updates === 'true') ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-white/60 font-mono text-xs">
                                                        {draft.participants?.[0]?.phone}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* System Logs Tab */}
                    {activeTab === "logs" && (
                        <motion.div key="logs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    System Logs {systemLogs && <span className="text-sm font-normal text-white/40 bg-white/5 px-2 py-1 rounded-lg">{systemLogs.length} events</span>}
                                </h2>
                            </div>

                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/5 text-xs font-semibold text-white/50 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 border-b border-white/10">Timestamp</th>
                                            <th className="p-4 border-b border-white/10">Module</th>
                                            <th className="p-4 border-b border-white/10">Message</th>
                                            <th className="p-4 border-b border-white/10">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {!systemLogs ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-white/30">Loading logs...</td></tr>
                                        ) : systemLogs.length === 0 ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-white/30">No system logs found</td></tr>
                                        ) : (
                                            systemLogs.map((log, i) => (
                                                <tr key={log.id || i} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4 font-mono text-xs text-white/60 whitespace-nowrap">
                                                        {new Date(log.created_at || (log as any).CREATEDTIME || Date.now()).toLocaleString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-medium text-white/80">
                                                            {log.module}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-medium text-red-400">
                                                        {log.message}
                                                    </td>
                                                    <td className="p-4 text-xs font-mono text-white/40 max-w-md truncate" title={log.details}>
                                                        {log.details || "-"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Registration Detail Modal */}
                <AnimatePresence>
                    {selectedRegistration && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedRegistration(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-[#0F0F13] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
                            >
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-[#0F0F13]/95 backdrop-blur z-10 p-6 border-b border-white/10 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-white">
                                                Team {selectedRegistration.teamName || "Solo Hacker"}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedRegistration.status === 'PAID' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                selectedRegistration.status === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                    'bg-white/5 border-white/10 text-white/40'
                                                }`}>
                                                {selectedRegistration.status}
                                            </span>
                                        </div>
                                        <div className="text-white/40 text-sm font-mono">
                                            ID: {selectedRegistration.id} • {(() => {
                                                const dStr = selectedRegistration.paidAt || selectedRegistration.createdAt || (selectedRegistration as any).CREATEDTIME;
                                                if (!dStr) return "Unknown Date";
                                                let normalized = typeof dStr === 'string' && dStr.includes(' ') ? dStr.replace(' ', 'T') : dStr;
                                                if (typeof normalized === 'string' && normalized.match(/:\d{3}$/)) {
                                                    normalized = normalized.replace(/:(\d{3})$/, '.$1');
                                                }
                                                const d = new Date(normalized);
                                                return isNaN(d.getTime()) ? dStr : d.toLocaleString();
                                            })()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedRegistration(null)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column: Team & Payment Info */}
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <h4 className="text-xs font-bold text-white/40 uppercase mb-4">Payment Details</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/60">Amount</span>
                                                    <span className="text-white font-mono">₹{selectedRegistration.amount}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/60">Tickets</span>
                                                    <span className="text-white">{selectedRegistration.quantity}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-white/60">Type</span>
                                                    <span className="text-white capitalize">{selectedRegistration.ticketType}</span>
                                                </div>
                                                <div className="pt-3 border-t border-white/10 space-y-1">
                                                    <div className="text-xs text-white/40 truncate" title={selectedRegistration.paymentId || undefined}>
                                                        <span className="text-white/30">Txn:</span> <span className="font-mono text-white/70">{selectedRegistration.paymentId || "N/A"}</span>
                                                    </div>
                                                    <div className="text-xs text-white/30 truncate" title={selectedRegistration.paymentSessionId || undefined}>
                                                        <span className="text-white/30">Session:</span> <span className="font-mono">{selectedRegistration.paymentSessionId || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <h4 className="text-xs font-bold text-white/40 uppercase mb-4">Team Info</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs text-white/30 mb-1">Excitement Level</label>
                                                    <p className="text-sm text-white/80">{selectedRegistration.excitement || "-"}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-white/30 mb-1">Source</label>
                                                    <p className="text-sm text-white/80">{selectedRegistration.source || "-"}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {(selectedRegistration.updates === true || selectedRegistration.updates === 'true') && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Updates On</span>}
                                                    {(selectedRegistration.disability === true || selectedRegistration.disability === 'true') && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Accessibility Req</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Participants */}
                                    <div className="lg:col-span-2">
                                        <h4 className="text-xs font-bold text-white/40 uppercase mb-4">Participants ({selectedRegistration.participants.length})</h4>
                                        <div className="space-y-3">
                                            {selectedRegistration.participants.map((p, idx) => (
                                                <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                                                    {idx === 0 && (
                                                        <div className="absolute top-0 right-0 bg-brand-primary/20 text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                                            LEADER
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-white text-lg flex items-center gap-3">
                                                                {p.firstName} {p.lastName}
                                                                {p.isConverted && (
                                                                    <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] uppercase tracking-wider rounded-full flex-shrink-0">Registered / Converted</span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-white/60 font-mono mt-1">{p.email}</div>
                                                            <div className="text-sm text-white/60 font-mono">{p.phone}</div>
                                                        </div>
                                                        <div className="flex-1 border-l border-white/10 md:pl-4 space-y-1">
                                                            <div className="text-sm"><span className="text-white/30 text-xs">College:</span> <span className="text-white/80">{p.college}</span></div>
                                                            <div className="text-sm"><span className="text-white/30 text-xs">Year:</span> <span className="text-white/80">{p.year}</span></div>
                                                            <div className="text-sm"><span className="text-white/30 text-xs">Gender:</span> <span className="text-white/80 capitalize">{p.gender}</span></div>
                                                            <div className="text-sm"><span className="text-white/30 text-xs">Shirt:</span> <span className="text-white/80">{p.tshirt}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {isLoading && !analytics && (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex items-center gap-3 text-white/50"><svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg><span>Loading data...</span></div>
                    </div>
                )}
            </main>
        </div>
    );
}
