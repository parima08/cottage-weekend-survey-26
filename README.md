# Cottage Weekend 2026 survey

Static GitHub Pages site for gathering private planning input for Cottage Weekend 2026. The page shows the two possible host settings, possible weekend rhythms, and a neutral criteria survey. It does not show public results and does not ask people to vote for a location.

## Local files

- `index.html` - the GitHub Pages entry point served from the repository root.
- `styles.css` - responsive light/dark styling.
- `script.js` - form serialization and submission handling.
- `config.js` - the one place to paste the Google Apps Script `/exec` URL.
- `QUESTIONS.md` - organizer-reviewable question wording.
- `apps-script/Code.gs` - Google Apps Script endpoint that appends responses to a private Sheet.
- `apps-script/SETUP.md` - setup steps for the private Sheet and web app deployment.

## Connect submissions

The site is safe to publish before the endpoint is ready. If `config.js` has an empty `SCRIPT_URL`, the form remains visible but the submit button is disabled and a clear setup notice appears.

After deploying the Apps Script web app, paste its `/exec` URL into `config.js`:

```js
window.CW26_CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
};
```

Do not commit any response data, Sheet exports, or private Google Sheet links.

## GitHub Pages

This site has no build step. GitHub Pages can serve it from the default branch root with `index.html` at the repository root. Repo settings are intentionally not changed by this branch.

## Local preview

Run any static server from the repo root, for example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.
