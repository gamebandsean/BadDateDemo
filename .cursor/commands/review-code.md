# Review Code

Performs a thorough, strict code review to ensure implemented code matches the task description and meets quality standards.

## Overview

This command reviews code that has been implemented to ensure it correctly implements the task requirements, follows best practices, and maintains code quality. This review is intentionally strict and picky, rejecting code that doesn't meet standards.

**Important**: This command should:
- Be very strict and thorough in code review
- Verify code matches the task description exactly
- Check code quality, readability, and maintainability
- Identify bugs, issues, and potential problems
- NOT accept code that doesn't meet standards
- Provide specific, actionable feedback
- Require fixes before approval

## Steps

1. **Locate Code to Review**
   - If code was just implemented, use those files
   - If specific file paths are provided, read those files
   - If a task file is provided, locate the corresponding implemented code
   - If no code is specified, ask the user to either:
     - Provide paths to the code files to review
     - Specify which task's code should be reviewed
     - Run `implement-code` first if code hasn't been organized yet

2. **Read Task Description**
   - Read the corresponding task file from `docs/tasks/` completely
   - Understand all requirements and expected behaviors from the task
   - Note any specific constraints or requirements mentioned in the task
   - Tasks should be self-contained with all necessary information
   - Only if the task is ambiguous or missing critical information:
     - Read `docs/game-design.md` for mechanic specifications (if relevant)
     - Read `docs/project.md` for project context (if relevant)
     - Understand how this task relates to other mechanics

3. **Read All Related Code**
   - Read all implemented code files completely
   - Read any related or dependent code
   - Understand the complete implementation
   - Check integration points with other systems
   - Review file organization and structure

4. **Verify Task Requirements**
   - Check that ALL task requirements are implemented
   - Verify that expected behaviors match the task description
   - Check that all specified functionality exists
   - Verify that edge cases from the task are handled
   - Check that integration points are correct
   - Identify any missing functionality
   - Identify any incorrect implementations

5. **Check Code Quality**
   - **Readability**: Code is clear and understandable
   - **Naming**: Names are descriptive and follow conventions
   - **Structure**: Code is well-organized and logical
   - **Comments**: Complex logic is explained
   - **DRY Principle**: No unnecessary code duplication
   - **SOLID Principles**: Code follows good design principles
   - **Error Handling**: Errors are handled appropriately
   - **Edge Cases**: Edge cases are handled
   - **Performance**: Code is reasonably efficient

6. **Check Project Conventions**
   - Verify code follows project's coding style
   - Check naming conventions match the project
   - Verify file organization matches project structure
   - Check that patterns match existing codebase
   - Verify dependencies are appropriate
   - Check that code integrates properly with existing systems

7. **Identify Issues**
   - **Critical Issues** (must fix):
     - Missing required functionality
     - Incorrect behavior that doesn't match task
     - Bugs that would cause runtime errors
     - Security issues
     - Breaking changes to existing functionality
   - **Major Issues** (should fix):
     - Code quality problems
     - Poor error handling
     - Missing edge case handling
     - Performance problems
     - Maintainability issues
   - **Minor Issues** (nice to fix):
     - Code style inconsistencies
     - Minor readability improvements
     - Documentation improvements

8. **Check Integration**
   - Verify code integrates with other systems correctly
   - Check that dependencies are properly managed
   - Verify that interfaces are correctly implemented
   - Check that events/callbacks work correctly
   - Verify that state management is correct
   - Check that the code doesn't break existing functionality

9. **Generate Review Report**
   - Create a comprehensive review report
   - List all issues found, categorized by severity
   - For each issue, provide:
     - Clear description of the problem
     - Specific location (file, line, method)
     - Why it's a problem
     - Suggested fix or improvement
   - Provide overall assessment:
     - **APPROVED**: Code meets all requirements and standards
     - **NEEDS FIXES**: Code has issues that must be addressed
     - **REJECTED**: Code doesn't meet requirements or has critical issues

10. **Present Review Results**
    - Present the review report clearly
    - Highlight critical issues first
    - Explain each issue and why it matters
    - Provide specific guidance on fixes needed
    - If code is approved, confirm and update task status
    - If code needs fixes, clearly state what must be fixed before approval

11. **Update Task Status**
    - If code is **APPROVED**:
      - Update task status to `done` in the task file
      - Mark task checkbox as complete
      - Note that code has been reviewed and approved
    - If code **NEEDS FIXES**:
      - Keep task status as `review`
      - List the issues that must be fixed
      - Note that code requires fixes before completion
    - If code is **REJECTED**:
      - Update task status to `progress`
      - Provide clear guidance on what needs to be redone
      - Note that significant changes are required

## Review Criteria

### Must Have (Critical)
- ✅ All task requirements are implemented
- ✅ Code matches task description exactly
- ✅ No runtime errors or bugs
- ✅ Proper error handling
- ✅ Code compiles and runs

### Should Have (Major)
- ✅ Code follows project conventions
- ✅ Good code quality and readability
- ✅ Proper separation of concerns
- ✅ Edge cases are handled
- ✅ Code is maintainable

### Nice to Have (Minor)
- ✅ Excellent documentation
- ✅ Optimal performance
- ✅ Perfect code style
- ✅ Comprehensive comments

## Review Standards

- **Be Strict**: Don't approve code that doesn't meet standards
- **Be Specific**: Provide exact locations and clear descriptions
- **Be Constructive**: Explain why issues are problems and how to fix them
- **Be Thorough**: Check everything, don't miss issues
- **Be Fair**: Acknowledge what's done well, but don't lower standards

## Notes

- This review is intentionally strict - code must meet all requirements
- All critical and major issues must be fixed before approval
- Minor issues should be noted but may not block approval
- The goal is to ensure high-quality, correct implementations
- Code that doesn't match the task description will be rejected
- Tasks should be self-contained with all necessary information
- Only read `docs/game-design.md` or `docs/project.md` if the task is ambiguous or missing critical information

