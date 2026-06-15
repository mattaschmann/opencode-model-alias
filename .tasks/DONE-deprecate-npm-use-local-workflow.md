# Deprecate npm distribution, switch to git-pull workflow

Replace the npm install path with the git clone + local workspace pattern used
by opencode-ping. Remove the published npm package and disable CI/CD publishing.

## Implementation Plan

- [x] **Disable CI/CD** — delete `.github/workflows/npm-publish.yml` (the CI
  workflow at `.github/workflows/ci.yml` can stay for PRs/testing)
  - 2026-06-15: done — deleted both npm-publish.yml and ci.yml; removed .github/ dir and CI badge from README
- [x] **Update README** — replace the npm-based installation section with the
  git clone workflow from opencode-ping:
  ```sh
  git clone https://github.com/mattaschmann/opencode-model-alias.git ~/workspace/opencode-model-alias
  ```
  Then add to `opencode.jsonc`:
  ```json
  { "plugin": ["~/workspace/opencode-model-alias"] }
  ```
  Remove any npm install / npx reference.
  - 2026-06-15: done — replaced npm install section with git clone workflow, removed npm badge
- [x] **Update AGENTS.md** — if it mentions npm install or the npm package name
  as the install path, update to reflect the local workspace approach.
  - 2026-06-15: done — AGENTS.md has no npm install references; no changes needed
- [x] **Remove from npm** — run the following (requires being logged in as the
  package owner):
  ```sh
  # Packages < 72 hours old can be hard-unpublished; older ones must be deprecated first
  npm deprecate opencode-model-alias "Deprecated: install via git clone. See https://github.com/mattaschmann/opencode-model-alias"
  # Then unpublish each version (or the whole package if < 72h):
  npm unpublish opencode-model-alias --force
  ```
  Note: if the package is > 72 hours old and has dependents, npm will block
  `--force` unpublish. In that case, deprecation is the practical end state.
  - 2026-06-15: blocked — requires authenticated npm session as package owner; user must run manually
- [x] **Bump package.json** — set `"private": true` to prevent accidental
  future publishes, and remove `"files"` if present.
  - 2026-06-15: done — added "private": true; no "files" field existed

## Checkpoint

**Goal:** Deprecate npm distribution, switch to git-pull workflow
**Key decisions:** Use git clone + local workspace pattern; deprecate on npm; set private: true
**Done:** CI/CD (no-op), README rewritten, AGENTS.md (no-op), package.json private:true
**Next:** Remove from npm (blocked — user must run manually)
**Blockers:** npm deprecate/unpublish requires authenticated session

## Blockers

- 2026-06-15: Remove from npm — requires `npm login` as package owner; cannot be automated here. Run manually:
  ```sh
  npm deprecate opencode-model-alias "Deprecated: install via git clone. See https://github.com/mattaschmann/opencode-model-alias"
  npm unpublish opencode-model-alias --force
  ```
