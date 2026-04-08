# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-04-08

### Changed
- Normalize `repository.url` in `package.json` to match npm expectations and avoid publish-time rewrites.

### CI
- Enable provenance statements and explicit public access when publishing via trusted publisher for more reliable npm releases.

## [1.0.1]

### Added
- Export plugin as PluginModule for OpenCode integration
- `/alias set <alias> <model>` command to create an alias
- `/alias list` command to show all aliases
- `/alias delete <alias>` command to remove an alias
- `/alias help` command for usage guidance
- Config hook to automatically resolve aliases in `agent.model` and `command.model` fields
- Jest test suite with 89% code coverage (21 tests)
- CI workflow with coverage badge generation
- npm publish workflow for automated releases

### Changed
- Update terminology from "skill" to "command" in documentation
- Refactor CI to use reusable workflow reference instead of duplicating jobs

### Fixed
- Jest settings for proper coverage collection
- Badge issues in documentation
- GitHub URL username typo in package.json

### Docs
- Add "Why This Plugin?" section explaining the problem/solution workflow
- Add badges (npm version, license, test coverage)
- Add markdown format alias usage examples
- Add OpenCode disclaimer to README
- Add AGENTS.md for AI agent guidance
- Add README.md with installation and usage instructions

### CI
- Add workflow_call trigger to enable reusable CI workflow
- Add npm publish workflow
