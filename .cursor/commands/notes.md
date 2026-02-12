# Notes Management Command

Manage personal notes with categorization, duplicate detection, archiving, and project integration.

## Storage Locations

- **Active notes**: `data/docs/notes/active/`
- **Archived notes**: `data/docs/notes/archive/`
- **Memory cache (Cursor)**: Use file-based approach or `data/memory/`; no built-in cache path

## Note Format

Each note is a markdown file with YAML frontmatter:

```yaml
---
id: [unique-id]
type: todo | reminder | bug | idea | question | reference
title: [short title]
created: [ISO date]
updated: [ISO date]
status: active | archived
priority: high | medium | low
tags: [list of tags]
related_files: [list of project files if applicable]
project_context: [optional project info]
---

[Note content]
```

## Supported Actions

Parse the first word of user input to determine the action:

| Action | Aliases | Description |
|--------|---------|-------------|
| `add` | `new`, `create` | Create a new note |
| `list` | `ls`, `show` | List active notes (optionally filter by type) |
| `find` | `search`, `query` | Search notes by content or metadata |
| `next` | `suggest`, `tackle` | Suggest which note to work on next |
| `close` | `done`, `complete`, `archive` | Archive a note |
| `compare` | `duplicates`, `redundant` | Find similar or redundant notes |
| `view` | `read`, `get` | View a specific note |
| `edit` | `update`, `modify` | Edit an existing note |
| `archive-search` | `archived`, `history` | Search in archived notes |
| `restore` | `unarchive`, `reopen` | Restore an archived note |
| `types` | `categories` | List note types with counts |
| `recent` | `history`, `last` | Show recently accessed notes |
| `prefs` | `preferences`, `config` | View or set user preferences |
| `stats` | `statistics` | Show note statistics |
| `rebuild-index` | `reindex` | Force rebuild of note index cache |

## Process

### Step 0: Ensure Directory Structure

1. Check if `data/docs/notes/active/` exists, create if not: `mkdir -p data/docs/notes/active`
2. Check if `data/docs/notes/archive/` exists, create if not: `mkdir -p data/docs/notes/archive`

### Step 1: Parse Arguments

Extract action and remaining content from user input:
- First word = action (case-insensitive)
- Rest = content/query/note-id depending on action
- If no arguments provided, default to `list`

### Step 2: Execute Action

Execute the appropriate action based on the parsed input.

## Action Details

### ADD (add, new, create)

1. Parse note content from user input
2. Auto-detect note type from content:
   - Contains "fix", "error", "broken", "crash" → `bug`
   - Contains "remember", "don't forget", "remind" → `reminder`
   - Contains "should", "need to", "must", "task" → `todo`
   - Contains "what if", "maybe", "could" → `idea`
   - Contains "how", "why", "what", "?" → `question`
   - Otherwise → `reference`

3. Check for duplicates in active notes
4. Check for duplicates in archive
5. Check for project relevance
6. Generate unique ID: Use format `YYYYMMDD-HHMMSS-[random4chars]`
7. Create note file at `data/docs/notes/active/[id].md`
8. Confirm creation

### LIST (list, ls, show)

1. Read all notes from `data/docs/notes/active/*.md`
2. Filter by type if type argument provided
3. Group by type and display with priority indicators

### FIND (find, search, query)

1. Search active notes using grep
2. Display results with context
3. Offer to search archive if no results

### NEXT (next, suggest, tackle)

1. Score each note based on priority, age, type, and project relevance
2. Sort by score and display top 3 suggestions

### CLOSE (close, done, complete, archive)

1. Find the note by ID or search term
2. Update frontmatter with archived status
3. Move to archive folder

### VIEW (view, read, get)

1. Find the note
2. Display full content

### EDIT (edit, update, modify)

1. Find and read the note
2. Ask what to change
3. Apply changes

## Examples

```
/notes add Remember to update the API documentation for v2
/notes add bug The login form crashes on mobile Safari
/notes list
/notes list todo
/notes find authentication
/notes next
/notes close abc123
/notes compare
/notes archive-search old feature
/notes restore xyz789
/notes types
/notes recent
/notes stats
```

## Limitations (Cursor)

Note: Some features from the Claude Code version are not available:
- Memory script integration for caching (use file-based approach instead)
- Automatic preference loading (preferences must be specified each time)
- String substitution for arguments
