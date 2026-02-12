---
name: bug-tracker
description: Track and manage bugs throughout their lifecycle. Use when opening new bugs, updating bug status, closing bugs, or reviewing bug history. Triggers on keywords like "bug", "issue", "defect", "report bug", "close bug", "bug status", "reproduction steps", "attempted fixes".
---

# Bug Tracker

Run: `python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py <op> [args]`

## Operations

| Op | Args | Example |
|----|------|---------|
| `open` | `<title> [--severity=<sev>] [--description=<desc>]` | `open "Login fails with special chars" --severity=high` |
| `get` | `<bug_id>` | `get BUG-0042` or `get 42` |
| `update` | `<bug_id> [--status=<s>] [--severity=<s>] [--add-note=<n>] [--add-file=<f>] [--add-tag=<t>]` | `update 42 --status=in-progress --add-file="src/login.py"` |
| `close` | `<bug_id> <resolution> [--solution=<sol>]` | `close 42 fixed --solution="Used parameterized queries"` |
| `attempt` | `<bug_id> <description> <result> [--reverted]` | `attempt 42 "Tried escaping" "Still fails" --reverted` |
| `list` | `[--status=<s>] [--severity=<s>]` | `list --status=open --severity=critical` |
| `search` | `<query>` | `search "login password"` |
| `link` | `<bug_id1> <bug_id2>` | `link 42 43` |
| `stats` | | `stats` |

## Resolutions

- `fixed`: Bug was resolved with a code change
- `wont-fix`: Intentionally not addressing
- `duplicate`: Same as another bug
- `cannot-reproduce`: Unable to reproduce
- `by-design`: Behavior is intentional

## Severities

- `critical`: App crashes, data loss, security vulnerability, blocks all users
- `high`: Major feature broken, significant impact, no workaround
- `medium`: Feature partially broken, workaround exists
- `low`: Minor issue, cosmetic, edge case

## Statuses

- `open`: Bug reported, not yet worked on
- `in-progress`: Actively being investigated/fixed
- `closed`: Resolution reached

## Examples

```bash
# Open a new bug
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py open "Login fails with special chars in password" --severity=high

# Get bug details
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py get 42

# Update status and add investigation note
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py update 42 --status=in-progress --add-note="SQL injection in password field"

# Record a fix attempt
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py attempt 42 "Escaped special characters" "Still fails for quotes" --reverted

# Close as fixed with solution
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py close 42 fixed --solution="Used parameterized queries"

# List open critical bugs
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py list --status=open --severity=critical

# Search for bugs
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py search "password"

# Link related bugs
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py link 42 43

# Show statistics
python3 .cursor/skills/bug-tracker/scripts/bug_tracker.py stats
```

## Notes

- **Bug IDs**: Accept `42`, `BUG-42`, or `BUG-0042` formats
- **Duplicates**: Opening a bug warns about potential duplicates
- **Auto-status**: Recording an attempt on an `open` bug sets it to `in-progress`
