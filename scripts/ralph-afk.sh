#!/bin/bash

# afk-ralph-ui.sh
# Usage: ./afk-ralph-ui.sh <iterations>
# Runs UI tests using Claude Code with Chrome MCP and fixes issues found

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

echo "========================================="
echo "Starting afk-ralph-ui.sh (UI Testing)"
echo "Total iterations: $1"
echo "========================================="
echo ""

# For each iteration, run Claude Code with UI testing prompt
for ((i=1; i<=$1; i++)); do
  echo "----------------------------------------"
  echo "UI Test Iteration $i of $1"
  echo "----------------------------------------"
  echo "Running Claude Code with Chrome MCP..."
  echo ""

  result=$(claude --dangerously-skip-permissions --permission-mode acceptEdits -p \
"@plans/template-selection-prd.json @progress.txt\
\
# OBJECTIVE\
Identify the highest priority task from progress.txt and plans/template-selection-prd.json. Work on ONLY ONE task.\
\
# WORKFLOW\
1. **Select Task**: Prioritize in this order:\
   1. Architectural decisions and core abstractions\
   2. Integration points between modules\
   3. Unknown unknowns and spike work\
   4. Standard features and implementation\
   5. Polish, cleanup, and quick wins\
\
2. **Implement**: \
   - Keep changes small and focused (one logical change per commit).\
   - If a task feels too large, break it into subtasks.\
   - Run feedback loops after each change, not at the end.\
   - Quality over speed.\
   - use TDD approach to write tests for new features.\
\
3. **Verify** (Run ALL before committing):\
   - TypeScript: \`pnpm run typecheck\` (must pass with no errors)\
   - Tests: \`pnpm run test\` (must pass)\
   - Check: \`pnpm run check\` (must pass)\
   - UI (if UI changes): use playwright MCP to verify UI changes AND run \`pnpm run test:e2e\` (must pass)\
   - Database: run \`pnpm run db:push\` and check for any migration issues\
   *Do NOT commit if any feedback loop fails. Fix issues first.*\
\
4. **Document**: Append to \`progress.txt\`:\
   - Task completed and PRD item reference\
   - Key decisions made and reasoning\
   - Files changed\
   - Any blockers or notes for next iteration\
   *Keep entries concise. Sacrifice grammar for the sake of concision.*\
   - update plans/template-selection-prd.json with the completed task to "passes": true.\
5. **Commit**: Make a git commit of that feature.\
\
# TERMINATION \
If all critical and high priority tests pass with no issues, output <promise>UI_TESTS_PASS</promise>.")

  echo ""
  echo "Claude Code execution completed for iteration $i"
  echo "Checking for completion signal..."
  echo ""
  echo "Result: $result"

  if [[ "$result" == *"<promise>UI_TESTS_PASS</promise>"* ]]; then
    echo "========================================="
    echo "✓ All critical UI tests passing! Exiting."
    echo "========================================="
    ~/.claude/notify-email.sh
    exit 0
  fi

  echo "Iteration $i finished. Continuing to next iteration..."
  echo ""
done

# All iterations completed, push to GitHub
echo "========================================="
echo "All $1 iterations completed."
echo "Pushing to GitHub..."
echo "========================================="
git push

# Send notification
echo "Sending notification..."
~/.claude/notify-email.sh
