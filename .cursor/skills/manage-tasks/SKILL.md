---
name: manage-tasks
description: Manage implementation tasks throughout their lifecycle. Use this skill to work with task files in `data/docs/tasks/`, including finding tasks, reading status, updating status, checking dependencies, and tracking overall progress. Invoke when orchestrating implementation work, tracking project progress, or coordinating multi-step development workflows.
---

# Manage Tasks

Manage implementation tasks throughout their lifecycle. Work with task files in `data/docs/tasks/`, including creating tasks, tracking status, managing dependencies, and maintaining progress records.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | The task action: `find`, `read`, `update-status`, `check-dependencies`, `track-progress` |
| `task_path` | string | No | Path to specific task file (e.g., `data/docs/tasks/foundation/player-movement.md`) |
| `task_name` | string | No | Task name to search for (e.g., `player-movement`) |
| `new_status` | string | No | New status when updating: `todo`, `progress`, `review`, `done` |

## Task File Structure

Tasks are stored in `data/docs/tasks/` organized by category folders:

```
data/docs/tasks/
├── README.md          # Index with progress tracking
├── OVERVIEW.md        # Plan overview with dependencies
├── foundation/        # Category folder
│   └── mechanic.md    # Individual task file
├── movement/          # Category folder
│   └── mechanic.md
└── combat/            # Category folder
    └── mechanic.md
```

### Individual Task File Format

```markdown
# [Mechanic Name] Tasks

## Status: [todo|progress|review|done]

## Implementation Order: [number]

## Category: [category-name]

## Depends On
- [Mechanic Name](../other-folder/mechanic.md) - Required
- [Other Mechanic](../folder/other.md) - Optional
- (None if no dependencies)

## Tasks

- [ ] Task description - Status: todo
- [ ] Task description - Status: todo
- [x] Task description - Status: done

---

## Task History

### [Plan vX.Y.Z] - YYYY-MM-DD
- Description of changes
```

## Status Definitions

| Status | Meaning | Transition From | Transition To |
|--------|---------|-----------------|---------------|
| `todo` | Not started | (initial) | `progress` |
| `progress` | Currently being worked on | `todo` | `review`, `done` |
| `review` | Complete, needs review/testing | `progress` | `done`, `progress` |
| `done` | Complete and verified | `review`, `progress` | - |

## Dependency Types

| Type | Meaning | Behavior |
|------|---------|----------|
| **Required** | Must be implemented first | Block implementation if not `done` |
| **Optional** | Beneficial but not blocking | Inform user but allow proceeding |

## Steps

### Action: find

1. Search with pattern `data/docs/tasks/**/*[task_name]*.md`
2. Return matching file paths

### Action: read

1. Read the task file
2. Parse the Status field
3. Extract dependencies list
4. Return structured information

### Action: update-status

1. Read current task file
2. Change `## Status: [old]` to `## Status: [new]`
3. If changing to `done`, mark all checkboxes as complete
4. Add entry to Task History section
5. Update `data/docs/tasks/README.md` progress counter

### Action: check-dependencies

1. Read task file
2. Parse "Depends On" section
3. For each dependency, read its task file and check status
4. Classify as blocking (Required not done) or non-blocking
5. Return whether implementation can proceed

### Action: track-progress

1. Find all `data/docs/tasks/**/*.md` files
2. Exclude README.md and OVERVIEW.md
3. Read each task file and extract status
4. Calculate totals and percentages
5. Identify tasks ready to start (dependencies met)

## Examples

### Example 1: Find a Task

**Input:** `find player-movement`
**Expected behavior:**
```bash
search pattern: data/docs/tasks/**/*player-movement*.md
```
**Output:** `Found: data/docs/tasks/foundation/player-movement.md`

### Example 2: Read Task Status

**Input:** `read data/docs/tasks/foundation/player-movement.md`
**Expected behavior:** Read file, parse Status, extract dependencies
**Output:**
```json
{
  "name": "Player Movement",
  "status": "todo",
  "order": 1,
  "category": "foundation",
  "dependencies": [],
  "tasks": [
    {"description": "Implement basic movement", "done": false}
  ]
}
```

### Example 3: Update Status

**Input:** `update-status data/docs/tasks/foundation/player-movement.md progress`
**Expected behavior:** Edit status line, add history entry, update README.md
**Output:** `Updated: todo -> progress`

### Example 4: Check Dependencies

**Input:** `check-dependencies data/docs/tasks/movement/advanced-movement.md`
**Expected behavior:** Parse dependencies, check each status, classify blocking/non-blocking
**Output:**
```json
{
  "can_proceed": false,
  "blocking": [
    {"name": "Player Movement", "status": "todo", "type": "Required"}
  ],
  "non_blocking": []
}
```

### Example 5: Track Progress

**Input:** `track-progress`
**Expected behavior:** Find all tasks, read statuses, calculate totals
**Output:**
```json
{
  "total": 15,
  "by_status": {"todo": 8, "progress": 2, "review": 1, "done": 4},
  "progress_percent": 26.7,
  "next_available": [{"name": "Score System", "dependencies_met": true}]
}
```

## Notes

- **Always read before edit**: Never update a task file without reading it first
- **Relative paths**: Dependencies use relative paths (e.g., `../foundation/mechanic.md`)
- **History tracking**: Every status change should add a Task History entry
- **README sync**: Keep README.md progress counter in sync with actual status
- **Dependency verification**: Always verify Required dependencies before starting work
- **Status transitions**: Follow valid transitions (todo->progress->review->done)

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Task not found | Invalid path or name | Verify path, search for files |
| Invalid status | Unknown status value | Use only: todo, progress, review, done |
| Circular dependency | A depends on B, B depends on A | Flag for user resolution |
| Missing dependency | Dependency file doesn't exist | Report missing file, ask user |

## Limitations (Cursor-specific)

**Note**: The following Claude Code features are NOT supported in Cursor:
- `$ARGUMENTS` string substitutions (parameter values must be passed differently)
- `argument-hint` field
- `user-invocable` field
