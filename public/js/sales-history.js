import { api } from './api.js';
import { auth } from './auth.js';

auth.checkAuth();
const user = auth.getUser();

// Load Sales History
async function loadSales() {
    try {
        // Endpoint should return all sales for admin, or own sales for vendor
        // We might need to adjust the backend to support filtering or role-based return
        // For now assuming GET /sales returns appropriate list based on user role/ID
        const sales = await api.get('/sales');
        const tbody = document.getElementById('sales-list');
        tbody.innerHTML = '';

        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No hay ventas registradas</td></tr>';
            return;
        }

        sales.forEach(sale => {
            const tr = document.createElement('tr');
            const date = new Date(sale.date).toLocaleString();
            const vendorName = sale.user ? sale.user.name : 'Desconocido';
            const storeName = sale.store ? sale.store.name : 'Desconocida';

            // Format products list
            const productsList = sale.products.map(p => {
                return `${p.quantity}x ${p.product ? p.product.name : 'Producto Eliminado'}`;
            }).join(', ');

            tr.innerHTML = `
                <td>${date}</td>
                <td>${vendorName}</td>
                <td>${storeName}</td>
                <td>${productsList}</td>
                <td>$${sale.total.toFixed(2)}</td>
                <td>
                    <button class="btn sm" onclick="alert('Recibo ID: ${sale._id}\\nTotal: $${sale.total}')">Ver Recibo</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        alert('Error al cargar el historial de ventas');
    }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
});

// Initial load
loadSales();
