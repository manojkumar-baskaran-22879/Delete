const axios = require('axios');

async function runTest() {
    console.log("--- Testing Admin Registrations Endpoint ---");
    const URL = 'http://localhost:9000/api/registrations';
    const TOKEN = 'valid-admin-token-12345';

    // 1. Test without token
    try {
        await axios.get(URL);
        console.log("❌ FAILURE: Endpoint accessible without token (Expected 401)");
    } catch (e) {
        if (e.response && e.response.status === 401) {
            console.log("✅ SUCCESS: Endpoint blocked without token (401)");
        } else {
            console.log(`❌ FAILURE: Unexpected error without token: ${e.message}`);
        }
    }

    // 2. Test with valid token
    try {
        const res = await axios.get(URL, { headers: { Authorization: `Bearer ${TOKEN}` } });
        if (Array.isArray(res.data)) {
            console.log(`✅ SUCCESS: Endpoint returned array of ${res.data.length} registrations`);
        } else {
            console.log("❌ FAILURE: Endpoint returned invalid format", res.data);
        }
    } catch (e) {
        console.log(`❌ FAILURE: Failed to fetch with valid token: ${e.message}`);
    }
}

runTest();
