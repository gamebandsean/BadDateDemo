# Create New Cursor Command

## Overview
Helps create new Cursor commands by generating properly formatted command files following the standard Cursor command pattern.

## Steps

1. **Gather command requirements**
   - Request command name (use kebab-case, e.g., "refactor-code", "generate-tests")
   - Understand the command's purpose and functionality
   - Identify any specific requirements or examples
   - If information is ambiguous or missing, ask for clarification before proceeding

2. **Create command file**
   - Generate a markdown file in `.cursor/commands/` directory
   - Use the standard Cursor command pattern:
     - `# [Command Name]` as the title
     - `## Overview` section with brief description
     - `## Steps` section with numbered steps and sub-bullets
     - Include any relevant checklists or additional sections as needed

3. **Format the command**
   - Follow the pattern shown in Cursor documentation examples
   - Include clear, actionable steps
   - Add implementation guidelines
   - Provide examples if applicable
   - Ensure instructions to ask for clarification on ambiguous prompts are included

4. **Verify completeness**
   - Check that the command file is properly formatted
   - Ensure all required information is present
   - Confirm the command follows best practices

## Command Creation Checklist
- [ ] Command name provided (kebab-case format)
- [ ] Clear purpose and functionality defined
- [ ] Command file created in `.cursor/commands/`
- [ ] Follows standard Cursor command pattern
- [ ] Includes Overview and Steps sections
- [ ] Implementation guidelines are clear
- [ ] Examples provided if applicable
- [ ] Instructions to request clarification on ambiguous prompts included
