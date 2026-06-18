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

  // Fermeture au clic sur l'overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Fermeture avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.-overlay.is-open').forEach(m => close(m));
    }
  });

  // ============================================================
  //  — CV Form
  // ============================================================
  // ============================================================
// CV FORM — Submit
// ============================================================
const CV_WEBHOOK = 'https://n8n.strength-os.tech/webhook/fc310eee-adce-486e-913b-8e5b6e48f24f';

const cvForm        = document.getElementById('cvForm');
const cvSubmitBtn   = document.getElementById('cvSubmitBtn');
const cvBtnText     = document.getElementById('cvBtnText');
const cvBtnSpinner  = document.getElementById('cvBtnSpinner');
const cvFormState   = document.getElementById('cvFormState');
const cvSuccessState = document.getElementById('cvSuccessState');
const cvErrorState  = document.getElementById('cvErrorState');

// --- File input ---
const fileInput   = document.getElementById('cv-file');
const fileDrop    = document.getElementById('fileDrop');
const fileDropUI  = document.getElementById('fileDropUI');
const filePreview = document.getElementById('filePreview');
const fileNameEl  = document.getElementById('fileName');
const removeFile  = document.getElementById('removeFile');

function showFile(file) {
  fileNameEl.textContent = file.name;
  fileDropUI.style.display = 'none';
  filePreview.style.display = 'flex';
  fileDrop.classList.add('has-file');
}

function clearFile() {
  fileInput.value = '';
  fileDropUI.style.display = 'flex';
  filePreview.style.display = 'none';
  fileDrop.classList.remove('has-file');
}

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) showFile(fileInput.files[0]);
});

removeFile.addEventListener('click', clearFile);

// Drag & drop
fileDrop.addEventListener('dragover', (e) => {
  e.preventDefault();
  fileDrop.classList.add('is-dragging');
});
fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('is-dragging'));
fileDrop.addEventListener('drop', (e) => {
  e.preventDefault();
  fileDrop.classList.remove('is-dragging');
  const file = e.dataTransfer.files[0];
  if (file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    showFile(file);
  }
});

// --- Validation ---
function validateCvForm() {
  let valid = true;

  const name = document.getElementById('cv-name');
  const email = document.getElementById('cv-email');
  const position = document.getElementById('cv-position');
  const file = fileInput;

  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

  if (!name.value.trim()) {
    document.getElementById('err-name').textContent = 'Required';
    valid = false;
  }
  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    document.getElementById('err-email').textContent = 'Valid email required';
    valid = false;
  }
  if (!position.value.trim()) {
    document.getElementById('err-position').textContent = 'Required';
    valid = false;
  }
  if (!file.files[0]) {
    document.getElementById('err-file').textContent = 'Please attach your CV';
    valid = false;
  } else if (file.files[0].size > 5 * 1024 * 1024) {
    document.getElementById('err-file').textContent = 'File too large (max 5 MB)';
    valid = false;
  }

  return valid;
}

// --- Submit ---
if (cvForm) {
  cvForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCvForm()) return;

    // Loading state
    cvBtnText.style.display = 'none';
    cvBtnSpinner.style.display = 'inline-block';
    cvSubmitBtn.disabled = true;

    const formData = new FormData();
    formData.append('fullName',    document.getElementById('cv-name').value.trim());
    formData.append('email',       document.getElementById('cv-email').value.trim());
    formData.append('phone',       document.getElementById('cv-phone').value.trim());
    formData.append('location',    document.getElementById('cv-location').value.trim());
    formData.append('position',    document.getElementById('cv-position').value.trim());
    formData.append('subject',     document.getElementById('cv-subject').value);
    formData.append('experience',  document.getElementById('cv-experience').value);
    formData.append('availability',document.getElementById('cv-availability').value);
    formData.append('coverNote',   document.getElementById('cv-note').value.trim());
    formData.append('cv',          fileInput.files[0]);

    try {
      const res = await fetch(CV_WEBHOOK, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Webhook error');

      // Succès
      cvFormState.style.display = 'none';
      cvSuccessState.style.display = 'flex';

    } catch (err) {
      console.error(err);
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
  cv.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(() => {
    cvSuccessState.style.display = 'none';
    cvFormState.style.display = 'block';
    cvForm.reset();
    clearFile();
  }, 300);
});


  // ============================================================
  //  — Job Detail
  // ============================================================
  const job    = document.getElementById('job');
  const closeJobBtn = document.getElementById('closeJob');
  const openApplyBtn = document.getElementById('openApplyForm');

  closeJobBtn?.addEventListener('click', () => close(job));

  // ============================================================
  //  — Apply Form
  // ============================================================
  const apply    = document.getElementById('applyModal');
  const closeApplyBtn = document.getElementById('closeApplyModal');

  closeApplyBtn?.addEventListener('click', () => closeModal(applyModal));

  openApplyBtn?.addEventListener('click', () => {
    const jobTitle = document.getElementById('jobModalTitle').textContent;
    document.getElementById('applyModalTitle').textContent    = `Apply — ${jobTitle}`;
    document.getElementById('applyModalSubtitle').textContent = jobTitle;
    closeModal(jobModal);
    openModal(applyModal);
  });

  // ============================================================
// APPLY FORM — Validation & Submission
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const applyForm = document.getElementById('applyForm');
  const applyModal = document.getElementById('applyModal');
  const closeApplyModal = document.getElementById('closeApplyModal');
  const openApplyForm = document.getElementById('openApplyForm');
  const otherCitiesRow = document.getElementById('otherCitiesRow');
  const fileUpload = document.querySelector('.file-upload');
  const fileInput = document.getElementById('applyCV');
  const formStatus = document.getElementById('formStatus');

  // ---- Open Apply Modal ----
  if (openApplyForm) {
    openApplyForm.addEventListener('click', (e) => {
      e.preventDefault();
      const jobTitle = document.getElementById('jobModalTitle')?.textContent || 'Position';
      document.getElementById('applyModalSubtitle').textContent = `For: ${jobTitle}`;
      applyModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }

  // ---- Close Apply Modal ----
  if (closeApplyModal) {
    closeApplyModal.addEventListener('click', () => {
      applyModal.classList.remove('is-open');
      document.body.style.overflow = '';
      applyForm.reset();
      formStatus.style.display = 'none';
      fileUpload.classList.remove('has-file');
    });
  }

  // ---- Show/Hide "Other Cities" field ----
  document.querySelectorAll('input[name="locations"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const hasOther = Array.from(document.querySelectorAll('input[name="locations"]:checked'))
        .some(cb => cb.value === 'Other');
      otherCitiesRow.style.display = hasOther ? 'grid' : 'none';
    });
  });

        // File Upload Handler
      const fileUpload = document.getElementById('fileUpload');
      const fileInput = document.getElementById('applyCV');

      if (fileUpload && fileInput) {
        // Click to upload
        fileUpload.addEventListener('click', (e) => {
          if (!e.target.closest('.file-upload__remove')) {
            fileInput.click();
          }
        });

        // File selection
        fileInput.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        });

        // Drag and drop
        fileUpload.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          fileUpload.classList.add('is-dragover');
        });

        fileUpload.addEventListener('dragleave', () => {
          fileUpload.classList.remove('is-dragover');
        });

        fileUpload.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          fileUpload.classList.remove('is-dragover');
          if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
          }
        });
      }

      function handleFileSelect(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (!allowedTypes.includes(file.type)) {
          alert('Please upload a PDF, DOC, or DOCX file');
          return;
        }

        if (file.size > maxSize) {
          alert('File size must be less than 5MB');
          return;
        }

        fileInput.files = new DataTransfer().items.add(file).files;
        fileUpload.classList.add('has-file');
        fileUpload.querySelector('.file-upload__content').innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p><strong>${file.name}</strong></p>
          <p class="file-upload__hint">${(file.size / 1024 / 1024).toFixed(2)}MB</p>
          <button type="button" class="file-upload__remove">Remove</button>
        `;
        document.querySelector('.file-upload__remove').addEventListener('click', (e) => {
          e.preventDefault();
          fileInput.value = '';
          fileUpload.classList.remove('has-file');
          fileUpload.querySelector('.file-upload__content').innerHTML = `
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

  // ---- Languages Validation (at least one) ----
  function validateLanguages() {
    const checked = Array.from(document.querySelectorAll('input[name="languages"]:checked')).length > 0;
    const error = document.getElementById('languagesError');
    if (!checked) {
      error.textContent = 'Please select at least one language';
      error.classList.add('show');
      return false;
    } else {
      error.classList.remove('show');
      return true;
    }
  }

  // ---- Locations Validation (at least one) ----
  function validateLocations() {
    const checked = Array.from(document.querySelectorAll('input[name="locations"]:checked')).length > 0;
    const error = document.getElementById('locationsError');
    if (!checked) {
      error.textContent = 'Please select at least one location';
      error.classList.add('show');
      return false;
    } else {
      error.classList.remove('show');
      return true;
    }
  }

  // ---- Form Submission ----
  applyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validation
    if (!validateLanguages() || !validateLocations()) {
      return;
    }

    // Collect form data
    const formData = new FormData(applyForm);

    // Combine languages into string
    const languages = Array.from(document.querySelectorAll('input[name="languages"]:checked'))
      .map(cb => cb.value)
      .join(', ');
    formData.set('languages', languages);

    // Combine locations into string
    const locations = Array.from(document.querySelectorAll('input[name="locations"]:checked'))
      .map(cb => cb.value)
      .join(', ');
    formData.set('locations', locations);

    // Show loading state
    const submitBtn = document.getElementById('applySubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Replace with your actual n8n webhook URL
      const response = await fetch('https://n8n.strength-os.tech/webhook/apply', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        showFormStatus('✓ Application submitted successfully! I will review your profile and contact you within 48 hours.', 'success');
        applyForm.reset();
        fileUpload.classList.remove('has-file');
        setTimeout(() => {
          applyModal.classList.remove('is-open');
          document.body.style.overflow = '';
        }, 2000);
      } else {
        showFormStatus('Something went wrong. Please try again or contact me directly.', 'error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showFormStatus('Network error. Please check your connection and try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // ---- Show Form Status ----
  function showFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

});


  // ============================================================
  // VACANCIES — États d'affichage
  // ============================================================
  const counter = document.getElementById('vacanciesCount');

  function showState(state, count = 0) {
    // Reset tous les états
    ['vacanciesLoading', 'vacanciesEmpty', 'vacanciesError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-visible');
    });

    const grid    = document.getElementById('jobsGrid');
    const filters = document.getElementById('vacanciesFilters');

    grid.style.display    = 'none';
    filters.style.display = 'none';
    counter.className     = 'vacancies__count';
    counter.textContent   = '';

    if (state === 'loading') {
      document.getElementById('vacanciesLoading').classList.add('is-visible');

    } else if (state === 'empty') {
      document.getElementById('vacanciesEmpty').classList.add('is-visible');
      counter.classList.add('is-red');
      counter.textContent = 'No open positions at the moment.';

    } else if (state === 'error') {
      document.getElementById('vacanciesError').classList.add('is-visible');

    } else if (state === 'results') {
      grid.style.display    = 'grid';
      filters.style.display = 'flex';
      counter.classList.add('is-green');
      counter.textContent = `${count} open position${count !== 1 ? 's' : ''}`;
    }
  }

  // ============================================================
  // VACANCIES — Parse Google Sheets gviz JSON
  // ============================================================
  function parseGviz(raw) {
    const json = JSON.parse(
      raw.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)[1]
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
  // VACANCIES — Ouvre le modal JD
  // ============================================================
  function openJobModal(job) {
    document.getElementById('jd-type').textContent    = job.Type    || '';
    document.getElementById('jd-subject').textContent = job.Subject || '';
    document.getElementById('jobModalTitle').textContent = job.Title || 'Position';

    document.querySelector('#jd-location span').textContent = job.Location || '';
    document.querySelector('#jd-salary span').textContent   = job.Salary   || '';
    document.querySelector('#jd-date span').textContent     = job.Start    || job.Date_posted || '';

    document.getElementById('jd-description').innerHTML  = formatJobText(job.Description   || '');
    document.getElementById('jd-requirements').innerHTML = formatJobText(job.Requirements  || '');

    jobModal.dataset.jobTitle    = job.Title    || '';
    jobModal.dataset.jobId       = job.id       || job.ID || '';
    jobModal.dataset.jobSchool   = job.School   || '';
    jobModal.dataset.jobLocation = job.Location || '';

    openModal(jobModal);
  }

  // Formate le texte brut en HTML
  function formatJobText(text) {
    if (!text) return '<p>—</p>';
    if (/<[a-z][\s\S]*>/i.test(text)) return text;

    const lines = text.split('\n').filter(l => l.trim());
    const isList = lines.every(l => /^[-•*]/.test(l.trim()));

    if (isList) {
      const items = lines
        .map(l => `<li>${l.replace(/^[-•*]\s*/, '').trim()}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    }

    return lines.map(l => `<p>${l.trim()}</p>`).join('');
  }

  // ============================================================
  // VACANCIES — Filtres
  // ============================================================
  let allJobs = [];

  function applyFilters() {
    const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
    const type   =  document.getElementById('filterType')?.value   || '';

    const filtered = allJobs.filter(job => {
      const matchSearch =
        !search ||
        (job.Title    || '').toLowerCase().includes(search) ||
        (job.School   || '').toLowerCase().includes(search) ||
        (job.Location || '').toLowerCase().includes(search) ||
        (job.Subject  || '').toLowerCase().includes(search);

      const matchType = !type || job.Type === type;

      return matchSearch && matchType;
    });

    renderCards(filtered);

    counter.textContent = `${filtered.length} open position${filtered.length !== 1 ? 's' : ''}`;
    counter.className   = `vacancies__count ${filtered.length > 0 ? 'is-green' : 'is-red'}`;
  }

  document.getElementById('filterSearch')?.addEventListener('input',  applyFilters);
  document.getElementById('filterType')?.addEventListener('change', applyFilters);

  // ============================================================
  // VACANCIES — Fetch Google Sheet
  // ============================================================
  async function loadJobs() {
    showState('loading');
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw = await res.text();
      allJobs   = parseGviz(raw).filter(job => job.Title && job.Status !== 'inactive');

      if (allJobs.length === 0) {
        showState('empty');
      } else {
        showState('results', allJobs.length);
        renderCards(allJobs);
      }
    } catch (err) {
      console.error('[VS Recruitment] Failed to load jobs:', err);
      showState('error');
    }
  }

  document.getElementById('retryBtn')?.addEventListener('click', loadJobs);

  // Lance le chargement
  loadJobs();

}); // fin DOMContentLoaded
