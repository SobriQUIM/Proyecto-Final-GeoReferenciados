const API_URL = 'http://localhost:3000/api';
let adminToken = '';
let vendorToken = '';
let storeId = '';
let productId = '';
let vendorId = '';

const log = (msg) => console.log(`[TEST] ${msg}`);
const error = (msg) => { console.error(`[ERROR] ${msg}`); process.exit(1); };

const run = async () => {
    try {
        console.log('=== 1. USERS (Login & Register) ===');

        // Login Admin
        log('Logging in as Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@admin.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) error(loginData.message);
        adminToken = loginData.token;
        log(`Admin logged in. Token received.`);

        console.log('\n=== 2. MAP & STORES (Geolocation) ===');

        // Create Store
        log('Creating Store (Admin)...');
        const storeRes = await fetch(`${API_URL}/stores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'Sucursal Centro',
                address: 'Av. Reforma 123',
                description: 'Tienda principal en el centro',
                zone: { type: 'Polygon', coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] },
                location: { type: 'Point', coordinates: [0.5, 0.5] }
            })
        });
        const storeData = await storeRes.json();
        if (!storeRes.ok) error(storeData.message);
        storeId = storeData._id;
        log(`Store created: ${storeData.name} (ID: ${storeId})`);

        // Search Store
        log('Searching Store by name "Centro"...');
        const searchRes = await fetch(`${API_URL}/stores/search?name=Centro`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const searchData = await searchRes.json();
        if (searchData.length > 0 && searchData[0]._id === storeId) {
            log(`Store found: ${searchData[0].name}`);
        } else {
            error('Store search failed');
        }

        // Create Vendor Assigned to Store
        log('Creating Vendor assigned to Store...');
        const vendorEmail = `vendor_${Date.now()}@test.com`;
        const vendorRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'Juan Vendedor',
                email: vendorEmail,
                password: 'password123',
                role: 'user',
                store: storeId
            })
        });
        const vendorData = await vendorRes.json();
        if (!vendorRes.ok) error(vendorData.message);
        vendorId = vendorData._id;
        log(`Vendor created: ${vendorData.name} assigned to Store ID: ${vendorData.store}`);

        console.log('\n=== 3. PRODUCTS (Inventory) ===');

        // Create Product
        log('Creating Product (Admin)...');
        const productRes = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'Coca Cola',
                sku: `COKE-${Date.now()}`,
                price: 25.50,
                stock: 10,
                minStock: 5,
                maxStock: 100,
                store: storeId
            })
        });
        const productData = await productRes.json();
        if (!productRes.ok) error(productData.message);
        productId = productData._id;
        log(`Product created: ${productData.name} (Stock: ${productData.stock})`);

        // Consult Inventory (Check Semaphore)
        log('Checking Inventory Status...');
        const invRes = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const invData = await invRes.json();
        const product = invData.find(p => p._id === productId);
        log(`Product Status (Semaphore): ${product.status} (Expected: green)`);

        console.log('\n=== 4. SALES (Vendors) ===');

        // Login Vendor
        log('Logging in as Vendor...');
        const vLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: vendorEmail, password: 'password123' })
        });
        const vLoginData = await vLoginRes.json();
        if (!vLoginRes.ok) error(vLoginData.message);
        vendorToken = vLoginData.token;
        log('Vendor logged in.');

        // Register Sale
        log('Registering Sale (2 items)...');
        const saleRes = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${vendorToken}`
            },
            body: JSON.stringify({
                store: storeId,
                products: [{ product: productId, quantity: 2 }]
            })
        });
        const saleData = await saleRes.json();
        if (!saleRes.ok) error(saleData.message);
        log(`Sale successful! Receipt Total: $${saleData.total}`);

        // Verify Stock Deduction
        log('Verifying Stock Deduction...');
        const pRes = await fetch(`${API_URL}/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const pData = await pRes.json();
        log(`New Stock: ${pData.stock} (Expected: 8)`);

        if (pData.stock === 8) {
            console.log('\n✅ SYSTEM VERIFICATION SUCCESSFUL: All requirements met.');
        } else {
            error('Stock was not deducted correctly.');
        }

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
