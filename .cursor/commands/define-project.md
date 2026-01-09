# Define Project

Helps define a project by creating a basic explanation of what the game/project is - a simple description document that captures the core concept and vision.

## Overview

This command helps document the basic concept and description of a project. It creates a simple, clear explanation of what the project/game is, focusing on the core concept and purpose rather than systems or architecture.

**Important**: This command should NOT identify systems, define relationships, break down subsystems, analyze architecture, or create design documents. It should only provide a basic explanation of what the project/game is.

## Steps

1. **Gather Project Information**
   - Ask the user to describe their project concept, vision, or goals
   - If the description is vague or incomplete, ask clarifying questions about:
     - Project type (game, application, tool, etc.)
     - Core purpose and what it does
     - Basic concept or gameplay idea
     - Target audience (if relevant)
   - If the user's request is ambiguous, unclear, or missing critical information, ask for clarification before proceeding

2. **Create Basic Description**
   - Write a clear, concise explanation of what the project is
   - Focus on the core concept and purpose
   - Keep it simple and accessible
   - Avoid technical details, system analysis, or implementation specifics
   - Use language that's accessible to both technical and non-technical stakeholders

3. **Find Similar Games/Projects**
   - Automatically invoke the `find-similar-games.md` command using the project description
   - Pass the project description to `find-similar-games.md` for analysis
   - Receive the list of similar games/projects with explanations
   - Add a "Similar Games/Projects" section to the document
   - Include each similar game with:
     - Game/project title and platform(s) if applicable
     - Brief explanation of why it's similar
     - Key shared characteristics
   - Note: For non-game projects, adapt this to find similar applications or tools instead

4. **Save Project Description**
   - Create a `docs` folder in the workspace root if it doesn't exist
   - Save the description document as `docs/project.md`
   - Format it in a clear, readable way

5. **Update Changelog**
   - Read the existing `CHANGELOG.md` file in the workspace root (create it if it doesn't exist)
   - Append a new entry at the top with:
     - Current date and time (ISO 8601 format: YYYY-MM-DD HH:MM:SS)
     - Command name: `define-project`
     - File changed: `docs/project.md`
   - Format: `[YYYY-MM-DD HH:MM:SS] define-project: Updated docs/project.md`
   - Keep entries minimal and chronological (newest first)
   - Save the changelog file

6. **Review and Refine**
   - Present the complete project description (including similar games/projects) to the user
   - Ask if the description accurately captures the project concept
   - Refine based on feedback

7. **Offer Game Design Generation**
   - After the project description is finalized, ask the user if they would like to generate a game design document
   - Explain that the game design document will focus on game mechanics based on the project description
   - If the user agrees, automatically invoke the `generate-game-design.md` command
   - Pass the completed `docs/project.md` to `generate-game-design.md` for analysis
   - If the user declines, the command is complete

