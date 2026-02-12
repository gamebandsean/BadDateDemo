---
name: command-editor
description: Create or edit custom slash commands. Use when user wants to create a new slash command, modify an existing command, or asks about command automation. Triggers on keywords like "create command", "edit command", "slash command", "custom command", "/command-editor", "automate with command".
---

# Command Editor

Create or edit custom slash commands based on user requirements.

## Understanding Slash Commands

Slash commands are markdown files stored in `.cursor/commands/` that define reusable prompts. When a user types `/command-name`, the agent reads and executes the instructions in that file.

### Key Features
- **Simple Markdown Files**: Natural language instructions
- **Project or Personal Scope**: Project commands in `.cursor/commands/`, personal in `~/.cursor/commands/`
- **Filename = Command Name**: `deploy.md` creates `/deploy` command

### Key Difference from Claude Code

**Cursor commands have NO YAML frontmatter** - they are plain Markdown only. Features like `allowed-tools`, `argument-hint`, and parameter substitution (`$ARGUMENTS`) are not supported.

## Steps

### Step 0: Determine Operation Mode

First, determine whether this is a create or edit operation:

1. **Check if a command file is specified**: Look for patterns like:
   - File path mentioned (e.g., `.cursor/commands/test/run-tests.md`)
   - Command name with edit intent (e.g., "edit the deploy command", "modify /run-tests")
   - Explicit edit request with existing command

2. **If editing an existing command**:
   - Search to find the command file if only name is provided
   - Read the existing command file
   - Proceed to Step 1 (Edit Mode)

3. **If creating a new command**:
   - Proceed to Step 1 (Create Mode)

### Step 1: Gather Requirements

#### For Creating New Commands
Ask the user:
- What task needs automation?
- Is it project-specific or personal?
- What defines success?

#### For Editing Existing Commands
- Read the current command file content
- Understand what changes are requested
- Ask for clarification if the edit request is ambiguous

### Step 2: Check Existing Commands

#### For Creating
Search for similar commands to avoid duplication:
- Find all `.md` files in `.cursor/commands/`
- Search for similar functionality
- Review existing commands to maintain consistency

#### For Editing
- Verify the command file exists
- Check if changes might conflict with other commands
- Ensure consistency with project patterns

### Step 3: Design the Command

Plan the following:
- **Command name**: Verb-noun pattern (e.g., `run-tests`, `deploy-app`) in kebab-case
- **Category**: Which subdirectory (e.g., `test/`, `deploy/`, `git/`, `build/`)
- **Workflow**: Step-by-step logic
- **Validation**: How to verify success

#### For Editing
- Preserve existing functionality unless explicitly asked to remove it
- Maintain the same command structure and style

### Step 4: Write the Command File

Create or edit markdown with:

1. **Clear goal statement**: What the command does

2. **Step-by-step instructions**: Use imperative language ("Run...", "Check...", "Generate...")

3. **Validation steps**: Check inputs and verify success

4. **Error handling**: Handle failure scenarios

#### For Editing
- Apply modifications to the file
- Preserve sections that aren't being changed
- Maintain consistent formatting with the original

### Step 5: Create or Update the File

#### For Creating
1. Ensure parent directory exists: `mkdir -p .cursor/commands/[category]`
2. Write the markdown file to `.cursor/commands/[category]/[command-name].md`
3. Confirm file was created successfully

#### For Editing
1. Apply changes to the file
2. Verify the edit was successful
3. Confirm the updated command maintains valid structure

### Step 6: Provide Documentation

After creating or editing the command, provide:
- **Command Overview**: What it does and when to use it
- **Command Name**: The command (e.g., `/deploy-app`)
- **File Path**: Where it's saved (e.g., `.cursor/commands/deploy/deploy-app.md`)
- **Changes Made** (for edits): Summary of what was modified
- **Usage Examples**: Basic usage: `/command-name`
- **Expected Behavior**: What happens when run

## Command Structure Examples

### Simple Command
```markdown
Run the full test suite with coverage reporting.

Steps:
1. Execute `npm test -- --coverage`
2. Verify all tests pass
3. Display coverage summary
4. Warn if coverage is below 80%
```

### Complex Command
```markdown
Deploy the application to the specified environment.

Steps:
1. Ask user which environment (staging or production)
2. Run build: `npm run build`
3. Deploy to the selected environment
4. Check health endpoint for confirmation
5. Report deployment status and URL
```

## Quality Checklist

Before finalizing, verify:
- [ ] Command name follows kebab-case (verb-noun pattern)
- [ ] Filename matches command name
- [ ] Instructions are specific, actionable, and use imperative verbs
- [ ] Steps are numbered and in logical order
- [ ] Error handling is specified
- [ ] Success criteria are clear
- [ ] File saved in appropriate category directory
- [ ] (For edits) Existing functionality preserved unless explicitly asked to remove

## Directory Organization

Organize commands into categories:
```
.cursor/commands/
├── build/
│   ├── build-prod.md
│   └── analyze-bundle.md
├── test/
│   ├── run-tests.md
│   └── coverage-report.md
├── git/
│   ├── create-pr.md
│   └── sync-branch.md
└── deploy/
    ├── deploy-staging.md
    └── deploy-prod.md
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Command not found | Invalid path or name | Verify path, search for files |
| Duplicate command | Name already exists | Rename or offer to edit existing |
| Missing directory | Parent category doesn't exist | Create with `mkdir -p` |

## Limitations (Cursor-specific)

**Note**: The following Claude Code features are NOT supported in Cursor commands:
- YAML frontmatter (Cursor commands are plain Markdown only)
- `$ARGUMENTS` or `$1`, `$2` parameter substitution
- `allowed-tools` field
- `argument-hint` field
- `` !`command` `` dynamic context injection
