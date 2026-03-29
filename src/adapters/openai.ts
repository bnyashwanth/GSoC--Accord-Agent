import { ChatAdapter, ChatMessage } from "../agents/BaseAgent";

export class OpenAiAdapter implements ChatAdapter {
	readonly provider = "openai" as const;

	constructor(
		public readonly model: string,
		private readonly apiKey: string,
		private readonly baseUrl = "https://api.openai.com/v1",
	) {}

	async complete(messages: ChatMessage[]): Promise<string> {
		const response = await fetch(`${this.baseUrl}/chat/completions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ model: this.model, messages }),
		});

		if (!response.ok) {
			throw new Error(`OpenAI request failed with status ${response.status}`);
		}

		const json = (await response.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};

		return json.choices?.[0]?.message?.content?.trim() ?? "";
	}
}
