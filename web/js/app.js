/* ===== EvalPro Shop/Submission Page JS ===== */

let allProjects = [];
let submission = { items: [] };

document.addEventListener('DOMContentLoaded', async () => {
  await loadProjects();
  if (isLoggedIn()) await loadSubmission();
  setupFilters();
  setupSubmissionPanel();
});

// ---- Apply Filters (module-level so loadProjects can call it) ----
function applyFilters() {
  const search = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('category-filter')?.value || '';
  let filtered = allProjects;
  if (cat) filtered = filtered.filter(p => p.category === cat);
  if (search) filtered = filtered.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search) ||
    p.description.toLowerCase().includes(search)
  );
  renderProjects(filtered);
}

// ---- Load Projects ----
async function loadProjects() {
  try {
    allProjects = await apiFetch('/projects');
    // Apply URL params (from home page search navigation)
    const params = new URLSearchParams(window.location.search);
    const searchVal = params.get('search');
    const categoryVal = params.get('category');
    if (searchVal) {
      const inp = document.getElementById('search-input');
      if (inp) inp.value = searchVal;
    }
    if (categoryVal) {
      const sel = document.getElementById('category-filter');
      if (sel) sel.value = categoryVal;
    }
    applyFilters();
  } catch (err) {
    document.getElementById('projects-grid').innerHTML = `<div class="no-results"><div class="no-icon">&#9888;</div><h3>Failed to load projects</h3><p>${err.message}</p></div>`;
  }
}

// ---- Render Projects ----
function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;

  if (countEl) countEl.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''} found`;

  if (projects.length === 0) {
    grid.innerHTML = `<div class="no-results"><div class="no-icon">&#128269;</div><h3>No projects found</h3><p>Try adjusting your search or filter.</p></div>`;
    return;
  }

  grid.innerHTML = projects.map(p => {
    const inSubmission = submission.items.some(i => (i.project._id || i.project) === p._id);
    const imgContent = p.image
      ? `<img src="http://localhost:3000${p.image}" alt="${p.name}" onerror="this.parentNode.innerHTML='${getCategoryIcon(p.category)}'">`
      : getCategoryIcon(p.category);

    return `
      <div class="shop-project-card" data-id="${p._id}">
        <div class="shop-card-img">
          ${imgContent}
          <div class="shop-card-category">${p.category}</div>
        </div>
        <div class="shop-card-body">
          <h3>${escHtml(p.name)}</h3>
          <p>${escHtml(p.description)}</p>
        </div>
        <div class="shop-card-footer">
          <div class="shop-score">${p.score}<span> pts</span></div>
          ${isAdmin() ? `
          <button class="btn-submit-project ${inSubmission ? 'added' : ''}" onclick="addToSubmission('${p._id}')" id="btn-${p._id}">
            ${inSubmission ? '&#10003; Added' : '+ Submit'}
          </button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ---- Add to Submission ----
async function addToSubmission(projectId) {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return;
  }
  const btn = document.getElementById(`btn-${projectId}`);
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,.3);border-top-color:#fff;width:14px;height:14px;border-width:2px;"></span>'; }

  try {
    const data = await apiFetch('/submissions/add', { method: 'POST', body: JSON.stringify({ projectId, quantity: 1 }) });
    submission = data;
    if (btn) { btn.disabled = false; btn.innerHTML = '&#10003; Added'; btn.classList.add('added'); }
    renderSubmissionPanel();
    updateNavCount();
  } catch (err) {
    if (btn) { btn.disabled = false; btn.innerHTML = '+ Submit'; }
    alert('Error: ' + err.message);
  }
}

// ---- Load Submission ----
async function loadSubmission() {
  try {
    submission = await apiFetch('/submissions');
    renderSubmissionPanel();
  } catch (e) { submission = { items: [] }; }
}

// ---- Render Submission Panel ----
function renderSubmissionPanel() {
  const itemsEl = document.getElementById('submission-items');
  const countEl = document.getElementById('submission-count');
  const totalEl = document.getElementById('submission-total-score');
  const emptyEl = document.getElementById('submission-empty');
  const totalSection = document.getElementById('submission-footer');

  const items = submission.items || [];
  if (countEl) countEl.textContent = items.length;

  if (items.length === 0) {
    if (itemsEl) itemsEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (totalSection) totalSection.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (totalSection) totalSection.style.display = 'block';

  const totalScore = items.reduce((sum, item) => {
    const proj = item.project;
    return sum + (proj?.score || 0) * item.quantity;
  }, 0);

  if (totalEl) totalEl.textContent = totalScore + ' pts';

  if (itemsEl) {
    itemsEl.innerHTML = items.map(item => {
      const proj = item.project;
      const projId = proj._id || proj;
      const name = proj.name || 'Project';
      const score = proj.score || 0;
      return `
        <div class="submission-item" id="sub-item-${projId}">
          <div class="sub-item-icon">${getCategoryIcon(proj.category)}</div>
          <div class="sub-item-info">
            <h4 title="${escHtml(name)}">${escHtml(name.substring(0, 22))}${name.length > 22 ? '...' : ''}</h4>
            <span>${score} pts each</span>
          </div>
          <div class="sub-item-qty">
            <button class="qty-btn" onclick="updateQty('${projId}', ${item.quantity - 1})">&#8722;</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQty('${projId}', ${item.quantity + 1})">&#43;</button>
          </div>
          <button class="btn-remove" onclick="removeItem('${projId}')" title="Remove">&#10005;</button>
        </div>
      `;
    }).join('');
  }

  // Update project buttons
  allProjects.forEach(p => {
    const btn = document.getElementById(`btn-${p._id}`);
    if (btn) {
      const inSub = items.some(i => (i.project._id || i.project) === p._id);
      btn.innerHTML = inSub ? '&#10003; Added' : '+ Submit';
      btn.className = `btn-submit-project ${inSub ? 'added' : ''}`;
    }
  });
}

// ---- Update Quantity ----
async function updateQty(projectId, newQty) {
  if (newQty < 1) { await removeItem(projectId); return; }
  try {
    submission = await apiFetch(`/submissions/${projectId}`, { method: 'PUT', body: JSON.stringify({ quantity: newQty }) });
    renderSubmissionPanel();
  } catch (err) { alert('Error: ' + err.message); }
}

// ---- Remove Item ----
async function removeItem(projectId) {
  try {
    submission = await apiFetch(`/submissions/${projectId}`, { method: 'DELETE' });
    renderSubmissionPanel();
    updateNavCount();
  } catch (err) { alert('Error: ' + err.message); }
}

// ---- Checkout ----
function goToReview() {
  if (!isLoggedIn()) { window.location.href = '/login.html'; return; }
  const items = submission.items || [];
  if (items.length === 0) { alert('Your submission is empty.'); return; }
  window.location.href = '/submission-review.html';
}

// ---- Filters ----
function setupFilters() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
}

// ---- Setup Submission Panel ----
function setupSubmissionPanel() {
  const checkoutBtn = document.getElementById('btn-checkout');
  if (checkoutBtn) checkoutBtn.addEventListener('click', goToReview);
}

// ---- Update Nav Count ----
function updateNavCount() {
  const el = document.getElementById('nav-submission-count');
  if (el) {
    const count = (submission.items || []).length;
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

// ---- Escape HTML ----
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
