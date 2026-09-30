# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Static GitHub Pages site, no build step. Preview with `python3 -m http.server` from the repo root.
- Survey field names and stored answer values in `index.html` must stay in sync with `apps-script/Code.gs` and the Sheet headers; changing one means the owner must re-paste and re-deploy the script. `QUESTIONS.md` lists the exact values.
- Never submit test answers to the live Sheet. `config.js` holds the real endpoint, so for local testing point `SCRIPT_URL` at nothing.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
