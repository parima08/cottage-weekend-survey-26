window.CW_HUB_CONFIG = {
  // "Publish to web" CSV links for the two public tabs of the schedule sheet.
  // Leave blank until published; the page then shows a "coming soon" note.
  SCHEDULE_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1aq7K79kyFYtOyam0gVb3hDWupczoPD8axvDQCnAxPtvaogISJekanydCwIKNsPG6aVAKSG_3MvTc/pub?gid=1380331285&single=true&output=csv",
  DRESS_CODE_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1aq7K79kyFYtOyam0gVb3hDWupczoPD8axvDQCnAxPtvaogISJekanydCwIKNsPG6aVAKSG_3MvTc/pub?gid=810708231&single=true&output=csv",
  // The "what to bring" sheet behind the Bring tab. It must be viewable by anyone with the link;
  // the tab reads the item list and the two sign-up tabs (by gid) straight from it.
  SIGNUP_SHEET_ID: "12WJLP2qGumpww2z0FWeD9_Z7C-u0qHW5o1DHNiYKqzU",
  SIGNUP_TABS: { list: 0, kitchen: 1360658679, misc: 384924032 },
  // Apps Script /exec URL that writes sign-ups (see apps-script/SIGNUP-SETUP.md).
  // With it blank, the Bring button opens the sheet instead.
  SIGNUP_URL: "https://script.google.com/macros/s/AKfycbz6_lbBUvELRrZ38Iv99FKAUNoRhgL2NHh3VVCk7T_g25Iz0oUf9ueh86c2ZVIa3G44/exec",
  EVENT_YEAR: 2026,
  TIME_ZONE: "America/Los_Angeles"
};
