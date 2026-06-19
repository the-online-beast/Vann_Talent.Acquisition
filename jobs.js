// ============================================================
// CONFIGURATION — Google Sheets & Webhooks
//
// HOW TO UPDATE:
//   1. SHEET_VACANCIES_URL  → Publish your DB_Vacancies Google Sheet
//      as CSV: File → Share → Publish to web → Entire document → CSV
//      Then paste the exported CSV URL here.
//
//   2. SHEET_CANDIDATES_URL → (Reference only, not used on frontend)
//      The DB_passive_TA Google Sheet URL for n8n backend reference.
//
//   3. CV_WEBHOOK           → n8n webhook URL for passive CV submissions.
//      Leave empty ('') if not configured yet.
//
//   4. APPLY_WEBHOOK        → n8n webhook URL for job application forms.
//      Leave empty ('') if not configured yet.
//
//   5. DRIVE_FOLDER         → Google Drive folder ID for CV uploads.
//      The ID is the long string in the Drive folder URL.
//      Leave empty ('') if not configured yet.
// ============================================================

const SHEET_VACANCIES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRkoXsy6784kZL208ovB7oJojrLH2hwXuEysJ9ldNB019THeB6oGHTgNHE5gVUXv5SLVYfH-KPr24o/pub?output=csv';

const SHEET_CANDIDATES_URL = 'https://docs.google.com/spreadsheets/d/1EdzEcgwHDERfaIEVMmEn9XOPTkKDZA_gE01iAoLUsBE/edit?gid=0#gid=0';

const CV_WEBHOOK    = 'https://n8n.strength-os.tech/webhook/cv-submit';
const APPLY_WEBHOOK = 'https://n8n.strength-os.tech/webhook/apply';
const DRIVE_FOLDER  = 'https://drive.google.com/drive/folders/1Kbw5R-BmeCH9QvbeewyZYnrcpjKU5C0b';
