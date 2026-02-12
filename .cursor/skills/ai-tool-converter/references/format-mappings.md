# AI Tool Format Mappings

This document maps frontmatter fields and file structure between different AI coding assistant formats.

---

## Root Directory Structure

Each AI coding tool uses its own root configuration directory:

| Tool | Project Root | User Root | Notes |
|------|--------------|-----------|-------|
| **Claude Code** | `.claude/` | `~/.claude/` | Primary config directory |
| **Cursor** | `.cursor/` | `~/.cursor/` | Primary config directory |
| **Codex** | `.codex/` | `~/.codex/` | Cursor reads as fallback |

### Directory Contents

#### Claude Code (`.claude/`)
```
.claude/
├── agents/          # Subagent definitions
├── commands/        # Custom slash commands
├── skills/          # Skill definitions
│   └── skill-name/
│       ├── SKILL.md
│       └── references/
├── settings.json    # Project settings
├── settings.local.json  # Local settings (gitignored)
└── CLAUDE.md        # Project instructions
```

#### Cursor (`.cursor/`)
```
.cursor/
├── agents/          # Subagent definitions
├── rules/           # Project rules
└── ...
```

### Cross-Tool Compatibility

Cursor reads from multiple directories for compatibility:
- `.cursor/agents/` (highest priority)
- `.claude/agents/` (Claude Code compatibility)
- `.codex/agents/` (Codex compatibility)

This means Claude Code agents in `.claude/agents/` will also work in Cursor without conversion (basic fields only).

---

## Documentation Sources

Keep these links for future updates:

| Tool | Type | Documentation URL |
|------|------|------------------|
| **Claude Code** | Agents | https://code.claude.com/docs/en/sub-agents |
| **Claude Code** | Skills/Commands | https://code.claude.com/docs/en/skills |
| **Claude Code** | Memory/Rules | https://code.claude.com/docs/en/memory |
| **Cursor** | Subagents | https://cursor.com/docs/context/subagents |
| **Cursor** | Skills | https://cursor.com/docs/context/skills |
| **Cursor** | Commands | https://cursor.com/docs/context/commands |
| **Cursor** | Rules | https://cursor.com/docs/context/rules |
| **AgentSkills.io** | Standard | https://agentskills.io (open standard) |

---

## Claude Code Sub-Agents

**Source**: https://code.claude.com/docs/en/sub-agents

### File Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `--agents` CLI flag | Current session | 1 (highest) |
| `.claude/agents/` | Current project | 2 |
| `~/.claude/agents/` | All user projects | 3 |
| Plugin's `agents/` directory | Where plugin is enabled | 4 (lowest) |

### Frontmatter Fields

#### `name` (Required)
- **Type**: string
- **Constraints**: Lowercase letters and hyphens only
- **Example**: `code-reviewer`
- **Description**: Unique identifier for the subagent

#### `description` (Required)
- **Type**: string
- **Example**: `Reviews code for quality and best practices`
- **Description**: When Claude should delegate to this subagent. Write a clear description so Claude knows when to use it.

#### `model` (Optional)
- **Type**: string
- **Default**: `inherit`
- **Possible Values**:
  | Value | Description |
  |-------|-------------|
  | `sonnet` | Claude Sonnet (balanced capability and speed) |
  | `opus` | Claude Opus (most capable) |
  | `haiku` | Claude Haiku (fastest, lowest latency) |
  | `inherit` | Use the same model as the main conversation |
- **Example**: `model: sonnet`

#### `tools` (Optional)
- **Type**: array of strings
- **Default**: Inherits all tools from main conversation
- **Possible Values**:
  | Tool | Description |
  |------|-------------|
  | `Read` | Read files |
  | `Write` | Write/create files |
  | `Edit` | Edit existing files |
  | `Bash` | Execute shell commands |
  | `Grep` | Search file contents |
  | `Glob` | Find files by pattern |
  | `Task` | Spawn subagents |
  | `WebFetch` | Fetch web content |
  | `WebSearch` | Search the web |
  | `Bash(pattern)` | Wildcards allowed, e.g., `Bash(git *)` for git commands only |
- **Example**: `tools: [Read, Grep, Glob, Bash]`

#### `disallowedTools` (Optional)
- **Type**: array of strings
- **Description**: Tools to deny, removed from inherited or specified list
- **Example**: `disallowedTools: [Write, Edit]`

#### `permissionMode` (Optional)
- **Type**: string
- **Default**: `default`
- **Possible Values**:
  | Value | Description |
  |-------|-------------|
  | `default` | Standard permission checking with prompts |
  | `acceptEdits` | Auto-accept file edits |
  | `dontAsk` | Auto-deny permission prompts (explicitly allowed tools still work) |
  | `bypassPermissions` | Skip all permission checks (use with caution) |
  | `plan` | Plan mode (read-only exploration) |
- **Example**: `permissionMode: auto`

#### `skills` (Optional)
- **Type**: array of strings
- **Description**: Skills to load into the subagent's context at startup. The full skill content is injected, not just made available for invocation.
- **Example**: `skills: [api-conventions, error-handling-patterns]`

#### `hooks` (Optional)
- **Type**: object
- **Description**: Lifecycle hooks scoped to this subagent
- **Supported Events**:
  | Event | Matcher Input | When It Fires |
  |-------|---------------|---------------|
  | `PreToolUse` | Tool name | Before the subagent uses a tool |
  | `PostToolUse` | Tool name | After the subagent uses a tool |
  | `Stop` | (none) | When the subagent finishes |
- **Example**:
  ```yaml
  hooks:
    PreToolUse:
      - matcher: "Bash"
        hooks:
          - type: command
            command: "./scripts/validate-command.sh"
  ```

#### `disabled` (Optional)
- **Type**: boolean
- **Default**: `false`
- **Description**: Disable the subagent
- **Example**: `disabled: true`

### Example Claude Code Agent File

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices. Use proactively after code changes.
model: sonnet
tools:
  - Read
  - Grep
  - Glob
  - Bash
disallowedTools:
  - Write
  - Edit
permissionMode: default
skills:
  - code-standards
hooks:
  PostToolUse:
    - matcher: "Read"
      hooks:
        - type: command
          command: "./scripts/log-file-access.sh"
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
```

---

## Cursor Subagents

**Source**: https://cursor.com/docs/context/subagents

### File Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `.cursor/agents/` | Current project | 1 (highest) |
| `.claude/agents/` | Current project (compatibility) | 2 |
| `.codex/agents/` | Current project (compatibility) | 3 |
| `~/.cursor/agents/` | All user projects | 4 |
| `~/.claude/agents/` | All user projects (compatibility) | 5 |
| `~/.codex/agents/` | All user projects (compatibility) | 6 (lowest) |

**Note**: Cursor reads `.claude/agents/` and `.codex/agents/` as compatibility fallbacks.

### Frontmatter Fields

#### `name` (Optional)
- **Type**: string
- **Default**: Filename without extension
- **Constraints**: Lowercase letters and hyphens only
- **Example**: `code-reviewer`
- **Description**: Unique identifier. Defaults to filename if omitted.

#### `description` (Optional)
- **Type**: string
- **Example**: `Reviews code for quality and best practices`
- **Description**: Determines when the agent delegates to this subagent; guides automatic delegation decisions.

#### `model` (Optional)
- **Type**: string
- **Default**: `inherit`
- **Possible Values**:
  | Value | Description |
  |-------|-------------|
  | `fast` | Faster model (lower latency) |
  | `inherit` | Use parent's model |
  | Specific model ID | Any valid model identifier |
- **Example**: `model: fast`

#### `readonly` (Optional)
- **Type**: boolean
- **Default**: `false`
- **Possible Values**: `true`, `false`
- **Description**: If true, the subagent runs with restricted write permissions.
- **Example**: `readonly: true`

#### `is_background` (Optional)
- **Type**: boolean
- **Default**: `false`
- **Possible Values**: `true`, `false`
- **Description**: If true, the subagent runs in the background without waiting for completion.
- **Example**: `is_background: true`

### Example Cursor Agent File

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
model: inherit
readonly: true
is_background: false
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
```

---

## Field Mapping Table

### Direct Mappings

| Claude Code | Cursor | Notes |
|-------------|--------|-------|
| `name` (required) | `name` (optional) | Cursor defaults to filename |
| `description` (required) | `description` (optional) | Same purpose |

### Model Mappings

| Claude Code | Cursor | Conversion Notes |
|-------------|--------|------------------|
| `haiku` | `fast` | Both are fast/low-latency options |
| `inherit` | `inherit` | Direct mapping |
| `sonnet` | `inherit` | No direct equivalent in Cursor |
| `opus` | `inherit` | No direct equivalent in Cursor |

### Claude Code Only Fields

These fields have no Cursor equivalent:

| Field | Purpose | Cursor Alternative |
|-------|---------|-------------------|
| `tools` | Allowlist of tools | Use `readonly: true` for read-only |
| `disallowedTools` | Denylist of tools | None |
| `permissionMode` | Permission handling | None |
| `skills` | Preload skills | None |
| `hooks` | Lifecycle hooks | None |
| `disabled` | Disable subagent | Delete the file |

### Cursor Only Fields

These fields have no Claude Code equivalent:

| Field | Purpose | Claude Code Alternative |
|-------|---------|------------------------|
| `readonly` | Restrict write permissions | `tools: [Read, Grep, Glob]` or `disallowedTools: [Write, Edit]` |
| `is_background` | Run without waiting | Claude decides automatically |

---

## Conversion Rules

### Claude Code → Cursor

1. **Keep**: `name`, `description` (make `name` optional if using filename)
2. **Convert model**:
   - `haiku` → `fast`
   - `inherit` → `inherit`
   - `sonnet` → `inherit`
   - `opus` → `inherit`
3. **Remove**: `tools`, `disallowedTools`, `permissionMode`, `skills`, `hooks`, `disabled`
4. **Add if applicable**:
   - `readonly: true` if original had restricted write tools
   - `is_background: true` if intended for background execution
5. **Body/prompt**: Copy unchanged

### Cursor → Claude Code

1. **Keep**: `name`, `description` (make both required)
2. **Convert model**:
   - `fast` → `haiku`
   - `inherit` → `inherit`
   - Specific model ID → `inherit`
3. **Remove**: `readonly`, `is_background`
4. **Add if applicable**:
   - `tools: [Read, Grep, Glob, Bash]` if `readonly: true`
   - `disallowedTools: [Write, Edit]` if `readonly: true`
   - `permissionMode: default` for standard behavior
5. **Body/prompt**: Copy unchanged

---

## Compatibility Notes

1. **AgentSkills.io Standard**: Both formats support the open standard (name + description + markdown body)
2. **Cursor reads Claude directories**: `.claude/agents/` works in Cursor as a compatibility fallback
3. **File naming**: Both use lowercase with hyphens (e.g., `code-reviewer.md`)
4. **Prompt/body format**: Identical - both use Markdown after YAML frontmatter
5. **Subagent nesting**: Neither allows subagents to spawn other subagents

---

## Claude Code Skills

**Source**: https://code.claude.com/docs/en/skills

### File Locations

| Location | Path | Scope |
|----------|------|-------|
| Enterprise | Managed settings | All users in organization |
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<skill-name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | Where plugin is enabled |

**Priority**: Enterprise > Personal > Project (higher wins on name collision)

### Directory Structure

```
skill-name/
├── SKILL.md           # Main instructions (required)
├── template.md        # Template for Claude to fill in (optional)
├── examples/          # Example outputs (optional)
│   └── sample.md
├── scripts/           # Executable scripts (optional)
│   └── helper.py
└── references/        # Reference documentation (optional)
    └── api-docs.md
```

### Frontmatter Fields

#### `name` (Optional)
- **Type**: string
- **Default**: Directory name
- **Constraints**: Lowercase letters, numbers, and hyphens only. Max 64 characters.
- **Example**: `code-reviewer`
- **Description**: Display name for the skill. Becomes the `/slash-command`.

#### `description` (Recommended)
- **Type**: string
- **Default**: First paragraph of markdown content
- **Example**: `Explains code with visual diagrams and analogies`
- **Description**: What the skill does and when to use it. Claude uses this to decide when to apply the skill.

#### `argument-hint` (Optional)
- **Type**: string
- **Example**: `[issue-number]`, `[filename] [format]`
- **Description**: Hint shown during autocomplete to indicate expected arguments.

#### `disable-model-invocation` (Optional)
- **Type**: boolean
- **Default**: `false`
- **Possible Values**: `true`, `false`
- **Description**: If `true`, only user can invoke (prevents Claude from auto-loading). Use for workflows with side effects like `/deploy`.

#### `user-invocable` (Optional)
- **Type**: boolean
- **Default**: `true`
- **Possible Values**: `true`, `false`
- **Description**: If `false`, hidden from the `/` menu. Use for background knowledge users shouldn't invoke directly.

#### `allowed-tools` (Optional)
- **Type**: string (comma-separated) or array
- **Example**: `Read, Grep, Glob` or `Bash(python *)`
- **Description**: Tools Claude can use without asking permission when this skill is active.

#### `model` (Optional)
- **Type**: string
- **Possible Values**: `sonnet`, `opus`, `haiku`, `inherit`
- **Description**: Model to use when this skill is active.

#### `context` (Optional)
- **Type**: string
- **Possible Values**: `fork`
- **Description**: Set to `fork` to run in a forked subagent context (isolated execution).

#### `agent` (Optional)
- **Type**: string
- **Default**: `general-purpose`
- **Possible Values**: `Explore`, `Plan`, `general-purpose`, or any custom subagent name
- **Description**: Which subagent type to use when `context: fork` is set.

#### `hooks` (Optional)
- **Type**: object
- **Description**: Hooks scoped to this skill's lifecycle.
- **Example**:
  ```yaml
  hooks:
    PreToolUse:
      - matcher: "Bash"
        hooks:
          - type: command
            command: "./scripts/validate.sh"
  ```

### String Substitutions

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed when invoking the skill |
| `$ARGUMENTS[N]` | Specific argument by 0-based index (e.g., `$ARGUMENTS[0]`) |
| `$N` | Shorthand for `$ARGUMENTS[N]` (e.g., `$0`, `$1`) |
| `${CLAUDE_SESSION_ID}` | Current session ID |

### Dynamic Context Injection

Use `` !`command` `` syntax to run shell commands before skill content is sent to Claude:

```yaml
## Context
- PR diff: !`gh pr diff`
- Changed files: !`gh pr diff --name-only`
```

### Example Claude Code Skill File

```markdown
---
name: fix-issue
description: Fix a GitHub issue by number
argument-hint: [issue-number]
disable-model-invocation: true
allowed-tools: Read, Edit, Bash(gh *)
context: fork
agent: general-purpose
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description: !`gh issue view $0`
2. Understand the requirements
3. Implement the fix
4. Write tests
5. Create a commit
```

---

## Cursor Skills

**Source**: https://cursor.com/docs/context/skills

### File Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `.cursor/skills/` | Project | 1 (highest) |
| `.claude/skills/` | Project (compatibility) | 2 |
| `.codex/skills/` | Project (compatibility) | 3 |
| `~/.cursor/skills/` | User | 4 |
| `~/.claude/skills/` | User (compatibility) | 5 |
| `~/.codex/skills/` | User (compatibility) | 6 (lowest) |

### Directory Structure

```
skill-name/
├── SKILL.md           # Main instructions (required)
├── scripts/           # Executable scripts (optional)
├── references/        # Reference documentation (optional)
└── assets/            # Additional assets (optional)
```

### Frontmatter Fields

#### `name` (Required)
- **Type**: string
- **Constraints**: Must match parent folder name. Lowercase letters, numbers, and hyphens only.
- **Example**: `code-reviewer`
- **Description**: Skill identifier.

#### `description` (Required)
- **Type**: string
- **Example**: `Explains code with visual diagrams and analogies`
- **Description**: Explains the skill's purpose and appropriate usage scenarios for agent context.

#### `license` (Optional)
- **Type**: string
- **Example**: `MIT`, `./LICENSE`
- **Description**: Reference to a license name or bundled license file.

#### `compatibility` (Optional)
- **Type**: string
- **Description**: Documents environment requirements including system packages and network access.

#### `metadata` (Optional)
- **Type**: object
- **Description**: Arbitrary key-value mapping for additional metadata.
- **Example**:
  ```yaml
  metadata:
    author: "Jane Doe"
    version: "1.0.0"
  ```

#### `disable-model-invocation` (Optional)
- **Type**: boolean
- **Default**: `false`
- **Possible Values**: `true`, `false`
- **Description**: When `true`, skill acts as explicit command only; agent won't auto-apply based on context.

### Example Cursor Skill File

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
license: MIT
compatibility: Requires git CLI
metadata:
  author: "Team"
  version: "1.0"
disable-model-invocation: false
---

When reviewing code:

1. Check for common issues
2. Suggest specific improvements
3. Explain the reasoning
```

---

## Skills Field Mapping Table

### Direct Mappings

| Claude Code | Cursor | Notes |
|-------------|--------|-------|
| `name` (optional) | `name` (required) | Claude defaults to directory name |
| `description` (recommended) | `description` (required) | Same purpose |
| `disable-model-invocation` | `disable-model-invocation` | Identical field |

### Claude Code Only Fields

| Field | Purpose | Cursor Alternative |
|-------|---------|-------------------|
| `argument-hint` | Autocomplete hint | None |
| `user-invocable` | Hide from menu | None |
| `allowed-tools` | Tool permissions | None |
| `model` | Model selection | None |
| `context` | Fork execution | None |
| `agent` | Subagent type | None |
| `hooks` | Lifecycle hooks | None |

### Cursor Only Fields

| Field | Purpose | Claude Code Alternative |
|-------|---------|------------------------|
| `license` | License info | None (use separate LICENSE file) |
| `compatibility` | Environment requirements | None (document in SKILL.md) |
| `metadata` | Arbitrary key-value | None |

---

## Skills Conversion Rules

### Claude Code → Cursor

1. **Keep**: `name`, `description`, `disable-model-invocation`
2. **Remove**: `argument-hint`, `user-invocable`, `allowed-tools`, `model`, `context`, `agent`, `hooks`
3. **Add if needed**: `license`, `compatibility`, `metadata`
4. **Body**: Copy unchanged (both use Markdown)
5. **Note**: String substitutions (`$ARGUMENTS`, `$0`) and dynamic context (`` !`cmd` ``) won't work in Cursor

### Cursor → Claude Code

1. **Keep**: `name`, `description`, `disable-model-invocation`
2. **Remove**: `license`, `compatibility`, `metadata`
3. **Add if needed**: `argument-hint`, `allowed-tools`, `model`
4. **Body**: Copy unchanged
5. **Make `name` optional**: Claude Code defaults to directory name

---

## Claude Code Commands

**Source**: https://code.claude.com/docs/en/skills

**Note**: Custom slash commands have been merged into skills. A file at `.claude/commands/review.md` and a skill at `.claude/skills/review/SKILL.md` both create `/review` and work the same way. Existing `.claude/commands/` files keep working. Skills are recommended for new commands as they support additional features.

### File Locations

| Location | Path | Scope |
|----------|------|-------|
| Personal | `~/.claude/commands/<name>.md` | All your projects |
| Project | `.claude/commands/<name>.md` | This project only |

### File Format

Single Markdown file (not a directory like skills). Supports the same frontmatter as skills.

### Frontmatter Fields

Same as [Claude Code Skills](#claude-code-skills) - all fields are supported:
- `name`, `description`, `argument-hint`
- `disable-model-invocation`, `user-invocable`
- `allowed-tools`, `model`, `context`, `agent`, `hooks`

### Example Claude Code Command File

```markdown
---
description: Review code for quality and best practices
argument-hint: [file-or-directory]
disable-model-invocation: true
---

Review the code at $ARGUMENTS for:

1. Code quality and readability
2. Potential bugs or issues
3. Performance concerns
4. Security vulnerabilities

Provide specific, actionable feedback.
```

---

## Cursor Commands

**Source**: https://cursor.com/docs/context/commands

**Note**: Cursor commands are currently in beta. The feature and syntax may change.

### File Locations

| Location | Path | Scope |
|----------|------|-------|
| Project | `.cursor/commands/<name>.md` | This project only |
| Global | `~/.cursor/commands/<name>.md` | All your projects |
| Team | Cursor Dashboard | Server-enforced for team |

### File Format

Plain Markdown files. **No YAML frontmatter** - the entire file content is the command instruction.

### Frontmatter Fields

**None documented**. Cursor commands use plain Markdown without frontmatter.

### Example Cursor Command File

```markdown
Review the code for:

1. Code quality and readability
2. Potential bugs or issues
3. Performance concerns
4. Security vulnerabilities

Provide specific, actionable feedback.
```

---

## Commands Field Mapping Table

### Key Differences

| Aspect | Claude Code | Cursor |
|--------|-------------|--------|
| **Format** | Markdown with optional YAML frontmatter | Plain Markdown only |
| **Frontmatter** | Full skill frontmatter supported | None |
| **String substitutions** | `$ARGUMENTS`, `$0`, etc. | Not documented |
| **Dynamic context** | `` !`command` `` syntax | Not documented |
| **Invocation control** | `disable-model-invocation` | Not available |
| **Tool restrictions** | `allowed-tools` | Not available |

### Conversion Rules

#### Claude Code → Cursor

1. **Remove all frontmatter** - Cursor doesn't support it
2. **Remove string substitutions** - `$ARGUMENTS`, `$0` won't work
3. **Remove dynamic context** - `` !`cmd` `` won't work
4. **Keep body** - Plain Markdown content only
5. **Note**: Cursor commands lose invocation control and tool restrictions

#### Cursor → Claude Code

1. **Add frontmatter** (optional) - Can enhance with Claude Code features
2. **Consider adding**:
   - `description` - Helps Claude know when to use it
   - `argument-hint` - Improves autocomplete UX
   - `disable-model-invocation: true` - If user-only command
3. **Keep body** - Content works as-is

---

## Claude Code Memory & Rules

**Source**: https://code.claude.com/docs/en/memory

Claude Code uses CLAUDE.md files and `.claude/rules/` for persistent instructions.

### File Locations

| Type | Location | Scope | Shared With |
|------|----------|-------|-------------|
| Managed policy | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS)<br>`/etc/claude-code/CLAUDE.md` (Linux)<br>`C:\Program Files\ClaudeCode\CLAUDE.md` (Windows) | Organization-wide | All users in org |
| Project memory | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Project | Team (via source control) |
| Project rules | `./.claude/rules/*.md` | Project | Team (via source control) |
| User memory | `~/.claude/CLAUDE.md` | All projects | Just you |
| User rules | `~/.claude/rules/*.md` | All projects | Just you |
| Local project | `./CLAUDE.local.md` | Project | Just you (gitignored) |

**Priority**: Managed policy > Project memory > User memory (higher takes precedence)

### Directory Structure

```
project/
├── CLAUDE.md                    # Project memory (root)
├── CLAUDE.local.md              # Local project memory (gitignored)
└── .claude/
    ├── CLAUDE.md                # Project memory (alternative location)
    └── rules/
        ├── code-style.md        # Modular rules
        ├── testing.md
        ├── frontend/            # Subdirectories supported
        │   └── react.md
        └── backend/
            └── api.md
```

### File Format

Plain Markdown with optional YAML frontmatter for path-specific rules.

### Frontmatter Fields (Rules Only)

#### `paths` (Optional)
- **Type**: array of strings (glob patterns)
- **Description**: Scope rules to specific files. Rules without `paths` apply unconditionally.
- **Example**:
  ```yaml
  ---
  paths:
    - "src/api/**/*.ts"
    - "src/**/*.{ts,tsx}"
  ---
  ```

### Glob Pattern Examples

| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All TypeScript files in any directory |
| `src/**/*` | All files under `src/` |
| `*.md` | Markdown files in project root |
| `src/**/*.{ts,tsx}` | TypeScript and TSX files in src |
| `{src,lib}/**/*.ts` | TypeScript files in src or lib |

### Special Features

#### File Imports
Use `@path/to/file` syntax to import other files:
```markdown
See @README for project overview.
Git workflow: @docs/git-instructions.md
Personal prefs: @~/.claude/my-project-instructions.md
```
- Relative and absolute paths supported
- Max depth: 5 hops for recursive imports
- Not evaluated inside code blocks

#### Recursive Discovery
Claude Code reads CLAUDE.md files recursively up the directory tree. Working in `foo/bar/` loads both `foo/CLAUDE.md` and `foo/bar/CLAUDE.md`.

### Example Claude Code Rule File

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "tests/**/*.test.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
- Write tests for all new endpoints
```

---

## Cursor Rules

**Source**: https://cursor.com/docs/context/rules

Cursor uses rules for persistent instructions, with multiple file formats and locations.

### File Locations

| Type | Location | Scope | Notes |
|------|----------|-------|-------|
| Project rules | `.cursor/rules/*.md` or `.cursor/rules/*.mdc` | Project | Version-controlled |
| AGENTS.md | `./AGENTS.md` or subdirectories | Project | Plain markdown alternative |
| Legacy | `.cursorrules` | Project | Deprecated, still supported |
| Team rules | Cursor Dashboard | Organization | Server-enforced, no metadata |
| User rules | Cursor Settings → Rules | All projects | Personal preferences |

**Priority**: Team Rules > Project Rules > User Rules

### File Extensions

| Extension | Format | Frontmatter |
|-----------|--------|-------------|
| `.md` | Plain Markdown | None |
| `.mdc` | Markdown with frontmatter | Supported |

### Frontmatter Fields (.mdc files only)

#### `description` (Optional)
- **Type**: string
- **Description**: Presented to Cursor Agent to decide if rule should be applied.
- **Example**: `description: "Guidelines for React component development"`

#### `globs` (Optional)
- **Type**: string or array (glob patterns)
- **Description**: File patterns for scope-based application.
- **Example**: `globs: "src/**/*.tsx"`

#### `alwaysApply` (Optional)
- **Type**: boolean
- **Default**: `false`
- **Description**: If `true`, rule applies to every chat session.
- **Example**: `alwaysApply: true`

### Rule Types

| Type | How It Works | Configuration |
|------|--------------|---------------|
| **Always Apply** | Applied to every chat session | `alwaysApply: true` |
| **Apply Intelligently** | Agent decides based on description | Set `description` field |
| **Apply to Specific Files** | When file matches pattern | Set `globs` field |
| **Apply Manually** | When @-mentioned in chat | Use `@rule-name` |

### Constraints

- Keep rules under 500 lines
- User Rules apply only to Agent (Chat), not Inline Edit (Cmd/Ctrl+K)
- Team Rules cannot use metadata (plain text only)

### Example Cursor Rule File (.mdc)

```markdown
---
description: Guidelines for React component development
globs: "src/components/**/*.tsx"
alwaysApply: false
---

# React Component Rules

- Use functional components with hooks
- Keep components under 200 lines
- Extract reusable logic to custom hooks
- Use TypeScript for all new components
```

### Example Cursor Rule File (.md - no frontmatter)

```markdown
# React Component Rules

- Use functional components with hooks
- Keep components under 200 lines
- Extract reusable logic to custom hooks
```

---

## Rules/Memory Field Mapping Table

### Key Differences

| Aspect | Claude Code | Cursor |
|--------|-------------|--------|
| **File name** | `CLAUDE.md`, `.claude/rules/*.md` | `.cursor/rules/*.md`, `.mdc`, `.cursorrules` |
| **Path scoping field** | `paths` (array) | `globs` (string or array) |
| **Always apply** | No field (always loaded) | `alwaysApply: true` |
| **Description for AI** | Not supported | `description` field |
| **File imports** | `@path/to/file` syntax | Not supported |
| **Recursive discovery** | Yes (up directory tree) | Nested AGENTS.md only |
| **Organization rules** | Managed policy (file-based) | Team Rules (dashboard) |

### Conversion Rules

#### Claude Code → Cursor

1. **File location**: `CLAUDE.md` → `.cursor/rules/main.md` or `AGENTS.md`
2. **File location**: `.claude/rules/*.md` → `.cursor/rules/*.mdc`
3. **Convert frontmatter**:
   - `paths` → `globs`
4. **Remove**: `@import` syntax (not supported in Cursor)
5. **Add if needed**:
   - `description` for intelligent application
   - `alwaysApply: true` if rule should always apply
6. **Body**: Copy unchanged

#### Cursor → Claude Code

1. **File location**: `.cursor/rules/*.mdc` → `.claude/rules/*.md`
2. **File location**: `.cursorrules` → `CLAUDE.md`
3. **File location**: `AGENTS.md` → `CLAUDE.md`
4. **Convert frontmatter**:
   - `globs` → `paths`
5. **Remove**: `description`, `alwaysApply` (not supported)
6. **Body**: Copy unchanged
7. **Note**: Claude Code rules are always loaded (no intelligent/manual apply modes)

---

---

## Agent/Subagent Invocation Syntax

This section documents how agents invoke other agents (subagents) in different AI coding tools.

### Claude Code Invocation Pattern

**Source**: https://code.claude.com/docs/en/sub-agents

Claude Code uses the **Task tool** to invoke subagents. The Task tool creates a new agent thread with an isolated context.

#### Task Tool Syntax

```
Task tool with:
  subagent_type: <agent-name>
  prompt: "<instructions for the subagent>"
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `subagent_type` | string | Name of the agent to invoke (must match agent's `name` field) |
| `prompt` | string | Instructions/context to pass to the subagent |

#### Examples

**Example 1: Invoke URL content extractor**
```
Task tool with:
  subagent_type: url-content-extractor
  prompt: "Extract API documentation from https://example.com/docs"
```

**Example 2: Invoke feature checker**
```
Task tool with:
  subagent_type: feature-checker
  prompt: "Check implementation status for authentication module"
```

**Example 3: Invoke code reviewer**
```
Task tool with:
  subagent_type: code-reviewer
  prompt: "Review the changes in src/api/ for security issues"
```

#### In Agent Instructions

When documenting agent invocations in instructions, use this pattern:

```markdown
Use the Task tool to invoke the matched agent:
- For command requests → `subagent_type: command-editor`
- For skill creation → `subagent_type: skill-editor`
- For code review → `subagent_type: code-reviewer`
```

### Cursor Invocation Pattern

**Source**: https://cursor.com/docs/context/subagents

Cursor supports **two invocation patterns** for subagents:

#### 1. Explicit Invocation (Slash Command)

Use `/name` syntax to explicitly invoke a subagent:

```
/agent-name <instructions>
```

**Examples:**
```
/code-reviewer review the changes in src/api/
/debugger investigate this error
/security-auditor review the payment module
```

#### 2. Natural Language Invocation

Use natural language with the subagent name:

```
Use the <agent-name> subagent to <instructions>
Have the <agent-name> subagent <instructions>
Run the <agent-name> subagent on <instructions>
```

**Examples:**
```
Use the code-reviewer subagent to review the authentication flow
Have the debugger subagent investigate this memory leak
Run the security-auditor subagent on the payment module
```

#### In Agent Instructions

When documenting agent invocations in Cursor instructions, use this pattern:

```markdown
Invoke the appropriate agent:
- Command editing: /command-editor [instructions]
- Skill creation: /skill-editor [instructions]
- Code review: /code-reviewer [instructions]

Or use natural language:
- "Use the command-editor subagent to..."
- "Have the skill-editor subagent..."
```

### Conversion Guidelines

When converting agent instructions that reference subagent invocations:

#### Claude Code → Cursor

**Before (Claude Code):**
```markdown
Use the Task tool to invoke the reviewer:
- Set `subagent_type: code-reviewer`
- Pass the file path in the prompt
```

**After (Cursor):**
```markdown
Invoke the reviewer agent using:
- Explicit: /code-reviewer review src/api/auth.ts
- Natural: Use the code-reviewer subagent to review src/api/auth.ts
```

#### Cursor → Claude Code

**Before (Cursor):**
```markdown
Invoke the code reviewer:
- Use /code-reviewer followed by your request
- Or: Have the code-reviewer subagent check for security issues
```

**After (Claude Code):**
```markdown
Use the Task tool to invoke the code reviewer:
- Set `subagent_type: code-reviewer`
- Include your request in the prompt parameter
- Example: Task tool with subagent_type: code-reviewer, prompt: "Check for security issues"
```

### Key Differences Summary

| Aspect | Claude Code | Cursor |
|--------|-------------|--------|
| **Invocation method** | Task tool with parameters | `/name` slash commands or natural language |
| **Agent reference** | `subagent_type: name` parameter | `/name` or "the name subagent" |
| **Instructions** | `prompt` parameter | Text after `/name` or in natural phrase |
| **Multiple patterns** | Single pattern only | Explicit (`/name`) or natural language |
| **Nested invocations** | Neither tool supports nesting | Neither tool supports nesting |

### Update Strategy for Conversion

When converting files that contain agent invocation examples:

1. **Search patterns**:
   - Claude Code: `Task tool`, `subagent_type:`
   - Cursor: `/agent-name`, "Use the agent-name subagent", "Have the agent-name subagent"

2. **Replace invocation syntax**:
   - Claude Code → Cursor: Replace Task tool examples with `/name` or natural language
   - Cursor → Claude Code: Replace `/name` or natural language with Task tool examples

3. **Preserve semantics**:
   - The agent name stays the same (e.g., `code-reviewer`)
   - The instructions/prompt content stays the same
   - Only the invocation mechanism changes

4. **Common locations**:
   - Agent instruction sections
   - Skill/command documentation
   - Code examples and usage guides
   - Troubleshooting sections

---

## TODO: Additional Formats

When documentation is provided, add mappings for:
- [ ] Other tools (Codex, Aider, etc.)
