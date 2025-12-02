// const fetch = require('node-fetch'); // Using native fetch in Node 18+

const API_URL = 'http://localhost:3000/api';
let token = '';
let userId = '';
let storeId = '';
let productId = '';

const log = (msg) => console.log(`[TEST] ${msg}`);
const error = (msg) => console.error(`[ERROR] ${msg}`);

async function runTests() {
    try {
        // 1. Register
        log('Registering user...');
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        const registerData = await registerRes.json();
        if (!registerRes.ok) throw new Error(registerData.message);
        token = registerData.token;
        userId = registerData._id;
        log('User registered.');

        // 2. Login (Optional since register returns token, but good to test)
        log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registerData.email,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message);
        token = loginData.token;
        log('Logged in.');

        // 3. Create Store
        log('Creating store...');
        const storeRes = await fetch(`${API_URL}/stores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: `Test Store ${Date.now()}`,
                address: '123 Test St',
                zone: {
                    type: 'Polygon',
                    coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
                }
            })
        });
        const storeData = await storeRes.json();
        if (!storeRes.ok) throw new Error(storeData.message);
        storeId = storeData._id;
        log('Store created.');

        // 4. Create Product
        log('Creating product...');
        const productRes = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Test Product',
                price: 100,
                stock: 10,
                store: storeId
            })
        });
        const productData = await productRes.json();
        if (!productRes.ok) throw new Error(productData.message);
        productId = productData._id;
        log('Product created with stock 10.');

        // 5. Create Sale
        log('Creating sale (buying 2 items)...');
        const saleRes = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                store: storeId,
                products: [
                    { product: productId, quantity: 2 }
                ]
            })
        });
        const saleData = await saleRes.json();
        if (!saleRes.ok) throw new Error(saleData.message);
        log('Sale created.');

        // 6. Verify Stock
        log('Verifying stock...');
        const verifyRes = await fetch(`${API_URL}/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const verifyData = await verifyRes.json();
        if (verifyData.stock !== 8) {
            throw new Error(`Expected stock 8, got ${verifyData.stock}`);
        }
        log('Stock verified (10 - 2 = 8).');

        // 7. Verify Sales by Store
        log('Verifying sales by store...');
        const salesStoreRes = await fetch(`${API_URL}/stores/${storeId}/sales`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const salesStoreData = await salesStoreRes.json();
        if (salesStoreData.length === 0) throw new Error('No sales found for store');
        log('Sales by store verified.');

        log('ALL TESTS PASSED');
    } catch (err) {
        error(err.message);
        process.exit(1);
    }
}

runTests();
