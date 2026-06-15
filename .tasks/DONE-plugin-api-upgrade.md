# Upgrade to @opencode-ai/plugin 1.16.x

Align with the current opencode plugin API surface.

## Changes

### 1. Move `@opencode-ai/plugin` from dependencies to devDependencies

The plugin ships as TypeScript source loaded by opencode's runtime — there's no
bundle, so the SDK should be a devDep only.

### 2. Bump version to `^1.16.0`

Brings in the latest type definitions (ProviderHook, experimental_workspace,
compaction hooks, etc.).

Investigation
Overview
The plugin currently uses @opencode-ai/plugin@^1.0.0 as a runtime dependency and implements two hooks: config (for command registration and alias resolution) and command.execute.before (for handling the /alias command). The command hook already uses the modern output.parts.splice() pattern, not the older throw + prompt pattern mentioned in the task.
Relevant files
- src/index.ts:1 — imports Config, Hooks, Plugin, PluginModule from @opencode-ai/plugin
- src/index.ts:24-25 — @opencode-ai/plugin version ^1.0.0 in dependencies
- src/index.ts:136-150 — plugin hook implementation (config + command.execute.before)
- src/index.ts:145-150 — command.execute.before uses output.parts.splice() pattern (already migrated)
- package.json — current dependency structure with @opencode-ai/plugin in dependencies
Existing patterns to follow
- The plugin exports utility functions for alias management (ensureConfigFile, readAliases, writeAliases, resolveAlias, resolveConfigAliases)
- The alias file is stored at ~/.config/opencode/model-aliases.json
- Two hooks: config (async, mutates config) and command.execute.before (async, mutates output)
- Command handler handleAliasCommand is synchronous and returns string results
Possible directions
1. Move to devDependencies: Since the plugin ships TypeScript source and opencode's runtime loads it directly, @opencode-ai/plugin should be a devDependency only, matching the pattern from opencode-ping
2. Type safety improvement: The output parameter is typed as any at line 145 — bumping to ^1.16.0 would provide full TypeScript types for the output parameter, enabling better type checking
Open questions
- Should the plugin bump to ^1.16.0 to gain ProviderHook, experimental_workspace, and compaction hooks (even if not currently used)?
- Is there any value in keeping @opencode-ai/plugin as a runtime dependency, or should it be strictly a devDependency?
- Are there any other opencode versions in use that might not support the ^1.16.0 API surface?

## Decisions

- **Move @opencode-ai/plugin to devDependencies.** *Why:* plugin ships as TypeScript source loaded directly by opencode's runtime; no bundle is produced, so the SDK should not be a runtime dependency. Matches opencode-ping pattern.
- **Bump @opencode-ai/plugin to latest version with caret range.** *Why:* gains full TypeScript types for output parameter and access to new hooks; allows future compatible minor/patch updates.
- **Bump all dependencies (prod + dev) to latest versions with caret ranges.** *Why:* user request for maximum freshness; caret ranges allow compatible future updates without locking exact versions.

## Implementation Plan

- [x] Check latest available versions for all dependencies via `npm outdated`
  - 2026-06-15: done — identified latest versions for all deps
- [x] Update `package.json`: move `@opencode-ai/plugin` from `dependencies` to `devDependencies`
  - 2026-06-15: done — moved to devDependencies, left dependencies empty
- [x] Bump `@opencode-ai/plugin` to latest with caret range
  - 2026-06-15: done — bumped to ^1.17.7
- [x] Bump all other dependencies to latest with caret ranges
  - 2026-06-15: done — @types/jest ^30.0.0, @types/node ^25.9.3, jest ^30.4.2, ts-jest ^29.4.11, typescript ^5.9.3
- [x] Run `npm install` to regenerate `package-lock.json`
  - 2026-06-15: done
- [x] Run `npm test`
  - 2026-06-15: done — 23 tests passed
- [x] Run `npm run typecheck`
  - 2026-06-15: done — clean
- [x] Verify no regressions in alias command functionality
  - 2026-06-15: done — all alias command tests pass
