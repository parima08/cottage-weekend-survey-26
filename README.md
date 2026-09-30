# Cottage Weekend 2026 survey

Static GitHub Pages site for gathering private planning input for Cottage Weekend 2026. The page shows a route map, the two possible host homes as full-width cards (photo row, Airbnb link, and a Google Maps directions preview from San Jose), and a short survey with one-tap choices and two sliders. It does not show public results and does not ask people to vote for a location.

## Local files

- `index.html` - the GitHub Pages entry point served from the repository root.
- `styles.css` - responsive light/dark travel-journal styling (the approved v2 style now serves at the root; there is no separate `/v2/` page).
- `script.js` - photo rows and full-screen viewer, the survey progress bar and validation, form serialization and submission.
- `map.js` and `routes.js` - the Leaflet route map in the hero. `routes.js` holds thinned driving routes from San Jose (OSRM); regenerate it if the addresses change.
- `config.js` - the one place to paste the Google Apps Script `/exec` URL.
- `QUESTIONS.md` - organizer-reviewable question wording.
- `apps-script/Code.gs` - Google Apps Script endpoint that appends responses to a private Sheet.
- `apps-script/SETUP.md` - setup steps for the private Sheet and web app deployment.

## Connect submissions

The site is safe to publish before the endpoint is ready. If `config.js` has an empty `SCRIPT_URL`, the form remains visible but the send button is disabled.

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

Then open `http://localhost:8080/`. For local interaction tests, use a review copy with `SCRIPT_URL` blank; never send test responses to the live Sheet.

## Visual sources

The typography and quiet editorial treatment take inspiration from [Codrops StorytellingMap](https://tympanus.net/Development/StorytellingMap/). Its accessible [stylesheet](https://tympanus.net/Development/StorytellingMap/css/style.css) uses **Baskerville** for headings and **Avenir Next** for body text, both as system font stacks. We do not redistribute those commercial fonts or the demo's icon font. Our Google Fonts substitutes are **Libre Baskerville** ([OFL](https://github.com/google/fonts/blob/main/ofl/librebaskerville/OFL.txt)) and **Nunito Sans** ([OFL](https://github.com/google/fonts/blob/main/ofl/nunitosans/OFL.txt)), loaded with `display=swap` and serif/sans-serif fallbacks. Motion respects `prefers-reduced-motion`.

Updated photo sources (credits for the currently displayed photos are also in the page footer):

- `auburn-lake-porch.jpg`: [Auburn listing](https://www.airbnb.com/rooms/1717790396205238720), image `b0bfcf9c-8322-43c8-8567-f2d7fdb66b1b.jpeg`. The actual lake view from the porch, not a stock lake; no kayak photo was available in the listing.
- `paicines-sitting-room.jpg`: [Paicines listing](https://www.airbnb.com/rooms/1720676538962010126), image `b3b7cf65-6f0d-4b99-88e3-bb6b1479d00e.jpeg`. The existing stone-fireplace living-room image now leads that reel.
- `pinnacles-sunset.jpg`: [Pinnacles High Peaks at Sunset, National Park Service](https://npgallery.nps.gov/AssetDetail/f3eb3427-155d-4519-3e8b-c8fe544b434e), marked public domain, resized to 1200px wide.
- `pinnacles-cave-stairs.jpg`: [Bear Gulch Cave, Ken Lund](https://commons.wikimedia.org/wiki/File:Bear_Gulch_Cave,_Pinnacles_National_Park,_California_(13413489085).jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/), resized to 1200px wide. The resized image remains under that license.

Gallery images use a 4:3 display crop; the photo viewer shows the full image.
