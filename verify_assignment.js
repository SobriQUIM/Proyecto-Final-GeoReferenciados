

const API_URL = 'http://localhost:3000/api';
let token = '';
let storeId = '';

const log = (msg) => console.log(`[TEST] ${msg}`);

const run = async () => {
    try {
        // 1. Login as Admin
        log('Logging in as Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@admin.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message);
        token = loginData.token;
        log('Admin logged in.');

        // 2. Create Store
        log('Creating Store...');
        const storeRes = await fetch(`${API_URL}/stores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Test Store Assignment',
                address: '123 Test St',
                description: 'Store for testing assignment',
                zone: { type: 'Polygon', coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] },
                location: { type: 'Point', coordinates: [0.5, 0.5] }
            })
        });
        const storeData = await storeRes.json();
        if (!storeRes.ok) throw new Error(storeData.message);
        storeId = storeData._id;
        log(`Store created: ${storeId}`);

        // 3. Create Vendor with Store Assignment
        log('Creating Vendor assigned to Store...');
        const vendorRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Assigned Vendor',
                email: `vendor_${Date.now()}@test.com`,
                password: 'password123',
                role: 'user',
                store: storeId
            })
        });
        const vendorData = await vendorRes.json();
        if (!vendorRes.ok) throw new Error(vendorData.message);

        if (vendorData.store === storeId) {
            log('SUCCESS: Vendor created and correctly assigned to store.');
        } else {
            throw new Error(`FAILURE: Vendor store ID mismatch. Expected ${storeId}, got ${vendorData.store}`);
        }

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
