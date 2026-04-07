# opencode-model-alias

> **Note:** This project is not built by the OpenCode team and is not affiliated with OpenCode in any way.

OpenCode plugin that allows users to define model aliases for consistent use across machines.

## Installation

Add the plugin to your OpenCode config:

```json
{
  "plugin": ["opencode-model-alias"]
}
```

OpenCode automatically installs npm plugins using Bun at startup.

## Why This Plugin?

When you create custom skills, agents, or commands in OpenCode, you can specify which model to use. However, sharing these configurations across multiple computers is problematic because each machine may use different models.

### The Problem

Imagine you have a custom skill that uses GPT-4o Mini for cost efficiency:

```json
{
  "skill": {
    "my-skill": {
      "model": "openai/gpt-4o-mini"
    }
  }
}
```

If you share this skill with a colleague who uses Anthropic, or if you switch to a different provider on another computer, you need to manually update the model in your config. This becomes tedious and error-prone as you accumulate more skills.

### The Solution

With model aliases, you can use a consistent identifier across machines:

1. **In your shared config:** Use the alias
   ```json
   {
     "skill": {
       "my-skill": {
         "model": "cheap"
       }
     }
   }
   ```

2. **On each machine:** Define the alias in `~/.config/opencode/model-aliases.json`
   ```json
   {
     "cheap": "openai/gpt-4o-mini"
   }
   ```

Now your skill configuration is portable, and each computer maps "cheap" to whatever model that machine prefers.

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
