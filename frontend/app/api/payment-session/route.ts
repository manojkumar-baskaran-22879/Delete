import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Since this is a client component calling its own backend, 
        // and Express is serving both, we can just use the absolute path /create-payment-session
        const internalUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/create-payment-session`;

        console.log("Requesting internal payment session endpoint:", internalUrl);

        const response = await axios.post(internalUrl, body, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Proxy error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Failed to create payment session", details: error.response?.data || error.message },
            { status: error.response?.status || 500 }
        );
    }
}
