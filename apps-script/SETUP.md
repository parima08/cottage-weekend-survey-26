# Google Sheet submission setup

This page is public, but the response Sheet should stay private. The web app below lets anyone submit a response without giving anyone permission to view the Sheet.

## 1. Create the private Sheet

1. In the organizer's Google Drive, create a new Google Sheet.
2. Name it something like `Cottage Weekend 2026 Responses`.
3. Do not share the Sheet publicly. Keep it private to the organizer account and any trusted planning helpers.

## 2. Add the Apps Script

1. In the Sheet, go to **Extensions > Apps Script**.
2. Delete any starter code.
3. Copy the full contents of `apps-script/Code.gs` from this repository and paste it into the Apps Script editor.
4. Save the project.

## 3. Deploy the web app

1. In Apps Script, click **Deploy > New deployment**.
2. Choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.
5. Deploy and authorize the script when Google asks.
6. Copy the Web app URL that ends in `/exec`.

Important: **Anyone** here means anyone with the survey page can submit a response to the script. It does **not** make the Google Sheet visible.

## 4. Connect the site

1. Open `config.js`.
2. Paste the `/exec` URL into the one config line:

```js
window.CW26_CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/PASTE_DEPLOYMENT_ID_HERE/exec"
};
```

3. Commit the changed `config.js`. Do not commit the Sheet URL or any response data. The Apps Script URL is only a submission endpoint.

## 5. Test before sending the survey

1. Open the GitHub Pages site.
2. Fill out the form with a test response.
3. Confirm a new row appears in the private Sheet's `Responses` tab.
4. Delete the test row if you do not want it included in the final export.

If a submission fails, the page leaves the answers in the browser so the person can retry.
