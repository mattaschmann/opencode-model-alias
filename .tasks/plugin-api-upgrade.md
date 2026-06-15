# Upgrade to @opencode-ai/plugin 1.16.x

Align with the current opencode plugin API surface.

## Changes

### 1. Move `@opencode-ai/plugin` from dependencies to devDependencies

The plugin ships as TypeScript source loaded by opencode's runtime — there's no
bundle, so the SDK should be a devDep only.

### 2. Bump version to `^1.16.0`

Brings in the latest type definitions (ProviderHook, experimental_workspace,
compaction hooks, etc.).

### 3. Investigate `command.execute.before` output.parts pattern

The current implementation uses throw-to-abort + `client.session.prompt` to
display results. The newer API provides an `output: { parts: Part[] }` second
parameter. Investigate whether populating `output.parts` and returning normally
is sufficient to short-circuit default command handling, and migrate if viable.

## Implementation Plan

- [ ] Move `@opencode-ai/plugin` from `dependencies` to `devDependencies` in package.json
- [ ] Bump version specifier to `^1.16.0`
- [ ] Run `npm install` to update lockfile
- [ ] Investigate whether `output.parts` in `command.execute.before` replaces the need to throw
- [ ] If viable, refactor `command.execute.before` to use `output.parts` instead of `client.session.prompt` + throw
- [ ] Run `npm run typecheck` and `npm test` to verify no regressions
