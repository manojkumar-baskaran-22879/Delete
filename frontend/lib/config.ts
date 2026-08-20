// Runtime detection for API URL
const getApiBaseUrl = () => {
    // Check for environment variable first
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // Server-side: return empty string
    if (typeof window === "undefined") return "";

    const isLocalhost = window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
        // In Catalyst local development (catalyst serve), both frontend and backend 
        // usually share the same port (e.g. 3000). Using a relative URL ("")
        // ensures requests go to the correct port without needing hardcoded values.

        // If you are running NEXT.JS DEV SERVER (npm run dev) and a 
        // SEPARATE node backend on 9000, allow specific override:
        if (window.location.port === "3000") return "http://localhost:9000";

        return "";
    }

    // Production: Always relative (or set via env var during build if needed)
    return "";
};

export const API_BASE_URL = getApiBaseUrl();
