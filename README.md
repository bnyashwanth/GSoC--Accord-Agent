# Accord Agent Starter (GSoC Proposal - Idea 1)

Starter TypeScript codebase for an agentic Accord Project template drafting workflow.

This starter demonstrates four core proposal points:

1. Agentic orchestration: analyst, modeler, template generator, logic drafter, validator.
2. Natural language input: user describes contract in plain English.
3. MCP-friendly validation tools: validate_concerto and validate_templatemark.
4. Flexible model adapter layer: OpenAI, Anthropic, local endpoint adapters.

## Project Layout

- src/agents: framework-agnostic agent classes and shared schemas.
- src/orchestrator/workflow.ts: staged pipeline with retries and terminal failure states.
- src/mcp/accord-mcp-server.ts: MCP-style tool facade.
- src/adapters: provider adapters for model calls.
- src/cli/index.ts: command-line entrypoint.
- tests: scenario-based starter checks.
- examples: plain-English prompt examples.

## Quick Start

1. Install dependencies:

npm install

2. Run the starter flow:

npm run dev -- "An NDA between Acme Corp and John Doe for 24 months" --output-dir output

3. Run starter tests:

npm test

4. Build for production:

npm run build
npm run start -- "A service agreement between Alpha Labs and Beta Ops for 18 months" --output-dir output

## CLI Usage

npm run dev -- "<contract description>" [--output-dir <path>] [--clarification <text>] [--json]

## Why this is a strong proposal starter

- Clean separation of concerns between agents, orchestrator, and MCP tool boundary.
- Retry-aware validation path for model and template stages.
- Architecture is extensible for LangGraph, CrewAI, or custom orchestration.
- Minimal but concrete tests to prove pipeline behavior across three contract types.

## Next Upgrade Ideas

- Swap stub validators for real Accord CLI calls.
- Add strict schema validation with zod before each stage transition.
- Add interactive clarification mode in CLI.
- Add provider selection through env and runtime flags.
- Add GitHub Actions for typecheck, tests, and build.
