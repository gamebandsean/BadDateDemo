# Tooling Command

Route requests to the appropriate specialized editor based on user intent.

## Available Editors

### command-editor
- **Triggers**: Create or edit slash commands, automate workflows
- **Keywords**: "slash command", "command", "/command", "create command", "edit command", "custom command", "automate"

### agent-editor
- **Triggers**: Create or edit agents (subagents), configure agent tools/permissions
- **Keywords**: "agent", "subagent", "create an agent", "edit agent", "make an agent"

### skill-editor
- **Triggers**: Create or edit skills
- **Keywords**: "skill", "SKILL.md", "create skill", "edit skill", "make a skill"

### cursor-to-claude
- **Triggers**: Convert Cursor IDE commands or rules to Claude Code agents
- **Keywords**: "cursor", "cursorrules", ".mdc", "migrate from cursor", "convert cursor"

### ai-tool-converter
- **Triggers**: Convert agent files between AI coding assistant formats
- **Keywords**: "convert agent", "convert to cursor", "convert to claude", "agent format", "migrate agent"

## Routing Rules

| User Request Pattern | Route To |
|---------------------|----------|
| "create a slash command...", "edit /command", "custom command" | command-editor |
| "create an agent...", "edit the X agent", "make an agent that" | agent-editor |
| "create a skill...", "edit skill", "SKILL.md" | skill-editor |
| "convert cursor command", "migrate from cursor", ".cursorrules" | cursor-to-claude |
| "convert agent to cursor", "convert to claude format" | ai-tool-converter |

## Process

1. **Analyze Request**: Identify the primary task and matching keywords
2. **Match to Editor**: Compare request against triggers and keywords
3. **Delegate** (Cursor has no Task tool; use one of these):
   - **Preferred**: Adopt the matched editor's role—follow that agent's instructions (from `.cursor/agents/tools/<name>.md`) and do the work in this conversation with the user's full request.
   - **Alternative**: Tell the user to invoke the matched editor explicitly (e.g. "Run /command-editor and paste your request" or "Use the command-editor agent with: …").
4. **Return Result**: Deliver the outcome (created/edited file, summary, or handoff instructions)

## Example Routing

- "create a slash command to run tests" → command-editor
- "make an agent that reviews code" → agent-editor
- "edit the skill-editor skill" → skill-editor
- "convert my cursor commands to claude code" → cursor-to-claude
- "convert the fix-errors agent to Cursor format" → ai-tool-converter

## If No Match

When no appropriate editor matches the request, list available options:
- **command-editor**: For slash commands and workflow automation
- **agent-editor**: For agents/subagents
- **skill-editor**: For skills
- **cursor-to-claude**: For converting Cursor IDE commands/rules to Claude Code
- **ai-tool-converter**: For converting agent files between AI tool formats

## Limitations (Cursor)

Note: Some features from the Claude Code version are not available:
- **No Task tool**: This command cannot programmatically "call" another agent. Delegation means either (1) you adopt the matched editor's instructions and do the work here, or (2) you tell the user to invoke that editor (e.g. `/command-editor`).
- String substitution for arguments (e.g. `$ARGUMENTS`) in commands
