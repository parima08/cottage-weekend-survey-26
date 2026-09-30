const ALLOWED_FIELDS = [
  'name',
  'fridayDeparture',
  'weekendEnergy',
  'rhythm',
  'formatPreference',
  'formatChange',
  'activities',
  'otherActivities',
  'structure',
  'vachanPreference',
  'accessNeeds',
  'openIdeas',
  'website',
  'submittedAt'
];

const HEADERS = [
  'serverTimestamp',
  'name',
  'fridayDeparture',
  'weekendEnergy',
  'rhythm',
  'formatPreference',
  'formatChange',
  'activities',
  'otherActivities',
  'structure',
  'vachanPreference',
  'accessNeeds',
  'openIdeas',
  'submittedAt'
];

const MAX_LENGTHS = {
  name: 120,
  fridayDeparture: 120,
  weekendEnergy: 80,
  rhythm: 120,
  formatPreference: 140,
  formatChange: 1000,
  otherActivities: 1000,
  structure: 80,
  vachanPreference: 140,
  accessNeeds: 1200,
  openIdeas: 1500,
  website: 0,
  submittedAt: 80
};

const MAX_ACTIVITIES = 20;
const MAX_ACTIVITY_LENGTH = 120;

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (!raw) return jsonResponse({ ok: false, error: 'Missing request body.' });

    const payload = JSON.parse(raw);
    validatePayload(payload);

    const lock = LockService.getDocumentLock();
    lock.waitLock(10000);
    try {
      const sheet = getResponseSheet_();
      ensureHeaders_(sheet);
      sheet.appendRow(HEADERS.map((header) => {
        if (header === 'serverTimestamp') return new Date();
        if (header === 'activities') return asPlainText_((payload.activities || []).join(', '));
        return asPlainText_(payload[header] || '');
      }));
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message || 'Submission failed.' });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: 'Cottage Weekend survey endpoint is ready.' });
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid payload.');
  }

  Object.keys(payload).forEach((field) => {
    if (ALLOWED_FIELDS.indexOf(field) === -1) {
      throw new Error('Unexpected field: ' + field);
    }
  });

  if (String(payload.website || '').trim() !== '') {
    throw new Error('Spam rejected.');
  }

  ['name', 'fridayDeparture', 'weekendEnergy', 'rhythm', 'formatPreference', 'structure', 'vachanPreference'].forEach((field) => {
    if (!String(payload[field] || '').trim()) {
      throw new Error('Missing required field: ' + field);
    }
  });

  Object.keys(MAX_LENGTHS).forEach((field) => {
    const value = String(payload[field] || '');
    if (value.length > MAX_LENGTHS[field]) {
      throw new Error('Field is too long: ' + field);
    }
  });

  if (!Array.isArray(payload.activities)) {
    throw new Error('Activities must be a list.');
  }
  if (payload.activities.length > MAX_ACTIVITIES) {
    throw new Error('Too many activities.');
  }
  payload.activities.forEach((activity) => {
    if (typeof activity !== 'string' || activity.length > MAX_ACTIVITY_LENGTH) {
      throw new Error('Invalid activity value.');
    }
  });
}

function getResponseSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Responses');
  if (!sheet) sheet = spreadsheet.insertSheet('Responses');
  return sheet;
}

function ensureHeaders_(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = current.some((value) => String(value || '').trim() !== '');
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  const mismatch = HEADERS.some((header, index) => current[index] !== header);
  if (mismatch) {
    throw new Error('Response sheet headers do not match Code.gs. Create a new blank Responses sheet or update the headers.');
  }
}

// The endpoint is public, so any cell Sheets would parse as a formula is forced to literal text
// to keep submitted formulas from reading or exfiltrating other responses.
function asPlainText_(value) {
  const text = String(value);
  return /^[=+\-@\t\r]/.test(text) ? '\'' + text : text;
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
