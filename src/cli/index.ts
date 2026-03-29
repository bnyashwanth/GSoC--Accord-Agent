#!/usr/bin/env node

import { runAccordWorkflow } from "../orchestrator/workflow";

interface CliArgs {
	description: string;
	outputDir?: string;
	clarification?: string;
	asJson: boolean;
}

function parseArgs(argv: string[]): CliArgs {
	const flags = new Map<string, string | boolean>();
	const positional: string[] = [];

	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (token === "--json") {
			flags.set("json", true);
			continue;
		}
		if (token === "--output-dir") {
			flags.set("output-dir", argv[i + 1] ?? "");
			i += 1;
			continue;
		}
		if (token === "--clarification") {
			flags.set("clarification", argv[i + 1] ?? "");
			i += 1;
			continue;
		}
		positional.push(token);
	}

	return {
		description: positional.join(" ").trim(),
		outputDir: typeof flags.get("output-dir") === "string" ? String(flags.get("output-dir")) : undefined,
		clarification:
			typeof flags.get("clarification") === "string" ? String(flags.get("clarification")) : undefined,
		asJson: flags.get("json") === true,
	};
}

async function main(): Promise<void> {
	const args = parseArgs(process.argv.slice(2));
	if (!args.description) {
		console.error("Usage: accord-agent <description> [--output-dir <path>] [--clarification <text>] [--json]");
		process.exit(1);
	}

	const result = await runAccordWorkflow(args.description, {
		outputDir: args.outputDir,
		clarification: args.clarification,
	});

	if (args.asJson) {
		console.log(JSON.stringify(result, null, 2));
		return;
	}

	if (result.state.error) {
		console.error(`Pipeline failed: ${result.state.error}`);
		process.exit(2);
	}

	console.log("Pipeline completed.");
	if (result.outputPaths.ctoPath) {
		console.log(`CTO: ${result.outputPaths.ctoPath}`);
		console.log(`Template: ${result.outputPaths.templatePath}`);
		console.log(`Logic: ${result.outputPaths.logicPath}`);
		console.log(`Intent: ${result.outputPaths.intentPath}`);
	}
}

void main();
