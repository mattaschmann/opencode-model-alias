# AGENTS.md - opencode-model-alias

References:
- https://agentsmd.io/agents-md-best-practices

## Project Overview

This is an OpenCode plugin that allows users to define model aliases for consistent use across machines. The plugin provides a `/alias` command and automatic alias resolution in config.

## Do

- Use TypeScript for all source files
- Use `@opencode-ai/plugin` for type definitions
- Keep `src/index.ts` as the main entry point
- Follow the existing code patterns in the plugin

## Don't

- Add unnecessary dependencies
- Use default exports for anything other than the main plugin
- Make large speculative changes without confirming with user

## Commands

- `npm run build` - Compile the TypeScript plugin
- `npm run typecheck` - Type check the plugin (if available)
- Test locally using `opencode` with the local `opencode.json` config

## Project Structure

- `src/index.ts` - Main plugin implementation (config hook, command handler, alias file management)
- `package.json` - Project metadata and dependencies
- `tsconfig.json` - TypeScript configuration
- `opencode.json` - Local test configuration
- `.tasks/alias.md` - Implementation plan and task tracking

## Testing

- Test the `/alias` command by running opencode with the local config
- Verify alias CRUD operations (list, set, delete)
- Verify alias resolution in agent/command model fields
- Test that the alias file is auto-created at `~/.config/opencode/model-aliases.json`

## When stuck

- Ask a clarifying question
- Propose a short plan before implementing
- Don't push large changes without confirmation