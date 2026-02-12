---
name: skill-editor
description: Create or edit skills following the AgentSkills.io standard. Use when user wants to create a new skill, modify an existing skill, or asks about skill configuration. Triggers on keywords like "create skill", "edit skill", "new skill", "skill-editor", "SKILL.md", or "make a skill that...".
---

# Skill Editor

Create or edit skills based on user requirements.

## Understanding Skills

Skills follow the [AgentSkills.io](https://agentskills.io) open standard. Each skill is a **directory** containing a `SKILL.md` file with frontmatter and markdown instructions.

### Key Features
- **Directory-based**: Each skill lives in `.cursor/skills/<skill-name>/`
- **SKILL.md Required**: Main instructions file with YAML frontmatter
- **Project or Personal Scope**: Project skills in `.cursor/skills/`, personal in `~/.cursor/skills/`
- **Optional Supporting Files**: `scripts/`, `references/`, `assets/` subdirectories

### Directory Structure

```
.cursor/skills/<skill-name>/
├── SKILL.md           # Required - main instructions
├── scripts/           # Optional - executable code
├── references/        # Optional - additional docs
└── assets/            # Optional - templates, data files
```

## Steps

### Step 0: Determine Operation Mode

Analyze the request to determine whether this is a create or edit operation:

1. **Edit Mode** indicators:
   - File path mentioned (e.g., `.cursor/skills/my-skill/SKILL.md`)
   - Skill name with edit intent (e.g., "edit the deploy skill", "modify my-skill")
   - Explicit edit request with existing skill

2. **Create Mode** indicators:
   - Capability description (e.g., "skill for parsing JSON")
   - "create skill for...", "make a skill that..."
   - No existing skill matches

3. **Ambiguous**: Search `.cursor/skills/**/SKILL.md`, ask user to clarify

---

## EDIT MODE

### Step 1: Find the Skill

Search `.cursor/skills/**/SKILL.md`:
- If multiple matches, list and ask user to select
- If none found, offer to create a new skill

### Step 2: Read and Analyze

- Load the SKILL.md file
- Identify frontmatter fields and content sections
- Understand current functionality

### Step 3: Get Edit Type

Ask user:
- "What would you like to modify?"
- Options: "Update frontmatter" | "Modify instructions" | "Add supporting files" | "Change invocation settings"

### Step 4: Apply Changes

- Apply modifications to the file
- Preserve sections not being changed
- Confirm modifications were successful
- Provide updated file path

Then STOP.

---

## CREATE MODE

### Step 1: Check for Duplicates

Search for similar skills:
- Search `.cursor/skills/**/SKILL.md`
- Search for similar functionality
- If found, ask: edit existing, create anyway, or cancel

### Step 2: Generate Skill Name

Based on the request, suggest a name following these rules:
- **Max 64 characters**
- **Lowercase letters, numbers, and hyphens only** (`a-z`, `0-9`, `-`)
- **Must NOT start or end with hyphen**
- **No consecutive hyphens** (`--`)
- Pattern: `verb-noun` or `verb-noun-qualifier` (e.g., `parse-json`, `validate-email`)

Confirm with user or let them provide custom name. **Validate name before proceeding.**

### Step 3: Gather Requirements

Ask user:

**Invocation** - "Who should invoke this skill?"
Options:
- "Both user and agent (Recommended)" - Default behavior
- "User only" - Add `disable-model-invocation: true`

**Execution** - "How should this skill run?"
Options:
- "Inline (Recommended)" - Runs in current context

### Step 4: Create Skill Directory and File

```bash
mkdir -p .cursor/skills/<skill-name>
```

Write `.cursor/skills/<skill-name>/SKILL.md`:

```yaml
---
name: <skill-name>
description: <What this skill does and when to use it. Include keywords that help identify relevant tasks. Max 1024 chars.>
# Optional fields:
# disable-model-invocation: true
# license: MIT
# compatibility: Requires git CLI
# metadata:
#   author: "Team"
#   version: "1.0"
---

<Markdown instructions to follow when skill is invoked>

## Steps

1. [First step - be specific about tools/methods]
2. [Second step]
3. [Validation/error handling]

## Examples

### Example 1: [Scenario]
**Input:** `[input]`
**Expected behavior:** [what should happen]

## Notes

- [Edge cases, limitations, best practices]
```

### Step 5: Confirm Creation

Report:
- Skill name and location
- Invocation method (`/skill-name` or automatic)
- How to test it
- Mention editing with skill-editor for future changes

Then STOP.

---

## SKILL.md Format Reference

### Required Frontmatter

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Must match directory name. Max 64 chars, lowercase + hyphens only |
| `description` | Yes | What it does and when to use. Max 1024 chars. Include trigger keywords |

### Optional Frontmatter

| Field | Description |
|-------|-------------|
| `disable-model-invocation` | `true` = only user can invoke via `/name` |
| `license` | License name or reference to LICENSE file |
| `compatibility` | Environment requirements (max 500 chars) |
| `metadata` | Arbitrary key-value pairs (e.g., `author`, `version`) |

## Quality Standards

**Good skills**:
- Focused (one task well)
- Clear description with trigger keywords
- Well-documented with examples
- Under 500 lines (move details to `references/`)

**Name validation checklist**:
- [ ] Lowercase only
- [ ] No spaces (use hyphens)
- [ ] No consecutive hyphens
- [ ] Doesn't start/end with hyphen
- [ ] Matches directory name
- [ ] Max 64 characters

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Skill not found | Invalid path or name | Verify path, search for files |
| Invalid frontmatter | Malformed YAML | Check syntax, ensure proper indentation |
| Duplicate skill | Name already exists | Rename or offer to edit existing |
| Missing directory | Parent doesn't exist | Create with `mkdir -p` |
| Invalid name | Uppercase, spaces, or special chars | Convert to valid kebab-case |

## Limitations (Cursor-specific)

**Note**: The following Claude Code features are NOT supported in Cursor:
- `$ARGUMENTS` string substitutions
- `` !`command` `` dynamic context injection
- `argument-hint` field
- `user-invocable` field
- `allowed-tools` field
- `model` field
- `context: fork` field
- `agent` field
- `hooks` field
