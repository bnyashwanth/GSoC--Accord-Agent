import { BaseAgent, StructuredIntent } from "./BaseAgent";

export interface TemplateGenerationInput {
	intent: StructuredIntent;
	validatedCto: string;
	errorMessage?: string;
	errorDoc?: string;
}

export class TemplateGeneratorAgent extends BaseAgent<TemplateGenerationInput, string> {
	constructor() {
		super("TemplateGeneratorAgent");
	}

	async generate(input: TemplateGenerationInput): Promise<string> {
		const { intent } = input;
		const title = `# ${intent.contractType}`;

		const body = intent.variables
			.map((variable) => {
				const placeholder = `{{contract.${variable.boundToField}}}`;
				return variable.optional
					? `{{#if contract.${variable.boundToField}}}${variable.description}: ${placeholder}{{/if}}`
					: `${variable.description}: ${placeholder}`;
			})
			.join("\n\n");

		const template = `${title}\n\n${body}\n`;
		return this.guardOutput(template, "TemplateGeneration");
	}
}
