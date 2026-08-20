const axios = require('axios');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'registrations.json');

// Helper to wait
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    console.log("--- Starting Duplicate Check Test ---");

    // 1. Backup existing DB
    let backup = [];
    if (fs.existsSync(dbPath)) {
        backup = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }

    try {
        // 2. Seed DB with a PAID registration
        const seed = [{
            id: "REG-TEST-EXISTING",
            status: "PAID",
            participants: [{ email: "conflict@example.com" }],
            paymentSessionId: "mock-session-paid"
        }];
        fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
        console.log("📝 Seeded DB with PAID registration: conflict@example.com");

        // 3. Attempt to register with the same email
        console.log("🚀 Sending conflicting registration request...");
        try {
            await axios.post('http://localhost:9000/api/payment-session', {
                amount: 100,
                currency: "INR",
                teamDetails: { teamName: "Duplicate Team" },
                participants: [{ firstName: "Attacker", email: "conflict@example.com", phone: "123" }],
                ticketType: "standard",
                quantity: 1
            });
            console.log("❌ FAILURE: Backend accepted duplicate registration (Expected 409)");
        } catch (e) {
            if (e.response && e.response.status === 409) {
                console.log("✅ SUCCESS: Backend blocked duplicate with 409 Conflict");
            } else {
                console.log(`❌ FAILURE: Request failed with unexpected status ${e.response ? e.response.status : e.message}`);
                console.log("Response:", e.response ? e.response.data : "No data");
            }
        }

        // 4. Test Finalize Endpoint (just to see if it exists)
        console.log("\n🚀 Testing Finalize Endpoint...");
        try {
            // We need a valid session ID that is PENDING. Let's create one directly in DB.
            const pendingSeed = [...seed, {
                id: "REG-TEST-PENDING",
                status: "PENDING",
                paymentSessionId: "test-session-123",
                participants: [{ email: "new@example.com" }]
            }];
            fs.writeFileSync(dbPath, JSON.stringify(pendingSeed, null, 2));

            const updateRes = await axios.post('http://localhost:9000/api/teams/finalize', {
                sessionId: "test-session-123",
                paymentId: "pay_12345"
            });

            if (updateRes.data.success) {
                console.log("✅ SUCCESS: Finalize endpoint worked.");
                const dbNow = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                const updated = dbNow.find(r => r.paymentSessionId === "test-session-123");
                if (updated.status === 'PAID') {
                    console.log("✅ SUCCESS: Status updated to PAID in DB.");
                } else {
                    console.log("❌ FAILURE: Status not updated in DB.");
                }
            }
        } catch (e) {
            console.log("❌ FAILURE: Finalize endpoint failed", e.message);
            if (e.response) console.log(e.response.data);
        }

    } catch (err) {
        console.error("Test execution error:", err);
    } finally {
        // 5. Restore DB (Optional, or just leave it for inspection)
        // fs.writeFileSync(dbPath, JSON.stringify(backup, null, 2));
        // console.log("--- DB Restored ---");
        console.log("--- Test Complete ---");
    }
}

runTest();
