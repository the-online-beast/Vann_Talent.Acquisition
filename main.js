// ============================================================
// main.js — Logique complète du site
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // NAVBAR — Burger menu
  // ============================================================
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
  // UTILITAIRE — Gestion des modals
  // ============================================================
  function openModal(modal) {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Fermeture au clic sur l'overlay (hors modal)
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Fermeture avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach(m => closeModal(m));
    }
  });

  // ============================================================
  // MODAL — CV Form
  // ============================================================
  const cvModal    = document.getElementById('cvModal');
  const closeCvBtn = document.getElementById('closeCvModal');

  // Tous les boutons qui ouvrent le modal CV
  document.querySelectorAll('#openCvForm, #openCvFormVacancies').forEach(btn => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(cvModal);
    });
  });

  closeCvBtn?.addEventListener('click', () => closeModal(cvModal));

  // ============================================================
  // MODAL — Job Detail
  // ============================================================
  const jobModal      = document.getElementById('jobModal');
  const closeJobBtn   = document.getElementById('closeJobModal');
  const openApplyBtn  = document.getElementById('openApplyForm');

  closeJobBtn?.addEventListener('click', () => closeModal(jobModal));

  // ============================================================
  // MODAL — Apply Form
  // ============================================================
  const applyModal      = document.getElementById('applyModal');
  const closeApplyBtn   = document.getElementById('closeApplyModal');

  closeApplyBtn?.addEventListener('click', () => closeModal(applyModal));

  // Bouton "Apply for this position" dans le modal JD
  openApplyBtn?.addEventListener('click', () => {
    // On récupère le titre du job déjà affiché dans le modal JD
    const jobTitle = document.getElementById('jobModalTitle').textContent;
    document.getElementById('applyModalTitle').textContent    = `Apply — ${jobTitle}`;
    document.getElementById('applyModalSubtitle').textContent = jobTitle;
    closeModal(jobModal);
    openModal(applyModal);
  });

  // ============================================================
  // VACANCIES — États d'affichage
  // ============================================================
  const counter = document.getElementById('vacanciesCount');

  // On cache tout au départ
  ['vacanciesLoading', 'vacanciesEmpty', 'vacanciesError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('is-visible');
  });
  document.getElementById('jobsGrid').style.display = 'none';
  document.getElementById('vacanciesFilters').style.display = 'none';

  function showState(state, count = 0) {
    // Reset tous les états
    ['vacanciesLoading', 'vacanciesEmpty', 'vacanciesError'].forEach(id => {
      document.getElementById(id)?.classList.remove('is-visible');
    });
    document.getElementById('jobsGrid').style.display        = 'none';
    document.getElementById('vacanciesFilters').style.display = 'none';
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
      document.getElementById('jobsGrid').style.display        = 'grid';
      document.getElementById('vacanciesFilters').style.display = 'flex';
      counter.classList.add('is-green');
      counter.textContent = `${count} open position${count !== 1 ? 's' : ''}`;
    }
  }

  // ============================================================
  // VACANCIES — Parse Google Sheets gviz JSON
  // ============================================================
  function parseGviz(raw) {
    const json = JSON.parse(
      raw.match(/google\.visualization\.Query\.setResponse$ ([\s\S]*?) $ ;/)[1]
    );
    const rows = json.table.rows;
    if (!rows || rows.length < 2) return [];

    // Première ligne = headers
    const headers = rows[0].c.map(cell => cell?.v ?? '');

    return rows.slice(1).map(row => {
      const job = {};
      headers.forEach((col, i) => {
        job[col] = row.c?.[i]?.v ?? '';
      });
      return job;
    });
  }

  // ============================================================
  // VACANCIES — Rendu des cards
  // ============================================================
  function renderCards(jobs) {
    const grid = document.getElementById('jobsGrid');
    grid.innerHTML = '';

    jobs.forEach(job => {
      const card = document.createElement('div');
      card.className = 'job-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View details for ${job.Title}`);

      card.innerHTML = `
        <div class="job-card__top">
          <div class="job-card__tags">
            <span class="job-tag">${job.Type || 'Role'}</span>
            ${job.Subject ? `<span class="job-tag job-tag--muted">${job.Subject}</span>` : ''}
          </div>
        </div>
        <h3 class="job-card__title">${job.Title}</h3>
        <p class="job-card__school">${job.School || ''}</p>
        <ul class="job-card__details">
          ${job.Location ? `<li>📍 ${job.Location}</li>` : ''}
          ${job.Salary   ? `<li>💰 ${job.Salary}</li>`   : ''}
          ${job.Start    ? `<li>🗓 ${job.Start}</li>`    : ''}
        </ul>
        <div class="job-card__footer">
          <span class="job-card__cta">View details →</span>
        </div>
      `;

      // Clic sur la card → ouvre le modal JD
      const openDetail = () => openJobModal(job);
      card.addEventListener('click', openDetail);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetail();
        }
      });

      grid.appendChild(card);
    });
  }

  // ============================================================
  // VACANCIES — O
