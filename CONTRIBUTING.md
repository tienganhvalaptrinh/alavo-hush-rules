# Contributing

Every change follows the same loop: edit files, run `npm run build`, commit the result, open a pull request. The build script rejects anything that does not match the formats below, and CI runs the same check on every pull request.

You need Node.js 20 or newer, and `npm install` once.

## Change an existing rule

1. Edit the service file in `services/`.
2. **Raise `version` by at least one** in every service file you changed. CI compares your file with the one on `main` and fails if the content changed but the version did not. The app uses `version` to decide whether to download the file.
3. Update `notes/<service>.md` with what you measured, and add an entry to `measurements` in the service file (package, app version, date).
4. Run `npm run build`. It reformats the service file in the canonical style and regenerates `index.json`.
5. Commit the service file, the notes and `index.json` together.
6. Open a pull request and fill in the template. Say how you tested it.

## Add a service

1. Create `services/<id>.json`. The id is lowercase words joined by dashes, and it must equal the file name.
2. Start from an existing file. The required fields are `schemaVersion` (always `1`), `id`, `name`, `version` (start at `1`), `preselected` (whether the app ticks it in the first-run list), `components` and `measurements`.
3. Give every component a `kind`, a `label` and a `description` in both Vietnamese (`vi`) and English (`en`), a `status`, and `enabledByDefault`. Follow the rules per kind in the README.
4. Create `notes/<id>.md` from `notes/_template.md`.
5. Run `npm run build` and commit.

## Measure before you write a chat or web view rule

A rule that allows or blocks hostnames inside a chat app can break chat if it is wrong, and nobody publishes which hostname belongs to which feature. Follow the steps in `notes/README.md`, and put the evidence in your pull request. A rule without evidence is not merged.

Until a rule is measured:

- Give it `"status": "experimental"` or `"status": "unmeasured"`.
- Set `"enabledByDefault": false` if it contains block rules. The build enforces this.

## What not to block

- Anything in `protected-domains.json`. The build rejects it.
- Shared content-delivery hostnames that serve more than one service, for example an image host used by both a feed and a chat. If you are unsure whether a hostname is shared, do not block it by domain: put it in a `webview` component scoped to one app, or leave it out.
- Link shorteners such as `t.co`, because blocking them breaks unrelated links.

## Review

A maintainer checks three things: the evidence, that the version was raised, and that no rule can break the phone or the download of the rules themselves. Publishing happens automatically after merge.

## Maintainers: publishing

Every push to `main` runs `.github/workflows/publish.yml`: it runs the check, signs `index.json` if the secret `RULES_SIGNING_KEY` exists, and deploys to GitHub Pages. First-time setup: create the key with `npm run keygen` as described in `keys/README.md`, and set Pages to deploy from GitHub Actions.
