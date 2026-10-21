# Bring tab sign-up setup

The hub's Bring tab shows the "what to bring" list and lets people sign up from their phone.

- **Reading** needs no setup. The tab reads the `Appliance List` tab and the two signup tabs straight from the sheet, so the sheet must stay viewable by anyone with the link. Rows under the `Appliance/Item` header show as Kitchen and rows under `Miscellaneous Item` as Miscellaneous. Edits in the sheet show on the next refresh.
- **Writing** needs the script below. Each sign-up becomes a new row on `Appliance Signup` or `Miscellaneous Signup`, the same place people type by hand, so the sheet's own tracker counts it. Until the script is set up, the Bring button opens the sheet instead.

The sheet ID and tab gids live in the root `config.js`.

## 1. Add the script to the sign-up sheet

You need edit access to the sheet.

1. Open the sign-up sheet and go to **Extensions > Apps Script**.
2. Delete any starter code.
3. Paste the full contents of `apps-script/Signup.gs` and save.

## 2. Deploy it as a web app

1. Click **Deploy > New deployment** and choose **Web app**.
2. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
3. Deploy, authorize when Google asks, and copy the URL that ends in `/exec`.

**Anyone** means anyone with the hub can add a sign-up through the script. It does not change who can open or edit the sheet.

After editing `Signup.gs` later, use **Deploy > Manage deployments > Edit > New version** so the same URL runs the new code.

## 3. Connect the hub

Paste the `/exec` URL into `SIGNUP_URL` in the root `config.js` and commit it.

To try the tab without touching the sheet, open the hub with `?sample#bring`. It reads `sample/signup.json` and fakes the writes.

## Changing a sign-up

The app only adds sign-ups. To change or remove one, edit or delete its row in the signup tab; the app shows the change on its next refresh.
