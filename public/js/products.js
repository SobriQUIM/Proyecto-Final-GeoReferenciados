import { api } from './api.js';
import { auth } from './auth.js';

auth.checkAuth();
auth.checkAuth();
const user = auth.getUser();
let editingProductId = null;
let allProducts = []; // Store locally for edit lookup

if (user.role !== 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
}

// Load Stores for Select
async function loadStores() {
    try {
        const stores = await api.get('/stores');
        const select = document.getElementById('store');
        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store._id;
            option.textContent = store.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error(err);
    }
}

// Load Products
async function loadProducts() {
    try {
        const products = await api.get('/products');
        allProducts = products;
        const tbody = document.getElementById('products-list');
        tbody.innerHTML = '';

        products.forEach(product => {
            const tr = document.createElement('tr');

            const storeName = product.store ? product.store.name : 'Sin tienda';
            const statusClass = `status-${product.status}`; // green, yellow, red

            tr.innerHTML = `
                <td><span class="status-dot ${statusClass}" title="${product.status}"></span></td>
                <td>${product.sku || '-'}</td>
                <td>${product.name}</td>
                <td>${storeName}</td>
                <td>$${product.price}</td>
                <td>${product.stock} / ${product.minStock}</td>
                <td>
                    ${user.role === 'admin' ? `
                        <button class="btn sm edit-btn" data-id="${product._id}" style="background:#f1c40f; color:black;">Editar</button>
                        <button class="btn sm delete-btn" data-id="${product._id}" style="background:#e74c3c">Eliminar</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add listeners
        if (user.role === 'admin') {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('¿Estás seguro de eliminar este producto?')) {
                        try {
                            await api.delete(`/products/${e.target.dataset.id}`);
                            loadProducts();
                        } catch (err) {
                            alert(err.message);
                        }
                    }
                });
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const prodId = e.target.dataset.id;
                    const prod = allProducts.find(p => p._id === prodId);
                    if (prod) {
                        editingProductId = prodId;
                        document.getElementById('name').value = prod.name;
                        document.getElementById('sku').value = prod.sku || '';
                        document.getElementById('price').value = prod.price;
                        document.getElementById('stock').value = prod.stock;
                        document.getElementById('minStock').value = prod.minStock;
                        document.getElementById('maxStock').value = prod.maxStock;
                        if (prod.store) document.getElementById('store').value = prod.store._id || prod.store;

                        document.querySelector('button[type="submit"]').textContent = 'Actualizar Producto';
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            });
        }

    } catch (err) {
        console.error(err);
    }
}

// Create Product
const form = document.getElementById('product-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productData = {
            name: document.getElementById('name').value,
            sku: document.getElementById('sku').value,
            price: Number(document.getElementById('price').value),
            store: document.getElementById('store').value,
            stock: Number(document.getElementById('stock').value),
            minStock: Number(document.getElementById('minStock').value),
            maxStock: Number(document.getElementById('maxStock').value)
        };

        try {
            if (editingProductId) {
                await api.patch(`/products/${editingProductId}`, productData);
                alert('Producto actualizado exitosamente');
                editingProductId = null;
                document.querySelector('button[type="submit"]').textContent = 'Guardar Producto';
            } else {
                await api.post('/products', productData);
                alert('Producto creado exitosamente');
            }
            form.reset();
            loadProducts();
        } catch (err) {
            alert(err.message);
        }
    });
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
});

// Initial load
loadStores();
loadProducts();
