# Improve Test Coverage

I need to increase the test coverage for this project. My target is **80%**.

Please follow this workflow:

1.  **Run Coverage**: Run `npm run test -- --coverage` to see the current state.
2.  **Analyze**: Identify source files (ignoring configs/types) with low coverage and specific uncovered lines.
3.  **Implement Tests**: Write unit tests to cover those specific lines.
    *   Prioritize `src/` logic, utilities, and components.
    *   Keep tests isolated and meaningful.
4.  **Verify**: Run tests again to confirm coverage increased and nothing broke.

Start by running the coverage and listing the top 3 files that need better coverage.
