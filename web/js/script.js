/* ===== EvalPro Auth Pages JS (login.html, signup.html) ===== */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect
  if (isLoggedIn()) {
    window.location.href = isAdmin() ? '/admin.html' : '/index.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  // ---- LOGIN ----
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type="submit"]');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const alertEl = document.getElementById('auth-alert');

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Signing In...';

      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setAuth(data);

        alertEl.textContent = 'Login successful! Redirecting...';
        alertEl.className = 'auth-alert success show';

        setTimeout(() => {
          window.location.href = data.role === 'admin' ? '/admin.html' : '/index.html';
        }, 800);
      } catch (err) {
        alertEl.textContent = err.message || 'Login failed. Please check your credentials.';
        alertEl.className = 'auth-alert error show';
        btn.disabled = false;
        btn.innerHTML = '<span>&#128274;</span> Sign In';
      }
    });
  }

  // ---- SIGNUP ----
  if (signupForm) {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        const strength = getPasswordStrength(val);
        const fill = document.getElementById('strength-fill');
        const text = document.getElementById('strength-text');
        if (fill) {
          fill.style.width = strength.percent + '%';
          fill.style.background = strength.color;
        }
        if (text) {
          text.textContent = strength.label;
          text.style.color = strength.color;
        }
      });
    }

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = signupForm.querySelector('button[type="submit"]');
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm-password').value;
      const alertEl = document.getElementById('auth-alert');

      if (password !== confirm) {
        alertEl.textContent = 'Passwords do not match.';
        alertEl.className = 'auth-alert error show';
        return;
      }

      if (password.length < 6) {
        alertEl.textContent = 'Password must be at least 6 characters.';
        alertEl.className = 'auth-alert error show';
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Creating Account...';

      try {
        const data = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });
        setAuth(data);

        alertEl.textContent = 'Account created! Redirecting...';
        alertEl.className = 'auth-alert success show';

        setTimeout(() => { window.location.href = '/index.html'; }, 800);
      } catch (err) {
        alertEl.textContent = err.message || 'Registration failed. Please try again.';
        alertEl.className = 'auth-alert error show';
        btn.disabled = false;
        btn.innerHTML = '<span>&#128100;</span> Create Account';
      }
    });
  }

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || btn.closest('.input-wrap').querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '&#128065;';
      } else {
        input.type = 'password';
        btn.textContent = '&#128065;&#65039;';
      }
    });
  });
});

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { percent: 0, color: '#dc2626', label: '' },
    { percent: 20, color: '#dc2626', label: 'Very Weak' },
    { percent: 40, color: '#d97706', label: 'Weak' },
    { percent: 60, color: '#ca8a04', label: 'Fair' },
    { percent: 80, color: '#16a34a', label: 'Strong' },
    { percent: 100, color: '#15803d', label: 'Very Strong' }
  ];
  return levels[score] || levels[0];
}
