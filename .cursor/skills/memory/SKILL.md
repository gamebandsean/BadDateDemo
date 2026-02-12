---
name: memory
description: Persistent key-value storage for agents and commands. Store, retrieve, update, delete, and list data across sessions. Each caller gets its own namespace. Use when agents need to remember state, cache results, or share data. Triggers on "store", "remember", "recall", "persist", "memory".
---

# Memory Skill

Run: `python3 .cursor/skills/memory/scripts/memory.py <op> [args]`

## Operations

| Op | Args | Example |
|----|------|---------|
| `store` | `<ns> <key> <value>` | `store bug-tracker current BUG-42` |
| `get` | `<ns> <key>` | `get bug-tracker current` -> `BUG-42` |
| `delete` | `<ns> <key>` | `delete bug-tracker current` |
| `list` | `<ns>` | `list bug-tracker` -> lists keys |
| `list-all` | | `list-all` -> lists namespaces |
| `clear` | `<ns>` | `clear bug-tracker` -> deletes namespace |
| `exists` | `<ns> <key>` | `exists bug-tracker current` -> true/false |
| `keys` | `<ns> [pattern]` | `keys bug-tracker "task-*"` |

## Examples

```bash
# Store string
python3 .cursor/skills/memory/scripts/memory.py store myagent key1 "hello world"

# Store JSON
python3 .cursor/skills/memory/scripts/memory.py store myagent config '{"debug": true}'

# Retrieve (JSON auto-formatted)
python3 .cursor/skills/memory/scripts/memory.py get myagent config
```

## Notes

- **Namespace**: Use your agent/command name (e.g., `bug-tracker`)
- **Values**: Auto-parsed as JSON if valid, otherwise stored as string
