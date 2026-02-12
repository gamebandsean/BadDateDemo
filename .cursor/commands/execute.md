# Execute Command

Coordinate project iteration and refinement by understanding iteration requests (bugs, feedback, changes) and routing them to the appropriate workflow.

## Goal

Help users discuss and implement changes to completed projects by classifying intent and routing to the correct workflow.

## Intent Classification

When user provides an iteration request, classify it as one of:

| Intent Type | Description | Action |
|-------------|-------------|--------|
| `bug` | Bug report affecting a mechanic | Update design documentation |
| `feature` | New feature addition | Update design docs, then implementation plan |
| `parameter_tweak` | Adjusting existing parameters | Update design documentation only |
| `task_update` | Task completion notification | Direct to task management |
| `implement` | Start implementing a task | Begin implementation workflow |
| `concept_change` | Major project pivot | Update project, design, and plan docs |
| `unclear` | Cannot determine intent | Ask for clarification |

## Routing

Based on intent classification, route to appropriate workflow:

### Bug Report Affecting Mechanic
1. Read `data/docs/game-design.md` for context
2. Update the relevant mechanic documentation

### Feature Addition
1. Read `data/docs/game-design.md` and `data/docs/tasks/OVERVIEW.md`
2. Update design documentation with new feature
3. Update implementation plan with new tasks

### Parameter Tweak
1. Read `data/docs/game-design.md` for current parameters
2. Update only the affected parameter values

### Task Completion
Direct user: "To mark the task as complete, update the task status in `data/docs/tasks/`"

### Start Implementation
1. Read `data/docs/tasks/OVERVIEW.md` to find the task
2. Begin implementation workflow

### Complex Multi-Document Change (concept_change)
- **Invoke in order:** `project-editor` → `design-editor` → `plan-editor`
- **To project-editor:** User's concept/pivot description; update `data/docs/project.md` first.
- **To design-editor:** Align design with the updated project (user's concept change).
- **To plan-editor:** Align implementation plan with updated project and design (reorganize or regenerate tasks as needed).

## Documents

| Domain | Document Location |
|--------|------------------|
| project | `data/docs/project.md` |
| design | `data/docs/game-design.md` |
| tasks | `data/docs/tasks/OVERVIEW.md` |

## Example Scenarios

**Bug Report**: "The ball bouncing mechanic is buggy"
- Classify as `bug`
- Invoke **design-editor** with: "Update the ball bouncing mechanic documentation to reflect this bug/feedback: [user message]"

**Feature Addition**: "Let's add a new power-up system"
- Classify as `feature`
- Invoke **design-editor** with the feature request; then invoke **plan-editor** to add tasks for the new feature

**Parameter Tweak**: "The game is too hard, reduce ball speed"
- Classify as `parameter_tweak`
- Invoke **design-editor** with: "Reduce ball speed (or adjust difficulty) in game-design.md as requested"

**Unclear Request**: "Let's work on my project"
- Classify as `unclear`
- Ask: "What would you like to work on?" (Project concept / Game mechanics / Implementation tasks)

## Validation

Before invoking agents:
- Verify relevant documents exist (project.md, game-design.md, tasks/ as needed)
- Ensure classification is confident; if unclear, ask the user

After the agent(s) complete:
- Confirm version numbers were incremented and CHANGELOG updated (agents follow document traceability)
- User understands which agent(s) were invoked and what to do next

## Error Handling

If documents don't exist:
- Inform user that project documentation is missing
- Suggest using `/planning` for initial project setup
- This command is for iteration on completed projects

## Limitations (Cursor)

- If the environment cannot invoke agents by name, tell the user which agent to use (e.g. "Use the **design-editor** agent and ask it: …") and paste the prompt to pass.
- String substitution for arguments and dynamic context injection may not be available; pass the user's request and context in plain language to the agent.
