import {
	BaseAgent,
	LogicCondition,
	Party,
	StructuredIntent,
	TemplateVariable,
} from "./BaseAgent";

function toConceptName(contractType: string): string {
	return contractType
		.replace(/[^a-zA-Z0-9 ]/g, " ")
		.split(/\s+/)
		.filter(Boolean)
		.map((token) => token[0].toUpperCase() + token.slice(1).toLowerCase())
		.join("");
}

function defaultVariables(contractType: string, concept: string): TemplateVariable[] {
	const lc = contractType.toLowerCase();
	if (lc.includes("nda") || lc.includes("non-disclosure")) {
		return [
			{
				name: "disclosingParty",
				concertoType: "String",
				description: "Name of the party disclosing confidential information",
				required: true,
				optional: false,
				boundToConcept: concept,
				boundToField: "disclosingParty",
			},
			{
				name: "receivingParty",
				concertoType: "String",
				description: "Name of the receiving party",
				required: true,
				optional: false,
				boundToConcept: concept,
				boundToField: "receivingParty",
			},
			{
				name: "termMonths",
				concertoType: "Integer",
				description: "Confidentiality term in months",
				required: true,
				optional: false,
				boundToConcept: concept,
				boundToField: "termMonths",
			},
		];
	}

	if (lc.includes("late payment")) {
		return [
			{
				name: "invoiceAmount",
				concertoType: "Double",
				description: "Invoice principal amount",
				required: true,
				optional: false,
				boundToConcept: concept,
				boundToField: "invoiceAmount",
			},
			{
				name: "daysLate",
				concertoType: "Integer",
				description: "Number of days payment is late",
				required: true,
				optional: false,
				boundToConcept: concept,
				boundToField: "daysLate",
			},
			{
				name: "penaltyRate",
				concertoType: "Double",
				description: "Penalty rate applied to late invoices",
				required: true,
				optional: false,
				boundToConcept: concept,
				boundToField: "penaltyRate",
			},
		];
	}

	return [
		{
			name: "effectiveDate",
			concertoType: "DateTime",
			description: "Contract effective date",
			required: true,
			optional: false,
			boundToConcept: concept,
			boundToField: "effectiveDate",
		},
		{
			name: "termMonths",
			concertoType: "Integer",
			description: "Contract term in months",
			required: true,
			optional: false,
			boundToConcept: concept,
			boundToField: "termMonths",
		},
	];
}

function defaultRules(contractType: string): LogicCondition[] {
	if (contractType.toLowerCase().includes("late payment")) {
		return [
			{
				description: "Compute penalty amount from invoiceAmount and penaltyRate when daysLate is positive",
				triggerField: "daysLate",
				outputField: "penaltyAmount",
				ruleType: "penalty",
			},
		];
	}
	return [];
}

export class LegalAnalystAgent extends BaseAgent<string, StructuredIntent> {
	constructor() {
		super("LegalAnalystAgent");
	}

	async generate(input: string): Promise<StructuredIntent> {
		const normalized = input.trim();
		const lower = normalized.toLowerCase();

		const contractType = lower.includes("nda")
			? "Non-Disclosure Agreement"
			: lower.includes("late payment")
				? "Late Payment Agreement"
				: lower.includes("service")
					? "Service Agreement"
					: "General Agreement";

		const betweenMatch = normalized.match(
			/between\s+(.+?)\s+and\s+(.+?)(?=\s+(?:for|with|where|under)\b|\.|,|$)/i,
		);
		const parties: Party[] = betweenMatch
			? [
					{ name: betweenMatch[1].trim(), role: "first_party" },
					{ name: betweenMatch[2].trim(), role: "second_party" },
				]
			: [
					{ name: "PartyA", role: "first_party" },
					{ name: "PartyB", role: "second_party" },
				];

		const concept = toConceptName(contractType);
		const ambiguities: string[] = [];
		if (!/\d+\s*(month|year|day)/i.test(normalized)) {
			ambiguities.push("What is the contract duration?");
		}
		if (parties[0].name === "PartyA") {
			ambiguities.push("Please provide concrete party names.");
		}

		return {
			rawInput: normalized,
			contractType,
			parties,
			variables: defaultVariables(contractType, concept),
			businessRules: defaultRules(contractType),
			ambiguities,
		};
	}
}
