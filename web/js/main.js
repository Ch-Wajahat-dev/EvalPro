/* ===== EvalPro Main JS - Shared across all pages ===== */

const API_BASE = 'http://localhost:3000/api';

// ---- Auth Helpers ----
function getToken() { return localStorage.getItem('evalpro_token'); }
function getUser() {
  const u = localStorage.getItem('evalpro_user');
  return u ? JSON.parse(u) : null;
}
function setAuth(data) {
  localStorage.setItem('evalpro_token', data.token);
  localStorage.setItem('evalpro_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
}
function clearAuth() {
  localStorage.removeItem('evalpro_token');
  localStorage.removeItem('evalpro_user');
}
function isLoggedIn() { return !!getToken(); }
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }

// ---- API Fetch Wrapper ----
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  // Only set Content-Type for requests that send a JSON body
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login.html';
    throw new Error('Session expired. Please log in again.');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

// ---- Navbar Setup ----
function setupNavbar() {
  const user = getUser();
  const navAuth = document.getElementById('nav-auth');
  const navUser = document.getElementById('nav-user');
  const navAdmin = document.getElementById('nav-admin');
  const navSubmissionCount = document.getElementById('nav-submission-count');

  if (navAuth) navAuth.style.display = user ? 'none' : 'flex';
  if (navUser) {
    navUser.style.display = user ? 'flex' : 'none';
    const nameEl = navUser.querySelector('.nav-user-name');
    if (nameEl && user) nameEl.textContent = user.name.split(' ')[0];
  }
  if (navAdmin) navAdmin.style.display = isAdmin() ? 'flex' : 'none';
  const navEvalsLink = document.getElementById('nav-evals-link');
  if (navEvalsLink) navEvalsLink.style.display = isAdmin() ? 'block' : 'none';

  // Logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      window.location.href = '/login.html';
    });
  }

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('open'));
  }

  // Update submission count in navbar
  if (user && navSubmissionCount) {
    apiFetch('/submissions').then(sub => {
      const count = sub.items ? sub.items.length : 0;
      navSubmissionCount.textContent = count;
      navSubmissionCount.style.display = count > 0 ? 'inline-flex' : 'none';
    }).catch(() => {});
  }
}

// ---- Page Loader ----
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
    setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 950);
  }
}

// ---- Toast / Alert ----
function showAlert(containerId, message, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${type === 'success' ? '&#10003;' : '&#9888;'} ${message}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 4000);
}

// ---- Category icon helper ----
function getCategoryIcon(category) {
  const icons = {
    'Web Application': '&#127760;',
    'Mobile Application': '&#128241;',
    'AI/ML': '&#129302;',
    'IoT': '&#128268;',
    'Data Science': '&#128202;',
    'Desktop Application': '&#128187;'
  };
  return icons[category] || '&#128196;';
}

// ---- Status badge ----
function statusBadge(status) {
  const cls = {
    'Submitted': 'status-submitted',
    'Under Review': 'status-review',
    'Evaluated': 'status-evaluated',
    'Approved': 'status-approved'
  };
  return `<span class="status-badge ${cls[status] || ''}">${status}</span>`;
}

// ---- Format date ----
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ---- Run on DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  hideLoader();
});
