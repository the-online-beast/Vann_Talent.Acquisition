// ============================================================
// NAVBAR — Burger menu
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
    });
  });

  // ============================================================
  // MODAL — CV Form
  // ============================================================
  const cvModal      = document.getElementById('cvModal');
  const openCvForm   = document.getElementById('openCvForm');
  const closeCvModal = document.getElementById('closeCvModal');

  if (openCvForm) {
    openCvForm.addEventListener('click', (e) => {
      e.preventDefault();
      cvModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeCvModal) {
    closeCvModal.addEventListener('click', () => {
      cvModal.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }

  if (cvModal) {
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) {
        cvModal.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (cvModal && e.key === 'Escape' && cvModal.classList.contains('is-open')) {
      cvModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });

  // ============================================================
  // VACANCIES — State helpers
  // ============================================================
  function showState(state, count = 0) {
    document.getElementById('vacanciesLoading').classList.remove('is-visible');
    document.getElementById('vacanciesEmpty').classList.remove('is-visible');
    document.getElementById('vacanciesError').classList.remove('is-visible');
    document.getElementById('jobsGrid').style.display = 'none';
    document.getElementById('vacanciesFilters').style.display = 'none';

    const counter = document.getElementById('vacanciesCount');
    counter.className = 'vacancies__count';
    counter.textContent = '';

    if (state === 'loading') {
      document.getElementById('vacanciesLoading').classList.add('is-visible');
    } else if (state === 'empty') {
      document.getElementById('vacanciesEmpty').classList.add('is-visible');
      counter.classList.add('is-red');
      counter.textContent = 'No open positions at the moment.';
    } else if (state === 'error') {
      document.getElementById('vacanciesError').classList.add('is-visible');
    } else if (state === 'results') {
      document.getElementById('jobsGrid').style.display = 'grid';
      document.getElementById('vacanciesFilters').style.display = 'flex';
      counter.classList.add('is-green');
      counter.textContent = `${count} open position${count > 1 ? 's' : ''}`;
    }
  }

  // ============================================================
  // VACANCIES — Data & Render
  // ============================================================
  let allJobs = [];

  function parseGviz(raw) {
    const json = JSON.parse(raw.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)[1]);
    const cols = json.table.cols.map(c => c.label);
    console.log('COLS:', cols);          // <-- ajoute ça
    console.log('ROWS:', json.table.rows); // <-- et ça
    const rows = json.table.rows;
    return rows.map(row => {
      const job = {};
      cols.forEach((col, i) => {
        job[col] = row.c[i]?.v ?? '';
      });
      return job;
    });
  }


  function renderCards(jobs) {
    const grid = document.getElementById('jobsGrid');
    grid.innerHTML = '';
    jobs.forEach(job => {
      const card = document.createElement('div');
      card.className = 'job-card';
      card.innerHTML = `
        <div class="job-card__header">
          <span class="job-card__tag">${job.Type || 'Role'}</span>
          <span class="job-card__location">📍 ${job.Location || 'Malaysia'}</span>
        </div>
        <h3 class="job-card__title">${job.Title}</h3>
        <p class="job-card__school">${job.School || ''}</p>
        <ul class="job-card__details">
          ${job.Salary  ? `<li>💰 ${job.Salary}</li>`  : ''}
          ${job.Start   ? `<li>🗓 ${job.Start}</li>`   : ''}
          ${job.Subject ? `<li>📚 ${job.Subject}</li>` : ''}
        </ul>
        <a href="${job.Link || '#'}" target="_blank" class="job-card__btn">View & Apply</a>
      `;
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    const search = document.getElementById('filterSearch').value.toLowerCase();
    const type   = document.getElementById('filterType').value;
    const filtered = allJobs.filter(job => {
      const matchSearch = !search ||
        (job.Title    || '').toLowerCase().includes(search) ||
        (job.School   || '').toLowerCase().includes(search) ||
        (job.Location || '').toLowerCase().includes(search);
      const matchType = !type || job.Type === type;
      return matchSearch && matchType;
    });
    if (filtered.length === 0) {
      showState('empty');
    } else {
      showState('results', filtered.length);
      renderCards(filtered);
    }
  }

  // ---- Only run vacancies code on jobs page ----------------
  if (document.getElementById('jobsGrid')) {
    document.getElementById('filterSearch').addEventListener('input', applyFilters);
    document.getElementById('filterType').addEventListener('change', applyFilters);

    async function loadJobs() {
      showState('loading');
      try {
        const res = await fetch(SHEET_URL);
        if (!res.ok) throw new Error('Network error');
        const raw = await res.text();
        allJobs   = parseGviz(raw).filter(job => job.Title);
        if (allJobs.length === 0) {
          showState('empty');
        } else {
          showState('results', allJobs.length);
          renderCards(allJobs);
        }
      } catch (err) {
        console.error(err);
        showState('error');
      }
    }

    loadJobs();
  }

}); // fin DOMContentLoaded
