import { BaseAgent, StructuredIntent } from "./BaseAgent";

export interface LogicGenerationInput {
	intent: StructuredIntent;
	validatedCto: string;
}

export class LogicDrafterAgent extends BaseAgent<LogicGenerationInput, string> {
	constructor() {
		super("LogicDrafterAgent");
	}

	async generate(input: LogicGenerationInput): Promise<string> {
		const functions = input.intent.businessRules.map((rule, index) => {
			const functionName = `rule${index + 1}_${rule.ruleType}`;
			return [
				`export function ${functionName}(contract: Record<string, unknown>): number | boolean | string {`,
				`  // ${rule.description}`,
				`  const trigger = contract["${rule.triggerField}"];`,
				"  if (typeof trigger === \"number\" && trigger <= 0) {",
				"    return 0;",
				"  }",
				"  return 0;",
				"}",
			].join("\n");
		});

		const logic = [
			"/* Auto-generated logic stubs. Fill in business-specific computation. */",
			"",
			...(functions.length > 0 ? functions : ["export function execute(): void {}"]),
			"",
		].join("\n");

		return this.guardOutput(logic, "LogicGeneration");
	}
}
