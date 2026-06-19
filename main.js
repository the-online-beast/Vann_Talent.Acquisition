// ============================================================
// main.js — Complete site logic
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
  // MODAL UTILITY
  // ============================================================
  function openModal(modal) {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Close on overlay click
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

  // ============================================================
  // VACANCIES — CSV Parser (handles quoted fields with commas)
  // ============================================================
  function parseCSV(text) {
    const rows = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
        if (current.trim() || rows.length > 0) {
          rows.push(current);
        }
        current = '';
        if (ch === '\r') i++;
      } else {
        current += ch;
      }
    }
    if (current.trim()) rows.push(current);

    return rows.map(row => {
      const cells = [];
      let cell = '';
      let sq = false;
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        const next = row[i + 1];
        if (ch === '"') {
          if (sq && next === '"') { cell += '"'; i++; }
          else sq = !sq;
        } else if (ch === ',' && !sq) {
          cells.push(cell.trim());
          cell = '';
        } else {
          cell += ch;
        }
      }
      cells.push(cell.trim());
      return cells;
    });
  }

  // ============================================================
  // VACANCIES — Show state (loading / empty / error / results)
  // ============================================================
  function showState(state, count = 0) {
    ['vacanciesLoading', 'vacanciesEmpty', 'vacanciesError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-visible');
    });

    const grid    = document.getElementById('jobsGrid');
    const filters = document.getElementById('vacanciesFilters');
    const counter = document.getElementById('vacanciesCount');

    if (grid)    grid.style.display    = 'none';
    if (filters) filters.style.display = 'none';
    counter.className = 'vacancies__count';
    counter.textContent = '';

    if (state === 'loading') {
      const el = document.getElementById('vacanciesLoading');
      if (el) el.classList.add('is-visible');
    } else if (state === 'empty') {
      const el = document.getElementById('vacanciesEmpty');
      if (el) el.classList.add('is-visible');
      counter.classList.add('is-red');
      counter.textContent = 'No open positions at the moment.';
    } else if (state === 'error') {
      const el = document.getElementById('vacanciesError');
      if (el) el.classList.add('is-visible');
    } else if (state === 'results') {
      if (grid)    grid.style.display    = 'grid';
      if (filters) filters.style.display = 'flex';
      counter.classList.add('is-green');
      counter.textContent = `${count} open position${count !== 1 ? 's' : ''}`;
    }
  }

  // ============================================================
// RENDER JOB CARDS
// ============================================================
function renderCards(jobs) {
  const grid = document.getElementById('jobsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  jobs.forEach((job, idx) => {
    const card = document.createElement('article');
    card.className = 'job-card';
    card.dataset.idx = idx;

    const type     = job['Contract type']       || '';
    const title    = job['Job Title']           || 'Untitled';
    const school   = job['Establishment']       || '';
    const city     = job['City']               || '';
    const district = job['Discrict']           || '';   // note: typo conservé du sheet
    const salary   = job['Annual base salary'] || '';
    const shortDesc = job['Short description'] || '';

    card.innerHTML = `
      <div class="job-card__header">
        <span class="job-card__type">${escapeHtml(type)}</span>
      </div>
      <h3 class="job-card__title">${escapeHtml(title)}</h3>
      <p class="job-card__school">${escapeHtml(school)}</p>
      <p class="job-card__meta">
        <span class="job-card__location">${escapeHtml(city)}${district ? ' · ' + district : ''}</span>
        ${salary ? `<span class="job-card__salary">${escapeHtml(salary)}</span>` : ''}
      </p>
      <p class="job-card__excerpt">${escapeHtml(shortDesc)}</p>
      <span class="job-card__cta">View details →</span>
    `;

    card.addEventListener('click', () => openJobModal(job));
    grid.appendChild(card);
  });
}

// ============================================================
// OPEN JOB MODAL
// ============================================================
function openJobModal(job) {
  const type     = job['Contract type']       || '';
  const title    = job['Job Title']           || 'Position';
  const city     = job['City']               || '';
  const district = job['Discrict']           || '';
  const salary   = job['Annual base salary'] || '';
  const school   = job['Establishment']       || '';

  document.getElementById('jd-type').textContent       = type;
  document.getElementById('jobModalTitle').textContent  = title;

  document.querySelector('#jd-location span').textContent = city + (district ? ` · ${district}` : '');
  document.querySelector('#jd-salary span').textContent   = salary;
  document.querySelector('#jd-date span').textContent     = '';   // plus de date dans DB_jobs

  const schoolEl   = document.getElementById('jd-school');
  const districtEl = document.getElementById('jd-district');
  if (schoolEl)   schoolEl.textContent   = school;
  if (districtEl) districtEl.textContent = district;

  document.getElementById('jd-description').innerHTML  = formatJobText(job['Long description']  || '');
  document.getElementById('jd-requirements').innerHTML = formatJobText(job['Requirements'] || '');

  jobModal.dataset.jobTitle    = title;
  jobModal.dataset.jobId       = job['Job Title'] || '';
  jobModal.dataset.jobSchool   = school;
  jobModal.dataset.jobLocation = city;

  openModal(jobModal);
}

// ============================================================
// APPLY FILTERS — mettre à jour aussi le filtre par type
// ============================================================
function applyFilters() {
  const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
  const type   = (document.getElementById('filterType')?.value  || '').toLowerCase();

  const filtered = allJobs.filter(job => {
    const jobTitle = (job['Job Title']     || '').toLowerCase();
    const jobSchool = (job['Establishment'] || '').toLowerCase();
    const jobCity   = (job['City']         || '').toLowerCase();
    const jobType = (job['Contract type'] || '').toLowerCase();

    const matchSearch = !search ||
      jobTitle.includes(search) ||
      jobSchool.includes(search) ||
      jobCity.includes(search);

    const matchType = !type || jobType === type;

    return matchSearch && matchType;
  });

  renderCards(filtered);

  const counter = document.getElementById('vacanciesCount');
  if (counter) {
    counter.textContent = `${filtered.length} open position${filtered.length !== 1 ? 's' : ''}`;
    counter.className   = `vacancies__count ${filtered.length > 0 ? 'is-green' : 'is-red'}`;
  }
}


  // ============================================================
// VACANCIES — Load from Google Sheet (CSV)
// ============================================================
async function loadJobs() {
  showState('loading');
  try {
    const res = await fetch(SHEET_VACANCIES_URL, {
  cache: 'no-store',
  mode: 'cors'
});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();

    // DEBUG — voir ce qu'on reçoit
    console.log('[DEBUG] raw CSV (first 500 chars):', raw.substring(0, 500));
    console.log('[DEBUG] raw length:', raw.length);

    const rows = parseCSV(raw);
    console.log('[DEBUG] rows parsed:', rows.length);
    console.log('[DEBUG] headers:', rows[0]);
    console.log('[DEBUG] first data row:', rows[1]);

    if (rows.length < 2) { showState('empty'); return; }

    const headers = rows[0].map(h => h.trim());
    allJobs = rows.slice(1)
      .map(row => {
        const job = {};
        headers.forEach((h, i) => { job[h] = (row[i] || '').trim(); });
        return job;
      })
      .filter(job => (job['Job Title'] || '').trim());

    console.log('[DEBUG] allJobs after filter:', allJobs.length, allJobs);

    if (allJobs.length === 0) {
      showState('empty');
    } else {
      showState('results', allJobs.length);
      renderCards(allJobs);

      // Populate type filter dynamically
      const typeSelect = document.getElementById('filterType');
      if (typeSelect) {
        const types = [...new Set(allJobs.map(j => j['Contract type']).filter(Boolean))].sort();
        const firstOpt = typeSelect.querySelector('option[value=""]');
        typeSelect.innerHTML = '';
        if (firstOpt) typeSelect.appendChild(firstOpt);
        else typeSelect.insertAdjacentHTML('afterbegin', '<option value="">All types</option>');
        types.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t;
          opt.textContent = t;
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
  // CV MODAL — Passive candidates form
  // ============================================================
  const cvModal         = document.getElementById('cvModal');
  const cvForm          = document.getElementById('cvForm');
  const cvFormState     = document.getElementById('cvFormState');
  const cvSuccessState  = document.getElementById('cvSuccessState');
  const cvErrorState    = document.getElementById('cvErrorState');
  const cvSubmitBtn     = document.getElementById('cvSubmitBtn');
  const cvBtnText       = document.getElementById('cvBtnText');
  const cvBtnSpinner    = document.getElementById('cvBtnSpinner');

  // Open CV modal from About CTAs
  document.getElementById('openCvForm')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(cvModal);
  });
  document.getElementById('openCvFormVacancies')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(cvModal);
  });

  // Close CV modal
  document.getElementById('closeCvModal')?.addEventListener('click', () => closeModal(cvModal));

  // --- Preferred Locations: show "Other" text input ---
  const otherCitiesRow = document.getElementById('otherCitiesRow');
  document.querySelectorAll('input[name="cv-locations"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const hasOther = Array.from(document.querySelectorAll('input[name="cv-locations"]:checked'))
        .some(c => c.value === 'Other');
      if (otherCitiesRow) otherCitiesRow.style.display = hasOther ? 'grid' : 'none';
    });
  });

  // --- File upload (CV form) ---
  const cvFileInput  = document.getElementById('cv-file');
  const cvFileDrop  = document.getElementById('cvFileDrop');
  const cvFilePreview = document.getElementById('cvFilePreview');
  const cvFileName  = document.getElementById('cvFileName');

  function showCvFile(file) {
    cvFileName.textContent = file.name;
    cvFileDrop.style.display  = 'none';
    cvFilePreview.style.display = 'flex';
  }

  function clearCvFile() {
    cvFileInput.value = '';
    cvFileDrop.style.display   = 'flex';
    cvFilePreview.style.display = 'none';
  }

  if (cvFileInput) {
    cvFileInput.addEventListener('change', () => {
      if (cvFileInput.files[0]) showCvFile(cvFileInput.files[0]);
    });
  }

  document.getElementById('removeCvFile')?.addEventListener('click', clearCvFile);

  if (cvFileDrop) {
    cvFileDrop.addEventListener('dragover', (e) => { e.preventDefault(); cvFileDrop.classList.add('is-dragging'); });
    cvFileDrop.addEventListener('dragleave', () => cvFileDrop.classList.remove('is-dragging'));
    cvFileDrop.addEventListener('drop', (e) => {
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
  }

  // --- CV Form validation ---
  function validateCvForm() {
    let valid = true;
    const err = (id, msg) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = msg; el.classList.add('show'); }
      valid = false;
    };
    const clear = (id) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.classList.remove('show'); }
    };

    clear('err-cv-name'); clear('err-cv-email'); clear('err-cv-file');

    const name  = document.getElementById('cv-name')?.value.trim();
    const email = document.getElementById('cv-email')?.value.trim();
    const file  = cvFileInput?.files[0];

    if (!name) err('err-cv-name', 'Full Name is required');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err('err-cv-email', 'Valid email is required');
    if (!file) err('err-cv-file', 'Please attach your CV');
    else if (file.size > 5 * 1024 * 1024) err('err-cv-file', 'File too large (max 5 MB)');
    else if (!['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type))
      err('err-cv-file', 'Only PDF, DOC or DOCX allowed');

    return valid;
  }

    // --- CV Form submit ---
  if (cvForm) {
    cvForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateCvForm()) return;

      cvBtnText.style.display    = 'none';
      cvBtnSpinner.style.display  = 'inline-block';
      cvSubmitBtn.disabled        = true;

      const formData = new FormData();
      formData.append('fullName',      document.getElementById('cv-name')?.value.trim());
      formData.append('email',         document.getElementById('cv-email')?.value.trim());
      formData.append('phone',         document.getElementById('cv-phone')?.value.trim());
      formData.append('jobFunction',   document.getElementById('cv-job-function')?.value);
      formData.append('targetedRoles', document.getElementById('cv-targeted-roles')?.value.trim());
      formData.append('subject',       document.getElementById('cv-subject')?.value);
      formData.append('experience',    document.getElementById('cv-experience')?.value);
      formData.append('qualification', document.getElementById('cv-qualification')?.value);
      formData.append('skills',        document.getElementById('cv-skills')?.value.trim());
      formData.append('languages',     Array.from(document.querySelectorAll('input[name="cv-languages"]:checked')).map(c => c.value).join(', '));
      formData.append('expectedSalary',document.getElementById('cv-salary')?.value.trim());
      formData.append('locations',     Array.from(document.querySelectorAll('input[name="cv-locations"]:checked')).map(c => c.value).join(', '));
      formData.append('otherLocation', document.getElementById('cv-other-location')?.value.trim());
      formData.append('notes',         document.getElementById('cv-notes')?.value.trim());
      if (cvFileInput?.files[0]) {
        formData.append('cv', cvFileInput.files[0]);
      }

      try {
        const res = await fetch(CV_WEBHOOK, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Webhook error');
        cvFormState.style.display    = 'none';
        cvSuccessState.style.display = 'flex';
      } catch (err) {
        console.error(err);
        cvFormState.style.display  = 'none';
        cvErrorState.style.display = 'flex';
      } finally {
        cvBtnText.style.display    = 'inline';
        cvBtnSpinner.style.display = 'none';
        cvSubmitBtn.disabled       = false;
      }
    }); // ← fin addEventListener

    document.getElementById('cvRetryBtn')?.addEventListener('click', () => {
      cvErrorState.style.display  = 'none';
      cvFormState.style.display   = 'block';
    });

    document.getElementById('cvSuccessClose')?.addEventListener('click', () => {
      closeModal(cvModal);
      setTimeout(() => {
        cvSuccessState.style.display = 'none';
        cvFormState.style.display    = 'block';
        cvForm?.reset();
        clearCvFile();
      }, 300);
    });

  } // ← fin if (cvForm)


  // ============================================================
  // APPLY MODAL — Apply to a specific job
  // ============================================================
  const applyModal = document.getElementById('applyModal');
  const applyForm  = document.getElementById('applyForm');
  const applyStatus = document.getElementById('formStatus');

  document.getElementById('closeApplyModal')?.addEventListener('click', () => {
    closeModal(applyModal);
    applyForm?.reset();
    if (applyStatus) { applyStatus.style.display = 'none'; }
  });

  document.getElementById('openApplyForm')?.addEventListener('click', () => {
    const jobTitle = document.getElementById('jobModalTitle')?.textContent || '';
    const titleInput = document.getElementById('applyJobTitle');
    if (titleInput) titleInput.value = jobTitle;
    closeModal(jobModal);
    openModal(applyModal);
  });

  // --- Apply: file upload ---
  const applyFileInput = document.getElementById('applyCV');
  const applyFileUpload = document.getElementById('applyFileUpload');

  function handleApplyFile(file) {
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { alert('Only PDF, DOC or DOCX allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File must be under 5 MB'); return; }

    const dt = new DataTransfer();
    dt.items.add(file);
    applyFileInput.files = dt.files;

    applyFileUpload.classList.add('has-file');
    applyFileUpload.querySelector('.file-upload__content').innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <p><strong>${file.name}</strong></p>
      <p class="file-upload__hint">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
      <button type="button" class="file-upload__remove">Remove</button>
    `;
    applyFileUpload.querySelector('.file-upload__remove')?.addEventListener('click', (e) => {
      e.preventDefault();
      applyFileInput.value = '';
      applyFileUpload.classList.remove('has-file');
      applyFileUpload.querySelector('.file-upload__content').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p><strong>Click to upload</strong> or drag and drop</p>
        <p class="file-upload__hint">PDF, DOC or DOCX (max 5MB)</p>
      `;
    });
  }

  if (applyFileUpload && applyFileInput) {
    applyFileUpload.addEventListener('click', (e) => {
      if (!e.target.closest('.file-upload__remove')) applyFileInput.click();
    });
    applyFileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleApplyFile(e.target.files[0]);
    });
    applyFileUpload.addEventListener('dragover', (e) => { e.preventDefault(); applyFileUpload.classList.add('is-dragover'); });
    applyFileUpload.addEventListener('dragleave', () => applyFileUpload.classList.remove('is-dragover'));
    applyFileUpload.addEventListener('drop', (e) => {
      e.preventDefault();
      applyFileUpload.classList.remove('is-dragover');
      if (e.dataTransfer.files[0]) handleApplyFile(e.dataTransfer.files[0]);
    });
  }

  // --- Apply form submit ---
  function validateApplyForm() {
    let valid = true;
    const err = (id, msg) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = msg; el.classList.add('show'); }
      valid = false;
    };
    const clear = (id) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.classList.remove('show'); }
    };

    clear('err-apply-name'); clear('err-apply-email'); clear('err-apply-phone');
    clear('err-apply-subject'); clear('err-apply-experience'); clear('err-apply-cv');

    const name  = document.getElementById('applyFullName')?.value.trim();
    const email = document.getElementById('applyEmail')?.value.trim();
    const phone = document.getElementById('applyPhone')?.value.trim();
    const subject = document.getElementById('applySubject')?.value;
    const experience = document.getElementById('applyExperience')?.value;
    const file = applyFileInput?.files[0];

    if (!name) err('err-apply-name', 'Full Name is required');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err('err-apply-email', 'Valid email is required');
    if (!phone) err('err-apply-phone', 'Phone Number is required');
    if (!subject) err('err-apply-subject', 'Please select a subject');
    if (!experience) err('err-apply-experience', 'Years of experience is required');
    if (!file) err('err-apply-cv', 'Please attach your CV');
    else if (file.size > 5 * 1024 * 1024) err('err-apply-cv', 'File too large (max 5 MB)');

    return valid;
  }

  if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateApplyForm()) return;

      const submitBtn = document.getElementById('applySubmitBtn');
      const origText  = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';

      const formData = new FormData(applyForm);
      formData.set('languages', Array.from(document.querySelectorAll('input[name="apply-languages"]:checked')).map(c => c.value).join(', '));
      formData.set('locations', Array.from(document.querySelectorAll('input[name="apply-locations"]:checked')).map(c => c.value).join(', '));

      try {
        const res = await fetch(APPLY_WEBHOOK, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Error');
        if (applyStatus) {
          applyStatus.textContent = '✓ Application submitted! I will review your profile and contact you within 48 hours.';
          applyStatus.className = 'form-status success';
          applyStatus.style.display = 'block';
        }
        applyForm.reset();
        applyFileUpload?.classList.remove('has-file');
        if (applyFileUpload) {
          applyFileUpload.querySelector('.file-upload__content').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p><strong>Click to upload</strong> or drag and drop</p>
            <p class="file-upload__hint">PDF, DOC or DOCX (max 5MB)</p>
          `;
        }
        setTimeout(() => closeModal(applyModal), 2000);
      } catch (err) {
        console.error(err);
        if (applyStatus) {
          applyStatus.textContent = 'Something went wrong. Please try again or contact me directly.';
          applyStatus.className = 'form-status error';
          applyStatus.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
      }
    });
  }

}); // end DOMContentLoaded
