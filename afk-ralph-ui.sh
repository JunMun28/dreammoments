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

# Ensure dev server is running
echo "Checking if dev server is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "Dev server not running. Starting it in background..."
  pnpm dev &
  DEV_PID=$!
  echo "Waiting for dev server to start..."
  sleep 10

  # Verify server started
  if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "ERROR: Dev server failed to start"
    exit 1
  fi
  echo "Dev server started (PID: $DEV_PID)"
else
  echo "Dev server already running on port 3000"
fi

echo ""

# For each iteration, run Claude Code with UI testing prompt
for ((i=1; i<=$1; i++)); do
  echo "----------------------------------------"
  echo "UI Test Iteration $i of $1"
  echo "----------------------------------------"
  echo "Running Claude Code with Chrome MCP..."
  echo ""

  result=$(claude --dangerously-skip-permissions --chrome --permission-mode acceptEdits -p \
"@ui-test-cases.json @progress.txt \

# OBJECTIVE \
Run UI tests from ui-test-cases.json using Chrome browser automation. Fix any UI issues found. \

# WORKFLOW \
1. **Select Test Suite**: Pick the next untested or failing test suite from ui-test-cases.json. \
   Prioritize in this order: \
   1. Critical priority tests \
   2. High priority tests \
   3. Tests that previously failed \
   4. Medium priority tests \

2. **Execute Tests**: \
   - Use Chrome MCP tools (mcp__claude-in-chrome__*) to automate browser interactions \
   - Navigate to http://localhost:3000 for the app \
   - Follow each test case step-by-step \
   - Take screenshots when tests fail for debugging \
   - Record actual vs expected behavior \

3. **Fix Issues**: \
   - When a test fails, identify the root cause in the codebase \
   - Make targeted fixes to resolve the UI issue \
   - Re-run the specific test to verify the fix \
   - Keep fixes minimal and focused \

4. **Verify** (Run ALL before committing): \
   - TypeScript: \`pnpm run typecheck\` (must pass) \
   - Tests: \`pnpm run test\` (must pass) \
   - Check: \`pnpm run check\` (must pass) \
   - Build: \`pnpm run build\` (must pass) \
   - E2E: \`pnpm run test:e2e\` (must pass) \
   *Do NOT commit if any check fails. Fix issues first.* \

5. **Document**: Append to \`progress.txt\`: \
   - Test suite executed \
   - Tests passed/failed \
   - Issues found and fixes applied \
   - Files changed \
   *Keep entries concise.* \

6. **Commit**: If fixes were made, create a git commit. \

# TESTING TIPS \
- For auth flows, you may need to mock or skip OAuth (test what you can) \
- For RSVP tests, create test data first if needed \
- Use browser_snapshot for accessibility tree, browser_take_screenshot for visual debugging \
- If a test requires specific data state, set it up first \

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
