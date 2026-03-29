export type LlmProvider = "openai" | "anthropic" | "local";

export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface ChatAdapter {
	provider: LlmProvider;
	model: string;
	complete(messages: ChatMessage[]): Promise<string>;
}

export interface Party {
	name: string;
	role: string;
}

export type ConcertoType =
	| "String"
	| "Double"
	| "Integer"
	| "Long"
	| "Boolean"
	| "DateTime";

export interface TemplateVariable {
	name: string;
	concertoType: ConcertoType;
	description: string;
	required: boolean;
	optional: boolean;
	boundToConcept: string;
	boundToField: string;
}

export type RuleType =
	| "penalty"
	| "calculation"
	| "validation"
	| "interest"
	| "termination";

export interface LogicCondition {
	description: string;
	triggerField: string;
	outputField: string;
	ruleType: RuleType;
}

export interface StructuredIntent {
	rawInput: string;
	contractType: string;
	parties: Party[];
	variables: TemplateVariable[];
	businessRules: LogicCondition[];
	ambiguities: string[];
}

export interface ArtifactBundle {
	ctoContent: string;
	templateContent: string;
	logicContent: string;
	logicFileName: string;
}

export interface ValidationResult {
	valid: boolean;
	error: string | null;
}

export const MIN_OUTPUT_LENGTH = 20;

export abstract class BaseAgent<TInput, TOutput> {
	constructor(public readonly name: string, protected readonly llm?: ChatAdapter) {}

	abstract generate(input: TInput, context?: Record<string, unknown>): Promise<TOutput>;

	protected stripFences(text: string): string {
		const lines = text.trim().split(/\r?\n/);
		if (lines[0]?.startsWith("```")) {
			lines.shift();
		}
		if (lines[lines.length - 1]?.trim() === "```") {
			lines.pop();
		}
		return lines.join("\n").trim();
	}

	protected guardOutput(text: string, stage: string): string {
		if (text.trim().length < MIN_OUTPUT_LENGTH) {
			throw new Error(
				`${stage} produced unusable output (${text.length} chars). Expected at least ${MIN_OUTPUT_LENGTH}.`,
			);
		}
		return text;
	}
}
