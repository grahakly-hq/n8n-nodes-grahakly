# Releasing

This package is published to npm **only** by the `Publish to npm` GitHub Action, with an npm
provenance statement. n8n's verification guidelines require this — a manual `npm publish` from a
laptop does not qualify and cannot be verified.

## One-time setup

1. Create an npm **automation** access token (npmjs.com → Access Tokens → Generate → *Automation*).
2. Add it to this repo as a secret: **Settings → Secrets and variables → Actions → New repository
   secret**, name `NPM_TOKEN`.

The workflow already requests `id-token: write`, which is what lets npm attach the provenance
statement — no extra secret is needed for that.

## Each release

1. Bump the version in `package.json` (npm refuses to republish an existing version):
   ```bash
   npm version patch   # or minor / major
   ```
   This commits the bump and creates a `v<version>` tag.
2. Push the tag: `git push --follow-tags`.
3. On GitHub, **Releases → Draft a new release**, choose that tag, and **Publish release**.
4. The `Publish to npm` workflow runs: install → build → lint → `npm publish --provenance`.

After it succeeds, run the official scan against the published package before submitting for
verification:

```bash
npx @n8n/scan-community-package n8n-nodes-grahakly
```
