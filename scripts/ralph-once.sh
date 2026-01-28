#!/bin/bash

prompt="@plans/fluttering-kindling-truffle.json @progress-fluttering.txt

# OBJECTIVE
Identify the highest priority task from progress-fluttering.txt and plans/fluttering-kindling-truffle.json. Work on ONLY ONE task.

# WORKFLOW
1. **Select Task**: Prioritize in this order:
   1. Architectural decisions and core abstractions
   2. Integration points between modules
   3. Unknown unknowns and spike work
   4. Standard features and implementation
   5. Polish, cleanup, and quick wins

2. **Implement**: 
   - Keep changes small and focused (one logical change per commit).
   - If a task feels too large, break it into subtasks.
   - Run feedback loops after each change, not at the end.
   - Quality over speed.
   - use TDD approach to write tests for new features.

3. **Verify** (Run ALL before committing):
   - TypeScript: \`pnpm run typecheck\` (must pass with no errors)
   - Tests: \`pnpm run test\` (must pass)
   - Check: \`pnpm run check\` (must pass)
   - UI (if UI changes): use playwright MCP to verify UI changes AND run \`pnpm run test:e2e\` (must pass)
   - Database: run \`pnpm run db:push\` and check for any migration issues
   *Do NOT commit if any feedback loop fails. Fix issues first.*

4. **Document**: Append to \`progress-fluttering.txt\`:
   - Task completed and PRD item reference
   - Key decisions made and reasoning
   - Files changed
   - Any blockers or notes for next iteration
   *Keep entries concise. Sacrifice grammar for the sake of concision.*
   - update plans/fluttering-kindling-truffle.json with the completed task to "passes": true.
5. **Commit**: Make a git commit of that feature.
"

claude --dangerously-skip-permissions --chrome --permission-mode acceptEdits "$prompt"