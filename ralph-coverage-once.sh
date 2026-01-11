#!/bin/bash

# Configuration
TARGET_COVERAGE=${1:-80}
COVERAGE_SUMMARY="coverage/coverage-summary.json"
REPORT_FILE="coverage_report.txt"

echo "🎯 Target Coverage: ${TARGET_COVERAGE}%"

# 1. Ensure coverage tool is installed
if ! npm list @vitest/coverage-v8 > /dev/null 2>&1; then
    echo "📦 Installing @vitest/coverage-v8..."
    npm install -D @vitest/coverage-v8
fi

echo ""
echo "🧪 Running tests with coverage..."

# Run tests, output to console AND file, use json-summary for parsing and text for the agent
npm run test -- --coverage --reporter=json-summary --reporter=text > "$REPORT_FILE" 2>&1
TEST_EXIT=$?

# Check if coverage summary exists
if [ ! -f "$COVERAGE_SUMMARY" ]; then
    echo "❌ Coverage summary not found. Tests might have failed catastrophically."
    cat "$REPORT_FILE"
    exit 1
fi

# Parse current coverage (Lines pct)
CURRENT_COVERAGE=$(node -e "try { const s = require('./$COVERAGE_SUMMARY'); console.log(s.total.lines.pct); } catch { console.log('0'); }")
echo "📊 Current Line Coverage: ${CURRENT_COVERAGE}%"

# Check condition
if (( $(echo "$CURRENT_COVERAGE >= $TARGET_COVERAGE" | bc -l 2>/dev/null || node -e "console.log($CURRENT_COVERAGE >= $TARGET_COVERAGE ? 1 : 0)") )); then
    echo "✅ Target coverage reached!"
    rm "$REPORT_FILE"
    exit 0
fi

echo "📉 Target not met. Asking Ralph to write tests..."

# Prepare prompt for Ralph
REPORT_CONTENT=$(cat "$REPORT_FILE")

prompt="My goal is to reach ${TARGET_COVERAGE}% test coverage. Current coverage is ${CURRENT_COVERAGE}%.

Here is the output from the latest test run, including the coverage report with uncovered lines:

<test_output>
${REPORT_CONTENT}
</test_output>

Please:
1. Analyze the 'Uncovered Line #s' in the report.
2. Write meaningful unit tests to cover these lines. 
3. You can modify existing test files or create new ones (e.g., adjacent to source files or in tests/).
4. Ensure the new tests pass and do not break existing functionality.

Do not write tests for trivial config files if they are hard to test, focus on logic files."

# Call Ralph
claude --permission-mode acceptEdits "$prompt"
