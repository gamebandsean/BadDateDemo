# Find Similar Games

Analyzes a project design document and identifies similar games that share key characteristics, systems, or mechanics.

## Overview

This command helps game designers and developers find reference games by analyzing project design documents created by the `define-project.md` command. It identifies games with similar core gameplay mechanics, feature sets, genre characteristics, and design philosophies.

**Important**: This command focuses on identifying similar games based on design and gameplay characteristics, not technical implementation details.

## Steps

1. **Locate Project Design Document**
   - Look for `project.md` in the workspace root or common locations
   - If a specific path is provided, use that path
   - If no document is found, check if the user wants to provide a project description directly
   - If the document doesn't exist and no description is provided, ask the user to either:
     - Provide the path to an existing design document
     - Run `define-project.md` first to create a design document
     - Provide a brief project description to analyze

2. **Extract Key Project Characteristics**
   - Read the project design document (or use provided description)
   - Identify core gameplay mechanics and systems
   - Note genre, perspective (2D/3D), and core loop
   - Extract key features and unique selling points
   - Identify target audience and game type
   - Focus on design elements, not technical implementation

3. **Identify Similarity Criteria**
   - Determine what makes games "similar" for this project:
     - Core mechanics (combat, exploration, puzzle-solving, etc.)
     - Genre (platformer, RPG, strategy, etc.)
     - Perspective and camera style
     - Progression systems
     - Core gameplay loop
     - Unique features or mechanics
   - Prioritize the most distinctive or important characteristics

4. **Search for Similar Games**
   - Use knowledge of games to identify matches based on:
     - Genre and subgenre
     - Core mechanics and systems
     - Feature similarities
     - Design philosophy
     - Target audience
   - Consider both well-known and niche games
   - Include games from various platforms and eras if relevant
   - Aim for 5-10 similar games (adjust based on project uniqueness)

5. **Analyze and Rank Similarities**
   - For each identified game, determine why it's similar:
     - Which systems or mechanics match
     - What features are shared
     - How the core loop compares
     - What design elements align
   - Note both similarities and key differences
   - Consider games that share partial similarities (e.g., similar combat but different genre)

6. **Present Results**
   - List each similar game with:
     - Game title and platform(s)
     - Brief explanation of why it's similar (2-3 sentences)
     - Key shared characteristics
   - Organize by relevance or similarity strength
   - Optionally group by similarity type (e.g., "Similar Mechanics", "Similar Genre")
   - Keep explanations concise but informative

**Important**: If the project description is too vague, ambiguous, or missing critical information needed to identify similar games, ask for clarification. Request specific details about core gameplay mechanics, genre or game type, key features or systems, target platform or audience, and unique characteristics.

