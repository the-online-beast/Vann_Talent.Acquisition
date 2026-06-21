document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // UTILS
  // ============================================================
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function formatText(raw) {
    if (!raw) return '';
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const isList = lines.every(l => /^[-•*]/.test(l));
    if (isList) {
      return '<ul>' + lines.map(l => `<li>${escapeHtml(l.replace(/^[-•*]\s*/, ''))}</li>`).join('') + '</ul>';
    }
    return lines.map(l => `<p>${escapeHtml(l)}</p>`).join('');
  }

  // ============================================================
  // BURGER MENU
  // ============================================================
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  burgerBtn?.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
  });

  // ============================================================
  // MODAL HELPERS
  // ============================================================
  function openModal(el) {
    el.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeModal(el) {
    el.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay);
    });
  });
// ============================================================
// CSV PARSER — version robuste
// ============================================================
function parseCSV(text) {
  // Nettoie les retours chariot Windows (\r\n)
  const lines = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  function parseLine(line) {
    const cols = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    return cols;
  }

  const headers = parseLine(lines[0]);
  console.log('📋 CSV Headers détectés:', headers); // DEBUG

  const rows = lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      // Nettoyage des clés (supprime BOM, espaces, caractères invisibles)
      const cleanKey = h.replace(/^\uFEFF/, '').replace(/\s+/g, ' ').trim();
      obj[cleanKey] = values[i] || '';
    });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ''));

  console.log('📊 Tous les jobs parsés:', rows); // DEBUG
  return rows;
}

// ============================================================
// LOAD JOBS — version corrigée
// ============================================================
let allJobs = [];

async function loadJobs() {
  const grid    = document.getElementById('jobsGrid');
  const loading = document.getElementById('jobsLoading');
  const empty   = document.getElementById('jobsEmpty');
  const error   = document.getElementById('jobsError'); // si tu as un bloc erreur

  if (loading) loading.style.display = 'block';
  if (empty)   empty.style.display   = 'none';
  if (grid)    grid.innerHTML         = '';

  try {
    // Cache-bust pour éviter les problèmes de cache GitHub
    const url = SHEET_URL + '&nocache=' + Date.now();
    console.log('🔄 Fetching:', url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    console.log('📄 CSV brut (100 premiers chars):', text.substring(0, 100));

    const jobs = parseCSV(text);
    console.log('✅ Jobs avant filtre status:', jobs.length, jobs);

    // Filtre : uniquement les offres "active"
    // Correction : trim() + toLowerCase() + gestion valeur vide
    allJobs = jobs.filter(j => {
      const status = (j['Status'] || j['status'] || 'active').trim().toLowerCase();
      console.log(`  → Job "${j['Job title']}" status: "${status}"`);
      return status === 'active';
    });

    console.log('✅ Jobs actifs:', allJobs.length);

    if (loading) loading.style.display = 'none';

    if (!allJobs.length) {
      if (empty) empty.style.display = 'block';
      return;
    }

    populateTypeFilter(allJobs);
    renderCards(allJobs);

  } catch (err) {
    console.error('❌ Erreur loadJobs:', err);
    if (loading) loading.style.display = 'none';

    // Affiche l'erreur à l'utilisateur
    const errorEl = document.getElementById('jobsError');
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.innerHTML = `
        Could not load vacancies. 
        <br><small style="color:#999">${err.message}</small>
        <br><button id="retryBtn" onclick="loadJobs()">Retry</button>
      `;
    }
  }
}

  // ============================================================
  // FILTERS
  // ============================================================
  document.getElementById('filterSearch')?.addEventListener('input', applyFilters);
  document.getElementById('filterType')?.addEventListener('change', applyFilters);

  function applyFilters() {
    const search = (document.getElementById('filterSearch')?.value || '').toLowerCase();
    const type   = (document.getElementById('filterType')?.value   || '').toLowerCase();
    const filtered = allJobs.filter(job => {
      const haystack = [
        job['Job title'], job['Establishment'], job['City'], job['Short description']
      ].join(' ').toLowerCase();
      const matchSearch = !search || haystack.includes(search);
      const matchType   = !type   || (job['Contract type'] || '').toLowerCase() === type;
      return matchSearch && matchType;
    });
    renderCards(filtered);
  }

  document.getElementById('retryBtn')?.addEventListener('click', loadJobs);
  loadJobs();

  // ============================================================
  // JOB DETAIL MODAL
  // ============================================================
  const jobModal = document.getElementById('jobModal');

  function openJobDetail(idx) {
    const job      = allJobs[idx];
    const title    = job['Job title']           || '';
    const school   = job['Establishment']       || '';
    const city     = job['City']               || '';
    const district = job['District']           || '';
    const type     = job['Contract type']       || '';
    const salary   = job['Annual base salary'] || '';
    const longDesc = job['Long description']    || '';
    const reqs     = job['Requirements']        || '';

    document.getElementById('jd-title').textContent        = title;
    document.getElementById('jd-type').textContent         = type;
    document.getElementById('jd-location-text').textContent = city + (district ? ` · ${district}` : '');
    document.getElementById('jd-salary-text').textContent  = salary;
    document.getElementById('jd-school').textContent       = school;
    document.getElementById('jd-district').textContent     = district;
    document.getElementById('jd-description').innerHTML    = formatText(longDesc);
    document.getElementById('jd-requirements').innerHTML   = formatText(reqs);

    openModal(jobModal);
  }

  document.getElementById('closeJobModal')?.addEventListener('click', () => closeModal(jobModal));

  document.getElementById('jd-applyBtn')?.addEventListener('click', () => {
    closeModal(jobModal);
    openModal(applyModal);
  });

  // ============================================================
  // APPLY MODAL — open triggers
  // ============================================================
  const applyModal = document.getElementById('applyModal');

  ['heroOpenForm', 'aboutOpenForm', 'vacanciesOpenForm'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => {
      e.preventDefault();
      openModal(applyModal);
    });
  });

  document.getElementById('closeApplyModal')?.addEventListener('click', () => closeModal(applyModal));

  // ============================================================
  // FILE UPLOAD
  // ============================================================
  const fileInput    = document.getElementById('f-cv');
  const fileDropZone = document.getElementById('fileDropZone');
  const fileContent  = document.getElementById('fileDropContent');
  const filePreview  = document.getElementById('filePreview');
  const filePreviewName = document.getElementById('filePreviewName');
  const fileRemoveBtn   = document.getElementById('fileRemoveBtn');

  function showFile(file) {
    filePreviewName.textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    fileContent.style.display  = 'none';
    filePreview.style.display  = 'flex';
  }

  function clearFile() {
    fileInput.value            = '';
    fileContent.style.display  = 'flex';
    filePreview.style.display  = 'none';
  }

  fileInput?.addEventListener('change', () => {
    if (fileInput.files[0]) showFile(fileInput.files[0]);
  });

  fileDropZone?.addEventListener('click', e => {
    if (e.target === fileDropZone || fileContent.contains(e.target)) fileInput.click();
  });

  fileDropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    fileDropZone.classList.add('is-dragging');
  });
  fileDropZone?.addEventListener('dragleave', () => fileDropZone.classList.remove('is-dragging'));
  fileDropZone?.addEventListener('drop', e => {
    e.preventDefault();
    fileDropZone.classList.remove('is-dragging');
    const file = e.dataTransfer.files[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      showFile(file);
    }
  });

  fileRemoveBtn?.addEventListener('click', clearFile);

  // ============================================================
  // OTHER LOCATION CHECKBOX
  // ============================================================
  document.getElementById('loc-other-cb')?.addEventListener('change', function () {
    document.getElementById('loc-other-row').style.display = this.checked ? 'block' : 'none';
  });

  // ============================================================
  // FORM SUBMIT
  // ============================================================
  const applyForm      = document.getElementById('applyForm');
  const applyFormState = document.getElementById('applyFormState');
  const applySuccess   = document.getElementById('applySuccess');
  const applyError     = document.getElementById('applyError');
  const submitBtn      = document.getElementById('applySubmitBtn');
  const btnText        = document.getElementById('applyBtnText');
  const btnSpinner     = document.getElementById('applyBtnSpinner');

  function setLoading(on) {
    submitBtn.disabled     = on;
    btnText.style.display  = on ? 'none'   : 'inline';
    btnSpinner.style.display = on ? 'inline-block' : 'none';
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    // Required text/select fields
    ['f-name','f-email','f-phone','f-jobfunction','f-experience','f-qualification','f-skills','f-salary'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.classList.add('input-error');
        valid = false;
      } else {
        el.classList.remove('input-error');
      }
    });

    // Languages
    const langs = document.querySelectorAll('input[name="languages"]:checked');
    if (!langs.length) {
      showError('err-languages', 'Please select at least one language.');
      valid = false;
    }

    // Locations
    const locs = document.querySelectorAll('input[name="locations"]:checked');
    if (!locs.length) {
      showError('err-locations', 'Please select at least one preferred location.');
      valid = false;
    }

    // CV file
    if (!fileInput?.files[0]) {
      showError('err-cv', 'Please upload your CV.');
      valid = false;
    }

    return valid;
  }

  applyForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Build locations value (replace "Other" with custom text if filled)
    const locValues = Array.from(document.querySelectorAll('input[name="locations"]:checked'))
      .map(cb => {
        if (cb.value === 'Other') {
          const other = document.getElementById('f-loc-other')?.value.trim();
          return other || 'Other';
        }
        return cb.value;
      });

    const langValues = Array.from(document.querySelectorAll('input[name="languages"]:checked'))
      .map(cb => cb.value);

    const formData = new FormData();
    formData.append('Full Name',                       document.getElementById('f-name').value.trim());
    formData.append('Email',                           document.getElementById('f-email').value.trim());
    formData.append('Phone Number',                    document.getElementById('f-phone').value.trim());
    formData.append('Subject / Specialisation',        document.getElementById('f-subject').value.trim());
    formData.append('Job Function',                    document.getElementById('f-jobfunction').value);
    formData.append('Targeted roles',                  document.getElementById('f-targeted').value.trim());
    formData.append('Years of Relevant Experience',    document.getElementById('f-experience').value);
    formData.append('Highest Qualification',           document.getElementById('f-qualification').value);
    formData.append('Key Skills & Competencies',       document.getElementById('f-skills').value.trim());
    formData.append('Profesionnal Languages',          langValues.join(', '));
    formData.append('Expected Annual Salary (Gross)',  document.getElementById('f-salary').value.trim());
    formData.append('Preferred Locations',             locValues.join(', '));
    formData.append('Additional Notes',                document.getElementById('f-notes').value.trim());
    if (fileInput.files[0]) {
      formData.append('CV Upload', fileInput.files[0]);
    }

    try {
      const res = await fetch(APPLY_WEBHOOK, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Server error');
      applyFormState.style.display = 'none';
      applySuccess.style.display   = 'block';
    } catch (err) {
      applyFormState.style.display = 'none';
      applyError.style.display     = 'block';
    } finally {
      setLoading(false);
    }
  });

  document.getElementById('applySuccessClose')?.addEventListener('click', () => {
    closeModal(applyModal);
    setTimeout(() => {
      applyFormState.style.display = 'block';
      applySuccess.style.display   = 'none';
      applyForm.reset();
      clearFile();
      clearErrors();
    }, 300);
  });

  document.getElementById('applyRetryBtn')?.addEventListener('click', () => {
    applyError.style.display     = 'none';
    applyFormState.style.display = 'block';
  });

}); // end DOMContentLoaded
