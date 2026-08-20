"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

export const useAnalytics = () => {
    const pathname = usePathname();

    // Track Page View
    useEffect(() => {
        const trackView = async () => {
            try {
                await fetch(`${API_BASE_URL}/api/analytics/track`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "view",
                        path: pathname
                    }),
                });
            } catch (err) {
                // Silently fail for analytics
                // console.error(err);
            }
        };

        if (pathname) {
            trackView();
        }
    }, [pathname]);

    // Track Click Event
    const trackEvent = useCallback(async (target: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/analytics/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "click",
                    target: target,
                    path: pathname
                }),
            });
        } catch (err) {
            // Silently fail
        }
    }, [pathname]);

    return { trackEvent };
};
