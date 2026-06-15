# Migrate /alias command off throw-to-abort pattern

The `command.execute.before` hook for `/alias` (`src/index.ts:145-163`) uses
`client.session.prompt({ noReply: true })` to display output and then throws
`"__ALIAS_COMMAND_HANDLED__"` to abort the model turn. Throwing renders a full
inline error block (message + stack + `cause`) in the conversation, garbling the
TUI. This is the same artifact that prompted the fix in `opencode-ping`. Migrate
to the same `splice + ignored:true` pattern.

## Investigation

Verified against opencode 1.17.7 (bytecode analysis + direct observation via
screenshot). Full analysis is in
`../../opencode-ping/.tasks/plugin-api-upgrade.md` — this file records the
per-plugin decision only.

**Summary of 1.17.7 behavior:**
- `SessionPrompt.command` always calls the prompt fn after the hook returns;
  only `noReply===true` on the *prompt call itself* short-circuits, and the
  command path never sets it → an empty model turn fires.
- Parts with `ignored: true` are filtered from model input but still render in
  the TUI chat (`if(...||Je.ignored||Je.synthetic) continue`). Help text is
  visible to the user, never reaches the model.
- `.splice()` on `output.parts` is required (reassignment is a no-op — opencode
  holds a closure ref to the original array).
- Throwing renders the **full error object inline**, garbling the TUI. There is
  no `throwOnError:false` suppression. Confirmed by direct observation.

**Supersedes:** the command-migration portion of the open `plugin-api-upgrade.md`
task (item #3 and its unchecked steps: "Investigate whether `output.parts` in
`command.execute.before` replaces the need to throw" / "If viable, refactor…").
That item asked the question; this task answers it. The dep-move and version-bump
items in `plugin-api-upgrade.md` remain their own concern and are not addressed
here.

**Soft prerequisite:** `plugin-api-upgrade.md` plans bumping `@opencode-ai/plugin`
to `^1.16.0+`, which brings full TypeScript coverage of the `output` parameter.
The runtime behavior is unchanged regardless — `output.parts.splice()` works on
any installed version. The bump is recommended before or alongside this change for
type safety, but is not required for the fix itself.

## Decision

Adopt `splice + ignored:true`, matching `opencode-ping/src/index.ts:47`. Drop
the `client.session.prompt` call and the throw. Accept the residual empty model
turn (unfixable in 1.17.7 without throwing; will resolve when upstream ships a
`noReply`/`cancelled` flag on the hook output).

## Implementation Plan

- [ ] Add `output: any` to the hook signature:
  ```ts
  "command.execute.before": async (input, output: any) => {
  ```
- [ ] Replace `client.session.prompt({ noReply: true, parts: [...] })` + `throw`
  with:
  ```ts
  output.parts.splice(0, output.parts.length, { type: 'text', text: result, ignored: true })
  ```
  (Note: `handleAliasCommand` is synchronous — no `await` needed.)
- [ ] Remove the inline sentinel string `"__ALIAS_COMMAND_HANDLED__"` (it was
  only used in the throw; no separate constant to grep for).
- [ ] Run `npm run typecheck`
- [ ] Run `npm test`
- [ ] Verify `/alias list` (or `/alias help`) renders cleanly in opencode (no
  inline error block)
