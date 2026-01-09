# Orchestrate Implementation

Orchestrates the complete implementation workflow by calling all related commands in the correct sequence to implement a task from start to finish.

## Overview

This command coordinates the entire task implementation process by automatically calling `write-code`, `implement-code`, `write-failing-tests`, `review-code`, and `implement-tests` in the proper sequence. It manages the workflow and ensures each step is completed before moving to the next.

**Important**: This command should:
- Automatically execute commands in the correct order
- Handle the workflow between commands
- Pass necessary information between commands
- Manage task status updates
- Handle errors and retries appropriately
- Provide clear progress updates to the user

## Steps

1. **Identify Task to Implement**
   - Look for task files in `docs/tasks/` folder
   - If a specific task file path is provided, use that
   - If a task description is provided, locate the corresponding task file
   - If no task is specified, ask the user to either:
     - Provide a path to a task file (e.g., `docs/tasks/paddle-movement.md`)
     - Select from available tasks in `docs/tasks/`
     - Provide a task description to locate

2. **Verify Task Status**
   - Read the task file to check current status
   - Verify the task is in `todo` or `progress` status
   - Check if any subtasks are already completed
   - If task is already `done`, inform the user and ask if they want to re-implement
   - If task is in `review`, check if it needs fixes before proceeding

3. **Read Task Description**
   - Read the task file completely
   - Understand what needs to be implemented from the task description
   - Tasks should be self-contained with all necessary information
   - Only if the task is ambiguous or missing critical information:
     - Read `docs/game-design.md` for mechanic specifications (if relevant)
     - Read `docs/project.md` for project context (if relevant)
     - Read `docs/tasks/OVERVIEW.md` for dependencies (if relevant)

4. **Check Dependencies**
   - Check if this task depends on other tasks (from task description or OVERVIEW.md if needed)
   - Verify that dependent tasks are completed
   - If dependencies are not met, inform the user and list what needs to be done first
   - Ask if the user wants to proceed anyway (if dependencies are optional)

5. **Execute Workflow Steps**

   **Step 1: Write Code**
   - Invoke `write-code` command with the task
   - Wait for code generation to complete
   - Verify code was generated successfully
   - If generation fails, report error and ask user how to proceed
   - Update task status to `progress`

   **Step 2: Implement Code**
   - Take the code from `write-code` output
   - Invoke `implement-code` command with the generated code
   - Wait for code organization to complete
   - Verify files were created successfully
   - If implementation fails, report error and ask user how to proceed
   - Update task status to `review`

   **Step 3: Write Failing Tests**
   - Take the implemented code files
   - Invoke `write-failing-tests` command with the code
   - Wait for test specifications to be created
   - Verify test specifications were generated
   - If test specification generation fails, report error and ask user how to proceed

   **Step 4: Review Code**
   - Take the implemented code files
   - Invoke `review-code` command with the code and task
   - Wait for code review to complete
   - Check review results:
     - If **APPROVED**: Continue to next step
     - If **NEEDS FIXES**: Report issues, ask user if they want to:
       - Fix issues manually and re-run review
       - Have AI attempt to fix issues automatically
       - Skip review and continue (not recommended)
     - If **REJECTED**: Report critical issues, ask user how to proceed
   - Only proceed if code is approved or user chooses to continue

   **Step 5: Implement Tests**
   - Take the test specifications from `write-failing-tests`
   - Invoke `implement-tests` command with the specifications
   - Wait for test implementation to complete
   - Verify tests were created and are passing
   - If test implementation fails, report error and ask user how to proceed
   - If tests don't pass, attempt to fix implementation or report issues

6. **Finalize Task**
   - If all steps completed successfully:
     - Update task status to `done` in the task file
     - Mark all task checkboxes as complete
     - Note completion date and summary
   - If steps were skipped or had issues:
     - Update task status appropriately
     - Note what was completed and what remains
     - List any issues that need attention

7. **Generate Summary Report**
   - Create a summary of what was accomplished:
     - Task that was implemented
     - Files created or modified
     - Tests created
     - Any issues encountered
     - Current status
   - Present the summary to the user
   - Highlight any follow-up actions needed

8. **Update Changelog**
   - Read the existing `CHANGELOG.md` file (create if it doesn't exist)
   - Append a new entry at the top with:
     - Current date and time (ISO 8601 format: YYYY-MM-DD HH:MM:SS)
     - Command name: `orchestrate-implementation`
     - Task implemented: [task name]
     - Files changed: Summary of files created/modified
   - Format: `[YYYY-MM-DD HH:MM:SS] orchestrate-implementation: Implemented [task name]`
   - Keep entries minimal and chronological (newest first)

## Workflow Sequence

```
1. write-code
   ↓
2. implement-code
   ↓
3. write-failing-tests
   ↓
4. review-code
   ↓ (if approved)
5. implement-tests
   ↓
6. Task Complete
```

## Error Handling

- **At any step**: If a command fails, report the error clearly
- **User choice**: Ask user how to proceed (retry, skip, fix manually, abort)
- **Retry logic**: Allow retrying failed steps if appropriate
- **Partial completion**: Track what was completed even if workflow doesn't finish
- **Status updates**: Keep task status accurate throughout the process

## User Interaction Points

- **Before starting**: Confirm task selection and dependencies
- **After write-code**: Show generated code, confirm before proceeding
- **After implement-code**: Show file structure, confirm before proceeding
- **After review-code**: Show review results, handle approval/fixes
- **After implement-tests**: Show test results, confirm completion
- **On errors**: Report issues and ask how to proceed

## Notes

- This command orchestrates other commands - it doesn't implement code directly
- Each step can be run independently if needed
- The workflow can be interrupted and resumed
- User can choose to skip steps if appropriate
- Progress is tracked and reported throughout
- Task status is updated at each major milestone
- Tasks should be self-contained with all necessary information
- Only read `docs/game-design.md` or `docs/project.md` if the task is ambiguous or missing critical information

