import { api } from './api.js';
import { auth } from './auth.js';

auth.checkAuth();
auth.checkAuth();
const user = auth.getUser();
let editingUserId = null;
let allUsers = [];

if (user.role !== 'admin') {
    alert('Acceso denegado');
    window.location.href = '/dashboard.html';
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

// Load Users
async function loadUsers() {
    try {
        const users = await api.get('/users');
        allUsers = users;
        const tbody = document.getElementById('users-list');
        tbody.innerHTML = '';

        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role === 'admin' ? 'Administrador' : 'Vendedor'}</td>
                <td>
                    ${u._id !== user.id ? `
                        <button class="btn sm edit-btn" data-id="${u._id}" style="background:#f1c40f; color:black;">Editar</button>
                        <button class="btn sm delete-btn" data-id="${u._id}" style="background:#e74c3c">Eliminar</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('¿Estás seguro de eliminar este usuario?')) {
                    try {
                        await api.delete(`/users/${e.target.dataset.id}`);
                        loadUsers();
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.id;
                const u = allUsers.find(user => user._id === userId);
                if (u) {
                    editingUserId = userId;
                    document.getElementById('name').value = u.name;
                    document.getElementById('email').value = u.email;
                    document.getElementById('password').value = ''; // Don't fill password
                    document.getElementById('password').placeholder = 'Dejar en blanco para mantener';
                    document.getElementById('password').required = false;
                    if (u.store) document.getElementById('store').value = u.store;

                    document.querySelector('button[type="submit"]').textContent = 'Actualizar Usuario';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

    } catch (err) {
        console.error(err);
    }
}

// Create User
const form = document.getElementById('user-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        store: document.getElementById('store').value
    };

    try {
        if (editingUserId) {
            // For update, password is optional
            if (!userData.password) delete userData.password;
            await api.patch(`/users/${editingUserId}`, userData); // Assuming PATCH /users/:id exists
            alert('Usuario actualizado exitosamente');
            editingUserId = null;
            document.querySelector('button[type="submit"]').textContent = 'Crear Usuario';
            document.getElementById('password').required = true;
            document.getElementById('password').placeholder = '';
        } else {
            await auth.register(userData.name, userData.email, userData.password, userData.role, userData.store);
            alert('Usuario creado exitosamente');
        }
        form.reset();
        loadUsers();
    } catch (err) {
        alert(err.message);
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
});

// Initial load
loadStores();
loadUsers();
