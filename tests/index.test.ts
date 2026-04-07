jest.mock("os", () => ({
  homedir: () => "/home/test",
}));

jest.mock("fs", () => {
  const mockFs: Record<string, string> = {};
  return {
    existsSync: (pathLike: any) => {
      const key = pathLike.toString();
      return key in mockFs || key.endsWith(".json");
    },
    readFileSync: (pathLike: any, _encoding: any) => {
      const key = pathLike.toString();
      if (key in mockFs) return mockFs[key];
      throw new Error("File not found");
    },
    writeFileSync: (pathLike: any, content: any) => {
      const key = pathLike.toString();
      mockFs[key] = content;
    },
    mkdirSync: () => {},
    __mockFs: mockFs,
  };
});

import { homedir } from "os";
import path from "path";
import fs from "fs";

const mockFs = (fs as any).__mockFs;
const ALIAS_FILE = path.join(homedir(), ".config", "opencode", "model-aliases.json");

import {
  ensureConfigFile,
  readAliases,
  writeAliases,
  resolveAlias,
  resolveConfigAliases,
  handleAliasCommand,
} from "../src/index";

describe("resolveAlias", () => {
  beforeEach(() => {
    Object.keys(mockFs).forEach((key) => delete mockFs[key]);
  });

  test("returns undefined when model is undefined", () => {
    expect(resolveAlias(undefined, {})).toBeUndefined();
  });

  test("returns model when alias not found", () => {
    expect(resolveAlias("some/model", {})).toBe("some/model");
    expect(resolveAlias("some/model", { other: "value" })).toBe("some/model");
  });

  test("resolves known alias", () => {
    expect(resolveAlias("cheap", { cheap: "openai/gpt-4o-mini" })).toBe("openai/gpt-4o-mini");
  });
});

describe("readAliases", () => {
  beforeEach(() => {
    Object.keys(mockFs).forEach((key) => delete mockFs[key]);
  });

  test("returns empty object when file does not exist", () => {
    expect(readAliases()).toEqual({});
  });

  test("reads existing file", () => {
    mockFs[ALIAS_FILE] = '{"cheap": "openai/gpt-4o-mini"}';
    expect(readAliases()).toEqual({ cheap: "openai/gpt-4o-mini" });
  });

  test("returns empty object on invalid JSON", () => {
    mockFs[ALIAS_FILE] = "not valid json";
    expect(readAliases()).toEqual({});
  });
});

describe("writeAliases", () => {
  beforeEach(() => {
    Object.keys(mockFs).forEach((key) => delete mockFs[key]);
  });

  test("writes correct JSON format", () => {
    writeAliases({ cheap: "openai/gpt-4o-mini", expensive: "openai/gpt-4o" });
    expect(mockFs[ALIAS_FILE]).toBe('{\n  "cheap": "openai/gpt-4o-mini",\n  "expensive": "openai/gpt-4o"\n}');
  });
});

describe("handleAliasCommand", () => {
  beforeEach(() => {
    Object.keys(mockFs).forEach((key) => delete mockFs[key]);
  });

  test("help output", () => {
    const result = handleAliasCommand("help");
    expect(result).toContain("Usage: /alias <subcommand> [options]");
    expect(result).toContain("list");
    expect(result).toContain("set");
    expect(result).toContain("delete");
  });

  test("help with empty args", () => {
    const result = handleAliasCommand("");
    expect(result).toContain("Usage: /alias <subcommand> [options]");
  });

  test("list - empty", () => {
    const result = handleAliasCommand("list");
    expect(result).toBe("No aliases defined. Use 'alias set <key> <value>' to add one.");
  });

  test("list - with aliases", () => {
    mockFs[ALIAS_FILE] = '{"cheap": "openai/gpt-4o-mini"}';
    const result = handleAliasCommand("list");
    expect(result).toBe("Model aliases:\n  cheap -> openai/gpt-4o-mini");
  });

  test("set - success", () => {
    const result = handleAliasCommand("set cheap openai/gpt-4o-mini");
    expect(result).toBe("Alias 'cheap' set to 'openai/gpt-4o-mini'");
    expect(readAliases()).toEqual({ cheap: "openai/gpt-4o-mini" });
  });

  test("set - missing key", () => {
    const result = handleAliasCommand("set");
    expect(result).toBe("Error: key is required for 'set' subcommand");
  });

  test("set - missing value", () => {
    const result = handleAliasCommand("set cheap");
    expect(result).toBe("Error: value is required for 'set' subcommand");
  });

  test("delete - success", () => {
    mockFs[ALIAS_FILE] = '{"cheap": "openai/gpt-4o-mini"}';
    const result = handleAliasCommand("delete cheap");
    expect(result).toBe("Alias 'cheap' deleted");
    expect(readAliases()).toEqual({});
  });

  test("delete - missing key", () => {
    const result = handleAliasCommand("delete");
    expect(result).toBe("Error: key is required for 'delete' subcommand");
  });

  test("delete - non-existent alias", () => {
    const result = handleAliasCommand("delete nonexistent");
    expect(result).toBe("Error: alias 'nonexistent' does not exist");
  });

  test("unknown subcommand", () => {
    const result = handleAliasCommand("foobar");
    expect(result).toBe("Unknown subcommand. Use 'alias help' for usage information.");
  });
});

describe("resolveConfigAliases", () => {
  beforeEach(() => {
    Object.keys(mockFs).forEach((key) => delete mockFs[key]);
  });

  test("resolves alias in agent config", () => {
    mockFs[ALIAS_FILE] = '{"cheap": "openai/gpt-4o-mini"}';
    const config: any = {
      agent: {
        myagent: { model: "cheap" },
      },
    };
    resolveConfigAliases(config);
    expect(config.agent.myagent.model).toBe("openai/gpt-4o-mini");
  });

  test("resolves alias in command config", () => {
    mockFs[ALIAS_FILE] = '{"expensive": "openai/gpt-4o"}';
    const config: any = {
      command: {
        mycommand: { model: "expensive" },
      },
    };
    resolveConfigAliases(config);
    expect(config.command.mycommand.model).toBe("openai/gpt-4o");
  });

  test("does not modify non-alias models", () => {
    mockFs[ALIAS_FILE] = '{"cheap": "openai/gpt-4o-mini"}';
    const config: any = {
      agent: {
        myagent: { model: "openai/gpt-4o" },
      },
    };
    resolveConfigAliases(config);
    expect(config.agent.myagent.model).toBe("openai/gpt-4o");
  });
});
