// ============================================================
// jobs.js — Parsing CSV et utilitaires
// ============================================================

/**
 * Parse une string CSV en array d'objets
 * @param {string} csv - Le texte CSV complet
 * @returns {Array} Array d'objets avec les colonnes comme clés
 */
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return [];

  // Première ligne = headers
  const headers = lines[0]
    .split('\t') // Split par tabulation (Google Sheets export)
    .map(h => h.trim());

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t').map(v => v.trim());
    const obj = {};

    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });

    result.push(obj);
  }

  return result;
}

/**
 * Formate le texte pour afficher description/requirements
 * Détecte si c'est du HTML, une liste, ou du texte simple
 * @param {string} text - Le texte à formater
 * @returns {string} HTML formaté
 */
function formatJobText(text) {
  if (!text || text.trim() === '') {
    return '<p>—</p>';
  }

  // Si c'est déjà du HTML, retourne tel quel
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  const lines = text.split('\n').filter(l => l.trim());

  // Détecte si c'est une liste (commence par - ou •)
  const isList = lines.every(l => /^[-•*]/.test(l.trim()));

  if (isList) {
    const items = lines
      .map(l => `<li>${l.replace(/^[-•*]\s*/, '').trim()}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  }

  // Sinon, chaque ligne = paragraphe
  return lines.map(l => `<p>${l.trim()}</p>`).join('');
}

/**
 * Génère un slug unique depuis le titre du job
 * @param {string} title - Le titre du job
 * @param {number} index - L'index du job dans la liste
 * @returns {string} Un slug unique
 */
function generateJobSlug(title, index) {
  return `job-${index}-${title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}`;
}

/**
 * Formate une date en format lisible
 * @param {string} dateStr - La date à formater (format YYYY-MM-DD)
 * @returns {string} Date formatée (e.g., "15 Jun 2026")
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Recently posted';

  try {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (err) {
    return 'Recently posted';
  }
}
