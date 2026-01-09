# Write Failing Tests

Analyzes implemented code and generates a list of tests that should fail, helping identify what needs to be tested and ensuring test coverage.

## Overview

This command analyzes code that has been implemented (either from `write-code` or `implement-code`) and generates a comprehensive list of tests that would currently fail. These tests serve as a specification of what the code should do and help ensure proper test coverage.

**Important**: This command should:
- Analyze the implemented code thoroughly
- Generate tests that would fail (test-driven approach)
- Cover all functionality, edge cases, and error conditions
- Write test specifications, not test implementations
- Focus on what should be tested, not how tests are implemented
- NOT implement the actual test code (that's handled by `implement-tests`)

## Steps

1. **Locate Code to Analyze**
   - If code was just implemented, use those files
   - If specific file paths are provided, read those files
   - If a task file is provided, locate the corresponding implemented code
   - If no code is specified, ask the user to either:
     - Provide paths to the implemented code files
     - Specify which task's code should be analyzed
     - Run `implement-code` first if code hasn't been organized yet

2. **Read Task Description**
   - Read the corresponding task file from `docs/tasks/` completely
   - Understand what the code is supposed to accomplish from the task
   - Note any specific requirements or behaviors mentioned in the task
   - Identify expected outcomes and edge cases mentioned in the task
   - Tasks should be self-contained with all necessary information
   - Only if the task is ambiguous or missing critical information:
     - Read `docs/game-design.md` for mechanic specifications (if relevant)

3. **Analyze Code Implementation**
   - Read all relevant code files completely
   - Understand the code structure and organization
   - Identify all public methods and functions
   - Identify all public properties and fields
   - Identify state management and data flow
   - Identify dependencies and interactions
   - Note any complex logic or algorithms
   - Identify error handling and edge cases

4. **Identify Test Scenarios**
   - For each public method/function:
     - Normal operation scenarios
     - Edge cases (boundary conditions, null values, empty collections)
     - Error conditions (invalid inputs, exceptions)
     - State transitions
   - For each property/field:
     - Initialization and default values
     - Valid value assignments
     - Invalid value handling
   - For interactions:
     - Integration with other components
     - Event handling
     - Callback execution
   - For state management:
     - State transitions
     - Concurrent access (if applicable)
     - State persistence

5. **Generate Failing Test Specifications**
   - Create a test specification document
   - For each test scenario, write:
     - Test name (descriptive of what it tests)
     - Test description (what behavior is being verified)
     - Expected behavior (what should happen)
     - Current state (why it would fail - the code doesn't implement this yet, or implements it incorrectly)
     - Test type (unit test, integration test, etc.)
   - Organize tests by component/class
   - Group related tests together
   - Include both positive and negative test cases
   - Include edge cases and boundary conditions
   - Include error handling tests

6. **Check Test Coverage**
   - Ensure all public methods are covered
   - Ensure all important behaviors are covered
   - Ensure edge cases are covered
   - Ensure error conditions are covered
   - Identify any gaps in test scenarios
   - Note any areas that might be difficult to test

7. **Create Test Specification File**
   - Create a test specification file (e.g., `docs/tests/[component-name]-tests.md`)
   - Or append to an existing test specification file
   - Format tests clearly with:
     - Component/class being tested
     - Test categories (normal cases, edge cases, errors)
     - Individual test specifications
   - Use clear, descriptive test names
   - Include notes about test setup requirements if needed

8. **Output Test Specifications**
   - Present the test specifications to the user
   - Explain the test coverage approach
   - Highlight any areas that need special attention
   - Note any assumptions about test implementation
   - Indicate which tests are highest priority

9. **Update Task Status (Optional)**
   - If tests are for a specific task, note in the task file that test specifications have been created
   - Mark any testing-related subtasks appropriately

## Test Specification Format

Each test should be specified as:
```markdown
### [Test Name]
**Description**: [What this test verifies]
**Expected Behavior**: [What should happen when this test runs]
**Current State**: [Why this test would fail - what's missing or incorrect]
**Test Type**: [unit/integration/system]
**Priority**: [high/medium/low]
```

## Test Categories

- **Normal Operation**: Tests for expected, typical usage
- **Edge Cases**: Boundary conditions, empty inputs, maximum values
- **Error Handling**: Invalid inputs, exception scenarios, error recovery
- **Integration**: Interactions with other components
- **State Management**: State transitions, persistence, concurrency

## Notes

- Tests are written as specifications, not implementations
- Focus on what should be tested, not how to implement tests
- Include both positive and negative test cases
- Prioritize tests based on importance and risk
- Test specifications should be clear enough for `implement-tests` to use
- Tasks should be self-contained with all necessary information
- Only read `docs/game-design.md` if the task is ambiguous or missing critical information

