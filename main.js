// ============================================================
// main.js — Logique complète du site
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Vérifie que config.js est chargé
  if (typeof CONFIG === 'undefined') {
    console.error('❌ config.js not loaded! Make sure it\'s included before main.js');
    return;
  }

  // ============================================================
  // NAVBAR — Burger menu
  // ============================================================
  const burgerBtn = document.getElementById('burgerBtn');
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

  // Fermeture au clic sur l'overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // ============================================================
  // CV FORM MODAL
  // ============================================================
  const cvModal = document.getElementById('cvModal');
  const cvForm = document.getElementById('cvForm');
  const cvFormState = document.getElementById('cvFormState');
  const cvSuccessState = document.getElementById('cvSuccessState');
  const cvErrorState = document.getElementById('cvErrorState');
  const cvSubmitBtn = document.getElementById('cvSubmitBtn');
  const cvBtnText = document.getElementById('cvBtnText');
  const cvBtnSpinner = document.getElementById('cvBtnSpinner');
  const openCvBtn = document.getElementById('openCvModal');
  const closeCvBtn = document.getElementById('closeCvModal');
  const cvFileInput = document.getElementById('cvFileInput');
  const cvFileLabel = document.getElementById('cvFileLabel');
  const cvFileUpload = document.getElementById('cvFileUpload');

  if (openCvBtn) {
    openCvBtn.addEventListener('click', () => openModal(cvModal));
  }

  if (closeCvBtn) {
    closeCvBtn.addEventListener('click', () => closeModal(cvModal));
  }

  // File upload drag & drop
  if (cvFileLabel) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      cvFileLabel.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    cvFileLabel.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) cvFileInput.files = e.dataTransfer.files;
      updateFileDisplay(file, cvFileUpload, cvFileInput);
    });

    cvFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      updateFileDisplay(file, cvFileUpload, cvFileInput);
    });
  }

  function updateFileDisplay(file, fileUploadEl, fileInputEl) {
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('document')) {
      alert('Please upload a PDF or Word document');
      fileInputEl.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File must be smaller than 5MB');
      fileInputEl.value = '';
      return;
    }

    const label = fileUploadEl.querySelector('.file-upload__label');
    label.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <p><strong>${file.name}</strong></p>
      <p class="file-upload__hint">${(file.size / 1024 / 1024).toFixed(2)}MB</p>
      <button type="button" class="file-upload__remove">Remove</button>
    `;

    label.querySelector('.file-upload__remove').addEventListener('click', (e) => {
      e.preventDefault();
      fileInputEl.value = '';
      label.innerHTML = `
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

  // CV Form submission
  if (cvForm) {
    cvForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validation
      const name = document.getElementById('cv-name').value.trim();
      const email = document.getElementById('cv-email').value.trim();
      const phone = document.getElementById('cv-phone').value.trim();
      const position = document.getElementById('cv-position').value.trim();
      const subject = document.getElementById('cv-subject').value.trim();
      const experience = document.getElementById('cv-experience').value;
      const availability = document.getElementById('cv-availability').value;
      const file = cvFileInput.files[0];

      if (!name || !email || !phone || !position || !subject || !experience || !availability || !file) {
        alert('Please fill all required fields');
        return;
      }

      // Prépare FormData pour n8n
      const formData = new FormData();
      formData.append('fullName', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('location', document.getElementById('cv-location').value.trim());
      formData.append('position', position);
      formData.append('subject', subject);
      formData.append('experience', experience);
      formData.append('availability', availability);
      formData.append('coverNote', document.getElementById('cv-note').value.trim());
      formData.append('cv', file);

      // Spinner
      cvBtnText.style.display = 'none';
      cvBtnSpinner.style.display = 'inline-block';
      cvSubmitBtn.disabled = true;

      try {
        const res = await fetch(CONFIG.WEBHOOK_CV_FORM, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Succès
        cvFormState.style.display = 'none';
        cvSuccessState.style.display = 'flex';

      } catch (err) {
        console.error('CV submission error:', err);
        cvFormState.style.display = 'none';
        cvErrorState.style.display = 'flex';
      } finally {
        cvBtnText.style.display = 'inline';
        cvBtnSpinner.style.display = 'none';
        cvSubmitBtn.disabled = false;
      }
    });
  }

  // Retry
  document.getElementById('cvRetryBtn')?.addEventListener('click', () => {
    cvErrorState.style.display = 'none';
    cvFormState.style.display = 'block';
  });

  // Success close
  document.getElementById('cvSuccessClose')?.addEventListener('click', () => {
    closeModal(cvModal);
    setTimeout(() => {
      cvSuccessState.style.display = 'none';
      cvFormState.style.display = 'block';
      cvForm.reset();
      cvFileLabel.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p><strong>Click to upload</strong> or drag and drop</p>
        <p class="file-upload__hint">PDF, DOC or DOCX (max 5MB)</p>
      `;
    }, 300);
  });

  // ============================================================
  // JOB DETAIL & APPLY FORM
  // ============================================================
  const jobModal = document.getElementById('jobModal');
  const applyModal = document.getElementById('applyModal');
  const applyForm = document.getElementById('applyForm');
  const applyFileInput = document.getElementById('applyFileInput');
  const applyFileLabel = document.getElementById('applyFileLabel');
  const applyFileUpload = document.getElementById('applyFileUpload');

  const closeJobBtn = document.getElementById('closeJobModal');
  const closeApplyBtn = document.getElementById('closeApplyModal');
  const openApplyBtn = document.getElementById('openApplyForm');
  const applySubmitBtn = document.getElementById('applySubmitBtn');
  const applyBtnText = document.getElementById('applyBtnText');
  const applyBtnSpinner = document.getElementById('applyBtnSpinner');

  let currentJobData = null;

  if (closeJobBtn) {
    closeJobBtn.addEventListener('click', () => closeModal(jobModal));
  }

  if (closeApplyBtn) {
    closeApplyBtn.addEventListener('click', () => {
      closeModal(applyModal);
      applyForm?.reset();
      applyFileLabel.innerHTML = `
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

  if (openApplyBtn) {
    openApplyBtn.addEventListener('click', () => {
      closeModal(jobModal);
      openModal(applyModal);
    });
  }

  // File upload pour apply form
  if (applyFileLabel) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      applyFileLabel.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    applyFileLabel.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) applyFileInput.files = e.dataTransfer.files;
      updateFileDisplay(file, applyFileUpload, applyFileInput);
    });

    applyFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      updateFileDisplay(file, applyFileUpload, applyFileInput);
    });
  }

  // Toggle "Other cities" input si "Other" est sélectionné
  const otherCitiesRow = document.getElementById('otherCitiesRow');
  document.querySelectorAll('input[name="locations"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const hasOther = Array.from(document.querySelectorAll('input[name="locations"]:checked'))
        .some(cb => cb.value === 'Other');
      if (otherCitiesRow) {
        otherCitiesRow.style.display = hasOther ? 'block' : 'none';
      }
    });
  });

  // Validation des languages
  function validateLanguages() {
    const checked = Array.from(document.querySelectorAll('input[name="languages"]:checked')).length > 0;
    const error = document.getElementById('languagesError');
    if (!checked && error) {
      error.textContent = 'Please select at least one language';
      error.classList.add('show');
      return false;
    } else if (error) {
      error.classList.remove('show');
    }
    return true;
  }

  // Validation des locations
  function validateLocations() {
    const checked = Array.from(document.querySelectorAll('input[name="locations"]:checked')).length > 0;
    const error = document.getElementById('locationsError');
    if (!checked && error) {
      error.textContent = 'Please select at least one location';
      error.classList.add('show');
      return false;
    } else if (error) {
      error.classList.remove('show');
    }
    return true;
  }

  // Apply Form submission
  if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validation
      if (!validateLanguages() || !validateLocations()) {
        return;
      }

      const name = document.getElementById('applyName').value.trim();
      const email = document.getElementById('applyEmail').value.trim();
      const phone = document.getElementById('applyPhone').value.trim();
      const location = document.getElementById('applyLocation').value.trim();
      const subject = document.getElementById('applySubject').value;
      const experience = document.getElementById('applyExperience').value;
      const qualification = document.getElementById('applyQualification').value;
      const salary = document.getElementById('applySalary').value;
      const file = applyFileInput.files[0];

      if (!name || !email || !phone || !location || !subject || !experience || !qualification || !salary || !file) {
        alert('Please fill all required fields');
        return;
      }

      // Collect languages
      const languages = Array.from(document.querySelectorAll('input[name="languages"]:checked'))
        .map(cb => cb.value)
        .join(', ');

      // Collect locations
      const locations = Array.from(document.querySelectorAll('input[name="locations"]:checked'))
        .map(cb => cb.value)
        .join(', ');

      const otherCities = document.getElementById('otherCities')?.value.trim() || '';

      // Prépare FormData pour n8n
      const formData = new FormData();
      formData.append('fullName', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('location', location);
      formData.append('subject', subject);
      formData.append('experience', experience);
      formData.append('qualification', qualification);
      formData.append('languages', languages);
      formData.append('locations', locations);
      formData.append('otherCities', otherCities);
      formData.append('skills', document.getElementById('applySkills').value.trim());
      formData.append('salary', salary);
      formData.append('notes', document.getElementById('applyNotes').value.trim());
      formData.append('cv', file);
      
      // Ajoute les infos du job si disponibles
      if (currentJobData) {
        formData.append('jobTitle', currentJobData.Title || '');
        formData.append('jobLocation', currentJobData.City || '');
      }

      // Spinner
      applyBtnText.style.display = 'none';
      applyBtnSpinner.style.display = 'inline-block';
      applySubmitBtn.disabled = true;

      try {
        const res = await fetch(CONFIG.WEBHOOK_JOB_APPLICATION, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Succès
        alert('Application submitted successfully! You\'ll hear from me soon.');
        closeModal(applyModal);
        applyForm.reset();

      } catch (err) {
        console.error('Application submission error:', err);
        alert('Failed to submit application. Please try again.');
      } finally {
        applyBtnText.style.display = 'inline';
        applyBtnSpinner.style.display = 'none';
        applySubmitBtn.disabled = false;
      }
    });
  }

  // ============================================================
  // VACANCIES — Chargement et affichage des jobs
  // ============================================================
  const counter = document.getElementById('vacanciesCount');
  let allJobs = [];

  function showState(state, count = 0) {
    const grid = document.getElementById('jobsGrid');
    const filters = document.getElementById('vacanciesFilters');

    if (grid) grid.style.display = 'none';
    if (filters) filters.style.display = 'none';
    if (counter) counter.className = 'vacancies__count';

    document.querySelectorAll('.vacancies__state').forEach(el => {
      el.classList.remove('is-visible');
    });

    if (state === 'loading') {
      const loading = document.getElementById('vacanciesLoading');
      if (loading) loading.classList.add('is-visible');
    } else if (state === 'empty') {
      const empty = document.getElementById('vacanciesEmpty');
      if (empty) empty.classList.add('is-visible');
    } else if (state === 'error') {
      const error = document.getElementById('vacanciesError');
      if (error) error.classList.add('is-visible');
    } else if (state === 'results') {
      if (grid) grid.style.display = 'grid';
      if (filters) filters.style.display = 'flex';
      if (counter) {
        counter.classList.add('is-green');
        counter.textContent = `${count} open position${count !== 1 ? 's' : ''}`;
      }
    }
  }

  function renderCards(jobs) {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    grid.innerHTML = jobs.map((job, idx) => {
      const slug = generateJobSlug(job.Title, idx);
      return `
        <div class="job-card" data-slug="${slug}" data-index="${idx}">
          <div class="job-card__top">
            <div>
              <span class="job-tag">${job['Job Type'] || 'Position'}</span>
            </div>
          </div>
          <h3 class="job-card__title">${job.Title || 'Untitled'}</h3>
          <p class="job-card__school">${job.School || ''}</p>
          <div class="job-card__meta">
            <span>📍 ${job.City || 'Location TBA'}</span>
            ${job['Annual base salary'] ? `<span>💰 ${job['Annual base salary']}</span>` : ''}
          </div>
          <p class="job-card__excerpt">${job['Short Description'] || ''}</p>
          <button class="btn btn--outline btn--sm" data-index="${idx}">View Details</button>
        </div>
      `;
    }).join('');

    // Event listeners pour les cards
    grid.querySelectorAll('.btn--outline').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        showJobDetail(jobs[idx]);
      });
    });
  }

  function showJobDetail(job) {
    currentJobData = job;

    document.getElementById('jobModalTitle').textContent = job.Title || '';
    document.getElementById('jd-type').textContent = job['Job Type'] || '';
    document.getElementById('jd-subject').textContent = job['Subject'] || '';
    document.getElementById('jd-location').querySelector('span').textContent = `${job.City || 'TBA'}, ${job.District || ''}`;
    document.getElementById('jd-salary').querySelector('span').textContent = job['Annual base salary'] || 'Negotiable';
    document.getElementById('jd-date').querySelector('span').textContent = formatDate(job['Date Posted'] || '');

    document.getElementById('jd-description').innerHTML = formatJobText(job['Long Description'] || '');
    document.getElementById('jd-requirements').innerHTML = formatJobText(job.Requirements || '');

    openModal(jobModal);
  }

  // Filters
  function applyFilters() {
    const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
    const type = document.getElementById('filterType')?.value || '';

    const filtered = allJobs.filter(job => {
      const matchSearch =
        !search ||
        (job.Title || '').toLowerCase().includes(search) ||
        (job.School || '').toLowerCase().includes(search) ||
        (job.City || '').toLowerCase().includes(search);

      const matchType = !type || job['Job Type'] === type;

      return matchSearch && matchType;
    });

    renderCards(filtered);

    if (counter) {
      counter.textContent = `${filtered.length} open position${filtered.length !== 1 ? 's' : ''}`;
      counter.className = `vacancies__count ${filtered.length > 0 ? 'is-green' : 'is-red'}`;
    }
  }

  document.getElementById('filterSearch')?.addEventListener('input', applyFilters);
  document.getElementById('filterType')?.addEventListener('change', applyFilters);

  // Load jobs from Google Sheet
  async function loadJobs() {
    showState('loading');
    try {
      const res = await fetch(CONFIG.SHEET_JOBS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const csv = await res.text();
      allJobs = parseCSV(csv).filter(job => job.Title && job.Title.trim() !== '');

      if (allJobs.length === 0) {
        showState('empty');
      } else {
        showState('results', allJobs.length);
        renderCards(allJobs);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
      showState('error');
    }
  }

  document.getElementById('retryBtn')?.addEventListener('click', loadJobs);

  // Load jobs on page load
  loadJobs();

}); // fin DOMContentLoaded
