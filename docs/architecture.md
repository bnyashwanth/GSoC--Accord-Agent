# accord-agent architecture

This repository uses a staged generation pipeline:

1. LegalAnalystAgent parses natural language into StructuredIntent.
2. ConcertModelerAgent generates a Concerto model (.cto).
3. ValidatorAgent validates CTO syntax and core constraints.
4. TemplateGeneratorAgent builds template.md with explicit bindings.
5. ValidatorAgent checks template bindings against model fields.
6. LogicDrafterAgent generates TypeScript logic stubs.

Retry loop behavior:

- CTO generation retries up to maxRetries when validation fails.
- Template generation retries up to maxRetries with error-aware guidance.
- On repeated failure, workflow exits with terminal error state.

MCP integration:

- src/mcp/accord-mcp-server.ts exposes validate_concerto and validate_templatemark.
- The server wrapper uses ValidatorAgent as the validation backend.

