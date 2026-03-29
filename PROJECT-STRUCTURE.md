# Project Structure

```text
accord-agent/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── PROJECT-STRUCTURE.md
├── tsconfig.json
├── docs/
│   ├── architecture.md
│   └── adding-a-new-agent.md
├── examples/
│   ├── nda/
│   │   └── input.txt
│   ├── late-payment/
│   │   └── input.txt
│   └── service-agreement/
│       └── input.txt
├── src/
│   ├── index.ts
│   ├── adapters/
│   │   ├── anthropic.ts
│   │   ├── local.ts
│   │   └── openai.ts
│   ├── agents/
│   │   ├── BaseAgent.ts
│   │   ├── ConcertModelerAgent.ts
│   │   ├── LegalAnalystAgent.ts
│   │   ├── LogicDrafterAgent.ts
│   │   ├── TemplateGeneratorAgent.ts
│   │   └── ValidatorAgent.ts
│   ├── cli/
│   │   └── index.ts
│   ├── mcp/
│   │   └── accord-mcp-server.ts
│   └── orchestrator/
│       └── workflow.ts
└── tests/
    ├── run-tests.ts
    ├── nda.test.ts
    ├── late-payment.test.ts
    └── service-agreement.test.ts
```

## Notes

- `src/agents` contains framework-agnostic agent implementations.
- `src/orchestrator/workflow.ts` defines pipeline flow, retries, and output writing.
- `src/mcp/accord-mcp-server.ts` exposes validation tools in an MCP-style interface.
- `tests/run-tests.ts` is the lightweight starter test runner.
