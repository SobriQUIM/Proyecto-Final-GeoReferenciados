import { auth } from './auth.js';

auth.checkAuth();

const user = auth.getUser();
console.log('Current User:', user);
document.getElementById('user-name').textContent = user.name;

document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
});

// Show options based on role
if (user.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
} else {
    document.querySelectorAll('.vendor-only').forEach(el => el.classList.remove('hidden'));
}
