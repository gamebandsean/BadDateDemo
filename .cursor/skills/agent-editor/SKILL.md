---
name: agent-editor
description: Create or edit agents (subagents). Use this skill when the user wants to create a new agent, modify an existing agent, or asks about agent configuration. Triggers on requests like "create an agent for...", "edit the X agent", "add a code review agent", or "make an agent that...".
---

# Agent Editor

Create or edit agents based on user requirements.

## Agent Basics

Agents (subagents) are markdown files with YAML frontmatter defining autonomous sub-processes. They run in isolated context windows with custom system prompts.

**Required Fields**: `name`, `description`

**Optional Fields**: `model`, `readonly`, `is_background`

**Storage Locations** (by priority):
1. `.cursor/agents/` (project-level, commit to version control)
2. `.claude/agents/` (compatibility fallback)
3. `~/.cursor/agents/` (user-level, all projects)

## Steps

### Step 0: Determine Mode

**Edit mode** if: file path mentioned, agent name with edit intent, or explicit edit request
- Search to find agent file if only name given
- Read existing file before proceeding

**Create mode** otherwise

### Step 1: Gather Requirements

Ask user if lacking detail about:
- Primary task/workflow
- Inputs/outputs
- Trigger scenarios (2-3 examples)
- Category (engineering, management, tools)

For edits: clarify which parts to modify and whether to add or replace functionality.

### Step 2: Check Existing Agents

Search `**/.cursor/agents/**/*.md` and `**/.claude/agents/**/*.md` to:
- Avoid duplicates
- Learn project patterns
- Find similar agents for reference

### Step 3: Design the Agent

#### Name & Category
- Lowercase letters and hyphens only (e.g., `api-doc-generator`)
- Categories: `engineering/`, `management/`, `tools/`

#### Model
- `inherit` - Use parent conversation's model (DEFAULT if omitted)
- `fast` - Faster model for simple tasks

#### Readonly (optional)
- `true` - Subagent runs with restricted write permissions
- `false` - Normal permissions (default)

#### Is Background (optional)
- `true` - Runs in background without waiting for completion
- `false` - Waits for completion (default)

#### Description Format
The description helps determine when to delegate tasks automatically. Keep it concise.

**Good examples:**
- `description: Reviews code for quality and best practices`
- `description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability.`

#### System Prompt Structure
1. **Role Definition**: "You are..."
2. **Core Responsibilities**: 2-5 titled areas
3. **Process**: Numbered steps with tool usage, decision points, validation
4. **Output Format**: Structure of deliverables
5. **Quality Standards**: Success criteria, things to avoid

### Step 4: Create/Edit Agent File

**Template**:
```markdown
---
name: agent-identifier
description: "[What it does]. Use proactively when [trigger condition]."
model: inherit
readonly: false
is_background: false
---

You are [role]. [Brief description.]

## Core Responsibilities

1. **[Area]**: Description
2. **[Area]**: Description

## Process

### Step 1: [Name]
- [Action]
- Validate [requirement]

### Step 2: [Name]
[Continue as needed]

## Output Format
[Describe deliverables]

## Quality Standards
- [Criterion]
- [Criterion]
```

**Minimal Template** (required fields only):
```markdown
---
name: agent-identifier
description: "[What it does]. Use proactively when [trigger]."
---

[System prompt content]
```

**For Creating**: Write to `.cursor/agents/[category]/[agent-name].md` (create directory with `mkdir -p` if needed)

**For Editing**: Apply changes, preserve unchanged sections, maintain formatting

### Step 5: Provide Usage Guidance

Include:
1. **Overview**: What it does, when to use
2. **Location**: File path, category
3. **Invocation examples**:
   - Explicit: `/agent-name [instructions]`
   - Natural language: "Use the agent-name subagent to..."
4. **Testing**: Example requests, expected output

## Examples

### Example 1: Create a Code Review Agent

**Input:** `create an agent that reviews code for security issues`
**Expected behavior:**
1. Ask clarifying questions about scope, languages, severity levels
2. Check existing agents for duplicates
3. Create `.cursor/agents/engineering/security-reviewer.md`
4. Provide usage guidance

### Example 2: Edit an Existing Agent

**Input:** `edit the fix-errors agent to also handle warnings`
**Expected behavior:**
1. Find agent with search: `**/.cursor/agents/**/*fix-errors*.md`
2. Read current agent file
3. Ask what aspects to modify
4. Update description and system prompt
5. Confirm changes

## Validation Checklist

Before finalizing any agent, verify:

- [ ] Name: lowercase letters and hyphens only, descriptive
- [ ] Description: simple string (1-2 sentences), includes trigger condition
- [ ] Model: omit for inherit, or specify `fast` for simple tasks
- [ ] readonly: `true` if agent shouldn't write files
- [ ] is_background: `true` if agent runs without waiting
- [ ] System prompt: clear structure (responsibilities, process, output, quality)
- [ ] Valid YAML frontmatter
- [ ] Correct category directory

## Common Patterns

| Type | Model | Readonly | Focus |
|------|-------|----------|-------|
| Engineering | inherit | false | Implementation, refactoring |
| Review | inherit | true | Code review, analysis |
| Management | inherit | false | Planning, documentation |
| Research | inherit | true | Information gathering |

## Notes

- Study existing agents for project conventions
- Single responsibility principle
- Detailed, actionable workflows
- Clear triggering conditions distinct from other agents
- Preserve existing functionality when editing
- Subagents cannot spawn other subagents

## Frontmatter Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Lowercase letters and hyphens only |
| `description` | Yes | Simple string (1-2 sentences) describing when to delegate |
| `model` | No | `inherit` (default), `fast` |
| `readonly` | No | `true` for read-only access, `false` (default) |
| `is_background` | No | `true` to run in background, `false` (default) |

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Agent not found | Invalid name or path | Search for files, list matches |
| Duplicate agent | Similar functionality exists | Ask user: edit existing, create anyway, or cancel |
| Invalid YAML | Malformed frontmatter | Validate YAML syntax before writing |
| Invalid name | Contains spaces or uppercase | Convert to lowercase-with-hyphens |

## Limitations (Cursor-specific)

**Note**: The following Claude Code features are NOT supported in Cursor agents:
- `tools` / `disallowedTools` fields (use `readonly` instead for read-only access)
- `permissionMode` field
- `skills` field (preloading skills)
- `hooks` field (lifecycle hooks)
- `disabled` field (delete file instead)
