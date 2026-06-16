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
