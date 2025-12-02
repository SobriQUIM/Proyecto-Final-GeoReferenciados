import { api } from './api.js';
import { auth } from './auth.js';

auth.checkAuth();
const user = auth.getUser();

let currentStoreId = '';
let cart = [];
let products = [];

// Load Stores
async function loadStores() {
    try {
        const stores = await api.get('/stores');
        const select = document.getElementById('store-select');
        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store._id;
            option.textContent = store.name;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            currentStoreId = e.target.value;
            loadProducts(currentStoreId);
            cart = [];
            updateCart();
        });
    } catch (err) {
        console.error(err);
    }
}

// Load Products for Store
async function loadProducts(storeId) {
    const list = document.getElementById('products-list');
    list.innerHTML = '<p>Cargando...</p>';

    if (!storeId) {
        list.innerHTML = '<p>Selecciona una tienda para ver productos.</p>';
        return;
    }

    try {
        // Fetch all products and filter by store (backend could have a specific endpoint but this works)
        const allProducts = await api.get('/products');
        products = allProducts.filter(p => p.store && p.store._id === storeId); // Populate returns object

        list.innerHTML = '';

        if (products.length === 0) {
            list.innerHTML = '<p>No hay productos en esta tienda.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h4>${product.name}</h4>
                <p>$${product.price}</p>
                <small>Stock: ${product.stock}</small>
            `;

            if (product.stock > 0) {
                card.addEventListener('click', () => addToCart(product));
            } else {
                card.style.opacity = '0.5';
                card.style.cursor = 'not-allowed';
                card.innerHTML += '<br><span style="color:red">Agotado</span>';
            }

            list.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        list.innerHTML = '<p>Error al cargar productos.</p>';
    }
}

// Add to Cart
function addToCart(product) {
    const existing = cart.find(item => item.product._id === product._id);

    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity++;
        } else {
            alert('No hay más stock disponible');
        }
    } else {
        cart.push({ product, quantity: 1 });
    }
    updateCart();
}

// Update Cart UI
function updateCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const btn = document.getElementById('checkout-btn');

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-muted">La canasta está vacía</p>';
        btn.disabled = true;
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <strong>${item.product.name}</strong><br>
                    $${item.product.price} x ${item.quantity}
                </div>
                <div>
                    $${itemTotal.toFixed(2)}
                    <button class="btn sm" style="background:#e74c3c; padding: 2px 6px;" onclick="window.removeFromCart(${index})">x</button>
                </div>
            `;
            container.appendChild(div);
        });
        btn.disabled = false;
    }

    totalEl.textContent = total.toFixed(2);
}

// Expose remove function globally
window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCart();
};

// Checkout
document.getElementById('checkout-btn').addEventListener('click', async () => {
    if (!currentStoreId || cart.length === 0) return;

    const saleData = {
        store: currentStoreId,
        products: cart.map(item => ({
            product: item.product._id,
            quantity: item.quantity
        }))
    };

    try {
        const sale = await api.post('/sales', saleData);
        showReceipt(sale);
        cart = [];
        updateCart();
        loadProducts(currentStoreId); // Refresh stock
    } catch (err) {
        alert(err.message);
    }
});

// Receipt Modal
function showReceipt(sale) {
    const modal = document.getElementById('receipt-modal');
    const content = document.getElementById('receipt-content');

    const date = new Date(sale.date).toLocaleString();

    let itemsHtml = '';
    sale.products.forEach(item => {
        itemsHtml += `
            <div class="receipt-item">
                <span>${item.product.name} x${item.quantity}</span>
                <span>$${(item.priceAtSale * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });

    content.innerHTML = `
        <div class="receipt-header">
            <h3>GeoRef Store</h3>
            <p>${sale.store.name}</p>
            <p>${sale.store.address}</p>
            <p>${date}</p>
            <p>Ticket #${sale._id.slice(-6)}</p>
        </div>
        <div class="receipt-body">
            ${itemsHtml}
        </div>
        <div class="receipt-total">
            TOTAL: $${sale.total.toFixed(2)}
        </div>
        <div style="text-align:center; margin-top:1rem;">
            <p>¡Gracias por su compra!</p>
            <p>Atendido por: ${sale.user.name}</p>
        </div>
    `;

    modal.style.display = 'flex';
}

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('receipt-modal').style.display = 'none';
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
});

// Initial load
loadStores();
