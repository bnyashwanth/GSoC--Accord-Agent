# Accord Agent - GSoC 2026 Proposal Starter

Idea 1: Agentic Workflows for Drafting Templates - Accord Project

A working TypeScript skeleton demonstrating the core architecture proposed for Google Summer of Code 2026.
This is not pseudocode - it is a runnable pipeline ready for community review.

## What This Demonstrates

This starter proves four core points from the proposal:

| Proposal Point | Where It Lives |
| --- | --- |
| Agentic orchestration - analyst, modeler, template generator, logic drafter, validator | `src/agents/`, `src/orchestrator/` |
| Natural language input - user describes contract in plain English | `src/cli/index.ts` |
| MCP-friendly validation - `validate_concerto` and `validate_templatemark` tools | `src/mcp/accord-mcp-server.ts` |
| Flexible model adapter layer - OpenAI, Anthropic, local endpoint | `src/adapters/` |

## Project Layout

```text
accord-agent/
|-- src/
|   |-- agents/
|   |   |-- BaseAgent.ts               # Framework-agnostic base class + shared types
|   |   |-- LegalAnalystAgent.ts       # Extracts structured intent from plain English
|   |   |-- ConcertModelerAgent.ts     # Generates .cto data model
|   |   |-- TemplateGeneratorAgent.ts  # Produces TemplateMark .md
|   |   |-- LogicDrafterAgent.ts       # Drafts contract logic stubs (.ts)
|   |   `-- ValidatorAgent.ts          # Calls MCP tools, feeds errors back
|   |-- orchestrator/
|   |   `-- workflow.ts                # Staged pipeline with retries + terminal failure states
|   |-- mcp/
|   |   `-- accord-mcp-server.ts       # MCP-style tool facade (validate_concerto, validate_templatemark)
|   |-- adapters/
|   |   |-- openai.ts                  # OpenAI adapter
|   |   |-- anthropic.ts               # Anthropic adapter
|   |   `-- local.ts                   # Local / Ollama adapter
|   `-- cli/
|       `-- index.ts                   # CLI entrypoint
|-- tests/                             # Scenario-based starter checks
|-- examples/                          # Plain-English prompt examples
|-- output/                            # Generated artifacts land here
|-- .env.example                       # API key config template
|-- tsconfig.json
`-- package.json
```

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure your model provider

```bash
cp .env.example .env
# Add your API key: OPENAI_API_KEY, ANTHROPIC_API_KEY, or LOCAL_BASE_URL
```

3. Run the starter flow

```bash
npm run dev -- "An NDA between Acme Corp and John Doe for 24 months" --output-dir output
```

4. Run starter tests

```bash
npm test
```

5. Build for production

```bash
npm run build
npm run start -- "A service agreement between Alpha Labs and Beta Ops for 18 months" --output-dir output
```

## CLI Usage

```bash
npm run dev -- "<plain English contract description>" [--output-dir <path>] [--clarification <hint>] [--json]
```

| Flag | Default | Description |
| --- | --- | --- |
| `--output-dir` | `./output` | Directory to write generated artifacts |
| `--clarification` | none | Optional hint to resolve ambiguous input |
| `--json` | `false` | Emit structured JSON output instead of file writes |

### Example Runs

```bash
# NDA
npm run dev -- "An NDA between Acme Corp and John Doe for 24 months"

# Late payment clause
npm run dev -- "A late payment clause with 1.5% monthly interest after 30 days"

# Service agreement
npm run dev -- "A fixed fee service agreement between Alpha Labs and Beta Ops for 18 months" --output-dir output
```

## Agent Pipeline

```text
[Plain English Input]
	  |
	  v
  LegalAnalystAgent          -> StructuredIntent (JSON)
	  |
	  v
  ConcertModelerAgent        -> model.cto draft
	  |
	  v
  ValidatorAgent ----------> validate_concerto(ctoContent)
    +--+--------------------  pass -> continue
    | fail -> error trace     fail -> retry (max 3x)
    +--> ConcertModelerAgent (re-runs with error context)
	  |
	  v
  TemplateGeneratorAgent     -> template.md
  LogicDrafterAgent          -> logic.ts
	  |
	  v
  ValidatorAgent ----------> validate_templatemark(cto, template)
    +--+--------------------  pass -> write to /output
    | fail -> error trace     fail -> retry (max 3x)
    +--> TemplateGeneratorAgent (re-runs with error context)
	  |
	  v
  output/
  |-- model.cto
  |-- template.md
  |-- logic.ts
  `-- intent.json
```

## Why This Architecture

Clean separation of concerns: agents, orchestrator, and MCP tool boundary are decoupled. Adding a new agent persona requires implementing one class and registering it in the workflow.

Retry-aware validation: model and template stages have independent retry loops. Error traces from the MCP server feed directly back into the responsible agent as correction context.

Orchestrator-agnostic: `BaseAgent` is a plain abstract class with no framework lock-in. Swapping to LangGraph or CrewAI primarily affects orchestration adapters, not agent contracts.

Model-agnostic: `ChatAdapter` in `BaseAgent.ts` abstracts all provider calls. Provider changes can be handled via environment configuration.

## Test Coverage

```bash
npm test
```

Starter tests cover three contract types end-to-end:

| Scenario | Contract Type | Expected Output |
| --- | --- | --- |
| `nda.test.ts` | NDA | valid `model.cto` + `template.md` |
| `late-payment.test.ts` | Late Payment Clause | valid `.cto` with penalty logic stub |
| `service-agreement.test.ts` | Service Agreement | full artifact bundle |

## Next Upgrade Ideas

Planned for the GSoC coding period (not in scope for this starter):

- Swap stub validators for real `@accordproject/concerto-core` compiler calls.
- Add strict Zod schema validation before each stage transition.
- Add interactive clarification mode in CLI.
- Add provider selection through env and runtime flags (for example `--provider anthropic`).
- Add GitHub Actions for typecheck, tests, and build.
- Integrate a UI trigger into Template Playground.

## Related

- GSoC 2026 Proposal - Agentic Workflows for Drafting Templates
- Accord Project
- template-playground - where my merged PRs live (#725, #826, #840)
- Model Context Protocol

## Author

B N Yashwanth - GSoC 2026 Applicant, Accord Project

- https://github.com/bnyashwanth
- https://bnyashwanth.dev
- https://linkedin.com/in/bn-yashwanth
