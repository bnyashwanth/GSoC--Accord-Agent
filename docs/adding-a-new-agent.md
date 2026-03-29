# adding a new agent

To add a new agent stage:

1. Create a file in src/agents and extend BaseAgent<Input, Output>.
2. Define a strict input and output contract.
3. Implement generate(input, context?) with deterministic fallback behavior.
4. Register the agent call in src/orchestrator/workflow.ts.
5. If the stage requires validation, add a ValidatorAgent method and retry route.
6. Add/update tests in tests/*.test.ts for the new stage behavior.

Suggested conventions:

- Keep agent classes framework-agnostic.
- Keep orchestration-specific branching in workflow.ts.
- Pass only the minimum context needed between stages.

