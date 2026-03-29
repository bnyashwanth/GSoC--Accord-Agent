import { runAccordWorkflow } from "../src/orchestrator/workflow";

function assert(condition: unknown, message: string): void {
	if (!condition) {
		throw new Error(message);
	}
}

export async function runLatePaymentTest(): Promise<void> {
	const result = await runAccordWorkflow(
		"A late payment agreement between Client and Vendor for 12 months",
		{ clarification: "12 months" },
	);

	assert(result.state.error === null, "Expected no workflow error for late payment");
	assert(Boolean(result.artifacts?.logicContent.includes("rule1_penalty")), "Expected penalty logic stub");
	assert(Boolean(result.artifacts?.ctoContent.includes("penaltyRate")), "Expected penaltyRate in CTO");
}
