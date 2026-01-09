# Write Code

Generates complete code logic for a specific task from the implementation plan, outputting the entire implementation as a cohesive unit.

## Overview

This command reads a task from `docs/tasks/` and generates the complete code logic needed to implement that task. The output is a single, complete code solution that addresses all aspects of the task description. This code is meant to be comprehensive and functional, but not yet organized into separate files.

**Important**: This command should:
- Generate complete, working code logic for the entire task
- Output code as a single cohesive unit (not split into files)
- Focus on implementing exactly what the task describes
- Include all necessary logic, error handling, and edge cases
- Use appropriate programming patterns and best practices
- NOT split code into separate files (that's handled by `implement-code`)
- NOT write tests (that's handled by `write-failing-tests`)

## Steps

1. **Locate Task**
   - Look for task files in `docs/tasks/` folder
   - If a specific task file path is provided, use that path
   - If a task description is provided directly, use that
   - If no task is specified, ask the user to either:
     - Provide a path to a task file (e.g., `docs/tasks/paddle-movement.md`)
     - Provide a specific task description
     - List available tasks from `docs/tasks/` for selection

2. **Read Task Description**
   - Read the specified task file completely
   - Understand all requirements, expected behaviors, and constraints from the task
   - Note any tweakable parameters, edge cases, or integration points mentioned in the task
   - Tasks should be self-contained with all necessary information
   - Only if the task is ambiguous or missing critical information:
     - Read `docs/game-design.md` for mechanic specifications (if relevant)
     - Read `docs/project.md` for project context (if relevant)
     - Read `docs/tasks/OVERVIEW.md` for dependencies (if relevant)
     - Ask clarifying questions about:
       - Specific requirements or constraints
       - Expected behavior or outcomes
       - Integration points with other systems
       - Any technical constraints or preferences

3. **Analyze Task Requirements**
   - Break down the task into logical components
   - Identify all functionality that needs to be implemented (from task description)
   - Identify data structures and state management needs
   - Identify interactions with other systems/mechanics (from task description)
   - Identify edge cases and error conditions (from task description)
   - Note any tweakable parameters mentioned in the task
   - Understand the complete scope of the implementation

4. **Check Existing Codebase**
   - Search the codebase for existing related code
   - Identify existing classes, interfaces, or utilities that should be used
   - Understand the project's code structure and conventions
   - Identify where this code should integrate
   - Check for existing patterns or architectural decisions
   - If conflicting patterns exist, ask the user which approach to follow

5. **Generate Complete Code Logic**
   - Write the complete implementation as a single code block
   - Include all necessary:
     - Class/struct definitions
     - Methods and functions
     - Properties and fields
     - Initialization logic
     - Update/processing logic
     - Event handling (if applicable)
     - Error handling
     - Edge case handling
   - Use appropriate programming patterns for the codebase
   - Follow existing code style and conventions
   - Include comments explaining complex logic
   - Make code self-contained and complete
   - Ensure code addresses all aspects of the task description

6. **Output Code**
   - Present the complete code as a formatted code block
   - Include a brief explanation of the approach
   - Highlight any key design decisions
   - Note any assumptions made
   - Indicate where this code should be placed (general location, not specific files yet)
   - If the code is large, organize it logically with clear sections

7. **Update Task Status (Optional)**
   - If the user confirms the code is acceptable, update the task status to `progress` in the task file
   - Mark the task checkbox if appropriate
   - Note that the code has been written but not yet implemented

## Output Format

The code should be presented as:
- A complete, working implementation
- Well-commented and organized
- Following the project's coding standards
- Ready to be split into files by `implement-code` command

## Notes

- This command outputs code logic, not file structure
- The code should be complete and functional as written
- Code splitting and file organization is handled by `implement-code`
- Test writing is handled by `write-failing-tests`
- Code review is handled by `review-code`
- Tasks should be self-contained with all necessary information (tweakable parameters, requirements, etc.)
- Only read `docs/game-design.md` or `docs/project.md` if the task is ambiguous or missing critical information

