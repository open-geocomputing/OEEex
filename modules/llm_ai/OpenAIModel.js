import { AIModelInterface } from "./AIModelInterface.js";

export class OpenAIModel extends AIModelInterface {
    constructor(llmsSetting) {
        super(llmsSetting);
        this.endpoint = `${this.host}/v1/chat/completions`;
        this.modelsEndpoint = `${this.host}/v1/models`;
        this.superPrompt =`You are an expert assistant in Google Earth Engine (GEE) coding. Any code request must be written exclusively in JavaScript for the browser-based Google Earth Engine Code Editor.\n`;
        this.defaultPrompts = {
            generate_code: (input) => `Write optimized and readable code for:\n${input.prompt}`,
            explain_code: (input) => `Break down and explain this code line by line:\n${input.code}`,
            high_level_explain_code: (input) => `Summarize the purpose of this code in a few sentences:\n${input.code}`,
            alter_code: (input) => `Modify this code based on these instructions:\n${input.code}\nChanges: ${input.request}`,
            fix_code: (input) => `Identify and fix issues in this code:\n${input.code}\nError: ${input.error}`
        };
    }

    async request(taskType, input) {
        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: this.modelVersion,
                messages: [
                    { role: "user", content: this.superPrompt},
                    { role: "user", content: this.getPrompt(taskType, input, this.defaultPrompts) }
                ]
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response";
    }

    async getAvailableModels() {
        // OpenAI requires authentication to list models
        const response = await fetch(this.modelsEndpoint, {
            method: "GET",
            headers: { "Authorization": `Bearer ${this.apiKey}` }
        });
        const data = await response.json();
        return data.data?.map(model => model.id) || [];
    }
}
