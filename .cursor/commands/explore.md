# Project Explore Command

Explore and analyze the complete state of your project by ensuring bidirectional coverage between tasks and code. Every task must have verified implementation, and every code file must be associated with a task.

## Goal

Provide comprehensive bidirectional coverage by:
1. Reading project documentation, design specs, and implementation plans
2. Checking which planned tasks/features are already implemented in the codebase
3. Tracking ALL code-related files in the project
4. Verifying that EVERY code file is associated with a task
5. Creating task files for any code that lacks task documentation
6. Grouping related code files into logical task units
7. Creating a detailed exploration report showing complete project state and coverage

## Output Requirements

This command produces:

1. **Task files** for EVERY code file/feature that lacks task documentation
   - Location: `data/docs/tasks/[category]/[feature-name].md`
   - Group related code files into logical task units

2. **Exploration report** summarizing all findings
   - Location: `data/docs/EXPLORATION_REPORT.md`
   - Complete coverage map showing which code files map to which tasks

## Steps

### Step 1: Discover Project Documents

Check and load all project documentation:

1. **Project Description**: `data/docs/project.md`
2. **Game Design Document**: `data/docs/game-design.md`
3. **Implementation Plan**: `data/docs/tasks/OVERVIEW.md`
4. **Changelog**: `data/docs/CHANGELOG.md`

### Step 2: Load All Task Files

1. Find all task files in `data/docs/tasks/**/*.md`
2. Extract: task name, status, category, dependencies
3. Build inventory of planned tasks

### Step 3: Check Implementation Status

For each task/feature found (do this analysis in this conversation; Cursor has no Task tool to invoke find-feature):
1. Search codebase for related implementations (Grep, codebase search, Read)
2. Determine status: Implemented, Not Found, or Partially Implemented
3. Build status map

### Step 4: Catalog ALL Code Files

1. **Discover all code files** using appropriate glob patterns for the project
2. **Exclude**: `.claude/`, `.git/`, `.cursor/`, config files, node_modules, etc.
3. **Analyze code structure** to identify logical groupings
4. **Verify task coverage** for each file/group

### Step 5: Create Task Files for Orphaned Code

For each file or file group without task coverage:

1. **Group related files** into logical tasks
2. **Determine category** based on file location or purpose
3. **Create task file** at `data/docs/tasks/[category]/[feature-name].md`

Task file template:
```markdown
# [Feature Name]

> **Status:** done
> **Category:** [category]
> **Discovery:** Discovered during exploration

## Description
[What this feature/component does]

## Implementation Details
Found in:
- [file path 1]
- [file path 2]

## Tasks
- [x] done: Implement core functionality
- [ ] todo: Document this feature (if needed)
- [ ] todo: Add tests (if missing)
```

### Step 6: Generate Exploration Report

Create `data/docs/EXPLORATION_REPORT.md` with:

- Coverage summary (total files, mapped files, orphaned files)
- Documentation status
- Implementation status overview
- Bidirectional coverage analysis
- Recommendations
- Complete file-to-task mapping

### Step 7: Present Findings

Summarize:
- Document status
- Task completion rate
- Features found vs documented
- Action items

## Bidirectional Coverage

**Task → Code (Forward)**: For each task, verify code exists
**Code → Task (Reverse)**: For each code file, verify task exists

Goal: **Zero orphaned files** - every piece of code should be tracked.

## File Grouping Guidelines

- Files in same directory/module that work together → One task
- Files with shared naming patterns → One task
- Files with import dependencies → One task
- Match grouping from existing tasks when possible

## Error Handling

- **No documentation**: Inform user, suggest `/planning`, still scan codebase
- **Unclear structure**: Use broad glob patterns, ask user if needed
- **Task creation fails**: Log failures, continue with others

## Limitations (Cursor)

Note: Some features from the Claude Code version are not available:
- **No Task tool**: You cannot invoke the find-feature agent. Do implementation checks and code→task mapping yourself in this conversation (search, read files, determine status). Optionally follow the approach in `.cursor/agents/management/find-feature.md` or `feature-checker.md` if needed.
- String substitution for arguments
