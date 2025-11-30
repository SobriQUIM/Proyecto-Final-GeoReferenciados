const form = document.getElementById('register-form');
const msg = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  msg.classList.remove('error');

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const password2 = document.getElementById('password2').value;

  if (password !== password2) {
    msg.textContent = 'Las contraseñas no coinciden';
    msg.classList.add('error');
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || 'No se pudo registrar';
      msg.classList.add('error');
      return;
    }

    msg.textContent = 'Cuenta creada correctamente. Redirigiendo...';

    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1500);

  } catch (err) {
    msg.textContent = 'Error de conexión con el servidor';
    msg.classList.add('error');
  }
});
