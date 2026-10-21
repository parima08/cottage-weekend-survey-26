// Bound to the "what to bring" sign-up sheet. The hub's Bring tab reads the sheet directly and
// POSTs each sign-up here; it lands as a new row on the matching signup tab.

const LIST_TAB = 'Appliance List';

// Each group starts at the row whose first cell is `header` on the list tab.
const GROUPS = [
  { key: 'kitchen', header: 'appliance/item', tab: 'Appliance Signup' },
  { key: 'misc', header: 'miscellaneous item', tab: 'Miscellaneous Signup' }
];

const ALLOWED_FIELDS = ['group', 'item', 'name', 'qty', 'notes', 'website'];
const MAX_LENGTHS = { item: 200, name: 80, notes: 300 };
const MAX_QTY = 50;

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '';
    if (!raw) return jsonResponse({ ok: false, error: 'Missing request body.' });

    const payload = JSON.parse(raw);
    validatePayload(payload);
    const group = GROUPS.filter((g) => g.key === payload.group)[0];

    const lock = LockService.getDocumentLock();
    lock.waitLock(10000);
    try {
      const item = readList_()[group.key].filter((it) => norm_(it.item) === norm_(payload.item))[0];
      if (!item) throw new Error('That item is no longer on the list.');

      const sheet = getSheet_(group.tab);
      const head = findHeader_(sheet);
      const row = nextRow_(sheet, head);
      // Cells are written one by one so checkbox columns in between keep their formatting.
      sheet.getRange(row, head.cols.item).setValue(item.item);
      sheet.getRange(row, head.cols.person).setValue(asPlainText_(String(payload.name).trim()));
      sheet.getRange(row, head.cols.quantity).setValue(Number(payload.qty));
      if (head.cols.notes) sheet.getRange(row, head.cols.notes).setValue(asPlainText_(String(payload.notes || '').trim()));
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message || 'Sign-up failed.' });
  }
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

  if (!GROUPS.some((g) => g.key === payload.group)) {
    throw new Error('Unknown list.');
  }

  ['item', 'name'].forEach((field) => {
    if (!String(payload[field] || '').trim()) {
      throw new Error(field === 'name' ? 'Please add your name.' : 'Missing item.');
    }
  });

  Object.keys(MAX_LENGTHS).forEach((field) => {
    if (String(payload[field] || '').length > MAX_LENGTHS[field]) {
      throw new Error('Field is too long: ' + field);
    }
  });

  const qty = Number(payload.qty);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    throw new Error('Quantity must be between 1 and ' + MAX_QTY + '.');
  }
}

// Items and the quantity needed, read from the list tab. A row counts when it has a name and a number.
function readList_() {
  const values = getSheet_(LIST_TAB).getDataRange().getValues();
  const out = {};
  GROUPS.forEach((g) => { out[g.key] = []; });
  let current = null;
  values.forEach((row) => {
    const first = String(row[0] || '').trim();
    const header = GROUPS.filter((g) => first.toLowerCase() === g.header)[0];
    if (header) { current = header; return; }
    const needed = Number(row[1]);
    if (current && first && row[1] !== '' && !isNaN(needed)) out[current.key].push({ item: String(row[0]), needed: needed });
  });
  return out;
}

function getSheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Missing tab: ' + name);
  return sheet;
}

// The signup tabs have a title block above the header row, so find the row that starts with "Item".
function findHeader_(sheet) {
  const width = sheet.getLastColumn();
  const values = sheet.getRange(1, 1, Math.min(10, sheet.getMaxRows()), width).getValues();
  for (let r = 0; r < values.length; r++) {
    if (String(values[r][0]).trim().toLowerCase() !== 'item') continue;
    const cols = {};
    values[r].forEach((h, c) => {
      const text = String(h).trim().toLowerCase();
      ['item', 'person', 'quantity', 'notes'].forEach((key) => {
        if (!cols[key] && text.indexOf(key) === 0) cols[key] = c + 1;
      });
    });
    if (!cols.person || !cols.quantity) throw new Error('Signup tab "' + sheet.getName() + '" is missing a column.');
    return { row: r + 1, cols: cols };
  }
  throw new Error('No "Item" header row on tab "' + sheet.getName() + '".');
}

// The first row after the last filled Item cell, so rows people typed by hand are never overwritten.
function nextRow_(sheet, head) {
  const last = sheet.getLastRow();
  let row = head.row + 1;
  if (last > head.row) {
    const items = sheet.getRange(head.row + 1, head.cols.item, last - head.row, 1).getValues();
    for (let i = items.length - 1; i >= 0; i--) {
      if (String(items[i][0]).trim()) { row = head.row + 2 + i; break; }
    }
  }
  if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 1);
  return row;
}

function norm_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// The endpoint is public, so any cell Sheets would parse as a formula is forced to literal text.
function asPlainText_(value) {
  const text = String(value);
  return /^[=+\-@\t\r]/.test(text) ? '\'' + text : text;
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
