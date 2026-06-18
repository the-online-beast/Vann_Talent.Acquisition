// ============================================================
// config.js — Configuration centralisée de tous les liens
// ============================================================
// À modifier UNIQUEMENT ICI si tu changes les Google Sheets
// ou les webhooks n8n

// GOOGLE SHEETS — URLs publiées en CSV
const CONFIG = {
  // Sheet des OFFRES D'EMPLOI (à afficher publiquement)
  SHEET_JOBS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUhMgmCGpq1KM4-_Aig--5Vc1qdBctYkS3huaY_yw3hcs3q5oEJ7gKXsx1aIPCFtR13d7AguEdKeHN/pub?output=csv',

  // Sheet des CANDIDATURES PASSIVES (n'est PAS publié, modifié par n8n)
  // → On ne fetch pas depuis le frontend, c'est n8n qui gère
  // SHEET_CANDIDATES: 'https://docs.google.com/spreadsheets/d/1ZPuAG5ymp1SD_GcKRias41eynwzdfS6MNdGV6BrNSHI/edit?gid=0#gid=0',

  // DOSSIER DRIVE pour les CVs
  DRIVE_FOLDER_CVS: 'Vann_TA_CVs', // Le nom du dossier (n8n gère l'upload automatiquement)

  // WEBHOOKS N8N
  WEBHOOK_CV_FORM: 'https://hook.n8n.cloud/webhook/vann-cv-passive', // À remplacer par ton vrai webhook
  WEBHOOK_JOB_APPLICATION: 'https://hook.n8n.cloud/webhook/vann-job-apply', // À remplacer par ton vrai webhook

  // WHATSAPP (paramétré dans n8n, juste à titre informatif)
  WHATSAPP_VANN: '+60 123456789', // Le numéro de Vann (utilisé par n8n)
};

// Export pour utilisation dans main.js et jobs.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
