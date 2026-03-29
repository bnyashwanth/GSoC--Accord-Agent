import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { ArtifactBundle, StructuredIntent } from "../agents/BaseAgent";
import { ConcertModelerAgent } from "../agents/ConcertModelerAgent";
import { LegalAnalystAgent } from "../agents/LegalAnalystAgent";
import { LogicDrafterAgent } from "../agents/LogicDrafterAgent";
import { TemplateGeneratorAgent } from "../agents/TemplateGeneratorAgent";
import { ValidatorAgent } from "../agents/ValidatorAgent";

export interface WorkflowState {
	rawInput: string;
	structuredIntent: StructuredIntent | null;
	ctoContent: string | null;
	ctoValidated: boolean;
	ctoRetryCount: number;
	ctoError: string | null;
	templateContent: string | null;
	templateValidated: boolean;
	templateRetryCount: number;
	templateError: string | null;
	logicContent: string | null;
	error: string | null;
}

export interface WorkflowOptions {
	maxRetries?: number;
	outputDir?: string;
	clarification?: string;
}

export interface WorkflowResult {
	state: WorkflowState;
	artifacts: ArtifactBundle | null;
	outputPaths: {
		ctoPath?: string;
		templatePath?: string;
		logicPath?: string;
		intentPath?: string;
	};
}

function createInitialState(input: string): WorkflowState {
	return {
		rawInput: input,
		structuredIntent: null,
		ctoContent: null,
		ctoValidated: false,
		ctoRetryCount: 0,
		ctoError: null,
		templateContent: null,
		templateValidated: false,
		templateRetryCount: 0,
		templateError: null,
		logicContent: null,
		error: null,
	};
}

function toSafeName(contractType: string): string {
	return contractType.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export class AccordWorkflow {
	private readonly analyst = new LegalAnalystAgent();
	private readonly modeler = new ConcertModelerAgent();
	private readonly templateGenerator = new TemplateGeneratorAgent();
	private readonly logicDrafter = new LogicDrafterAgent();
	private readonly validator = new ValidatorAgent();

	async run(userInput: string, options: WorkflowOptions = {}): Promise<WorkflowResult> {
		const maxRetries = options.maxRetries ?? 3;
		const state = createInitialState(userInput);

		state.structuredIntent = await this.analyst.generate(userInput);
		if (state.structuredIntent.ambiguities.length > 0 && !options.clarification) {
			state.error = `Clarification required: ${state.structuredIntent.ambiguities.join(" ")}`;
			return { state, artifacts: null, outputPaths: {} };
		}

		for (; state.ctoRetryCount < maxRetries; state.ctoRetryCount += 1) {
			state.ctoContent = await this.modeler.generate(state.structuredIntent);
			const ctoValidation = await this.validator.validateConcerto(state.ctoContent);
			state.ctoValidated = ctoValidation.valid;
			state.ctoError = ctoValidation.error;
			if (ctoValidation.valid) {
				break;
			}
		}

		if (!state.ctoValidated || !state.ctoContent) {
			state.error = `CTO validation failed after ${maxRetries} retries. ${state.ctoError ?? ""}`.trim();
			return { state, artifacts: null, outputPaths: {} };
		}

		for (; state.templateRetryCount < maxRetries; state.templateRetryCount += 1) {
			const retryDoc = state.templateError
				? this.validator.classifyError(state.templateError).doc
				: undefined;
			state.templateContent = await this.templateGenerator.generate({
				intent: state.structuredIntent,
				validatedCto: state.ctoContent,
				errorMessage: state.templateError ?? undefined,
				errorDoc: retryDoc,
			});

			const templateValidation = await this.validator.validateTemplate(
				state.ctoContent,
				state.templateContent,
			);
			state.templateValidated = templateValidation.valid;
			state.templateError = templateValidation.error;
			if (templateValidation.valid) {
				break;
			}
		}

		if (!state.templateValidated || !state.templateContent) {
			state.error =
				`Template validation failed after ${maxRetries} retries. ${state.templateError ?? ""}`.trim();
			return { state, artifacts: null, outputPaths: {} };
		}

		state.logicContent = await this.logicDrafter.generate({
			intent: state.structuredIntent,
			validatedCto: state.ctoContent,
		});

		const safeName = toSafeName(state.structuredIntent.contractType);
		const logicFileName = `${safeName}.ts`;
		const artifacts: ArtifactBundle = {
			ctoContent: state.ctoContent,
			templateContent: state.templateContent,
			logicContent: state.logicContent,
			logicFileName,
		};

		const outputPaths: WorkflowResult["outputPaths"] = {};
		if (options.outputDir) {
			await mkdir(options.outputDir, { recursive: true });
			outputPaths.ctoPath = join(options.outputDir, `${safeName}.cto`);
			outputPaths.templatePath = join(options.outputDir, "template.md");
			outputPaths.logicPath = join(options.outputDir, logicFileName);
			outputPaths.intentPath = join(options.outputDir, "intent.json");

			await Promise.all([
				writeFile(outputPaths.ctoPath, artifacts.ctoContent, "utf8"),
				writeFile(outputPaths.templatePath, artifacts.templateContent, "utf8"),
				writeFile(outputPaths.logicPath, artifacts.logicContent, "utf8"),
				writeFile(outputPaths.intentPath, JSON.stringify(state.structuredIntent, null, 2), "utf8"),
			]);
		}

		return { state, artifacts, outputPaths };
	}
}

export async function runAccordWorkflow(
	userInput: string,
	options: WorkflowOptions = {},
): Promise<WorkflowResult> {
	const workflow = new AccordWorkflow();
	return workflow.run(userInput, options);
}
