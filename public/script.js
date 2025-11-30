const form = document.getElementById('login-form');
const msg = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  msg.classList.remove('error');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || 'Usuario o contraseña incorrectos';
      msg.classList.add('error');
      return;
    }

    // Si recibes token, se guarda
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    // Redirección al panel
    window.location.href = '/dashboard.html';

  } catch (err) {
    msg.textContent = 'Error de conexión con el servidor';
    msg.classList.add('error');
  }
});
