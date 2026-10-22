window.CW_HUB_CONFIG = {
  // "Publish to web" CSV links for the two public tabs of the schedule sheet.
  // Leave blank until published; the page then shows a "coming soon" note.
  SCHEDULE_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1aq7K79kyFYtOyam0gVb3hDWupczoPD8axvDQCnAxPtvaogISJekanydCwIKNsPG6aVAKSG_3MvTc/pub?gid=1350508415&single=true&output=csv",
  DRESS_CODE_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS1aq7K79kyFYtOyam0gVb3hDWupczoPD8axvDQCnAxPtvaogISJekanydCwIKNsPG6aVAKSG_3MvTc/pub?gid=810708231&single=true&output=csv",
  // The "what to bring" sheet behind the Bring tab. It must be viewable by anyone with the link;
  // the tab reads the item list and the two sign-up tabs (by gid) straight from it.
  SIGNUP_SHEET_ID: "12WJLP2qGumpww2z0FWeD9_Z7C-u0qHW5o1DHNiYKqzU",
  SIGNUP_TABS: { list: 0, kitchen: 1360658679, misc: 384924032 },
  // The guest list ("Name", "Adults", "Kids") people pick their name from. Must be viewable by anyone with the link.
  ATTENDEES_SHEET_ID: "1uJx-tSzTRJuEXJcg2Xon4a1t4Wb06dSToJe79eQ3TB4",
  ATTENDEES_GID: 0,
  // Apps Script /exec URL that writes sign-ups (see apps-script/SIGNUP-SETUP.md).
  // With it blank, the Bring button opens the sheet instead.
  SIGNUP_URL: "https://script.google.com/macros/s/AKfycbxB3kwRmtboY7tDG2yP332Ps2OHF3VFrtTwIt8OOrqBzRTgdTNgbL5dYaafYr-JmHKL/exec",
  // GoatCounter site code (the "xyz" in xyz.goatcounter.com). Blank turns analytics off.
  GOATCOUNTER_CODE: "parima08",
  // Read-only Groups tab; no Apps Script or write endpoint.
  CARPOOL_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTCew7Ar00SDsF1pVKeHmYIaUbG4RsUZ4bxhmgFWwLYw92Gbq2uYLCSUh0DDKcWRe35I_fSIFLTsaMT/pub?gid=1062880095&single=true&output=csv",
  // Published sleeping allocations. The app only reads this CSV.
  ROOMS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8YV9Db3OHZX3FCz4DZTHHWdCuSG9ZM_x_bhr24BKihpPSLs25pLftbi8-5T2jOmSYOIztPBumh2kp/pub?gid=147732127&single=true&output=csv",
  EVENT_YEAR: 2026,
  TIME_ZONE: "America/Los_Angeles"
};
