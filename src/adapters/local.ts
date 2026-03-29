import { ChatAdapter, ChatMessage } from "../agents/BaseAgent";

export class LocalAdapter implements ChatAdapter {
	readonly provider = "local" as const;

	constructor(
		public readonly model: string,
		private readonly baseUrl = "http://localhost:11434/v1/chat/completions",
	) {}

	async complete(messages: ChatMessage[]): Promise<string> {
		const response = await fetch(this.baseUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ model: this.model, messages }),
		});

		if (!response.ok) {
			throw new Error(`Local model request failed with status ${response.status}`);
		}

		const json = (await response.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};

		return json.choices?.[0]?.message?.content?.trim() ?? "";
	}
}
