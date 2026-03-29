import { BaseAgent, StructuredIntent } from "./BaseAgent";

function toConceptName(contractType: string): string {
	return contractType
		.replace(/[^a-zA-Z0-9 ]/g, " ")
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
		.join("");
}

export class ConcertModelerAgent extends BaseAgent<StructuredIntent, string> {
	constructor() {
		super("ConcertModelerAgent");
	}

	async generate(intent: StructuredIntent): Promise<string> {
		const conceptName = toConceptName(intent.contractType);
		const fieldLines = intent.variables
			.map((variable) => {
				const optionalKeyword = variable.required ? "" : "optional ";
				return `  o ${optionalKeyword}${variable.concertoType} ${variable.boundToField}`;
			})
			.join("\n");

		const cto = [
			"namespace org.accordproject.generated",
			"",
			`concept ${conceptName} {`,
			fieldLines,
			"}",
			"",
		].join("\n");

		return this.guardOutput(cto, "ConcertoModelGeneration");
	}
}
