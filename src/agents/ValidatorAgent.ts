import { BaseAgent, ValidationResult } from "./BaseAgent";

export interface ValidationInput {
	ctoContent: string;
	templateContent?: string;
}

export type ErrorCategory =
	| "unknown_type"
	| "missing_import"
	| "syntax_error"
	| "missing_field"
	| "type_mismatch"
	| "unresolved_variable"
	| "unknown";

const RETRY_DOCS: Record<ErrorCategory, string> = {
	unknown_type: "Use Concerto primitives only: String, Double, Integer, Long, Boolean, DateTime.",
	missing_import: "If a type is referenced from another namespace, add an import statement.",
	syntax_error: "Check braces, concept blocks, and property declarations for syntax mistakes.",
	missing_field: "Ensure all template placeholders map to declared model fields.",
	type_mismatch: "Match field types and avoid assigning incompatible values.",
	unresolved_variable: "Every {{contract.field}} must exist as a field in the generated concept.",
	unknown: "Regenerate using stricter field names and simple model syntax.",
};

export class ValidatorAgent extends BaseAgent<ValidationInput, ValidationResult> {
	constructor() {
		super("ValidatorAgent");
	}

	async generate(input: ValidationInput): Promise<ValidationResult> {
		if (input.templateContent) {
			return this.validateTemplate(input.ctoContent, input.templateContent);
		}
		return this.validateConcerto(input.ctoContent);
	}

	async validateConcerto(ctoContent: string): Promise<ValidationResult> {
		if (!ctoContent.includes("namespace ")) {
			return { valid: false, error: "Missing namespace declaration" };
		}
		if (!/concept\s+[A-Za-z][A-Za-z0-9]*/.test(ctoContent)) {
			return { valid: false, error: "Missing concept declaration" };
		}
		if (/\bfloat\b|\bnumber\b/.test(ctoContent)) {
			return { valid: false, error: "Unknown type. Use Concerto primitive types." };
		}
		return { valid: true, error: null };
	}

	async validateTemplate(ctoContent: string, templateContent: string): Promise<ValidationResult> {
		const fieldMatches = ctoContent.matchAll(/\bo\s+(?:optional\s+)?\w+\s+([a-zA-Z][a-zA-Z0-9]*)/g);
		const declaredFields = new Set(Array.from(fieldMatches, (match) => match[1]));

		const templateMatches = templateContent.matchAll(/\{\{contract\.([a-zA-Z][a-zA-Z0-9]*)\}\}/g);
		const usedFields = new Set(Array.from(templateMatches, (match) => match[1]));

		const unknown = Array.from(usedFields).filter((field) => !declaredFields.has(field));
		if (unknown.length > 0) {
			return {
				valid: false,
				error: `Template references undeclared field(s): ${unknown.join(", ")}`,
			};
		}

		return { valid: true, error: null };
	}

	classifyError(errorMessage: string): { category: ErrorCategory; doc: string } {
		const message = errorMessage.toLowerCase();
		if (/unknown type|cannot find type|not defined/.test(message)) {
			return { category: "unknown_type", doc: RETRY_DOCS.unknown_type };
		}
		if (/missing import|import.*not found/.test(message)) {
			return { category: "missing_import", doc: RETRY_DOCS.missing_import };
		}
		if (/syntax error|unexpected token|parse error/.test(message)) {
			return { category: "syntax_error", doc: RETRY_DOCS.syntax_error };
		}
		if (/field.*not declared|field.*not found/.test(message)) {
			return { category: "missing_field", doc: RETRY_DOCS.missing_field };
		}
		if (/type mismatch|incompatible/.test(message)) {
			return { category: "type_mismatch", doc: RETRY_DOCS.type_mismatch };
		}
		if (/unresolved variable|binding.*not found/.test(message)) {
			return { category: "unresolved_variable", doc: RETRY_DOCS.unresolved_variable };
		}
		return { category: "unknown", doc: RETRY_DOCS.unknown };
	}
}
