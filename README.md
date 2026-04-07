# opencode-model-alias

OpenCode plugin that allows users to define model aliases for consistent use across machines.

## Problem

When sharing custom skills/agents/commands between computers that use different models, you currently need to maintain separate versions of those configurations. This plugin solves that by letting you set model aliases that resolve to specific models on each machine.

## Usage

### The `/alias` Command

Manage model aliases directly from OpenCode:

```bash
# List all aliases
/alias list

# Set a new alias
/alias set cheap openai/gpt-4o-mini

# Delete an alias
/alias delete cheap

# Show help
/alias help
```

### Using Aliases in Config

In your OpenCode config (e.g., `~/.config/opencode/opencode.json`):

```json
{
  "agent": {
    "my-agent": {
      "model": "cheap"
    }
  },
  "command": {
    "my-command": {
      "model": "expensive"
    }
  }
}
```

The plugin automatically resolves these aliases by looking up the model in your alias file.

### Alias File Location

Aliases are stored in `~/.config/opencode/model-aliases.json`. The plugin auto-creates this file with an empty object `{}` if it doesn't exist.

Example `model-aliases.json`:

```json
{
  "cheap": "openai/gpt-4o-mini",
  "expensive": "openai/gpt-4o",
  "claude": "anthropic/claude-sonnet-4-20250514"
}
```

## References

- [OpenCode Plugins Documentation](https://opencode.ai/docs/plugins/)
- [GitHub Issue #3439](https://github.com/anomalyco/opencode/issues/3439)

## Credit/Inspirations
- https://gist.github.com/krystofrezac/7f16ba252279f889eb750a866b257a1d
- https://github.com/toninho09/opencode-usage
