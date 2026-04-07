import type { Config, Hooks, Plugin } from "@opencode-ai/plugin";
import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const ALIAS_FILE = join(homedir(), ".config", "opencode", "model-aliases.json");

function ensureConfigFile(): void {
  const dir = join(homedir(), ".config", "opencode");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(ALIAS_FILE)) {
    writeFileSync(ALIAS_FILE, "{}");
  }
}

function readAliases(): Record<string, string> {
  ensureConfigFile();
  try {
    return JSON.parse(readFileSync(ALIAS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeAliases(aliases: Record<string, string>): void {
  ensureConfigFile();
  writeFileSync(ALIAS_FILE, JSON.stringify(aliases, null, 2));
}

function resolveAlias(model: string | undefined, aliases: Record<string, string>): string | undefined {
  if (!model) return model;
  if (model in aliases) {
    return aliases[model];
  }
  return model;
}

function resolveConfigAliases(config: Config): void {
  const aliases = readAliases();

  if (config.agent) {
    for (const [name, agentConfig] of Object.entries(config.agent)) {
      if (agentConfig && agentConfig.model) {
        const resolved = resolveAlias(agentConfig.model, aliases);
        if (resolved !== agentConfig.model) {
          agentConfig.model = resolved;
        }
      }
    }
  }

  if (config.command) {
    for (const [name, commandConfig] of Object.entries(config.command)) {
      if (commandConfig && commandConfig.model) {
        const resolved = resolveAlias(commandConfig.model, aliases);
        if (resolved !== commandConfig.model) {
          commandConfig.model = resolved;
        }
      }
    }
  }
}

function handleAliasCommand(args: string): string {
  const parts = args.trim().split(/\s+/);
  const subcommand = parts[0] || "help";

  if (subcommand === "help" || (subcommand === "" && parts.length === 0)) {
    return `Usage: /alias <subcommand> [options]

Subcommands:
  list               List all model aliases
  set <key> <value> Set a model alias
  delete <key>      Delete a model alias
  help               Show this help message

Examples:
  alias list
  alias set cheap openai/gpt-4o-mini
  alias delete cheap`;
  }

  if (subcommand === "list") {
    const aliases = readAliases();
    if (Object.keys(aliases).length === 0) {
      return "No aliases defined. Use 'alias set <key> <value>' to add one.";
    }
    const lines = Object.entries(aliases)
      .map(([key, value]) => `  ${key} -> ${value}`)
      .join("\n");
    return `Model aliases:\n${lines}`;
  }

  if (subcommand === "set") {
    const key = parts[1];
    const value = parts.slice(2).join(" ");
    if (!key) {
      return "Error: key is required for 'set' subcommand";
    }
    if (!value) {
      return "Error: value is required for 'set' subcommand";
    }
    const aliases = readAliases();
    aliases[key] = value;
    writeAliases(aliases);
    return `Alias '${key}' set to '${value}'`;
  }

  if (subcommand === "delete") {
    const key = parts[1];
    if (!key) {
      return "Error: key is required for 'delete' subcommand";
    }
    const aliases = readAliases();
    if (!(key in aliases)) {
      return `Error: alias '${key}' does not exist`;
    }
    delete aliases[key];
    writeAliases(aliases);
    return `Alias '${key}' deleted`;
  }

  return "Unknown subcommand. Use 'alias help' for usage information.";
}

const aliasPlugin: Plugin = async ({ client }) => {
  return {
    config: async (opencodeConfig: Config) => {
      opencodeConfig.command ??= {};
      opencodeConfig.command["alias"] = {
        template: "",
        description: "Manage model aliases (list, set, delete)",
      };

      resolveConfigAliases(opencodeConfig);
    },
    "command.execute.before": async (input) => {
      if (input.command === "alias") {
        const result = handleAliasCommand(input.arguments);
        await client.session.prompt({
          path: { id: input.sessionID },
          body: {
            noReply: true,
            parts: [
              {
                type: "text",
                text: result,
                ignored: true,
              },
            ],
          },
        });
        throw new Error("__ALIAS_COMMAND_HANDLED__");
      }
    },
  };
};

export default aliasPlugin;
