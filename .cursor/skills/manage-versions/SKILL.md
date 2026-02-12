---
name: manage-versions
description: Manage semantic versioning for project documents (project.md, game-design.md, tasks/OVERVIEW.md). Use this skill to read versions, determine version bumps, update version headers, maintain version history sections, track source document dependencies, and update CHANGELOG.md. Invoke when creating or updating versioned documents, checking version alignment, or maintaining document traceability.
disable-model-invocation: true
---

# Manage Versions

Manage semantic versioning for project documents following the versioning conventions used by project-editor, design-editor, and plan-editor commands.

## Name and path

- **Name:** `manage-versions`
- **Path:** `.cursor/skills/manage-versions/SKILL.md` (for agents/commands that resolve skills by path)

## Invocation (for agents)

Agents that create or update versioned documents (project-editor, design-editor, plan-editor) should invoke this skill by reading this SKILL.md and performing the steps for the required actions.

| Field | Value |
|-------|--------|
| **allowed-tools** | `read_file`, `edit_file` (or `search_replace`), `list_dir` — used to read documents, update version headers, append Version History and Task History sections, and append to CHANGELOG.md |
| **argument-hint** | `action` (required): one of `read`, `bump`, `check-sources`, `update-header`, `update-history`, `update-changelog`, `init-header`, `init-version-history`, `update-task-history`, `compare-versions`. Optional: `file_path`, `version_type`, `new_version`, `project_version`, `design_version`, `plan_version`, `changes`, `version_a`, `version_b`. Example: `action=read file_path=data/docs/project.md`; `action=update-changelog file_path=data/docs/project.md` with new version and optional source refs. |

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | The version action: `read`, `bump`, `check-sources`, `update-header`, `update-history`, `update-changelog`, `init-header`, `init-version-history`, `confirm-bump`, `update-task-history`, `compare-versions` |
| `file_path` | string | No | Path to the document (e.g., `data/docs/project.md`, `data/docs/game-design.md`) |
| `version_type` | string | No | Version bump type: `major`, `minor`, `patch` |
| `new_version` | string | No | New version number for update-header action |
| `project_version` | string | No | Current project.md version for source tracking |
| `design_version` | string | No | Current game-design.md version for source tracking |
| `changes` | array | No | List of change descriptions for history entries |
| `version_a` | string | No | First version for compare-versions action |
| `version_b` | string | No | Second version for compare-versions action |
| `plan_version` | string | No | Plan version for update-task-history action |

## Semantic Versioning Convention

All versioned documents follow semantic versioning (X.Y.Z):

| Version Part | When to Bump | Examples |
|--------------|--------------|----------|
| **Major (X.0.0)** | Fundamental concept/direction change | Project pivot, core mechanics overhaul, plan restructure |
| **Minor (0.X.0)** | New content/features added | New sections, new mechanics, phase reorganization |
| **Patch (0.0.X)** | Small fixes/clarifications | Typos, parameter tweaks, wording updates |

## Document Types and Their Versioning

### data/docs/project.md
```markdown
> **Version:** X.Y.Z
> **Last Updated:** YYYY-MM-DD
```
- Standalone versioning
- No source dependencies

### data/docs/game-design.md
```markdown
> **Version:** X.Y.Z
> **Last Updated:** YYYY-MM-DD
> **Based on Project Version:** A.B.C
```
- Tracks source: `data/docs/project.md` version

### data/docs/tasks/OVERVIEW.md
```markdown
> **Version:** X.Y.Z
> **Last Updated:** YYYY-MM-DD
> **Based on Project Version:** A.B.C
> **Based on Design Version:** D.E.F
```
- Tracks sources: `data/docs/project.md` and `data/docs/game-design.md` versions

### data/docs/tasks/README.md
```markdown
> **Plan Version:** X.Y.Z | **Project:** vA.B.C | **Design:** vD.E.F
```
- Compact single-line format for index file
- Shows same version info as OVERVIEW.md

### Individual Task Files (data/docs/tasks/[category]/[mechanic].md)
Task files have a **Task History** section (not Version History):
```markdown
---

## Task History

### [Plan vX.Y.Z] - YYYY-MM-DD
- Description of changes to this task
```
- References the plan version, not its own version
- Updated when tasks are modified during plan updates

## Version History Section Format

Located at the bottom of each document:

```markdown
---

## Version History

### X.Y.Z - YYYY-MM-DD
- Description of change 1
- Description of change 2

### Previous.Version - YYYY-MM-DD
- Previous changes...
```

**Version history entry formats by document type:**

| Document | Format | Example |
|----------|--------|---------|
| `project.md` | `### X.Y.Z - YYYY-MM-DD` | `### 1.2.0 - 2025-01-20` |
| `game-design.md` | `### X.Y.Z - YYYY-MM-DD (Based on Project vA.B.C)` | `### 1.2.0 - 2025-01-20 (Based on Project v1.3.0)` |
| `OVERVIEW.md` | `### X.Y.Z - YYYY-MM-DD (Project vA.B.C, Design vD.E.F)` | `### 1.2.0 - 2025-01-20 (Project v1.3.0, Design v1.2.0)` |

Note: `project.md` has NO source references (it's the root document). `game-design.md` references project version. `OVERVIEW.md` references both.

## Steps

### Action: read

Extract version information from a document.

1. Read the document
2. Parse the version header block (lines starting with `> **`)
3. Extract:
   - `version`: The document's version (X.Y.Z)
   - `last_updated`: The date
   - `based_on_project`: Project version (if applicable)
   - `based_on_design`: Design version (if applicable)
4. Return structured version info

**Regex patterns:**

For standard headers (project.md, game-design.md, OVERVIEW.md):
```
Version: /\*\*Version:\*\*\s*(\d+\.\d+\.\d+)/
Last Updated: /\*\*Last Updated:\*\*\s*(\d{4}-\d{2}-\d{2})/
Based on Project: /\*\*Based on Project Version:\*\*\s*(\d+\.\d+\.\d+)/
Based on Design: /\*\*Based on Design Version:\*\*\s*(\d+\.\d+\.\d+)/
```

For README.md compact format:
```
Plan Version: /\*\*Plan Version:\*\*\s*(\d+\.\d+\.\d+)/
Project (compact): /\*\*Project:\*\*\s*v(\d+\.\d+\.\d+)/
Design (compact): /\*\*Design:\*\*\s*v(\d+\.\d+\.\d+)/
```

### Action: bump

Calculate the new version number.

1. Read current version using `read` action
2. Parse version into major, minor, patch integers
3. Based on `version_type`:
   - `major`: Increment major, reset minor and patch to 0
   - `minor`: Increment minor, reset patch to 0
   - `patch`: Increment patch
4. Return new version string

**Example:**
- Current: `1.2.3`, Type: `minor` -> New: `1.3.0`
- Current: `1.2.3`, Type: `major` -> New: `2.0.0`
- Current: `1.2.3`, Type: `patch` -> New: `1.2.4`

### Action: check-sources

Check if source documents have newer versions than what the target was based on.

1. Determine source documents based on target:
   - `game-design.md` -> check `project.md`
   - `tasks/OVERVIEW.md` -> check `project.md` and `game-design.md`
2. Read target document, extract "Based on" versions
3. Read source documents, extract current versions
4. Compare versions using `compare-versions` action
5. Return list of outdated sources with old and new versions
6. Generate user-facing message based on document type

**Output:**
```json
{
  "is_current": false,
  "outdated_sources": [
    {
      "source": "data/docs/project.md",
      "was_version": "1.0.0",
      "current_version": "1.2.0"
    }
  ]
}
```

### Action: update-history

Add a new version history entry to a document.

1. Read the document
2. Locate the `## Version History` section
3. Check if there are existing entries (look for `###`)
4. If existing entries: Insert new entry BEFORE the first `###` (newest first)
5. If no existing entries (first version): Insert after `## Version History\n\n`
6. Format entry with:
   - Version number
   - Today's date (YYYY-MM-DD format)
   - Source version references (based on document type - see table above)
   - Bullet points for changes

### Action: init-version-history

Create the initial Version History section for a new document.

1. Generate the Version History section template
2. Include the initial 1.0.0 entry with source refs based on document type
3. Return the section text to be appended at the bottom of the document

### Action: init-header

Create initial version header for a new document.

1. Determine document type from file path
2. Generate appropriate header block for version 1.0.0
3. Return the header text to be inserted at the top of the document

### Action: update-header

Update the version header fields in a document.

1. Read the document
2. Update the specified fields:
   - Version number
   - Last Updated date (today's date)
   - Based on Project Version (if applicable)
   - Based on Design Version (if applicable)
3. For README.md, update the compact single-line format

### Action: confirm-bump

Ask user to confirm the version bump type.

1. Present the change context to user
2. Ask with options:
   - Question: "What type of change is this?"
   - Options based on document type:
     - For project.md: "Major (concept change)", "Minor (new content)", "Patch (small fix)"
     - For game-design.md: "Major (core mechanic change)", "Minor (new/updated mechanics)", "Patch (small tweaks)"
     - For OVERVIEW.md: "Major (plan restructure)", "Minor (new mechanics/phases)", "Patch (small updates)"
3. Return the selected version type

### Action: update-task-history

Add a history entry to an individual task file.

1. Read the task file
2. Locate the `## Task History` section
3. Insert new entry at top (newest first)
4. Format: `### [Plan vX.Y.Z] - YYYY-MM-DD`
5. Include bullet points for changes

### Action: compare-versions

Compare two semantic versions to determine if one is newer.

1. Parse both versions into (major, minor, patch) tuples
2. Compare component by component:
   - Compare major first
   - If equal, compare minor
   - If equal, compare patch
3. Return comparison result: `newer`, `older`, or `equal`

**Example:**
- `1.2.0` vs `1.10.0` -> `1.10.0` is newer (10 > 2)
- `2.0.0` vs `1.99.99` -> `2.0.0` is newer (2 > 1)

### Action: update-changelog

Append an entry to data/docs/CHANGELOG.md.

1. Check if `data/docs/CHANGELOG.md` exists
2. If not, create it: `mkdir -p docs && touch data/docs/CHANGELOG.md`
3. Get current timestamp in format: `YYYY-MM-DD HH:MM:SS`
4. Append entry:
   ```
   [TIMESTAMP] COMMAND: Updated FILE to version X.Y.Z (source refs)
   ```

## Examples

### Example 1: Read Version from project.md

**Input:** `read data/docs/project.md`
**Expected behavior:** Read file, parse version header
**Output:**
```json
{
  "version": "1.2.0",
  "last_updated": "2025-01-20",
  "based_on_project": null,
  "based_on_design": null
}
```

### Example 2: Bump Minor Version

**Input:** `bump data/docs/project.md minor`
**Expected behavior:** Read current version, calculate new version
**Output:** `1.2.0 -> 1.3.0`

### Example 3: Check Source Alignment

**Input:** `check-sources data/docs/game-design.md`
**Expected behavior:** Compare based-on version with current source version
**Output:**
```json
{
  "is_current": false,
  "outdated_sources": [
    {
      "source": "data/docs/project.md",
      "was_version": "1.0.0",
      "current_version": "1.2.0"
    }
  ],
  "message": "Project document has been updated from version 1.0.0 to 1.2.0"
}
```

## Version Bump Policy and Date Formats (Document Traceability)

- **Version bump policy**: major (concept/direction change), minor (new content/mechanics), patch (small fixes). Documented in this skill and in project-editor, design-editor, and plan-editor agent instructions.
- **Date format**: `YYYY-MM-DD` for version headers (Last Updated) and version history entries.
- **Changelog timestamp**: `YYYY-MM-DD HH:MM:SS` for every CHANGELOG.md entry. Every document update must produce exactly one timestamped entry.

## Notes

- **Date format**: Always use `YYYY-MM-DD` for dates
- **Timestamp format**: Use `YYYY-MM-DD HH:MM:SS` for changelog entries
- **Newest first**: Version history entries are listed newest at top
- **Source tracking**: Documents should always reflect which source versions they were based on
- **Changelog consistency**: Every version update should have a corresponding CHANGELOG.md entry
- **No version for new docs**: When creating a new document, start at version `1.0.0`

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| No version found | Document missing version header | Use `init-header` action to add header |
| Invalid version format | Version not in X.Y.Z format | Ensure version follows semantic versioning |
| Source not found | Based-on document doesn't exist | Verify source document path |
| History section missing | No Version History section | Add section before updating history |
| Task History missing | Task file lacks Task History section | Add `## Task History` section to task file |
| Unknown document type | File path doesn't match known patterns | Check file path matches data/docs/project.md, data/docs/game-design.md, data/docs/tasks/OVERVIEW.md, data/docs/tasks/README.md, or data/docs/tasks/[category]/[task].md |
| Version comparison error | Non-numeric version components | Ensure versions use only numbers and dots |

## Limitations (Cursor-specific)

**Note**: The following Claude Code features are NOT supported in Cursor:
- `$ARGUMENTS` string substitutions (parameter values must be passed differently)
- `argument-hint` field
- `user-invocable` field
- `allowed-tools` field
