import { ChatAdapter, ChatMessage } from "../agents/BaseAgent";

export class AnthropicAdapter implements ChatAdapter {
	readonly provider = "anthropic" as const;

	constructor(
		public readonly model: string,
		private readonly apiKey: string,
		private readonly baseUrl = "https://api.anthropic.com/v1/messages",
	) {}

	async complete(messages: ChatMessage[]): Promise<string> {
		const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n");
		const nonSystem = messages
			.filter((message) => message.role !== "system")
			.map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content }));

		const response = await fetch(this.baseUrl, {
			method: "POST",
			headers: {
				"x-api-key": this.apiKey,
				"anthropic-version": "2023-06-01",
				"content-type": "application/json",
			},
			body: JSON.stringify({
				model: this.model,
				max_tokens: 1000,
				system,
				messages: nonSystem,
			}),
		});

		if (!response.ok) {
			throw new Error(`Anthropic request failed with status ${response.status}`);
		}

		const json = (await response.json()) as {
			content?: Array<{ type?: string; text?: string }>;
		};

		const textPart = json.content?.find((part) => part.type === "text");
		return textPart?.text?.trim() ?? "";
	}
}
