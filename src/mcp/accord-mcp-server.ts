import { ValidatorAgent } from "../agents/ValidatorAgent";

export interface ToolDefinition {
	name: "validate_concerto" | "validate_templatemark";
	description: string;
}

export interface AccordMcpToolResult {
	valid: boolean;
	error: string | null;
}

export class AccordMcpServer {
	private readonly validator: ValidatorAgent;

	constructor(validator?: ValidatorAgent) {
		this.validator = validator ?? new ValidatorAgent();
	}

	listTools(): ToolDefinition[] {
		return [
			{
				name: "validate_concerto",
				description: "Validate Concerto model text.",
			},
			{
				name: "validate_templatemark",
				description: "Validate template bindings against Concerto fields.",
			},
		];
	}

	async callTool(
		name: ToolDefinition["name"],
		args: { ctoContent: string; templateContent?: string },
	): Promise<AccordMcpToolResult> {
		if (name === "validate_concerto") {
			return this.validator.validateConcerto(args.ctoContent);
		}
		return this.validator.validateTemplate(args.ctoContent, args.templateContent ?? "");
	}
}
