/* ===== EvalPro AI-Powered Project Navigation / Search JS ===== */

const projectKeywords = {
  'web': 'Web Application',
  'website': 'Web Application',
  'frontend': 'Web Application',
  'html': 'Web Application',
  'react': 'Web Application',
  'mobile': 'Mobile Application',
  'app': 'Mobile Application',
  'flutter': 'Mobile Application',
  'android': 'Mobile Application',
  'ios': 'Mobile Application',
  'ai': 'AI/ML',
  'machine learning': 'AI/ML',
  'deep learning': 'AI/ML',
  'neural': 'AI/ML',
  'ml': 'AI/ML',
  'iot': 'IoT',
  'arduino': 'IoT',
  'sensor': 'IoT',
  'embedded': 'IoT',
  'raspberry': 'IoT',
  'data': 'Data Science',
  'analytics': 'Data Science',
  'visualization': 'Data Science',
  'pandas': 'Data Science',
  'desktop': 'Desktop Application',
  'java': 'Desktop Application',
  'python gui': 'Desktop Application'
};

class ProjectSearch {
  constructor() {
    this.searchBox = document.getElementById('ai-search-input');
    this.searchResults = document.getElementById('ai-search-results');
    this.searchBtn = document.getElementById('ai-search-btn');
    this.projects = [];
    this.init();
  }

  async init() {
    try {
      this.projects = await apiFetch('/projects');
    } catch (e) { this.projects = []; }

    if (this.searchBox) {
      this.searchBox.addEventListener('input', () => this.handleSearch());
      this.searchBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSearch(true);
      });
    }

    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => this.handleSearch(true));
    }

    // Close results on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.ai-search-wrap')) {
        if (this.searchResults) this.searchResults.style.display = 'none';
      }
    });
  }

  handleSearch(navigate = false) {
    const query = (this.searchBox?.value || '').toLowerCase().trim();
    if (!query) { if (this.searchResults) this.searchResults.style.display = 'none'; return; }

    // Detect category from keywords
    let suggestedCategory = null;
    for (const [keyword, category] of Object.entries(projectKeywords)) {
      if (query.includes(keyword)) { suggestedCategory = category; break; }
    }

    // Filter projects
    let results = this.projects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );

    if (navigate) {
      // Navigate to submission page with filter
      const params = new URLSearchParams();
      params.set('search', query);
      if (suggestedCategory) params.set('category', suggestedCategory);
      window.location.href = `/submission.html?${params.toString()}`;
      return;
    }

    this.renderResults(results, suggestedCategory);
  }

  renderResults(results, suggestedCategory) {
    if (!this.searchResults) return;

    if (results.length === 0 && !suggestedCategory) {
      this.searchResults.innerHTML = `<div class="search-no-results"><span>&#128269;</span> No projects found. <a href="/submission.html">Browse all projects</a></div>`;
      this.searchResults.style.display = 'block';
      return;
    }

    let html = '';
    if (suggestedCategory) {
      html += `<div class="search-suggestion" onclick="window.location='/submission.html?category=${encodeURIComponent(suggestedCategory)}'">
        <span class="search-sug-icon">&#128190;</span>
        <span>Browse <strong>${suggestedCategory}</strong> projects</span>
        <span class="search-arrow">&#8594;</span>
      </div>`;
    }

    html += results.slice(0, 5).map(p => `
      <div class="search-result-item" onclick="window.location='/submission.html?search=${encodeURIComponent(p.name)}'">
        <span class="search-result-icon">${getCategoryIcon(p.category)}</span>
        <div class="search-result-info">
          <div class="search-result-name">${escHtml(p.name)}</div>
          <div class="search-result-cat">${p.category} &bull; ${p.score} pts</div>
        </div>
      </div>
    `).join('');

    if (results.length > 5) {
      html += `<div class="search-view-all" onclick="window.location='/submission.html?search=${encodeURIComponent(this.searchBox.value)}'">View all ${results.length} results &rarr;</div>`;
    }

    this.searchResults.innerHTML = html;
    this.searchResults.style.display = 'block';
  }
}

// ---- Home Page Specific ----
function initHomePage() {
  new ProjectSearch();
  loadFeaturedProjects();
  loadRubrics();
  initCounters();
}

async function loadFeaturedProjects() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  try {
    const projects = await apiFetch('/projects');
    const featured = projects.slice(0, 6);
    grid.innerHTML = featured.map(p => {
      const imgContent = p.image
        ? `<img src="http://localhost:3000${p.image}" alt="${escHtml(p.name)}" onerror="this.parentNode.innerHTML='${getCategoryIcon(p.category)}'">`
        : getCategoryIcon(p.category);
      return `
        <div class="project-card">
          <div class="project-card-img">${imgContent}</div>
          <div class="project-card-body">
            <span class="project-card-category">${p.category}</span>
            <h3>${escHtml(p.name)}</h3>
            <p>${escHtml(p.description)}</p>
            <div class="project-card-meta">
              <span class="score-badge">${p.score} pts</span>
            </div>
            <a href="/submission.html" class="btn btn-primary">View Project</a>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128196;</div><p>Failed to load projects</p></div>';
  }
}

let _rubricTimerInterval = null;

async function loadRubrics() {
  const grid = document.getElementById('rubrics-grid');
  if (!grid) return;
  try {
    const rubrics = await apiFetch('/rubrics');
    if (rubrics.length === 0) {
      grid.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:rgba(255,255,255,0.7);grid-column:1/-1;">
          <div style="font-size:3rem;margin-bottom:12px;opacity:.5;">&#127775;</div>
          <p style="font-size:1rem;">No active evaluation rubrics at this time.</p>
          <p style="font-size:0.85rem;margin-top:6px;">Check back later or contact your supervisor.</p>
        </div>`;
      return;
    }

    // Render rubric cards with unique timer IDs
    grid.innerHTML = rubrics.map((r, i) => `
      <div class="rubric-card" id="rubric-card-${i}">
        <div class="rubric-badge">${r.discountPercentage > 0 ? r.discountPercentage + '% Bonus' : '&#10003; Active'}</div>
        <h3>${escHtml(r.title)}</h3>
        <p style="opacity:.88;font-size:0.9rem;margin-bottom:${r.criteria && r.criteria.length > 0 ? '10px' : '14px'};">${escHtml(r.description)}</p>
        ${r.criteria && r.criteria.length > 0 ? `
        <div style="margin-bottom:14px;">
          <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:.5px;opacity:.7;margin-bottom:6px;">Grading Criteria</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${r.criteria.map(c => `
              <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.1);border-radius:5px;padding:5px 10px;font-size:0.8rem;">
                <span>${escHtml(c.name)}</span>
                <span style="font-weight:700;opacity:.9;">${c.maxScore} pts</span>
              </div>`).join('')}
          </div>
        </div>` : ''}
        <div style="font-size:0.75rem;opacity:.7;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;">&#9201; Deadline Countdown</div>
        <div class="rubric-timer" id="timer-${i}">
          <div class="timer-block"><div class="time" id="t-${i}-d">--</div><div class="label">Days</div></div>
          <div class="timer-block"><div class="time" id="t-${i}-h">--</div><div class="label">Hours</div></div>
          <div class="timer-block"><div class="time" id="t-${i}-m">--</div><div class="label">Mins</div></div>
          <div class="timer-block"><div class="time" id="t-${i}-s">--</div><div class="label">Secs</div></div>
        </div>
        <div id="expired-${i}" style="display:none;background:rgba(255,255,255,.15);border-radius:6px;padding:8px 12px;font-size:0.85rem;margin-bottom:12px;">
          &#9203; This rubric has expired
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:4px;flex-wrap:wrap;">
          <a href="/submission.html" class="btn btn-hero-outline" style="display:inline-block;text-align:center;padding:9px 20px;font-size:0.88rem;width:auto;">View Projects</a>
          <span style="font-size:0.78rem;opacity:.7;">Ends: ${new Date(r.endTime).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      </div>
    `).join('');

    // Clear any previous interval
    if (_rubricTimerInterval) clearInterval(_rubricTimerInterval);

    // Tick function — updates all timers every second
    function tick() {
      rubrics.forEach((r, i) => {
        const end = new Date(r.endTime).getTime();
        const now = Date.now();
        const diff = end - now;

        const dEl = document.getElementById(`t-${i}-d`);
        const hEl = document.getElementById(`t-${i}-h`);
        const mEl = document.getElementById(`t-${i}-m`);
        const sEl = document.getElementById(`t-${i}-s`);
        const expEl = document.getElementById(`expired-${i}`);
        const timerEl = document.getElementById(`timer-${i}`);
        if (!dEl) return;

        if (diff <= 0) {
          // Expired
          dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
          if (timerEl) timerEl.style.opacity = '0.4';
          if (expEl) expEl.style.display = 'block';
          return;
        }

        const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs  = Math.floor((diff % (1000 * 60)) / 1000);

        dEl.textContent = String(days).padStart(2, '0');
        hEl.textContent = String(hours).padStart(2, '0');
        mEl.textContent = String(mins).padStart(2, '0');
        sEl.textContent = String(secs).padStart(2, '0');

        // Flash seconds red when under 1 hour
        if (sEl && diff < 3600000) sEl.style.color = '#fca5a5';
      });
    }

    tick(); // Run immediately so no delay on load
    _rubricTimerInterval = setInterval(tick, 1000);

  } catch (e) {
    const grid = document.getElementById('rubrics-grid');
    if (grid) grid.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">Could not load rubrics. Make sure the server is running.</p>';
  }
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-counter'));
        let current = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + (el.getAttribute('data-suffix') || '');
          if (current >= target) clearInterval(timer);
        }, 30);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('featured-grid')) {
    initHomePage();
  }
});
