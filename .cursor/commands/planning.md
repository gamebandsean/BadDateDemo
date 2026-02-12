# Planning Command

Route project management requests to the appropriate specialized workflow based on user intent.

Classify the user's request, then run the matching workflow(s) in this conversation (see Workflow Execution). In Cursor you do not invoke other agents; you either adopt their instructions or perform the document updates yourself.

- **Project Editor**: For project descriptions and concepts
- **Design Editor**: For game mechanics and design documentation
- **Plan Editor**: For implementation plans and task breakdowns

## Intent Classification

| Intent Type | Description | Workflow |
|-------------|-------------|----------|
| `project` | Create/update project concept | Project Editor only |
| `design` | Create/update mechanics docs | Design Editor only |
| `plan` | Create/update task breakdown | Plan Editor only |
| `project_design` | Update both project and design | Project → Design |
| `design_plan` | Update design and plan | Design → Plan |
| `full_workflow` | Complete project setup | Project → Design → Plan |
| `unclear` | Cannot determine | Ask for clarification |

## Quick Shortcuts

Users can bypass intent classification with direct keywords:

| First Word | Routes To |
|-----------|-----------|
| `project` | Project Editor only |
| `design` | Design Editor only |
| `plan` | Plan Editor only |

## Workflow Execution

Execute workflows **in order** (they have dependencies). **In Cursor there is no Task tool**—run each workflow in this conversation by either:
1. **Adopting the agent's role**: Read the corresponding agent file (e.g. `.cursor/agents/management/project-editor.md`) and follow its instructions with the user's request, or
2. **Doing the updates directly**: Perform the document updates described below for each workflow.

### Project Editor Workflow
- Updates `data/docs/project.md`
- Handles: project concept, vision, target audience, high-level direction

### Design Editor Workflow
- Updates `data/docs/game-design.md`
- Handles: game mechanics, rules, parameters, interactions

### Plan Editor Workflow
- Updates `data/docs/tasks/OVERVIEW.md` and task files
- Handles: task structure, dependencies, implementation order

## Examples

| User Request | Intent | Workflow Sequence |
|-------------|--------|-------------------|
| "Create a tower defense game project" | `project` | Project Editor |
| "Add enemy AI mechanics" | `design` | Design Editor |
| "Break down work into tasks" | `plan` | Plan Editor |
| "Update project and add new mechanics" | `project_design` | Project → Design |
| "Add multiplayer and plan the work" | `design_plan` | Design → Plan |
| "Start a new game from scratch" | `full_workflow` | Project → Design → Plan |
| "Help with my game" | `unclear` | Ask for clarification |

## After Completion

Suggest logical next steps:
- After project only: "Run `/planning design` to create game design"
- After design only: "Run `/planning plan` to create implementation plan"
- After plan: "Ready to implement! Use `/execute` to start implementation"

## Document Locations

| Document | Path |
|----------|------|
| Project description | `data/docs/project.md` |
| Game design | `data/docs/game-design.md` |
| Implementation plan | `data/docs/tasks/OVERVIEW.md` |

## Clarification Questions

When intent is unclear, ask:
- "What would you like to work on?"
  - Project Description - Create or update the project concept and vision
  - Game Design - Create or update mechanics documentation
  - Implementation Plan - Create or update task breakdown
  - All of the above - Full workflow from project to plan

## Limitations (Cursor)

Note: Some features from the Claude Code version are not available:
- Automatic intent routing via subagent
- String substitution for arguments
