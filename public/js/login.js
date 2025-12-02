import { auth } from './auth.js';

const form = document.getElementById('login-form');
const msg = document.getElementById('message');

// Redirect if already logged in
if (auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    msg.className = 'message';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await auth.login(email, password);
        window.location.href = '/dashboard.html';
    } catch (err) {
        msg.textContent = err.message;
        msg.classList.add('error');
    }
});
