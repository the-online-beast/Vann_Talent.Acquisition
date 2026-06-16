// ============================================================
// NAVBAR — Burger menu
// ============================================================
const burgerBtn   = document.getElementById('burgerBtn');
const mobileMenu  = document.getElementById('mobileMenu');

burgerBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('is-open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
  });
});

// ============================================================
// MODAL — CV Form
// ============================================================
const cvModal     = document.getElementById('cvModal');
const openCvForm  = document.getElementById('openCvForm');
const closeCvModal = document.getElementById('closeCvModal');

openCvForm.addEventListener('click', (e) => {
  e.preventDefault();
  cvModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
});

closeCvModal.addEventListener('click', () => {
  cvModal.classList.remove('is-open');
  document.body.style.overflow = '';
});

// Close on overlay click
cvModal.addEventListener('click', (e) => {
  if (e.target === cvModal) {
    cvModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cvModal.classList.contains('is-open')) {
    cvModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
});

// ============================================================
// VACANCIES — State helpers
// ============================================================
function showState(state, count = 0) {
  // Reset all
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

  

