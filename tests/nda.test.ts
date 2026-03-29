import { runAccordWorkflow } from "../src/orchestrator/workflow";

function assert(condition: unknown, message: string): void {
	if (!condition) {
		throw new Error(message);
	}
}

export async function runNdaTest(): Promise<void> {
	const result = await runAccordWorkflow(
		"An NDA between Acme Corp and John Doe for 24 months",
		{ clarification: "24 months" },
	);

	assert(result.state.error === null, "Expected no workflow error for NDA");
	assert(
		Boolean(result.artifacts?.ctoContent.includes("namespace org.accordproject.generated")),
		"Expected generated CTO namespace",
	);
	assert(
		Boolean(result.artifacts?.templateContent.includes("{{contract.disclosingParty}}")),
		"Expected disclosingParty template binding",
	);
}
