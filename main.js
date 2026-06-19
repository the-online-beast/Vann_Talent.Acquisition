// ============================================================
// main.js — Complete site logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // BURGER MENU
  // ============================================================
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  burgerBtn?.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    burgerBtn.setAttribute('aria-expanded', open);
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burgerBtn.setAttribute('aria-expanded', false);
    });
  });

  // ============================================================
  // MODAL HELPERS
  // ============================================================
  function openModal(overlay) {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlay) {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Close on overlay background click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach(m => closeModal(m));
    }
  });

  // Close buttons
  document.getElementById('closeJobModal')?.addEventListener('click',   () => closeModal(document.getElementById('jobModal')));
  document.getElementById('closeApplyModal')?.addEventListener('click', () => closeModal(document.getElementById('applyModal')));
  document.getElementById('closeCvModal')?.addEventListener('click',    () => closeModal(document.getElementById('cvModal')));

  // ============================================================
  // OPEN CV MODAL
  // ============================================================
  document.getElementById('openCvForm')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(document.getElementById('cvModal'));
  });
  document.getElementById('openCvFormVacancies')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(document.getElementById('cvModal'));
  });

  // ============================================================
  // FILE DROP — helper
  // ============================================================
  function initFileDrop(dropId, inputId, uiId, previewId, fileNameId, removeId) {
    const drop    = document.getElementById(dropId);
    const input   = document.getElementById(inputId);
    const ui      = document.getElementById(uiId);
    const preview = document.getElementById(previewId);
    const nameEl  = document.getElementById(fileNameId);
    const removeBtn = document.getElementById(removeId);

    if (!drop || !input) return;

    function showFile(file) {
      if (!file) return;
      nameEl.textContent = file.name;
      ui.style.display      = 'none';
      preview.style.display = 'flex';
      drop.classList.add('has-file');
    }

    function clearFile() {
      input.value           = '';
      ui.style.display      = 'flex';
      preview.style.display = 'none';
      drop.classList.remove('has-file', 'is-dragging');
    }

    input.addEventListener('change', () => { if (input.files[0]) showFile(input.files[0]); });
    removeBtn?.addEventListener('click', (e) => { e.stopPropagation(); clearFile(); });

    drop.addEventListener('dragover',  (e) => { e.preventDefault(); drop.classList.add('is-dragging'); });
    drop.addEventListener('dragleave', ()  => { drop.classList.remove('is-dragging'); });
    drop.addEventListener('drop',      (e) => {
      e.preventDefault();
      drop.classList.remove('is-dragging');
      const file = e.dataTransfer.files[0];
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        showFile(file);
      }
    });
  }

  initFileDrop('cvFileDrop',    'cvFile',   'cvFileUI',    'cvFilePreview',    'cvFileName',    'cvFileRemove');
  initFileDrop('applyFileDrop', 'applyCV',  'applyFileUI', 'applyFilePreview', 'applyFileName', 'applyFileRemove');

  // ============================================================
  // VACANCIES — CSV Parser
  // ============================================================
  function parseCSV(text) {
    const rows = [];
    let current = '';
    let inQuotes = false;
    let row = [];

    for (let i = 0; i < text.length; i++) {
      const ch   = text[i];
      const next = text[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        row.push(current); current = '';
      } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
        row.push(current); current = '';
        rows.push(row); row = [];
        if (ch === '\r') i++;
      } else {
        current += ch;
      }
    }
    if (current || row.length) { row.push(current); rows.push(row); }
    return rows;
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function formatJobText(text) {
    if (!text) return '<p>—</p>';
    if (/<[a-z][\s\S]*>/i.test(text)) return text;
    const lines  = text.split('\n').filter(l => l.trim());
    const isList = lines.length > 1 && lines.every(l => /^[-•*]/.test(l.trim()));
    if (isList) {
      return '<ul>' + lines.map(l =>
        `<li>${escapeHtml(l.replace(/^[-•*]\s*/, '').trim())}</li>`
      ).join('') + '</ul>';
    }
    return lines.map(l => `<p>${escapeHtml(l.trim())}</p>`).join('');
  }

  // ============================================================
  // RENDER CARDS
  // ============================================================
  let allJobs = [];

  function renderCards(jobs) {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    jobs.forEach((job, idx) => {
      const card = document.createElement('article');
      card.className  = 'job-card';
      card.dataset.idx = idx;

      const type      = job['Contract type']       || '';
      const title     = job['Job title']           || 'Untitled';
      const school    = job['Establishment']       || '';
      const city      = job['City']               || '';
      const district  = job['Discrict']           || '';
      const salary    = job['Annual base salary'] || '';
      const shortDesc = job['Short description']  || '';

      const locationStr = [city, district].filter(Boolean).join(' · ');
      const salaryStr   = salary ? `${salary}` : '';

      card.innerHTML = `
        <div class="job-card__inner">
          ${type ? `<span class="job-tag">${escapeHtml(type)}</span>` : ''}
          <h3 class="job-card__title">${escapeHtml(title)}</h3>
          <p class="job-card__school">${escapeHtml(school)}</p>
          ${locationStr ? `<p class="job-card__location">${escapeHtml(locationStr)}${salaryStr ? ` &nbsp;·&nbsp; ${escapeHtml(salaryStr)}` : ''}</p>` : ''}
          ${shortDesc ? `<p class="job-card__desc">${escapeHtml(shortDesc)}</p>` : ''}
          <button class="job-card__cta">View details →</button>
        </div>
      `;

      card.querySelector('.job-card__cta').addEventListener('click', () => openJobModal(idx));
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.job-card__cta')) openJobModal(idx);
      });

      grid.appendChild(card);
    });
  }

  // ============================================================
  // OPEN JOB MODAL
  // ============================================================
  function openJobModal(idx) {
    const job = allJobs[idx];
    if (!job) return;

    const jobModal = document.getElementById('jobModal');
    const type         = job['Contract type']       || '';
    const title        = job['Job title']           || 'Untitled';
    const school       = job['Establishment']       || '';
    const city         = job['City']               || '';
    const district     = job['Discrict']           || '';
    const salary       = job['Annual base salary'] || '';
    const longDesc     = job['Long description']   || '';
    const requirements = job['Requirements']        || '';

    document.getElementById('jd-type').textContent  = type;
    document.getElementById('jobModalTitle').textContent = title;
    document.querySelector('#jd-location span').textContent = city + (district ? ` · ${district}` : '');
    document.querySelector('#jd-salary span').textContent   = salary;
    document.querySelector('#jd-date span').textContent     = '';

    document.getElementById('jd-school').textContent   = school;
    document.getElementById('jd-district').textContent = district;

    document.getElementById('jd-description').innerHTML  = formatJobText(longDesc);
    document.getElementById('jd-requirements').innerHTML = formatJobText(requirements);

    jobModal.dataset.jobTitle    = title;
    jobModal.dataset.jobSchool   = school;
    jobModal.dataset.jobLocation = city;

    openModal(jobModal);
  }

  // ============================================================
  // OPEN APPLY MODAL from Job modal
  // ============================================================
  document.getElementById('openApplyForm')?.addEventListener('click', () => {
    const jobModal   = document.getElementById('jobModal');
    const applyModal = document.getElementById('applyModal');
    const title      = jobModal.dataset.jobTitle    || '';
    const school     = jobModal.dataset.jobSchool   || '';
    const location   = jobModal.dataset.jobLocation || '';

    document.getElementById('applyModalTitle').textContent    = `Apply — ${title}`;
    document.getElementById('applyModalSubtitle').textContent = [school, location].filter(Boolean).join(' · ');

    closeModal(jobModal);
    openModal(applyModal);
  });

  // ============================================================
  // FILTERS
  // ============================================================
  function applyFilters() {
    const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
    const type   = (document.getElementById('filterType')?.value  || '').toLowerCase();

    const filtered = allJobs.filter(job => {
      const matchSearch = !search ||
        (job['Job title']     || '').toLowerCase().includes(search) ||
        (job['Establishment'] || '').toLowerCase().includes(search) ||
        (job['City']          || '').toLowerCase().includes(search);
      const matchType = !type || (job['Contract type'] || '').toLowerCase() === type;
      return matchSearch && matchType;
    });

    renderCards(filtered);
  }

  document.getElementById('filterSearch')?.addEventListener('input',  applyFilters);
  document.getElementById('filterType')?.addEventListener('change',   applyFilters);

  // ============================================================
  // LOAD JOBS
  // ============================================================
  function showState(state, count) {
    document.getElementById('vacanciesLoading').style.display = state === 'loading'  ? 'flex'  : 'none';
    document.getElementById('vacanciesEmpty').style.display   = state === 'empty'    ? 'block' : 'none';
    document.getElementById('vacanciesError').style.display   = state === 'error'    ? 'block' : 'none';
    document.getElementById('jobsGrid').style.display         = state === 'results'  ? 'grid'  : 'none';
    const filters = document.getElementById('vacanciesFilters');
    if (filters) filters.style.display = state === 'results' ? 'flex' : 'none';
    const countEl = document.getElementById('vacanciesCount');
    if (countEl) countEl.textContent = state === 'results' ? `${count} position${count !== 1 ? 's' : ''} available` : '';
  }

  async function loadJobs() {
    showState('loading');
    try {
      const SHEET_ID  = '1yW_2SaGHDjCtIKCGpJAAAADb5xfnK-oWLqSCOHh87q4';
      const SHEET_GID = '0';
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.text();
      const rows = parseCSV(raw);

      if (rows.length < 2) { showState('empty'); return; }

      const headers = rows[0].map(h => h.trim());
      allJobs = rows.slice(1)
        .map(row => {
          const job = {};
          headers.forEach((h, i) => { job[h] = (row[i] || '').trim(); });
          return job;
        })
        .filter(job => (job['Job title'] || '').trim());

      if (allJobs.length === 0) {
        showState('empty');
      } else {
        showState('results', allJobs.length);
        renderCards(allJobs);

        const typeSelect = document.getElementById('filterType');
        if (typeSelect) {
          const types = [...new Set(allJobs.map(j => j['Contract type']).filter(Boolean))].sort();
          typeSelect.innerHTML = '<option value="">All types</option>';
          types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t; opt.textContent = t;
            typeSelect.appendChild(opt);
          });
        }
      }
    } catch (err) {
      console.error('[VS Recruitment] Failed to load jobs:', err);
      showState('error');
    }
  }

  document.getElementById('retryBtn')?.addEventListener('click', loadJobs);
  loadJobs();

  // ============================================================
  // SUBMIT — APPLY FORM
  // ============================================================
  const applyForm = document.getElementById('applyForm');
  applyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn      = document.getElementById('applySubmitBtn');
    const origText = btn.textContent;
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    const formData = new FormData(applyForm);

    // Languages checkboxes
    const langs = [...applyForm.querySelectorAll('input[name="languages"]:checked')].map(el => el.value);
    formData.delete('languages');
    formData.append('languages', langs.join(', '));

    try {
      const res = await fetch(APPLY_WEBHOOK, { method: 'POST', body: formData });
      const statusEl = document.getElementById('formStatus');
      if (res.ok) {
        statusEl.textContent  = '✓ Application sent! I will be in touch within 48 hours.';
        statusEl.className    = 'form-status form-status--success';
        statusEl.style.display = 'block';
        applyForm.reset();
        // Reset file drop
        document.getElementById('applyFileUI').style.display      = 'flex';
        document.getElementById('applyFilePreview').style.display = 'none';
        document.getElementById('applyFileDrop').classList.remove('has-file');
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      const statusEl = document.getElementById('formStatus');
      statusEl.textContent   = '✗ Something went wrong. Please try again.';
      statusEl.className     = 'form-status form-status--error';
      statusEl.style.display = 'block';
    } finally {
      btn.disabled    = false;
      btn.textContent = origText;
    }
  });

  // ============================================================
  // SUBMIT — CV FORM
  // ============================================================
  const cvForm = document.getElementById('cvForm');
  cvForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate mandatory fields
    let valid = true;
    const name  = document.getElementById('cv-name');
    const email = document.getElementById('cv-email');
    const phone = document.getElementById('cv-phone');
    const cvFile = document.getElementById('cvFile');

    document.getElementById('err-name').textContent  = '';
    document.getElementById('err-email').textContent = '';
    document.getElementById('err-phone').textContent = '';
    document.getElementById('err-cv').textContent    = '';

    if (!name.value.trim())  { document.getElementById('err-name').textContent  = 'Required'; document.getElementById('err-name').classList.add('show');  valid = false; }
    if (!email.value.trim()) { document.getElementById('err-email').textContent = 'Required'; document.getElementById('err-email').classList.add('show'); valid = false; }
    if (!phone.value.trim()) { document.getElementById('err-phone').textContent = 'Required'; document.getElementById('err-phone').classList.add('show'); valid = false; }
    if (!cvFile.files[0])    { document.getElementById('err-cv').textContent    = 'Please upload your CV'; document.getElementById('err-cv').classList.add('show'); valid = false; }

    if (!valid) return;

    const btn      = document.getElementById('cvSubmitBtn');
    const btnText  = document.getElementById('cvBtnText');
    const spinner  = document.getElementById('cvBtnSpinner');
    btn.disabled   = true;
    btnText.textContent = 'Sending…';
    spinner.style.display = 'inline-block';

    const formData = new FormData(cvForm);

    try {
      const res = await fetch(CV_WEBHOOK, { method: 'POST', body: formData });
      if (res.ok) {
        document.getElementById('cvFormState').style.display    = 'none';
        document.getElementById('cvSuccessState').style.display = 'block';
        document.getElementById('cvErrorState').style.display   = 'none';
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      document.getElementById('cvFormState').style.display    = 'none';
      document.getElementById('cvSuccessState').style.display = 'none';
      document.getElementById('cvErrorState').style.display   = 'block';
    } finally {
      btn.disabled = false;
      btnText.textContent   = 'Send my profile';
      spinner.style.display = 'none';
    }
  });

  // CV modal success / retry
  document.getElementById('cvSuccessClose')?.addEventListener('click', () => {
    closeModal(document.getElementById('cvModal'));
    setTimeout(() => {
      document.getElementById('cvFormState').style.display    = 'block';
      document.getElementById('cvSuccessState').style.display = 'none';
      cvForm?.reset();
      document.getElementById('cvFileUI').style.display      = 'flex';
      document.getElementById('cvFilePreview').style.display = 'none';
      document.getElementById('cvFileDrop').classList.remove('has-file');
    }, 300);
  });

  document.getElementById('cvRetryBtn')?.addEventListener('click', () => {
    document.getElementById('cvFormState').style.display  = 'block';
    document.getElementById('cvErrorState').style.display = 'none';
  });

}); // end DOMContentLoaded
