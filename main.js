document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // BURGER MENU
  // ============================================================
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  burgerBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burgerBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // ============================================================
  // MODAL HELPERS
  // ============================================================
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach(m => closeModal(m));
    }
  });

  // ============================================================
  // HELPERS
  // ============================================================
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function formatJobText(text) {
    if (!text) return '<p>—</p>';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return '<p>—</p>';
    const isList = lines.every(l => /^[-•*]/.test(l));
    if (isList) {
      return '<ul>' + lines.map(l =>
        `<li>${escapeHtml(l.replace(/^[-•*]\s*/, ''))}</li>`
      ).join('') + '</ul>';
    }
    return lines.map(l => `<p>${escapeHtml(l)}</p>`).join('');
  }

  // ============================================================
  // VACANCIES
  // ============================================================
  let allJobs = [];

  function showState(state, count) {
    const grid    = document.getElementById('jobsGrid');
    const empty   = document.getElementById('jobsEmpty');
    const error   = document.getElementById('jobsError');
    const loading = document.getElementById('jobsLoading');
    const filters = document.querySelector('.vacancies__filters');
    const countEl = document.querySelector('.vacancies__count');

    [grid, empty, error, loading].forEach(el => { if (el) el.style.display = 'none'; });

    if (state === 'loading') {
      if (loading) loading.style.display = 'block';
    } else if (state === 'empty') {
      if (empty)   empty.style.display   = 'block';
      if (filters) filters.style.display = 'none';
    } else if (state === 'error') {
      if (error)   error.style.display   = 'block';
      if (filters) filters.style.display = 'none';
    } else if (state === 'results') {
      if (grid)    grid.style.display    = 'grid';
      if (filters) filters.style.display = 'flex';
      if (countEl) {
        countEl.textContent = `${count} position${count !== 1 ? 's' : ''} available`;
        countEl.className   = 'vacancies__count ' + (count > 0 ? 'is-green' : 'is-red');
      }
    }
  }

  function renderCards(jobs) {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    jobs.forEach((job, idx) => {
      const card     = document.createElement('article');
      card.className  = 'job-card';
      card.dataset.idx = idx;

      const type      = job['Contract type']       || '';
      const title     = job['Job title']           || 'Untitled';
      const school    = job['Establishment']       || '';
      const city      = job['City']                || '';
      const district  = job['Discrict']            || '';
      const salary    = job['Annual base salary']  || '';
      const shortDesc = job['Short description']   || '';

      card.innerHTML = `
        <div class="job-card__header">
          ${type ? `<span class="job-card__tag">${escapeHtml(type)}</span>` : ''}
          <h3 class="job-card__title">${escapeHtml(title)}</h3>
          <p class="job-card__school">${escapeHtml(school)}</p>
        </div>
        <div class="job-card__body">
          <p class="job-card__desc">${escapeHtml(shortDesc)}</p>
        </div>
        <div class="job-card__footer">
          <span class="job-card__meta">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${escapeHtml(city)}${district ? ` · ${escapeHtml(district)}` : ''}
          </span>
          ${salary ? `<span class="job-card__meta">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            MYR ${escapeHtml(salary)}
          </span>` : ''}
          <button class="btn btn--outline btn--sm job-card__cta" data-idx="${idx}">View & Apply</button>
        </div>
      `;

      card.querySelector('.job-card__cta').addEventListener('click', (e) => {
        e.stopPropagation();
        openJobDetail(idx);
      });
      card.addEventListener('click', () => openJobDetail(idx));
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
    const type   = (document.getElementById('filterType')?.value   || '').toLowerCase();

    const filtered = allJobs.filter(job => {
      const matchSearch = !search ||
        (job['Job title']         || '').toLowerCase().includes(search) ||
        (job['Establishment']     || '').toLowerCase().includes(search) ||
        (job['City']              || '').toLowerCase().includes(search) ||
        (job['Short description'] || '').toLowerCase().includes(search);
      const matchType = !type ||
        (job['Contract type'] || '').toLowerCase() === type;
      return matchSearch && matchType;
    });

    renderCards(filtered);
    const countEl = document.querySelector('.vacancies__count');
    if (countEl) {
      countEl.textContent = `${filtered.length} position${filtered.length !== 1 ? 's' : ''} available`;
      countEl.className   = 'vacancies__count ' + (filtered.length > 0 ? 'is-green' : 'is-red');
    }
  }

  function loadJobs() {
    showState('loading');
    try {
      allJobs = (typeof JOBS_DATA !== 'undefined' && Array.isArray(JOBS_DATA)) ? JOBS_DATA : [];
      if (allJobs.length === 0) {
        showState('empty');
        return;
      }
      showState('results', allJobs.length);
      renderCards(allJobs);

      const typeSelect = document.getElementById('filterType');
      if (typeSelect) {
        const types = [...new Set(allJobs.map(j => j['Contract type']).filter(Boolean))];
        types.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.toLowerCase();
          opt.textContent = t;
          typeSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.error('[Jobs] Error:', err);
      showState('error');
    }
  }

  document.getElementById('filterSearch')?.addEventListener('input',  applyFilters);
  document.getElementById('filterType')?.addEventListener('change',   applyFilters);
  document.getElementById('retryBtn')?.addEventListener('click',      loadJobs);
  loadJobs();

  // ============================================================
  // JOB DETAIL MODAL
  // ============================================================
  const jobModal = document.getElementById('jobModal');

  function openJobDetail(idx) {
    const job = allJobs[idx];
    if (!job || !jobModal) return;

    const title        = job['Job title']          || 'Untitled';
    const school       = job['Establishment']      || '';
    const city         = job['City']               || '';
    const district     = job['Discrict']           || '';
    const salary       = job['Annual base salary'] || '';
    const longDesc     = job['Long description']   || '';
    const requirements = job['Requirements']       || '';
    const type         = job['Contract type']      || '';

    document.getElementById('jd-title').textContent = title;
    document.getElementById('jd-type').textContent  = type;

    const locSpan = document.querySelector('#jd-location span');
    const salSpan = document.querySelector('#jd-salary span');
    if (locSpan) locSpan.textContent = city + (district ? ` · ${district}` : '');
    if (salSpan) salSpan.textContent = salary ? `MYR ${salary}` : '—';

    document.getElementById('jd-school').textContent   = school;
    document.getElementById('jd-district').textContent = district;
    document.getElementById('jd-description').innerHTML  = formatJobText(longDesc);
    document.getElementById('jd-requirements').innerHTML = formatJobText(requirements);

    jobModal.dataset.jobTitle    = title;
    jobModal.dataset.jobSchool   = school;
    jobModal.dataset.jobLocation = city;

    openModal(jobModal);
  }

  document.getElementById('closeJobModal')?.addEventListener('click', () => closeModal(jobModal));

  document.getElementById('jd-applyBtn')?.addEventListener('click', () => {
    const title = jobModal?.dataset.jobTitle || '';
    closeModal(jobModal);
    const applyModal = document.getElementById('applyModal');
    const titleSpan  = document.getElementById('apply-job-title');
    if (titleSpan) titleSpan.textContent = title;
    openModal(applyModal);
  });

  // ============================================================
  // APPLY MODAL
  // ============================================================
  const applyModal       = document.getElementById('applyModal');
  const applyForm        = document.getElementById('applyForm');
  const applyFormState   = document.getElementById('applyFormState');
  const applySuccessState= document.getElementById('applySuccessState');
  const applyErrorState  = document.getElementById('applyErrorState');
  const applyFileInput   = document.getElementById('apply-cv-file');
  const applyFileDrop    = document.getElementById('apply-cv-drop');

  document.getElementById('closeApplyModal')?.addEventListener('click', () => closeModal(applyModal));
  document.getElementById('applySuccessClose')?.addEventListener('click', () => closeModal(applyModal));
  document.getElementById('applyRetryBtn')?.addEventListener('click', () => {
    applyErrorState.style.display  = 'none';
    applyFormState.style.display   = 'block';
  });

  // File upload — Apply
  function showApplyFile(file) {
    if (!applyFileDrop) return;
    applyFileDrop.classList.add('has-file');
    const p = applyFileDrop.querySelector('.file-upload__content p');
    if (p) p.innerHTML = `<strong>${escapeHtml(file.name)}</strong> (${(file.size/1024).toFixed(0)} KB)`;
    const btn = applyFileDrop.querySelector('.file-upload__remove');
    if (btn) btn.style.display = 'inline-block';
  }

  function clearApplyFile() {
    if (!applyFileInput || !applyFileDrop) return;
    applyFileInput.value = '';
    applyFileDrop.classList.remove('has-file');
    const p = applyFileDrop.querySelector('.file-upload__content p');
    if (p) p.innerHTML = `<strong>Choose a file</strong> or drag & drop`;
    const btn = applyFileDrop.querySelector('.file-upload__remove');
    if (btn) btn.style.display = 'none';
  }

  applyFileDrop?.addEventListener('click', (e) => {
    if (e.target.classList.contains('file-upload__remove')) return;
    applyFileInput?.click();
  });
  applyFileInput?.addEventListener('change', () => {
    if (applyFileInput.files[0]) showApplyFile(applyFileInput.files[0]);
  });
  applyFileDrop?.querySelector('.file-upload__remove')?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearApplyFile();
  });
  applyFileDrop?.addEventListener('dragover',  (e) => { e.preventDefault(); applyFileDrop.classList.add('is-dragging'); });
  applyFileDrop?.addEventListener('dragleave', ()  => applyFileDrop.classList.remove('is-dragging'));
  applyFileDrop?.addEventListener('drop', (e) => {
    e.preventDefault();
    applyFileDrop.classList.remove('is-dragging');
    const file = e.dataTransfer.files[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      applyFileInput.files = dt.files;
      showApplyFile(file);
    }
  });

  function validateApplyForm() {
    let valid = true;
    const err   = (id, msg) => { const el = document.getElementById(id); if (el) { el.textContent = msg; el.classList.add('show'); } valid = false; };
    const clear = (id)      => { const el = document.getElementById(id); if (el) { el.textContent = ''; el.classList.remove('show'); } };

    ['err-apply-name','err-apply-email','err-apply-phone','err-apply-function',
     'err-apply-experience','err-apply-qualification','err-apply-skills',
     'err-apply-languages','err-apply-salary','err-apply-locations','err-apply-file'].forEach(clear);

    const name          = document.getElementById('apply-name')?.value.trim();
    const email         = document.getElementById('apply-email')?.value.trim();
    const phone         = document.getElementById('apply-phone')?.value.trim();
    const jobFunction   = document.getElementById('apply-function')?.value.trim();
    const experience    = document.getElementById('apply-experience')?.value;
    const qualification = document.getElementById('apply-qualification')?.value;
    const skills        = document.getElementById('apply-skills')?.value.trim();
    const languages     = document.querySelectorAll('input[name="apply-languages"]:checked');
    const salary        = document.getElementById('apply-salary')?.value.trim();
    const locations     = document.querySelectorAll('input[name="apply-locations"]:checked');
    const file          = applyFileInput?.files[0];

    if (!name)              err('err-apply-name',          'Full name is required.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                            err('err-apply-email',         'Valid email is required.');
    if (!phone)             err('err-apply-phone',         'Phone number is required.');
    if (!jobFunction)       err('err-apply-function',      'Job function is required.');
    if (!experience)        err('err-apply-experience',    'Please select your experience level.');
    if (!qualification)     err('err-apply-qualification', 'Please select your qualification.');
    if (!skills)            err('err-apply-skills',        'Please enter at least one skill.');
    if (!languages.length)  err('err-apply-languages',     'Select at least one language.');
    if (!salary)            err('err-apply-salary',        'Expected salary is required.');
    if (!locations.length)  err('err-apply-locations',     'Select at least one location.');
    if (!file)              err('err-apply-file',          'Please attach your CV.');

    return valid;
  }

  applyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateApplyForm()) return;

    const submitBtn  = document.getElementById('applySubmitBtn');
    const btnText    = document.getElementById('applyBtnText');
    const btnSpinner = document.getElementById('applyBtnSpinner');

    submitBtn.disabled       = true;
    btnText.style.display    = 'none';
    btnSpinner.style.display = 'inline-block';

    try {
      const languages = [...document.querySelectorAll('input[name="apply-languages"]:checked')].map(c => c.value).join(', ');
      const locations = [...document.querySelectorAll('input[name="apply-locations"]:checked')].map(c => c.value).join(', ');

      const fd = new FormData();
      fd.append('fullName',       document.getElementById('apply-name').value.trim());
      fd.append('email',          document.getElementById('apply-email').value.trim());
      fd.append('phone',          document.getElementById('apply-phone').value.trim());
      fd.append('subject',        document.getElementById('apply-subject')?.value.trim() || '');
      fd.append('jobFunction',    document.getElementById('apply-function').value.trim());
      fd.append('targetedRoles',  document.getElementById('apply-targeted-roles')?.value.trim() || '');
      fd.append('experience',     document.getElementById('apply-experience').value);
      fd.append('qualification',  document.getElementById('apply-qualification').value);
      fd.append('skills',         document.getElementById('apply-skills').value.trim());
      fd.append('languages',      languages);
      fd.append('expectedSalary', document.getElementById('apply-salary').value.trim());
      fd.append('locations',      locations);
      fd.append('notes',          document.getElementById('apply-notes')?.value.trim() || '');
      fd.append('jobTitle',       document.getElementById('apply-job-title')?.textContent || '');
      if (applyFileInput.files[0]) fd.append('cv', applyFileInput.files[0]);

      const res = await fetch(APPLY_WEBHOOK, { method: 'POST', body: fd });

      if (res.ok) {
        applyFormState.style.display    = 'none';
        applySuccessState.style.display = 'block';
        applyForm.reset();
        clearApplyFile();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('[Apply]', err);
      applyFormState.style.display  = 'none';
      applyErrorState.style.display = 'block';
    } finally {
      submitBtn.disabled       = false;
      btnText.style.display    = 'inline';
      btnSpinner.style.display = 'none';
    }
  });

  // ============================================================
  // CV MODAL — Passive candidates
  // ============================================================
  const cvModal        = document.getElementById('cvModal');
  const cvForm         = document.getElementById('cvForm');
  const cvFormState    = document.getElementById('cvFormState');
  const cvSuccessState = document.getElementById('cvSuccessState');
  const cvErrorState   = document.getElementById('cvErrorState');
  const cvFileInput    = document.getElementById('cv-file-input');
  const cvFileDrop     = document.getElementById('cv-file-drop');

  // Open CV modal
  document.getElementById('openCvForm')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(cvModal);
  });
  document.getElementById('openCvFormVacancies')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(cvModal);
  });
  document.getElementById('openCvFormEmpty')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(cvModal);
  });

  document.getElementById('closeCvModal')?.addEventListener('click',  () => closeModal(cvModal));
  document.getElementById('cvSuccessClose')?.addEventListener('click', () => closeModal(cvModal));
  document.getElementById('cvRetryBtn')?.addEventListener('click', () => {
    cvErrorState.style.display  = 'none';
    cvFormState.style.display   = 'block';
  });

    // File upload — CV
  function showCvFile(file) {
    if (!cvFileDrop) return;
    cvFileDrop.classList.add('has-file');
    const p = cvFileDrop.querySelector('.file-upload__content p');
    if (p) p.innerHTML = `<strong>${escapeHtml(file.name)}</strong> (${(file.size/1024).toFixed(0)} KB)`;
    const btn = document.getElementById('removeCvFile');
    if (btn) btn.style.display = 'inline-block';
  }

  function clearCvFile() {
    if (!cvFileInput || !cvFileDrop) return;
    cvFileInput.value = '';
    cvFileDrop.classList.remove('has-file');
    const p = cvFileDrop.querySelector('.file-upload__content p');
    if (p) p.innerHTML = `<strong>Choose a file</strong> or drag & drop`;
    const btn = document.getElementById('removeCvFile');
    if (btn) btn.style.display = 'none';
  }

  cvFileDrop?.addEventListener('click', (e) => {
    if (e.target.id === 'removeCvFile') return;
    cvFileInput?.click();
  });
  cvFileInput?.addEventListener('change', () => {
    if (cvFileInput.files[0]) showCvFile(cvFileInput.files[0]);
  });
  document.getElementById('removeCvFile')?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearCvFile();
  });
  cvFileDrop?.addEventListener('dragover',  (e) => { e.preventDefault(); cvFileDrop.classList.add('is-dragging'); });
  cvFileDrop?.addEventListener('dragleave', ()  => cvFileDrop.classList.remove('is-dragging'));
  cvFileDrop?.addEventListener('drop', (e) => {
    e.preventDefault();
    cvFileDrop.classList.remove('is-dragging');
    const file = e.dataTransfer.files[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      cvFileInput.files = dt.files;
      showCvFile(file);
    }
  });

  // ============================================================
  // CV FORM — Preferred Locations "Other" toggle
  // ============================================================
  const cvOtherRow = document.getElementById('cv-other-location-row');
  document.querySelectorAll('input[name="cv-locations"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const hasOther = Array.from(
        document.querySelectorAll('input[name="cv-locations"]:checked')
      ).some(c => c.value === 'Other');
      if (cvOtherRow) cvOtherRow.style.display = hasOther ? 'grid' : 'none';
    });
  });

  // ============================================================
  // CV FORM — Validation
  // ============================================================
  function validateCvForm() {
    let valid = true;
    const err   = (id, msg) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = msg; el.classList.add('show'); }
      valid = false;
    };
    const clear = (id) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.classList.remove('show'); }
    };

    ['err-cv-name','err-cv-email','err-cv-file'].forEach(clear);

    const name  = document.getElementById('cv-name')?.value.trim();
    const email = document.getElementById('cv-email')?.value.trim();
    const file  = cvFileInput?.files[0];

    if (!name)  err('err-cv-name',  'Full name is required.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                err('err-cv-email', 'Valid email is required.');
    if (!file)  err('err-cv-file',  'Please attach your CV (PDF or Word, max 5 MB).');
    else if (file.size > 5 * 1024 * 1024)
                err('err-cv-file',  'File too large — maximum 5 MB.');

    return valid;
  }

  // ============================================================
  // CV FORM — Submit
  // ============================================================
  cvForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCvForm()) return;

    const submitBtn  = document.getElementById('cvSubmitBtn');
    const btnText    = document.getElementById('cvBtnText');
    const btnSpinner = document.getElementById('cvBtnSpinner');

    submitBtn.disabled       = true;
    btnText.style.display    = 'none';
    btnSpinner.style.display = 'inline-block';

    try {
      const languages = [...document.querySelectorAll('input[name="cv-languages"]:checked')]
        .map(c => c.value).join(', ');
      const locations = [...document.querySelectorAll('input[name="cv-locations"]:checked')]
        .map(c => c.value).join(', ');
      const otherLocation = document.getElementById('cv-other-location')?.value.trim() || '';

      const fd = new FormData();
      fd.append('fullName',       document.getElementById('cv-name').value.trim());
      fd.append('email',          document.getElementById('cv-email').value.trim());
      fd.append('phone',          document.getElementById('cv-phone')?.value.trim()        || '');
      fd.append('subject',        document.getElementById('cv-subject')?.value.trim()      || '');
      fd.append('jobFunction',    document.getElementById('cv-function')?.value.trim()     || '');
      fd.append('targetedRoles',  document.getElementById('cv-targeted-roles')?.value.trim() || '');
      fd.append('experience',     document.getElementById('cv-experience')?.value          || '');
      fd.append('qualification',  document.getElementById('cv-qualification')?.value       || '');
      fd.append('skills',         document.getElementById('cv-skills')?.value.trim()       || '');
      fd.append('languages',      languages);
      fd.append('expectedSalary', document.getElementById('cv-salary')?.value.trim()       || '');
      fd.append('locations',      locations + (otherLocation ? `, ${otherLocation}` : ''));
      fd.append('notes',          document.getElementById('cv-notes')?.value.trim()        || '');
      if (cvFileInput.files[0]) fd.append('cv', cvFileInput.files[0]);

      const res = await fetch(CV_WEBHOOK, { method: 'POST', body: fd });

      if (res.ok) {
        cvFormState.style.display    = 'none';
        cvSuccessState.style.display = 'block';
        cvForm.reset();
        clearCvFile();
        if (cvOtherRow) cvOtherRow.style.display = 'none';
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('[CV Submit]', err);
      cvFormState.style.display  = 'none';
      cvErrorState.style.display = 'block';
    } finally {
      submitBtn.disabled       = false;
      btnText.style.display    = 'inline';
      btnSpinner.style.display = 'none';
    }
  });

  // ============================================================
  // NAVBAR — burger menu
  // ============================================================
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  burgerBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    burgerBtn.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burgerBtn?.setAttribute('aria-expanded', 'false');
    });
  });

}); // end DOMContentLoaded
