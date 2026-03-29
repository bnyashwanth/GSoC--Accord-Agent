import { runAccordWorkflow } from "../src/orchestrator/workflow";

function assert(condition: unknown, message: string): void {
	if (!condition) {
		throw new Error(message);
	}
}

export async function runServiceAgreementTest(): Promise<void> {
	const result = await runAccordWorkflow(
		"A service agreement between Alpha Labs and Beta Ops for 18 months",
		{ clarification: "18 months" },
	);

	assert(result.state.error === null, "Expected no workflow error for service agreement");
	assert(Boolean(result.artifacts?.ctoContent.includes("concept ServiceAgreement")), "Expected ServiceAgreement concept");
	assert(Boolean(result.artifacts?.templateContent.includes("{{contract.termMonths}}")), "Expected termMonths template binding");
}
